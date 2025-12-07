import React from 'react'
import { Navigate } from 'react-router-dom'

// Component untuk route yang hanya bisa diakses jika user login
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token') // ambil token dari localStorage

  // Jika token tidak ada → redirect ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Jika token ada → render komponen anak (children)
  return children
}
