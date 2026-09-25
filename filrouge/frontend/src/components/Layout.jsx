import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  BellRing,
  Send,
  ShieldCheck,
  User,
  LogOut,
  Droplet,
  CalendarCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/donors", label: "Donors", icon: Users },
  { to: "/urgent", label: "Urgent", icon: BellRing },
  { to: "/appointments", label: "appointement", icon: CalendarCheck },
  { to: "/urgent/mine", label: "my Requests", icon: Send }
];

export default function Layout({ children }) {
  const { isAdmin, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">
            <Droplet size={16} strokeWidth={0} fill="currentColor" />
          </span>
          <span className="sidebar-logo-text">
            Your Blood
            <br />
            is Gold
          </span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <ShieldCheck size={17} />
              <span>Admin view</span>
            </NavLink>
          )}
          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <User size={17} />
            <span>Profile</span>
          </NavLink>
          <button type="button" className="sidebar-link sidebar-link-button" onClick={logout}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="page">{children}</main>
    </div>
  );
}
