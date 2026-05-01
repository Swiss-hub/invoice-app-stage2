import type { Invoice, InvoiceInput, Stats } from "../types/invoice";
import type { Client, ClientInput, ClientStats } from "../types/client";

const BASE = "/api";
const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { ...extra };
  if (API_KEY) h["x-api-key"] = API_KEY;
  return h;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listInvoices: () =>
    fetch(`${BASE}/invoices`, { headers: headers() }).then(handle<Invoice[]>),

  getInvoice: (id: string) =>
    fetch(`${BASE}/invoices/${id}`, { headers: headers() }).then(handle<Invoice>),

  getNextNumber: () =>
    fetch(`${BASE}/invoices/next-number`, { headers: headers() })
      .then(handle<{ next: string }>)
      .then((r) => r.next),

  createInvoice: (data: InvoiceInput) =>
    fetch(`${BASE}/invoices`, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    }).then(handle<Invoice>),

  updateInvoice: (id: string, data: InvoiceInput) =>
    fetch(`${BASE}/invoices/${id}`, {
      method: "PUT",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    }).then(handle<Invoice>),

  updateStatus: (id: string, status: string) =>
    fetch(`${BASE}/invoices/${id}/status`, {
      method: "PATCH",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status }),
    }).then(handle<Invoice>),

  deleteInvoice: (id: string) =>
    fetch(`${BASE}/invoices/${id}`, {
      method: "DELETE",
      headers: headers(),
    }).then(handle<void>),

  getStats: () =>
    fetch(`${BASE}/stats`, { headers: headers() }).then(handle<Stats>),

  listClients: () =>
    fetch(`${BASE}/clients`, { headers: headers() }).then(handle<Client[]>),

  listClientsWithStats: () =>
    fetch(`${BASE}/clients/stats`, { headers: headers() }).then(handle<ClientStats[]>),

  createClient: (data: ClientInput) =>
    fetch(`${BASE}/clients`, {
      method: "POST",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    }).then(handle<Client>),

  updateClient: (id: string, data: ClientInput) =>
    fetch(`${BASE}/clients/${id}`, {
      method: "PUT",
      headers: headers({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    }).then(handle<Client>),

  deleteClient: (id: string) =>
    fetch(`${BASE}/clients/${id}`, {
      method: "DELETE",
      headers: headers(),
    }).then(handle<void>),
};