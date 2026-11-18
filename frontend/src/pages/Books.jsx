import { useEffect, useState } from "react";
import { api } from "../api";

const blank = { title: "", author: "", genre: "", isbn: "", quantity: "1" };

export default function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try { setBooks(await api("/books")); } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault(); setError(""); setMessage("");
    try {
      const path = editing ? `/books/${editing}` : "/books";
      await api(path, { method: editing ? "PUT" : "POST", body: JSON.stringify({ ...form, quantity: Number(form.quantity) }) });
      setMessage(editing ? "Book updated successfully." : "Book added successfully.");
      setForm(blank); setEditing(null); await load();
    } catch (err) { setError(err.message); }
  }

  function startEdit(book) {
    setEditing(book.id);
    setForm({ title: book.title, author: book.author, genre: book.genre, isbn: book.isbn, quantity: String(book.quantity) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(book) {
    if (!window.confirm(`Delete "${book.title}" from the catalogue?`)) return;
    setError(""); setMessage("");
    try { await api(`/books/${book.id}`, { method: "DELETE" }); setMessage("Book deleted."); await load(); }
    catch (err) { setError(err.message); }
  }

  return (
    <>
      <div className="page-title"><div><span className="eyebrow">COLLECTION</span><h2>Book management</h2><p className="muted">Create, update and maintain your book catalogue.</p></div><span className="count-badge">{books.length} titles</span></div>
      {error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}
      <section className="panel form-panel">
        <div className="panel-heading"><div><h3>{editing ? "Update book details" : "Add a new book"}</h3><p>Enter the book information below.</p></div></div>
        <form className="form-grid" onSubmit={submit}>
          <label>Title<input name="title" value={form.title} onChange={change} required maxLength="200" /></label>
          <label>Author<input name="author" value={form.author} onChange={change} required maxLength="160" /></label>
          <label>Genre<input name="genre" value={form.genre} onChange={change} required /></label>
          <label>ISBN<input name="isbn" value={form.isbn} onChange={change} required /></label>
          <label>Initial quantity<input type="number" name="quantity" min="0" step="1" value={form.quantity} onChange={change} required /></label>
          <div className="form-actions"><button className="primary-btn">{editing ? "Save changes" : "Add book"}</button>{editing && <button type="button" className="secondary-btn" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}</div>
        </form>
      </section>
      <section className="panel">
        <div className="panel-heading"><div><h3>Catalogue</h3><p>All registered books</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>TITLE</th><th>AUTHOR</th><th>GENRE</th><th>ISBN</th><th>QUANTITY</th><th>ACTIONS</th></tr></thead>
          <tbody>{books.map(book => <tr key={book.id}><td className="book-name">{book.title}</td><td>{book.author}</td><td>{book.genre}</td><td>{book.isbn}</td><td><span className={`pill ${book.quantity < 2 ? "warning" : "good"}`}>{book.quantity}</span></td><td className="actions"><button className="text-btn" onClick={() => startEdit(book)}>Edit</button><button className="text-btn danger-text" onClick={() => remove(book)}>Delete</button></td></tr>)}
          {!books.length && <tr><td colSpan="6" className="empty">No books found.</td></tr>}</tbody>
        </table></div>
      </section>
    </>
  );
}
