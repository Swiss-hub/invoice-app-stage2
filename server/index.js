import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { z } from "zod";
import db from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// API key protection (only enforced when API_KEY env var is set)
app.use("/api", (req, res, next) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return next(); // no key set → dev mode, allow all

  const provided = req.headers["x-api-key"];
  if (!provided || provided !== apiKey) {
    return res.status(401).json({ error: "Unauthorized: invalid or missing API key" });
  }
  next();
});

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
});

const invoiceSchema = z.object({
  invoice_number: z.string().min(1),
  client_name: z.string().min(1),
  client_email: z.string().email().optional().nullable(),
  client_address: z.string().optional().nullable(),
  issue_date: z.string().min(1),
  due_date: z.string().min(1),
  status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),
  notes: z.string().optional().nullable(),
  items: z.array(itemSchema).default([]),
});

function getInvoiceWithItems(id) {
  const invoice = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id);
  if (!invoice) return null;
  const items = db
    .prepare("SELECT * FROM invoice_items WHERE invoice_id = ?")
    .all(id);
  return { ...invoice, items };
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Dashboard stats
app.get("/api/stats", (_req, res) => {
  const invoices = db.prepare("SELECT * FROM invoices").all();
  const items = db.prepare("SELECT * FROM invoice_items").all();

  const itemsByInvoice = items.reduce((map, item) => {
    if (!map[item.invoice_id]) map[item.invoice_id] = [];
    map[item.invoice_id].push(item);
    return map;
  }, {});

  function total(inv) {
    const its = itemsByInvoice[inv.id] ?? [];
    return its.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  }

  const byStatus = { draft: 0, sent: 0, paid: 0, overdue: 0 };
  const revenueByStatus = { draft: 0, sent: 0, paid: 0, overdue: 0 };

  for (const inv of invoices) {
    byStatus[inv.status] = (byStatus[inv.status] ?? 0) + 1;
    revenueByStatus[inv.status] = (revenueByStatus[inv.status] ?? 0) + total(inv);
  }

  const overdueInvoices = invoices
    .filter((inv) => inv.status === "overdue")
    .map((inv) => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      client_name: inv.client_name,
      due_date: inv.due_date,
      total: total(inv),
    }));

  res.json({
    total_invoices: invoices.length,
    by_status: byStatus,
    revenue: {
      paid: revenueByStatus.paid,
      outstanding: revenueByStatus.sent + revenueByStatus.overdue,
      draft: revenueByStatus.draft,
    },
    overdue_invoices: overdueInvoices,
  });
});

// ── Clients ──────────────────────────────────────────

// Client list with invoice totals
app.get("/api/clients/stats", (_req, res) => {
  const clients = db.prepare("SELECT * FROM clients ORDER BY name ASC").all();
  const allInvoices = db.prepare("SELECT * FROM invoices").all();
  const allItems = db.prepare("SELECT * FROM invoice_items").all();

  const itemsByInvoice = allItems.reduce((map, item) => {
    if (!map[item.invoice_id]) map[item.invoice_id] = [];
    map[item.invoice_id].push(item);
    return map;
  }, {});

  function invTotal(inv) {
    return (itemsByInvoice[inv.id] ?? []).reduce(
      (s, i) => s + i.quantity * i.unit_price, 0
    );
  }

  const result = clients.map((client) => {
    const mine = allInvoices.filter((inv) => inv.client_name === client.name);
    const paid = mine
      .filter((inv) => inv.status === "paid")
      .reduce((s, inv) => s + invTotal(inv), 0);
    const outstanding = mine
      .filter((inv) => ["sent", "overdue"].includes(inv.status))
      .reduce((s, inv) => s + invTotal(inv), 0);
    return {
      ...client,
      total_invoices: mine.length,
      paid,
      outstanding,
    };
  });

  res.json(result);
});

// List all clients
app.get("/api/clients", (_req, res) => {
  const rows = db.prepare("SELECT * FROM clients ORDER BY name ASC").all();
  res.json(rows);
});

// Create client
app.post("/api/clients", (req, res) => {
  const { name, email, address } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  const id = randomUUID();
  db.prepare(
    "INSERT INTO clients (id, name, email, address) VALUES (?, ?, ?, ?)"
  ).run(id, name.trim(), email ?? null, address ?? null);
  res.status(201).json(
    db.prepare("SELECT * FROM clients WHERE id = ?").get(id)
  );
});

