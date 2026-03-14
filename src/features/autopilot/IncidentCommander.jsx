import React, { useState, useEffect, useRef } from 'react'

const SMS_SERVER = 'http://localhost:4000'

function speak(text) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 0.9
  utt.pitch = 0.8
  utt.volume = 1
  window.speechSynthesis.speak(utt)
}

function buildReport(metrics, stressScore, alerts) {
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  const score = stressScore?.overall ?? 0
  const crisis = (alerts || []).filter(a => a.type === 'crisis')

  let r = ''
  r += 'INCIDENT DETECTED\n'
  r += now + '\n'
  r += '--------------------------------------------\n'
  r += 'Stress Score  : ' + score + ' / 100\n'
  r += '--------------------------------------------\n\n'
  r += 'LIVE BUSINESS METRICS\n'
  r += '  Revenue        : Rs.' + Math.round(metrics?.sales?.revenue || 0).toLocaleString('en-IN') + '\n'
  r += '  Orders         : ' + (metrics?.sales?.orders ?? 'N/A') + '\n'
  r += '  Conversion     : ' + (metrics?.sales?.conversion_rate?.toFixed(1) ?? 'N/A') + '%\n'
  r += '  Cash Runway    : ' + (metrics?.cashflow?.runway_days ?? 'N/A') + ' days\n'
  r += '  Open Tickets   : ' + (metrics?.support?.open_tickets ?? 'N/A') + '\n'
  r += '  Stockouts      : ' + (metrics?.inventory?.stockout_items ?? 'N/A') + ' SKUs\n'
  r += '  CSAT Score     : ' + (metrics?.support?.csat_score ?? 'N/A') + '%\n\n'
  r += 'ACTIVE CRISES (' + crisis.length + ')\n'

  if (crisis.length === 0) {
    r += '  No critical alerts at this time\n'
  } else {
    crisis.forEach((a, i) => { r += '  ' + (i + 1) + '. ' + a.message + '\n' })
  }

  r += '\n--------------------------------------------\n'
  r += 'RECOMMENDED ACTIONS\n\n'

  let n = 1
  if ((metrics?.cashflow?.runway_days ?? 999) < 30) {
    r += '  [' + n++ + '] Contact investors immediately\n'
    r += '      Cash runway critical: ' + metrics.cashflow.runway_days + ' days left\n\n'
  }
  if ((metrics?.inventory?.stockout_items ?? 0) > 2) {
    r += '  [' + n++ + '] Place emergency purchase orders\n'
    r += '      ' + metrics.inventory.stockout_items + ' SKUs at zero stock\n\n'
  }
  if ((metrics?.support?.open_tickets ?? 0) > 60) {
    r += '  [' + n++ + '] Surge support team capacity\n'
    r += '      ' + metrics.support.open_tickets + ' tickets in queue\n\n'
  }
  if ((metrics?.sales?.conversion_rate ?? 99) < 1.0) {
    r += '  [' + n++ + '] Pause low-ROI ad campaigns\n'
    r += '      Conversion at ' + metrics.sales.conversion_rate?.toFixed(1) + '%\n\n'
  }
  if (n === 1) {
    r += '  [1] Monitor situation closely\n'
    r += '      Prepare contingency response plan\n\n'
  }

  r += '--------------------------------------------\n'
  r += 'SMS dispatched to 2 executives  [SENT]\n'
  r += 'Awaiting operator acknowledgement...\n'

  return r
}

