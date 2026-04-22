"use client"
import { useState, useEffect } from "react"
import sharedStyles from "../shared.module.css"
import styles from "./page.module.css"

const ConditionPill = ({ value }) => {
  const c = value || 'Normal Operations'
  const colorMap = {
    'UNIT 90': '#ff4444',
    'UNIT 47': '#f5c800',
    'UNIT 166': '#00d8ff',
  }
  const color = colorMap[c] || '#4ade80'
  return (
    <span className={styles.conditionPill} style={{
      background: `${color}18`,
      border: `1px solid ${color}50`,
      color,
      padding: '4px 10px',
      fontSize: '12px',
      borderRadius: '4px',
      minWidth: '85px',
      display: 'flex',
      justifyContent: 'center',

    }}> {c}</span >
  )
}

function Input({ name, value, onChange, placeholder }) {
  return (
    <input
      className={styles.stockActionInput}
      name={name}
      type="number"
      step="any"
      required
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder || ''}
    />
  )
}

export default function Stock() {
  const [time, setTime] = useState("--:--")
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)

  // Create state dict for controlling input forms
  const [forms, setForms] = useState({})
  const [expandedCategory, setExpandedCategory] = useState(null)

  const toggleCategory = (categoryId) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId)
  }

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
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await fetch('/api/stock')
        if (res.ok) {
          const data = await res.json()
          setStock(data)
        }
      } catch (err) {
        console.error("Failed to load stock data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStock()
  }, [])

  const handleUpdate = async (e, categoryId, itemId) => {
    e.preventDefault()
    const formKey = `${categoryId}_${itemId}`
    const amt = parseFloat(forms[formKey]?.amount)
    const action = 'set'

    if (isNaN(amt) || amt < 0) return;

    // Optimistic UI update (optional, but good for speed)
    const optimisticStock = stock.map(cat => {
      if (cat.categoryId === categoryId) {
        return {
          ...cat,
          items: cat.items.map(it => {
            if (it.id === itemId) {
              return { ...it, qty: amt }
            }
            return it
          })
        }
      }
      return cat
    })
    setStock(optimisticStock)

    // Clear the input
    setForms(prev => ({
      ...prev,
      [formKey]: { ...prev[formKey], amount: '' }
    }))

    // Real DB update
    try {
      const res = await fetch('/api/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, itemId, amount: amt, action })
      })
      if (!res.ok) {
        // If it fails, we should ideally revert the optimistic update or refetch
        alert("Failed to sync mathematical update. Reloading...")
        window.location.reload()
      }
    } catch {
      alert("Network error updating stock.")
    }
  }

  const handleFormChange = (categoryId, itemId, field, value) => {
    const formKey = `${categoryId}_${itemId}`
    setForms(prev => ({
      ...prev,
      [formKey]: { ...prev[formKey], [field]: value }
    }))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--gray)' }}>
        <p style={{ fontFamily: 'var(--font-dm-mono)' }}>Syncing with Database...</p>
      </div>
    )
  }

  return (
    <>
      <div className={sharedStyles.header}>
        <div className={sharedStyles.deptBlock}>
          <div className={sharedStyles.deptTag}>
            <div className={sharedStyles.deptTagDot}></div>
            <span className={sharedStyles.deptTagText}>Inventory Management</span>
          </div>
          <div className={sharedStyles.deptTitle}><span>Material Stock</span></div>
          <div className={sharedStyles.deptCompany}>SRU · IPAL · WWT</div>
        </div>
      </div>

      <div className={styles.stockManageList} style={{ paddingBottom: '80px' }}>
        {stock.map(category => (
          <div key={category.categoryId} className={styles.stockCategory}>
            <div
              className={`${styles.stockCategoryHeader} ${expandedCategory === category.categoryId ? styles.stockCategoryHeaderOpen : ''}`}
              onClick={() => toggleCategory(category.categoryId)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ConditionPill value={category.name} />
                <span>{category.sub}</span>
              </div>
              <svg
                className={`${styles.chevronIcon} ${expandedCategory === category.categoryId ? styles.chevronIconUp : ''}`}
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {expandedCategory === category.categoryId && (
              <div className={styles.stockCategoryItems}>
                {category.items.map(item => {
                  const isAvailable = item.qty > 0;
                  const availClass = isAvailable ? styles.stockAvailAvailable : styles.stockAvailEmpty;
                  const availText = isAvailable ? 'AVAILABLE' : 'UNAVAILABLE';

                  let extraText = null;
                  if (category.categoryId === 'ipal', 'wwt' && item.unit === 'bag') {
                    const kgConverted = item.qty * 25;
                    extraText = <span style={{ fontSize: '14px', fontFamily: 'var(--font-jakarta)', color: 'rgba(255,255,255,0.4)', marginLeft: '12px', fontWeight: 'normal', letterSpacing: '0.1em' }}>
                      ≈ {parseFloat(kgConverted).toFixed(1).replace(/\.0$/, '')} kg
                    </span>
                  }

                  const formKey = `${category.categoryId}_${item.id}`
                  const amtVal = forms[formKey]?.amount || ''

                  return (
                    <div key={item.id} className={styles.stockItemCard}>
                      <div className={styles.stockHeaderRow}>
                        <span className={styles.stockName}>{item.name}</span>
                        <span className={availClass}>{availText}</span>
                      </div>
                      <div className={styles.stockQty}>
                        {parseFloat(item.qty).toFixed(1).replace(/\.0$/, '')} <span>{item.unit}</span>
                        {extraText}
                      </div>
                      <form className={styles.stockActionForm} onSubmit={(e) => handleUpdate(e, category.categoryId, item.id)}>
                        <Input
                          name="amount"
                          placeholder="Latest Qty..."
                          value={amtVal}
                          onChange={(e) => handleFormChange(category.categoryId, item.id, 'amount', e.target.value)}
                        />
                        <button type="submit" className={styles.updateButton}>Update</button>
                      </form>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
