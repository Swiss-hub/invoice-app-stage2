import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import InvoiceFormPage from "./pages/InvoiceFormPage";
import InvoicePrintPage from "./pages/InvoicePrintPage";
import ClientsPage from "./pages/ClientsPage";
import { useTheme } from "./lib/useTheme";
import { useKeyboardShortcuts } from "./lib/useKeyboardShortcuts";
import ShortcutsModal from "./components/ShortcutsModal";
import { useRef } from "react";

function Shell() {
  const [theme, toggleTheme] = useTheme();
  const modalRef = useRef<HTMLDialogElement>(null);
  useKeyboardShortcuts();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>IV</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            ⊞<span>Home</span>
          </NavLink>
          <NavLink
            to="/invoices"
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            ≡<span>Invoices</span>
          </NavLink>
          <NavLink
            to="/clients"
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            👤<span>Clients</span>
          </NavLink>
        </nav>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            paddingBottom: 8,
          }}
        >
          <button
            className="shortcut-hint-btn"
            title="Keyboard shortcuts (?)"
            aria-label="Show keyboard shortcuts"
            onClick={() =>
              (
                document.getElementById("shortcuts-modal") as HTMLDialogElement
              )?.showModal()
            }
          >
            ?
          </button>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/invoices/new" element={<InvoiceFormPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/clients" element={<ClientsPage />} />
        </Routes>
      </main>
      <ShortcutsModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/invoices/:id/print" element={<InvoicePrintPage />} />
        <Route path="/*" element={<Shell />} />
      </Routes>
    </BrowserRouter>
  );
}
