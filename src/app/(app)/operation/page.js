"use client"
import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import sharedStyles from "../shared.module.css"
import styles from "./page.module.css"

export default function FurnaceDetails() {
  const [time, setTime] = useState("--:--")

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'))
    }
    updateClock()
    const intv = setInterval(updateClock, 30000)
    return () => clearInterval(intv)
  }, [])

  return (
    <>
      <div className={sharedStyles.header} >
        <div className={sharedStyles.deptBlock} >
          <div className={sharedStyles.deptTag} >
            <div className={sharedStyles.deptTagDot}></div>
            <span className={sharedStyles.deptTagText}>SRU & IPAL DETAILED OPERATION PARAMETERS</span>
          </div>
          <div>
            <div className={sharedStyles.deptTitle}><span>Sulfur Recovery Unit</span></div>
            <div className={sharedStyles.deptCompany}>PRODUCTION II · Cilacap Refinery</div>
          </div>
        </div>
      </div>

      <div className={sharedStyles.sectionLabel}>Furnace Indicators</div>
      <div className={sharedStyles.cardsGrid}>

        <div className={sharedStyles.card}>
          <div className={sharedStyles.cardLabel}>Acid Flow</div>
          <div className={sharedStyles.cardValue}>121<span className={sharedStyles.unit}>ton</span></div>
          <div className={sharedStyles.cardSub}>Setpoint: <span className={sharedStyles.up}>120 ton</span></div>
        </div>

        <div className={`${sharedStyles.card} ${sharedStyles.cardHot}`}>
          <div className={sharedStyles.cardLabel}>Furnace Temp</div>
          <div className={sharedStyles.cardValue}>1,150<span className={sharedStyles.unit}>°C</span></div>
          <div className={sharedStyles.cardSub}>Max cap: <span style={{ color: 'var(--orange)' }}>1,300°C</span></div>
        </div>

        <div className={`${sharedStyles.card} ${sharedStyles.cardWide}`}>
          <div className={sharedStyles.cardLabel}>Inlet & Outlet Temp</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <div>
              <div className={sharedStyles.cardValue} style={{ fontSize: '24px' }}>240<span className={sharedStyles.unit}>°C</span></div>
              <div className={sharedStyles.cardSub}>Inlet</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={sharedStyles.cardValue} style={{ fontSize: '24px' }}>310<span className={sharedStyles.unit}>°C</span></div>
              <div className={sharedStyles.cardSub}>Outlet</div>
            </div>
          </div>
        </div>

        <div className={sharedStyles.card}>
          <div className={sharedStyles.cardLabel}>Pressure</div>
          <div className={sharedStyles.cardValue}>0.45<span className={sharedStyles.unit}>kg/cm²</span></div>
          <div className={sharedStyles.cardSub}>Status: <span className={sharedStyles.up}>Normal</span></div>
        </div>

        <div className={sharedStyles.card}>
          <div className={sharedStyles.cardLabel}>Skin Temp</div>
          <div className={sharedStyles.cardValue}>180<span className={sharedStyles.unit}>°C</span></div>
          <div className={sharedStyles.cardSub}>Limit: <span style={{ color: 'var(--yellow)' }}>250°C</span></div>
        </div>

        <div className={sharedStyles.card}>
          <div className={sharedStyles.cardLabel}>Air Flow</div>
          <div className={sharedStyles.cardValue}>210<span className={sharedStyles.unit}>ton</span></div>
          <div className={sharedStyles.cardSub}>Ratio adjusted</div>
        </div>

        <div className={sharedStyles.card}>
          <div className={sharedStyles.cardLabel}>Air Pressure</div>
          <div className={sharedStyles.cardValue}>1.1<span className={sharedStyles.unit}>kg/cm²</span></div>
          <div className={sharedStyles.cardSub}>Blower: <span className={sharedStyles.up}>ON</span></div>
        </div>

        <div className={`${sharedStyles.card} ${sharedStyles.cardWide}`} style={{ textAlign: 'center' }}>
          <div className={sharedStyles.cardLabel}>Overall Status</div>
          <div className={sharedStyles.cardValue} style={{ color: 'var(--safe)', marginTop: '4px' }}>OPTIMAL OPERATION</div>
        </div>
      </div>

      <div className={sharedStyles.header}>
        <div className={sharedStyles.deptTitle}><span>Instalasi Pengolahan Air Limbah</span></div>
        <div className={sharedStyles.deptCompany}>PRODUCTION II · Cilacap Refinery</div>
      </div>

      <div className={sharedStyles.header}>
        <div className={sharedStyles.deptTitle}><span>Waste Water Treatment</span></div>
        <div className={sharedStyles.deptCompany}>PRODUCTION II · Cilacap Refinery</div>
      </div>


    </>
  )
}
