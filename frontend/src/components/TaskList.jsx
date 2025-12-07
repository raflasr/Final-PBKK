import React from 'react'
import TaskItem from './TaskItem'

// Komponen untuk menampilkan daftar task
export default function TaskList({ tasks, onEdit, onDelete }) {
  // Jika tidak ada task, tampilkan pesan
  if (!tasks || tasks.length === 0) return <div>No tasks yet</div>

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {/* Mapping setiap task ke komponen TaskItem */}
      {tasks.map(t => (
        <TaskItem 
          key={t.id} 
          task={t} 
          onEdit={() => onEdit(t)}       // Fungsi edit task
          onDelete={() => onDelete(t.id)} // Fungsi hapus task
        />
      ))}
    </div>
  )
}
