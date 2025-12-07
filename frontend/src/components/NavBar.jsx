import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const nav = useNavigate(); // hook untuk navigasi programatik

  // Fungsi logout
  const logout = () => {
    localStorage.removeItem("token"); // hapus token dari localStorage
    window.location.href = "/";        // redirect ke halaman Home (bukan login)
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 20px",
      borderBottom: "1px solid #eee",
      background: "#fff"
    }}>
      {/* Bagian kiri navbar: link navigasi */}
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <Link to="/dashboard" style={{ fontWeight: 700, textDecoration: "none", color: "#111" }}>PBKK</Link>
        <Link to="/dashboard" style={{ textDecoration: "none" }}>Dashboard</Link>
        <Link to="/tasks" style={{ textDecoration: "none" }}>Tasks</Link>
        <Link to="/create" style={{ textDecoration: "none" }}>Create Task</Link>
      </div>

      {/* Bagian kanan navbar: tombol logout */}
      <div>
        <button onClick={logout} style={{
          background: "#ef4444",
          color: "#fff",
          border: "none",
          padding: "6px 12px",
          borderRadius: 6,
          cursor: "pointer"
        }}>Logout</button>
      </div>
    </nav>
  );
}
