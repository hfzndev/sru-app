import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function RegisterLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (session && (session.user?.role === 'admin' || session.user?.role === 'superadmin')) {
    redirect('/dashboard')
  }

  return children
}
