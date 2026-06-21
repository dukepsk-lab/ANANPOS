# ANANPOS

A construction materials POS system built with Next.js, Prisma, and PostgreSQL. Designed for hardware/building-supply stores with multi-unit product tracking, credit customers, and delivery management.

## Features

- **Point of Sale** — fast product search, multi-unit selling (bag/pallet/ton), retail & contractor pricing, thermal receipt printing
- **Inventory** — stock balances, stock movement history, reorder points
- **Accounts Receivable** — credit invoices, payment tracking, aging report
- **Purchases** — purchase orders from suppliers, stock-in on receipt
- **Deliveries** — delivery board with COD support, driver/vehicle assignment
- **Returns** — customer returns with cash or credit-note refund
- **Reports** — daily sales, inventory snapshot, AR aging
- **Settings** — shop info, VAT rate, backup

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth v5 (PIN-based)
- **UI**: Tailwind CSS, Lucide icons, Sonner toasts
- **PDF**: @react-pdf/renderer for tax invoices
- **Printing**: react-thermal-printer

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# Push schema and seed
npx prisma db push
npx prisma db seed

# Start dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | Direct PostgreSQL connection (for migrations) |
| `NEXTAUTH_SECRET` | Random secret for session signing |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |

## Project Structure

```
app/
  (auth)/login/        # PIN login
  (main)/
    pos/               # Point of sale
    inventory/         # Stock management
    purchases/         # Purchase orders
    ar/                # Accounts receivable
    delivery/          # Delivery board
    returns/           # Customer returns
    reports/           # Daily / inventory / aging
    settings/          # Shop configuration
  api/                 # Route handlers
components/            # Feature UI components
lib/                   # Auth config, utilities
prisma/
  schema.prisma        # Database schema
  seed.ts              # Initial data seed
```

## User Roles

| Role | Access |
|---|---|
| `OWNER` | Full access |
| `CASHIER` | POS, deliveries |
| `STAFF` | Inventory, purchases |
