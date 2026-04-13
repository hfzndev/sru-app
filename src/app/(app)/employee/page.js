"use client"
import { useState, useEffect, useRef } from "react"
import { Pencil, Trash2, Plus, UploadCloud } from "lucide-react"
import sharedStyles from "../shared.module.css"

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    crew: "A",
    role: "",
    years: 0,
    bio: "",
    imageBase64: ""
  })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  
  const fileInputRef = useRef(null)

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees")
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
    } catch (err) {
      console.error("Failed to fetch employees", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.name === 'years' ? parseInt(e.target.value) || 0 : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Limit to ~2MB just to be safe with Base64 JSON payloads
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large! Please select an image under 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({ ...formData, imageBase64: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const handleEdit = (emp) => {
    setFormData({
      name: emp.name,
      crew: emp.crew,
      role: emp.role,
      years: emp.years || 0,
      bio: emp.bio,
      imageBase64: emp.imageBase64 || ""
    })
    setEditingId(emp._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this operator's profile?")) return
    
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" })
      if (res.ok) fetchEmployees()
      else alert("Failed to delete employee")
    } catch (err) {
      alert("Network error deleting employee")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    const url = editingId ? `/api/employees/${editingId}` : "/api/employees"
    const method = editingId ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({ name: "", crew: "A", role: "", years: 0, bio: "", imageBase64: "" })
        if (fileInputRef.current) fileInputRef.current.value = ""
        setEditingId(null)
        setShowForm(false)
        fetchEmployees()
      } else {
        alert("Failed to save employee profile.")
      }
    } catch (err) {
      alert("Network error saving employee.")
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
            <span className={sharedStyles.deptTagText}>Human Resources</span>
          </div>
          <div className={sharedStyles.deptTitle}><span>Public Profiles</span></div>
          <div className={sharedStyles.deptCompany}>SRU · IPAL · WWT</div>
        </div>
      </div>

      <div style={{ padding: "0 20px 80px" }}>
        
        {/* Toggle Form Button */}
        <button
          onClick={() => {
            if (showForm) {
              setFormData({ name: "", crew: "A", role: "", years: 0, bio: "", imageBase64: "" })
              setEditingId(null)
            }
            setShowForm(!showForm)
          }}
          style={{ width: "100%", padding: "12px", background: showForm ? "rgba(245,200,0,0.08)" : "var(--black2)", color: showForm ? "var(--yellow)" : "var(--gray)", border: `1px solid ${showForm ? "rgba(245,200,0,0.3)" : "var(--gray2)"}`, borderRadius: "10px", fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", transition: "0.2s", marginBottom: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
        >
          {showForm ? "✕ Cancel" : <><Plus size={14} /> Add Featured Employee</>}
        </button>

        {/* Editor Form */}
        <div style={{ maxHeight: showForm ? "1200px" : "0", overflow: "hidden", transition: "max-height 0.4s ease-in-out" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--black2)", border: "1px solid var(--gray2)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              {/* Image Uploader */}
              <div 
                style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--black3)", border: "1px dashed var(--gray)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative", cursor: "pointer", flexShrink: 0 }}
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.imageBase64 ? (
                  <img src={formData.imageBase64} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <UploadCloud size={24} color="var(--gray)" />
                )}
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  style={{ display: "none" }} 
                />
              </div>

               <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "4px" }}>
                 <label style={{ color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase" }}>Full Name</label>
                 <input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Budi Santoso" style={{ background: "#111", color: "var(--white)", border: "1px solid var(--gray2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "var(--font-jakarta)" }} />
               </div>

               <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "4px" }}>
                 <label style={{ color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase" }}>Job Role</label>
                 <input type="text" name="role" required value={formData.role} onChange={handleInputChange} placeholder="e.g. Field Operator" style={{ background: "#111", color: "var(--white)", border: "1px solid var(--gray2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "var(--font-jakarta)" }} />
               </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
               <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "4px" }}>
                 <label style={{ color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase" }}>Crew</label>
                 <select name="crew" required value={formData.crew} onChange={handleInputChange} style={{ background: "#111", color: "var(--white)", border: "1px solid var(--gray2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", cursor: "pointer", appearance: "none" }}>
                   <option value="A">Crew A</option>
                   <option value="B">Crew B</option>
                   <option value="C">Crew C</option>
                   <option value="D">Crew D</option>
                 </select>
               </div>
               <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "4px" }}>
                 <label style={{ color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase" }}>Years of Service</label>
                 <input type="number" name="years" required value={formData.years} onChange={handleInputChange} min="0" style={{ background: "#111", color: "var(--white)", border: "1px solid var(--gray2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "var(--font-jakarta)" }} />
               </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase" }}>Public Biography</label>
              <textarea name="bio" required value={formData.bio} onChange={handleInputChange} placeholder="Write a short background or quote..." rows={3} style={{ background: "#111", color: "var(--white)", border: "1px solid var(--gray2)", borderRadius: "6px", padding: "8px 10px", fontSize: "13px", outline: "none", fontFamily: "var(--font-jakarta)", resize: "vertical" }} />
            </div>

            <button type="submit" disabled={saving} style={{ marginTop: "8px", padding: "12px", background: saving ? "var(--gray2)" : "var(--yellow)", color: "#000", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", fontFamily: "var(--font-jakarta)", cursor: saving ? "not-allowed" : "pointer", transition: "0.2s" }}>
              {saving ? "Saving..." : (editingId ? "Update Profile" : "Publish Profile")}
            </button>
          </form>
        </div>

        {/* Employee List */}
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--gray)", marginTop: "40px", fontFamily: "var(--font-dm-mono)" }}>Loading personnel...</div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {employees.length === 0 && <div style={{ color: "var(--gray)", textAlign: "center", marginTop: "20px", fontFamily: "var(--font-jakarta)" }}>No public profiles found.</div>}
            
            {employees.map(emp => (
              <div key={emp._id} style={{ background: "var(--black2)", border: "1px solid var(--gray2)", borderRadius: "12px", padding: "16px", display: "flex", gap: "16px", alignItems: "center" }}>
                
                {/* Avatar */}
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "var(--black3)", overflow: "hidden", flexShrink: 0 }}>
                  {emp.imageBase64 ? (
                    <img src={emp.imageBase64} alt={emp.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                     <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gray)", fontSize: "10px", fontFamily: "var(--font-dm-mono)" }}>NO_IMG</div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--white)", fontFamily: "var(--font-jakarta)" }}>{emp.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--yellow)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", padding: "2px 6px", background: "rgba(245, 200, 0, 0.1)", borderRadius: "4px" }}>CREW {emp.crew}</div>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--gray)", fontFamily: "var(--font-jakarta)", marginBottom: "4px" }}>{emp.role} • {emp.years} YOS</div>
                  <div style={{ fontSize: "12px", color: "var(--gray2)", fontFamily: "var(--font-jakarta)", display: "-webkit-box", WebkitLineClamp: "1", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{emp.bio}</div>
                </div>
                
                {/* Actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleEdit(emp)} style={{ background: "transparent", border: "none", color: "var(--gray)", cursor: "pointer", padding: "4px", transition: "0.2s" }} title="Edit"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(emp._id)} style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", padding: "4px", transition: "0.2s" }} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  )
}
