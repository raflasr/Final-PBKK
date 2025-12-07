import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // -------------------------------
  // State
  // -------------------------------
  const [summary, setSummary] = useState({ total: 0, completed: 0, pending: 0, dueSoon: [] }); // Statistik tasks
  const [otherUsers, setOtherUsers] = useState([]); // Data user lain & public tasks
  const [loadingSummary, setLoadingSummary] = useState(true); // Loading stats
  const [loadingUsers, setLoadingUsers] = useState(true); // Loading users
  const [reminderStatus, setReminderStatus] = useState(""); // Status email test

  const currentUser = JSON.parse(localStorage.getItem("user")) || { id: null }; // Ambil user saat ini

  // -------------------------------
  // Load summary tasks
  // -------------------------------
  async function loadSummary() {
    setLoadingSummary(true);
    try {
      const res = await api.get("/tasks", { params: { page: 1, limit: 100 } });
      const tasks = res.data.data || [];
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === "done" || t.status === "completed").length;
      const pending = total - completed;

      // Ambil task yang due dalam 7 hari
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const dueSoon = tasks
        .filter(t => t.dueDate)
        .map(t => ({ ...t, dueDate: t.dueDate }))
        .filter(t => {
          const due = new Date(t.dueDate).getTime();
          return due >= now && due <= now + sevenDays;
        })
        .slice(0, 5);

      setSummary({ total, completed, pending, dueSoon });
    } catch (err) {
      console.error("Error loading summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  }

  // -------------------------------
  // Load other users with public tasks
  // -------------------------------
  async function loadOtherUsersWithPublicTasks() {
    setLoadingUsers(true);
    try {
      const res = await api.get("/users/public");
      setOtherUsers(res.data || []);
    } catch (err) {
      console.error("Error loading other users:", err);
      setOtherUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  // -------------------------------
  // Send test email for tasks due today
  // -------------------------------
  async function sendTestEmails() {
    setReminderStatus("Sending test emails...");
    try {
      const res = await api.post("/mail/send-reminders-test");
      setReminderStatus(res.data.message || `Sent ${res.data.count || 0} test emails!`);
    } catch (err) {
      console.error(err);
      setReminderStatus("Failed to send test emails");
    }
  }

  // -------------------------------
  // Load data saat pertama kali render
  // -------------------------------
  useEffect(() => {
    loadSummary();
    loadOtherUsersWithPublicTasks();
  }, []);

  if (loadingSummary || loadingUsers) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <StatCard title="Total Tasks" value={summary.total} />
        <StatCard title="Completed" value={summary.completed} />
        <StatCard title="Pending" value={summary.pending} />
      </div>

      {/* Due Soon */}
      <section style={{ marginTop: 26 }}>
        <h2>Due soon (next 7 days)</h2>
        {summary.dueSoon.length === 0 ? (
          <p>No upcoming deadlines.</p>
        ) : (
          summary.dueSoon.map(t => (
            <div key={t.id} style={{ padding: 12, borderBottom: "1px solid #eee" }}>
              <Link to={`/tasks/${t.id}`} style={{ fontWeight: 600 }}>{t.name}</Link>
              <div>Due: {t.dueDate ? new Date(t.dueDate).toLocaleString() : "No due date"}</div>
              <div>Priority: {t.priority}</div>
            </div>
          ))
        )}
      </section>

      {/* Other Users & Public Tasks */}
      <section style={{ marginTop: 26 }}>
        <h2>Other Users & Public Tasks</h2>
        {otherUsers.length === 0 ? (
          <p>No other users or public tasks found.</p>
        ) : (
          otherUsers.map(user => (
            <div key={user.id} style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd", borderRadius: 6 }}>
              <div style={{ fontWeight: 700 }}>{user.name}</div>
              {user.publicTasks.length === 0 ? (
                <p style={{ marginLeft: 12 }}>No public tasks.</p>
              ) : (
                user.publicTasks.map(task => (
                  <div key={task.id} style={{ marginLeft: 12, marginTop: 6 }}>
                    <Link to={`/tasks/${task.id}`} style={{ fontWeight: 600 }}>{task.name}</Link>
                    <div>Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : "No due date"}</div>
                    <div>Priority: {task.priority}</div>
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </section>

      {/* Test Email */}
      <section style={{ marginTop: 26 }}>
        <h2>Send Test Email</h2>
        <button onClick={sendTestEmails} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Send Test Email for Tasks Due Today
        </button>
        {reminderStatus && <p>{reminderStatus}</p>}
      </section>
    </div>
  );
}

// -------------------------------
// Component untuk menampilkan statistik
// -------------------------------
function StatCard({ title, value }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", padding: 14, borderRadius: 8, minWidth: 140 }}>
      <div style={{ fontSize: 13, color: "#555" }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
