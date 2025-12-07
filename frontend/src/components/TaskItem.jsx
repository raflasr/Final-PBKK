import React from 'react'

// Komponen untuk menampilkan satu task
export default function TaskItem({ task, onEdit, onDelete }) {
  return (
    <div style={{
      padding: 12,
      border: '1px solid #ddd',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      {/* Bagian info task */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold' }}>{task.title}</div>          {/* Judul task */}
        <div style={{ color: '#666' }}>{task.description}</div>         {/* Deskripsi */}
        <div style={{ fontSize: 12, marginTop: 6 }}>Status: {task.status ?? 'open'}</div> {/* Status */}
      </div>

      {/* Bagian tombol aksi */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onEdit}>Edit</button>    {/* Panggil fungsi edit */}
        <button onClick={onDelete}>Delete</button> {/* Panggil fungsi delete */}
      </div>
    </div>
  )
}
