import React, { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

const PRESETS = [
  { label: 'Today',        value: 'today' },
  { label: 'Last 7 days',  value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'This Month',   value: 'month' },
  { label: 'Last Quarter', value: 'quarter' },
  { label: 'Custom',       value: 'custom' },
]

// Returns { from: Date, to: Date } for a given preset value
export function getDateRange(value, customRange) {
  const now = new Date()
  const startOfDay = (d) => { d.setHours(0,0,0,0); return d }
  const endOfDay   = (d) => { d.setHours(23,59,59,999); return d }

  switch (value) {
    case 'today':
      return { from: startOfDay(new Date(now)), to: endOfDay(new Date(now)) }
    case '7d': {
      const from = new Date(now); from.setDate(now.getDate() - 6)
      return { from: startOfDay(from), to: endOfDay(new Date(now)) }
    }
    case '30d': {
      const from = new Date(now); from.setDate(now.getDate() - 29)
      return { from: startOfDay(from), to: endOfDay(new Date(now)) }
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from, to: endOfDay(new Date(now)) }
    }
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3)
      const from = new Date(now.getFullYear(), q * 3, 1)
      return { from, to: endOfDay(new Date(now)) }
    }
    case 'custom':
      return {
        from: customRange?.from ? new Date(customRange.from) : startOfDay(new Date(now)),
        to:   customRange?.to   ? new Date(customRange.to)   : endOfDay(new Date(now)),
      }
    default:
      return { from: startOfDay(new Date(now)), to: endOfDay(new Date(now)) }
  }
}

export default function DateFilter({ value, onChange, theme }) {
  const [open, setOpen]     = useState(false)
  const [custom, setCustom] = useState({ from: '', to: '' })
  const ref = useRef(null)

  const isDark    = theme === 'dark'
  const surface   = isDark ? '#0d1526' : '#ffffff'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const textMain  = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'

  const selected = PRESETS.find(p => p.value === value) || PRESETS[0]

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handlePreset = (preset) => {
    onChange(preset.value)
    if (preset.value !== 'custom') setOpen(false)
  }

  const handleApplyCustom = () => {
    if (custom.from && custom.to) {
      onChange('custom', custom)
      setOpen(false)
    }
  }

  // Format display label for custom range
  const displayLabel = value === 'custom' && custom.from && custom.to
    ? `${custom.from} → ${custom.to}`
    : selected.label

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: surface,
          border: `1px solid ${open ? '#00e5ff60' : borderCol}`,
          borderRadius: 8, cursor: 'pointer',
          color: textMain, fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
          transition: 'border-color 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        <Calendar size={12} style={{ color: '#00e5ff', flexShrink: 0 }} />
        <span>{displayLabel}</span>
        <ChevronDown
          size={12}
          style={{ color: textMuted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
          background: surface, border: `1px solid ${borderCol}`,
          borderRadius: 12, padding: 6, minWidth: 190,
          boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 8px 30px rgba(0,0,0,0.15)',
        }}>
          {PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => handlePreset(p)}
              style={{
                width: '100%', padding: '8px 12px',
                background: value === p.value ? 'rgba(0,229,255,0.1)' : 'transparent',
                border: 'none', borderRadius: 7, cursor: 'pointer',
                color: value === p.value ? '#00e5ff' : textMuted,
                fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
                textAlign: 'left', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (value !== p.value) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
              onMouseLeave={e => { if (value !== p.value) e.currentTarget.style.background = 'transparent' }}
            >
              {p.label}
              {value === p.value && <span style={{ color: '#00e5ff', fontSize: 10 }}>✓</span>}
            </button>
          ))}

          {value === 'custom' && (
            <div style={{ padding: '10px 12px', borderTop: `1px solid ${borderCol}`, marginTop: 4 }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</label>
                <input
                  type="date"
                  value={custom.from}
                  max={custom.to || undefined}
                  onChange={e => setCustom(p => ({ ...p, from: e.target.value }))}
                  style={{
                    width: '100%', padding: '5px 8px', boxSizing: 'border-box',
                    background: isDark ? '#080c14' : '#f8fafc',
                    border: `1px solid ${borderCol}`, borderRadius: 6,
                    color: textMain, fontSize: 11, fontFamily: 'monospace',
                    colorScheme: isDark ? 'dark' : 'light',
                  }}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</label>
                <input
                  type="date"
                  value={custom.to}
                  min={custom.from || undefined}
                  onChange={e => setCustom(p => ({ ...p, to: e.target.value }))}
                  style={{
                    width: '100%', padding: '5px 8px', boxSizing: 'border-box',
                    background: isDark ? '#080c14' : '#f8fafc',
                    border: `1px solid ${borderCol}`, borderRadius: 6,
                    color: textMain, fontSize: 11, fontFamily: 'monospace',
                    colorScheme: isDark ? 'dark' : 'light',
                  }}
                />
              </div>
              <button
                onClick={handleApplyCustom}
                disabled={!custom.from || !custom.to}
                style={{
                  width: '100%', padding: '7px',
                  background: (!custom.from || !custom.to) ? 'rgba(0,229,255,0.04)' : 'rgba(0,229,255,0.12)',
                  border: '1px solid rgba(0,229,255,0.3)', borderRadius: 6,
                  color: (!custom.from || !custom.to) ? textMuted : '#00e5ff',
                  fontSize: 11, cursor: (!custom.from || !custom.to) ? 'not-allowed' : 'pointer',
                  fontFamily: 'monospace', fontWeight: 600, transition: 'all 0.2s',
                }}
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}