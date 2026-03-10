import React, { useEffect, useState } from 'react'
import { getStressLabel } from '../lib/dataEngine'

export default function StressGauge({ score, breakdown }) {
  const [display, setDisplay] = useState(0)
  const { label, color } = getStressLabel(score)

  useEffect(() => {
    if (score === null) return
    const start = display
    const end = score
    const steps = 30
    let step = 0
    const timer = setInterval(() => {
      step++
      setDisplay(Math.round(start + (end - start) * (step / steps)))
      if (step >= steps) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [score])

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (display / 100) * circumference
  const arcColor = display <= 25 ? '#00ff88' : display <= 50 ? '#00e5ff' : display <= 70 ? '#ffb800' : display <= 85 ? '#ff7a00' : '#ff3b5c'

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Gauge */}
      <div className="relative">
        <svg width="220" height="140" viewBox="0 0 220 140">
          {/* Background arc */}
          <path
            d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none" stroke="#1a2540" strokeWidth="16" strokeLinecap="round"
          />
          {/* Animated fill arc */}
          <path
            d="M 20 120 A 90 90 0 0 1 200 120"
            fill="none"
            stroke={arcColor}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${Math.PI * 90}`}
            strokeDashoffset={`${Math.PI * 90 * (1 - display / 100)}`}
            style={{ transition: 'all 0.3s ease', filter: `drop-shadow(0 0 8px ${arcColor})` }}
          />
          {/* Glow dot at end */}
          <circle
            cx={110 + 90 * Math.cos(Math.PI * (1 - display / 100) - Math.PI)}
            cy={120 + 90 * Math.sin(Math.PI * (1 - display / 100) - Math.PI)}
            r="8" fill={arcColor}
            style={{ filter: `drop-shadow(0 0 6px ${arcColor})` }}
          />
          {/* Score */}
          <text x="110" y="108" textAnchor="middle" fill="white" fontSize="42" fontFamily="Syne" fontWeight="800">{display}</text>
          <text x="110" y="128" textAnchor="middle" fill="#4a6080" fontSize="12" fontFamily="DM Sans">STRESS SCORE</text>
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          <span className="text-xs font-mono text-green-400">0</span>
          <span className="text-xs font-mono text-red-400">100</span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <span className={`text-2xl font-display font-bold ${color}`}>{label}</span>
      </div>

      {/* Breakdown bars */}
      {breakdown && (
        <div className="w-full space-y-2">
          {[
            { label: 'Sales', value: breakdown.sales, weight: '35%' },
            { label: 'Inventory', value: breakdown.inventory, weight: '25%' },
            { label: 'Support', value: breakdown.support, weight: '20%' },
            { label: 'Cash Flow', value: breakdown.cash, weight: '20%' },
          ].map(({ label, value, weight }) => {
            const barColor = value <= 25 ? '#00ff88' : value <= 50 ? '#00e5ff' : value <= 70 ? '#ffb800' : '#ff3b5c'
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="w-20 text-xs text-muted font-body">{label}</div>
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${value}%`, background: barColor, boxShadow: `0 0 6px ${barColor}` }}
                  />
                </div>
                <div className="w-8 text-xs font-mono text-right" style={{ color: barColor }}>{value}</div>
                <div className="w-8 text-xs text-muted">{weight}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
