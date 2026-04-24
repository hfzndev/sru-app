"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import styles from './page.module.css'

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
  { label: 'Sulfur Production', value: '--', unit: 'ton/day', note: 'Daily target: 8 ton' },
  { label: 'Sulfur Inventory', value: '--', unit: 'ton', note: 'Tank 93T-401 + 93T-402' },
  { label: 'Feed Capacity (U91)', value: '--', unit: '%', note: 'Normal: 100%' },
  { label: 'SRU Capacity (U93)', value: '--', unit: '%', note: 'Normal: 100%' },
  { label: 'IPAL Capacity', value: '--', unit: '%', note: 'Normal: 100%' },
  { label: 'Active Crew', value: '--', unit: 'people', note: 'On shift duty' },
]

export default function LandingPage() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState({})
  const [newsData, setNewsData] = useState([])
  const [featuredWorker, setFeaturedWorker] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)

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

    fetch('/api/employees/daily')
      .then(res => res.json())
      .then(data => {
        if (data) setFeaturedWorker(data)
      })
      .catch(err => console.error("Failed to load featured worker", err))

    fetch('/api/dashboard-data')
      .then(res => res.json())
      .then(data => setDashboardData(data))
      .catch(err => console.error("Failed to load dashboard data", err))
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {session && (
              <div className={styles.profileIcon}>
                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className={styles.heroCtas}>
              {session ? (
                <Link href="/dashboard" className={styles.ctaPrimary}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Enter Dashboard
                  </div>
                </Link>
              ) : (
                <>
                  <Link href="/dashboard" className={styles.ctaPrimary}>Enter Dashboard</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            PT Pertamina Patra Niaga · Cilacap Refinery · Est. 2004
          </div>
          <h1 className={styles.heroTitle}>
            SRU & IPAL<br />Online Dashboard
          </h1>
          <p className={styles.heroSub}>
            Online dashboard for real-time monitoring and online data center <br />
            and also for everyone who wants to know about SRU & IPAL.
          </p>
          <Link href="/dashboard" className={styles.heroBtn}>
            Explore <span className={styles.heroBtnArrow}>→</span>
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
          <p className={styles.sectionSub}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.</p>
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
          <h2 className={styles.sectionTitle}>Dashboard Overview</h2>
          {dashboardData?.updatedAt && (
            <p className={styles.opsDataStamp}>
              Data as of:{' '}
              {new Date(dashboardData.updatedAt).toLocaleDateString('id-ID', {
                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                timeZone: 'Asia/Jakarta',
              })}
            </p>
          )}
          <p className={styles.sectionSub}>
            Daily operational data summary from SRU & IPAL including production, efficiency, and emission data.
          </p>
          <div className={styles.opsGrid}>
            {(dashboardData ? [
              { label: 'Sulfur Production', value: dashboardData.sulfurProduction, unit: 'ton/day', note: 'Daily target: 8 ton' },
              { label: 'Sulfur Inventory', value: dashboardData.sulfurInventory, unit: 'ton', note: 'Tank 93T-401 + 93T-402' },
              { label: 'Feed Capacity (U91)', value: dashboardData.u91FeedGasCapacity, unit: '%', note: 'Normal: 100%' },
              { label: 'SRU Capacity (U93)', value: dashboardData.u93Capacity, unit: '%', note: 'Normal: 100%' },
              { label: 'IPAL Capacity', value: dashboardData.ipalCapacity, unit: '%', note: 'Normal: 100%' },
              { label: 'Active Crew', value: dashboardData.activeCrew, unit: 'people', note: 'On shift duty' },
            ] : opsParams).map((p, i) => (
              <div key={i} className={styles.opsCard}>
                <div className={styles.opsLabel}>{p.label}</div>
                <div className={styles.opsValue}>
                  {p.value || '--'}
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
          {featuredWorker ? (
            <div className={styles.peopleCard}>
              <div className={styles.peopleImgWrap}>
                {featuredWorker.imageBase64 ? (
                  <img src={featuredWorker.imageBase64} alt={featuredWorker.name} className={styles.peopleImg} style={{ objectFit: 'cover' }} />
                ) : (
                  <Placeholder className={styles.peopleImg} label={featuredWorker.name} />
                )}
                <div className={styles.peopleBadge}>Featured Today</div>
              </div>
              <div className={styles.peopleInfo}>
                <div className={styles.peopleMeta}>
                  Crew {featuredWorker.crew} &nbsp;·&nbsp; {featuredWorker.years} Years of Service
                </div>
                <h2 className={styles.peopleName}>{featuredWorker.name}</h2>
                <div className={styles.peopleRole}>{featuredWorker.role}</div>
                <p className={styles.peopleBio}>{featuredWorker.bio}</p>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--gray)', fontFamily: 'var(--font-dm-mono)' }}>No featured employee profile loaded.</div>
          )}
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
            {session ? (
              <button onClick={() => signOut()} className={styles.footerLink}>Logout</button>
            ) : (
              <>
                <Link href="/login" className={styles.footerLink}>Admin Login</Link>
                <Link href="/register" className={styles.footerLink}>Register</Link>
              </>
            )}
          </div>
        </div>
        <div className={styles.footerCopy}>
          © {new Date().getFullYear()} PT Pertamina Patra Niaga. All rights reserved.
        </div>
      </footer>

    </div>
  )
}
