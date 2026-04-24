"use client"
import { useState, useEffect } from "react"
import sharedStyles from "../shared.module.css"
import styles from "./page.module.css"

export default function CrewManagement() {
  const [time, setTime] = useState("--:--")
  const [crew, setCrew] = useState([])
  const [loading, setLoading] = useState(true)

  // Sub-page logic: if null, show dashboard view. If a sectionId, show that section.
  const [currentView, setCurrentView] = useState(null)
  const [expandedWorker, setExpandedWorker] = useState(null)
  const [editForm, setEditForm] = useState({ name: "", role: "", type: "" })
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', role: '', type: 'Organik' })
  const [addLoading, setAddLoading] = useState(false)

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'))
    }
    updateClock()
    const intv = setInterval(updateClock, 30000)
    return () => clearInterval(intv)
  }, [])

  // FETCH LIVE DATA
  const fetchCrew = async () => {
    try {
      const res = await fetch('/api/crew')
      if (res.ok) {
        const data = await res.json()
        setCrew(data)
      }
    } catch (err) {
      console.error("Failed to load crew data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCrew()
  }, [])

  const handleToggleWorker = (worker) => {
    if (expandedWorker === worker.id) {
      setExpandedWorker(null)
    } else {
      setExpandedWorker(worker.id)
      setEditForm({ name: worker.name, role: worker.role, type: worker.type })
    }
  }

  const handleUpdateStatus = async (workerId, sectionId, newStatus) => {
    // Optimistic UI Update
    setCrew(prev => prev.map(sec => {
      if (sec.sectionId === sectionId) {
        return {
          ...sec,
          workers: sec.workers.map(w => w.id === workerId ? { ...w, status: newStatus } : w)
        }
      }
      return sec
    }))

    try {
      const res = await fetch('/api/crew', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', sectionId, workerId, newStatus })
      })
      if (!res.ok) fetchCrew() // revert if failed
    } catch {
      fetchCrew() // revert if failed
    }
  }

  const handleSaveProfile = async (workerId, sectionId) => {
    try {
      const res = await fetch('/api/crew', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          sectionId,
          workerId,
          ...editForm
        })
      })
      if (res.ok) {
        setExpandedWorker(null)
        fetchCrew()
      } else {
        alert("Failed to update profile.")
      }
    } catch {
      alert("Error connecting to server.")
    }
  }

  const handleMoveWorker = async (workerId, fromSectionId, toSectionId) => {
    if (fromSectionId === toSectionId) return

    // Precalculate optimistic update to maintain speed
    let movingWorker = null
    const optimisticCrew = crew.map(sec => {
      if (sec.sectionId === fromSectionId) {
        movingWorker = sec.workers.find(w => w.id === workerId)
        return {
          ...sec,
          workers: sec.workers.filter(w => w.id !== workerId)
        }
      }
      return sec
    }).map(sec => {
      if (sec.sectionId === toSectionId && movingWorker) {
        return {
          ...sec,
          workers: [...sec.workers, movingWorker]
        }
      }
      return sec
    })

    setCrew(optimisticCrew)
    setExpandedWorker(null)

    try {
      const res = await fetch('/api/crew', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move_worker', fromSectionId, toSectionId, workerId })
      })
      if (!res.ok) {
        alert("Failed to move worker.")
        fetchCrew()
      }
    } catch {
      alert("Network error moving worker.")
      fetchCrew()
    }
  }

  const handleAddWorker = async (e) => {
    e.preventDefault()
    if (!addForm.name.trim() || !addForm.role.trim()) return
    setAddLoading(true)
    try {
      const res = await fetch('/api/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: currentView, worker: addForm })
      })
      if (res.ok) {
        setAddForm({ name: '', role: '', type: 'Organik' })
        setShowAddForm(false)
        fetchCrew()
      } else {
        const err = await res.json()
        alert(err.message || 'Failed to add worker.')
      }
    } catch {
      alert('Network error adding worker.')
    } finally {
      setAddLoading(false)
    }
  }

  const getStatusClass = (status) => {
    if (status === 'present') return styles.statusSelectPresent;
    if (status === 'leave') return styles.statusSelectLeave;
    if (status === 'trip') return styles.statusSelectTrip;
    return '';
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--gray)' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)' }}>Syncing Personnel...</p>
      </div>
    )
  }

  // ACTIVE SUB-PAGE VIEW
  if (currentView) {
    const activeSection = crew.find(c => c.sectionId === currentView)
    if (!activeSection) {
      setCurrentView(null);
      return null;
    }

    return (
      <>
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => { setCurrentView(null); setExpandedWorker(null); }}
            className={styles.backOverview}
          >
            <span className={styles.backOverview}>&larr;</span> Back to Overview
          </button>
        </div>

        <div className={sharedStyles.header}>
          <div className={sharedStyles.deptBlock}>
            <div className={sharedStyles.deptTag}>
              <div className={sharedStyles.deptTagDot}></div>
              <span className={sharedStyles.deptTagText}>Shift Roster</span>
            </div>
            <div className={sharedStyles.deptTitle}><span>{activeSection.name}</span></div>
            <div className={sharedStyles.deptCompany}>{activeSection.sub} · {activeSection.workers.length} Personnel</div>
          </div>
        </div>

        <div style={{ padding: '0 0px 80px' }}>
          <div className={styles.crewDetailInner}>
            {[...activeSection.workers].sort((a, b) => {
              // 1. Sort by Type (Organik on top, TKJP on bottom)
              if (a.type !== b.type) {
                return a.type === 'Organik' ? -1 : 1;
              }

              // 2. Sort by Job Hierarchy
              const getWeight = (role) => {
                if (role.includes('Head')) return 1;
                if (role.includes('Sr. Supervisor')) return 2;
                if (role.includes('Shift Supervisor')) return 3;
                if (role.includes('Panelman')) return 4;
                if (role.includes('Operator')) return 5;
                if (role.includes('Administrator')) return 6;
                if (role.includes('HSE')) return 7;
                return 8; // Others like Cleaner, Driver
              };
              return getWeight(a.role) - getWeight(b.role);
            }).map(w => {
              const badgeCls = w.type === 'Organik' ? styles.wBadgeOrg : styles.wBadgeTkjp
              const isEditing = expandedWorker === w.id

              return (
                <div key={w.id} className={styles.workerCard}>

                  {/* Top Bar - Click to Expand Actions */}
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer' }} onClick={() => handleToggleWorker(w)}>
                    <div className={styles.workerInfo}>
                      <div className={styles.wName}>
                        {w.name}
                        <span className={`${styles.wBadge} ${badgeCls}`}>{w.type}</span>
                      </div>
                      <div className={styles.wRole}>{w.role}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: w.status === 'present' ? '#4ade80' : w.status === 'leave' ? '#f87171' : '#facc15', textTransform: 'uppercase', fontFamily: 'var(--font-space-grotesk)', fontWeight: 'bold' }}>
                        {w.status}
                      </span>
                      <span style={{ color: 'var(--gray)', fontSize: '10px', transform: isEditing ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>▼</span>
                    </div>
                  </div>

                  {/* Expanded Edit Panel (Animated) */}
                  <div style={{
                    maxHeight: isEditing ? '450px' : '0',
                    fontFamily: 'var(--font-jakarta)',
                    opacity: isEditing ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    marginTop: isEditing ? '12px' : '0',
                    paddingTop: isEditing ? '12px' : '0',
                    borderTop: isEditing ? '1px solid var(--gray2)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px'
                  }}>

                    {/* Personnel Editor Fields */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ color: 'var(--gray)', fontSize: '10px', textTransform: 'uppercase' }}>Full Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          style={{ background: '#111', color: 'var(--white)', border: '1px solid var(--gray2)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', outline: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ color: 'var(--gray)', fontSize: '10px', textTransform: 'uppercase' }}>Job Role</label>
                        <input
                          type="text"
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          style={{ background: '#111', color: 'var(--white)', border: '1px solid var(--gray2)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', outline: 'none' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ color: 'var(--gray)', fontSize: '10px', textTransform: 'uppercase' }}>Contract Type</label>
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          className={styles.statusSelect}
                          style={{ background: '#111', color: 'var(--white)', border: '1px solid var(--gray2)', borderRadius: '6px', cursor: 'pointer', padding: '6px 10px', fontSize: '12px', outline: 'none', appearance: 'none' }}
                        >
                          <option value="Organik">Organik</option>
                          <option value="TKJP">TKJP</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleSaveProfile(w.id, currentView)}
                        className={styles.profileBtn}
                      >
                        Save Profile Changes
                      </button>
                    </div>

                    <div style={{ width: '100%', height: '1px', background: 'var(--gray2)', margin: '8px 0' }}></div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <label style={{ display: 'block', color: 'var(--gray)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '6px', textAlign: 'left' }}>Attendance Status</label>
                      <select
                        className={`${styles.statusSelect} ${getStatusClass(w.status)}`}
                        style={{ minWidth: '100%', width: 'auto', textAlign: 'left', padding: '6px 10px' }}
                        value={w.status}
                        onChange={(e) => handleUpdateStatus(w.id, currentView, e.target.value)}
                      >
                        <option value="present">Present</option>
                        <option value="leave">On Leave</option>
                        <option value="trip">Business Trip</option>
                      </select>
                    </div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <label style={{ display: 'block', color: 'var(--gray)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '6px', textAlign: 'left' }}>Transfer Shift</label>
                      <select
                        className={styles.statusSelect}
                        style={{ minWidth: '100%', width: 'auto', padding: '6px 10px', border: '1px solid var(--blue)', color: 'var(--white)', textAlign: 'left' }}
                        value={currentView}
                        onChange={(e) => handleMoveWorker(w.id, currentView, e.target.value)}
                      >
                        {crew.map(c => (
                          <option key={c.sectionId} value={c.sectionId}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                </div>
              )
            })}
          </div>

          {/* ── ADD WORKER FORM ── */}
          <div style={{ margin: '0 20px 10px' }}>
            <button
              onClick={() => { setShowAddForm(p => !p); setAddForm({ name: '', role: '', type: 'Organik' }) }}
              className={styles.addWorker}
            >
              {showAddForm ? '✕ Cancel' : '+ Add New Worker'}
            </button>

            <div style={{
              maxHeight: showAddForm ? '400px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
            }}>
              <form
                onSubmit={handleAddWorker}
                style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', marginTop: '8px', background: 'var(--black2)', border: '1px solid var(--gray2)', borderRadius: '10px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: 'var(--gray)', fontSize: '10px', fontFamily: 'var(--font-dm-mono)', textTransform: 'uppercase' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Budi Santoso"
                    value={addForm.name}
                    onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                    style={{ background: '#111', color: 'var(--white)', border: '1px solid var(--gray2)', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-space-grotesk)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: 'var(--gray)', fontSize: '10px', fontFamily: 'var(--font-dm-mono)', textTransform: 'uppercase' }}>Job Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operator"
                    value={addForm.role}
                    onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                    style={{ background: '#111', color: 'var(--white)', border: '1px solid var(--gray2)', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-space-grotesk)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ color: 'var(--gray)', fontSize: '10px', fontFamily: 'var(--font-dm-mono)', textTransform: 'uppercase' }}>Contract Type</label>
                  <select
                    value={addForm.type}
                    onChange={e => setAddForm(p => ({ ...p, type: e.target.value }))}
                    style={{ background: '#111', color: 'var(--white)', border: '1px solid var(--gray2)', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                  >
                    <option value="Organik">Organik</option>
                    <option value="TKJP">TKJP</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addLoading}
                  style={{ marginTop: '4px', padding: '10px', background: addLoading ? 'var(--gray2)' : 'var(--yellow)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-space-grotesk)', cursor: addLoading ? 'not-allowed' : 'pointer', letterSpacing: '0.05em', transition: '0.2s' }}
                >
                  {addLoading ? 'Adding...' : 'Add Worker'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    )
  }

  // MAIN DASHBOARD OVERVIEW
  return (
    <>
      <div className={sharedStyles.header}>
        <div className={sharedStyles.deptBlock}>
          <div className={sharedStyles.deptTag}>
            <div className={sharedStyles.deptTagDot}></div>
            <span className={sharedStyles.deptTagText}>Human Resources</span>
          </div>
          <div className={sharedStyles.deptTitle}><span>Crew Management</span></div>
          <div className={sharedStyles.deptCompany}>SRU & IPAL Operations Team</div>
        </div>
      </div>

      <div style={{ padding: '0 20px 80px', display: 'grid', gap: '12px' }}>
        {crew.map(section => (
          <div
            key={section.sectionId}
            className={styles.crewBox}
            onClick={() => setCurrentView(section.sectionId)}
          >
            <div className={styles.crewBoxHeader}>
              <div>
                <div className={styles.crewBoxName}>{section.name}</div>
                <div className={styles.crewBoxSub}>{section.sub}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--white)', fontFamily: 'var(--font-jakarta)', background: 'var(--black2)', padding: '4px 10px', borderRadius: '12px' }}>
                  {section.workers.length} Personnel
                </span>
                <span style={{ color: 'var(--gray)', fontSize: '14px' }}>&rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
