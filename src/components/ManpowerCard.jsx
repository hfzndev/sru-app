"use client"
import { useState, useEffect } from "react"
import styles from "./ManpowerCard.module.css"

export default function ManpowerCard() {
  const [loading, setLoading] = useState(true);
  const [shiftMap, setShiftMap] = useState(null);
  const [crewDetails, setCrewDetails] = useState([]);
  const [activeShiftIndex, setActiveShiftIndex] = useState(0); // 0=Morning, 1=Mid, 2=Night

  useEffect(() => {
    // Current Active Shift Highlight based on local time
    const updateActiveBlock = () => {
      const h = new Date().getHours();
      if (h >= 8 && h < 16) setActiveShiftIndex(0); // Morning
      else if (h >= 16 && h < 24) setActiveShiftIndex(1); // Mid
      else setActiveShiftIndex(2); // Night
    };
    updateActiveBlock();
    const timer = setInterval(updateActiveBlock, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const localDate = new Date();
        const yyyy = localDate.getFullYear();
        const mm = String(localDate.getMonth() + 1).padStart(2, '0');
        const dd = String(localDate.getDate()).padStart(2, '0');
        const localDateStr = `${yyyy}-${mm}-${dd}`;

        // Fetch mathematical prediction for TODAY timezone protected
        const shiftRes = await fetch(`/api/shift?date=${localDateStr}`);

        if (shiftRes.ok) {
          const shiftJson = await shiftRes.json();
          setShiftMap(shiftJson.assignments);
          setCrewDetails(shiftJson.crewDetails);
        }
      } catch (err) {
        console.error("Failed to load shift prediction.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // We deleted the API setInterval loop completely. We only fetch once!
  }, []);

  const getSubNumber = (shiftName, shiftPhase) => {
    const d = crewDetails.find(c => c.crew === shiftName);
    if (!d) return '';
    if (shiftPhase === 'Morning') return d.cycleDay;
    if (shiftPhase === 'Night') return d.cycleDay - 4;
    if (shiftPhase === 'Mid') return d.cycleDay - 8;
    return ''; // Off has no day numbers usually
  };

  const blocks = [
    { label: 'MORNING', time: '08.00 – 16.00', crewName: shiftMap?.Morning, phase: 'Morning' },
    { label: 'MID DAY', time: '16.00 – 00.00', crewName: shiftMap?.Mid, phase: 'Mid' },
    { label: 'NIGHT', time: '00.00 – 08.00', crewName: shiftMap?.Night, phase: 'Night' },
    { label: 'OFF', time: 'OFF', crewName: shiftMap?.Off, phase: 'Off' }
  ];

  return (
    <div className={`${styles.card} ${styles.cardWide}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div className={styles.title}>Shift Roster Mapping</div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', color: 'var(--gray)', fontSize: '12px' }}>
          Initializing Predictive Engine...
        </div>
      ) : shiftMap ? (
        <div className={styles.shiftGrid}>
          {blocks.map((block, i) => {
            const isActive = i === activeShiftIndex;
            const cycleBlockNumber = getSubNumber(block.crewName, block.phase);

            return (
              <div key={i} className={`${styles.shiftCard} ${isActive ? styles.shiftCardActive : ''}`}>
                <div className={styles.shiftCardLabel} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className={styles.shiftCrew1}>
                    <span style={{ fontWeight: 'bold' }}>{block.label}</span>
                    <div className={styles.shiftCardSub}>
                      {block.time} {block.time !== 'OFF' ? 'WIB' : ''}
                    </div>
                  </div>
                  <div className={styles.shiftCrew2}>
                    <span className={styles.shiftName}>
                      {block.crewName}
                    </span>
                    <span className={styles.cycleBlock}>{cycleBlockNumber ? `(${block.phase} ${cycleBlockNumber})` : 'OFF'}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '12px' }}>Engine Calibration Required</div>
      )}
    </div>
  )
}
