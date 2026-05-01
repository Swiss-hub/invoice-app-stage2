# Invoice App

A full-stack invoice management application built with React, TypeScript, Express, and SQLite.

## Features

- **Dashboard** = at-a-glance revenue summary, invoice counts by status, and overdue alerts
- **Invoice list** = search by invoice number or client name, filter by status (draft / sent / paid / overdue)
- **Create & edit invoices** = line-item form with running totals, client details, and date pickers
- **Status management** = one-click "Mark as Paid", "Mark as Sent", and "Mark as Overdue" actions
- **PDF export** = browser-native print-to-PDF with a clean, print-optimised layout
- **Auto-numbered invoices** = sequential invoice numbers (INV-001, INV-002…) generated automatically
- **Persistent storage** = SQLite database via better-sqlite3; no external database required

## Tech Stack

| Layer      | Technology                 |
| ---------- | -------------------------- |
| Frontend   | React 18, TypeScript, Vite |
| Routing    | React Router v6            |
| Backend    | Node.js, Express           |
| Database   | SQLite (better-sqlite3)    |
| Validation | Zod                        |
| Dev server | Nodemon                    |

## Project Structure

invoice-app-stage2/
├── client/ # React + Vite frontend
│ ├── src/
│ │ ├── components/ # Shared UI components
│ │ │ ├── InvoiceFilters.tsx
│ │ │ ├── InvoiceForm.tsx
│ │ │ └── StatusBadge.tsx
│ │ ├── lib/ # API client and helpers
│ │ │ ├── api.ts
│ │ │ └── format.ts
│ │ ├── pages/ # Route-level page components
│ │ │ ├── DashboardPage.tsx
│ │ │ ├── InvoiceDetailPage.tsx
│ │ │ ├── InvoiceFormPage.tsx
│ │ │ ├── InvoiceListPage.tsx
│ │ │ └── InvoicePrintPage.tsx
│ │ ├── types/
│ │ │ └── invoice.ts
│ │ ├── App.tsx
│ │ ├── index.css
│ │ └── main.tsx
│ └── vite.config.ts
│
├── server/ # Express API
│ ├── db.js # SQLite setup and schema
│ ├── index.js # Express routes
│ └── invoices.db # SQLite database (git-ignored)
│
└── README.md

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Clone the repo

```bash
git clone https://github.com/your-username/invoice-app-stage2.git
cd invoice-app-stage2

2. Install server dependencies
cd server
npm install

3. Install client dependencies
cd ../client
npm install

4. Start the development servers
Open two terminals:

Terminal 1 — API server (port 4000):

cd server
npm run dev

Terminal 2 — React dev server (port 5173):

cd client
npm run dev

Then open http://localhost:5173 in your browser.

API Reference
Method	Endpoint	Description
GET	/health	Health check
GET	/api/stats	Dashboard statistics
GET	/api/invoices	List all invoices (includes items)
GET	/api/invoices/next-number	Get next auto-generated invoice number
GET	/api/invoices/:id	Get a single invoice with items
POST	/api/invoices	Create a new invoice
PUT	/api/invoices/:id	Update an invoice (replaces items)
PATCH	/api/invoices/:id/status	Update invoice status only
DELETE	/api/invoices/:id	Delete an invoice
Invoice Status Flow
draft → sent → paid
         ↓
       overdue → paid

Environment Variables
Variable	Default	Description
PORT	4000	Port for the Express API server
License
MIT

## 3. Test the deep-linked filters
1. Go to `http://localhost:5173`
2. On the dashboard, click one of the coloured status pills (e.g. **paid**)
3. You should land on `/invoices?status=paid` with the "paid" checkbox already ticked in the filter dropdown
4. The count label should read e.g. "1 of 3 invoices"
5. Clear the filter checkbox and all invoices come back
```
