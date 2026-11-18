import { useEffect, useState } from "react";
import { api } from "../api";

const blank = { name: "", email: "", membership_id: "", role: "member", password: "" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try { setUsers(await api("/users")); } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault(); setError(""); setMessage("");
    try {
      const payload = { ...form };
      if (editing && !payload.password) delete payload.password;
      await api(editing ? `/users/${editing}` : "/users", {
        method: editing ? "PUT" : "POST", body: JSON.stringify(payload)
      });
      setMessage(editing ? "User updated." : "User created.");
      setEditing(null); setForm(blank); await load();
    } catch (err) { setError(err.message); }
  }

  function edit(user) {
    setEditing(user.id);
    setForm({ name: user.name, email: user.email, membership_id: user.membership_id, role: user.role, password: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(user) {
    if (!window.confirm(`Delete user ${user.name}?`)) return;
    setError(""); setMessage("");
    try { await api(`/users/${user.id}`, { method: "DELETE" }); setMessage("User deleted."); await load(); }
    catch (err) { setError(err.message); }
  }

  return (
    <>
      <div className="page-title"><div><span className="eyebrow">PEOPLE</span><h2>User management</h2><p className="muted">Manage library members and administrator accounts.</p></div><span className="count-badge">{users.length} users</span></div>
      {error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}
      <section className="panel form-panel">
        <div className="panel-heading"><div><h3>{editing ? "Update user" : "Add a user"}</h3><p>Passwords must contain at least 8 characters.</p></div></div>
        <form className="form-grid" onSubmit={submit}>
          <label>Full name<input name="name" value={form.name} onChange={change} required /></label>
          <label>Email address<input type="email" name="email" value={form.email} onChange={change} required /></label>
          <label>Membership ID<input name="membership_id" value={form.membership_id} onChange={change} required /></label>
          <label>Role<select name="role" value={form.role} onChange={change}><option value="member">Member</option><option value="admin">Administrator</option></select></label>
          <label>{editing ? "New password (optional)" : "Password"}<input type="password" name="password" value={form.password} onChange={change} minLength="8" required={!editing} placeholder={editing ? "Leave blank to keep current password" : "At least 8 characters"} /></label>
          <div className="form-actions"><button className="primary-btn">{editing ? "Save changes" : "Create user"}</button>{editing && <button type="button" className="secondary-btn" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}</div>
        </form>
      </section>
      <section className="panel">
        <div className="panel-heading"><div><h3>Registered users</h3><p>Account directory</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>NAME</th><th>EMAIL</th><th>MEMBERSHIP ID</th><th>ROLE</th><th>ACTIONS</th></tr></thead>
          <tbody>{users.map(user => <tr key={user.id}><td className="book-name">{user.name}</td><td>{user.email}</td><td>{user.membership_id}</td><td><span className="pill neutral">{user.role}</span></td><td className="actions"><button className="text-btn" onClick={() => edit(user)}>Edit</button><button className="text-btn danger-text" onClick={() => remove(user)}>Delete</button></td></tr>)}
          {!users.length && <tr><td colSpan="5" className="empty">No users found.</td></tr>}</tbody>
        </table></div>
      </section>
    </>
  );
}
