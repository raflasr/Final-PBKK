import React, { useState } from 'react'
import { api } from "../api/axios";
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')      // State untuk input email
  const [password, setPassword] = useState('')// State untuk input password
  const [loading, setLoading] = useState(false) // State untuk loading tombol
  const navigate = useNavigate()              // Hook untuk navigasi

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)                           // Set loading true saat submit

    try {
      // Kirim data login ke backend (POST /auth)
      const res = await api.post('/auth', { email, password })

      console.log("LOGIN RESPONSE:", res.data)

      // Simpan token di localStorage
      const token = res.data.access_token || res.data.token
      if (token) localStorage.setItem("token", token)
      else alert("Login berhasil, tapi token tidak diberikan backend.")

      // Simpan info user di localStorage jika ada
      if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user))

      // Redirect ke dashboard
      navigate('/dashboard')

    } catch (err) {
      console.error("LOGIN ERROR:", err)

      // Ambil pesan error dari response
      let msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.msg ||
        "Login failed"

      // Jika msg object → stringify
      if (typeof msg === "object") msg = JSON.stringify(msg, null, 2)

      alert(msg)
    } finally {
      setLoading(false) // Reset loading
    }
  }

  return (
    <div style={{
      maxWidth: 420,
      margin: '40px auto',
      padding: 20,
      border: '1px solid #eee',
      borderRadius: 8
    }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update state email
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update state password
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}        {/* Tombol submit dengan loading */}
        </button>
      </form>
    </div>
  )
}
