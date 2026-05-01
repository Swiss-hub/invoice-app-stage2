import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Invoice, InvoiceStatus } from "../types/invoice";
import {
  formatCurrency,
  formatDate,
  invoiceTotal,
  dueSoonDays,
} from "../lib/format";
import StatusBadge from "../components/StatusBadge";
import InvoiceFilters from "../components/InvoiceFilters";

const VALID_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

export default function InvoiceListPage() {
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<InvoiceStatus[]>(() => {
    const param = searchParams.get("status");
    if (param && VALID_STATUSES.includes(param as InvoiceStatus)) {
      return [param as InvoiceStatus];
    }
    return [];
  });
  const navigate = useNavigate();

  useEffect(() => {
    api
      .listInvoices()
      .then(setInvoices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((inv) => {
      const statusOk = statuses.length === 0 || statuses.includes(inv.status);
      if (!statusOk) return false;
      if (!q) return true;
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.client_name.toLowerCase().includes(q)
      );
    });
  }, [invoices, query, statuses]);

  if (loading) return <p>Loading invoices…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  const isFiltered = query.trim() !== "" || statuses.length > 0;
  const countLabel =
    invoices.length === 0
      ? "No invoices"
      : isFiltered
        ? `${filtered.length} of ${invoices.length} ${invoices.length === 1 ? "invoice" : "invoices"}`
        : `${invoices.length} ${invoices.length === 1 ? "invoice" : "invoices"}`;

  return (
    <div>
      <header className="list-header">
        <div>
          <h1>Invoices</h1>
          <p>{countLabel}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <InvoiceFilters
            query={query}
            onQueryChange={setQuery}
            selectedStatuses={statuses}
            onStatusChange={setStatuses}
          />
          <Link to="/invoices/new">
            <button className="btn btn-primary btn-icon">+ New Invoice</button>
          </Link>
        </div>
      </header>

      {invoices.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <h2>There is nothing here</h2>
          <p style={{ color: "var(--color-text-subtle)", marginTop: 8 }}>
            Create a new invoice by clicking the <strong>New Invoice</strong>{" "}
            button.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <h2>No matching invoices</h2>
          <p style={{ color: "var(--color-text-subtle)", marginTop: 8 }}>
            Try clearing your search or selecting different statuses.
          </p>
        </div>
      ) : (
        filtered.map((inv) => (
          <div
            key={inv.id}
            className="invoice-card"
            onClick={() => navigate(`/invoices/${inv.id}`)}
          >
            <span className="invoice-id">
              <span className="hash">#</span>
              {inv.invoice_number}
            </span>
            <span
              className={
                inv.status === "paid"
                  ? "invoice-due"
                  : dueSoonDays(inv.due_date) < 0
                    ? "invoice-due due-overdue"
                    : dueSoonDays(inv.due_date) <= 7
                      ? "invoice-due due-warning"
                      : "invoice-due"
              }
            >
              Due {formatDate(inv.due_date)}
              {inv.status !== "paid" && dueSoonDays(inv.due_date) < 0 && (
                <span className="due-tag danger">Overdue</span>
              )}
              {inv.status !== "paid" &&
                dueSoonDays(inv.due_date) >= 0 &&
                dueSoonDays(inv.due_date) <= 7 && (
                  <span className="due-tag warning">
                    {dueSoonDays(inv.due_date) === 0
                      ? "Today"
                      : `${dueSoonDays(inv.due_date)}d left`}
                  </span>
                )}
            </span>
            <span className="invoice-client">{inv.client_name}</span>
            <span className="invoice-total">
              {formatCurrency(invoiceTotal(inv.items))}
            </span>
            <StatusBadge status={inv.status} />
            <span className="chevron">›</span>
          </div>
        ))
      )}
    </div>
  );
}
