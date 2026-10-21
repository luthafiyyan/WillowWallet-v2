<p align="center">
  <img src="public/logo.png" width="110" height="110" alt="WillowWallet Logo" />
</p>

<h1 align="center">WillowWallet v2</h1>

<p align="center">
  <strong>Modern, Privacy-Conscious Personal Finance & Expense Tracker PWA</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript_5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/PWA-Ready-128E64?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-accounting--design-principles">Accounting Principles</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-database-schema">Database Schema</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-connecting-your-own-firebase-optional">Firebase Setup</a> •
  <a href="#-author">Author</a>
</p>

---

## 🍃 Overview

**WillowWallet v2** is a fast, elegant, and privacy-first progressive web application (PWA) designed to give individuals complete control over their personal cash flow, budgeting, and financial health. Built from the ground up with modern web technologies, it features an intuitive single-entry cash-basis tracker, intelligent analytics, and real-time cloud synchronization without unnecessary bloat.

Whether you run it in **100% Offline Sandbox Mode** using local browser storage or connect it to your personal **Firebase Realtime Database**, WillowWallet ensures your financial records remain private, accessible, and easily exportable at any time.

---

## ✨ Key Features

### 📊 1. Intelligent Analytics & Accounting Insights
- **Historical Period Filter**: Freely navigate through any past month/year or jump directly to the current month to review historical performance.
- **Cash Flow Visualizer**: Interactive 6-month rolling trend bar chart for Income vs. Expense comparisons.
- **Interactive Expense Breakdown**: Donut chart with real-time hover and touch-tap nominal revealing (view exact Rupiah amounts alongside percentages).
- **Rule of 50/30/20**: Automated allocation breakdown separating *Needs* vs. *Wants*.
- **Saving Rate & Daily Averages**: Dynamically calculated based on actual elapsed days for the active period.
- **Automated AI Insights**: Contextual, rule-based financial advice tailored to your spending habits.

### 🎯 2. Category-Based Budget Management
- **Expense Ceilings**: Set monthly expenditure limits on specific categories.
- **Visual Progress & Alerts**: Color-coded progress meters indicating *Safe* (green), *Caution* (amber at 80%), and *Blown* (red over budget) statuses.
- **Historical Budget Evaluation**: Check budget performance against historical months.

### 💳 3. Bookkeeping & Journaling
- **Streamlined Transaction Entry**: Record Date, Type (*Income* or *Expense*), Category, Nominal Amount, and Notes in seconds.
- **Advanced Realtime Search & Filtering**: Filter records by timeframe (Today, Week, Month, Year, All) and type, or search by text description.
- **Audit Trail**: Every record contains immutable timestamps (`createdAt`, `updatedAt`) for tracking edits.

### 🌐 4. Dual-Engine Architecture
- **Offline Sandbox Mode**: Zero configuration required. New users can immediately test and track finances with zero cloud dependency.
- **Firebase Live Cloud Sync**: Connect your own Firebase Realtime Database and Authentication with a single JSON config paste.

### 📁 5. Data Sovereignty & Portability
- **Spreadsheet CSV Export**: Download complete transaction ledgers formatted for Microsoft Excel and Google Sheets.
- **Full Database JSON Backup**: Export comprehensive JSON snapshots containing transactions, budgets, and user settings.
- **Custom Categories**: View, add, and organize personalized spending categories directly from the Profile tab.

### 📱 6. Premium Mobile & PWA Experience
- **Installable Native Feel**: Add to Home Screen on iOS, Android, macOS, and Windows with standalone desktop/mobile shell support.
- **Offline-Ready Service Worker**: Automatically caches assets for seamless access even without internet connectivity.
- **Multi-Language Support**: Seamlessly toggle between 🇮🇩 **Bahasa Indonesia** and 🇬🇧 **English**.
- **Dark Mode**: OLED-friendly dark theme optimized for low-light comfort.

---

## 📐 Accounting & Design Philosophy

WillowWallet v2 follows strict, practical financial accounting principles tailored for personal and micro-scale financial management:

1. **Cash Basis Over Accrual**: Transactions reflect actual cash inflows and outflows at the moment they occur, avoiding complex accounts receivable/payable overhead.
2. **Strict Periodicity Principle**: Analytics are strictly scoped per monthly period rather than mixing historical and current cash flows into one distorted metric.
3. **No Over-Engineering ("Jangan yang aneh-aneh")**: Avoids cumbersome corporate double-entry debit/credit journals and depreciation schedules that hinder daily bookkeeping speed.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Core Framework** | [React 19](https://react.dev/) | Modern concurrent UI engine |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) | Type-safe static analysis |
| **Build Tool** | [Vite 6](https://vitejs.dev/) | Ultra-fast HMR and bundle optimization |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first CSS design system |
| **Charts** | [Recharts](https://recharts.org/) | Responsive SVG charts and visualizations |
| **Icons** | [Lucide React](https://lucide.dev/) | Lightweight, clean icon set |
| **Motion** | [Motion](https://motion.dev/) | Physics-based micro-interactions |
| **Backend & Auth** | [Firebase](https://firebase.google.com/) | Realtime Database & Google OAuth |
| **Offline PWA** | Vanilla Service Worker | Offline caching and web app manifest |

---

## 🗄️ Database Schema

The database follows a normalized, lightweight Firebase Realtime Database schema:

```text
users
└── {uid}
    ├── transactions
    │   └── {transactionId}
    │       ├── type: "income" | "expense"
    │       ├── amount: number
    │       ├── date: string (YYYY-MM-DD)
    │       ├── category: string
    │       ├── description: string
    │       ├── createdAt: number (epoch ms)
    │       └── updatedAt: number (epoch ms)
    │
    ├── budgets
    │   └── {budgetId}
    │       ├── category: string
    │       └── limit: number
    │
    └── settings
        └── categories
            └── list: string[]
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm, yarn, pnpm, or [bun](https://bun.sh/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/luthafiyyan/WillowWallet-v2.git
   cd WillowWallet-v2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## ⚙️ Connecting Your Own Firebase (Optional)

To switch from local sandbox mode to your personal cloud database:

1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google Sign-In) and **Realtime Database**.
3. In the WillowWallet app, navigate to **Profile** or click **"Hubungkan ke Firebase Sendiri"** on the Login page.
4. Paste your Web SDK configuration object:
   ```json
   {
     "apiKey": "AIzaSy...",
     "authDomain": "your-app.firebaseapp.com",
     "databaseURL": "https://your-app-default-rtdb.firebaseio.com",
     "projectId": "your-app",
     "storageBucket": "your-app.appspot.com",
     "messagingSenderId": "...",
     "appId": "..."
   }
   ```
5. Click **Terapkan & Hubungkan**. The app will reload and synchronize data securely to your personal Firebase cloud.

---

## 👨‍💻 Author

Developed with care by **Luthfi Hafiyyan Nabila**
- GitHub: [@luthafiyyan](https://github.com/luthafiyyan)
- Instagram: [@luthafiyyan_](https://www.instagram.com/luthafiyyan_/)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
