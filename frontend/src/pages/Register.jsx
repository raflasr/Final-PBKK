import React, { useState } from 'react'
import { api } from "../api/axios";  // import axios instance untuk panggil backend
import { useNavigate } from 'react-router-dom' // hook untuk navigasi halaman

export default function Register() {
  const [name, setName] = useState('') // simpan input name
  const [email, setEmail] = useState('') // simpan input email
  const [password, setPassword] = useState('') // simpan input password
  const navigate = useNavigate() // untuk redirect ke halaman lain

  const submit = async (e) => {
    e.preventDefault() // cegah reload halaman

    try {
      // panggil backend untuk register user baru
      const res = await api.post('/users', { name, email, password })

      alert('Register successful. Please login.') // notifikasi sukses
      navigate('/login') // redirect ke halaman login
    } catch (err) {
      // tampilkan error dari backend atau pesan default
      alert(err?.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div style={{
      maxWidth: 480,
      margin: '40px auto',
      padding: 20,
      border: '1px solid #eee',
      borderRadius: 8
    }}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Register</button>
      </form>
    </div>
  )
}
