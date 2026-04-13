"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import styles from './BottomNav.module.css'

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isFurnace = pathname.includes('/furnace');
  const isStock = pathname.includes('/stock');
  const isCrew = pathname.includes('/crew');
  const isSettings = pathname.includes('/settings');
  const isIndex = pathname === '/dashboard' || (!isFurnace && !isStock && !isCrew && !isSettings && pathname !== '/');

  // If there's no session, they are a guest. Only show Dashboard.
  if (!session) {
    return (
      <div className={styles.bottomNav} style={{ justifyContent: 'center' }}>
        <Link href="/dashboard" className={`${styles.navItem} ${styles.highlightDash} ${styles.active}`}>
          <div className={styles.navIcon}>📊</div>
          <div className={styles.navItemLabel}>Dashboard</div>
        </Link>
      </div>
    )
  }

  // Admin and Superadmin see full navigation
  return (
    <div className={styles.bottomNav}>
      <Link href="/furnace" className={`${styles.navItem} ${isFurnace ? styles.active : ''}`}>
        <div className={styles.navIcon}>🔥</div>
        <div className={styles.navItemLabel}>Furnace</div>
      </Link>
      
      <Link href="/stock" className={`${styles.navItem} ${isStock ? styles.active : ''}`}>
        <div className={styles.navIcon}>📦</div>
        <div className={styles.navItemLabel}>Stock</div>
      </Link>
      
      <Link href="/dashboard" className={`${styles.navItem} ${styles.highlightDash} ${isIndex ? styles.active : ''}`}>
        <div className={styles.navIcon}>📊</div>
        <div className={styles.navItemLabel}>Dashboard</div>
      </Link>
      
      <Link href="/crew" className={`${styles.navItem} ${isCrew ? styles.active : ''}`}>
        <div className={styles.navIcon}>👷</div>
        <div className={styles.navItemLabel}>Crew</div>
      </Link>
      
      <Link href="/settings" className={`${styles.navItem} ${isSettings ? styles.active : ''}`}>
        <div className={styles.navIcon}>⚙️</div>
        <div className={styles.navItemLabel}>Settings</div>
      </Link>
    </div>
  )
}
