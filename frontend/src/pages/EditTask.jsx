import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditTask() {
  const { id } = useParams();          // Ambil ID task dari URL
  const nav = useNavigate();           // Untuk navigasi setelah update
  const [task, setTask] = useState(null); // State task yang akan diedit
  const [file, setFile] = useState(null); // State file baru jika diupload

  // Load task saat pertama kali render
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data);           // Simpan task ke state
      } catch (err) { console.error(err); }
    })();
  }, [id]);

  // Fungsi submit form
  const submit = async (e) => {
    e.preventDefault();
    try {
      // 1️⃣ Update data task
      await api.patch(`/tasks/${id}`, {
        name: task.name,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate || null,
        category: task.category || null,
      });

      // 2️⃣ Upload file jika ada
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await api.post(`/tasks/${id}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Updated successfully");
      nav("/tasks");               // Kembali ke daftar tasks
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (!task) return <p>Loading...</p>; // Loading state

  return (
    <div style={{ maxWidth: 700, margin: "auto" }}>
      <h2>Edit Task</h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
        {/* Title */}
        <label>Title</label>
        <input value={task.name} onChange={(e)=>setTask({...task, name: e.target.value})} />

        {/* Description */}
        <label>Description</label>
        <textarea value={task.description} onChange={(e)=>setTask({...task, description: e.target.value})} />

        {/* Priority */}
        <label>Priority</label>
        <select value={task.priority} onChange={(e)=>setTask({...task, priority: e.target.value})}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Due date */}
        <label>Due date</label>
        <input type="date" value={task.dueDate ? task.dueDate.split("T")[0] : ""} onChange={(e)=>setTask({...task, dueDate: e.target.value})} />

        {/* Category */}
        <label>Category</label>
        <input value={task.category || ""} onChange={(e)=>setTask({...task, category: e.target.value})} />

        {/* Upload file baru */}
        <label>Upload File</label>
        <input type="file" onChange={(e)=>setFile(e.target.files[0])} />

        {/* Tampilkan file saat ini jika ada */}
        {task.filePath && (
          <div>
            Current File: <a href={`/uploads/tasks/${task.filePath}`} target="_blank">{task.filePath}</a>
          </div>
        )}

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
