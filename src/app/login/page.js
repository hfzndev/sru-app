"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Invalid credentials")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>

      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <img src="/SRU Logo CC.png" alt="SRU Logo" style={{ display: "block", margin: "0 auto", height: '64px', width: '64px', borderRadius: '50%', objectFit: 'cover', justifyContent: "center", alignItems: "center" }} />
        <h1 style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--white)', fontSize: '24px', letterSpacing: '0.05em' }}>
          Sign In
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-mono)', color: 'var(--gray)', fontSize: '12px', marginTop: '8px' }}>
          Restricted Access Control
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '320px', background: 'var(--black3)', padding: '24px', borderRadius: '12px', border: '1px solid var(--gray2)' }}>
        <h2 style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--white)', fontSize: '16px', marginBottom: '20px' }}>
          Administrator Login
        </h2>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '8px', background: 'rgba(255, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '12px', borderRadius: '4px', border: '1px solid rgba(255, 68, 68, 0.4)', fontFamily: 'var(--font-dm-mono)' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', color: 'var(--gray)', fontSize: '12px', fontFamily: 'var(--font-dm-mono)', marginBottom: '6px' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', background: 'var(--black2)', border: '1px solid var(--gray2)', color: 'var(--white)', borderRadius: '6px', fontFamily: 'var(--font-space-grotesk)', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--gray)', fontSize: '12px', fontFamily: 'var(--font-dm-mono)', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', background: 'var(--black2)', border: '1px solid var(--gray2)', color: 'var(--white)', borderRadius: '6px', fontFamily: 'var(--font-space-grotesk)', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '8px', padding: '12px', background: 'var(--yellow)', color: 'var(--black)', border: 'none', borderRadius: '6px', fontFamily: 'var(--font-space-grotesk)', fontWeight: '700', cursor: 'pointer', transition: '0.2s', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
      <div style={{ width: '100%', maxWidth: '320px', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Link
          href="/register"
          style={{ width: '100%', padding: '12px', background: 'transparent', color: 'var(--yellow)', border: '1px solid var(--yellow)', borderRadius: '6px', fontFamily: 'var(--font-space-grotesk)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', transition: '0.2s', display: 'block' }}
          onMouseOver={e => { e.target.style.background = 'var(--yellow-dim)' }}
          onMouseOut={e => { e.target.style.background = 'transparent' }}
        >
          Create New Account
        </Link>
        <Link
          href="/"
          style={{ width: '100%', padding: '12px', background: 'transparent', color: 'var(--gray)', border: '1px solid var(--gray2)', borderRadius: '6px', fontFamily: 'var(--font-space-grotesk)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', transition: '0.2s', display: 'block' }}
          onMouseOver={e => { e.target.style.color = 'var(--white)'; e.target.style.borderColor = 'var(--gray)' }}
          onMouseOut={e => { e.target.style.color = 'var(--gray)'; e.target.style.borderColor = 'var(--gray2)' }}
        >
          &larr; Go Back
        </Link>
      </div>

    </div>
  )
}
