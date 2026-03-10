import React, { useState } from 'react'
import { AlertTriangle, TrendingUp, Zap, X, ChevronDown, ChevronUp } from 'lucide-react'

const typeConfig = {
  crisis: {
    icon: AlertTriangle,
    label: 'CRISIS',
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-500',
    glow: 'shadow-red-500/20',
  },
  opportunity: {
    icon: TrendingUp,
    label: 'OPPORTUNITY',
    border: 'border-green-500/50',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    dot: 'bg-green-400',
    glow: 'shadow-green-500/20',
  },
  anomaly: {
    icon: Zap,
    label: 'ANOMALY',
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    glow: 'shadow-amber-500/20',
  },
}

function AlertItem({ alert, onResolve, index }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = typeConfig[alert.type]
  const Icon = cfg.icon

  return (
    <div className={`border ${cfg.border} ${cfg.bg} rounded-lg p-3 shadow-lg ${cfg.glow} animate-slide-in`}>
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1.5 flex-shrink-0 animate-pulse`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-mono font-bold tracking-widest ${cfg.text}`}>{cfg.label}</span>
            <span className="text-[10px] text-muted font-mono">· {alert.vertical}</span>
          </div>
          <p className="text-sm text-white font-body font-medium leading-tight">{alert.message}</p>
          {expanded && alert.detail && (
            <p className="text-xs text-muted mt-1.5 leading-relaxed">{alert.detail}</p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-muted hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => onResolve(index)}
            className="p-1 text-muted hover:text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AlertPanel({ alerts, onResolve }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter)
  const counts = {
    crisis: alerts.filter(a => a.type === 'crisis').length,
    opportunity: alerts.filter(a => a.type === 'opportunity').length,
    anomaly: alerts.filter(a => a.type === 'anomaly').length,
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All', count: alerts.length },
          { key: 'crisis', label: 'Crisis', count: counts.crisis },
          { key: 'opportunity', label: 'Opps', count: counts.opportunity },
          { key: 'anomaly', label: 'Anomaly', count: counts.anomaly },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
              filter === tab.key
                ? 'bg-accent text-bg font-bold'
                : 'bg-border text-muted hover:text-white'
            }`}
          >
            {tab.label} {tab.count > 0 && <span className="ml-1">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-sm font-body">All clear</p>
          </div>
        ) : (
          filtered.map((alert, i) => (
            <AlertItem key={`${alert.message}-${i}`} alert={alert} onResolve={onResolve} index={alerts.indexOf(alert)} />
          ))
        )}
      </div>
    </div>
  )
}
