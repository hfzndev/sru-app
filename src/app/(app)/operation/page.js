"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Save, Loader2, AlertCircle, CheckCircle2, Plus, Trash2, Pencil, X, Check, CalendarDays, Download } from "lucide-react"
import sharedStyles from "../shared.module.css"
import styles from "./page.module.css"


// ── Constants ──────────────────────────────────────────────────────────────
const CONDITION_STD = ['Normal Operations', 'Idle', 'Stop']
const CONDITION_U94 = ['Normal Operations', 'Idle', 'Stop', 'Thermox On']
const CONDITION_HB = ['Clean', 'Little Dirty', 'Dirty']

const CW_DESIGN = { pH: '6 – 9', COD: '< 100 mg/L', 'Oil Content': '< 5 mg/L', Phenol: '< 0.5 mg/L', Ammonia: '< 5 mg/L' }

const T401_FACTOR = 0.0884881043745203
const T402_FACTOR = 0.0884877754301238

function getTodayWIB() {
  const now = new Date()
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  return wib.toISOString().slice(0, 10)
}

function formatIndonesianDate(dateString) {
  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  if (!dateString) return ''
  const parts = dateString.split('-')
  if (parts.length !== 3) return dateString

  // Create date using local time at midnight so the day of week is correct
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))

  const dayName = DAYS[d.getDay()]
  const day = d.getDate()
  const monthName = MONTHS[d.getMonth()]
  const year = d.getFullYear()

  return `${dayName} , ${day} ${monthName} ${year}`
}

function getMonthNameIndonesian(dateString) {
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  if (!dateString) return ''
  const parts = dateString.split('-')
  if (parts.length !== 3) return ''
  return MONTHS[parseInt(parts[1]) - 1]
}

const EMPTY_FORM = {
  u90Condition: 'Normal Operations',
  u91Condition: 'Normal Operations', u91Feed: '', u91AmineStrength: '', u91AmineInventory: '',
  u91AcidGasToSRU: '', u91AcidGasToFlare: '', u91TreatedGasToLPG: '', u91TreatedGasToFGS: '', u91LiquidCondensateToSWS: '',
  u92Condition: 'Normal Operations', u92Feed: '', u92FuelGas: '', u92LpgTo47T103: '', u92Condensate: '',
  u93Condition: 'Normal Operations', u93Feed: '', u93FuelGasTo93: '',
  u93T401LevelMm: '', u93T402LevelMm: '', u93TotalLoadingT401: '0', u93TotalLoadingT402: '0',
  u94Condition: 'Normal Operations', u94TempThermox: '',
  u95Condition: 'Normal Operations',
  u47Condition: 'Normal Operations', u47FlowDafA: '', u47FlowDafB: '', u47SwsFeed: '', u47DesalterFeed: '',
  u47SlopOilTo43T: '', u47CleanWaterToHB: '',
  u47AerationAph: '', u47AerationAmlss: '', u47AerationBph: '', u47AerationBmlss: '',
  u47ChemTsp: '', u47ChemCaustic: '', u47ChemSobi: '',
  u166Condition: 'Normal Operations', u166Feed: '',
  u166AerationPh: '', u166AerationMlss: '',
  u166ChemTsp: '', u166ChemCaustic: '', u166ChemSobi: '',
  u166FeedPh: '', u166FeedTss: '', u166FeedCod: '', u166FeedOil: '', u166FeedAmmoniaOutlet: '',
  cwWwtPh: '', cwWwtCod: '', cwWwtOil: '', cwWwtPhenol: '', cwWwtAmmonia: '',
  cwIpalPh: '', cwIpalCod: '', cwIpalOil: '', cwIpalPhenol: '', cwIpalAmmonia: '',
  cpiAocSruLevel: '', cpi47T501Level: '', cpi166Pit505Level: '',
  hb49Condition: 'Clean', hb66TimurCondition: 'Clean', aerationTimurCondition: 'Clean',
  hb66BaratCondition: 'Clean', aerationBaratCondition: 'Clean', secondTrapCondition: 'Clean',
  sumpit49Level: '', sumpit66Level: '', sumpit301Level: '',
}

// ── Helper components ──────────────────────────────────────────────────────
function SectionTitle({ unit, label }) {
  return (
    <div className={styles.sectionTitle}>
      {unit && <span className={styles.unitBadge}>{unit}</span>}
      {label}
    </div>
  )
}

function SubTitle({ label }) {
  return <div className={styles.subSectionTitle}>{label}</div>
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  )
}

function Input({ name, value, onChange, readOnly, placeholder }) {
  return (
    <input
      className={`${styles.input} ${readOnly ? styles.autoField : ''}`}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder || ''}
    />
  )
}

