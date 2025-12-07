import React, { useEffect, useState } from "react";
import { api } from "../api/axios"; // import axios instance untuk panggil backend
import TaskCard from "../components/TaskCard"; // komponen card untuk tiap task
import { Link } from "react-router-dom"; // Link untuk navigasi

export default function Tasks() {
  const [tasks, setTasks] = useState([]); // simpan list task
  const [meta, setMeta] = useState({}); // simpan info pagination
  const [search, setSearch] = useState(""); // filter search
  const [priority, setPriority] = useState(""); // filter priority
  const [status, setStatus] = useState(""); // filter status
  const [category, setCategory] = useState(""); // filter category
  const [page, setPage] = useState(1); // halaman saat ini
  const [loading, setLoading] = useState(true); // state loading

  // fungsi load task dari backend
  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/tasks", {
        params: { search, priority, status, category, page: p, limit: 10 }
      });
      setTasks(res.data.data || []); // simpan tasks
      setMeta(res.data.meta || { page: p, totalPages: 1 }); // simpan meta info
      setPage(res.data.meta?.page ?? p); // update halaman
    } catch (err) {
      console.error("LOAD TASKS ERR", err);
      setTasks([]); // jika error, kosongkan list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []); // load saat component mount

  const apply = () => load(1); // apply filter dan load ulang halaman 1

  return (
    <div>
      <h1>Tasks</h1>

      {/* Filter dan create task */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        <input placeholder="Search title or desc..." value={search} onChange={(e)=>setSearch(e.target.value)} />
        <select value={priority} onChange={(e)=>setPriority(e.target.value)}>
          <option value="">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option value="">Status</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>
        <input placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)} />
        <button onClick={apply}>Apply</button>

        <Link to="/create"><button style={{ marginLeft: 8 }}>+ Create Task</button></Link>
      </div>

      {/* List task */}
      <div style={{ marginTop: 18 }}>
        {loading ? <p>Loading...</p> : tasks.length === 0 ? <p>No tasks</p> :
          tasks.map(t => <TaskCard key={t.id} task={t} reload={() => load(page)} />)
        }
      </div>

      {/* Pagination */}
      <div style={{ marginTop: 16 }}>
        <button disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
        <span style={{ margin: "0 8px" }}>Page {meta.page ?? page} / {meta.totalPages ?? 1}</span>
        <button disabled={page >= (meta.totalPages ?? page)} onClick={() => load(page + 1)}>Next</button>
      </div>
    </div>
  );
}
