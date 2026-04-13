"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, LayoutDashboard, Flame, Package, Users, Settings, LogOut, Newspaper, BadgeCheck as UserBadge } from 'lucide-react'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll when overlay is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  const toggleSidebar = () => setIsOpen(!isOpen)

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Operations', path: '/operation', icon: <Flame size={20} /> },
    { name: 'Stock', path: '/stock', icon: <Package size={20} /> },
    { name: 'Crew', path: '/crew', icon: <Users size={20} /> },
    { name: 'News', path: '/news', icon: <Newspaper size={20} /> },
    { name: 'Employees', path: '/employee', icon: <UserBadge size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ]

  return (
    <>
      {/* Mobile Top Bar */}
      <div className={styles.mobileTopBar}>
        <div className={styles.mobileBrand}>
          <img src="/SRU Logo CC.png" alt="SRU Logo" className={styles.mobileLogo} />
          <span>SRU & IPAL</span>
        </div>
        <button className={styles.hamburgerBtn} onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </div>

      {/* Backdrop for Mobile overlay */}
      {isOpen && (
        <div className={styles.backdrop} onClick={toggleSidebar} />
      )}

      {/* Sidebar Panel */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>

        {/* Header Logo */}
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logoLink}>
            <img src="/SRU Logo CC.png" alt="SRU Logo" className={styles.logoImg} />
            <div className={styles.brandText}>SRU & IPAL</div>
          </Link>
          <button className={styles.closeBtn} onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.iconWrap}>{item.icon}</div>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info / Logout Bottom */}
        <div className={styles.sidebarFooter}>
          {session ? (
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>{session.user?.name?.charAt(0) || 'U'}</div>
                <div className={styles.userName}>{session.user?.name || 'User'}</div>
              </div>
              <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              Admin Login
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
