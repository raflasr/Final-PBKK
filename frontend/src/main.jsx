import React from "react";
import { createRoot } from "react-dom/client"; // Untuk React 18+, menggantikan ReactDOM.render
import { BrowserRouter } from "react-router-dom"; // Untuk routing SPA
import App from "./App"; // Komponen utama aplikasi
import "./styles/index.css"; // Import global CSS

// Render aplikasi ke div dengan id "root"
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {/* Membungkus App dengan BrowserRouter agar bisa menggunakan routing */}
      <App /> {/* Komponen utama */}
    </BrowserRouter>
  </React.StrictMode>
);
