"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import { workers } from './_data/workers'

function getDailyWorker() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now - start) / 86400000)
  return workers[dayOfYear % workers.length]
}

function Placeholder({ className, label }) {
  return (
    <div className={`${styles.placeholder} ${className || ''}`}>
      <span className={styles.placeholderText}>{label}</span>
    </div>
  )
}

const aboutCards = [
  {
    label: 'Our Facility',
    caption: 'State-of-the-art SRU plant with three Claus converter stages operating continuously to produce elemental sulfur at Cilacap Refinery.',
  },
  {
    label: 'Our People',
    caption: 'A dedicated team of engineers, operators, and technicians working around the clock in a 4-crew rotating shift system.',
  },
  {
    label: 'Our Process',
    caption: 'From raw H₂S to refined elemental sulfur — the modified Claus process at the heart of Pertamina\'s downstream operations since 1989.',
  },
]

const opsParams = [
  { label: 'Sulfur Production', value: '—', unit: 'ton', note: 'Daily target: 105 ton' },
  { label: 'Feed Gas Flow', value: '—', unit: 'MMSCFD', note: 'Normal: 1.2 – 1.8' },
  { label: 'Furnace Temp', value: '—', unit: '°C', note: '93F-401 Claus Furnace' },
  { label: 'SO₂ Tail Gas', value: '—', unit: 'ppm', note: 'ENV Limit: < 500 ppm' },
  { label: 'H₂S Conversion', value: '—', unit: '%', note: 'Target: > 98%' },
  { label: 'Active Crew', value: '—', unit: '', note: 'Current on-shift crew' },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState({})
  const [newsData, setNewsData] = useState([])
  const worker = getDailyWorker()

  // Ref for drag-to-scroll
  const scrollRef = useRef(null)
  const [isDown, setIsDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Drag handlers
  const onMouseDown = (e) => {
    if (!scrollRef.current) return
    setIsDown(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }
  const onMouseLeave = () => setIsDown(false)
  const onMouseUp = () => setIsDown(false)
  const onMouseMove = (e) => {
    if (!isDown || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNewsData(data.slice(0, 5)) // get latest 5 updates
        }
      })
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection observer for scroll-reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.landing}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <img src="/Hero.jpg" alt="SRU_Hero" className={styles.heroBg} />
        <div className={styles.heroOverlay} />

        <nav className={`${styles.heroNav} ${scrolled ? styles.heroNavScrolled : ''}`}>
          <Link href="/" className={styles.logoLink}>
            <img src="/SRU Logo CC.png" alt="SRU Logo" className={styles.navLogo} />
            <div className={styles.brandText}>SRU & IPAL</div>
          </Link>
          <div className={styles.heroCtas}>
            <Link href="/login" className={styles.ctaSecondary}>Admin Login</Link>
            <Link href="/dashboard" className={styles.ctaPrimary}>Enter Dashboard</Link>
          </div>
        </nav>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            PT Pertamina Patra Niaga · Cilacap Refinery · Est. 2004
          </div>
          <h1 className={styles.heroTitle}>
            Sulfur Recovery<br />Unit Operations
          </h1>
          <p className={styles.heroSub}>
            Real-time monitoring and centralized control<br />
            for Refinery Unit IV Cilacap.
          </p>
          <Link href="/dashboard" className={styles.heroBtn}>
            Enter Dashboard <span className={styles.heroBtnArrow}>→</span>
          </Link>
        </div>

        <div className={styles.scrollIndicator}>
          <span className={styles.scrollLabel}>EXPLORE</span>
          <div className={styles.scrollLine} />
        </div>
      </section>

      {/* ── ABOUT US ── */}
      <section
        id="about"
        data-reveal
        className={`${styles.section} ${visible['about'] ? styles.revealed : ''}`}
      >
        <div className={styles.sectionInner}>
          <div className={styles.labelRow}>
            <span className={styles.sectionTag}>ABOUT US</span>
            <div className={styles.labelLine} />
          </div>
          <h2 className={styles.sectionTitle}>Restoring Cilacap's Environments Since 2004</h2>
          <p className={styles.sectionSub}>
            The Sulfur Recovery Unit is at the heart of Refinery Unit IV's environmental and production
            operations, processing hydrogen sulfide into elemental sulfur safely and efficiently.
          </p>
          <div className={styles.aboutGrid}>
            {aboutCards.map((item, i) => (
              <div key={i} className={styles.aboutCard}>
                <Placeholder className={styles.aboutImg} label={item.label} />
                <p className={styles.aboutCaption}>{item.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section
        id="featured"
        data-reveal
        className={`${styles.section} ${styles.sectionDark} ${visible['featured'] ? styles.revealed : ''}`}
      >
        <div className={styles.sectionInner}>
          <div className={styles.labelRow}>
            <span className={styles.sectionTag}>FEATURED</span>
            <div className={styles.labelLine} />
          </div>
          <h2 className={styles.sectionTitle}>Latest Updates</h2>
        </div>
        <div 
          className={styles.featuredScroll}
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {newsData.length === 0 && <div style={{ color: 'var(--gray)', fontFamily: 'var(--font-dm-mono)' }}>No public news available.</div>}
          {newsData.map((item) => (
            <Link href={`/news/${item._id}`} key={item._id} className={styles.newsCard} draggable={false}>
              <Placeholder className={styles.newsCardImg} label={item.category} />
              <div className={styles.newsCardBody}>
                <span className={styles.newsDate}>{item.date}</span>
                <h3 className={styles.newsTitle}>{item.title}</h3>
                <p className={styles.newsExcerpt}>{item.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── OPERATIONS SUMMARY ── */}
      <section
        id="ops"
        data-reveal
        className={`${styles.section} ${visible['ops'] ? styles.revealed : ''}`}
      >
        <div className={styles.sectionInner}>
          <div className={styles.labelRow}>
            <span className={styles.sectionTag}>OPERATIONS SUMMARY</span>
            <div className={styles.labelLine} />
          </div>
          <h2 className={styles.sectionTitle}>Today's Overview</h2>
          <p className={styles.sectionSub}>
            Live operational parameters from the SRU plant floor. Data updated every shift.
          </p>
          <div className={styles.opsGrid}>
            {opsParams.map((p, i) => (
              <div key={i} className={styles.opsCard}>
                <div className={styles.opsLabel}>{p.label}</div>
                <div className={styles.opsValue}>
                  {p.value}
                  {p.unit && <span className={styles.opsUnit}>{p.unit}</span>}
                </div>
                <div className={styles.opsNote}>{p.note}</div>
              </div>
            ))}
          </div>
          <Link href="/dashboard" className={styles.opsLink}>
            View Full Operations Dashboard →
          </Link>
        </div>
      </section>

      {/* ── GET TO KNOW US ── */}
      <section
        id="people"
        data-reveal
        className={`${styles.section} ${styles.sectionDark} ${visible['people'] ? styles.revealed : ''}`}
      >
        <div className={styles.sectionInner}>
          <div className={styles.labelRow}>
            <span className={styles.sectionTag}>GET TO KNOW US</span>
            <div className={styles.labelLine} />
          </div>
          <div className={styles.peopleCard}>
            <div className={styles.peopleImgWrap}>
              <Placeholder className={styles.peopleImg} label={worker.name} />
              <div className={styles.peopleBadge}>Featured Today</div>
            </div>
            <div className={styles.peopleInfo}>
              <div className={styles.peopleMeta}>
                Crew {worker.crew} &nbsp;·&nbsp; {worker.years} Years of Service
              </div>
              <h2 className={styles.peopleName}>{worker.name}</h2>
              <div className={styles.peopleRole}>{worker.role}</div>
              <p className={styles.peopleBio}>{worker.bio}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <img src="/textLogoSRU.svg" alt="SRU Logo" className={styles.footerLogo} />
            <div className={styles.footerYear}>Est. 2004</div>
          </div>
          <div className={styles.footerInfo}>
            <div className={styles.footerTitle}>Sulfur Recovery Unit</div>
            <div className={styles.footerSub}>Refinery Unit IV Cilacap</div>
            <div className={styles.footerSub}>PT Pertamina Patra Niaga</div>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/dashboard" className={styles.footerLink}>Dashboard</Link>
            <Link href="/login" className={styles.footerLink}>Admin Login</Link>
            <Link href="/register" className={styles.footerLink}>Register</Link>
          </div>
        </div>
        <div className={styles.footerCopy}>
          © {new Date().getFullYear()} PT Pertamina Patra Niaga. All rights reserved.
        </div>
      </footer>

    </div>
  )
}
