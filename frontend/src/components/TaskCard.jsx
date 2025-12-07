import React from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";

export default function TaskCard({ task, reload }) {
  // Toggle status task (done ↔ pending)
  const toggleStatus = async () => {
    try {
      await api.patch(`/tasks/${task.id}/toggle`);
      reload(); // refresh daftar task
    } catch (err) { console.error(err); }
  };

  // Toggle visibilitas task (public ↔ private)
  const togglePublic = async () => {
    try {
      await api.patch(`/tasks/${task.id}/toggle-public`);
      reload(); // refresh daftar task
    } catch (err) { console.error(err); }
  };

  // Hapus task
  const remove = async () => {
    if (!confirm("Delete this task?")) return; // konfirmasi
    try {
      await api.delete(`/tasks/${task.id}`);
      reload(); // refresh daftar task
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Bagian kiri: nama task + deskripsi */}
        <div>
          <Link to={`/tasks/${task.id}`} style={{ fontSize: 16, fontWeight: 700 }}>{task.name}</Link>
          <div style={{ color: "#555" }}>{task.description}</div>
        </div>

        {/* Bagian kanan: info dan aksi */}
        <div style={{ textAlign: "right" }}>
          <div>Priority: {task.priority}</div>
          <div>Status: {task.status}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button onClick={toggleStatus}>
              {task.status === "done" || task.status === "completed" ? "Mark Pending" : "Mark Done"}
            </button>
            <button onClick={togglePublic}>
              {task.isPublic ? "Make Private" : "Make Public"}
            </button>
            <Link to={`/tasks/edit/${task.id}`}><button>Edit</button></Link>
            <button onClick={remove} style={{ color: "red" }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
