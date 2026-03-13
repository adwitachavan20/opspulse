import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react'

// All the metrics we want to compare, grouped by section
const METRIC_DEFINITIONS = [
  {
    section: 'Sales',
    color: '#00ff88',
    metrics: [
      { label: 'Revenue',        demoKey: 'sales.revenue',         userKey: 'sales.revenue',         format: v => `₹${(v/1000).toFixed(1)}K` },
      { label: 'Orders',         demoKey: 'sales.orders',          userKey: 'sales.orders',          format: v => v },
      { label: 'Conversion Rate',demoKey: 'sales.conversion_rate', userKey: 'sales.conversion_rate', format: v => `${v.toFixed(1)}%` },
      { label: 'Avg Order Value',demoKey: 'sales.avg_order_value', userKey: 'sales.avg_order_value', format: v => `₹${Math.round(v)}` },
    ]
  },
  {
    section: 'Inventory',
    color: '#a78bfa',
    metrics: [
      { label: 'Stock Level',     demoKey: 'inventory.stock_level',     userKey: 'inventory.stock_level',     format: v => `${v.toFixed(0)}%` },
      { label: 'Low Stock SKUs',  demoKey: 'inventory.low_stock_items', userKey: 'inventory.low_stock_items', format: v => v },
      { label: 'Stockout Items',  demoKey: 'inventory.stockout_items',  userKey: 'inventory.stockout_items',  format: v => v },
      { label: 'Turnover Rate',   demoKey: 'inventory.turnover_rate',   userKey: 'inventory.turnover_rate',   format: v => `${v.toFixed(1)}×` },
    ]
  },
  {
    section: 'Support',
    color: '#f97316',
    metrics: [
      { label: 'Open Tickets',    demoKey: 'support.open_tickets',      userKey: 'support.open_tickets',      format: v => v },
      { label: 'Avg Response',    demoKey: 'support.avg_response_time', userKey: 'support.avg_response_time', format: v => `${v.toFixed(1)}h` },
      { label: 'CSAT Score',      demoKey: 'support.csat_score',        userKey: 'support.csat_score',        format: v => `${v.toFixed(0)}%` },
      { label: 'Escalated',       demoKey: 'support.escalated_tickets', userKey: 'support.escalated_tickets', format: v => v },
    ]
  },
  {
    section: 'Cash Flow',
    color: '#ffb800',
    metrics: [
      { label: 'Cash Runway',     demoKey: 'cashflow.runway_days',  userKey: 'cashflow.runway_days',  format: v => `${v}d` },
      { label: 'Cash Balance',    demoKey: 'cashflow.cash_balance', userKey: 'cashflow.cash_balance', format: v => `₹${(v/1000).toFixed(0)}K` },
      { label: 'Burn Rate',       demoKey: 'cashflow.burn_rate',    userKey: 'cashflow.burn_rate',    format: v => `₹${(v/1000).toFixed(1)}K` },
      { label: 'Receivables',     demoKey: 'cashflow.receivables',  userKey: 'cashflow.receivables',  format: v => `₹${(v/1000).toFixed(0)}K` },
    ]
  },
]

