export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceInput {
    invoice_number: string;
    client_name: string;
    client_email?: string | null;
    client_address?: string | null;
    issue_date: string;
    due_date: string;
    status: InvoiceStatus;
    notes?: string | null;
    items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
    }>;
}

export interface Stats {
  total_invoices: number;
  by_status: Record<InvoiceStatus, number>;
  revenue: {
    paid: number;
    outstanding: number;
    draft: number;
  };
  overdue_invoices: Array<{
    id: string;
    invoice_number: string;
    client_name: string;
    due_date: string;
    total: number;
  }>;
}

export interface ActivityEntry {
  id: string;
  type: string;
  entity_id: string | null;
  entity_label: string | null;
  description: string;
  created_at: string;
}