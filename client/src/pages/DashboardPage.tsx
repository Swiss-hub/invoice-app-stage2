import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Stats } from "../types/invoice";
import { formatCurrency, formatDate } from "../lib/format";

const STATUS_COLORS: Record<string, string> = {
  paid: "var(--status-paid-fg)",
  sent: "var(--status-pending-fg)",
  draft: "var(--status-draft-fg)",
  overdue: "var(--status-overdue-fg)",
};
const STATUS_BG: Record<string, string> = {
  paid: "var(--status-paid-bg)",
  sent: "var(--status-pending-bg)",
  draft: "var(--status-draft-bg)",
  overdue: "var(--status-overdue-bg)",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">Error: {error}</p>;
  if (!stats) return <p>Loading…</p>;

  const hasOverdue = stats.overdue_invoices.length > 0;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1>Dashboard</h1>
        <p
          style={{
            color: "var(--color-text-subtle)",
            marginTop: 4,
            fontSize: 13,
          }}
        >
          Overview of your invoices
        </p>
      </div>

      {hasOverdue && (
        <div className="alert-card">
          <h3>
            ⚠ {stats.overdue_invoices.length} overdue{" "}
            {stats.overdue_invoices.length === 1 ? "invoice" : "invoices"}
          </h3>
          {stats.overdue_invoices.map((inv) => (
            <Link
              key={inv.id}
              to={`/invoices/${inv.id}`}
              style={{ textDecoration: "none" }}
            >
              <div className="overdue-row">
                <span className="overdue-id">#{inv.invoice_number}</span>
                <span className="overdue-client">{inv.client_name}</span>
                <span
                  style={{ color: "var(--color-text-subtle)", fontSize: 12 }}
                >
                  Due {formatDate(inv.due_date)}
                </span>
                <span className="overdue-amount">
                  {formatCurrency(inv.total)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card accent">
          <p className="stat-label">Total Revenue</p>
          <p className="stat-value">{formatCurrency(stats.revenue.paid)}</p>
          <p className="stat-sub">From paid invoices</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Outstanding</p>
          <p className="stat-value">
            {formatCurrency(stats.revenue.outstanding)}
          </p>
          <p className="stat-sub">Sent &amp; overdue</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Invoices</p>
          <p className="stat-value">{stats.total_invoices}</p>
          <p className="stat-sub">All time</p>
        </div>
      </div>

      <div className="status-breakdown">
        {(["draft", "sent", "paid", "overdue"] as const).map((s) => (
          <Link
            key={s}
            to={`/invoices?status=${s}`}
            style={{ textDecoration: "none", flex: 1 }}
          >
            <div
              className="breakdown-item"
              style={{
                background: STATUS_BG[s],
                color: STATUS_COLORS[s],
              }}
            >
              <div className="bd-count">{stats.by_status[s] ?? 0}</div>
              <div className="bd-label">{s}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: "right" }}>
        <Link to="/invoices">
          <button className="btn btn-primary">View All Invoices →</button>
        </Link>
      </div>
    </div>
  );
}
