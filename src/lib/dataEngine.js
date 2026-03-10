// ─── Stress Score Formula ───────────────────────────────────────────────────
// Business Stress Score (0-100, lower = healthier)
//
// Score = (SalesStress × 0.35) + (InventoryStress × 0.25) + (SupportStress × 0.20) + (CashStress × 0.20)
//
// SalesStress    = (1 - conversion_rate/5) × 40 + (1 - revenue/target) × 60    [clamp 0-100]
// InventoryStress = (low_stock_items/total × 50) + (stockout_items × 10)        [clamp 0-100]
// SupportStress  = (open_tickets/100 × 30) + (avg_response_time/24 × 40) + ((100-csat)/100 × 30)
// CashStress     = (1 - runway_days/180) × 100                                  [clamp 0-100]

export function computeStressScore(sales, inventory, support, cash) {
  if (!sales || !inventory || !support || !cash) return null

  const salesStress = clamp(
    (1 - sales.conversion_rate / 5) * 40 +
    Math.max(0, 1 - sales.revenue / 50000) * 60,
    0, 100
  )

  const inventoryStress = clamp(
    (inventory.low_stock_items / 20) * 50 +
    Math.min(inventory.stockout_items * 10, 50),
    0, 100
  )

  const supportStress = clamp(
    (support.open_tickets / 100) * 30 +
    (support.avg_response_time / 24) * 40 +
    ((100 - support.csat_score) / 100) * 30,
    0, 100
  )

  const cashStress = clamp(
    (1 - cash.runway_days / 180) * 100,
    0, 100
  )

  const overall = clamp(
    salesStress * 0.35 +
    inventoryStress * 0.25 +
    supportStress * 0.20 +
    cashStress * 0.20,
    0, 100
  )

  return {
    overall: Math.round(overall),
    sales: Math.round(salesStress),
    inventory: Math.round(inventoryStress),
    support: Math.round(supportStress),
    cash: Math.round(cashStress),
  }
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val))
}

export function getStressLabel(score) {
  if (score === null) return { label: 'Loading', color: 'text-muted' }
  if (score <= 25) return { label: 'Healthy', color: 'text-green-400' }
  if (score <= 50) return { label: 'Stable', color: 'text-cyan-400' }
  if (score <= 70) return { label: 'Caution', color: 'text-amber-400' }
  if (score <= 85) return { label: 'Stressed', color: 'text-orange-400' }
  return { label: 'Critical', color: 'text-red-400' }
}

// ─── Simulated Data Generator ────────────────────────────────────────────────
let tick = 0

