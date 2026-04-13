"use client"
import { useState, useEffect } from "react"
import styles from "./dashboard.module.css"
import sharedStyles from "../shared.module.css"
import FurnaceCard from "@/components/FurnaceCard"
import ManpowerCard from "@/components/ManpowerCard"

export default function Dashboard() {
  const [time, setTime] = useState("--:--")
  const [date, setDate] = useState("--")
  const [prodPct, setProdPct] = useState(0)
  const [activeShift, setActiveShift] = useState('...');
  const [activeShiftName, setActiveShiftName] = useState('Prediction Engine Loading...');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'));
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      setDate(days[now.getDay()] + ', ' + String(now.getDate()).padStart(2, '0') + ' ' + months[now.getMonth()] + ' ' + now.getFullYear());
    };
    updateClock();
    const intv = setInterval(updateClock, 30000);
    return () => clearInterval(intv);
  }, []);

  useEffect(() => {
    const fetchActiveShift = async () => {
      try {
        // Build Local YYYY-MM-DD Date explicitly to avoid UTC rollover bugs pulling yesterday's schedule
        const localDate = new Date();
        const yyyy = localDate.getFullYear();
        const mm = String(localDate.getMonth() + 1).padStart(2, '0');
        const dd = String(localDate.getDate()).padStart(2, '0');
        const localDateStr = `${yyyy}-${mm}-${dd}`;

        const res = await fetch(`/api/shift?date=${localDateStr}`);
        if (res.ok) {
          const json = await res.json();
          const maps = json.assignments;
          const details = json.crewDetails;

          let activeName = '';
          let shiftType = '';

          const h = new Date().getHours();
          if (h >= 8 && h < 16) {
            activeName = maps.Morning;
            shiftType = 'Morning';
          } else if (h >= 16 && h < 24) {
            activeName = maps.Mid;
            shiftType = 'Mid';
          } else {
            activeName = maps.Night;
            shiftType = 'Night';
          }

          setActiveShift(activeName);

          // Find exactly what block day this crew is currently on
          const activeCrew = details.find(c => c.crew === activeName);
          let shiftNumber = '';
          if (activeCrew) {
            if (activeCrew.shift === 'Morning') shiftNumber = activeCrew.cycleDay;
            else if (activeCrew.shift === 'Night') shiftNumber = activeCrew.cycleDay - 4;
            else if (activeCrew.shift === 'Mid') shiftNumber = activeCrew.cycleDay - 8;
          }

          if (shiftType === 'Morning') {
            setActiveShiftName(`08:00 – 16:00 WIB (Morning ${shiftNumber})`);
          } else if (shiftType === 'Mid') {
            setActiveShiftName(`16:00 – 24:00 WIB (Mid Day ${shiftNumber})`);
          } else {
            setActiveShiftName(`00:00 – 08:00 WIB (Night ${shiftNumber})`);
          }
        }
      } catch (err) {
        console.error("Failed to load shift prediction", err);
      }
    };

    fetchActiveShift();
    const secTimer = setInterval(fetchActiveShift, 60000);
    return () => clearInterval(secTimer);
  }, []);

  useEffect(() => {
    // Simulate data loading animation
    setTimeout(() => {
      setProdPct(80) // 84 target 
    }, 700)
  }, [])

  return (
    <>
      <div className={sharedStyles.header}>
        <div className={sharedStyles.deptBlock}>
          <div className={sharedStyles.deptTag}>
            <div className={sharedStyles.deptTagDot}></div>
            <span className={sharedStyles.deptTagText}>PT Pertamina Patra Niaga</span>
          </div>
          <div className={sharedStyles.deptTitle}><span>SRU & IPAL Dashboard</span> </div>
          <div className={sharedStyles.deptCompany}>PRODUCTION II · Cilacap Refinery</div>
        </div>
      </div>

      <div className={styles.shiftBanner}>
        <div className={styles.shiftInfo}>
          <div className={styles.label}>Active Shift</div>
          <div className={styles.value} style={{ textTransform: 'uppercase' }}>{activeShift}</div>
          <div className={styles.sub}>{activeShiftName}</div>
        </div>
        <div className={styles.statusPill}><span className={styles.liveDot}></span>NORMAL OPERATION</div>
      </div>

      <div className={styles.sectionLabel}>Claus Furnace (93F-401)</div>
      <div className={sharedStyles.cardsGrid}>
        <FurnaceCard />
      </div>

      <div className={styles.sectionLabel}>Production Today</div>
      <div className={sharedStyles.cardsGrid}>
        <div className={`${sharedStyles.card} ${styles.cardWide}`}>
          <div className={styles.prodWide}>
            <div className={styles.prodMain}>
              <div className={styles.cardLabel}>Sulfur Product</div>
              <div className={styles.cardValue}><span>84</span><span className={styles.unit}>ton</span></div>
              <div className={styles.cardSub}>Target: <span className={styles.up}>105 ton</span></div>
              <div className={styles.thermoBar} style={{ marginTop: '10px' }}>
                <div className={styles.thermoFill} style={{ width: `${prodPct}%` }}></div>
              </div>
            </div>
            <div className={styles.prodStat}>
              <div className={styles.statVal}>{prodPct}%</div>
              <div className={styles.statLabel}>OF TARGET</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionLabel}>Manpower – All Shifts</div>
      <div className={sharedStyles.cardsGrid}>
        <ManpowerCard />
      </div>
    </>
  )
}
