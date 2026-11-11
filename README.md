<div align="center">

# 📈 Forex CRM — Frontend

**A multi-role brokerage CRM: client portal, admin back-office and super-admin console in one React app.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![React Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Routing & Roles](#-routing--roles)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🧭 Overview

This repository holds the frontend of a CRM for forex and crypto brokers. It serves three kinds of users from one codebase. Each role has its own layout, its own routes and its own route guards:

| Role | Base path | Purpose |
| --- | --- | --- |
| **Client** | `/client/*` | Traders manage accounts, funds, copy trading, PAMM and IB partnerships |
| **Admin** | `/admin/*` | Brokerage staff manage users, KYC, payments, partners and support |
| **Super Admin** | `/superadmin/*` | Platform owners handle configuration, billing and admin credentials |

The app talks to a REST backend through Axios and TanStack Query. Live data (positions, trade history, notifications) arrives over **Socket.IO**.

---

## ✨ Features

### 👤 Client Portal
- **Dashboard**: KPI cards, account activity charts and today's performance
- **Trading accounts**: open new accounts, list them (virtualized for large lists), see trading stats
- **Funds**: deposits and withdrawals (bank, crypto and **Stripe card**), internal transfers, transaction history
- **Trading terminal**: live forex and crypto charts (TradingView Lightweight Charts) and trading platforms
- **Copy trading**: become a master, copy other traders, master ratings
- **PAMM**: browse funds, manage investments, run your own fund
- **IB / Partner program**: partner dashboard, downline graph, commissions, IB withdrawals
- **Engagement**: trading contests, refer-a-friend links, support tickets
- **Account security**: profile management, device security and an app tour for onboarding

### 🛠️ Admin Back-Office
- Admin dashboard and client management, including client risk score and *time machine* history
- KYC verification, deposit and withdrawal approvals, payment method setup
- Copy-trading, master, rating and PAMM administration
- IB configuration, IB withdrawals and partner management
- Customer support desk, email logs and transaction monitoring
- **Sub-admins** with granular, permission-based routes
- Client impersonation (with a *stop impersonation* safeguard)

### 🏛️ Super Admin Console
- Platform-wide configuration
- Billing and suspension management
- Admin credential management

### ⚙️ Platform
- Role-based auth with protected, admin-only and permission routes
- Signup with referral codes, plus password reset and recovery
- Light and dark themes, toast notifications, global progress indicator and error boundaries
- Production build split into vendor chunks so the browser can cache them

---

## 🧰 Tech Stack

| Area | Tools |
| --- | --- |
| **Core** | React 19, TypeScript, Vite 7 |
| **Styling / UI** | Tailwind CSS 4, shadcn/ui, Radix UI, Headless UI, Framer Motion |
| **State & data** | Zustand, TanStack Query (+ Devtools), TanStack Virtual, Axios |
| **Real-time** | Socket.IO client |
| **Forms & validation** | React Hook Form, Zod |
| **Charts** | ApexCharts, Recharts, Lightweight Charts |
| **Routing** | React Router 7 |
| **Visuals** | Three.js / React Three Fiber, tsParticles |
| **Tooling** | ESLint 9, Prettier, typescript-eslint |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20 or newer
- **npm** 10 or newer
- A running instance of the CRM **backend API**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/dhirajray-12/crmFrontend.git
cd crmFrontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# then edit .env.local with your backend URLs

# 4. Start the dev server
npm run dev
```

The app runs at **http://localhost:5173**. The root path redirects to `/login`.

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root. You can start from [`.env.example`](.env.example).

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_BACKEND_URL` | Base URL of the CRM backend REST API | `https://api.example.com` |
| `VITE_API_URL` | Base URL of the trading API | `https://trade-api.example.com` |
| `VITE_SOCKET_URL` | Socket.IO server for real-time updates | `https://api.example.com` |
| `VITE_CLIENT_URL` | Public URL of this frontend (for referral links) | `https://crm.example.com` |

> ⚠️ Vite embeds every `VITE_*` variable in the client bundle. **Never put secrets in them.**

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally (port `4173`) |
| `npm run lint` | Run ESLint across the project |

---

## 🗂️ Project Structure

```
src/
├── AdminComponents/   # Admin-only feature modules (copy, PAMM, masters, payments, support…)
├── API/               # Axios instance and API clients
├── assets/            # Static images and media
├── components/        # Client-facing feature components and shared UI (components/ui = shadcn)
├── Constants/         # App-wide constants
├── hooks/             # Data hooks built on React Query
├── Layouts/           # Auth, Client, Admin and SuperAdmin layouts
├── lib/               # Utilities (cn, helpers)
├── pages/             # Route-level pages per role
├── Routes/            # Route trees and guards (Protected, AdminOnly, Permission)
├── Schema/            # Zod validation schemas
├── services/          # Domain services (withdrawal, partner, trading, support…)
├── shared/            # Shared modules across roles
├── Store/             # Zustand stores
├── styles/            # Global styles
├── types/             # Shared TypeScript types
└── utils/             # Generic helpers
```

The `@/` alias maps to `src/`. For example: `import { Button } from "@/components/ui/button"`.

---

## 🧱 Routing & Roles

```
/                      → redirects to /login
/login, /login/:role   → sign in
/create-account        → sign up
/signup/:referralCode  → sign up through a referral link
/forgot-password       → request a password reset
/reset-password/:token → set a new password

/client/*      → Client portal      (dashboard, deposit, withdrawal, copy/*, pamm/*, partner/*, …)
/admin/*       → Admin back-office  (dashboard, kyc-verification, deposits, Partners, subadmins, …)
/superadmin/*  → Super-admin console (dashboard, configuration, billing-suspension, …)
```

Guards in `src/Routes/` (`ProtectedRoutes`, `AdminOnlyRoute`, `PermissionRoute`) check the user's role and sub-admin permissions before a page renders. Users who fail the check go to `/unauthorized`.

---

## ☁️ Deployment

The project includes a [`vercel.json`](vercel.json) that rewrites every path to `index.html`, so client-side routing works on deep links.

1. Import the repository into [Vercel](https://vercel.com).
2. Set the [environment variables](#-environment-variables) in the project settings.
3. Deploy. Vercel runs `npm run build` and serves `dist/`.

Any static host works if you add the same SPA fallback (all routes → `index.html`).

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-change`
2. Commit your changes: `git commit -m "Add my change"`
3. Run `npm run lint` and `npm run build` to make sure everything passes
4. Push the branch and open a Pull Request

---

<div align="center">

Made with ❤️ by **Dhiraj**

</div>
