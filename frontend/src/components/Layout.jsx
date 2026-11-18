import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: "▦" },
  { to: "/books", label: "Book management", icon: "▤" },
  { to: "/transactions", label: "Transactions", icon: "⇄" },
  { to: "/users", label: "User management", icon: "♙" }
];

export default function Layout({ user, onLogout }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">L</span><span>Libra<span className="brand-light">ry</span></span></div>
        <p className="nav-caption">WORKSPACE</p>
        <nav>
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"}>
              <span className="nav-icon">{link.icon}</span>{link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar">{user.name?.slice(0, 1).toUpperCase()}</div>
          <div className="user-mini"><strong>{user.name}</strong><small>{user.role}</small></div>
          <button className="logout-icon" onClick={onLogout} title="Sign out">↗</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div><span className="eyebrow">LIBRARY OPERATIONS</span><h1>Library Management</h1></div>
          <div className="top-user"><span className="status-dot"></span> Signed in as <strong>{user.name}</strong></div>
        </header>
        <section className="page-content"><Outlet /></section>
      </main>
    </div>
  );
}
