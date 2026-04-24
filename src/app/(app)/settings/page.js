"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import sharedStyles from "../shared.module.css"
import styles from "./page.module.css"

export default function Settings() {
  const router = useRouter()
  const { data: session } = useSession()

  const [notifEnabled, setNotifEnabled] = useState(false)

  // Password state removed, moved to profile page
  // Superadmin state
  const [pendingUsers, setPendingUsers] = useState([])

  useEffect(() => {
    const nToggle = localStorage.getItem('sru_app_notifications')
    if (nToggle === 'on') {
      setNotifEnabled(true)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.role === "superadmin") {
      fetch("/api/user/pending")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setPendingUsers(data)
        })
    }
  }, [session])

  const toggleNotif = (e) => {
    const checked = e.target.checked
    setNotifEnabled(checked)
    localStorage.setItem('sru_app_notifications', checked ? 'on' : 'off')
  }

  const [sheetUrl, setSheetUrl] = useState("")
  const [sheetSaving, setSheetSaving] = useState(false)

  useEffect(() => {
    if (session?.user?.role !== "pending") {
      fetch("/api/config?key=furnace_sheet_url")
        .then(res => res.json())
        .then(data => {
          if (data && data.value) setSheetUrl(data.value)
        })
    }
  }, [session])

  const handleSaveSheetUrl = async (e) => {
    e.preventDefault()
    setSheetSaving(true)
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: 'furnace_sheet_url', value: sheetUrl })
      })
      if (res.ok) alert("Spreadsheet Link Saved!")
      else alert("Failed to save link.")
    } catch {
      alert("Error saving link.")
    }
    setSheetSaving(false)
  }

  const clearStorage = () => {
    if (confirm("WARNING: Are you sure you want to completely erase your app data?")) {
      localStorage.removeItem('sru_stock_data_v3')
      localStorage.removeItem('sru_crew_status_v1')
      localStorage.removeItem('sru_crew_status_v2')
      localStorage.removeItem('sru_app_notifications')

      alert("Cache Successfully Cleared! Returning to Data Dashboard...")
      router.push('/')
    }
  }

  // handleChangePassword removed, moved to profile page

  const handleReviewUser = async (userId, action) => {
    try {
      const res = await fetch("/api/user/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action })
      })
      if (res.ok) {
        setPendingUsers(pendingUsers.filter(u => u._id !== userId))
      } else {
        const data = await res.json()
        alert(data.message)
      }
    } catch (error) {
      alert("Error reviewing application.")
    }
  }

  return (
    <>
      <div className={sharedStyles.header}>
        <div className={sharedStyles.deptBlock}>
          <div className={sharedStyles.deptTag}>
            <div className={sharedStyles.deptTagDot}></div>
            <span className={sharedStyles.deptTagText}>System Configuration</span>
          </div>
          <div className={sharedStyles.deptTitle}><span>Settings</span></div>
          <div className={sharedStyles.deptCompany}>App Control Center</div>
        </div>
      </div>

      <div style={{ padding: '0 20px 80px' }}>

        {/* SUPERADMIN APPROVAL BLOCK */}
        {session?.user?.role === "superadmin" && pendingUsers.length > 0 && (
          <div className={styles.settingsSection} style={{ border: '1px solid var(--yellow)' }}>
            <div className={styles.settingsHeader} style={{ color: 'var(--yellow)' }}>Op. Applications ({pendingUsers.length})</div>
            {pendingUsers.map(user => (
              <div key={user._id} className={styles.settingsRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ color: 'var(--white)', fontFamily: 'var(--font-jakarta)', fontSize: '14px' }}>
                  User: <strong style={{ color: 'var(--yellow)' }}>{user.username}</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button onClick={() => handleReviewUser(user._id, 'approve')} style={{ flex: 1, padding: '8px', background: 'rgba(0, 255, 0, 0.1)', color: '#4ade80', border: '1px solid #4ade80', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                  <button onClick={() => handleReviewUser(user._id, 'reject')} style={{ flex: 1, padding: '8px', background: 'rgba(255, 0, 0, 0.1)', color: '#f87171', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

  {/* ACCOUNT SECURITY MOVED TO PROFILE PAGE */}

        <div className={styles.settingsSection}>
          <div className={styles.settingsHeader}>App Preferences</div>

          <div className={styles.settingsRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingTitle}>Dark Mode</span>
              <span className={styles.settingDesc}>Enable standard dark theme</span>
            </div>
            <label className={styles.toggleSwitch}>
              <input type="checkbox" className={styles.toggleInput} checked disabled />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.settingsRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingTitle}>Push Notifications</span>
              <span className={styles.settingDesc}>Alerts for stock depletion</span>
            </div>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={notifEnabled}
                onChange={toggleNotif}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <div className={styles.settingsHeader}>Data Storage</div>
          <div className={styles.settingsRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingTitle}>Clear Local Cache</span>
              <span className={styles.settingDesc}>Reset browser stored data</span>
            </div>
            <button className={styles.btnDanger} onClick={clearStorage}>Factory Reset</button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 700, color: 'var(--gray)' }}>
            SRU OPERATIONS DASHBOARD
          </div>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--gray)', marginTop: '4px' }}>
            Version 1.2.0-beta
          </div>
        </div>

      </div>
    </>
  )
}