export default function IncidentCommander({ metrics, stressScore, alerts, onExit, theme, sendManualSMS }) {
  const isDark = theme === 'dark'
  const [phase, setPhase] = useState('scanning')
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const [acknowledged, setAck] = useState(false)
  const [smsToast, setSmsToast] = useState(false)
  const [recoveryMode, setRecovery] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const reportRef    = useRef('')
  const idxRef       = useRef(0)
  const intervalRef  = useRef(null)
  const hasSentSMS   = useRef(false)
  const hasSpoken    = useRef(false)
  const countRef     = useRef(null)

  useEffect(() => {
    reportRef.current = buildReport(metrics, stressScore, alerts)
  }, [])

  // Start typing after 2s scanning
  useEffect(() => {
    const t = setTimeout(() => setPhase('typing'), 2000)
    return () => clearTimeout(t)
  }, [])

  // Voice on typing start
  useEffect(() => {
    if (phase === 'typing' && !hasSpoken.current) {
      hasSpoken.current = true
      setTimeout(() => speak('Critical alert. Business stress is critical. Incident report loading. SMS being sent to management.'), 400)
    }
  }, [phase])

  // Typewriter
  useEffect(() => {
    if (phase !== 'typing') return
    idxRef.current = 0
    setDisplayed('')
    setDone(false)

    intervalRef.current = setInterval(() => {
      idxRef.current += 1
      setDisplayed(reportRef.current.slice(0, idxRef.current))
      if (idxRef.current >= reportRef.current.length) {
        clearInterval(intervalRef.current)
        setDone(true)
        setPhase('ready')
      }
    }, 12)

    return () => clearInterval(intervalRef.current)
  }, [phase])

  // Send SMS when done
  useEffect(() => {
    if (!done || hasSentSMS.current || !sendManualSMS) return
    hasSentSMS.current = true

    const msg =
      'OPSPULSE CRITICAL ALERT\n' +
      'Stress: ' + (stressScore?.overall ?? 'N/A') + '/100\n' +
      'Revenue: Rs.' + Math.round(metrics?.sales?.revenue || 0).toLocaleString('en-IN') + '\n' +
      'Cash Runway: ' + (metrics?.cashflow?.runway_days ?? 'N/A') + ' days\n' +
      'Stockouts: ' + (metrics?.inventory?.stockout_items ?? 'N/A') + ' SKUs\n' +
      'Tickets: ' + (metrics?.support?.open_tickets ?? 'N/A') + ' open\n' +
      'Time: ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

    sendManualSMS(msg).then(() => {
      setSmsToast(true)
      speak('SMS alert dispatched. Awaiting acknowledgement.')
      setTimeout(() => setSmsToast(false), 5000)
    })
  }, [done])

  // Countdown after acknowledge
  useEffect(() => {
    if (!acknowledged) return
    setCountdown(5)
    countRef.current = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) { clearInterval(countRef.current); onExit(); return 0 }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(countRef.current)
  }, [acknowledged])

  const handleAcknowledge = () => {
    setAck(true)
    setRecovery(true)
    speak('Crisis acknowledged. Switching to recovery monitoring. Stay vigilant.')
  }

  const bg      = isDark ? '#06000d' : '#fff0f0'
  const cardBg  = isDark ? '#0f0018' : '#ffffff'
  const textMain  = isDark ? '#f1f5f9' : '#0f172a'
  const textMuted = isDark ? '#94a3b8' : '#64748b'

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: bg, fontFamily: "'JetBrains Mono', monospace" }}>

      {/* Flashing red border */}
      {!acknowledged && (
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 3px #ef4444', animation: 'border-flash 1.2s ease-in-out infinite' }} />
      )}

      {/* Green recovery border */}
      {recoveryMode && (
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 3px #22c55e', animation: 'border-glow 2s ease-in-out infinite' }} />
      )}

      {/* SMS Toast */}
      {smsToast && (
        <div className="absolute top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: isDark ? '#071a07' : '#f0fdf4', border: '1px solid #22c55e60', boxShadow: '0 0 30px #22c55e25', animation: 'toast-in 0.4s ease' }}>
          <span style={{ fontSize: 22 }}>📱</span>
          <div>
            <p style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>SMS Delivered</p>
            <p style={{ color: '#22c55e80', fontSize: 11 }}>+91 98207 68165 and +91 91369 54721</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: isDark ? '#1a0008' : '#ffe4e6', borderColor: '#ef444430' }}>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {[0, 250, 500].map((d, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-red-500" style={{ animation: `pulse-dot 1s ease-in-out ${d}ms infinite` }} />
            ))}
          </div>
          <div>
            <h1 style={{ color: recoveryMode ? '#22c55e' : '#f87171', fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
              {recoveryMode ? 'RECOVERY MODE ACTIVE' : 'WAR ROOM AUTO-PILOT'}
            </h1>
            <p style={{ color: '#f8717160', fontSize: 11, marginTop: 2 }}>
              {recoveryMode
                ? 'Crisis acknowledged — exiting in ' + countdown + 's'
                : 'AI INCIDENT COMMANDER — STRESS: ' + (stressScore?.overall ?? '—') + '/100'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {phase === 'ready' && !acknowledged && (
            <button onClick={handleAcknowledge} style={{ background: '#22c55e15', border: '1px solid #22c55e60', color: '#22c55e', padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', animation: 'glow-green 1.5s ease-in-out infinite' }}>
              ACKNOWLEDGE CRISIS
            </button>
          )}
          <button onClick={onExit} style={{ background: 'transparent', border: '1px solid #ef444450', color: '#f87171', padding: '8px 16px', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            EXIT
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6">
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Scanning */}
          {phase === 'scanning' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 24 }}>
              <div style={{ width: 72, height: 72, border: '4px solid #ef444430', borderTop: '4px solid #ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#ef4444', fontSize: 15, letterSpacing: 3, animation: 'pulse-text 1.2s ease-in-out infinite' }}>SCANNING BUSINESS SYSTEMS...</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Sales', 'Inventory', 'Support', 'Cashflow'].map((s, i) => (
                  <span key={s} style={{ padding: '4px 12px', borderRadius: 99, border: '1px solid #ef444430', color: '#ef444470', fontSize: 11, animation: `pulse-text 1s ease-in-out ${i * 0.2}s infinite` }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Typewriter report */}
          {(phase === 'typing' || phase === 'ready') && (
            <div style={{ background: cardBg, border: '1px solid #ef444425', borderRadius: 16, padding: 24, boxShadow: '0 0 40px #ef444408' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse-dot 1s ease-in-out infinite' }} />
                <span style={{ color: '#ef4444', fontSize: 11, letterSpacing: 2 }}>AI INCIDENT REPORT</span>
                {phase === 'ready' && <span style={{ marginLeft: 'auto', color: '#22c55e', fontSize: 11 }}>COMPLETE</span>}
              </div>
              <pre style={{ fontFamily: 'inherit', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: textMain, margin: 0 }}>
                {displayed}
                {phase === 'typing' && (
                  <span style={{ display: 'inline-block', width: 8, height: 16, background: '#ef4444', marginLeft: 2, animation: 'blink 0.7s step-end infinite', verticalAlign: 'middle' }} />
                )}
              </pre>
            </div>
          )}

          {/* Recovery banner */}
          {recoveryMode && (
            <div style={{ background: isDark ? '#071a07' : '#f0fdf4', border: '1px solid #22c55e40', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16, animation: 'toast-in 0.5s ease' }}>
              <span style={{ fontSize: 32 }}>✅</span>
              <div>
                <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 15 }}>Recovery Mode Activated</p>
                <p style={{ color: textMuted, fontSize: 13, marginTop: 4 }}>Crisis acknowledged. System returning to normal monitoring. Exiting in {countdown}s...</p>
              </div>
            </div>
          )}

          {/* Live vitals */}
          {metrics && phase !== 'scanning' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Revenue',      value: 'Rs.' + Math.round(metrics.sales?.revenue || 0).toLocaleString('en-IN'), color: '#00e5ff' },
                { label: 'Cash Runway',  value: (metrics.cashflow?.runway_days ?? '—') + ' days',  color: (metrics.cashflow?.runway_days ?? 999) < 30 ? '#ef4444' : '#22c55e' },
                { label: 'Open Tickets', value: String(metrics.support?.open_tickets ?? '—'),        color: (metrics.support?.open_tickets ?? 0) > 60 ? '#ef4444' : '#ffb800' },
                { label: 'Stockouts',    value: (metrics.inventory?.stockout_items ?? '—') + ' SKUs', color: (metrics.inventory?.stockout_items ?? 0) > 2 ? '#ef4444' : '#22c55e' },
              ].map(m => (
                <div key={m.label} style={{ background: cardBg, border: '1px solid ' + m.color + '30', borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
                  <p style={{ color: m.color, fontSize: 20, fontWeight: 700 }}>{m.value}</p>
                  <p style={{ color: textMuted, fontSize: 11, marginTop: 4 }}>{m.label}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes border-flash { 0%,100%{box-shadow:inset 0 0 0 3px #ef4444} 50%{box-shadow:inset 0 0 0 3px #ef444430} }
        @keyframes border-glow  { 0%,100%{box-shadow:inset 0 0 0 3px #22c55e} 50%{box-shadow:inset 0 0 0 3px #22c55e40} }
        @keyframes pulse-dot    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.3)} }
        @keyframes pulse-text   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink        { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin         { to{transform:rotate(360deg)} }
        @keyframes toast-in     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow-green   { 0%,100%{box-shadow:0 0 10px #22c55e30} 50%{box-shadow:0 0 25px #22c55e70} }
      `}</style>
    </div>
  )
}
