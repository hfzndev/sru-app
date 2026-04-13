"use client"
import { useState, useEffect } from "react"
import sharedStyles from "../shared.module.css"
import styles from "./page.module.css"

export default function Stock() {
  const [time, setTime] = useState("--:--")
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)

  // Create state dict for controlling input forms
  const [forms, setForms] = useState({})

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
    const amt = parseFloat(forms[formKey]?.amount || 0)
    const action = forms[formKey]?.action || 'add'

    if (isNaN(amt) || amt <= 0) return;

    // Optimistic UI update (optional, but good for speed)
    const optimisticStock = stock.map(cat => {
      if (cat.categoryId === categoryId) {
        return {
          ...cat,
          items: cat.items.map(it => {
            if (it.id === itemId) {
              const newQty = action === 'add' ? it.qty + amt : Math.max(0, it.qty - amt)
              return { ...it, qty: newQty }
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
            <div className={styles.stockCategoryTitle}>{category.name} - {category.sub}</div>

            {category.items.map(item => {
              const isAvailable = item.qty > 0;
              const availClass = isAvailable ? styles.stockAvailAvailable : styles.stockAvailEmpty;
              const availText = isAvailable ? 'AVAILABLE' : 'UNAVAILABLE';

              let extraText = null;
              if (category.categoryId === 'ipal' && item.unit === 'bag') {
                const kgConverted = item.qty * 25;
                extraText = <span style={{ fontSize: '14px', fontFamily: 'var(--font-dm-mono)', color: 'rgba(255,255,255,0.4)', marginLeft: '6px', fontWeight: 'normal' }}>
                  ≈ {parseFloat(kgConverted).toFixed(1).replace(/\.0$/, '')} kg
                </span>
              }

              const formKey = `${category.categoryId}_${item.id}`
              const amtVal = forms[formKey]?.amount || ''
              const actionVal = forms[formKey]?.action || 'add'

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
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="Amt"
                      value={amtVal}
                      onChange={(e) => handleFormChange(category.categoryId, item.id, 'amount', e.target.value)}
                    />
                    <select
                      value={actionVal}
                      onChange={(e) => handleFormChange(category.categoryId, item.id, 'action', e.target.value)}
                    >
                      <option value="add">Add (+)</option>
                      <option value="reduce">Reduce (-)</option>
                    </select>
                    <button type="submit">Update</button>
                  </form>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
