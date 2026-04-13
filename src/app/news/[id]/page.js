"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function NewsReaderPage() {
  const params = useParams()
  const { id } = params
  
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/news/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data._id) {
          setArticle(data)
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050505", color: "var(--gray)", fontFamily: "var(--font-dm-mono)" }}>
        Loading Article...
      </div>
    )
  }

  if (!article) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#050505", color: "var(--white)", fontFamily: "var(--font-jakarta)" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Article Not Found</h1>
        <Link href="/#featured" style={{ color: "var(--yellow)", textDecoration: "none", fontFamily: "var(--font-dm-mono)", fontSize: "14px" }}>← Return to Home</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "var(--white)" }}>
      {/* Navbar Minimalist */}
      <nav style={{ padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", background: "rgba(5, 5, 5, 0.9)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <img src="/SRU Logo CC.png" alt="SRU Logo" style={{ height: "32px", width: "32px", borderRadius: "50%", objectFit: "cover" }} />
          <div style={{ fontFamily: "var(--font-jakarta)", fontWeight: "700", fontSize: "16px", color: "var(--white)", letterSpacing: "0.05em" }}>SRU & IPAL</div>
        </Link>
        <Link href="/#featured" style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--gray)", textTransform: "uppercase", letterSpacing: "0.15em", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.target.style.color = "var(--yellow)"} onMouseOut={(e) => e.target.style.color = "var(--gray)"}>
          ← Back
        </Link>
      </nav>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 24px" }}>
        {/* Article Header */}
        <header style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            <span style={{ color: "var(--yellow)" }}>{article.date}</span>
            <span style={{ color: "var(--gray2)" }}>/</span>
            <span style={{ color: "var(--gray)" }}>{article.category}</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.02em", color: "var(--white)", marginBottom: "24px" }}>
            {article.title}
          </h1>
          <p style={{ fontFamily: "var(--font-jakarta)", fontSize: "18px", lineHeight: "1.6", color: "var(--gray)", paddingBottom: "32px", borderBottom: "1px solid var(--gray2)" }}>
            {article.excerpt}
          </p>
        </header>

        {/* Article Content */}
        <article style={{ fontFamily: "var(--font-jakarta)", fontSize: "16px", lineHeight: "1.8", color: "var(--white)", whiteSpace: "pre-wrap" }}>
          {article.content}
        </article>

      </main>

      {/* Basic Footer */}
      <footer style={{ padding: "40px 24px", borderTop: "1px solid var(--gray2)", textAlign: "center", marginTop: "40px" }}>
        <div style={{ fontFamily: "var(--font-dm-mono)", fontSize: "12px", color: "var(--gray)" }}>
          © {new Date().getFullYear()} PT Pertamina Patra Niaga.
        </div>
      </footer>
    </div>
  )
}
