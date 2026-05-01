import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { ClientInput, ClientStats } from "../types/client";
import { formatCurrency } from "../lib/format";

const empty: ClientInput = { name: "", email: "", address: "" };

function ClientForm({
  initial,
  onSave,
  onCancel,
  title,
}: {
  initial: ClientInput;
  onSave: (data: ClientInput) => Promise<void>;
  onCancel: () => void;
  title: string;
}) {
  const [form, setForm] = useState<ClientInput>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ClientInput>(key: K, value: ClientInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...form,
        email: form.email || null,
        address: form.address || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="client-form-card">
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="label">Name *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="label">Address</label>
            <textarea
              className="textarea"
              rows={2}
              value={form.address ?? ""}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Client"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function load() {
    return api
      .listClientsWithStats()
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(data: ClientInput) {
    await api.createClient(data);
    setAdding(false);
    load();
  }

  async function handleUpdate(id: string, data: ClientInput) {
    await api.updateClient(id, data);
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This won't delete their invoices.`)) return;
    await api.deleteClient(id);
    load();
  }

  if (loading) return <p>Loading clients…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div>
      <header className="list-header">
        <div>
          <h1>Clients</h1>
          <p>
            {clients.length === 0
              ? "No clients yet"
              : `${clients.length} ${clients.length === 1 ? "client" : "clients"}`}
          </p>
        </div>
        {!adding && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
          >
            + New Client
          </button>
        )}
      </header>

      {adding && (
        <ClientForm
          title="New Client"
          initial={empty}
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
        />
      )}

      {clients.length === 0 && !adding ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <h2>No clients yet</h2>
          <p style={{ color: "var(--color-text-subtle)", marginTop: 8 }}>
            Add your first client to reuse their details on invoices.
          </p>
        </div>
      ) : (
        <div className="clients-grid">
          {clients.map((client) =>
            editingId === client.id ? (
              <div key={client.id} style={{ gridColumn: "1 / -1" }}>
                <ClientForm
                  title={`Edit ${client.name}`}
                  initial={{
                    name: client.name,
                    email: client.email,
                    address: client.address,
                  }}
                  onSave={(data) => handleUpdate(client.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div key={client.id} className="client-card">
                <h3>{client.name}</h3>
                {client.email && <p>✉ {client.email}</p>}
                {client.address && <p>📍 {client.address}</p>}

                <div className="client-totals">
                  <div className="client-total-item">
                    <span className="client-total-label">Invoices</span>
                    <span className="client-total-value">
                      {client.total_invoices}
                    </span>
                  </div>
                  <div className="client-total-item paid">
                    <span className="client-total-label">Paid</span>
                    <span className="client-total-value">
                      {formatCurrency(client.paid)}
                    </span>
                  </div>
                  <div className="client-total-item outstanding">
                    <span className="client-total-label">Owed</span>
                    <span className="client-total-value">
                      {formatCurrency(client.outstanding)}
                    </span>
                  </div>
                </div>

                <div className="client-actions">
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "8px 14px", fontSize: 12 }}
                    onClick={() => {
                      setEditingId(client.id);
                      setAdding(false);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "8px 14px", fontSize: 12 }}
                    onClick={() => handleDelete(client.id, client.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
