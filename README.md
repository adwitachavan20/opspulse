# OpsPulse — Unified Business Health Dashboard for SMBs
### HORIZON 1.0 · Web Development Domain

A real-time, AI-ready business health dashboard built with **React + Vite + Supabase**, featuring live data streams, a Business Stress Score, intelligent 3-tier alerts, dual-role views, and War Room Mode.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase (or use Demo Mode)
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

> **Demo Mode is ON by default** — the app runs with simulated real-time data without needing Supabase. To connect real data, set `DEMO_MODE = false` in `src/hooks/useRealtimeData.js`.

### 3. Set Up Supabase Database
In your Supabase project, open the **SQL Editor** and run the schema found in `src/lib/supabase.js` (in the block comment). This creates all necessary tables with Row Level Security.

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 🏗 Architecture

```
src/
├── lib/
│   ├── supabase.js        # Supabase client + DB schema SQL
│   └── dataEngine.js      # Stress Score formula + data simulation
├── hooks/
│   └── useRealtimeData.js # Real-time data hook (Supabase + demo)
├── components/
│   ├── StressGauge.jsx    # Animated arc gauge for stress score
│   ├── AlertPanel.jsx     # 3-tier alert system UI
│   ├── MetricCard.jsx     # KPI cards with sparklines
│   ├── TrendChart.jsx     # Recharts line chart
│   └── WarRoom.jsx        # War Room Mode overlay
└── pages/
    ├── OwnerDashboard.jsx  # Business Owner view
    └── OperationsDashboard.jsx # Operations Manager view
```

---

## 📊 Business Stress Score Formula

**Score = (SalesStress × 0.35) + (InventoryStress × 0.25) + (SupportStress × 0.20) + (CashStress × 0.20)**

| Vertical | Weight | Key Inputs |
|----------|--------|-----------|
| Sales | 35% | Conversion rate, Revenue vs target |
| Inventory | 25% | Stock level, Low/stockout SKUs |
| Support | 20% | Open tickets, Avg response time, CSAT |
| Cash Flow | 20% | Runway days vs 180-day benchmark |

Score ranges:
- **0–25**: Healthy 🟢
- **26–50**: Stable 🔵
- **51–70**: Caution 🟡
- **71–85**: Stressed 🟠
- **86–100**: Critical 🔴

---

## 🔔 Three-Tier Alert System

| Tier | Trigger Examples |
|------|-----------------|
| 🔴 **Crisis** | Runway < 30 days, Stockouts > 3, Tickets > 60 |
| 🚀 **Opportunity** | Conversion > 4%, Revenue > ₹65K, CSAT > 92% |
| ⚡ **Anomaly** | Low stock > 8 SKUs, Response time > 12h |

---

## 👥 Dual Role Interface

- **Business Owner**: High-level KPIs (Revenue, Cash Runway, Conversion, CSAT) + Stress Score gauge
- **Operations Manager**: Operational rings (Stock, CSAT, SLA, Runway) + granular breakdowns

---

## ⚔ War Room Mode

Activates during simulated crises to surface only immediately actionable items:
- Active crisis alert list
- Prioritized action checklist
- Key vitals at a glance

---

## 🧪 Scenario Testing (Demo Mode)

Use the **Normal / 🚀 Opportunity / ⚠ Crisis** switcher in the header to simulate different business states and watch the dashboard respond in real time.

---

## 🛢 Supabase Tables

- `sales_metrics` — Revenue, orders, conversion rate, AOV
- `inventory_metrics` — Stock level, low stock, stockouts, turnover
- `support_metrics` — Open tickets, response time, CSAT, escalations
- `cashflow_metrics` — Cash balance, burn rate, runway, receivables
- `alerts` — Persistent alert log with type/vertical/resolved status

---

## 📦 Tech Stack

- **React 18** + **Vite 5**
- **Supabase** (PostgreSQL + Realtime)
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **DM Sans + Syne + JetBrains Mono** fonts
