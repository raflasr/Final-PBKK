import { useState } from "react";
import { api } from "../api/axios";   // Import instance axios untuk request ke backend
import { useNavigate } from "react-router-dom"; // Untuk navigasi setelah submit

export default function CreateTask() {
  const nav = useNavigate(); // Hook untuk pindah halaman

  // -------------------------------
  // State untuk form input
  // -------------------------------
  const [name, setName] = useState("");             // Nama task
  const [description, setDescription] = useState(""); // Deskripsi task
  const [priority, setPriority] = useState("medium"); // Prioritas task
  const [dueDate, setDueDate] = useState("");       // Tanggal due task
  const [category, setCategory] = useState("");     // Kategori / tag task

  const [file, setFile] = useState(null); // File attachment (opsional)
  const [error, setError] = useState(""); // Untuk menampilkan error jika gagal

  // -------------------------------
  // Fungsi submit form
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault(); // Cegah reload page default
    setError("");       // Reset error

    try {
      // 1️⃣ Buat task baru
      const res = await api.post("/tasks", {
        name,
        description,
        priority,
        status: "pending",
        completed: false,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null, // Konversi ke ISO
        category,
      });

      const taskId = res.data.id; // Ambil ID task yang baru dibuat

      // 2️⃣ Upload file jika ada
      if (file) {
        const form = new FormData();
        form.append("file", file);

        await api.post(`/tasks/${taskId}/upload`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 3️⃣ Redirect ke dashboard
      nav("/dashboard");
    } catch (err) {
      console.error(err);
      // Tampilkan error dari response backend jika ada
      setError(
        err.response?.data?.message
          ? JSON.stringify(err.response.data.message)
          : "Failed to create task."
      );
    }
  };

  // -------------------------------
  // Render form
  // -------------------------------
  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>Create Task</h2>

      {/* Tampilkan error jika ada */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {/* Input nama task */}
        <input
          type="text"
          placeholder="Task Name (min 5 chars)"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />

        {/* Input deskripsi task */}
        <textarea
          placeholder="Description (min 5 chars)"
          value={description}
          required
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Select prioritas */}
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Input tanggal due */}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {/* Input kategori / tag */}
        <input
          type="text"
          placeholder="Category / Tag"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        {/* Input file attachment */}
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* Tombol submit */}
        <button type="submit" style={{ padding: 10 }}>
          Create Task
        </button>
      </form>
    </div>
  );
}
