// src/components/ManagerHistoryPanel.jsx
import React, { useState, useEffect } from 'react'
import { History, LogIn, LogOut, RefreshCw, AlertTriangle, Upload, Zap, FileText, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { getManagerHistory, clearManagerHistory } from '../lib/managerHistory'

const TYPE_CONFIG = {
  login:           { icon: LogIn,        color: '#00ff88', label: 'Logged In' },
  logout:          { icon: LogOut,       color: '#ff3b5c', label: 'Logged Out' },
  scenario_change: { icon: RefreshCw,    color: '#00e5ff', label: 'Scenario Changed' },
  alert_resolved:  { icon: AlertTriangle,color: '#ffb800', label: 'Alert Resolved' },
  data_upload:     { icon: Upload,       color: '#a78bfa', label: 'Data Uploaded' },
  war_room:        { icon: Zap,          color: '#ff3b5c', label: 'War Room Opened' },
  pdf_export:      { icon: FileText,     color: '#00e5ff', label: 'PDF Exported' },
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(isoString).toLocaleDateString()
}

export default function ManagerHistoryPanel({ theme }) {
  const isDark = theme === 'dark'
  const [history, setHistory] = useState([])
  const [expanded, setExpanded] = useState(true)
  const [filter, setFilter] = useState('all')
  const [tick, setTick] = useState(0)

  // Refresh every 5 seconds to show new entries
  useEffect(() => {
    setHistory(getManagerHistory())
    const interval = setInterval(() => {
      setHistory(getManagerHistory())
      setTick(t => t + 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const surface    = isDark ? '#0d1526' : '#ffffff'
  const borderCol  = isDark ? '#1a2540' : '#e2e8f0'
  const textMain   = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted  = isDark ? '#4a6080' : '#64748b'
  const subSurface = isDark ? '#0a0f1e' : '#f8fafc'

  const filterTypes = ['all', 'login', 'logout', 'scenario_change', 'alert_resolved', 'data_upload', 'war_room', 'pdf_export']
  const filtered = filter === 'all' ? history : history.filter(e => e.type === filter)

  const handleClear = () => {
    clearManagerHistory()
    setHistory([])
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: surface, borderColor: borderCol }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b cursor-pointer"
        style={{ background: subSurface, borderColor: borderCol }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <History size={14} className="text-purple-400" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase" style={{ color: textMain }}>
            Manager Activity History
          </span>
          {history.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              {history.length} events
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={e => { e.stopPropagation(); handleClear() }}
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg border transition-all hover:border-red-500/50 hover:text-red-400"
              style={{ borderColor: borderCol, color: textMuted }}
            >
              <Trash2 size={10} /> Clear
            </button>
          )}
          <span style={{ color: textMuted }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Clock size={24} style={{ color: textMuted }} />
              <p className="text-sm font-mono" style={{ color: textMuted }}>No manager activity yet</p>
              <p className="text-xs font-body" style={{ color: textMuted }}>
                Activity is recorded when a manager logs in and uses the dashboard
              </p>
            </div>
          ) : (
            <>
              {/* Filter tabs */}
              <div className="flex gap-2 flex-wrap">
                {filterTypes.map(type => {
                  const count = type === 'all' ? history.length : history.filter(e => e.type === type).length
                  if (type !== 'all' && count === 0) return null
                  return (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className="px-3 py-1 rounded-full text-[10px] font-mono transition-all capitalize"
                      style={{
                        background: filter === type ? '#a78bfa' : borderCol,
                        color: filter === type ? '#080c14' : textMuted,
                        fontWeight: filter === type ? 700 : 400,
                      }}
                    >
                      {type === 'all' ? 'All' : TYPE_CONFIG[type]?.label ?? type} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Timeline */}
              <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                {filtered.length === 0 ? (
                  <p className="text-xs font-mono text-center py-6" style={{ color: textMuted }}>No events of this type</p>
                ) : (
                  filtered.map((entry, i) => {
                    const cfg = TYPE_CONFIG[entry.type] ?? { icon: Clock, color: '#4a6080', label: entry.type }
                    const Icon = cfg.icon
                    return (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all"
                        style={{ background: i % 2 === 0 ? subSurface : 'transparent' }}
                      >
                        {/* Icon */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${cfg.color}18` }}
                        >
                          <Icon size={13} style={{ color: cfg.color }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold" style={{ color: cfg.color }}>
                              {cfg.label}
                            </span>
                            <span className="text-[10px] font-mono flex-shrink-0" style={{ color: textMuted }}>
                              {timeAgo(entry.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs font-body mt-0.5 leading-relaxed" style={{ color: textMuted }}>
                            {entry.detail}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}