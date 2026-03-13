import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { generateSimulatedData, generateAlerts, computeStressScore, generateHistoryPoint } from '../lib/dataEngine'

const DEMO_MODE = true

export function useRealtimeData(scenario = 'normal', manualData = null) {
  const [metrics, setMetrics] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [stressScore, setStressScore] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState('demo')
  const [changedKeys, setChangedKeys] = useState([])
  const [demoSnapshot, setDemoSnapshot] = useState(null)   // ← last demo metrics
  const [demoStressSnapshot, setDemoStressSnapshot] = useState(null) // ← last demo stress
  const prevMetricsRef = useRef(null)

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

    if (manualData) {
      const data = {
        sales: {
          revenue:         manualData.sales.revenue,
          orders:          manualData.sales.orders,
          conversion_rate: manualData.sales.conversion,
          avg_order_value: manualData.sales.avgOrderValue,
        },
        inventory: {
          stock_level:     manualData.inventory.totalSKUs > 0
                             ? Math.round((1 - manualData.inventory.stockouts / manualData.inventory.totalSKUs) * 100)
                             : 80,
          low_stock_items: manualData.inventory.lowStock,
          stockout_items:  manualData.inventory.stockouts,
          turnover_rate:   manualData.inventory.turnoverRate,
        },
        support: {
          open_tickets:      manualData.support.openTickets,
          avg_response_time: manualData.support.avgResponseHrs,
          csat_score:        manualData.support.csat * 20,
          escalated_tickets: manualData.support.escalated,
        },
        cashflow: {
          cash_balance: manualData.cashflow.receivables,
          burn_rate:    5000,
          runway_days:  manualData.cashflow.runway,
          receivables:  manualData.cashflow.receivables,
        },
      }

      const scores    = computeStressScore(data.sales, data.inventory, data.support, data.cashflow)
      const newAlerts = generateAlerts(data.sales, data.inventory, data.support, data.cashflow)

      if (prevMetricsRef.current) {
        const changed = ['sales', 'inventory', 'support', 'cashflow'].filter(section =>
          JSON.stringify(data[section]) !== JSON.stringify(prevMetricsRef.current[section])
        )
        setChangedKeys(changed)
        setTimeout(() => setChangedKeys([]), 2000)
      }
      prevMetricsRef.current = data

      setDataSource('manual')
      setMetrics(data)
      setStressScore(scores)
      setAlerts(newAlerts)
      setLoading(false)
      return
    }

    if (DEMO_MODE) {
      const data = generateSimulatedData(scenario)
      const scores = computeStressScore(data.sales, data.inventory, data.support, data.cashflow)
      const newAlerts = generateAlerts(data.sales, data.inventory, data.support, data.cashflow)

      setDataSource('demo')
      setMetrics(data)
      setStressScore(scores)
      setAlerts(newAlerts)
      setDemoSnapshot(data)         // ← save latest demo snapshot
      setDemoStressSnapshot(scores) // ← save latest demo stress

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setHistory(prev => {
        const next = [...prev.slice(-19), { label: now, ...scores, revenue: Math.round(data.sales.revenue) }]
        return next
      })
      setLoading(false)
      return
    }

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

      setDataSource('live')
      setMetrics(data)
      setStressScore(scores)
      setAlerts(newAlerts)
      setLoading(false)
    } catch (err) {
      console.error('Supabase fetch error:', err)
      setLoading(false)
    }
  }, [scenario, manualData])

  useEffect(() => {
    fetchAndUpdate()
    if (manualData) return
    const interval = setInterval(fetchAndUpdate, 3000)
    return () => clearInterval(interval)
  }, [fetchAndUpdate, manualData])

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

  return {
    metrics, alerts, stressScore, history, loading, resolveAlert,
    dataSource, changedKeys,
    demoSnapshot, demoStressSnapshot  // ← exposed for diff panel
  }
}