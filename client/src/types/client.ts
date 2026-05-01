export interface Client {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface ClientInput {
  name: string;
  email?: string | null;
  address?: string | null;
}

export interface ClientStats extends Client {
  total_invoices: number;
  paid: number;
    outstanding: number;
}