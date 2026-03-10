import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function MetricCard({ title, value, unit, sub, trend, trendValue, icon: Icon, color = '#00e5ff', spark }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? '#00ff88' : trend === 'down' ? '#ff3b5c' : '#4a6080'

  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon size={16} style={{ color }} />
            </div>
          )}
          <span className="text-xs font-mono text-muted uppercase tracking-wider">{title}</span>
        </div>
        {trendValue !== undefined && (
          <div className="flex items-center gap-1" style={{ color: trendColor }}>
            <TrendIcon size={12} />
            <span className="text-xs font-mono">{trendValue}</span>
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-display font-bold text-white leading-none">{value}</span>
        {unit && <span className="text-sm text-muted mb-0.5 font-body">{unit}</span>}
      </div>

      {sub && <p className="text-xs text-muted mt-1 font-body">{sub}</p>}

      {/* Mini sparkline */}
      {spark && spark.length > 1 && (
        <div className="mt-3 h-8">
          <svg width="100%" height="100%" viewBox={`0 0 ${spark.length * 8} 32`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const min = Math.min(...spark)
              const max = Math.max(...spark)
              const range = max - min || 1
              const pts = spark.map((v, i) => `${i * 8},${32 - ((v - min) / range) * 28}`)
              return (
                <>
                  <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )
            })()}
          </svg>
        </div>
      )}
    </div>
  )
}
