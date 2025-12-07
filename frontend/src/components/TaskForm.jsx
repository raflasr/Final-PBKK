import React, { useState } from 'react'

// Komponen form untuk membuat atau mengedit task
export default function TaskForm({ onSubmit, onCancel, initial }) {
  // State untuk masing-masing field form
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [status, setStatus] = useState(initial?.status || 'open')

  // Fungsi submit form
  const submit = (e) => {
    e.preventDefault()              // mencegah reload halaman
    if (!title.trim()) return alert('Title required') // validasi sederhana
    onSubmit({ title, description, status }) // panggil fungsi dari parent
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      {/* Input title */}
      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required />

      {/* Input description */}
      <label>Description</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

      {/* Select status */}
      <label>Status</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      {/* Tombol aksi */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
