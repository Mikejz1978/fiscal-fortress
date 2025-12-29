# Fiscal Fortress - Financial Security App

## Overview
Fiscal Fortress is a personal financial security application that helps users take complete control of their money through:
- **Strict Envelope Budgeting**: Non-negotiable bills (rent, car, insurance, utilities) are always funded first
- **Virtual Account System**: Separate buckets for Bills, Spending, and Savings
- **Debt Elimination Tracking**: Track debts with bi-weekly payment options to pay off faster
- **AI Financial Advisor**: Real-time "Can I buy this?" advice based on actual budget status
- **Tax Write-Off Tracking**: Mark business expenses for easier tax preparation
- **Employee Payment Management**: Track employee payments (base + per-task payments)

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **AI**: OpenAI via Replit AI Integrations (no API key needed)

## Project Structure
```
client/
  src/
    components/       # Reusable UI components
      app-sidebar.tsx # Main navigation sidebar
      theme-*.tsx     # Dark/light theme components
      ui/             # shadcn/ui components
    pages/            # Route pages
      dashboard.tsx   # Main dashboard with Safe to Spend
      envelopes.tsx   # Budget envelope management
      debts.tsx       # Debt tracking and payoff
      advisor.tsx     # AI financial advisor chat
      transactions.tsx # Transaction history
      landing.tsx     # Public landing page
    hooks/            # Custom React hooks
    lib/              # Utilities and query client

server/
  routes.ts           # API endpoints
  storage.ts          # Database operations
  db.ts               # Database connection
  replit_integrations/
    auth/             # Authentication integration
    chat/             # Chat integration (unused)
    batch/            # Batch processing utilities
    image/            # Image generation (unused)

shared/
  schema.ts           # Drizzle ORM schemas
  models/
    auth.ts           # User/session schemas
    chat.ts           # Conversation schemas
```

## Key Features

### Dashboard
- **Safe to Spend**: Shows available money after strict envelopes are funded
- **Virtual Accounts Overview**: Bills, Spending, and Savings balances
- **Envelope Preview**: Quick view of top budget envelopes
- **Debt Summary**: Total debt and progress
- **Upcoming Bills**: Bills due soon with urgency indicators

### Envelopes
- Create envelopes for different spending categories
- Mark envelopes as "Strict" (non-negotiable like rent, car payment)
- Track spending vs budget with progress bars
- Color-coded categories

### Debts
- Track multiple debts with interest rates
- Enable bi-weekly payments (pays off faster)
- Estimated payoff timeline
- Progress visualization

### AI Advisor
- Ask "Can I buy this?" questions
- Real-time budget analysis
- Tax write-off suggestions
- Streaming AI responses

### Transactions
- Log income and expenses
- Mark transactions as tax write-offs
- Filter by type or write-off status
- Assign to envelopes and accounts

## Database Schema
- `users` - User accounts (Replit Auth)
- `sessions` - Session storage
- `envelopes` - Budget envelopes
- `virtual_accounts` - Bills/Spending/Savings accounts
- `debts` - Debt tracking
- `transactions` - Transaction history
- `bills` - Recurring bills
- `employee_payments` - Employee payment tracking
- `incomes` - Income sources

## Development
- Run `npm run dev` to start the development server
- Run `npm run db:push` to sync database schema
- Frontend runs on port 5000

## User Preferences
- Dark mode support (system/light/dark toggle)
- Data is auto-seeded on first login with example envelopes, debts, and accounts
