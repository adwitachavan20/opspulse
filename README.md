# OpsPulse — Business Health Dashboard

> **HORIZON 1.0** · Vidyavardhini's College of Engineering & Technology

A real-time business operations dashboard that computes a **Business Stress Score (BSS)** across four key verticals  Sales, Inventory, Support, and Cash Flow  giving SMB owners and operations managers a single unified view of their business health.

---

##  Screenshots

> **Replace the placeholders below with your actual screenshots.**
> Recommended: Take screenshots of each view and save them in a `/screenshots` folder in your repo root.

| View | Screenshot |
|------|------------|
| Login Page |<img width="1907" height="957" alt="image" src="https://github.com/user-attachments/assets/a51a3e44-3a2c-4ecb-a18c-308f8ac687fb" />
              <img width="815" height="921" alt="image" src="https://github.com/user-attachments/assets/84b142f7-1ce8-410c-86a5-db17c6c73605" />

 |
| Owner Dashboard  (Normal) | `screenshots/owner-normal.png` |
| Owner Dashboard  (Crisis) | `screenshots/owner-crisis.png` |
| Ops Manager Dashboard | `screenshots/ops-dashboard.png` |
| War Room Mode | `screenshots/war-room.png` |
| Downloaded PDF Report | `screenshots/pdf-report.png` |

---

##  Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.0 | Build tool & dev server |
| Tailwind CSS | 3.4.0 | Utility-first styling |
| Recharts | 2.10.0 | Trend charts & data visualization |
| Lucide React | 0.383.0 | Icon system |
| jsPDF | 2.5.1 | PDF report generation |
| html2canvas | 1.4.1 | Dashboard screenshot for PDF |
| date-fns | 3.0.0 | Date formatting |

### Backend & Data
| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL database + real-time subscriptions |
| Supabase JS SDK | Database queries & live data streaming |

### Fonts
- **Syne** = Display headings
- **DM Sans** = Body text
- **JetBrains Mono** = Monospace metrics & code

---

##  Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (React)                       │
│                                                             │
│  ┌──────────┐    ┌─────────────────────────────────────┐   │
│  │ LoginPage│    │           App.jsx (Root)             │   │
│  │          │    │  ┌─────────────┐  ┌──────────────┐  │   │
│  │ Auth flow│    │  │   Header    │  │  Sub-nav bar │  │   │
│  └──────────┘    │  │  Stress BSS │  │  Role switch │  │   │
│                  │  │  Scenario   │  │  Mobile nav  │  │   │
│                  │  │  War Room   │  └──────────────┘  │   │
│                  │  │  PDF Export │                     │   │
│                  │  └─────────────┘                     │   │
│                  │                                       │   │
│                  │  ┌──────────────┐ ┌───────────────┐  │   │
│                  │  │OwnerDashboard│ │  OpsDashboard │  │   │
│                  │  │              │ │               │  │   │
│                  │  │ StressGauge  │ │ ProgressRings │  │   │
│                  │  │ MetricCards  │ │ MetricCards   │  │   │
│                  │  │ TrendChart   │ │ TrendChart    │  │   │
│                  │  │ AlertPanel   │ │ AlertPanel    │  │   │
│                  │  │ SummaryCards │ │ DetailTables  │  │   │
│                  │  └──────────────┘ └───────────────┘  │   │
│                  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │                              │
          │ useRealtimeData hook         │
          ▼                              ▼
┌──────────────────┐          ┌──────────────────────┐
│   Demo Mode      │          │   Supabase (Live)    │
│  (Simulated data │          │                      │
│   every 3s)      │          │  sales_metrics       │
│                  │          │  inventory_metrics   │
│  dataEngine.js   │          │  support_metrics     │
│  generateData()  │          │  cashflow_metrics    │
└──────────────────┘          │                      │
                              │  Realtime Subscript. │
                              │  (postgres_changes)  │
                              └──────────────────────┘
```

### Component Tree
```
App
├── LoginPage                  (auth gate)
├── WarRoom                    (overlay, crisis mode)
├── Header
│   ├── StressScore Badge
│   ├── Scenario Switcher
│   ├── PDF Download Button
│   ├── War Room Button
│   └── User / Logout
├── SubNav (role + mobile scenario)
└── Main
    ├── OwnerDashboard         (role = owner)
    │   ├── StressGauge
    │   ├── MetricCard ×4
    │   ├── TrendChart
    │   ├── AlertPanel
    │   └── Summary Cards ×3
    └── OperationsDashboard    (role = ops)
        ├── MetricCard ×4
        ├── ProgressRings ×4
        ├── Stress Sub-score Bars
        ├── AlertPanel
        ├── TrendChart
        └── Detail Tables ×2
```

---

##  Data Pipeline

```
Raw Metrics Input
      │
      ▼
