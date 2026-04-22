"use client"
import { useState, useEffect } from "react"
import { Pencil, Trash2, Plus } from "lucide-react"
import sharedStyles from "../shared.module.css"

export default function NewsManagement() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    category: "Update",
    date: "",
    content: ""
  })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news")
      if (res.ok) {
        const data = await res.json()
        setNews(data)
      }
    } catch (err) {
      console.error("Failed to fetch news", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEdit = (article) => {
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      date: article.date,
      content: article.content
    })
    setEditingId(article._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this news article?")) return

    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" })
      if (res.ok) fetchNews()
      else alert("Failed to delete article")
    } catch (err) {
      alert("Network error deleting article")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const url = editingId ? `/api/news/${editingId}` : "/api/news"
    const method = editingId ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({ title: "", excerpt: "", category: "Update", date: "", content: "" })
        setEditingId(null)
        setShowForm(false)
        fetchNews()
      } else {
        alert("Failed to save news article.")
      }
    } catch (err) {
      alert("Network error saving news article.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className={sharedStyles.header}>
        <div className={sharedStyles.deptBlock}>
          <div className={sharedStyles.deptTag}>
            <div className={sharedStyles.deptTagDot}></div>
            <span className={sharedStyles.deptTagText}>Media & communications</span>
          </div>
          <div className={sharedStyles.deptTitle}><span>News Management</span></div>
          <div className={sharedStyles.deptCompany}>SRU · IPAL · WWT</div>
        </div>
      </div>

      <div style={{ padding: "0 20px 80px" }}>

        {/* Toggle Form Button */}
        <button
          onClick={() => {
            if (showForm) {
              setFormData({ title: "", excerpt: "", category: "Update", date: "", content: "" })
              setEditingId(null)
            }
            setShowForm(!showForm)
          }}
          style={{ width: "100%", padding: "12px", background: showForm ? "rgba(245,200,0,0.08)" : "var(--black2)", color: showForm ? "var(--yellow)" : "var(--gray)", border: `1px solid ${showForm ? "rgba(245,200,0,0.3)" : "var(--gray2)"}`, borderRadius: "10px", fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", transition: "0.2s", marginBottom: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
        >
          {showForm ? "✕ Cancel" : <><Plus size={14} /> Add New Article</>}
        </button>

        {/* Editor Form */}
        <div style={{ maxHeight: showForm ? "800px" : "0", overflow: "hidden", transition: "max-height 0.4s ease-in-out" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--black2)", border: "1px solid var(--gray2)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase" }}>Article Title</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="Write a title here..." style={{ background: "#111", color: "var(--white)", border: "1px solid var(--gray2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "var(--font-jakarta)" }} />
              </div>

              <div style={{ flex: "1 1 150px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase" }}>Date</label>
                <input type="date" name="date" required value={formData.date} onChange={handleInputChange} onClick={(e) => e.target.showPicker()} onFocus={(e) => e.target.showPicker()} style={{ background: "#111", color: "var(--gray)", border: "1px solid var(--gray2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "var(--font-jakarta)", cursor: "pointer" }} />
              </div>

              <div style={{ flex: "1 1 150px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase" }}>Category</label>
                <select name="category" required value={formData.category} onChange={handleInputChange} style={{ background: "#111", color: "var(--white)", border: "1px solid var(--gray2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", cursor: "pointer", appearance: "none" }}>
                  <option value="Update">Update</option>
                  <option value="Alert">Alert</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Project">Project</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
                <span>Caption</span>
                <span style={{ color: formData.excerpt.length > 200 ? "var(--danger)" : "var(--yellow)" }}>{formData.excerpt.length}/200</span>
              </label>
              <textarea name="excerpt" maxLength={200} required value={formData.excerpt} onChange={handleInputChange} placeholder="Write a caption here..." rows={2} style={{ background: "#111", color: "var(--white)", border: "1px solid var(--gray2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "var(--font-jakarta)", resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase" }}>Full Article Content (Plain Text Layout)</label>
              <textarea name="content" required value={formData.content} onChange={handleInputChange} placeholder="Write the full news article here..." rows={8} style={{ background: "#111", color: "var(--white)", border: "1px solid var(--gray2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "var(--font-jakarta)", resize: "vertical", whiteSpace: "pre-wrap" }} />
            </div>

            <button type="submit" disabled={saving} style={{ marginTop: "8px", padding: "12px", background: saving ? "var(--gray2)" : "var(--yellow)", color: "#000", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", fontFamily: "var(--font-jakarta)", cursor: saving ? "not-allowed" : "pointer", transition: "0.2s" }}>
              {saving ? "Saving..." : (editingId ? "Update Article" : "Publish Article")}
            </button>
          </form>
        </div>

        {/* News List */}
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--gray)", marginTop: "40px", fontFamily: "var(--font-dm-mono)" }}>Loading news...</div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {news.length === 0 && <div style={{ color: "var(--gray)", textAlign: "center", marginTop: "20px", fontFamily: "var(--font-jakarta)" }}>No news articles found.</div>}

            {news.map(article => (
              <div key={article._id} style={{ background: "var(--black2)", border: "1px solid var(--gray2)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "10px", color: "var(--yellow)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", marginBottom: "4px" }}>{article.date} · {article.category}</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--white)", fontFamily: "var(--font-jakarta)", marginBottom: "4px" }}>{article.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--gray)", fontFamily: "var(--font-jakarta)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.excerpt}</div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginLeft: "12px" }}>
                    <button onClick={() => handleEdit(article)} style={{ background: "transparent", border: "none", color: "var(--gray)", cursor: "pointer", padding: "4px", transition: "0.2s" }} title="Edit"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(article._id)} style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", padding: "4px", transition: "0.2s" }} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  )
}
