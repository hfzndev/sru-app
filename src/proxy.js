import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// Protect all authenticated app routes EXCEPT /dashboard (public read-only).
export async function proxy(request) {
  let token = null
  try {
    token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  } catch {
    token = null
  }

  if (!token || token.role === "pending") {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/crew", "/stock", "/settings", "/operation", "/news", "/employee"],
}

