"use client"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import sharedStyles from "../shared.module.css"
import styles from "./page.module.css"

export default function Profile() {
  const { data: session, update } = useSession()
  
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Avatar state
  const fileInputRef = useRef(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarStatus, setAvatarStatus] = useState({ type: '', msg: '' })

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [pwStatus, setPwStatus] = useState({ type: '', msg: '' })
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile")
      if (res.ok) {
        const data = await res.json()
        setProfileData(data)
        if (data.profilePictureBase64) {
          setPreviewImage(data.profilePictureBase64)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Image Selection and Resize
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAvatarStatus({ type: 'error', msg: 'Please select a valid image file.' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Resize logic (max 400x400)
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 400
        const MAX_HEIGHT = 400
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
        setPreviewImage(compressedBase64)
        setAvatarStatus({ type: '', msg: '' })
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAvatar = async () => {
    if (!previewImage || previewImage === profileData?.profilePictureBase64) {
      return
    }
    
    setAvatarLoading(true)
    setAvatarStatus({ type: '', msg: '' })

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePictureBase64: previewImage })
      })

      if (res.ok) {
        setAvatarStatus({ type: 'success', msg: 'Avatar updated successfully!' })
        // If we want to force next-auth session update for avatar (if we were using it there)
        // update()
      } else {
        const data = await res.json()
        setAvatarStatus({ type: 'error', msg: data.message || 'Failed to update avatar.' })
      }
    } catch (err) {
      setAvatarStatus({ type: 'error', msg: 'An error occurred.' })
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwLoading(true)
    setPwStatus({ type: '', msg: '' })
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        setPwStatus({ type: 'success', msg: data.message || "Password updated successfully!" })
        setCurrentPassword("")
        setNewPassword("")
      } else {
        setPwStatus({ type: 'error', msg: data.message })
      }
    } catch {
      setPwStatus({ type: 'error', msg: "An error occurred." })
    }
    setPwLoading(false)
  }

  if (loading) {
    return <div style={{ color: 'var(--white)', padding: '40px', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <>
      <div className={sharedStyles.header}>
        <div className={sharedStyles.deptBlock}>
          <div className={sharedStyles.deptTag}>
            <div className={sharedStyles.deptTagDot}></div>
            <span className={sharedStyles.deptTagText}>User Account</span>
          </div>
          <div className={sharedStyles.deptTitle}><span>My Profile</span></div>
          <div className={sharedStyles.deptCompany}>Manage your personal information</div>
        </div>
      </div>

      <div style={{ padding: '0 20px 80px' }}>
        <div className={styles.profileContainer}>
          
          {/* Avatar Section */}
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>Profile Photo</div>
            <div className={styles.avatarSection}>
              <div className={styles.avatarPreview}>
                {previewImage ? (
                  <img src={previewImage} alt="Avatar" className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarFallback}>
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              
              <div className={styles.uploadActions}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  className={styles.hiddenInput}
                  onChange={handleImageSelect}
                />
                <button 
                  className={styles.uploadBtn} 
                  onClick={() => fileInputRef.current.click()}
                >
                  Choose New Photo
                </button>
                <button 
                  className={styles.saveBtn} 
                  onClick={handleSaveAvatar}
                  disabled={avatarLoading || !previewImage || previewImage === profileData?.profilePictureBase64}
                >
                  {avatarLoading ? 'Saving...' : 'Save Photo'}
                </button>
              </div>
            </div>
            {avatarStatus.msg && (
              <div className={`${styles.alert} ${avatarStatus.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
                {avatarStatus.msg}
              </div>
            )}
          </div>

          {/* Account Details */}
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>Account Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Username</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={profileData?.username || session?.user?.name || ''} 
                  disabled 
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Role</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  value={profileData?.role || session?.user?.role || ''} 
                  disabled 
                  style={{ opacity: 0.7, cursor: 'not-allowed', textTransform: 'capitalize' }}
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>Change Password</div>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Current Password</label>
                <input
                  type="password"
                  className={styles.input}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <input
                  type="password"
                  className={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              {pwStatus.msg && (
                <div className={`${styles.alert} ${pwStatus.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
                  {pwStatus.msg}
                </div>
              )}

              <button 
                type="submit" 
                className={styles.saveBtn}
                disabled={pwLoading}
                style={{ alignSelf: 'flex-start', marginTop: '8px' }}
              >
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}
