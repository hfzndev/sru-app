import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token }) => {
      // Must be logged in AND must not be pending
      return !!token && token.role !== "pending";
    }
  }
})

// Specify the matcher covering all restricted pages
export const config = { matcher: ["/furnace", "/crew", "/stock", "/settings"] }
