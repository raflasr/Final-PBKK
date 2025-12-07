import React, { useEffect, useState } from "react";
import { api } from "../api/axios"; // import axios instance untuk panggil backend
import { useParams, Link } from "react-router-dom"; // ambil param URL & Link

export default function TaskDetail() {
  const { id } = useParams(); // ambil id task dari URL
  const [task, setTask] = useState(null); // simpan data task
  const [file, setFile] = useState(null); // simpan file yang di-upload

  // fungsi load data task
  const load = async () => {
    try {
      const res = await api.get(`/tasks/${id}`); // panggil backend
      setTask(res.data); // simpan ke state
    } catch (err) { console.error(err); }
  };

  useEffect(() => { load(); }, [id]); // load saat component mount atau id berubah

  // fungsi upload file
  const upload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    await api.post(`/tasks/${id}/upload`, fd, { headers: { "Content-Type": "multipart/form-data" }});
    load(); // refresh data setelah upload
  };

  if (!task) return <p>Loading...</p>; // loading sementara data belum ada

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <h2>{task.name}</h2>
      <p>{task.description}</p>
      <p>Priority: {task.priority}</p>
      <p>Status: {task.status}</p>
      <p>Category: {task.category}</p>
      <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : "-"}</p>

      {/* Upload file */}
      <div style={{ marginTop: 12 }}>
        <label>Attach file</label>
        <input type="file" onChange={upload} />
      </div>

      {/* Tampilkan link download jika ada file */}
      {task.filePath && (
        <div style={{ marginTop: 12 }}>
          <a href={`http://localhost:3000/${task.filePath}`} target="_blank" rel="noreferrer">Download Attachment</a>
        </div>
      )}

      {/* Tombol edit task */}
      <div style={{ marginTop: 14 }}>
        <Link to={`/tasks/edit/${task.id}`}><button>Edit</button></Link>
      </div>
    </div>
  );
}
