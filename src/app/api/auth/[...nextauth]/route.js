import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("Connecting to DB...");
          await dbConnect();
          console.log("Connected. Searching for user...");
          
          // Find existing user
          let user = await User.findOne({ username: credentials.username });
          
          // FOR DEVELOPMENT: Automatically create the master admin if it doesn't exist.
          if (!user && credentials.username === "admin") {
            console.log("Admin user not found. Creating...");
            const hashedPassword = await bcrypt.hash("P@ssword123", 10);
            user = await User.create({
              username: "admin",
              password: hashedPassword,
              role: "superadmin"
            });
            console.log("Admin user created.");
          }

          if (user) {
            // Retroactive upgrade for existing master admin
            if (user.username === "admin" && user.role === "admin") {
              await User.updateOne({ _id: user._id }, { role: "superadmin" });
              user.role = "superadmin"; // local reflection
              console.log("Upgraded master admin to superadmin.");
            }

            console.log("User found, comparing passwords...");
            const isValid = await bcrypt.compare(credentials.password, user.password);
            console.log("Password valid:", isValid);
            if (isValid) {
              return {
                id: user._id.toString(),
                name: user.username,
                role: user.role
              };
            }
          }
          
          console.log("Authentication failed: User missing or password invalid.");
          return null;
        } catch (error) {
          console.error("Authorize Error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours absolute maximum
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Omitting maxAge to make it a browser session cookie (expires on tab/browser close)
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token if user is passed in (on initial sign in)
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role and id to session
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id || token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "development_secret_key_123_replace_later"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
