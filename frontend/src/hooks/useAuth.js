import { useEffect, useState } from 'react'
import { api } from '../api/axios'

// Custom hook untuk autentikasi user
export default function useAuth() {
  // State user, ambil dari localStorage kalau ada
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    // Cek token di localStorage dan validasi dengan backend jika user belum ada
    const token = localStorage.getItem('token')
    if (token && !user) {
      api.get('/auth/profile')   // request profile user
        .then((r) => {
          setUser(r.data)                  // update state user
          localStorage.setItem('user', JSON.stringify(r.data)) // simpan di localStorage
        })
        .catch(() => {
          localStorage.removeItem('token') // hapus token jika invalid
          localStorage.removeItem('user')
          setUser(null)
        })
    }
  }, [])

  // Fungsi untuk logout
  const signout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/login'  // redirect ke halaman login
  }

  return { user, setUser, signout }  // expose state dan fungsi
}