// Update client
app.put("/api/clients/:id", (req, res) => {
  const { name, email, address } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  const result = db
    .prepare(
      "UPDATE clients SET name = ?, email = ?, address = ? WHERE id = ?"
    )
    .run(name.trim(), email ?? null, address ?? null, req.params.id);
  if (result.changes === 0)
    return res.status(404).json({ error: "Client not found" });
  res.json(db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id));
});

// Delete client
app.delete("/api/clients/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM clients WHERE id = ?")
    .run(req.params.id);
  if (result.changes === 0)
    return res.status(404).json({ error: "Client not found" });
  res.status(204).send();
});

// List all invoices
app.get("/api/invoices", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM invoices ORDER BY created_at DESC")
    .all();
  const itemsStmt = db.prepare(
    "SELECT * FROM invoice_items WHERE invoice_id = ?"
  );
  const withItems = rows.map((inv) => ({
    ...inv,
    items: itemsStmt.all(inv.id),
  }));
  res.json(withItems);
});

// Get next available invoice number
app.get("/api/invoices/next-number", (_req, res) => {
  const rows = db.prepare("SELECT invoice_number FROM invoices").all();
  let max = 0;
  for (const row of rows) {
    const match = row.invoice_number.match(/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  const next = String(max + 1).padStart(3, "0");
  res.json({ next: `INV-${next}` });
});

// Get one invoice with items
app.get("/api/invoices/:id", (req, res) => {
  const invoice = getInvoiceWithItems(req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  res.json(invoice);
});

// Create invoice
app.post("/api/invoices", (req, res) => {
  const parsed = invoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const data = parsed.data;
  const id = randomUUID();

  const insertInvoice = db.prepare(`
    INSERT INTO invoices (id, invoice_number, client_name, client_email, client_address, issue_date, due_date, status, notes)
    VALUES (@id, @invoice_number, @client_name, @client_email, @client_address, @issue_date, @due_date, @status, @notes)
  `);
  const insertItem = db.prepare(`
    INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price)
    VALUES (?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    insertInvoice.run({
      id,
      invoice_number: data.invoice_number,
      client_name: data.client_name,
      client_email: data.client_email ?? null,
      client_address: data.client_address ?? null,
      issue_date: data.issue_date,
      due_date: data.due_date,
      status: data.status,
      notes: data.notes ?? null,
    });
    for (const item of data.items) {
      insertItem.run(
        randomUUID(),
        id,
        item.description,
        item.quantity,
        item.unit_price
      );
    }
  });
  tx();

  res.status(201).json(getInvoiceWithItems(id));
});

// Update invoice (replaces items)
app.put("/api/invoices/:id", (req, res) => {
  const existing = db
    .prepare("SELECT id FROM invoices WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Invoice not found" });

  const parsed = invoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const data = parsed.data;
  const id = req.params.id;

  const updateInvoice = db.prepare(`
    UPDATE invoices SET
      invoice_number = @invoice_number,
      client_name = @client_name,
      client_email = @client_email,
      client_address = @client_address,
      issue_date = @issue_date,
      due_date = @due_date,
      status = @status,
      notes = @notes,
      updated_at = datetime('now')
    WHERE id = @id
  `);
  const deleteItems = db.prepare(
    "DELETE FROM invoice_items WHERE invoice_id = ?"
  );
  const insertItem = db.prepare(`
    INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price)
    VALUES (?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    updateInvoice.run({
      id,
      invoice_number: data.invoice_number,
      client_name: data.client_name,
      client_email: data.client_email ?? null,
      client_address: data.client_address ?? null,
      issue_date: data.issue_date,
      due_date: data.due_date,
      status: data.status,
      notes: data.notes ?? null,
    });
    deleteItems.run(id);
    for (const item of data.items) {
      insertItem.run(
        randomUUID(),
        id,
        item.description,
        item.quantity,
        item.unit_price
      );
    }
  });
  tx();

  res.json(getInvoiceWithItems(id));
});

// Update status only
app.patch("/api/invoices/:id/status", (req, res) => {
  const { status } = req.body;
  const allowed = ["draft", "sent", "paid", "overdue"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const result = db
    .prepare(
      "UPDATE invoices SET status = ?, updated_at = datetime('now') WHERE id = ?"
    )
    .run(status, req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  res.json(getInvoiceWithItems(req.params.id));
});

// Delete invoice
app.delete("/api/invoices/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM invoices WHERE id = ?")
    .run(req.params.id);
  if (result.changes === 0)
    return res.status(404).json({ error: "Invoice not found" });
  res.status(204).send();
});

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});