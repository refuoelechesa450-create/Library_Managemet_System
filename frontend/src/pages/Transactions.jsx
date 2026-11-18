import { useEffect, useState } from "react";
import { api } from "../api";

const blank = { book_id: "", user_id: "", transaction_type: "borrow", quantity: "1", notes: "" };

export default function Transactions() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const [b, u, t] = await Promise.all([api("/books"), api("/users"), api("/transactions")]);
      setBooks(b); setUsers(u); setHistory(t);
    } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault(); setError(""); setMessage("");
    try {
      const result = await api("/transactions", {
        method: "POST",
        body: JSON.stringify({ ...form, book_id: Number(form.book_id), user_id: form.user_id ? Number(form.user_id) : null, quantity: Number(form.quantity) })
      });
      setMessage(`Transaction saved. New stock: ${result.new_stock}.`);
      setForm(blank); await load();
    } catch (err) { setError(err.message); }
  }

  return (
    <>
      <div className="page-title"><div><span className="eyebrow">STOCK CONTROL</span><h2>Transactions</h2><p className="muted">Record borrowing, returns and incoming stock.</p></div></div>
      {error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}
      <section className="panel form-panel">
        <div className="panel-heading"><div><h3>Record a transaction</h3><p>Stock is updated automatically when you submit.</p></div></div>
        <form className="form-grid" onSubmit={submit}>
          <label>Book<select value={form.book_id} onChange={e => setForm({ ...form, book_id: e.target.value })} required><option value="">Select a book</option>{books.map(b => <option key={b.id} value={b.id}>{b.title} ({b.quantity} available)</option>)}</select></label>
          <label>Transaction type<select value={form.transaction_type} onChange={e => setForm({ ...form, transaction_type: e.target.value, user_id: e.target.value === "borrow" ? form.user_id : "" })}><option value="borrow">Borrow</option><option value="return">Return</option><option value="restock">Add stock</option></select></label>
          {form.transaction_type === "borrow" && <label>Member<select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} required><option value="">Select member</option>{users.filter(u => u.role === "member").map(u => <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>)}</select></label>}
          <label>Quantity<input type="number" min="1" step="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required /></label>
          <label className="wide-field">Notes (optional)<input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} maxLength="500" placeholder="Add a short note..." /></label>
          <div className="form-actions"><button className="primary-btn">Save transaction</button></div>
        </form>
      </section>
      <section className="panel">
        <div className="panel-heading"><div><h3>Transaction history</h3><p>A record of all stock movements</p></div><span className="count-badge">{history.length} records</span></div>
        <div className="table-wrap"><table><thead><tr><th>DATE</th><th>BOOK</th><th>MEMBER</th><th>TYPE</th><th>QUANTITY</th><th>NOTES</th></tr></thead>
          <tbody>{history.map(t => <tr key={t.id}><td>{new Date(t.created_at).toLocaleString()}</td><td className="book-name">{t.book_title}</td><td>{t.member_name || "—"}</td><td><span className={`pill ${t.transaction_type === "borrow" ? "warning" : "good"}`}>{t.transaction_type}</span></td><td>{t.quantity}</td><td>{t.notes || "—"}</td></tr>)}
          {!history.length && <tr><td colSpan="6" className="empty">No transactions recorded yet.</td></tr>}</tbody>
        </table></div>
      </section>
    </>
  );
}
