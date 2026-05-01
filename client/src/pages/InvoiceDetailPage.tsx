import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Invoice, InvoiceInput } from "../types/invoice";
import { formatCurrency, formatDate, invoiceTotal } from "../lib/format";
import InvoiceForm from "../components/InvoiceForm";
import StatusBadge from "../components/StatusBadge";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getInvoice(id)
      .then(setInvoice)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(data: InvoiceInput) {
    if (!id) return;
    const updated = await api.updateInvoice(id, data);
    setInvoice(updated);
    setEditing(false);
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    await api.deleteInvoice(id);
    navigate("/");
  }

  async function handleMarkPaid() {
    if (!id) return;
    const updated = await api.updateStatus(id, "paid");
    setInvoice(updated);
  }

  async function handleQuickStatus(status: string) {
    if (!id) return;
    const updated = await api.updateStatus(id, status);
    setInvoice(updated);
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!invoice) return <p>Invoice not found.</p>;

  if (editing) {
    const initial: InvoiceInput = {
      invoice_number: invoice.invoice_number,
      client_name: invoice.client_name,
      client_email: invoice.client_email,
      client_address: invoice.client_address,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      status: invoice.status,
      notes: invoice.notes,
      items: (invoice.items ?? []).map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    };

    return (
      <div>
        <Link to="/" className="back-link">
          Go back
        </Link>
        <h1 style={{ marginBottom: 24 }}>
          Edit <span style={{ color: "var(--color-text-subtle)" }}>#</span>
          {invoice.invoice_number}
        </h1>
        <div className="card">
          <InvoiceForm
            initial={initial}
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  const total = invoiceTotal(invoice.items);

  return (
    <div>
      <Link to="/invoices" className="back-link">
        Go back
      </Link>

      <div className="card detail-card">
        <div className="detail-meta">
          <div className="detail-meta-left">
            <span className="label-text">Status</span>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="detail-actions">
            {invoice.status !== "paid" && (
              <button className="btn btn-primary" onClick={handleMarkPaid}>
                Mark as Paid
              </button>
            )}
            {invoice.status === "draft" && (
              <button
                className="btn btn-secondary"
                onClick={() => handleQuickStatus("sent")}
              >
                Mark as Sent
              </button>
            )}
            {invoice.status === "sent" && (
              <button
                className="btn btn-secondary"
                onClick={() => handleQuickStatus("overdue")}
              >
                Mark as Overdue
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
            <button
              className="btn btn-secondary"
              onClick={() =>
                window.open(`/invoices/${invoice.id}/print`, "_blank")
              }
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <p className="detail-id">
              <span className="hash">#</span>
              {invoice.invoice_number}
            </p>
            {invoice.notes && <p className="detail-desc">{invoice.notes}</p>}
          </div>
          {invoice.client_address && (
            <div
              style={{
                textAlign: "right",
                color: "var(--color-text-subtle)",
                fontSize: 12,
                lineHeight: 1.8,
                whiteSpace: "pre-line",
              }}
            >
              {invoice.client_address}
            </div>
          )}
        </div>

        <div className="detail-grid">
          <div>
            <p className="label">Invoice Date</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
              {formatDate(invoice.issue_date)}
            </p>
            <p className="label" style={{ marginTop: 24 }}>
              Payment Due
            </p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
              {formatDate(invoice.due_date)}
            </p>
          </div>
          <div>
            <p className="label">Bill To</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
              {invoice.client_name}
            </p>
            {invoice.client_email && (
              <>
                <p className="label" style={{ marginTop: 24 }}>
                  Sent to
                </p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
                  {invoice.client_email}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="items-table-wrapper">
          <table className="items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th className="right">QTY.</th>
                <th className="right">Price</th>
                <th className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td className="right muted">{item.quantity}</td>
                  <td className="right muted">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="right">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="items-total">
          <span>Amount Due</span>
          <span className="total-amount">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
