export { default } from "next-auth/middleware"

export const config = {
  // Specify which routes must be protected!
  // Anyone trying to access these URLs without being logged in will be redirected to /login
  matcher: [
    "/dashboard/:path*",
    "/operation/:path*",
    "/stock/:path*",
    "/crew/:path*",
    "/news/:path*",
    "/settings/:path*"
  ]
}
