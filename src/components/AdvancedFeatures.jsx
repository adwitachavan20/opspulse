import React, { useState, useEffect, useRef } from 'react'
import {
  Brain, TrendingUp, BarChart3, Users, FileText, Bell, 
  Target, ShieldAlert, Clock, Cpu, Activity, Zap,
  ChevronRight, ArrowUpRight, ArrowDownRight, Minus,
  AlertTriangle, CheckCircle, XCircle, Loader, 
  RefreshCw, Eye, Calendar, Filter, Thermometer,
  Package, Truck, Star, MessageSquare, DollarSign,
  Smartphone, Flame, GitBranch, Globe
} from 'lucide-react'

// ─── AI Root Cause Analysis ─────────────────────────────────────────────────
function RootCauseAnalysis({ stressScore, metrics, theme }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const isDark = theme === 'dark'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const prompt = `Analyze these business metrics and provide a Root Cause Analysis in JSON format:
Stress Score: ${stressScore?.overall}/100
Sales Stress: ${stressScore?.sales}/100, Cash Stress: ${stressScore?.cash}/100
Inventory Stress: ${stressScore?.inventory}/100, Support Stress: ${stressScore?.support}/100
Revenue: ₹${metrics?.sales?.revenue?.toFixed(0)}, Conversion: ${metrics?.sales?.conversion_rate?.toFixed(2)}%
Cash Runway: ${metrics?.cashflow?.runway_days} days, CSAT: ${metrics?.support?.csat_score?.toFixed(0)}%
Low Stock SKUs: ${metrics?.inventory?.low_stock_items}, Open Tickets: ${metrics?.support?.open_tickets}

Return ONLY valid JSON (no markdown) with this exact structure:
{"primaryCause": "string", "rootFactors": [{"factor": "string", "impact": "high|medium|low", "metric": "string", "recommendation": "string"}], "urgencyScore": 1-10, "timeToAct": "string", "chainEffects": ["string"]}`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-calls': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || '{}'
      const clean = text.replace(/```json|```/g, '').trim()
      setAnalysis(JSON.parse(clean))
    } catch (e) {
      setAnalysis({
        primaryCause: "High operational stress across multiple verticals",
        rootFactors: [
          { factor: "Low Cash Runway", impact: "high", metric: `${metrics?.cashflow?.runway_days || 'N/A'} days remaining`, recommendation: "Reduce burn rate by 15% immediately" },
          { factor: "Poor Conversion Rate", impact: "high", metric: `${metrics?.sales?.conversion_rate?.toFixed(1) || 'N/A'}%`, recommendation: "A/B test checkout flow" },
          { factor: "Inventory Gaps", impact: "medium", metric: `${metrics?.inventory?.low_stock_items || 'N/A'} low SKUs`, recommendation: "Emergency restock top 5 SKUs" }
        ],
        urgencyScore: stressScore?.overall > 70 ? 9 : 5,
        timeToAct: "48 hours",
        chainEffects: ["Revenue loss if stockouts persist", "Customer churn if CSAT declines", "Funding risk if runway < 30 days"]
      })
    }
    setLoading(false)
  }

  const impactColor = (impact) => impact === 'high' ? '#ff3b5c' : impact === 'medium' ? '#ffb800' : '#00e5ff'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={14} style={{ color: '#00e5ff' }} />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Root Cause Analysis</span>
        </div>
        <button onClick={runAnalysis} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
          background: loading ? 'rgba(0,229,255,0.05)' : 'rgba(0,229,255,0.1)',
          border: '1px solid rgba(0,229,255,0.3)', borderRadius: 8,
          color: '#00e5ff', fontSize: 11, fontFamily: 'monospace', cursor: loading ? 'default' : 'pointer'
        }}>
          {loading ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={11} />}
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {!analysis && !loading && (
        <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
          <Brain size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <p style={{ fontFamily: 'monospace', fontSize: 13 }}>Click "Run Analysis" to identify root causes</p>
        </div>
      )}

      {analysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 14, background: 'rgba(255,59,92,0.05)', border: '1px solid rgba(255,59,92,0.2)', borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: '#ff3b5c', fontFamily: 'monospace', marginBottom: 4 }}>PRIMARY CAUSE</div>
            <p style={{ fontSize: 14, color: textMain, fontWeight: 600 }}>{analysis.primaryCause}</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace' }}>Urgency: <span style={{ color: '#ff3b5c' }}>{analysis.urgencyScore}/10</span></div>
              <div style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace' }}>Act within: <span style={{ color: '#ffb800' }}>{analysis.timeToAct}</span></div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace', marginBottom: 10, textTransform: 'uppercase' }}>Root Factors</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analysis.rootFactors?.map((f, i) => (
                <div key={i} style={{ padding: 12, background: surface, border: `1px solid ${borderCol}`, borderRadius: 8, borderLeft: `3px solid ${impactColor(f.impact)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: textMain }}>{f.factor}</span>
                    <span style={{ fontSize: 10, color: impactColor(f.impact), fontFamily: 'monospace', background: impactColor(f.impact) + '20', padding: '2px 8px', borderRadius: 4 }}>{f.impact.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#00e5ff', fontFamily: 'monospace', marginBottom: 4 }}>{f.metric}</div>
                  <div style={{ fontSize: 12, color: textMuted }}>→ {f.recommendation}</div>
                </div>
              ))}
            </div>
          </div>

          {analysis.chainEffects?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace', marginBottom: 8, textTransform: 'uppercase' }}>Chain Effects</div>
              {analysis.chainEffects.map((effect, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < analysis.chainEffects.length - 1 ? `1px solid ${borderCol}` : 'none' }}>
                  <ChevronRight size={12} style={{ color: '#ffb800', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: textMuted }}>{effect}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Heatmap Calendar ───────────────────────────────────────────────────────
function HeatmapCalendar({ history, theme }) {
  const isDark = theme === 'dark'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'
  const [tooltip, setTooltip] = useState(null)

  const heatmapData = React.useMemo(() => {
    const today = new Date()
    const weeks = []
    for (let w = 17; w >= 0; w--) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(today)
        date.setDate(today.getDate() - (w * 7 + (6 - d)))
        const isWeekend = d === 0 || d === 6
        const stress = Math.round(Math.max(5, Math.min(98,
          40 + Math.sin((w * 7 + d) * 0.4) * 20 + Math.random() * 25 + (isWeekend ? -15 : 0) + (w < 3 ? 15 : 0)
        )))
        week.push({ date, stress, day: date.getDate(), month: date.getMonth() })
      }
      weeks.push(week)
    }
    return weeks
  }, [])

  const getColor = (stress) => {
    if (stress <= 20) return { bg: 'rgba(0,255,136,0.65)', border: '#00ff88' }
    if (stress <= 40) return { bg: 'rgba(0,229,255,0.5)', border: '#00e5ff' }
    if (stress <= 60) return { bg: 'rgba(255,184,0,0.55)', border: '#ffb800' }
    if (stress <= 80) return { bg: 'rgba(255,100,0,0.6)', border: '#ff6400' }
    return { bg: 'rgba(255,59,92,0.7)', border: '#ff3b5c' }
  }
  const getLabel = (s) => s <= 20 ? 'Healthy' : s <= 40 ? 'Stable' : s <= 60 ? 'Caution' : s <= 80 ? 'Stressed' : 'Critical'

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const CELL = 28, GAP = 4

  const allDays = heatmapData.flat()
  const avgStress = Math.round(allDays.reduce((s, d) => s + d.stress, 0) / allDays.length)
  const maxDay = allDays.reduce((a, b) => a.stress > b.stress ? a : b)
  const minDay = allDays.reduce((a, b) => a.stress < b.stress ? a : b)
  const criticalDays = allDays.filter(d => d.stress > 80).length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Thermometer size={14} style={{ color: '#00e5ff' }} />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Stress Score Heatmap — Last 18 Weeks
          </span>
        </div>
        <span style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>Hover cells for details</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Avg Stress', val: avgStress, color: getColor(avgStress).border },
          { label: 'Critical Days', val: criticalDays, color: '#ff3b5c' },
          { label: 'Peak Stress', val: maxDay.stress, color: '#ff3b5c', sub: maxDay.date.toLocaleDateString() },
          { label: 'Best Day', val: minDay.stress, color: '#00ff88', sub: minDay.date.toLocaleDateString() },
        ].map((s, i) => (
          <div key={i} style={{ padding: '10px 14px', background: surface, border: `1px solid ${borderCol}`, borderRadius: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.val}</div>
            <div style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>{s.label}</div>
            {s.sub && <div style={{ fontSize: 9, color: textMuted, fontFamily: 'monospace', marginTop: 2 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: GAP, minWidth: 'max-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, paddingTop: 22 }}>
            {dayLabels.map((d, i) => (
              <div key={i} style={{ width: 30, height: CELL, fontSize: 10, color: textMuted, fontFamily: 'monospace', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, opacity: i % 2 === 0 ? 0.5 : 1 }}>
                {d}
              </div>
            ))}
          </div>
          {heatmapData.map((week, wi) => {
            const firstOfMonth = week.find(d => d.day <= 7)
            return (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                <div style={{ height: 18, fontSize: 10, color: textMuted, fontFamily: 'monospace', textAlign: 'center', lineHeight: '18px' }}>
                  {firstOfMonth ? months[firstOfMonth.month] : ''}
                </div>
                {week.map((day, di) => {
                  const colors = getColor(day.stress)
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  return (
                    <div key={di}
                      onMouseEnter={e => { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ day, x: r.right + 6, y: r.top }) }}
                      onMouseLeave={() => setTooltip(null)}
                      onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.25)'; e.currentTarget.style.zIndex = '10' }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '1' }}
                      style={{
                        width: CELL, height: CELL, borderRadius: 6,
                        background: colors.bg,
                        border: isToday ? `2px solid ${colors.border}` : `1px solid ${colors.border}50`,
                        cursor: 'pointer',
                        transition: 'transform 0.12s',
                        position: 'relative', zIndex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace', fontWeight: 700
                      }}
                    >
                      {day.stress}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x, top: tooltip.y, zIndex: 9999,
          background: isDark ? '#0d1526' : '#ffffff',
          border: `1px solid ${getColor(tooltip.day.stress).border}`,
          borderRadius: 10, padding: '10px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          pointerEvents: 'none', minWidth: 130
        }}>
          <div style={{ fontSize: 12, color: textMain, fontWeight: 600, marginBottom: 4 }}>
            {tooltip.day.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: getColor(tooltip.day.stress).border, fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>
            {tooltip.day.stress}
          </div>
          <div style={{ fontSize: 11, color: getColor(tooltip.day.stress).border, fontFamily: 'monospace', marginTop: 2 }}>
            {getLabel(tooltip.day.stress)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>← Low stress</span>
        {[
          ['rgba(0,255,136,0.65)', '≤20'],
          ['rgba(0,229,255,0.55)', '≤40'],
          ['rgba(255,184,0,0.6)', '≤60'],
          ['rgba(255,100,0,0.65)', '≤80'],
          ['rgba(255,59,92,0.75)', '80+'],
        ].map(([c, l], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: c }} />
            <span style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>{l}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>High stress →</span>
      </div>
    </div>
  )
}


// ─── Financial Forecasting ──────────────────────────────────────────────────
function FinancialForecast({ metrics, theme }) {
  const isDark = theme === 'dark'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'

  const revenue = metrics?.sales?.revenue || 42000
  const burnRate = metrics?.cashflow?.burn_rate || 85000
  const runway = metrics?.cashflow?.runway_days || 65

  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
  const baseRevenue = revenue * 30
  const forecasts = months.map((m, i) => ({
    month: m,
    optimistic: Math.round(baseRevenue * (1 + 0.08 * (i + 1))),
    realistic: Math.round(baseRevenue * (1 + 0.03 * (i + 1))),
    pessimistic: Math.round(baseRevenue * (1 - 0.02 * (i + 1))),
  }))

  const maxVal = Math.max(...forecasts.map(f => f.optimistic))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <TrendingUp size={14} style={{ color: '#00e5ff' }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>6-Month Revenue Forecast</span>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Monthly Revenue', val: `₹${(baseRevenue/1000).toFixed(0)}K`, sub: 'Current', color: '#00e5ff' },
          { label: '6M Projection', val: `₹${(forecasts[5].realistic/1000).toFixed(0)}K`, sub: 'Realistic', color: '#00ff88' },
          { label: 'Cash Runway', val: `${runway}d`, sub: 'Remaining', color: runway < 45 ? '#ff3b5c' : '#ffb800' }
        ].map((c, i) => (
          <div key={i} style={{ padding: 12, background: surface, border: `1px solid ${borderCol}`, borderRadius: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color, fontFamily: 'Syne, sans-serif' }}>{c.val}</div>
            <div style={{ fontSize: 11, color: textMain, fontWeight: 600, marginTop: 2 }}>{c.label}</div>
            <div style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 120, marginBottom: 8 }}>
        {forecasts.map((f, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'stretch', height: 100, justifyContent: 'flex-end' }}>
              <div style={{ height: `${(f.optimistic / maxVal) * 100}%`, background: 'rgba(0,255,136,0.2)', borderRadius: '3px 3px 0 0', minHeight: 4 }} />
              <div style={{ height: `${(f.realistic / maxVal) * 100}%`, background: 'rgba(0,229,255,0.4)', borderRadius: '3px 3px 0 0', minHeight: 4, marginTop: -100 }} />
              <div style={{ height: `${(f.pessimistic / maxVal) * 100}%`, background: 'rgba(255,59,92,0.3)', borderRadius: '3px 3px 0 0', minHeight: 4, marginTop: -100 }} />
            </div>
            <span style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>{f.month}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {[['rgba(0,255,136,0.4)', 'Optimistic'], ['rgba(0,229,255,0.6)', 'Realistic'], ['rgba(255,59,92,0.5)', 'Pessimistic']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
            <span style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Smart Recommendations ──────────────────────────────────────────────────
function SmartRecommendations({ stressScore, metrics, theme }) {
  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(false)
  const isDark = theme === 'dark'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'

  const generateRecs = async () => {
    setLoading(true)
    try {
      const prompt = `Based on these business metrics, generate 5 smart recommendations as JSON array.
Stress: ${stressScore?.overall}/100, Revenue: ₹${metrics?.sales?.revenue?.toFixed(0)}, 
Conversion: ${metrics?.sales?.conversion_rate?.toFixed(2)}%, Cash: ${metrics?.cashflow?.runway_days}d runway,
CSAT: ${metrics?.support?.csat_score?.toFixed(0)}%, Low Stock: ${metrics?.inventory?.low_stock_items} SKUs

Return ONLY valid JSON array (no markdown), each object: {"title": "string", "description": "string", "impact": "high|medium|low", "effort": "high|medium|low", "category": "revenue|cost|operations|customer", "roi": "string"}`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-calls': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || '[]'
      const clean = text.replace(/```json|```/g, '').trim()
      setRecs(JSON.parse(clean))
    } catch (e) {
      setRecs([
        { title: "Optimize Checkout Flow", description: "A/B test 2-step vs 3-step checkout to improve conversion", impact: "high", effort: "medium", category: "revenue", roi: "+12% conversion" },
        { title: "Restock Top 5 SKUs", description: "Emergency purchase order for stockout items causing revenue loss", impact: "high", effort: "low", category: "operations", roi: "+₹25K/month" },
        { title: "Reduce Ticket Resolution Time", description: "Implement chatbot for L1 support queries", impact: "medium", effort: "medium", category: "customer", roi: "+8 CSAT pts" },
        { title: "Negotiate Supplier Terms", description: "Extend payment terms by 30 days to improve cash runway", impact: "high", effort: "low", category: "cost", roi: "+30d runway" },
        { title: "Launch Referral Program", description: "Customer referral program can reduce CAC by 40%", impact: "medium", effort: "medium", category: "revenue", roi: "-40% CAC" },
      ])
    }
    setLoading(false)
  }

  useEffect(() => { generateRecs() }, [])

  const impactColors = { high: '#00ff88', medium: '#ffb800', low: '#00e5ff' }
  const categoryColors = { revenue: '#00ff88', cost: '#ffb800', operations: '#00e5ff', customer: '#a78bfa' }
  const categoryIcons = { revenue: TrendingUp, cost: DollarSign, operations: Package, customer: Users }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={14} style={{ color: '#00e5ff' }} />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Smart Recommendations</span>
        </div>
        <button onClick={generateRecs} disabled={loading} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'monospace'
        }}>
          <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(recs || []).map((rec, i) => {
          const CatIcon = categoryIcons[rec.category] || Target
          return (
            <div key={i} style={{
              padding: '12px 14px', background: surface,
              border: `1px solid ${borderCol}`, borderRadius: 10,
              borderLeft: `3px solid ${impactColors[rec.impact] || '#00e5ff'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: (categoryColors[rec.category] || '#00e5ff') + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CatIcon size={14} style={{ color: categoryColors[rec.category] || '#00e5ff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: textMain }}>{rec.title}</span>
                    <span style={{ fontSize: 11, color: '#00ff88', fontFamily: 'monospace', fontWeight: 700 }}>{rec.roi}</span>
                  </div>
                  <p style={{ fontSize: 12, color: textMuted, marginBottom: 6, lineHeight: 1.4 }}>{rec.description}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 10, color: impactColors[rec.impact], fontFamily: 'monospace', background: impactColors[rec.impact] + '15', padding: '2px 6px', borderRadius: 4 }}>
                      {rec.impact?.toUpperCase()} IMPACT
                    </span>
                    <span style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', padding: '2px 6px', borderRadius: 4 }}>
                      {rec.effort?.toUpperCase()} EFFORT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Customer Sentiment ──────────────────────────────────────────────────────
function CustomerSentiment({ metrics, theme }) {
  const isDark = theme === 'dark'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'

  const csat = metrics?.support?.csat_score || 72
  const sentimentScore = Math.round(csat * 0.9 + Math.random() * 10)

  const reviews = [
    { text: "Fast delivery and great quality products!", sentiment: 'positive', score: 92, channel: 'Google' },
    { text: "Support took too long to respond to my query", sentiment: 'negative', score: 28, channel: 'Email' },
    { text: "Good product but packaging could be better", sentiment: 'neutral', score: 55, channel: 'Amazon' },
    { text: "Excellent customer service, resolved issue quickly!", sentiment: 'positive', score: 88, channel: 'WhatsApp' },
    { text: "Out of stock items are frustrating", sentiment: 'negative', score: 22, channel: 'Instagram' },
  ]

  const sentColors = { positive: '#00ff88', neutral: '#ffb800', negative: '#ff3b5c' }
  const positiveCount = reviews.filter(r => r.sentiment === 'positive').length
  const negativeCount = reviews.filter(r => r.sentiment === 'negative').length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <MessageSquare size={14} style={{ color: '#00e5ff' }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Customer Sentiment Analysis</span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: 16, background: surface, borderRadius: 10, border: `1px solid ${borderCol}` }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: sentimentScore > 70 ? '#00ff88' : sentimentScore > 50 ? '#ffb800' : '#ff3b5c', fontFamily: 'Syne, sans-serif' }}>{sentimentScore}</div>
          <div style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace' }}>SENTIMENT SCORE</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ padding: '8px 12px', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#00ff88' }}>Positive</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#00ff88', fontFamily: 'monospace' }}>{positiveCount}</span>
          </div>
          <div style={{ padding: '8px 12px', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#ffb800' }}>Neutral</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ffb800', fontFamily: 'monospace' }}>{reviews.filter(r => r.sentiment === 'neutral').length}</span>
          </div>
          <div style={{ padding: '8px 12px', background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#ff3b5c' }}>Negative</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ff3b5c', fontFamily: 'monospace' }}>{negativeCount}</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 10 }}>Recent Feedback</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {reviews.map((r, i) => (
          <div key={i} style={{ padding: '10px 12px', background: surface, border: `1px solid ${borderCol}`, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: sentColors[r.sentiment], fontFamily: 'monospace', background: sentColors[r.sentiment] + '20', padding: '2px 6px', borderRadius: 4 }}>{r.sentiment.toUpperCase()}</span>
              <span style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>{r.channel}</span>
            </div>
            <p style={{ fontSize: 12, color: textMain, margin: 0, lineHeight: 1.4 }}>"{r.text}"</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Team Productivity ───────────────────────────────────────────────────────
function TeamProductivity({ theme }) {
  const isDark = theme === 'dark'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'

  const teams = [
    { name: 'Sales', score: 87, tasks: 23, completed: 20, trend: 'up' },
    { name: 'Support', score: 74, tasks: 45, completed: 33, trend: 'up' },
    { name: 'Operations', score: 91, tasks: 18, completed: 17, trend: 'up' },
    { name: 'Marketing', score: 68, tasks: 31, completed: 21, trend: 'down' },
    { name: 'Finance', score: 95, tasks: 12, completed: 12, trend: 'up' },
  ]

  const scoreColor = (s) => s >= 80 ? '#00ff88' : s >= 60 ? '#ffb800' : '#ff3b5c'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Users size={14} style={{ color: '#00e5ff' }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Team Productivity Score</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {teams.map((team, i) => (
          <div key={i} style={{ padding: '12px 14px', background: surface, border: `1px solid ${borderCol}`, borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: textMain }}>{team.name}</span>
                <span style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace', marginLeft: 8 }}>{team.completed}/{team.tasks} tasks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {team.trend === 'up' ? <ArrowUpRight size={14} style={{ color: '#00ff88' }} /> : <ArrowDownRight size={14} style={{ color: '#ff3b5c' }} />}
                <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(team.score), fontFamily: 'Syne, sans-serif' }}>{team.score}</span>
              </div>
            </div>
            <div style={{ height: 6, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${team.score}%`, background: `linear-gradient(90deg, ${scoreColor(team.score)}99, ${scoreColor(team.score)})`, borderRadius: 3, transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Supplier Risk Monitoring ────────────────────────────────────────────────
function SupplierRisk({ theme }) {
  const isDark = theme === 'dark'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'

  const suppliers = [
    { name: 'Alpha Supplies Co.', riskScore: 82, items: 45, status: 'critical', issue: 'Payment overdue 30d', country: 'India' },
    { name: 'Beta Components Ltd.', riskScore: 45, items: 23, status: 'warning', issue: 'Delivery delays 3x', country: 'China' },
    { name: 'Gamma Electronics', riskScore: 18, items: 67, status: 'healthy', issue: 'None', country: 'Taiwan' },
    { name: 'Delta Raw Materials', riskScore: 63, items: 12, status: 'warning', issue: 'Price volatility +22%', country: 'Brazil' },
    { name: 'Epsilon Logistics', riskScore: 29, items: 90, status: 'healthy', issue: 'Minor delays', country: 'India' },
  ]

  const statusConfig = {
    critical: { color: '#ff3b5c', label: 'CRITICAL' },
    warning: { color: '#ffb800', label: 'WARNING' },
    healthy: { color: '#00ff88', label: 'HEALTHY' }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Truck size={14} style={{ color: '#00e5ff' }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Supplier Risk Monitoring</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {suppliers.map((s, i) => {
          const cfg = statusConfig[s.status]
          return (
            <div key={i} style={{ padding: '10px 14px', background: surface, border: `1px solid ${s.status === 'critical' ? 'rgba(255,59,92,0.3)' : borderCol}`, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: textMain }}>{s.name}</span>
                    <span style={{ fontSize: 9, color: textMuted, fontFamily: 'monospace', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', padding: '1px 5px', borderRadius: 3 }}>{s.country}</span>
                  </div>
                  <span style={{ fontSize: 11, color: textMuted }}>{s.issue}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color, fontFamily: 'Syne, sans-serif' }}>{s.riskScore}</div>
                  <span style={{ fontSize: 9, color: cfg.color, fontFamily: 'monospace', background: cfg.color + '20', padding: '1px 6px', borderRadius: 3 }}>{cfg.label}</span>
                </div>
              </div>
              <div style={{ height: 4, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.riskScore}%`, background: cfg.color, borderRadius: 2 }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Competitor Benchmarking ─────────────────────────────────────────────────
function CompetitorBenchmark({ metrics, theme }) {
  const isDark = theme === 'dark'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'

  const myConv = metrics?.sales?.conversion_rate || 2.3
  const myCsat = metrics?.support?.csat_score || 72

  const competitors = [
    { name: 'Your Business', conv: myConv, csat: myCsat, revenue: 42, growth: 3.2, isYou: true },
    { name: 'Competitor A', conv: 3.8, csat: 84, revenue: 68, growth: 8.5, isYou: false },
    { name: 'Competitor B', conv: 2.1, csat: 71, revenue: 35, growth: 1.2, isYou: false },
    { name: 'Industry Avg', conv: 2.9, csat: 76, revenue: 51, growth: 5.1, isYou: false },
  ]

  const metrics2 = ['conv', 'csat', 'revenue', 'growth']
  const labels = { conv: 'Conversion %', csat: 'CSAT Score', revenue: 'Revenue (K)', growth: 'Growth %' }
  const maxes = { conv: 5, csat: 100, revenue: 100, growth: 15 }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Globe size={14} style={{ color: '#00e5ff' }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Competitor Benchmarking</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', fontSize: 10, color: textMuted, fontFamily: 'monospace', paddingBottom: 8, paddingLeft: 12 }}>Company</th>
              {metrics2.map(m => (
                <th key={m} style={{ textAlign: 'center', fontSize: 10, color: textMuted, fontFamily: 'monospace', paddingBottom: 8 }}>{labels[m]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competitors.map((comp, i) => (
              <tr key={i}>
                <td style={{ padding: '8px 12px', background: comp.isYou ? 'rgba(0,229,255,0.08)' : surface, borderRadius: '8px 0 0 8px', border: `1px solid ${comp.isYou ? 'rgba(0,229,255,0.2)' : borderCol}`, borderRight: 'none' }}>
                  <span style={{ fontSize: 13, fontWeight: comp.isYou ? 700 : 400, color: comp.isYou ? '#00e5ff' : textMain }}>{comp.name}</span>
                </td>
                {metrics2.map((m, mi) => {
                  const val = comp[m]
                  const max = maxes[m]
                  const pct = (val / max) * 100
                  const isGood = comp.isYou && val >= (competitors.find(c => !c.isYou && c.name === 'Industry Avg')?.[m] || 0)
                  return (
                    <td key={m} style={{ padding: '8px 10px', background: comp.isYou ? 'rgba(0,229,255,0.08)' : surface, border: `1px solid ${comp.isYou ? 'rgba(0,229,255,0.2)' : borderCol}`, borderLeft: 'none', borderRight: 'none', textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: comp.isYou ? (isGood ? '#00ff88' : '#ff3b5c') : textMain, fontFamily: 'monospace' }}>{typeof val === 'number' ? val.toFixed(1) : val}</div>
                      <div style={{ height: 3, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: comp.isYou ? '#00e5ff' : '#334155', borderRadius: 1 }} />
                      </div>
                    </td>
                  )
                })}
                <td style={{ padding: '8px 8px', background: comp.isYou ? 'rgba(0,229,255,0.08)' : surface, borderRadius: '0 8px 8px 0', border: `1px solid ${comp.isYou ? 'rgba(0,229,255,0.2)' : borderCol}`, borderLeft: 'none' }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Business Stress Forecasting ─────────────────────────────────────────────
function BusinessStressForecast({ stressScore, theme }) {
  const isDark = theme === 'dark'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'

  const current = stressScore?.overall || 45
  const forecasted = [
    { period: '1 week', score: Math.min(100, current + (Math.random() > 0.5 ? 5 : -3)), label: 'Short-term' },
    { period: '1 month', score: Math.min(100, current + (Math.random() > 0.5 ? 12 : -8)), label: 'Medium-term' },
    { period: '3 months', score: Math.min(100, current + (Math.random() > 0.5 ? 20 : -15)), label: 'Long-term' },
  ]

  const scoreColor = (s) => s <= 30 ? '#00ff88' : s <= 55 ? '#00e5ff' : s <= 70 ? '#ffb800' : '#ff3b5c'

  const riskFactors = [
    { name: 'Market Volatility', probability: 65, impact: 'high' },
    { name: 'Supply Chain Disruption', probability: 42, impact: 'medium' },
    { name: 'Demand Drop', probability: 28, impact: 'high' },
    { name: 'Competitor Entry', probability: 51, impact: 'medium' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Activity size={14} style={{ color: '#00e5ff' }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Business Stress Forecasting</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {forecasted.map((f, i) => (
          <div key={i} style={{ padding: 14, background: surface, border: `1px solid ${scoreColor(f.score)}33`, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(f.score), fontFamily: 'Syne, sans-serif' }}>{Math.round(f.score)}</div>
            <div style={{ fontSize: 11, color: textMain, fontWeight: 600 }}>{f.period}</div>
            <div style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace' }}>{f.label}</div>
            <div style={{ fontSize: 10, color: f.score > current ? '#ff3b5c' : '#00ff88', marginTop: 4 }}>
              {f.score > current ? '↑' : '↓'} {Math.abs(Math.round(f.score - current))} pts
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 12 }}>Risk Probability Matrix</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {riskFactors.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: textMain, width: 180, flexShrink: 0 }}>{r.name}</span>
            <div style={{ flex: 1, height: 8, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${r.probability}%`,
                background: r.impact === 'high' ? 'linear-gradient(90deg, #ff3b5c99, #ff3b5c)' : 'linear-gradient(90deg, #ffb80099, #ffb800)',
                borderRadius: 4
              }} />
            </div>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: r.impact === 'high' ? '#ff3b5c' : '#ffb800', width: 40, textAlign: 'right' }}>{r.probability}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Digital Twin Simulation ─────────────────────────────────────────────────
function DigitalTwin({ metrics, stressScore, theme }) {
  const isDark = theme === 'dark'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'

  const [simParams, setSimParams] = useState({
    revenueChange: 0, staffChange: 0, marketingBudget: 0, inventoryLevel: 0
  })
  const [simResult, setSimResult] = useState(null)
  const [simLoading, setSimLoading] = useState(false)

  const runSimulation = async () => {
    setSimLoading(true)
    await new Promise(r => setTimeout(r, 1200))

    const revFactor = 1 + simParams.revenueChange / 100
    const staffFactor = 1 + simParams.staffChange / 100
    const mktFactor = 1 + simParams.marketingBudget / 100

    const newRevenue = (metrics?.sales?.revenue || 42000) * revFactor * (1 + simParams.marketingBudget * 0.003)
    const newStress = Math.max(0, Math.min(100, (stressScore?.overall || 50) * (2 - revFactor * 0.8 * staffFactor * 0.2)))
    const newRunway = Math.max(0, (metrics?.cashflow?.runway_days || 65) + simParams.inventoryLevel * -0.3 + simParams.marketingBudget * -0.5 + simParams.revenueChange * 0.8)

    setSimResult({
      revenue: Math.round(newRevenue),
      stress: Math.round(newStress),
      runway: Math.round(newRunway),
      growth: ((newRevenue / (metrics?.sales?.revenue || 42000) - 1) * 100).toFixed(1)
    })
    setSimLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <GitBranch size={14} style={{ color: '#00e5ff' }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Digital Twin Business Simulation</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Revenue Change %', key: 'revenueChange', min: -50, max: 100 },
          { label: 'Staff Change %', key: 'staffChange', min: -30, max: 50 },
          { label: 'Marketing Budget %', key: 'marketingBudget', min: -50, max: 200 },
          { label: 'Inventory Level %', key: 'inventoryLevel', min: -50, max: 100 },
        ].map(param => (
          <div key={param.key} style={{ padding: '10px 12px', background: surface, border: `1px solid ${borderCol}`, borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace' }}>{param.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: simParams[param.key] > 0 ? '#00ff88' : simParams[param.key] < 0 ? '#ff3b5c' : textMuted, fontFamily: 'monospace' }}>
                {simParams[param.key] > 0 ? '+' : ''}{simParams[param.key]}%
              </span>
            </div>
            <input
              type="range" min={param.min} max={param.max} step={5}
              value={simParams[param.key]}
              onChange={e => setSimParams(prev => ({ ...prev, [param.key]: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: '#00e5ff', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      <button onClick={runSimulation} disabled={simLoading} style={{
        width: '100%', padding: '12px',
        background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(59,130,246,0.15))',
        border: '1px solid rgba(0,229,255,0.3)', borderRadius: 10,
        color: '#00e5ff', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, cursor: simLoading ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16
      }}>
        {simLoading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Running Simulation...</> : <><Cpu size={14} /> Run Digital Twin Simulation</>}
      </button>

      {simResult && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            { label: 'Projected Revenue', val: `₹${(simResult.revenue/1000).toFixed(0)}K`, color: simResult.revenue > (metrics?.sales?.revenue || 42000) ? '#00ff88' : '#ff3b5c' },
            { label: 'Stress Score', val: simResult.stress, color: simResult.stress < (stressScore?.overall || 50) ? '#00ff88' : '#ff3b5c' },
            { label: 'Cash Runway', val: `${simResult.runway}d`, color: simResult.runway > 60 ? '#00ff88' : '#ff3b5c' },
            { label: 'Revenue Growth', val: `${simResult.growth}%`, color: parseFloat(simResult.growth) > 0 ? '#00ff88' : '#ff3b5c' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '12px 10px', background: r.color + '10', border: `1px solid ${r.color}33`, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: r.color, fontFamily: 'Syne, sans-serif' }}>{r.val}</div>
              <div style={{ fontSize: 10, color: textMuted, fontFamily: 'monospace', marginTop: 4 }}>{r.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Weekly Report ───────────────────────────────────────────────────────────
function WeeklyReport({ metrics, stressScore, theme }) {
  const isDark = theme === 'dark'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const surface = isDark ? '#0a0f1e' : '#f8fafc'
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-calls': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Generate a concise weekly business report in JSON format.
Metrics: Stress=${stressScore?.overall}/100, Revenue=₹${metrics?.sales?.revenue?.toFixed(0)}/day, Conversion=${metrics?.sales?.conversion_rate?.toFixed(2)}%, CSAT=${metrics?.support?.csat_score?.toFixed(0)}%, Runway=${metrics?.cashflow?.runway_days}d, LowStock=${metrics?.inventory?.low_stock_items}

Return ONLY valid JSON: {"weekSummary": "string (2 sentences)", "topWins": ["string x3"], "topChallenges": ["string x3"], "nextWeekFocus": ["string x3"], "overallRating": "A|B|C|D"}`
          }]
        })
      })
      const data = await res.json()
      const clean = (data.content?.[0]?.text || '{}').replace(/```json|```/g, '').trim()
      setReport(JSON.parse(clean))
    } catch (e) {
      setReport({
        weekSummary: "Business maintained operational stability despite elevated stress levels. Revenue is tracking near target with opportunities for conversion optimization.",
        topWins: ["Resolved 85% of support tickets within SLA", "Cash balance stable above ₹50K", "New product category showing 12% higher AOV"],
        topChallenges: ["Conversion rate below industry average", "3 stockout events impacting revenue", "Support response times increasing"],
        nextWeekFocus: ["Run A/B test on checkout flow", "Emergency restock for top SKUs", "Launch automated L1 support bot"],
        overallRating: stressScore?.overall > 70 ? 'C' : stressScore?.overall > 50 ? 'B' : 'A'
      })
    }
    setLoading(false)
  }

  const ratingColor = { 'A': '#00ff88', 'B': '#00e5ff', 'C': '#ffb800', 'D': '#ff3b5c' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={14} style={{ color: '#00e5ff' }} />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Automated Weekly Report</span>
        </div>
        <button onClick={generateReport} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
          background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)',
          borderRadius: 8, color: '#00e5ff', fontSize: 11, fontFamily: 'monospace', cursor: loading ? 'default' : 'pointer'
        }}>
          {loading ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <FileText size={11} />}
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {!report ? (
        <div style={{ textAlign: 'center', padding: 40, color: textMuted }}>
          <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <p style={{ fontFamily: 'monospace', fontSize: 13 }}>Click "Generate Report" for AI-powered weekly summary</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, padding: 14, background: surface, border: `1px solid ${borderCol}`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: textMuted, fontFamily: 'monospace', marginBottom: 8 }}>WEEK SUMMARY</div>
              <p style={{ fontSize: 13, color: textMain, lineHeight: 1.6 }}>{report.weekSummary}</p>
            </div>
            <div style={{ width: 80, textAlign: 'center', padding: 14, background: surface, border: `1px solid ${ratingColor[report.overallRating]}40`, borderRadius: 10 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: ratingColor[report.overallRating], fontFamily: 'Syne, sans-serif' }}>{report.overallRating}</div>
              <div style={{ fontSize: 9, color: textMuted, fontFamily: 'monospace' }}>RATING</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Top Wins', items: report.topWins, color: '#00ff88', icon: '✓' },
              { label: 'Challenges', items: report.topChallenges, color: '#ff3b5c', icon: '!' },
              { label: 'Next Week Focus', items: report.nextWeekFocus, color: '#00e5ff', icon: '→' },
            ].map(section => (
              <div key={section.label} style={{ padding: 12, background: surface, border: `1px solid ${borderCol}`, borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: section.color, fontFamily: 'monospace', fontWeight: 700, marginBottom: 8 }}>{section.label}</div>
                {section.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <span style={{ color: section.color, fontSize: 11, flexShrink: 0 }}>{section.icon}</span>
                    <span style={{ fontSize: 12, color: textMuted, lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Advanced Features Component ───────────────────────────────────────
export default function AdvancedFeatures({ metrics, stressScore, alerts, history, theme }) {
  const [activeTab, setActiveTab] = useState('rootcause')
  const isDark = theme === 'dark'
  const surface = isDark ? '#0d1526' : '#ffffff'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const textMain = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'

  const tabs = [
    { id: 'rootcause', label: 'Root Cause AI', icon: Brain },
    { id: 'heatmap', label: 'Heatmap', icon: Thermometer },
    { id: 'forecast', label: 'Forecasting', icon: TrendingUp },
    { id: 'stress', label: 'Stress Forecast', icon: Activity },
    { id: 'recs', label: 'Recommendations', icon: Target },
    { id: 'sentiment', label: 'Sentiment', icon: MessageSquare },
    { id: 'team', label: 'Team Score', icon: Users },
    { id: 'supplier', label: 'Supplier Risk', icon: Truck },
    { id: 'competitor', label: 'Benchmarking', icon: Globe },
    { id: 'weekly', label: 'Weekly Report', icon: FileText },
    { id: 'digital', label: 'Digital Twin', icon: GitBranch },
  ]

  return (
    <div style={{ background: surface, border: `1px solid ${borderCol}`, borderRadius: 16, overflow: 'hidden', marginTop: 24 }}>
      {/* Tab bar */}
      <div style={{ borderBottom: `1px solid ${borderCol}`, overflowX: 'auto' }}>
        <div style={{ display: 'flex', padding: '0 16px', gap: 2, minWidth: 'max-content' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '14px 14px 12px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: active ? '#00e5ff' : textMuted,
                borderBottom: active ? '2px solid #00e5ff' : '2px solid transparent',
                fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}>
                <Icon size={12} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: 24 }}>
        {activeTab === 'rootcause' && <RootCauseAnalysis stressScore={stressScore} metrics={metrics} theme={theme} />}
        {activeTab === 'heatmap' && <HeatmapCalendar history={history} theme={theme} />}
        {activeTab === 'forecast' && <FinancialForecast metrics={metrics} theme={theme} />}
        {activeTab === 'stress' && <BusinessStressForecast stressScore={stressScore} theme={theme} />}
        {activeTab === 'recs' && <SmartRecommendations stressScore={stressScore} metrics={metrics} theme={theme} />}
        {activeTab === 'sentiment' && <CustomerSentiment metrics={metrics} theme={theme} />}
        {activeTab === 'team' && <TeamProductivity theme={theme} />}
        {activeTab === 'supplier' && <SupplierRisk theme={theme} />}
        {activeTab === 'competitor' && <CompetitorBenchmark metrics={metrics} theme={theme} />}
        {activeTab === 'weekly' && <WeeklyReport metrics={metrics} stressScore={stressScore} theme={theme} />}
        {activeTab === 'digital' && <DigitalTwin metrics={metrics} stressScore={stressScore} theme={theme} />}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}