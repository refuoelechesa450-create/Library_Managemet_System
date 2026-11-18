import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@library.local");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem("library_token", result.token);
      localStorage.setItem("library_user", JSON.stringify(result.user));
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">L</div>
        <span className="eyebrow">LIBRARY OPERATIONS</span>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage your library.</p>
        {error && <div className="alert error">{error}</div>}
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        <button className="primary-btn full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        <p className="login-hint">Local demo: admin@library.local / Admin123!</p>
      </form>
    </main>
  );
}