┌─────────────────────────────────────┐
│         dataEngine.js               │
│                                     │
│  generateSimulatedData(scenario)    │  ◄── Demo Mode
│  OR Supabase DB query               │  ◄── Production Mode
│                                     │
│  Returns: {                         │
│    sales: {                         │
│      revenue, orders,               │
│      conversion_rate,               │
│      avg_order_value                │
│    },                               │
│    inventory: {                     │
│      stock_level, low_stock_items,  │
│      stockout_items, turnover_rate  │
│    },                               │
│    support: {                       │
│      open_tickets, avg_response_    │
│      time, csat_score,              │
│      escalated_tickets              │
│    },                               │
│    cashflow: {                      │
│      cash_balance, burn_rate,       │
│      runway_days, receivables       │
│    }                                │
│  }                                  │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│       computeStressScore()          │
│                                     │
│  SalesStress =                      │
│    (1 - conversion/5) × 40          │
│    + (1 - revenue/50000) × 60       │
│                                     │
│  InventoryStress =                  │
│    (low_stock/20) × 50              │
│    + min(stockouts × 10, 50)        │
│                                     │
│  SupportStress =                    │
│    (tickets/100) × 30               │
│    + (response_time/24) × 40        │
│    + ((100-csat)/100) × 30          │
│                                     │
│  CashStress =                       │
│    (1 - runway/180) × 100           │
│                                     │
│  BSS = Sales×0.35 + Inv×0.25        │
│      + Support×0.20 + Cash×0.20     │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│        generateAlerts()             │
│                                     │
│  Crisis   → runway < 30d            │
│  Crisis   → tickets > 60            │
│  Crisis   → stockouts > 3           │
│  Opportunity → conversion > 4%      │
│  Opportunity → revenue > ₹65K       │
│  Opportunity → CSAT > 92%           │
│  Anomaly  → low_stock > 8 SKUs      │
│  Anomaly  → response_time > 12h     │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│     useRealtimeData hook            │
│                                     │
│  • Polls every 3 seconds            │
│  • Maintains 20-point history       │
│  • Supabase realtime subscriptions  │
│    for production mode              │
│  • Exposes: metrics, alerts,        │
│    stressScore, history, loading    │
└─────────────────────────────────────┘
      │
      ▼
   React UI (renders live)
```

---

##  Stress Score Thresholds

| Score | Status | Color | Action |
|-------|--------|-------|--------|
| 0 – 25 | 🟢 Healthy | Green | Monitor normally |
| 26 – 50 | 🔵 Stable | Cyan | Review weekly |
| 51 – 70 | 🟡 Caution | Amber | Daily review, prepare contingencies |
| 71 – 85 | 🟠 Stressed | Orange | Daily standup, escalation protocols |
| 86 – 100 | 🔴 Critical | Red | **Activate War Room immediately** |

---

##  Project Structure

```
opspulse/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── STRESS_SCORE_JUSTIFICATION.md
└── src/
    ├── main.jsx                  # React entry point
    ├── index.css                 # Global styles
    ├── App.jsx                   # Root component, layout, header
    ├── lib/
    │   ├── dataEngine.js         # BSS formula, data simulation, alerts
    │   ├── supabase.js           # Supabase client config
    │   └── downloadPDF.js        # PDF export (jsPDF + html2canvas)
    ├── hooks/
    │   └── useRealtimeData.js    # Data fetching + polling hook
    ├── pages/
    │   ├── LoginPage.jsx         # Auth gate (owner / ops roles)
    │   ├── OwnerDashboard.jsx    # Business Owner view
    │   └── OperationsDashboard.jsx # Ops Manager view
    └── components/
        ├── StressGauge.jsx       # Animated semicircle gauge
        ├── MetricCard.jsx        # KPI card with sparkline
        ├── TrendChart.jsx        # Recharts line/area chart
        ├── AlertPanel.jsx        # Live alert feed
        └── WarRoom.jsx           # Full-screen crisis overlay
```

---

##  Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/opspulse.git
cd opspulse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key in .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

> **Note:** The app runs in **Demo Mode** by default (simulated data, no Supabase needed). Set `DEMO_MODE = false` in `src/hooks/useRealtimeData.js` to connect to live Supabase data.

### Build for Production

```bash
npm run build
npm run preview
```

---

##  Scenarios

The dashboard supports three simulation scenarios switchable from the header:

| Scenario | Description |
|----------|-------------|
| **Normal** | Typical SMB operations with moderate fluctuations |
| **Opportunity** | High revenue, low stress — growth phase |
| **Crisis** | Low revenue, stockouts, high tickets  war room triggers |

---

##  User Roles

| Role | Access |
|------|--------|
| **Business Owner** | Strategic view — stress gauge, revenue, cash runway, conversion, CSAT, trend chart, alerts |
| **Ops Manager** | Operational view — ticket queues, stock levels, SLA rings, stress breakdown bars, detail tables |

---

##  PDF Export

Click **Download PDF** in the header to export the current dashboard view as a professionally formatted A4 PDF including:
- Report header with role, scenario, and timestamp
- Color-coded BSS badge
- Full dashboard screenshot paginated across pages
- Footer with page numbers

---

##  Built For

**HORIZON 1.0** — Hackathon organized by  
Vidyavardhini's College of Engineering & Technology

---

##  License

This project was built for academic/hackathon purposes.
