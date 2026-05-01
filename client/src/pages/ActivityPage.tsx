import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { ActivityEntry } from "../types/invoice";

const ICONS: Record<string, string> = {
  invoice_created: "📄",
  invoice_updated: "✏️",
  status_changed: "🔄",
  invoice_deleted: "🗑",
  client_created: "👤",
  client_updated: "✏️",
  client_deleted: "🗑",
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function typeLabel(type: string): string {
  return type.replace(/_/g, " ");
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    setLoading(true);
    api
      .getActivity(limit)
      .then(setEntries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) return <p>Loading activity…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div>
      <header className="list-header">
        <div>
          <h1>Activity</h1>
          <p>
            {entries.length === 0
              ? "No activity yet"
              : `${entries.length} recent events`}
          </p>
        </div>
        {entries.length >= 50 && (
          <button
            className="btn btn-secondary"
            onClick={() => setLimit((l) => l + 50)}
          >
            Load more
          </button>
        )}
      </header>

      {entries.length === 0 ? (
        <div className="card activity-empty">
          <p style={{ fontSize: 32, marginBottom: 12 }}>📋</p>
          <h2>No activity yet</h2>
          <p style={{ marginTop: 8 }}>
            Actions like creating invoices and adding clients will appear here.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="activity-list">
            {entries.map((entry) => {
              const linkTo =
                entry.type.startsWith("invoice") &&
                entry.entity_id &&
                entry.type !== "invoice_deleted"
                  ? `/invoices/${entry.entity_id}`
                  : entry.type.startsWith("client") &&
                      entry.entity_id &&
                      entry.type !== "client_deleted"
                    ? `/clients`
                    : null;

              return (
                <div key={entry.id} className="activity-item">
                  <div className={`activity-icon ${entry.type}`}>
                    {ICONS[entry.type] ?? "•"}
                  </div>
                  <div className="activity-content">
                    <div className="activity-description">
                      {linkTo ? (
                        <Link to={linkTo}>{entry.description}</Link>
                      ) : (
                        entry.description
                      )}
                      <span className="activity-label">
                        {typeLabel(entry.type)}
                      </span>
                    </div>
                    <div className="activity-time">
                      {timeAgo(entry.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
