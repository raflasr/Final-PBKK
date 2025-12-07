import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import CreateTask from "./pages/CreateTask";
import EditTask from "./pages/EditTask";
import TaskDetail from "./pages/TaskDetail";
import Home from "./pages/Home";

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/create" element={<CreateTask />} />
          <Route path="/tasks/edit/:id" element={<EditTask />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />

          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
      </main>
    </>
  );
}
