import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
      <p className="text-xs font-mono text-muted mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted capitalize">{p.dataKey}:</span>
          <span className="font-mono text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendChart({ history, mode }) {
  if (!history?.length) return null

  const lines = mode === 'owner'
    ? [
        { key: 'overall', color: '#00e5ff', label: 'Overall Stress' },
        { key: 'sales', color: '#00ff88', label: 'Sales' },
        { key: 'cash', color: '#ffb800', label: 'Cash Flow' },
      ]
    : [
        { key: 'overall', color: '#00e5ff', label: 'Overall Stress' },
        { key: 'inventory', color: '#a78bfa', label: 'Inventory' },
        { key: 'support', color: '#f97316', label: 'Support' },
      ]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#4a6080', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={{ stroke: '#1a2540' }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#4a6080', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {lines.map(l => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            stroke={l.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: l.color }}
            style={{ filter: `drop-shadow(0 0 4px ${l.color}88)` }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
