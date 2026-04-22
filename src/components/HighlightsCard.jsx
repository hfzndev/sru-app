"use client"
import styles from "./HighlightsCard.module.css"

export default function HighlightsCard({ highlights = [] }) {
  const pending = highlights.filter(h => !h.done)
  const done = highlights.filter(h => h.done)

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>HIGHLIGHTS</span>
        {pending.length > 0 && (
          <span className={styles.badge}>{pending.length} active</span>
        )}
      </div>

      {highlights.length === 0 ? (
        <div className={styles.empty}>No highlights — add one from the Operations Controller.</div>
      ) : (
        <div className={styles.list}>
          {pending.map(h => (
            <div key={h.id} className={styles.item}>
              <span className={styles.dot} />
              <span className={styles.text}>{h.text}</span>
            </div>
          ))}

          {done.length > 0 && pending.length > 0 && (
            <div className={styles.divider}>COMPLETED</div>
          )}

          {done.map(h => (
            <div key={h.id} className={`${styles.item} ${styles.itemDone}`}>
              <span className={styles.checkIcon}>✓</span>
              <span className={styles.text}>{h.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
