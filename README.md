# Invoice App

## A full-stack invoice management application built with React, TypeScript, Express, and SQLite. Designed for freelancers and small businesses to create, track, and manage invoices from a clean, responsive interface.

## Features

- **Dashboard** — revenue summary, invoice counts by status, overdue alerts with deep links
- **Invoice list** — search by number or client, filter by status, due-date urgency highlighting
- **Create & edit invoices** — line-item form with running totals, auto-generated invoice numbers, saved client picker
- **Invoice detail** — full breakdown with one-click status actions (Mark as Paid, Sent, Overdue)
- **PDF export** — browser-native print-to-PDF with a clean print layout
- **Client management** — save client details, view per-client paid/outstanding totals
- **Dark mode** — OS preference detection with manual toggle, persisted to localStorage
- **Keyboard shortcuts** — `N` new invoice, `/` search, `Esc` back/clear, `?` shortcut help
- **API key protection** — all `/api/*` routes require a secret key in production
- **Responsive** — desktop sidebar, mobile bottom navigation, single-column layouts on small screens

---

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Frontend   | React 18, TypeScript, Vite         |
| Routing    | React Router v6                    |
| Backend    | Node.js 20, Express                |
| Database   | SQLite via better-sqlite3          |
| Validation | Zod                                |
| Dev tools  | Nodemon, Vite proxy                |
| Deployment | Railway (combined server + client) |

---

## Project Structure

invoice-app-stage2/
├── client/ # React + Vite frontend
│ ├── .env # Local env vars (git-ignored)
│ ├── vite.config.ts
│ └── src/
│ ├── components/
│ │ ├── InvoiceFilters.tsx # Search + status filter dropdown
│ │ ├── InvoiceForm.tsx # Shared create/edit form
│ │ ├── ShortcutsModal.tsx # Keyboard shortcut reference dialog
│ │ └── StatusBadge.tsx # Status pill component
│ ├── lib/
│ │ ├── api.ts # Typed API client (all fetch calls)
│ │ ├── format.ts # Currency, date, total helpers
│ │ ├── useKeyboardShortcuts.ts
│ │ └── useTheme.ts # Dark/light mode hook
│ ├── pages/
│ │ ├── DashboardPage.tsx
│ │ ├── InvoiceListPage.tsx
│ │ ├── InvoiceDetailPage.tsx
│ │ ├── InvoiceFormPage.tsx
│ │ ├── InvoicePrintPage.tsx
│ │ └── ClientsPage.tsx
│ ├── types/
│ │ ├── invoice.ts
│ │ └── client.ts
│ ├── App.tsx
│ ├── index.css
│ └── main.tsx
│
├── server/
│ ├── db.js # SQLite setup and schema
│ ├── index.js # Express app and all routes
│ └── invoices.db # SQLite database (git-ignored)
│
├── package.json # Root scripts for build and start
├── railway.json # Railway deployment config
└── README.md

---

## Local Development

### Prerequisites

- Node.js 20+
- npm 9+

### 1. Clone the repo

```bash
git clone https://github.com/Swiss-hub/invoice-app-stage2.git
cd invoice-app-stage2

2. Install dependencies
# Server
cd server && npm install
# Client
cd ../client && npm install

3. Create the client environment file
Create client/.env:

VITE_API_KEY=

Leave VITE_API_KEY empty for local development — the server skips API key checks when API_KEY is not set.

4. Start the development servers
Open two terminals:

Terminal 1 — API server (port 4000):

cd server
npm run dev

Terminal 2 — React dev server (port 5173):

cd client
npm run dev

Open http://localhost:5173.

The Vite dev server proxies all /api/* requests to http://localhost:4000 automatically.

Environment Variables
Server
Variable	Default	Description
PORT	4000	Port for the Express server
API_KEY	(unset)	Secret key required on all /api/* requests. If unset, protection is disabled (dev mode).
DB_PATH	./server/invoices.db	Absolute path to the SQLite database file
NODE_ENV	development	Set to production to enable static file serving
Client (Vite)
Variable	Description
VITE_API_KEY	Must match the server's API_KEY. Baked into the JS bundle at build time.
Never commit .env files or API keys to version control.

Production Build (local test)
# Build the React client
cd client
npm run build
# Start the combined server
cd ..
set NODE_ENV=production          # Windows
export NODE_ENV=production       # Mac/Linux
node server/index.js

Open http://localhost:4000 — Express serves the React app and handles all API routes from one process.

Deployment — Railway
This app is configured for Railway as a single combined service.

Steps
Push your code to GitHub
Go to railway.app → New Project → Deploy from GitHub repo
Select Swiss-hub/invoice-app-stage2
Railway auto-detects the railway.json config and starts building
Add a persistent volume (required for SQLite)
In Railway → your service → Volumes tab:

Click Add Volume
Mount path: /data
Set environment variables
In Railway → your service → Variables tab:

Variable	Value
NODE_ENV	production
API_KEY	your secret key (generate with node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
VITE_API_KEY	same key as API_KEY
DB_PATH	/data/invoices.db
VITE_API_KEY must be set before the first build because Vite embeds it at compile time.

Trigger a redeploy
After setting variables, go to Deployments → click Redeploy to rebuild with the new env vars.

Your app will be live at https://your-project.up.railway.app.

API Reference
All /api/* endpoints require the x-api-key header in production:

x-api-key: your-secret-key

Method	Endpoint	Description
GET	/health	Health check (no auth required)
GET	/api/stats	Dashboard statistics
GET	/api/invoices	List all invoices with items
GET	/api/invoices/next-number	Next auto-generated invoice number
GET	/api/invoices/:id	Single invoice with items
POST	/api/invoices	Create invoice
PUT	/api/invoices/:id	Update invoice (replaces items)
PATCH	/api/invoices/:id/status	Update status only
DELETE	/api/invoices/:id	Delete invoice
GET	/api/clients	List all clients
GET	/api/clients/stats	Clients with invoice totals
POST	/api/clients	Create client
PUT	/api/clients/:id	Update client
DELETE	/api/clients/:id	Delete client
Invoice Status Flow
draft ──→ sent ──→ paid
            │
            └──→ overdue ──→ paid

Keyboard Shortcuts
Key	Action
N	New invoice
/	Focus search bar
Esc	Go back / clear search
?	Show shortcut reference
Shortcuts are disabled when focus is inside any input field.

License
MIT
```
