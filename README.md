# 🛒 CartSeven

> **Multi-Location E-Commerce Accounting & Financial Management Platform**  
> Designed for modern online stores with multi-channel revenue, distributed teams across global offices, and automated double-entry bookkeeping.

---

## 🌟 Key Features

### 1. Multi-User & Multi-Location Management (3 Branches)
Designed specifically for teams operating from different global locations:
- **Admin**: `admin@cartseven.com` • **HQ – New York, US**
- **Senior Accountant**: `accountant@cartseven.com` • **Finance Hub – London, UK**
- **Operations Manager**: `manager@cartseven.com` • **Operations – Dubai, UAE**
- **1-Click User Switcher**: Easily switch between user sessions and test location synchronization with zero typing friction.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for invoicing, cost logging, ledger configuration, and team settings.
- **Audit Trail**: Every transaction, status change, and ledger edit records the user's name, email, role, and branch location.

### 2. Executive Financial Dashboard
- **Real-Time KPIs**: Total Sales Revenue, Operating Expenses, COGS, Net Profit, Profit Margin %, Accounts Receivable, and Cash & Merchant balances.
- **Fiscal Analytics**: 6-month interactive Area Chart tracking Revenue vs. Expense trends.
- **Cost Distribution**: Visual breakdown of Ad Spend (Meta/Google), Logistics/Shipping (DHL/3PL), Inventory Purchases, and Platform Subscriptions.
- **Live Branch Status**: Real-time status cards showing which team members are active across New York, London, and Dubai.

### 3. Sales Orders & Invoicing
- **Multi-Platform Support**: Record sales from Shopify, WooCommerce, Amazon Marketplace, or Direct Website.
- **Automated Calculations**: Line items, tax/VAT rates, freight shipping fees, and promotional discounts.
- **Printable Invoices**: Professional, branded invoice layout formatted for print or PDF export.
- **Payment Lifecycle**: Track status across `draft`, `pending`, `partially_paid`, and `paid` with direct ledger integration.

### 4. Expense & Outflow Tracking
- Log operational bills by category:
  - Advertising & Digital Marketing (Meta, Google, TikTok Ads)
  - Courier & 3PL Freight Shipping
  - Supplier Inventory Batches & COGS
  - E-Commerce Platforms & Hosting (Shopify, Klaviyo, AWS)
  - Payment Processing Fees (Stripe, PayPal)
  - Warehousing & Packaging Supplies
- Track payment method, vendor name, receipt reference numbers, and notes.

### 5. Double-Entry General Ledger & Chart of Accounts
- GAAP-compliant classification:
  - **1000s**: Assets (Cash, Bank Accounts, Stripe/PayPal Clearing, Receivables, Inventory)
  - **2000s**: Liabilities (Accounts Payable, Sales Tax/VAT Collected)
  - **3000s**: Equity (Owner's Equity, Retained Earnings)
  - **4000s**: Revenue (Product Sales, Customer Shipping Fees)
  - **5000s**: Expenses (Cost of Goods Sold, Freight, Ad Spend, SaaS)
- Running balance auditing and transaction logs.

### 6. Financial Reports
- **Statement of Profit & Loss (P&L / Income Statement)**: Gross Revenue, Cost of Goods Sold, Gross Margin %, Operating Costs, and Net Income.
- **Balance Sheet**: Assets vs. Liabilities & Equity with balance verification.
- **Sales Tax & VAT Liability Report**: Output tax collected minus input tax paid.
- **Multi-Currency Support**: Instant currency conversion between USD ($), GBP (£), EUR (€), AED (د.إ), and INR (₹).

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Launch (Windows)
Double-click `start-cartseven.bat` in the project root. It will:
1. Start the Express API server on `http://localhost:5000`
2. Start the Vite React client on `http://localhost:5173`
3. Automatically launch your default browser.

### Option 2: Command Line
```bash
# In the project root
npm run dev
```

Or run frontend and backend separately:
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

---

## 👥 Authorized Partner Credentials (Secured in `.env`)

Access to this system is strictly limited to the **3 registered company partners**. All credentials, passwords, and partner access policies are configured and secured in [`server/.env`](file:///C:/Users/Alsha/Desktop/AJMAL%20WORKS/Personal%20work/WORKS/CartSeven/server/.env). 

> **Access Control Policy**: Any unauthorized visitor or non-partner email is blocked and automatically presented with a redirection page to the official public store at [https://cartseven.com/](https://cartseven.com/).

| Partner Name | Role | Configured Email | Password (`.env`) |
| :--- | :--- | :--- | :--- |
| **AJMALSHA** | Managing Partner (Admin) | `ajmalsha@cartseven.com` | `password123` |
| **ASHIQUE SALIM** | Finance Partner (Accountant) | `ashique@cartseven.com` | `password123` |
| **SHANU** | Operations Partner (Manager) | `shanu@cartseven.com` | `password123` |

---

## 📁 Project Structure

```
CartSeven/
├── start-cartseven.bat         # 1-click Windows launcher
├── package.json                # Root concurrent scripts
├── README.md                   # Full documentation
├── server/                     # Backend Node.js / Express API
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── src/
│       ├── index.js            # Express server entry point
│       ├── seed.js             # Initial database seeder
│       ├── config/             # MongoDB connection
│       ├── models/             # Mongoose schemas (User, Invoice, Expense, Account, AuditLog)
│       ├── controllers/        # Business logic & accounting calculations
│       ├── routes/             # REST API endpoints
│       └── middleware/         # JWT auth & location audit logging
└── client/                     # Frontend Vite + React 19 + TypeScript
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx             # Routing & layout configuration
        ├── context/            # AuthContext (multi-user) & CurrencyContext
        ├── components/         # Navbar, Sidebar, modals
        ├── pages/              # Dashboard, Invoices, Expenses, Reports, Team, Audit
        ├── services/           # API fetch client
        └── types/              # TypeScript definitions
```

---

## ☁️ Deployment Guide

### 1. MongoDB Atlas Setup (Cloud Database)
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Obtain your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/cartseven?retryWrites=true&w=majority`
3. Set `MONGO_URI` in `server/.env` (or environment settings in your cloud host).
4. Run `npm run seed` inside the `server/` directory to populate the 3 location accounts.

### 2. Deploying Frontend (Vercel / Netlify)
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- Set rewrite rules for single-page applications (`/*` to `/index.html`).

### 3. Deploying Backend (Render / Railway / Fly.io / VPS)
- **Root Directory**: `server`
- **Start Command**: `node src/index.js`
- **Environment Variables**:
  - `PORT`: `5000` (or host provided)
  - `MONGO_URI`: `<Your MongoDB Atlas connection string>`
  - `JWT_SECRET`: `<Random 32-character string>`
  - `CLIENT_URL`: `<Your deployed frontend URL>`

---

## 🛡️ License
ISC License • Built for CartSeven E-Commerce Operations.