function Select({ name, value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const pick = (o) => {
    onChange({ target: { name, value: o } })
    setOpen(false)
  }

  return (
    <div className={styles.customSelect} ref={ref}>
      <button
        type="button"
        className={`${styles.customSelectTrigger} ${open ? styles.customSelectOpen : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value}</span>
        <svg
          className={`${styles.customSelectChevron} ${open ? styles.customSelectChevronUp : ''}`}
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ul className={styles.customSelectList} role="listbox">
          {options.map(o => (
            <li
              key={o}
              role="option"
              aria-selected={o === value}
              className={`${styles.customSelectItem} ${o === value ? styles.customSelectItemActive : ''}`}
              onClick={() => pick(o)}
            >
              {o === value && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {o !== value && <span style={{ width: 12, flexShrink: 0 }} />}
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FeedField({ label, name, value, onChange, normal, unit = 'ton/day' }) {
  const pct = normal && value ? ((parseFloat(value) / normal) * 100).toFixed(1) : null
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.feedRow}>
        <input
          className={styles.input}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={`normal: ${normal} ${unit}`}
        />
        {pct !== null && (
          <span className={`${styles.percentBadge} ${parseFloat(pct) > 100 ? styles.percentOver : ''}`}>
            {pct}%
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function OperationController() {
  const today = getTodayWIB()
  const [selectedDate, setSelectedDate] = useState(today)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [prevCumT401, setPrevCumT401] = useState(0) // prev day cumulative for T401
  const [prevCumT402, setPrevCumT402] = useState(0) // prev day cumulative for T402
  const [todayLoadT401, setTodayLoadT401] = useState('')
  const [todayLoadT402, setTodayLoadT402] = useState('')
  const [isToday, setIsToday] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState({ type: '', msg: '' })

  // Highlights state
  const [highlights, setHighlights] = useState([])
  const [newHighlight, setNewHighlight] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [hlLoading, setHlLoading] = useState(false)

  // Computed values
  const t401Mm = parseFloat(formData.u93T401LevelMm) || 0
  const t402Mm = parseFloat(formData.u93T402LevelMm) || 0
  const t401Ton = t401Mm * T401_FACTOR
  const t402Ton = t402Mm * T402_FACTOR
  const netStockSulfur = t401Ton + t402Ton - 60

  const swsFeed = parseFloat(formData.u47SwsFeed) || 0
  const desalterFeed = parseFloat(formData.u47DesalterFeed) || 0
  const u47Feed = swsFeed + desalterFeed
  const u47FeedPct = u47Feed ? ((u47Feed / 167) * 100).toFixed(1) : null

  // Cumulative display (today only)
  const newCumT401 = isToday ? (prevCumT401 + (parseFloat(todayLoadT401) || 0)).toFixed(3) : formData.u93TotalLoadingT401
  const newCumT402 = isToday ? (prevCumT402 + (parseFloat(todayLoadT402) || 0)).toFixed(3) : formData.u93TotalLoadingT402

  const loadDate = useCallback(async (date) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/operation-log?date=${date}`)
      const data = await res.json()
      const isNew = data._isNewDay || data._isEmpty

      if (isNew) {
        // New day — pre-fill from previous but reset today's loading inputs
        const base = { ...EMPTY_FORM, ...data }
        delete base._isNewDay; delete base._isEmpty
        setFormData(base)
        // Previous cumulative = last record's stored values
        setPrevCumT401(parseFloat(data.u93TotalLoadingT401) || 0)
        setPrevCumT402(parseFloat(data.u93TotalLoadingT402) || 0)
        setTodayLoadT401('')
        setTodayLoadT402('')
        setIsToday(true)
      } else if (data && !data._isEmpty) {
        setFormData({ ...EMPTY_FORM, ...data })
        if (date === today) {
          // Editing today's existing record — fetch prev day for cumulative base
          const prevDate = new Date(new Date(date).getTime() - 86400000)
          const prevStr = new Date(prevDate.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
          const prevRes = await fetch(`/api/operation-log?date=${prevStr}`)
          const prevData = await prevRes.json()
          setPrevCumT401(parseFloat(prevData.u93TotalLoadingT401) || 0)
          setPrevCumT402(parseFloat(prevData.u93TotalLoadingT402) || 0)
          // today's addition = stored - prev
          const storedT401 = parseFloat(data.u93TotalLoadingT401) || 0
          const storedT402 = parseFloat(data.u93TotalLoadingT402) || 0
          setTodayLoadT401((storedT401 - (parseFloat(prevData.u93TotalLoadingT401) || 0)).toFixed(3))
          setTodayLoadT402((storedT402 - (parseFloat(prevData.u93TotalLoadingT402) || 0)).toFixed(3))
          setIsToday(true)
        } else {
          // Past date — show stored cumulative, frozen
          setIsToday(false)
          setTodayLoadT401('')
          setTodayLoadT402('')
        }
      } else {
        setFormData(EMPTY_FORM)
        setIsToday(date === today)
      }
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', msg: 'Failed to load data.' })
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => { loadDate(today) }, [loadDate, today])

  useEffect(() => {
    fetch('/api/operation-log/highlights')
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setHighlights(data) : setHighlights([]))
      .catch(() => setHighlights([]))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDateLoad = () => {
    if (selectedDate) loadDate(selectedDate)
  }

  const handleSave = async () => {
    setSaving(true)
    setStatus({ type: '', msg: '' })
    try {
      // For today, calculate new cumulative and embed in payload
      const payload = { ...formData, date: selectedDate, highlights }
      if (isToday) {
        payload.u93TotalLoadingT401 = newCumT401
        payload.u93TotalLoadingT402 = newCumT402
      }

      const res = await fetch('/api/operation-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to save')
      setStatus({ type: 'success', msg: `Log for ${selectedDate} published successfully!` })
      setTimeout(() => setStatus({ type: '', msg: '' }), 6000)
      // Refresh form to get stored values
      loadDate(selectedDate)
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', msg: 'Error saving data.' })
    } finally {
      setSaving(false)
    }
  }

  // ── Highlights handlers ──────────────────────────────────
  const addHighlight = async () => {
    if (!newHighlight.trim()) return
    setHlLoading(true)
    try {
      const res = await fetch('/api/operation-log/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newHighlight })
      })
      const data = await res.json()
      if (Array.isArray(data)) { setHighlights(data); setNewHighlight('') }
    } catch (err) { console.error(err) } finally { setHlLoading(false) }
  }

  const toggleDone = async (id, current) => {
    try {
      const res = await fetch('/api/operation-log/highlights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, done: !current })
      })
      const data = await res.json()
      if (Array.isArray(data)) setHighlights(data)
    } catch (err) { console.error(err) }
  }

  const saveEdit = async (id) => {
    if (!editingText.trim()) return
    try {
      const res = await fetch('/api/operation-log/highlights', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text: editingText })
      })
      const data = await res.json()
      if (Array.isArray(data)) { setHighlights(data); setEditingId(null) }
    } catch (err) { console.error(err) }
  }

  const deleteHighlight = async (id) => {
    try {
      const res = await fetch(`/api/operation-log/highlights?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (Array.isArray(data)) setHighlights(data)
    } catch (err) { console.error(err) }
  }

  const handleExport = () => {
    const f = formData
    const dateFormatted = formatIndonesianDate(selectedDate)
    const monthName = getMonthNameIndonesian(selectedDate)

    const u91Pct = f.u91Feed ? ((parseFloat(f.u91Feed) / 600) * 100).toFixed(2) : 0
    const u92Pct = f.u92Feed ? ((parseFloat(f.u92Feed) / 506) * 100).toFixed(2) : 0
    const u93Pct = f.u93Feed ? ((parseFloat(f.u93Feed) / 84) * 100).toFixed(2) : 0
    const u47Pct = u47Feed ? ((u47Feed / 167) * 100).toFixed(2) : 0
    const u166Pct = f.u166Feed ? ((parseFloat(f.u166Feed) / 76) * 100).toFixed(2) : 0

    // In template: sulfur from todayLoadT401 & todayLoadT402 (or 0 if not today)
    const sulfurProduced = isToday
      ? (parseFloat(todayLoadT401) || 0) + (parseFloat(todayLoadT402) || 0)
      : (parseFloat(newCumT401) || 0) + (parseFloat(newCumT402) || 0) - (prevCumT401 + prevCumT402)

    const text = `*LAPORAN OPERASI SRU & IPAL*
*${dateFormatted}*

*SUMMARY*
*1. Aktual Kapasitas vs Desain*
- Unit 91 (GTU) :  ${f.u91Feed || 0} T/D vs 600 T/D (${u91Pct} %)
- Unit 92 (LPG) : ${f.u92Feed || 0}  T/D vs 506 T/D (${u92Pct} %)
- Unit 93 (SRU) :  ${f.u93Feed || 0} T/D vs 84 T/D (${u93Pct} %)
- Unit 94 (TGU) : 0 T/D vs 171 T/D (0 %)
- Unit 47 (IPAL) : ${u47Feed.toFixed(1)} m3/h vs 167 m3/h (${u47Pct} %)
- Unit 166 (WWT) :  ${f.u166Feed || 0} m3/h vs 76 m3/h (${u166Pct} %)

*2. Produk Utama*
- Fuel gas :  ${(parseFloat(f.u91TreatedGasToFGS) || 0) + (parseFloat(f.u92FuelGas) || 0)} T/D
- LPG to 47T-103 : ${f.u92LpgTo47T103 || 0} T/D	
- Sulfur :  ${sulfurProduced.toFixed(2)} T/D
*3. Top Priority Equipment Issue*

*DETAIL KONDISI UNIT*
*UNIT 90 - COMMON FACILITIES*
${f.u90Condition?.toUpperCase()}
 
*UNIT 91 - GAS TREATING UNIT*
${f.u91Condition?.toUpperCase()}
Feed : ${f.u91Feed || 0} T/D (${u91Pct} %)
Amine Strenght : ${f.u91AmineStrength || 0} %
Amine Inventory :  ${f.u91AmineInventory || 0} M³
Produksi :
- Acid gas to SRU : ${f.u91AcidGasToSRU || 0} T/D
- Acid gas to Flare : ${f.u91AcidGasToFlare || 0} T/D
- Treated gas to LPG Rec : ${f.u91TreatedGasToLPG || 0} T/D
- Treated gas to FGS  : ${f.u91TreatedGasToFGS || 0} T/D
- Liquid Condensate to SWS : ${f.u91LiquidCondensateToSWS || 0} T/D

*UNIT 92 - LPG RECOVERY UNIT*
${f.u92Condition?.toUpperCase()}${f.u92Condition === 'Idle' ? ' (PSSR in progress)' : ''} 
Feed : ${f.u92Feed || 0} T/D (${u92Pct} %)
Produksi :
- Fuel Gas  : ${f.u92FuelGas || 0} T/D
- LPG to 47T-103 : ${f.u92LpgTo47T103 || 0} T/D
- Condensate : ${f.u92Condensate || 0} T/D

*UNIT 93 - SULPHUR RECOVERY UNIT*
${f.u93Condition?.toUpperCase()} 
Feed : ${f.u93Feed || 0}  T/D (${u93Pct} %)
Fuel Gas to 93 : ${f.u93FuelGasTo93 || 0} T/D
Produksi : ${sulfurProduced.toFixed(2)} Ton
- Level Midband 93T-401 = ${f.u93T401LevelMm || 0} mm (${t401Ton.toFixed(2)} Ton)
- Level Midband 93T-402 = ${f.u93T402LevelMm || 0} mm (${t402Ton.toFixed(2)} Ton)
- Total Net stock sulfur = ${t401Ton.toFixed(2)} + ${t402Ton.toFixed(2)} – 60 ton = ${netStockSulfur.toFixed(2)} Ton
- Total Loading Sulfur ex. 93T-401 bulan ${monthName} : ${newCumT401 || 0} Ton 
- Total Loading Sulfur ex. 93T-402 bulan ${monthName} : ${newCumT402 || 0} Ton

*UNIT 94 - TAIL GAS UNIT*
${f.u94Condition?.toUpperCase()}
Temp. Thermox : ${f.u94TempThermox || 0} degC

*UNIT 95 - REFRIGERANT SYSTEM*
${f.u95Condition?.toUpperCase()}

*UNIT 47 - IPAL*
${f.u47Condition?.toUpperCase()}
Feed : ${u47Feed.toFixed(1)} m3/h (${u47Pct} %)
- DAF A : ${f.u47FlowDafA || 0} m3/h
- DAF B : ${f.u47FlowDafB || 0} m3/h
SWS ex feed FOC I/II : ${f.u47SwsFeed || 0} m3/h
Desalter ex FOC I/II : ${f.u47DesalterFeed || 0} m3/h  
Recovery :
- Slop Oil to 43T-3/4 : ${f.u47SlopOilTo43T || 0} Ton/day 
- Clean Water to HB  : ${f.u47CleanWaterToHB || 0} m3/h
  
Analisa          pH                               MLSS
- Aerasi A :   ${f.u47AerationAph || '-'}	      	      ${f.u47AerationAmlss || '-'}
- Aerasi B :   ${f.u47AerationBph || '-'}                                ${f.u47AerationBmlss || '-'}

TSP to Aerasi AB : ${f.u47ChemTsp || 0} Kg
Caustic to Aerasi AB : ${f.u47ChemCaustic || 0} Kg
SoBi to Aerasi AB : ${f.u47ChemSobi || 0} Kg

*UNIT 166 – WWTP*
${f.u166Condition?.toUpperCase()}
Feed : ${f.u166Feed || 0} m3/h (${u166Pct} %)
Aerasi PIT :
- pH : ${f.u166AerationPh || '-'}
- MLSS : ${f.u166AerationMlss || '-'}
TSP to Aerasi : ${f.u166ChemTsp || 0} Kg
Caustic to Aerasi : ${f.u166ChemCaustic || 0} Kg
SoBi to Aerasi :  ${f.u166ChemSobi || 0} Kg

*ANALISA LAB CLEAN WATER*
                      DESAIN     WWTP		IPAL        
                        (mg/L)   	 (mg/L)        	(mg/L)
- pH                  6 – 9	    ${f.cwWwtPh || '-'}		${f.cwIpalPh || '-'}	          
- COD              < 100	    ${f.cwWwtCod || '-'}		${f.cwIpalCod || '-'}	          
- Oil Content  < 5	    ${f.cwWwtOil || '-'}	             ${f.cwIpalOil || '-'}         
- Phenol          < 0.5 	    ${f.cwWwtPhenol || '-'}   	${f.cwIpalPhenol || '-'}      
- Ammonia     < 5 	    ${f.cwWwtAmmonia || '-'}    		 ${f.cwIpalAmmonia || '-'}        

*ANALISA LAB FEED WWT*
                                        (mg/L)
- pH                                    ${f.u166FeedPh || '-'}
- TSS                	                 ${f.u166FeedTss || '-'}
- COD 		                  ${f.u166FeedCod || '-'}
- Oil Content 	                   ${f.u166FeedOil || '-'}
- Ammonia outlet DAF      ${f.u166FeedAmmoniaOutlet || '-'}
 
*KONDISI CPI :*
- AOC SRU level ${f.cpiAocSruLevel || 0} % : 90P-406 AB Auto
- 47T-501 level  ${f.cpi47T501Level || 0} % : 47P-503A Auto
- 166PIT-505 level ${f.cpi166Pit505Level || 0} % : 166P-511 ABC Auto

*UNIT HOLDING BASIN - Area 49 & 66*
- HB 49 : ${f.hb49Condition}
- HB 66 Timur : ${f.hb66TimurCondition}
- Aeration Timur : ${f.aerationTimurCondition}
- HB 66 Barat : ${f.hb66BaratCondition}
- Aeration Barat :  ${f.aerationBaratCondition}
- Second Trap. : ${f.secondTrapCondition}
- Sumpit 49   : ${f.sumpit49Level || 0} %
- Sumpit 66   :  ${f.sumpit66Level || 0} %
- Sumpit 301 : ${f.sumpit301Level || 0} %
HIGHLIGHT
${highlights.map(h => `• ${h.text}`).join('\n')}
`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Laporan_Operasi_SRU_IPAL_${selectedDate}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={20} className="spin" />
        <span>Loading operation log...</span>
      </div>
    )
  }

  return (
    <>
      {/* ── Page Header ─────────────────────────────────── */}
      <div className={sharedStyles.header}>
        <div className={sharedStyles.deptBlock}>
          <div className={sharedStyles.deptTag}>
            <div className={sharedStyles.deptTagDot}></div>
            <span className={sharedStyles.deptTagText}>DAILY LOG CONTROLLER</span>
          </div>
          <div>
            <div className={sharedStyles.deptTitle}><span>Operations Control Panel</span></div>
            <div className={sharedStyles.deptCompany}>Input daily operational data for all SRU units</div>
          </div>

        </div>
      </div>

      {/* ── Date Selector & Publish ──────────────────────── */}
      <div className={styles.actionBar}>
        <div className={styles.dateSelectorRow}>
          <CalendarDays size={16} className={styles.calIcon} />
          <input
            type="date"
            className={styles.dateInput}
            value={selectedDate}
            max={today}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <button className={styles.loadBtn} onClick={handleDateLoad}>Load</button>
          {selectedDate === today && <span className={styles.todayBadge}>TODAY</span>}
          {selectedDate !== today && <span className={styles.pastBadge}>PAST DATE — VIEW ONLY CUMULATIVE</span>}
        </div>
        <div className={styles.publishCol}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={styles.exportBtn} onClick={handleExport}>
              <Download size={16} />
              EXPORT TXT
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              {saving ? 'SAVING...' : 'PUBLISH CHANGES'}
            </button>
          </div>
          {status.msg && (
            <div className={`${styles.statusMessage} ${status.type === 'error' ? styles.errorMessage : ''}`}>
              {status.type === 'success'
                ? <CheckCircle2 size={12} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
                : <AlertCircle size={12} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />}
              {status.msg}
            </div>
          )}
        </div>
      </div>

      <div className={styles.formContainer}>

        {/* ══════════════════════════════════════════════════
            UNIT 90
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle unit="90" label="Common Facilities" />
          <div className={styles.fieldGrid}>
            <Field label="Condition">
              <Select name="u90Condition" value={formData.u90Condition} onChange={handleChange} options={CONDITION_STD} />
            </Field>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            UNIT 91
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle unit="91" label="Gas Treating Unit" />
          <div className={styles.fieldGrid}>
            <Field label="Condition">
              <Select name="u91Condition" value={formData.u91Condition} onChange={handleChange} options={CONDITION_STD} />
            </Field>
            <FeedField label="Feed (ton/day)" name="u91Feed" value={formData.u91Feed} onChange={handleChange} normal={600} />
            <Field label="Amine Strength (%)">
              <Input name="u91AmineStrength" value={formData.u91AmineStrength} onChange={handleChange} placeholder="%" />
            </Field>
            <Field label="Amine Inventory (m³)">
              <Input name="u91AmineInventory" value={formData.u91AmineInventory} onChange={handleChange} placeholder="m³" />
            </Field>
          </div>

          <SubTitle label="Production" />
          <div className={styles.fieldGrid}>
            <Field label="Acid Gas to SRU (ton/day)">
              <Input name="u91AcidGasToSRU" value={formData.u91AcidGasToSRU} onChange={handleChange} />
            </Field>
            <Field label="Acid Gas to Flare (ton/day)">
              <Input name="u91AcidGasToFlare" value={formData.u91AcidGasToFlare} onChange={handleChange} />
            </Field>
            <Field label="Treated Gas to LPG (ton/day)">
              <Input name="u91TreatedGasToLPG" value={formData.u91TreatedGasToLPG} onChange={handleChange} />
            </Field>
            <Field label="Treated Gas to FGS (ton/day)">
              <Input name="u91TreatedGasToFGS" value={formData.u91TreatedGasToFGS} onChange={handleChange} />
            </Field>
            <Field label="Liquid Condensate to SWS (ton/day)">
              <Input name="u91LiquidCondensateToSWS" value={formData.u91LiquidCondensateToSWS} onChange={handleChange} />
            </Field>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            UNIT 92
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle unit="92" label="LPG Recovery Unit" />
          <div className={styles.fieldGrid}>
            <Field label="Condition">
              <Select name="u92Condition" value={formData.u92Condition} onChange={handleChange} options={CONDITION_STD} />
            </Field>
            <FeedField label="Feed (ton/day)" name="u92Feed" value={formData.u92Feed} onChange={handleChange} normal={506} />
          </div>

          <SubTitle label="Production" />
          <div className={styles.fieldGrid}>
            <Field label="Fuel Gas (ton/day)">
              <Input name="u92FuelGas" value={formData.u92FuelGas} onChange={handleChange} />
            </Field>
            <Field label="LPG to 47T-103 (ton/day)">
              <Input name="u92LpgTo47T103" value={formData.u92LpgTo47T103} onChange={handleChange} />
            </Field>
            <Field label="Condensate (ton/day)">
              <Input name="u92Condensate" value={formData.u92Condensate} onChange={handleChange} />
            </Field>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            UNIT 93
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle unit="93" label="Sulfur Recovery Unit" />
          <div className={styles.fieldGrid}>
            <Field label="Condition">
              <Select name="u93Condition" value={formData.u93Condition} onChange={handleChange} options={CONDITION_STD} />
            </Field>
            <FeedField label="Feed (ton/day)" name="u93Feed" value={formData.u93Feed} onChange={handleChange} normal={84} />
            <Field label="Fuel Gas to 93">
              <Input name="u93FuelGasTo93" value={formData.u93FuelGasTo93} onChange={handleChange} />
            </Field>
          </div>

          <SubTitle label="Production" />
          <div className={styles.fieldGrid}>
            <Field label="93T-401 Level (mm)">
              <Input name="u93T401LevelMm" value={formData.u93T401LevelMm} onChange={handleChange} placeholder="mm" />
              <span className={styles.autoHint}>= {t401Ton.toFixed(4)} ton</span>
            </Field>
            <Field label="93T-402 Level (mm)">
              <Input name="u93T402LevelMm" value={formData.u93T402LevelMm} onChange={handleChange} placeholder="mm" />
              <span className={styles.autoHint}>= {t402Ton.toFixed(4)} ton</span>
            </Field>
            <Field label="Net Stock Sulfur (ton)">
              <Input value={netStockSulfur.toFixed(4)} readOnly />
              <span className={styles.autoHint}>T401 + T402 − 60 ton</span>
            </Field>
          </div>

          <SubTitle label="Total Loading Sulfur This Month" />
          <div className={styles.fieldGrid}>
            {isToday ? (
              <>
                <Field label="Today's Loading from 93T-401 (ton)">
                  <Input
                    value={todayLoadT401}
                    onChange={e => setTodayLoadT401(e.target.value)}
                    placeholder="today's addition"
                  />
                  <span className={styles.autoHint}>
                    Prev: {prevCumT401.toFixed(3)} + today = <strong>{newCumT401}</strong> ton
                  </span>
                </Field>
                <Field label="Today's Loading from 93T-402 (ton)">
                  <Input
                    value={todayLoadT402}
                    onChange={e => setTodayLoadT402(e.target.value)}
                    placeholder="today's addition"
                  />
                  <span className={styles.autoHint}>
                    Prev: {prevCumT402.toFixed(3)} + today = <strong>{newCumT402}</strong> ton
                  </span>
                </Field>
              </>
            ) : (
              <>
                <Field label="Cumulative Loading from 93T-401 (ton)">
                  <Input value={formData.u93TotalLoadingT401} readOnly />
                </Field>
                <Field label="Cumulative Loading from 93T-402 (ton)">
                  <Input value={formData.u93TotalLoadingT402} readOnly />
                </Field>
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            UNIT 94
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle unit="94" label="Tail Gas Unit" />
          <div className={styles.fieldGrid}>
            <Field label="Condition">
              <Select name="u94Condition" value={formData.u94Condition} onChange={handleChange} options={CONDITION_U94} />
            </Field>
            <Field label="Temperature Thermox (°C)">
              <Input name="u94TempThermox" value={formData.u94TempThermox} onChange={handleChange} placeholder="°C" />
            </Field>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            UNIT 95
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle unit="95" label="Refrigeration System" />
          <div className={styles.fieldGrid}>
            <Field label="Condition">
              <Select name="u95Condition" value={formData.u95Condition} onChange={handleChange} options={CONDITION_STD} />
            </Field>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            UNIT 47 IPAL
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle unit="47 IPAL" label="Instalasi Pengolahan Air Limbah" />
          <div className={styles.fieldGrid}>
            <Field label="Condition">
              <Select name="u47Condition" value={formData.u47Condition} onChange={handleChange} options={CONDITION_STD} />
            </Field>
            <Field label="Flow DAF A (m³/hr)">
              <Input name="u47FlowDafA" value={formData.u47FlowDafA} onChange={handleChange} placeholder="m³/hr" />
            </Field>
            <Field label="Flow DAF B (m³/hr)">
              <Input name="u47FlowDafB" value={formData.u47FlowDafB} onChange={handleChange} placeholder="m³/hr" />
            </Field>
            <Field label="SWS Feed (m³/hr)">
              <Input name="u47SwsFeed" value={formData.u47SwsFeed} onChange={handleChange} placeholder="m³/hr" />
            </Field>
            <Field label="Desalter Feed (m³/hr)">
              <Input name="u47DesalterFeed" value={formData.u47DesalterFeed} onChange={handleChange} placeholder="m³/hr" />
            </Field>
            <div className={styles.field}>
              <label className={styles.label}>Feed (m³/hr) — Auto</label>
              <div className={styles.feedRow}>
                <input className={`${styles.input} ${styles.autoField}`} value={u47Feed.toFixed(2)} readOnly />
                {u47FeedPct !== null && (
                  <span className={`${styles.percentBadge} ${parseFloat(u47FeedPct) > 100 ? styles.percentOver : ''}`}>
                    {u47FeedPct}%
                  </span>
                )}
              </div>
              <span className={styles.autoHint}>SWS + Desalter · normal: 167 m³/hr</span>
            </div>
          </div>

          <SubTitle label="Recovery" />
          <div className={styles.fieldGrid}>
            <Field label="Slop Oil to 43T-3/4 (ton/day)">
              <Input name="u47SlopOilTo43T" value={formData.u47SlopOilTo43T} onChange={handleChange} />
            </Field>
            <Field label="Clean Water to HB (m³/hr)">
              <Input name="u47CleanWaterToHB" value={formData.u47CleanWaterToHB} onChange={handleChange} />
            </Field>
          </div>

          <SubTitle label="Aeration Sample Analysis" />
          <table className={styles.analysisTable}>
            <thead>
              <tr>
                <th></th>
                <th>pH</th>
                <th>MLSS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.rowLabel}>Aeration A</td>
                <td><input className={styles.tableInput} name="u47AerationAph" value={formData.u47AerationAph ?? ''} onChange={handleChange} /></td>
                <td><input className={styles.tableInput} name="u47AerationAmlss" value={formData.u47AerationAmlss ?? ''} onChange={handleChange} /></td>
              </tr>
              <tr>
                <td className={styles.rowLabel}>Aeration B</td>
                <td><input className={styles.tableInput} name="u47AerationBph" value={formData.u47AerationBph ?? ''} onChange={handleChange} /></td>
                <td><input className={styles.tableInput} name="u47AerationBmlss" value={formData.u47AerationBmlss ?? ''} onChange={handleChange} /></td>
              </tr>
            </tbody>
          </table>

          <SubTitle label="Chemical" />
          <div className={styles.fieldGrid}>
            <Field label="TSP (kg)"><Input name="u47ChemTsp" value={formData.u47ChemTsp} onChange={handleChange} /></Field>
            <Field label="Caustic (kg)"><Input name="u47ChemCaustic" value={formData.u47ChemCaustic} onChange={handleChange} /></Field>
            <Field label="SoBi (kg)"><Input name="u47ChemSobi" value={formData.u47ChemSobi} onChange={handleChange} /></Field>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            UNIT 166 WWTP
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle unit="166 WWTP" label="Waste Water Treatment" />
          <div className={styles.fieldGrid}>
            <Field label="Condition">
              <Select name="u166Condition" value={formData.u166Condition} onChange={handleChange} options={CONDITION_STD} />
            </Field>
            <FeedField label="Feed (m³/hr)" name="u166Feed" value={formData.u166Feed} onChange={handleChange} normal={76} unit="m³/hr" />
          </div>

          <SubTitle label="Aeration Analysis" />
          <table className={styles.analysisTable}>
            <thead>
              <tr>
                <th></th>
                <th>pH</th>
                <th>MLSS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.rowLabel}>Aeration</td>
                <td><input className={styles.tableInput} name="u166AerationPh" value={formData.u166AerationPh ?? ''} onChange={handleChange} /></td>
                <td><input className={styles.tableInput} name="u166AerationMlss" value={formData.u166AerationMlss ?? ''} onChange={handleChange} /></td>
              </tr>
            </tbody>
          </table>

          <SubTitle label="Chemical" />
          <div className={styles.fieldGrid}>
            <Field label="TSP (kg)"><Input name="u166ChemTsp" value={formData.u166ChemTsp} onChange={handleChange} /></Field>
            <Field label="Caustic (kg)"><Input name="u166ChemCaustic" value={formData.u166ChemCaustic} onChange={handleChange} /></Field>
            <Field label="SoBi (kg)"><Input name="u166ChemSobi" value={formData.u166ChemSobi} onChange={handleChange} /></Field>
          </div>

          <SubTitle label="Feed Analysis" />
          <div className={styles.fieldGrid}>
            <Field label="pH"><Input name="u166FeedPh" value={formData.u166FeedPh} onChange={handleChange} /></Field>
            <Field label="TSS"><Input name="u166FeedTss" value={formData.u166FeedTss} onChange={handleChange} /></Field>
            <Field label="COD"><Input name="u166FeedCod" value={formData.u166FeedCod} onChange={handleChange} /></Field>
            <Field label="Oil Content"><Input name="u166FeedOil" value={formData.u166FeedOil} onChange={handleChange} /></Field>
            <Field label="Ammonia Outlet DAF"><Input name="u166FeedAmmoniaOutlet" value={formData.u166FeedAmmoniaOutlet} onChange={handleChange} /></Field>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            CLEAN WATER ANALYSIS
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle label="Clean Water Analysis" />
          <table className={`${styles.analysisTable} ${styles.wideTable}`}>
            <thead>
              <tr>
                <th>Parameter</th>
                <th className={styles.designCol}>Design (Standard)</th>
                <th>WWTP</th>
                <th>IPAL</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'pH', wwtName: 'cwWwtPh', ipalName: 'cwIpalPh' },
                { label: 'COD', wwtName: 'cwWwtCod', ipalName: 'cwIpalCod' },
                { label: 'Oil Content', wwtName: 'cwWwtOil', ipalName: 'cwIpalOil' },
                { label: 'Phenol', wwtName: 'cwWwtPhenol', ipalName: 'cwIpalPhenol' },
                { label: 'Ammonia', wwtName: 'cwWwtAmmonia', ipalName: 'cwIpalAmmonia' },
              ].map(row => (
                <tr key={row.label}>
                  <td className={styles.rowLabel}>{row.label}</td>
                  <td className={styles.designCol}>{CW_DESIGN[row.label]}</td>
                  <td><input className={styles.tableInput} name={row.wwtName} value={formData[row.wwtName] ?? ''} onChange={handleChange} /></td>
                  <td><input className={styles.tableInput} name={row.ipalName} value={formData[row.ipalName] ?? ''} onChange={handleChange} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ══════════════════════════════════════════════════
            CPI CONDITION
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle label="CPI Condition" />
          <div className={styles.fieldGrid}>
            <Field label="AOC SRU Level (%)">
              <Input name="cpiAocSruLevel" value={formData.cpiAocSruLevel} onChange={handleChange} placeholder="%" />
            </Field>
            <Field label="47T-501 Level (%)">
              <Input name="cpi47T501Level" value={formData.cpi47T501Level} onChange={handleChange} placeholder="%" />
            </Field>
            <Field label="166PIT-505 Level (%)">
              <Input name="cpi166Pit505Level" value={formData.cpi166Pit505Level} onChange={handleChange} placeholder="%" />
            </Field>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            HB 49/66
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle unit="HB 49/66" label="Holding Basin" />
          <div className={styles.fieldGrid}>
            <Field label="HB 49 Condition">
              <Select name="hb49Condition" value={formData.hb49Condition} onChange={handleChange} options={CONDITION_HB} />
            </Field>
            <Field label="HB 66 Timur Condition">
              <Select name="hb66TimurCondition" value={formData.hb66TimurCondition} onChange={handleChange} options={CONDITION_HB} />
            </Field>
            <Field label="Aeration Timur Condition">
              <Select name="aerationTimurCondition" value={formData.aerationTimurCondition} onChange={handleChange} options={CONDITION_HB} />
            </Field>
            <Field label="HB 66 Barat Condition">
              <Select name="hb66BaratCondition" value={formData.hb66BaratCondition} onChange={handleChange} options={CONDITION_HB} />
            </Field>
            <Field label="Aeration Barat Condition">
              <Select name="aerationBaratCondition" value={formData.aerationBaratCondition} onChange={handleChange} options={CONDITION_HB} />
            </Field>
            <Field label="Second Trap Condition">
              <Select name="secondTrapCondition" value={formData.secondTrapCondition} onChange={handleChange} options={CONDITION_HB} />
            </Field>
            <Field label="Sumpit 49 Level (%)">
              <Input name="sumpit49Level" value={formData.sumpit49Level} onChange={handleChange} placeholder="%" />
            </Field>
            <Field label="Sumpit 66 Level (%)">
              <Input name="sumpit66Level" value={formData.sumpit66Level} onChange={handleChange} placeholder="%" />
            </Field>
            <Field label="Sumpit 301 Level (%)">
              <Input name="sumpit301Level" value={formData.sumpit301Level} onChange={handleChange} placeholder="%" />
            </Field>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            HIGHLIGHTS
        ══════════════════════════════════════════════════ */}
        <div className={styles.sectionGroup}>
          <SectionTitle label="Highlights" />
          <p className={styles.highlightDesc}>Persistent notes — saved across daily submissions.</p>

          {/* Add new */}
          <div className={styles.addHighlightRow}>
            <input
              className={styles.input}
              placeholder="Add a new highlight or note..."
              value={newHighlight}
              onChange={e => setNewHighlight(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHighlight()}
            />
            <button className={styles.addBtn} onClick={addHighlight} disabled={hlLoading || !newHighlight.trim()}>
              {hlLoading ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
              Add
            </button>
          </div>

          {/* List */}
          <div className={styles.highlightList}>
            {highlights.length === 0 && (
              <div className={styles.emptyHighlights}>No highlights yet. Add one above.</div>
            )}
            {highlights.map(h => (
              <div key={h.id} className={`${styles.highlightItem} ${h.done ? styles.highlightDone : ''}`}>
                <button className={styles.checkBtn} onClick={() => toggleDone(h.id, h.done)}>
                  {h.done ? <Check size={14} /> : <div className={styles.checkCircle} />}
                </button>

                {editingId === h.id ? (
                  <>
                    <input
                      className={`${styles.input} ${styles.editInput}`}
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(h.id); if (e.key === 'Escape') setEditingId(null) }}
                      autoFocus
                    />
                    <button className={styles.iconBtn} onClick={() => saveEdit(h.id)}><Check size={14} /></button>
                    <button className={styles.iconBtn} onClick={() => setEditingId(null)}><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <span className={styles.highlightText}>{h.text}</span>
                    <button className={styles.iconBtn} onClick={() => { setEditingId(h.id); setEditingText(h.text) }}>
                      <Pencil size={13} />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => deleteHighlight(h.id)}>
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
