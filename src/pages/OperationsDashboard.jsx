import React from 'react'
import { Package, HeadphonesIcon, RefreshCw, AlertCircle, BarChart2, Clock } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import AlertPanel from '../components/AlertPanel'
import TrendChart from '../components/TrendChart'

function ProgressRing({ value, max = 100, color, label, sub }) {
  const r = 36, c = 2 * Math.PI * r
  const pct = Math.min(value / max, 1)
  const dashOffset = c * (1 - pct)
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#1a2540" strokeWidth="8" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <text x="44" y="48" textAnchor="middle" fill="white" fontSize="16" fontFamily="Syne" fontWeight="700">{Math.round(value)}</text>
      </svg>
      <div className="text-center">
        <p className="text-xs font-mono text-white font-semibold">{label}</p>
        {sub && <p className="text-[10px] text-muted">{sub}</p>}
      </div>
    </div>
  )
}

export default function OperationsDashboard({ metrics, stressScore, alerts, history, onResolveAlert }) {
  const inv = metrics?.inventory
  const sup = metrics?.support
  const cash = metrics?.cashflow
  const s = metrics?.sales

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Operations KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Open Tickets"
          value={sup?.open_tickets ?? '—'}
          sub={sup ? `${sup.escalated_tickets} escalated` : ''}
          trend={sup?.open_tickets > 50 ? 'down' : sup?.open_tickets < 20 ? 'up' : 'flat'}
          trendValue={sup ? `${sup.avg_response_time.toFixed(1)}h avg` : ''}
          icon={HeadphonesIcon}
          color="#f97316"
        />
        <MetricCard
          title="Stock Level"
          value={inv ? `${inv.stock_level.toFixed(0)}%` : '—'}
          sub={inv ? `${inv.low_stock_items} low, ${inv.stockout_items} out` : ''}
          trend={inv?.stock_level > 50 ? 'up' : 'down'}
          trendValue={inv ? `${inv.turnover_rate.toFixed(1)}x turn` : ''}
          icon={Package}
          color="#a78bfa"
        />
        <MetricCard
          title="Avg Response"
          value={sup ? `${sup.avg_response_time.toFixed(1)}h` : '—'}
          sub="Support SLA: 4h target"
          trend={sup?.avg_response_time < 4 ? 'up' : 'down'}
          icon={Clock}
          color="#00e5ff"
        />
        <MetricCard
          title="Inventory Turnover"
          value={inv ? `${inv.turnover_rate.toFixed(1)}×` : '—'}
          sub="Monthly rate"
          trend={inv?.turnover_rate > 4 ? 'up' : 'flat'}
          icon={RefreshCw}
          color="#00ff88"
        />
      </div>

      {/* Rings row + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-6">Operational Health Rings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ProgressRing
              value={inv?.stock_level ?? 0}
              color={inv?.stock_level > 50 ? '#00ff88' : inv?.stock_level > 25 ? '#ffb800' : '#ff3b5c'}
              label="Stock Level"
              sub={`${inv?.stock_level?.toFixed(0) ?? 0}%`}
            />
            <ProgressRing
              value={sup?.csat_score ?? 0}
              color={sup?.csat_score > 75 ? '#00ff88' : sup?.csat_score > 50 ? '#ffb800' : '#ff3b5c'}
              label="CSAT Score"
              sub={`${sup?.csat_score?.toFixed(0) ?? 0}%`}
            />
            <ProgressRing
              value={Math.min(((24 - (sup?.avg_response_time ?? 24)) / 24) * 100, 100)}
              color="#00e5ff"
              label="Response SLA"
              sub={`${sup?.avg_response_time?.toFixed(1) ?? 0}h`}
            />
            <ProgressRing
              value={Math.min((cash?.runway_days ?? 0) / 180 * 100, 100)}
              color={cash?.runway_days > 60 ? '#00ff88' : cash?.runway_days > 30 ? '#ffb800' : '#ff3b5c'}
              label="Cash Runway"
              sub={`${cash?.runway_days ?? 0}d`}
            />
          </div>

          {/* Stress sub-scores */}
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
            {stressScore && [
              { label: 'Sales Stress', value: stressScore.sales, weight: '35%' },
              { label: 'Inventory Stress', value: stressScore.inventory, weight: '25%' },
              { label: 'Support Stress', value: stressScore.support, weight: '20%' },
              { label: 'Cash Stress', value: stressScore.cash, weight: '20%' },
            ].map(({ label, value, weight }) => {
              const c = value <= 25 ? '#00ff88' : value <= 50 ? '#00e5ff' : value <= 70 ? '#ffb800' : '#ff3b5c'
              return (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-body text-muted">{label} <span className="text-[10px]">({weight})</span></span>
                    <span className="text-xs font-mono" style={{ color: c }}>{value}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: c, boxShadow: `0 0 6px ${c}` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col">
          <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">
            Live Alerts
            {alerts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[10px]">{alerts.length}</span>
            )}
          </h2>
          <AlertPanel alerts={alerts} onResolve={onResolveAlert} />
        </div>
      </div>

      {/* Trend chart */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Operations Stress Trends</h2>
        <TrendChart history={history} mode="ops" />
      </div>

      {/* Support + Inventory detail table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <HeadphonesIcon size={12} /> Support Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Open Tickets', value: sup?.open_tickets, warn: 50, crit: 80 },
              { label: 'Escalated', value: sup?.escalated_tickets, warn: 5, crit: 10 },
              { label: 'Avg Response (h)', value: sup?.avg_response_time?.toFixed(1), warn: 4, crit: 12 },
              { label: 'CSAT Score (%)', value: sup?.csat_score?.toFixed(0), warn: 70, crit: 50, invert: true },
            ].map(row => {
              const v = parseFloat(row.value)
              const color = row.invert
                ? (v >= row.warn ? '#00ff88' : v >= row.crit ? '#ffb800' : '#ff3b5c')
                : (v >= row.crit ? '#ff3b5c' : v >= row.warn ? '#ffb800' : '#00ff88')
              return (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-sm font-body text-muted">{row.label}</span>
                  <span className="font-mono text-sm font-semibold" style={{ color }}>{row.value ?? '—'}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-xs font-mono text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <Package size={12} /> Inventory Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Stock Level (%)', value: inv?.stock_level?.toFixed(0), warn: 30, crit: 15, invert: true },
              { label: 'Low Stock SKUs', value: inv?.low_stock_items, warn: 5, crit: 10 },
              { label: 'Stockout Items', value: inv?.stockout_items, warn: 1, crit: 3 },
              { label: 'Turnover Rate', value: inv?.turnover_rate?.toFixed(1), warn: 3, crit: 2, invert: true },
            ].map(row => {
              const v = parseFloat(row.value)
              const color = row.invert
                ? (v >= row.warn ? '#00ff88' : v >= row.crit ? '#ffb800' : '#ff3b5c')
                : (v >= row.crit ? '#ff3b5c' : v >= row.warn ? '#ffb800' : '#00ff88')
              return (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-sm font-body text-muted">{row.label}</span>
                  <span className="font-mono text-sm font-semibold" style={{ color }}>{row.value ?? '—'}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
