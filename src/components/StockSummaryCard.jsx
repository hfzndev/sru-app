"use client"
import styles from "./StockSummaryCard.module.css"

export default function StockSummaryCard({ stockData = [] }) {
  if (!stockData || stockData.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>INVENTORY OVERVIEW</span>
        </div>
        <div className={styles.empty}>Loading stock data...</div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.grid}>
        {stockData.map(category => (
          <div key={category.categoryId} className={styles.categoryGroup}>
            <div className={styles.categoryName}>{category.name}</div>
            {category.items.map(item => {
              const isAvailable = item.qty > 0;
              return (
                <div key={item.id} className={styles.item}>
                  <span className={styles.itemName}>{item.name}</span>
                  {isAvailable ? (
                    <div className={styles.itemQty}>
                      <span className={styles.qtyValue}>{parseFloat(item.qty).toFixed(1).replace(/\.0$/, '')}</span>
                      <span className={styles.qtyUnit}>{item.unit}</span>
                    </div>
                  ) : (
                    <span className={styles.unavailable}>EMPTY</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
