import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api("/books"), api("/transactions")])
      .then(([bookData, transactionData]) => {
        setBooks(bookData);
        setTransactions(transactionData);
      })
      .catch(err => setError(err.message));
  }, []);

  const totalCopies = books.reduce((sum, book) => sum + Number(book.quantity), 0);
  const lowStock = books.filter(book => Number(book.quantity) < 2);

  return (
    <>
      <div className="welcome-row"><div><span className="eyebrow">OVERVIEW</span><h2>Your library at a glance</h2><p className="muted">Monitor your collection and recent activity.</p></div><Link className="primary-btn" to="/books">＋ Add a book</Link></div>
      {error && <div className="alert error">{error}</div>}
      <div className="stats-grid">
        <StatCard label="Book titles" value={books.length} note="Unique titles in catalogue" icon="▤" />
        <StatCard label="Total copies" value={totalCopies} note="Copies currently in stock" icon="▣" tone="blue" />
        <StatCard label="Low stock" value={lowStock.length} note="Titles with fewer than 2 copies" icon="!" tone="orange" />
        <StatCard label="Transactions" value={transactions.length} note="Recorded library activity" icon="⇄" tone="purple" />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading"><div><h3>Book availability</h3><p>Current stock levels across your collection</p></div><Link to="/books">View all →</Link></div>
          <div className="table-wrap"><table><thead><tr><th>BOOK TITLE</th><th>AUTHOR</th><th>GENRE</th><th>IN STOCK</th><th>STATUS</th></tr></thead>
            <tbody>{books.slice(0, 7).map(book => <tr key={book.id}><td className="book-name">{book.title}</td><td>{book.author}</td><td>{book.genre}</td><td>{book.quantity}</td><td><span className={`pill ${book.quantity < 2 ? "warning" : "good"}`}>{book.quantity < 2 ? "Low stock" : "Available"}</span></td></tr>)}
            {!books.length && <tr><td colSpan="5" className="empty">No books yet. Add your first book to get started.</td></tr>}</tbody>
          </table></div>
        </section>
        <section className="panel activity-panel">
          <div className="panel-heading"><div><h3>Recent activity</h3><p>Latest stock movements</p></div><Link to="/transactions">History →</Link></div>
          {transactions.slice(0, 6).map(item => <div className="activity-item" key={item.id}><span className={`activity-symbol ${item.transaction_type}`}>{item.transaction_type === "borrow" ? "↗" : "↙"}</span><div><strong>{item.transaction_type[0].toUpperCase() + item.transaction_type.slice(1)}</strong><p>{item.book_title} · {item.quantity} copy/copies</p><small>{item.member_name || "Stock update"}</small></div></div>)}
          {!transactions.length && <p className="empty">No transactions recorded yet.</p>}
        </section>
      </div>
      {lowStock.length > 0 && <div className="alert warning-alert"><strong>Stock attention needed:</strong> {lowStock.map(book => book.title).join(", ")} {lowStock.length === 1 ? "has" : "have"} fewer than 2 copies. <Link to="/transactions">Restock now</Link>.</div>}
    </>
  );
}
