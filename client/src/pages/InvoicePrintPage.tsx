import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Invoice } from "../types/invoice";
import { formatCurrency, formatDate, invoiceTotal } from "../lib/format";

export default function InvoicePrintPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getInvoice(id)
      .then((inv) => {
        setInvoice(inv);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (invoice) {
      document.title = `Invoice ${invoice.invoice_number}`;
      setTimeout(() => window.print(), 300);
    }
  }, [invoice]);

  if (error)
    return <p style={{ color: "crimson", padding: 32 }}>Error: {error}</p>;
  if (!invoice) return <p style={{ padding: 32 }}>Preparing PDF…</p>;

  const total = invoiceTotal(invoice.items);

  return (
    <div className="print-page">
      <header className="print-header">
        <div>
          <h1 className="print-logo">IV</h1>
        </div>
        <div className="print-id-block">
          <h2 className="print-invoice-number">
            <span className="print-hash">#</span>
            {invoice.invoice_number}
          </h2>
          {invoice.notes && <p className="print-desc">{invoice.notes}</p>}
        </div>
      </header>

      <section className="print-meta">
        <div>
          <p className="print-label">Invoice Date</p>
          <p className="print-value">{formatDate(invoice.issue_date)}</p>
          <p className="print-label" style={{ marginTop: 24 }}>
            Payment Due
          </p>
          <p className="print-value">{formatDate(invoice.due_date)}</p>
        </div>
        <div>
          <p className="print-label">Bill To</p>
          <p className="print-value">{invoice.client_name}</p>
          {invoice.client_address && (
            <p className="print-address">{invoice.client_address}</p>
          )}
        </div>
        {invoice.client_email && (
          <div>
            <p className="print-label">Sent To</p>
            <p className="print-value">{invoice.client_email}</p>
          </div>
        )}
        <div>
          <p className="print-label">Status</p>
          <p className={`print-status status-${invoice.status}`}>
            {invoice.status}
          </p>
        </div>
      </section>

      <table className="print-items">
        <thead>
          <tr>
            <th className="left">Item Name</th>
            <th className="right">QTY.</th>
            <th className="right">Price</th>
            <th className="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.items ?? []).map((item) => (
            <tr key={item.id}>
              <td className="bold">{item.description}</td>
              <td className="right muted">{item.quantity}</td>
              <td className="right muted">{formatCurrency(item.unit_price)}</td>
              <td className="right bold">
                {formatCurrency(item.quantity * item.unit_price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-total-bar">
        <span>Amount Due</span>
        <span className="print-total-amount">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
