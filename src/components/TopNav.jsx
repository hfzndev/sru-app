"use client"
import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import styles from './TopNav.module.css'

export default function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={styles.topNav} ref={menuRef}>
      <div className={styles.leftSection}>
        <div className={styles.logoCircle}></div>
        <div className={styles.brandText}>SRU & IPAL</div>
      </div>

      <button className={styles.hamburgerBtn} onClick={toggleMenu} aria-label="Toggle Menu">
        <span className={styles.hamburgerLine} style={{ transform: menuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }}></span>
        <span className={styles.hamburgerLine} style={{ opacity: menuOpen ? 0 : 1 }}></span>
        <span className={styles.hamburgerLine} style={{ transform: menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }}></span>
      </button>

      {menuOpen && (
        <div className={styles.menuDropdown}>
          {session ? (
            <>
              <button className={styles.menuItem} onClick={() => { signOut({ callbackUrl: '/' }) }}>Logout ({session.user?.name})</button>
              <button className={styles.menuItem} onClick={() => { router.push('/settings'); setMenuOpen(false); }}>Settings</button>
            </>
          ) : (
            <button className={styles.menuItem} onClick={() => { router.push('/login'); setMenuOpen(false); }}>Login</button>
          )}
          <button className={styles.menuItem} onClick={() => { alert('Help coming soon'); setMenuOpen(false) }}>Help</button>
          <button className={styles.menuItem} onClick={() => { alert('FAQ coming soon'); setMenuOpen(false) }}>FAQ</button>
        </div>
      )}
    </div>
  )
}
