# DESH Digital Hub

A modern, highly optimized, and scalable Point of Sale (POS) and Management Dashboard built with React, Vite, and Supabase.

## 🚀 Key Features

* **High-Performance POS System**: Fully optimized checkout flow utilizing `React.memo`, `useMemo`, and `useCallback` for zero-lag cart operations.
* **Lazy Loaded Routes**: Code-splitting powered by `React.lazy` and `Suspense` ensures lightning-fast initial load times.
* **PostgreSQL & Real-time Integration**: Direct integration with Supabase for normalized relational data, live sales, expenses, and customer tracking.
* **Premium UI/UX**: Built with TailwindCSS and `framer-motion` for a glassmorphism aesthetic with micro-animations.
* **PWA Ready**: Works offline and can be installed as a progressive web app.
* **Smart Customer Directory**: Auto-saves customers during checkout and provides auto-complete suggestions.

## 🏗️ New Folder Structure & Architecture

```text
src/
├── assets/                 # Static assets (images, fonts)
├── components/             # Reusable UI components
│   ├── Loader.jsx          # Generic Suspense fallback
│   └── DeleteConfirmModal.jsx 
├── config/                 # Supabase client config
├── constants/              # Global constants
├── layouts/                # Layout wrappers (AdminLayout)
├── pages/                  # Route level components
│   └── Admin/
│       ├── index.jsx       # Main Entry (Lazy loads tabs via Suspense)
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── POS.jsx
│       ├── Repairs.jsx
│       ├── Customers.jsx
│       ├── CustomerDirectory.jsx
│       ├── Expenses.jsx
│       └── ItemsManager.jsx
└── utils/                  # Helper functions (e.g. toast notifications, sync)
```

## 🛠️ Refactoring & Optimization Decisions

* **Route-Level Code Splitting**: Restructured `src/pages/Admin/index.jsx` to dynamically load heavy components like `Repairs` and `Dashboard` using `React.lazy()`. This massively reduces the main chunk size.
* **Suspense Integration**: Implemented a globally reusable `<Loader />` component to handle asynchronous chunk loading elegantly.
* **Component Memoization**: Verified and enforced `React.memo` on heavily rendered lists (e.g. `POSItem`, `CartItem`, `CategoryTab`) to completely eliminate wasted re-renders.
* **DRY Principle**: Reduced redundant component definitions and centralized UI state management.

## 💻 Tech Stack

* **Frontend**: React 18, Vite
* **Styling**: Tailwind CSS
* **Database/Auth**: Supabase (PostgreSQL, Supabase Auth)
* **Icons**: Lucide React
* **Charts**: Recharts
* **Animations**: Framer Motion

## 📦 Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```
