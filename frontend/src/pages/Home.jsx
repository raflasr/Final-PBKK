import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Selamat Datang 👋</h1> {/* Judul halaman */}
      <p>Silakan pilih:</p>          {/* Instruksi singkat */}

      {/* Tombol navigasi ke Login dan Register */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <Link to="/login">➡️ Login</Link>
        <Link to="/register">➡️ Register</Link>
      </div>
    </div>
  );
}
