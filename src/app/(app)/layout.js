import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import styles from './layout.module.css'
import Sidebar from '@/components/Sidebar'

export default async function AppLayout({ children }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user?.role === 'pending') {
    redirect('/?status=pending')
  }

  return (
    <div className={styles.appShell}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  )
}
