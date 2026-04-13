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

export const config = { matcher: ["/furnace", "/crew", "/stock", "/settings", "/dashboard", "/operation", "/news", "/employee"] }
