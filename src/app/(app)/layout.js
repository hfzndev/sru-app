import styles from './layout.module.css'
import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className={styles.appShell}>
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  )
}
