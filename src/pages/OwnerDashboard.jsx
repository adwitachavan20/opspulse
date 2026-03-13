import React from 'react'
import { IndianRupee, TrendingUp, Package, HeadphonesIcon, Activity } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import StressGauge from '../components/StressGauge'
import AlertPanel from '../components/AlertPanel'
import TrendChart from '../components/TrendChart'

export default function OwnerDashboard({ metrics, stressScore, alerts, history, onResolveAlert, theme, changedKeys = [] }) {
  const isDark = theme === 'dark'
  const s = metrics?.sales
  const inv = metrics?.inventory
  const sup = metrics?.support
  const cash = metrics?.cashflow

  const revHistory = history.map(h => h.revenue)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Top row: Stress gauge + key metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stress Score */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Business Stress Score</h2>
          <StressGauge score={stressScore?.overall ?? null} breakdown={stressScore} />
        </div>

        {/* Key KPIs for owner */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <MetricCard
            title="Daily Revenue"
            value={s ? `₹${(s.revenue / 1000).toFixed(1)}K` : '—'}
            sub={s ? `${s.orders} orders today` : ''}
            trend={s?.revenue > 40000 ? 'up' : 'down'}
            trendValue={s ? `${((s.revenue / 40000 - 1) * 100).toFixed(0)}%` : ''}
            icon={IndianRupee}
            color="#00ff88"
            spark={revHistory.slice(-10)}
            isChanged={changedKeys.includes('sales')}
          />
          <MetricCard
            title="Cash Runway"
            value={cash ? `${cash.runway_days}d` : '—'}
            sub={cash ? `Balance: ₹${(cash.cash_balance / 1000).toFixed(0)}K` : ''}
            trend={cash?.runway_days > 60 ? 'up' : cash?.runway_days > 30 ? 'flat' : 'down'}
            trendValue={cash ? `₹${(cash.burn_rate / 1000).toFixed(1)}K/mo burn` : ''}
            icon={Activity}
            color="#ffb800"
            isChanged={changedKeys.includes('cashflow')}
          />
          <MetricCard
            title="Conversion Rate"
            value={s ? `${s.conversion_rate.toFixed(1)}%` : '—'}
            sub={s ? `Avg order ₹${Math.round(s.avg_order_value)}` : ''}
            trend={s?.conversion_rate > 2.5 ? 'up' : 'down'}
            trendValue={s ? `${s.orders} orders` : ''}
            icon={TrendingUp}
            color="#00e5ff"
            isChanged={changedKeys.includes('sales')}
          />
          <MetricCard
            title="Customer Satisfaction"
            value={sup ? `${sup.csat_score.toFixed(0)}%` : '—'}
            sub={sup ? `${sup.open_tickets} open tickets` : ''}
            trend={sup?.csat_score > 75 ? 'up' : 'down'}
            trendValue={sup ? `${sup.escalated_tickets} escalated` : ''}
            icon={HeadphonesIcon}
            color="#a78bfa"
            isChanged={changedKeys.includes('support')}
          />
        </div>
      </div>

      {/* Trend chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Stress Score Trend (Last 20 Updates)</h2>
          <TrendChart history={history} mode="owner" />
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col">
          <h2 className="text-xs font-mono text-muted uppercase tracking-widest mb-4">
            Alerts
            {alerts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[10px]">{alerts.length}</span>
            )}
          </h2>
          <AlertPanel alerts={alerts} onResolve={onResolveAlert} />
        </div>
      </div>

      {/* Bottom: Business summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} className="text-accent" />
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider">Inventory Health</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted font-body">Stock Level</span>
              <span className="text-sm font-mono text-white">{inv ? `${inv.stock_level.toFixed(0)}%` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted font-body">Low Stock SKUs</span>
              <span className={`text-sm font-mono ${inv?.low_stock_items > 5 ? 'text-amber-400' : 'text-white'}`}>
                {inv?.low_stock_items ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted font-body">Stockouts</span>
              <span className={`text-sm font-mono ${inv?.stockout_items > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {inv?.stockout_items ?? '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <IndianRupee size={14} className="text-green-400" />
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider">Cash Flow</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted font-body">Balance</span>
              <span className="text-sm font-mono text-white">{cash ? `₹${(cash.cash_balance / 1000).toFixed(0)}K` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted font-body">Monthly Burn</span>
              <span className="text-sm font-mono text-amber-400">{cash ? `₹${(cash.burn_rate / 1000).toFixed(1)}K` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted font-body">Receivables</span>
              <span className="text-sm font-mono text-white">{cash ? `₹${(cash.receivables / 1000).toFixed(0)}K` : '—'}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-accent" />
            <h3 className="text-xs font-mono text-muted uppercase tracking-wider">Sales Pipeline</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted font-body">Today's Revenue</span>
              <span className="text-sm font-mono text-white">{s ? `₹${(s.revenue / 1000).toFixed(1)}K` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted font-body">Orders Placed</span>
              <span className="text-sm font-mono text-white">{s?.orders ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted font-body">Avg Order Value</span>
              <span className="text-sm font-mono text-white">{s ? `₹${Math.round(s.avg_order_value)}` : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}