import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("library_user") || "null"); }
    catch { return null; }
  });
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("library_token");
    localStorage.removeItem("library_user");
    setUser(null);
    navigate("/login");
  }

  useEffect(() => {
    const handler = () => { setUser(null); navigate("/login"); };
    window.addEventListener("library:logout", handler);
    return () => window.removeEventListener("library:logout", handler);
  }, [navigate]);

  if (!user) {
    return <Routes><Route path="/login" element={<Login onLogin={setUser} />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>;
  }

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={logout} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/users" element={<Users />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
