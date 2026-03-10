import React from 'react'
import { AlertTriangle, TrendingDown, Clock, DollarSign, Users, Package } from 'lucide-react'

export default function WarRoom({ metrics, alerts, stressScore, onExit, theme }) {
  const isDark = theme === 'dark'
  const crisisAlerts = alerts.filter(a => a.type === 'crisis')

  const actionItems = []

  if (metrics?.cashflow?.runway_days < 30) {
    actionItems.push({
      priority: 1,
      icon: DollarSign,
      title: 'Secure Emergency Funding',
      action: `Runway: ${metrics.cashflow.runway_days} days. Contact investors immediately. Review receivables of Rs.${Math.round(metrics.cashflow.receivables).toLocaleString()}.`,
      severity: 'critical',
    })
  }
  if (metrics?.support?.open_tickets > 60) {
    actionItems.push({
      priority: 2,
      icon: Users,
      title: 'Surge Support Capacity',
      action: `${metrics.support.open_tickets} tickets open. Escalate ${metrics.support.escalated_tickets} critical. Consider temp agents or AI deflection.`,
      severity: 'high',
    })
  }
  if (metrics?.inventory?.stockout_items > 2) {
    actionItems.push({
      priority: 3,
      icon: Package,
      title: 'Emergency Restock',
      action: `${metrics.inventory.stockout_items} SKUs at zero. Place emergency POs. Notify customers of delays.`,
      severity: 'high',
    })
  }
  if (metrics?.sales?.conversion_rate < 1.0) {
    actionItems.push({
      priority: 4,
      icon: TrendingDown,
      title: 'Sales Funnel Intervention',
      action: `Conversion at ${metrics.sales.conversion_rate?.toFixed(1)}%. Pause underperforming campaigns. A/B test landing pages.`,
      severity: 'medium',
    })
  }

  if (actionItems.length === 0) {
    actionItems.push({
      priority: 1,
      icon: Clock,
      title: 'Monitor & Prepare',
      action: 'Stress levels elevated. No immediate action required but stay vigilant. Check back in 15 minutes.',
      severity: 'medium',
    })
  }

  // Theme tokens
  const bgMain     = isDark ? '#0a0305' : '#fff5f5'
  const bgHeader   = isDark ? '#1a0008' : '#ffe4e6'
  const textMain   = isDark ? '#ffffff' : '#0f172a'
  const textMuted  = isDark ? '#94a3b8' : '#64748b'
  const cardBg     = isDark ? '#1a0008' : '#ffffff'
  const borderMain = isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.4)'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-fade-in"
      style={{ background: bgMain }}
    >
      {/* Animated border */}
      <div className="absolute inset-0 border-2 border-red-500/30 pointer-events-none animate-war-flash rounded-none" />

      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-4 border-b border-red-500/30"
        style={{ background: bgHeader }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-red-400 tracking-wider">
              ⚠ WAR ROOM MODE
            </h1>
            <p className="text-xs font-mono text-red-500/70">
              CRISIS MANAGEMENT ACTIVATED — STRESS SCORE: {stressScore?.overall}
            </p>
          </div>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 border border-red-500/50 text-red-400 font-mono text-sm rounded hover:bg-red-500/20 transition-all"
          style={{
            background: isDark ? 'transparent' : '#ffffff',
            color: '#f87171',
            borderColor: 'rgba(239,68,68,0.5)',
          }}
        >
          EXIT WAR ROOM
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Active crises */}
          {crisisAlerts.length > 0 && (
            <div>
              <h2 className="text-xs font-mono text-red-400 tracking-widest mb-3 uppercase">
                Active Crises ({crisisAlerts.length})
              </h2>
              <div className="grid gap-2">
                {crisisAlerts.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg p-3 border border-red-500/40"
                    style={{ background: isDark ? 'rgba(255,59,92,0.1)' : '#fff1f2' }}
                  >
                    <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-body font-semibold" style={{ color: textMain }}>
                        {a.message}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(252,165,165,0.7)' : '#ef4444' }}>
                        {a.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Immediate actions */}
          <div>
            <h2 className="text-xs font-mono text-red-400 tracking-widest mb-3 uppercase">
              Immediate Action Required
            </h2>
            <div className="space-y-3">
              {actionItems.map((item, i) => {
                const Icon = item.icon
                const borderColor = item.severity === 'critical'
                  ? '#ff3b5c'
                  : item.severity === 'high'
                  ? '#ff7a00'
                  : '#ffb800'
                return (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-xl border"
                    style={{
                      borderColor: `${borderColor}40`,
                      background: isDark ? `${borderColor}08` : '#ffffff',
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${borderColor}20` }}
                      >
                        <Icon size={16} style={{ color: borderColor }} />
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: borderColor }}>
                        #{item.priority}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display font-bold mb-1" style={{ color: textMain }}>
                        {item.title}
                      </h3>
                      <p className="text-sm font-body leading-relaxed" style={{ color: textMuted }}>
                        {item.action}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick metrics */}
          {metrics && (
            <div>
              <h2 className="text-xs font-mono text-red-400 tracking-widest mb-3 uppercase">
                Current Vitals
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Revenue',      value: `Rs.${Math.round(metrics.sales?.revenue || 0).toLocaleString()}` },
                  { label: 'Cash Runway',  value: `${metrics.cashflow?.runway_days || 0}d` },
                  { label: 'Open Tickets', value: metrics.support?.open_tickets || 0 },
                  { label: 'Stockouts',    value: metrics.inventory?.stockout_items || 0 },
                ].map(m => (
                  <div
                    key={m.label}
                    className="rounded-lg p-3 text-center border border-red-500/20"
                    style={{ background: cardBg }}
                  >
                    <p className="text-lg font-display font-bold" style={{ color: textMain }}>
                      {m.value}
                    </p>
                    <p className="text-xs font-mono mt-1" style={{ color: textMuted }}>
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}