export function generateSimulatedData(scenario = 'normal') {
  tick++
  const t = tick

  if (scenario === 'crisis') {
    return {
      sales: {
        revenue: 8000 + Math.sin(t * 0.3) * 2000,
        orders: 15 + Math.floor(Math.random() * 5),
        conversion_rate: 0.8 + Math.random() * 0.4,
        avg_order_value: 120 + Math.random() * 40,
      },
      inventory: {
        stock_level: 18 + Math.random() * 8,
        low_stock_items: 12 + Math.floor(Math.random() * 5),
        stockout_items: 4 + Math.floor(Math.random() * 3),
        turnover_rate: 1.2 + Math.random() * 0.3,
      },
      support: {
        open_tickets: 78 + Math.floor(Math.random() * 20),
        avg_response_time: 18 + Math.random() * 6,
        csat_score: 42 + Math.random() * 10,
        escalated_tickets: 12 + Math.floor(Math.random() * 5),
      },
      cashflow: {
        cash_balance: 45000 + Math.random() * 10000,
        burn_rate: 8500 + Math.random() * 1000,
        runway_days: 22 + Math.floor(Math.random() * 8),
        receivables: 18000 + Math.random() * 5000,
      },
    }
  }

  if (scenario === 'opportunity') {
    return {
      sales: {
        revenue: 72000 + Math.sin(t * 0.2) * 8000,
        orders: 180 + Math.floor(Math.random() * 30),
        conversion_rate: 4.2 + Math.random() * 0.6,
        avg_order_value: 420 + Math.random() * 80,
      },
      inventory: {
        stock_level: 82 + Math.random() * 10,
        low_stock_items: 1 + Math.floor(Math.random() * 2),
        stockout_items: 0,
        turnover_rate: 6.5 + Math.random() * 1,
      },
      support: {
        open_tickets: 12 + Math.floor(Math.random() * 8),
        avg_response_time: 1.5 + Math.random() * 0.5,
        csat_score: 94 + Math.random() * 4,
        escalated_tickets: 0,
      },
      cashflow: {
        cash_balance: 380000 + Math.random() * 20000,
        burn_rate: 4200 + Math.random() * 500,
        runway_days: 160 + Math.floor(Math.random() * 20),
        receivables: 85000 + Math.random() * 10000,
      },
    }
  }

  // normal
  return {
    sales: {
      revenue: 42000 + Math.sin(t * 0.15) * 8000 + Math.random() * 3000,
      orders: 95 + Math.floor(Math.sin(t * 0.1) * 20) + Math.floor(Math.random() * 10),
      conversion_rate: 2.8 + Math.sin(t * 0.2) * 0.6 + Math.random() * 0.3,
      avg_order_value: 310 + Math.sin(t * 0.3) * 50 + Math.random() * 20,
    },
    inventory: {
      stock_level: 62 + Math.sin(t * 0.1) * 15 + Math.random() * 8,
      low_stock_items: 3 + Math.floor(Math.random() * 4),
      stockout_items: Math.floor(Math.random() * 2),
      turnover_rate: 3.8 + Math.random() * 0.8,
    },
    support: {
      open_tickets: 28 + Math.floor(Math.sin(t * 0.2) * 10) + Math.floor(Math.random() * 8),
      avg_response_time: 4.2 + Math.sin(t * 0.15) * 2 + Math.random() * 0.5,
      csat_score: 78 + Math.sin(t * 0.1) * 8 + Math.random() * 4,
      escalated_tickets: 2 + Math.floor(Math.random() * 3),
    },
    cashflow: {
      cash_balance: 180000 + Math.sin(t * 0.05) * 30000 + Math.random() * 5000,
      burn_rate: 5800 + Math.random() * 800,
      runway_days: 92 + Math.floor(Math.sin(t * 0.05) * 20) + Math.floor(Math.random() * 10),
      receivables: 42000 + Math.random() * 8000,
    },
  }
}

export function generateAlerts(sales, inventory, support, cash) {
  const alerts = []

  if (cash && cash.runway_days < 30) {
    alerts.push({ type: 'crisis', vertical: 'Cash Flow', message: 'Critical: Low Cash Runway', detail: `Only ${cash.runway_days} days of runway remaining. Immediate action required.` })
  }
  if (support && support.open_tickets > 60) {
    alerts.push({ type: 'crisis', vertical: 'Support', message: 'Support Queue Overflow', detail: `${support.open_tickets} open tickets overwhelming team capacity.` })
  }
  if (inventory && inventory.stockout_items > 3) {
    alerts.push({ type: 'crisis', vertical: 'Inventory', message: 'Multiple Stockouts Detected', detail: `${inventory.stockout_items} items out of stock — revenue at risk.` })
  }
  if (sales && sales.conversion_rate > 4.0) {
    alerts.push({ type: 'opportunity', vertical: 'Sales', message: 'Conversion Rate Spike', detail: `Conversion at ${sales.conversion_rate.toFixed(1)}% — consider scaling ad spend.` })
  }
  if (sales && sales.revenue > 65000) {
    alerts.push({ type: 'opportunity', vertical: 'Sales', message: 'Revenue Exceeding Target', detail: `Daily revenue ₹${Math.round(sales.revenue).toLocaleString()} — 30% above forecast.` })
  }
  if (support && support.csat_score > 92) {
    alerts.push({ type: 'opportunity', vertical: 'Support', message: 'CSAT All-Time High', detail: `Customer satisfaction at ${support.csat_score.toFixed(0)}% — capture testimonials now.` })
  }
  if (inventory && inventory.low_stock_items > 8) {
    alerts.push({ type: 'anomaly', vertical: 'Inventory', message: 'Unusual Inventory Depletion', detail: `${inventory.low_stock_items} SKUs below reorder point simultaneously.` })
  }
  if (support && support.avg_response_time > 12) {
    alerts.push({ type: 'anomaly', vertical: 'Support', message: 'Response Time Degrading', detail: `Avg response ${support.avg_response_time.toFixed(1)}h — 3× above SLA target.` })
  }

  return alerts
}

export function generateHistoryPoint(scenario, label) {
  const d = generateSimulatedData(scenario)
  const scores = computeStressScore(d.sales, d.inventory, d.support, d.cashflow)
  return { label, ...scores, revenue: Math.round(d.sales.revenue) }
}
