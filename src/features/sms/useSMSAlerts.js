// useSMSAlerts.js
// Connects OpsPulse to the SMS server for real-time spike alerts + SSE feed

import { useEffect, useRef, useCallback } from 'react'

const SMS_SERVER = 'http://localhost:4000'

// Cooldown per metric key — don't spam SMS (30 seconds between alerts)
const COOLDOWN_MS = 30_000

export function useSMSAlerts({ stressScore, metrics, enabled = true }) {
  const lastAlertTime = useRef({})
  const sseRef        = useRef(null)
  const prevStress    = useRef(null)

  // ── Push a single data point to the SMS server ───────────────────────────
  const pushMetric = useCallback(async (key, value) => {
    if (!enabled) return
    try {
      await fetch(`${SMS_SERVER}/data/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, source: 'opspulse' }),
      })
    } catch (_) {
      // SMS server not running — silently skip, app still works
    }
  }, [enabled])

  // ── Send a manual SMS ────────────────────────────────────────────────────
  const sendManualSMS = useCallback(async (message) => {
    if (!enabled) return { success: false }
    try {
      const res = await fetch(`${SMS_SERVER}/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      return await res.json()
    } catch (_) {
      return { success: false }
    }
  }, [enabled])

  // ── Push all metrics to server every time they update ────────────────────
  useEffect(() => {
    if (!metrics || !enabled) return

    const now = Date.now()

    const points = [
      { key: 'sales_revenue',       value: metrics.sales?.revenue },
      { key: 'sales_orders',        value: metrics.sales?.orders },
      { key: 'sales_conversion',    value: metrics.sales?.conversion_rate },
      { key: 'inventory_low_stock', value: metrics.inventory?.low_stock_items },
      { key: 'inventory_stockout',  value: metrics.inventory?.stockout_items },
      { key: 'support_tickets',     value: metrics.support?.open_tickets },
      { key: 'support_csat',        value: metrics.support?.csat_score },
      { key: 'cash_runway',         value: metrics.cashflow?.runway_days },
      { key: 'stress_overall',      value: stressScore?.overall },
      { key: 'stress_sales',        value: stressScore?.sales },
      { key: 'stress_inventory',    value: stressScore?.inventory },
      { key: 'stress_support',      value: stressScore?.support },
      { key: 'stress_cash',         value: stressScore?.cash },
    ]

    points.forEach(({ key, value }) => {
      if (value === undefined || value === null) return
      if (now - (lastAlertTime.current[key] || 0) < COOLDOWN_MS) return
      lastAlertTime.current[key] = now
      pushMetric(key, value)
    })
  }, [metrics, stressScore, enabled, pushMetric])

  // ── Send Email Report ────────────────────────────────────────────────────
  const sendEmailReport = useCallback(async (type = 'crisis', alerts = []) => {
    if (!enabled) return { success: false }
    try {
      const res = await fetch(`${SMS_SERVER}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stressScore, metrics, alerts, type }),
      })
      return await res.json()
    } catch (_) {
      return { success: false }
    }
  }, [enabled, stressScore, metrics])

  // ── Auto SMS when stress goes Critical (>85) ─────────────────────────────
  useEffect(() => {
    if (!stressScore || !enabled) return

    const score = stressScore.overall
    const prev  = prevStress.current
    prevStress.current = score

    // Edge trigger — only fire once when crossing threshold
    if (score > 85 && (prev === null || prev <= 85)) {
      const now = Date.now()
      if (now - (lastAlertTime.current['__crisis__'] || 0) > COOLDOWN_MS) {
        lastAlertTime.current['__crisis__'] = now
        sendManualSMS(
          `🚨 CRITICAL ALERT — OpsPulse\n` +
          `Business Stress Score: ${score}/100 — CRITICAL\n` +
          `Sales: ${stressScore.sales} | Inventory: ${stressScore.inventory}\n` +
          `Support: ${stressScore.support} | Cash: ${stressScore.cash}\n` +
          `Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
        )
        // Auto fire email report too
        sendEmailReport('crisis', [])
      }
    }
  }, [stressScore, enabled, sendManualSMS, sendEmailReport])

  // ── SSE: subscribe to server alert events ────────────────────────────────
  useEffect(() => {
    if (!enabled) return

    const es = new EventSource(`${SMS_SERVER}/events`)
    sseRef.current = es

    es.addEventListener('alert', (e) => {
      try {
        const data = JSON.parse(e.data)
        console.log('[OpsPulse SMS Alert fired]', data.key, data.direction, 'z=', data.anomaly?.zScore)
      } catch (_) {}
    })

    es.onerror = () => {
      es.close() // Server not running — silently close
    }

    return () => es.close()
  }, [enabled])

  return { sendManualSMS, pushMetric, sendEmailReport }
}
