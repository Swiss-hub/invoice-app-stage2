import type { Invoice, InvoiceInput, Stats } from "../types/invoice";
import type { Client, ClientInput, ClientStats } from "../types/client";

const BASE = "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
    listClients: () =>
        fetch(`${BASE}/clients`).then(handle<Client[]>),

    createClient: (data: ClientInput ) =>
        fetch(`${BASE}/clients`, {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(data),
        }).then(handle<Client>),

    updateClient: (id: string, data: ClientInput) =>
        fetch(`${BASE}/clients/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(handle<Client>),

    deleteClient: (id: string) =>
        fetch(`${BASE}/clients/${id}`, {
            method: "DELETE",
        }).then(handle<void>),

    listClientsWithStats: () =>
        fetch(`${BASE}/clients/stats`).then(handle<ClientStats[]>),

    listInvoices: () =>
        fetch(`${BASE}/invoices`).then(handle<Invoice[]>),
    
    getInvoice: (id: string) =>
        fetch(`${BASE}/invoices/${id}`).then(handle<Invoice>),

    createInvoice: (data: InvoiceInput) =>
        fetch(`${BASE}/invoices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(handle<Invoice>),

    updateInvoice: (id: string, data: InvoiceInput) =>
        fetch(`${BASE}/invoices/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(handle<Invoice>),

    updateStatus: (id: string, status: string) =>
        fetch(`${BASE}/invoices/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        }).then(handle<Invoice>),

    deleteInvoice: (id: string) =>
        fetch(`${BASE}/invoices/${id}`, {
            method: "DELETE",
        }).then(handle<void>),

    getNextNumber: () =>
        fetch(`${BASE}/invoices/next-number`)
            .then(handle<{ next: string }>)
            .then((r) => r.next),

    getStats: () => fetch(`${BASE}/stats`).then(handle<Stats>),
};