// Helper to safely get nested value like 'sales.revenue' from metrics object
function getVal(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

// Calculate % change
function pctChange(from, to) {
  if (!from || from === 0) return null
  return ((to - from) / Math.abs(from)) * 100
}

export default function DataDiffPanel({ demoMetrics, userMetrics, demoStress, userStress, theme }) {
  const isDark = theme === 'dark'
  const [expanded, setExpanded] = useState(true)
  const [activeSection, setActiveSection] = useState('All')

  if (!demoMetrics || !userMetrics) return null

  const surface    = isDark ? '#0d1526' : '#ffffff'
  const borderCol  = isDark ? '#1a2540' : '#e2e8f0'
  const textMain   = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted  = isDark ? '#4a6080' : '#64748b'
  const subSurface = isDark ? '#0a0f1e' : '#f8fafc'

  const sections = ['All', ...METRIC_DEFINITIONS.map(s => s.section)]
  const filtered = activeSection === 'All'
    ? METRIC_DEFINITIONS
    : METRIC_DEFINITIONS.filter(s => s.section === activeSection)

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: surface, borderColor: borderCol }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b cursor-pointer"
        style={{ background: subSurface, borderColor: borderCol }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase" style={{ color: textMain }}>
            Demo vs Your Data — Comparison
          </span>
          {/* BSS change pill */}
          {demoStress && userStress && (() => {
            const diff = userStress.overall - demoStress.overall
            const color = diff > 0 ? '#ff3b5c' : diff < 0 ? '#00ff88' : '#4a6080'
            return (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
              >
                BSS {diff > 0 ? '+' : ''}{diff} ({demoStress.overall} → {userStress.overall})
              </span>
            )
          })()}
        </div>
        <button style={{ color: textMuted }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">

          {/* Section filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {sections.map(sec => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className="px-3 py-1 rounded-full text-xs font-mono transition-all"
                style={{
                  background: activeSection === sec ? '#00e5ff' : borderCol,
                  color: activeSection === sec ? '#080c14' : textMuted,
                  fontWeight: activeSection === sec ? 700 : 400,
                }}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Diff rows per section */}
          {filtered.map(group => (
            <div key={group.section}>
              {/* Section label */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: group.color }}>
                  {group.section}
                </span>
              </div>

              {/* Column headers */}
              <div
                className="grid grid-cols-4 gap-2 px-3 py-1.5 rounded-lg mb-1 text-[10px] font-mono uppercase tracking-wider"
                style={{ background: subSurface, color: textMuted }}
              >
                <span>Metric</span>
                <span className="text-center">Demo</span>
                <span className="text-center">Your Data</span>
                <span className="text-center">Change</span>
              </div>

              {/* Metric rows */}
              <div className="space-y-1">
                {group.metrics.map(metric => {
                  const demoVal = getVal(demoMetrics, metric.demoKey)
                  const userVal = getVal(userMetrics, metric.userKey)
                  const pct     = pctChange(demoVal, userVal)
                  const diff    = userVal - demoVal
                  const changed = Math.abs(diff) > 0.01

                  // Color: green = improved (lower stress), red = worsened
                  // For tickets/response/stockouts lower is better, for revenue/csat higher is better
                  const lowerIsBetter = ['open_tickets','avg_response_time','stockout_items','low_stock_items','burn_rate'].some(k => metric.demoKey.includes(k))
                  const improved = lowerIsBetter ? diff < 0 : diff > 0
                  const changeColor = !changed ? textMuted : improved ? '#00ff88' : '#ff3b5c'
                  const ChangIcon = !changed ? Minus : improved ? TrendingUp : TrendingDown

                  return (
                    <div
                      key={metric.label}
                      className="grid grid-cols-4 gap-2 px-3 py-2 rounded-lg items-center transition-all"
                      style={{
                        background: changed ? (isDark ? `${changeColor}08` : `${changeColor}10`) : 'transparent',
                        border: changed ? `1px solid ${changeColor}25` : '1px solid transparent',
                      }}
                    >
                      {/* Label */}
                      <span className="text-xs font-body" style={{ color: textMuted }}>{metric.label}</span>

                      {/* Demo value */}
                      <span className="text-xs font-mono text-center" style={{ color: textMuted }}>
                        {demoVal != null ? metric.format(demoVal) : '—'}
                      </span>

                      {/* User value */}
                      <span className="text-xs font-mono font-bold text-center" style={{ color: changed ? changeColor : textMain }}>
                        {userVal != null ? metric.format(userVal) : '—'}
                      </span>

                      {/* Change indicator */}
                      <div className="flex items-center justify-center gap-1">
                        <ChangIcon size={11} style={{ color: changeColor }} />
                        <span className="text-[10px] font-mono" style={{ color: changeColor }}>
                          {!changed
                            ? 'No change'
                            : pct != null
                              ? `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
                              : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`
                          }
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* BSS breakdown comparison */}
          {demoStress && userStress && (
            <div>
              <div className="flex items-center gap-2 mb-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400">
                  Stress Score Impact
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { label: 'Overall BSS', demo: demoStress.overall, user: userStress.overall },
                  { label: 'Sales Stress', demo: demoStress.sales, user: userStress.sales },
                  { label: 'Inventory Stress', demo: demoStress.inventory, user: userStress.inventory },
                  { label: 'Support Stress', demo: demoStress.support, user: userStress.support },
                  { label: 'Cash Stress', demo: demoStress.cash, user: userStress.cash },
                ].map(row => {
                  const diff = row.user - row.demo
                  const color = diff > 0 ? '#ff3b5c' : diff < 0 ? '#00ff88' : textMuted
                  return (
                    <div
                      key={row.label}
                      className="grid grid-cols-4 gap-2 px-3 py-2 rounded-lg items-center"
                      style={{ background: subSurface }}
                    >
                      <span className="text-xs font-body" style={{ color: textMuted }}>{row.label}</span>
                      <span className="text-xs font-mono text-center" style={{ color: textMuted }}>{row.demo}</span>
                      <span className="text-xs font-mono font-bold text-center" style={{ color }}>{row.user}</span>
                      <span className="text-[10px] font-mono text-center" style={{ color }}>
                        {diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${diff}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}