import { useEffect, useState } from "react";
import type { Client } from "../types/client";
import { api } from "../lib/api";
import type { InvoiceInput, InvoiceStatus } from "../types/invoice";

interface Props {
  initial?: InvoiceInput;
  onSubmit: (data: InvoiceInput) => Promise<void> | void;
  submitLabel?: string;
  onCancel?: () => void;
}

const empty: InvoiceInput = {
  invoice_number: "",
  client_name: "",
  client_email: "",
  client_address: "",
  issue_date: new Date().toISOString().slice(0, 10),
  due_date: new Date().toISOString().slice(0, 10),
  status: "draft",
  notes: "",
  items: [{ description: "", quantity: 1, unit_price: 0 }],
};

export default function InvoiceForm({
  initial,
  onSubmit,
  submitLabel = "Save & Send",
  onCancel,
}: Props) {
  const [form, setForm] = useState<InvoiceInput>(initial ?? empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    api
      .listClients()
      .then(setClients)
      .catch(() => {});
  }, []);

  function applyClient(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    setForm((f) => ({
      ...f,
      client_name: client.name,
      client_email: client.email ?? "",
      client_address: client.address ?? "",
    }));
  }

  function update<K extends keyof InvoiceInput>(
    key: K,
    value: InvoiceInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateItem(
    index: number,
    patch: Partial<InvoiceInput["items"][number]>,
  ) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  }

  function addItem() {
    setForm((f) => ({
      ...f,
      items: [...f.items, { description: "", quantity: 1, unit_price: 0 }],
    }));
  }

  function removeItem(index: number) {
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        client_email: form.client_email || null,
        client_address: form.client_address || null,
        notes: form.notes || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <p className="form-section-title">Bill From</p>
        <div className="form-row">
          <div className="form-field">
            <label className="label">Invoice #</label>
            <input
              className="input"
              value={form.invoice_number}
              onChange={(e) => update("invoice_number", e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label className="label">Status</label>
            <select
              className="select"
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as InvoiceStatus)
              }
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {clients.length > 0 && (
        <div className="form-field">
          <label className="label">Pick a saved client</label>
          <div className="client-picker">
            <select
              className="select"
              defaultValue=""
              onChange={(e) => applyClient(e.target.value)}
            >
              <option value="" disabled>
                Select a client to auto-fill…
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="form-section">
        <p className="form-section-title">Bill To</p>
        <div className="form-field">
          <label className="label">Client's Name</label>
          <input
            className="input"
            value={form.client_name}
            onChange={(e) => update("client_name", e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label className="label">Client's Email</label>
          <input
            className="input"
            type="email"
            value={form.client_email ?? ""}
            onChange={(e) => update("client_email", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="label">Client's Address</label>
          <textarea
            className="textarea"
            rows={3}
            value={form.client_address ?? ""}
            onChange={(e) => update("client_address", e.target.value)}
          />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label className="label">Invoice Date</label>
            <input
              className="input"
              type="date"
              value={form.issue_date}
              onChange={(e) => update("issue_date", e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label className="label">Payment Due</label>
            <input
              className="input"
              type="date"
              value={form.due_date}
              onChange={(e) => update("due_date", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 style={{ color: "#777f98", fontSize: 18, marginBottom: 16 }}>
          Item List
        </h2>
        <div className="item-row" style={{ marginBottom: 8 }}>
          <span className="label">Item Name</span>
          <span className="label">Qty.</span>
          <span className="label">Price</span>
          <span className="label" style={{ textAlign: "right" }}>
            Total
          </span>
          <span></span>
        </div>
        {form.items.map((item, i) => (
          <div key={i} className="item-row">
            <input
              className="input"
              value={item.description}
              onChange={(e) => updateItem(i, { description: e.target.value })}
              required
            />
            <input
              className="input"
              type="number"
              min="0"
              step="1"
              value={item.quantity}
              onChange={(e) =>
                updateItem(i, { quantity: Number(e.target.value) })
              }
              required
            />
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={item.unit_price}
              onChange={(e) =>
                updateItem(i, { unit_price: Number(e.target.value) })
              }
              required
            />
            <span className="static-total">
              {(item.quantity * item.unit_price).toFixed(2)}
            </span>
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeItem(i)}
              disabled={form.items.length === 1}
              aria-label="Remove item"
            >
              🗑
            </button>
          </div>
        ))}
        <button type="button" className="btn-add-item" onClick={addItem}>
          + Add New Item
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
