"use client"
import styles from "./FurnaceCard.module.css"

export default function FurnaceCard() {
  return (
    <>
      {/* FLOW PASS FURNACE */}
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className={styles.cardLabel}>Flow Pass Furnace (93-FI-055A)</div>
            <div className={styles.cardValue}><span>---</span><span className={styles.unit}>Nm³/h</span></div>
            <div className={styles.cardSub}>Status: <span className={styles.up}>Awaiting Data Integration</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
             <div style={{ background: 'rgba(255, 200, 0, 0.1)', color: 'var(--yellow)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-dm-mono)', display: 'inline-block' }}>OFFLINE</div>
          </div>
        </div>
      </div>

      {/* STEAM DRUM LEVEL */}
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.cardLabel}>Level Steam Drum (93-LI-131)</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <div className={styles.cardValue}><span>---</span><span className={styles.unit}>%</span></div>
            <div className={styles.cardSub}>Target: <span className={styles.up}>~50%</span></div>
          </div>
          <div style={{ flex: 1, paddingRight: '20px' }}>
            <div className={styles.thermoBar} style={{ height: '8px', borderRadius: '4px', background: 'var(--black2)' }}>
              <div className={styles.thermoFill} style={{ width: `0%`, background: 'linear-gradient(to right, var(--blue), #60a5fa)', transition: 'width 1s ease' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--gray)', marginTop: '4px', fontFamily: 'var(--font-dm-mono)' }}>
              <span>0% (L)</span>
              <span>100% (H)</span>
            </div>
          </div>
        </div>
      </div>

      {/* TUBE SKIN TEMPERATURES */}
      <div className={`${styles.card} ${styles.cardWide} ${styles.cardHot}`}>
        <div className={styles.cardLabel}>Tube Skin Temperatures</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
          
          <div style={{ background: 'var(--black2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(245, 200, 0, 0.1)' }}>
            <div style={{ color: 'var(--gray)', fontSize: '10px', fontFamily: 'var(--font-dm-mono)', marginBottom: '4px' }}>Zone 1 (93TI085)</div>
            <div style={{ color: 'var(--yellow)', fontSize: '24px', fontFamily: 'var(--font-bebas-neue)' }}>--- <span style={{ fontSize: '12px', color: 'var(--gray)' }}>°C</span></div>
          </div>

          <div style={{ background: 'var(--black2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(245, 200, 0, 0.1)' }}>
            <div style={{ color: 'var(--gray)', fontSize: '10px', fontFamily: 'var(--font-dm-mono)', marginBottom: '4px' }}>Zone 2 (93TI087)</div>
            <div style={{ color: 'var(--yellow)', fontSize: '24px', fontFamily: 'var(--font-bebas-neue)' }}>--- <span style={{ fontSize: '12px', color: 'var(--gray)' }}>°C</span></div>
          </div>

          <div style={{ background: 'var(--black2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(245, 200, 0, 0.1)' }}>
            <div style={{ color: 'var(--gray)', fontSize: '10px', fontFamily: 'var(--font-dm-mono)', marginBottom: '4px' }}>Zone 3 (93TI088)</div>
            <div style={{ color: 'var(--yellow)', fontSize: '24px', fontFamily: 'var(--font-bebas-neue)' }}>--- <span style={{ fontSize: '12px', color: 'var(--gray)' }}>°C</span></div>
          </div>

          <div style={{ background: 'var(--black2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(245, 200, 0, 0.1)' }}>
            <div style={{ color: 'var(--gray)', fontSize: '10px', fontFamily: 'var(--font-dm-mono)', marginBottom: '4px' }}>Zone 4 (93TI089)</div>
            <div style={{ color: 'var(--yellow)', fontSize: '24px', fontFamily: 'var(--font-bebas-neue)' }}>--- <span style={{ fontSize: '12px', color: 'var(--gray)' }}>°C</span></div>
          </div>

        </div>
      </div>
    </>
  )
}
