"use client"
import { useEffect } from "react"
import styles from "./FurnaceCard.module.css"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts'


// ── Conversion factors ─────────────────────────────────────────────────────
const T401_FACTOR = 0.0884881043745203
const T402_FACTOR = 0.0884877754301238



// ── Sub-components ─────────────────────────────────────────────────────────
const MetricBox = ({ label, value, unit, isWarning }) => (
  <div className={styles.metricBox} style={{ borderColor: isWarning ? 'rgba(245, 0, 0, 0.3)' : '' }}>
    <span className={styles.metricLabel} style={{ color: isWarning ? '#ff4444' : '' }}>{label}</span>
    <div className={styles.metricValGroup}>
      <span className={styles.metricVal}>{value || '--'}</span>
      {unit && <span className={styles.metricUnit}>{unit}</span>}
    </div>
  </div>
)

const ConditionPill = ({ value }) => {
  const c = value || 'Normal Operations'
  const colorMap = {
    'Stop': '#ff4444',
    'Idle': '#f5c800',
    'Thermox On': '#00d8ff',
    'Normal Operations': '#4ade80',
  }
  const color = colorMap[c] || '#4ade80'
  return (
    <span className={styles.conditionPill} style={{
      background: `${color}18`,
      border: `1px solid ${color}50`,
      color,
    }}>{c}</span>
  )
}

const HBPill = ({ value }) => {
  const c = value || 'Clean'
  const color = c === 'Dirty' ? '#ff4444' : c === 'Little Dirty' || c === 'Cleaning' ? '#f5c800' : '#4ade80'
  return (
    <span className={styles.hbPill} style={{
      background: `${color}18`,
      border: `1px solid ${color}50`,
      color,
    }}>{c}</span>
  )
}

const RowData = ({ label, value, unit }) => (
  <div className={styles.rowData}>
    <span className={styles.rowLabel}>{label}</span>
    <span className={styles.rowValue}>
      {value || '--'}{unit && value ? <span className={styles.rowUnit}> {unit}</span> : null}
    </span>
  </div>
)

const SubHeader = ({ label }) => (
  <div className={styles.subHeader}>{label}</div>
)


