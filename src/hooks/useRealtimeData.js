import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { generateSimulatedData, generateAlerts, computeStressScore, generateHistoryPoint } from '../lib/dataEngine'

const DEMO_MODE = true // Set false when Supabase is configured

export function useRealtimeData(scenario = 'normal') {
  const [metrics, setMetrics] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [stressScore, setStressScore] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const tickRef = useRef(0)

  const buildHistory = useCallback((sc) => {
    const now = Date.now()
    return Array.from({ length: 20 }, (_, i) => {
      const label = new Date(now - (19 - i) * 30000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      return generateHistoryPoint(sc, label)
    })
  }, [])

  useEffect(() => {
    setHistory(buildHistory(scenario))
  }, [scenario, buildHistory])

  const fetchAndUpdate = useCallback(async () => {
    if (DEMO_MODE) {
      const data = generateSimulatedData(scenario)
      const scores = computeStressScore(data.sales, data.inventory, data.support, data.cashflow)
      const newAlerts = generateAlerts(data.sales, data.inventory, data.support, data.cashflow)

      setMetrics(data)
      setStressScore(scores)
      setAlerts(newAlerts)

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setHistory(prev => {
        const next = [...prev.slice(-19), { label: now, ...scores, revenue: Math.round(data.sales.revenue) }]
        return next
      })
      setLoading(false)
      return
    }

    // Supabase live fetch
    try {
      const [s, i, sup, c] = await Promise.all([
        supabase.from('sales_metrics').select('*').order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('inventory_metrics').select('*').order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('support_metrics').select('*').order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('cashflow_metrics').select('*').order('created_at', { ascending: false }).limit(1).single(),
      ])

      const data = { sales: s.data, inventory: i.data, support: sup.data, cashflow: c.data }
      const scores = computeStressScore(data.sales, data.inventory, data.support, data.cashflow)
      const newAlerts = generateAlerts(data.sales, data.inventory, data.support, data.cashflow)

      setMetrics(data)
      setStressScore(scores)
      setAlerts(newAlerts)
      setLoading(false)
    } catch (err) {
      console.error('Supabase fetch error:', err)
      setLoading(false)
    }
  }, [scenario])

  useEffect(() => {
    fetchAndUpdate()
    const interval = setInterval(fetchAndUpdate, 3000)
    return () => clearInterval(interval)
  }, [fetchAndUpdate])

  // Supabase realtime subscriptions (when not in demo mode)
  useEffect(() => {
    if (DEMO_MODE) return

    const channels = ['sales_metrics', 'inventory_metrics', 'support_metrics', 'cashflow_metrics'].map(table =>
      supabase.channel(`realtime:${table}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, fetchAndUpdate)
        .subscribe()
    )

    return () => channels.forEach(ch => supabase.removeChannel(ch))
  }, [fetchAndUpdate])

  const resolveAlert = useCallback(async (index) => {
    setAlerts(prev => prev.filter((_, i) => i !== index))
  }, [])

  return { metrics, alerts, stressScore, history, loading, resolveAlert }
}
