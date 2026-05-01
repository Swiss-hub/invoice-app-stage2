import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InvoiceForm from "../components/InvoiceForm";
import { api } from "../lib/api";
import type { InvoiceInput } from "../types/invoice";

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const [nextNumber, setNextNumber] = useState<string | null>(null);

  useEffect(() => {
    api
      .getNextNumber()
      .then(setNextNumber)
      .catch(() => setNextNumber("INV-001"));
  }, []);

  async function handleCreate(data: InvoiceInput) {
    const created = await api.createInvoice(data);
    navigate(`/invoices/${created.id}`);
  }

  if (nextNumber === null) return <p>Loading…</p>;

  const initial: InvoiceInput = {
    invoice_number: nextNumber,
    client_name: "",
    client_email: "",
    client_address: "",
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: new Date().toISOString().slice(0, 10),
    status: "draft",
    notes: "",
    items: [{ description: "", quantity: 1, unit_price: 0 }],
  };

  return (
    <div>
      <Link to="/invoices" className="back-link">
        Go back
      </Link>
      <h1 style={{ marginBottom: 24 }}>New Invoice</h1>
      <div className="card">
        <InvoiceForm
          initial={initial}
          onSubmit={handleCreate}
          submitLabel="Save & Send"
          onCancel={() => navigate("/")}
        />
      </div>
    </div>
  );
}