// ── Main component ─────────────────────────────────────────────────────────
export default function FurnaceCard({ data, chartData, logData }) {
  if (!data) return <div style={{ color: 'var(--gray)', padding: '20px' }}>Loading Dashboard Data...</div>

  const getStatusDot = (s) => s === 'danger' ? styles.dotDanger : (s === 'warn' || s === 'cleaning') ? styles.dotWarn : styles.dotClean
  const getStatusLabel = (s) => s === 'danger' ? 'DIRTY' : s === 'warn' ? 'LITTLE DIRTY' : s === 'cleaning' ? 'CLEANING' : 'CLEAN'
  const getStatusDesc = (s) => s === 'clean' ? 'Operating normally' : s === 'warn' ? 'Requires Attention' : s === 'cleaning' ? 'Cleaning in progress' : 'Critical — Needs Cleaning'

  const tankTrend = chartData?.tankTrend ?? []
  const sulfurDaily = chartData?.sulfurDaily ?? []
  const sulfurLoading = chartData?.sulfurLoading ?? []

  // Computed from raw log values
  const L = logData || {}
  const t401Ton = (parseFloat(L.u93T401LevelMm) || 0) * T401_FACTOR
  const t402Ton = (parseFloat(L.u93T402LevelMm) || 0) * T402_FACTOR
  const netStockSulfur = (t401Ton + t402Ton - 60).toFixed(3)
  const u47Feed = ((parseFloat(L.u47SwsFeed) || 0) + (parseFloat(L.u47DesalterFeed) || 0)).toFixed(2)
  const u47FeedPct = parseFloat(u47Feed) > 0 ? ((parseFloat(u47Feed) / 167) * 100).toFixed(1) : null


  return (
    <div className={styles.dashboardGrid}>

      {/* ═══════════════════════════════════════════════════
          LEFT COLUMN — SRU Units 90–95
      ═══════════════════════════════════════════════════ */}
      <div className={styles.column}>
        <div className={styles.sectionHeader}>SULFUR RECOVERY UNIT</div>

        {/* ── UNIT 90 ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>UNIT 90
            <ConditionPill value={L.u90Condition} />
          </div>
        </div>

        {/* ── UNIT 91 ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>UNIT 91
            <ConditionPill value={L.u91Condition} />
          </div>
          <div className={styles.metricGrid}>
            <MetricBox label="FEED GAS CAPACITY" value={data.u91FeedGasCapacity} unit="%" />
            <MetricBox label="FEED" value={L.u91Feed} unit="ton/day" />
            <MetricBox label="AMINE STRENGTH" value={L.u91AmineStrength} unit="%" />
            <MetricBox label="AMINE INVENTORY" value={L.u91AmineInventory} unit="m³" />
            <MetricBox label="ACID GAS TO SRU" value={L.u91AcidGasToSRU} unit="ton/day" />
            <MetricBox label="ACID GAS TO FLARE" value={L.u91AcidGasToFlare} unit="ton/day" />
          </div>
          <SubHeader label="Production" />
          <div className={styles.dataList}>
            <RowData label="Treated Gas to LPG" value={L.u91TreatedGasToLPG} unit="ton/day" />
            <RowData label="Treated Gas to FGS" value={L.u91TreatedGasToFGS} unit="ton/day" />
            <RowData label="Liquid Condensate to SWS" value={L.u91LiquidCondensateToSWS} unit="ton/day" />
          </div>
        </div>

        {/* ── UNIT 92 ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>UNIT 92
            <ConditionPill value={L.u92Condition} />
          </div>
          <div className={styles.metricGrid}>
            <MetricBox label="TREATED GAS CAP." value={data.u92TreatedGas} unit="%" />
            <MetricBox label="FEED" value={L.u92Feed} unit="ton/day" />
          </div>
          <SubHeader label="Production" />
          <div className={styles.dataList}>
            <RowData label="Fuel Gas" value={L.u92FuelGas} unit="ton/day" />
            <RowData label="LPG to 47T-103" value={L.u92LpgTo47T103} unit="ton/day" />
            <RowData label="Condensate" value={L.u92Condensate} unit="ton/day" />
          </div>
        </div>

        {/* ── UNIT 93 ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>UNIT 93
            <ConditionPill value={L.u93Condition} />
          </div>
          <div className={styles.metricGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
            <MetricBox label="ACID GAS TOTAL" value={L.u91AcidGasToSRU} unit="ton/day" />
            <MetricBox label="CAPACITY" value={data.u93Capacity} unit="%" />
            <MetricBox label="FEED" value={L.u93Feed} unit="ton/day" />
            <MetricBox label="FUEL GAS TO 93" value={L.u93FuelGasTo93} unit="ton/day" />
          </div>

          <SubHeader label="Sulfur Tanks" />
          <div className={styles.dataList}>
            <RowData label="93T-401 Level" value={L.u93T401LevelMm} unit="mm" />
            <RowData label="93T-401 Inventory" value={t401Ton > 0 ? t401Ton.toFixed(3) : null} unit="ton" />
            <RowData label="93T-402 Level" value={L.u93T402LevelMm} unit="mm" />
            <RowData label="93T-402 Inventory" value={t402Ton > 0 ? t402Ton.toFixed(3) : null} unit="ton" />
            <RowData label="Net Stock Sulfur" value={parseFloat(netStockSulfur) !== -60 ? netStockSulfur : null} unit="ton" />
          </div>

          <SubHeader label="Total Loading This Month" />
          <div className={styles.dataList}>
            <RowData label="Cumulative from 93T-401" value={L.u93TotalLoadingT401} unit="ton" />
            <RowData label="Cumulative from 93T-402" value={L.u93TotalLoadingT402} unit="ton" />
          </div>

          {/* Chart: Tank Trend */}
          <div className={styles.chartContainer}>
            <div className={styles.chartTitle}>
              Sulfur Tanks Level — Last {tankTrend.length > 0 ? tankTrend.length : 'N/A'} Days (ton)
            </div>
            <div style={{ width: '100%', height: 120 }}>
              {tankTrend.length > 0 ? (
                <ResponsiveContainer>
                  <AreaChart data={tankTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="day" stroke="#555" fontSize={10} tickMargin={5} />
                    <YAxis stroke="#555" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '6px', fontFamily: 'var(--font-jakarta)', fontSize: '12px', padding: '12px' }} />
                    <Area type="monotone" dataKey="t401" stroke="#f5c800" fill="rgba(245,200,0,0.2)" strokeWidth={2} name="T-401 (ton)" />
                    <Area type="monotone" dataKey="t402" stroke="#00d8ff" fill="rgba(0,216,255,0.2)" strokeWidth={2} name="T-402 (ton)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: 'var(--gray)', fontSize: 12, paddingTop: 40, textAlign: 'center' }}>No log data yet — submit a daily log.</div>
              )}
            </div>
          </div>

          {/* Chart: Daily Feed */}
          <div className={styles.chartContainer}>
            <div className={styles.chartTitle}>Daily Sulfur Feed (ton/day)</div>
            <div style={{ width: '100%', height: 120 }}>
              {sulfurDaily.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={sulfurDaily} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="day" stroke="#555" fontSize={10} tickMargin={5} />
                    <YAxis stroke="#555" fontSize={10} />
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '6px', fontFamily: 'var(--font-jakarta)', fontSize: '12px', padding: '12px' }} />
                    <Line type="monotone" dataKey="prod" stroke="#4ade80" strokeWidth={3} dot={{ r: 3, fill: '#4ade80' }} name="Feed (ton/day)" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: 'var(--gray)', fontSize: 12, paddingTop: 40, textAlign: 'center' }}>No log data yet — submit a daily log.</div>
              )}
            </div>
          </div>

        </div>

        {/* ── UNIT 94 ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>UNIT 94
            <ConditionPill value={L.u94Condition} />
          </div>
          <div className={styles.metricGrid}>
            <MetricBox label="THERMOX TEMP" value={L.u94TempThermox} unit="°C" />
          </div>
        </div>

        {/* ── UNIT 95 ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>UNIT 95
            <ConditionPill value={L.u95Condition} />
          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════
          RIGHT COLUMN — IPAL · WWT · HB · CPI · Highlights
      ═══════════════════════════════════════════════════ */}
      <div className={styles.column}>
        <div className={styles.sectionHeader}>IPAL · WWT · HB 66/49</div>

        {/* ── UNIT 47 IPAL ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>UNIT 47 IPAL
            <ConditionPill value={L.u47Condition} />
          </div>
          <div className={styles.metricGrid}>
            <MetricBox label="CAPACITY" value={data.ipalCapacity} unit="%" />
            <MetricBox label="FEED" value={u47Feed} unit="m³/hr" />
          </div>

          <SubHeader label="Feed Inputs" />
          <div className={styles.dataList}>
            <RowData label="Flow DAF A" value={L.u47FlowDafA} unit="m³/hr" />
            <RowData label="Flow DAF B" value={L.u47FlowDafB} unit="m³/hr" />
            <RowData label="SWS Feed" value={L.u47SwsFeed} unit="m³/hr" />
            <RowData label="Desalter Feed" value={L.u47DesalterFeed} unit="m³/hr" />
          </div>

          <SubHeader label="Recovery" />
          <div className={styles.dataList}>
            <RowData label="Slop Oil to 43T-3/4" value={L.u47SlopOilTo43T} unit="ton/day" />
            <RowData label="Clean Water to HB" value={L.u47CleanWaterToHB} unit="m³/hr" />
          </div>

          <SubHeader label="Aeration Analysis" />
          <div className={styles.metricGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
            <MetricBox label="pH AERATION A" value={data.ipalPhA} unit="" />
            <MetricBox label="pH AERATION B" value={data.ipalPhB} unit="" />
            <MetricBox label="MLSS AERATION A" value={data.ipalMlssA} unit="mg/L" />
            <MetricBox label="MLSS AERATION B" value={data.ipalMlssB} unit="mg/L" />
          </div>

          <SubHeader label="Chemical" />
          <div className={styles.dataList}>
            <RowData label="TSP" value={L.u47ChemTsp} unit="kg" />
            <RowData label="Caustic" value={L.u47ChemCaustic} unit="kg" />
            <RowData label="SoBi" value={L.u47ChemSobi} unit="kg" />
          </div>
        </div>

        {/* ── UNIT 166 WWT ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>UNIT 166 WWT
            <ConditionPill value={L.u166Condition} />
          </div>
          <div className={styles.metricGrid}>
            <MetricBox label="CAPACITY" value={data.wwtCapacity} unit="%" />
            <MetricBox label="FEED" value={L.u166Feed} unit="m³/hr" />
          </div>

          <SubHeader label="Aeration" />
          <div className={styles.metricGrid}>
            <MetricBox label="pH PIT" value={data.wwtPhPit} unit="" />
            <MetricBox label="MLSS PIT" value={data.wwtMlssPit} unit="mg/L" />
          </div>

          <SubHeader label="Chemical" />
          <div className={styles.dataList}>
            <RowData label="TSP" value={L.u166ChemTsp} unit="kg" />
            <RowData label="Caustic" value={L.u166ChemCaustic} unit="kg" />
            <RowData label="SoBi" value={L.u166ChemSobi} unit="kg" />
          </div>

          <SubHeader label="Feed Analysis" />
          <div className={styles.dataList}>
            <RowData label="pH" value={L.u166FeedPh} />
            <RowData label="TSS" value={L.u166FeedTss} />
            <RowData label="COD" value={L.u166FeedCod} />
            <RowData label="Oil Content" value={L.u166FeedOil} />
            <RowData label="Ammonia Outlet DAF" value={L.u166FeedAmmoniaOutlet} />
          </div>
        </div>

        {/* ── CLEAN WATER ANALYSIS ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>CLEAN WATER ANALYSIS</div>
          <div className={styles.analysisTable}>
            <div className={styles.analysisTHead}>
              <span>Parameter</span>
              <span>Standard</span>
              <span>WWTP</span>
              <span>IPAL</span>
            </div>
            {[
              { label: 'pH', std: '6 – 9', wwt: L.cwWwtPh, ipal: L.cwIpalPh },
              { label: 'COD', std: '< 100 mg/L', wwt: L.cwWwtCod, ipal: L.cwIpalCod },
              { label: 'Oil Content', std: '< 5 mg/L', wwt: L.cwWwtOil, ipal: L.cwIpalOil },
              { label: 'Phenol', std: '< 0.5 mg/L', wwt: L.cwWwtPhenol, ipal: L.cwIpalPhenol },
              { label: 'Ammonia', std: '< 5 mg/L', wwt: L.cwWwtAmmonia, ipal: L.cwIpalAmmonia },
            ].map(r => (
              <div key={r.label} className={styles.analysisTRow}>
                <span className={styles.analysisTLabel}>{r.label}</span>
                <span className={styles.analysisTStd}>{r.std}</span>
                <span className={styles.analysisTVal}>{r.wwt || '--'}</span>
                <span className={styles.analysisTVal}>{r.ipal || '--'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CPI CONDITION ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>CPI CONDITION</div>
          <div className={styles.metricGrid}>
            <MetricBox label="AOC SRU LEVEL" value={L.cpiAocSruLevel} unit="%" />
            <MetricBox label="47T-501 LEVEL" value={L.cpi47T501Level} unit="%" />
            <MetricBox label="166PIT-505 LEVEL" value={L.cpi166Pit505Level} unit="%" />
          </div>
        </div>

        {/* ── HB 49/66 ── */}
        <div className={styles.unitCard}>
          <div className={styles.cardHeader}>HB 66/49 STATUS</div>
          <div className={styles.visualStatusBox}>
            <div className={`${styles.statusDot} ${getStatusDot(data.hbStatus)}`} />
            <div>
              <div className={styles.statusLabel}>{getStatusLabel(data.hbStatus)}</div>
              <div className={styles.statusDesc}>{getStatusDesc(data.hbStatus)}</div>
            </div>
          </div>

          <SubHeader label="Basin Conditions" />
          <div className={styles.hbGrid}>
            {[
              { label: 'HB 49', val: L.hb49Condition },
              { label: 'HB 66 Timur', val: L.hb66TimurCondition },
              { label: 'Aeration Timur', val: L.aerationTimurCondition },
              { label: 'HB 66 Barat', val: L.hb66BaratCondition },
              { label: 'Aeration Barat', val: L.aerationBaratCondition },
              { label: 'Second Trap', val: L.secondTrapCondition },
            ].map(({ label, val }) => (
              <div key={label} className={styles.hbItem}>
                <span className={styles.hbLabel}>{label}</span>
                <HBPill value={val} />
              </div>
            ))}
          </div>

          <SubHeader label="Sumpit Levels" />
          <div className={styles.metricGrid}>
            <MetricBox label="SUMPIT 49" value={L.sumpit49Level} unit="%" />
            <MetricBox label="SUMPIT 66" value={L.sumpit66Level} unit="%" />
            <MetricBox label="SUMPIT 301" value={L.sumpit301Level} unit="%" />
          </div>
        </div>

      </div>
    </div >
  )
}
