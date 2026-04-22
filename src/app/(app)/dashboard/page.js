"use client"
import { useState, useEffect } from "react"
import styles from "./dashboard.module.css"
import sharedStyles from "../shared.module.css"
import FurnaceCard from "@/components/FurnaceCard"
import HighlightsCard from "@/components/HighlightsCard"
import ManpowerCard from "@/components/ManpowerCard"

export default function Dashboard() {
  const [time, setTime] = useState("--:--")
  const [date, setDate] = useState("--")
  const [prodPct, setProdPct] = useState(0)
  const [activeShift, setActiveShift] = useState('...');
  const [activeShiftName, setActiveShiftName] = useState('Prediction Engine Loading...');
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [logData, setLogData] = useState(null);
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    fetch('/api/dashboard-data')
      .then(res => res.json())
      .then(data => setDashboardData(data))
      .catch(console.error);

    fetch('/api/dashboard-data/chart')
      .then(res => res.json())
      .then(data => setChartData(data))
      .catch(console.error);

    // Fetch today's raw operation log for full detail display
    fetch('/api/operation-log')
      .then(res => res.json())
      .then(data => setLogData(data))
      .catch(console.error);

    // Fetch persistent highlights
    fetch('/api/operation-log/highlights')
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setHighlights(data) : setHighlights([]))
      .catch(console.error);
  }, []);

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

  // Add this custom helper function right above your fetchActiveShift useEffect!
  const setShiftTypeStateLocalHelper = (h) => {
    // If the API hasn't loaded mapping yet, do nothing
    if (activeShiftName === 'Prediction Engine Loading...') return;

    // Local mathematical flip based purely on laptop clock!
    if (h >= 8 && h < 16) {
      setActiveShiftName((prev) => prev.replace(/Night \d+|Mid Day \d+/, 'Morning $1'));
    } else if (h >= 16 && h < 24) {
      setActiveShiftName((prev) => prev.replace(/Morning \d+|Night \d+/, 'Mid Day $1'));
    } else {
      setActiveShiftName((prev) => prev.replace(/Morning \d+|Mid Day \d+/, 'Night $1'));
    }
  };

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

    // We replaced the API poll with a pure local clock checker!
    // It just checks if the hour changed to update the String. No database involved.
    const localChecker = setInterval(() => {
      const h = new Date().getHours();
      setShiftTypeStateLocalHelper(h);
    }, 60000);

    return () => clearInterval(localChecker);
  }, []);

  useEffect(() => {
    // Simulate data loading animation
    setTimeout(() => {
      setProdPct(50) // 84 target 
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
        <span className={styles.timeValue}>{time} <span className={styles.tz}>WIB</span></span>
      </div>

      <div className={styles.dateBanner}>
        <div className={styles.dateRow}>
          <span className={styles.dateLabel}>TODAY</span>
          <span className={styles.dateValue}>{date}</span>
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


      <div className={styles.sectionLabel}>SRU OPERATIONS REPORT</div>
      <div className={sharedStyles.cardsGrid}>
        <FurnaceCard data={dashboardData} chartData={chartData} logData={logData} />
      </div>

      <div className={styles.sectionLabel}>Highlights</div>
      <div className={sharedStyles.cardsGrid}>
        <HighlightsCard highlights={highlights} />
      </div>

      <div className={styles.sectionLabel}>Manpower – All Shifts</div>
      <div className={sharedStyles.cardsGrid}>
        <ManpowerCard />
      </div>
    </>
  )
}
