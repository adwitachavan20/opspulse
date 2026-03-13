import React, { useState, useRef } from 'react'
import { Upload, Download, Database, CheckCircle, AlertCircle, RefreshCw, FileText, X, ChevronDown, ChevronUp } from 'lucide-react'

// ── CSV Template Data ──────────────────────────────────────────────────────
const CSV_TEMPLATE = `date,revenue,orders,conversion_rate,avg_order_value,cash_runway_days,receivables,payables,inventory_total_skus,inventory_low_stock,inventory_stockouts,inventory_turnover_rate,support_open_tickets,support_escalated,support_avg_response_hrs,support_csat
2026-03-13,48500,92,3.2,527,142,125000,48000,340,12,3,4.2,28,4,2.1,4.3
2026-03-12,51200,98,3.8,522,145,122000,46000,340,10,2,4.3,24,3,1.9,4.4
2026-03-11,44800,85,2.9,527,148,119000,45000,338,14,4,4.1,32,5,2.4,4.2
2026-03-10,53100,101,4.1,526,151,116000,44000,342,9,1,4.5,21,2,1.7,4.5
2026-03-09,47600,90,3.5,529,154,113000,43000,339,11,2,4.2,26,3,2.0,4.3`

const COLUMN_REFERENCE = [
  { key: 'date',                     type: 'YYYY-MM-DD',  required: true,  desc: 'Date of the record' },
  { key: 'revenue',                  type: 'Numeric',     required: true,  desc: 'Daily revenue in Rs.' },
  { key: 'orders',                   type: 'Numeric',     required: true,  desc: 'Number of orders placed' },
  { key: 'conversion_rate',          type: 'Decimal %',   required: true,  desc: 'Sales conversion rate (e.g. 3.2)' },
  { key: 'avg_order_value',          type: 'Numeric',     required: false, desc: 'Average order value in Rs.' },
  { key: 'cash_runway_days',         type: 'Numeric',     required: true,  desc: 'Days of cash runway remaining' },
  { key: 'receivables',              type: 'Numeric',     required: false, desc: 'Total accounts receivable in Rs.' },
  { key: 'payables',                 type: 'Numeric',     required: false, desc: 'Total accounts payable in Rs.' },
  { key: 'inventory_total_skus',     type: 'Numeric',     required: false, desc: 'Total SKU count' },
  { key: 'inventory_low_stock',      type: 'Numeric',     required: true,  desc: 'Items below reorder level' },
  { key: 'inventory_stockouts',      type: 'Numeric',     required: true,  desc: 'Items completely out of stock' },
  { key: 'inventory_turnover_rate',  type: 'Decimal',     required: false, desc: 'Inventory turnover (times/month)' },
  { key: 'support_open_tickets',     type: 'Numeric',     required: true,  desc: 'Open customer support tickets' },
  { key: 'support_escalated',        type: 'Numeric',     required: false, desc: 'Escalated/critical tickets' },
  { key: 'support_avg_response_hrs', type: 'Decimal',     required: false, desc: 'Average response time in hours' },
  { key: 'support_csat',             type: 'Decimal 1-5', required: true,  desc: 'Customer satisfaction score' },
]

// ── Parse CSV into metrics ─────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) throw new Error('CSV must have at least 2 rows (header + data)')
  const headers = lines[0].split(',').map(h => h.trim())
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim())
    const row = {}
    headers.forEach((h, i) => { row[h] = vals[i] })
    return row
  })
  const latest = rows[rows.length - 1]
  return {
    sales: {
      revenue:       parseFloat(latest.revenue)         || 0,
      orders:        parseInt(latest.orders)            || 0,
      conversion:    parseFloat(latest.conversion_rate) || 0,
      avgOrderValue: parseFloat(latest.avg_order_value) || 0,
    },
    cashflow: {
      runway:      parseInt(latest.cash_runway_days) || 0,
      receivables: parseFloat(latest.receivables)    || 0,
      payables:    parseFloat(latest.payables)       || 0,
    },
    inventory: {
      totalSKUs:    parseInt(latest.inventory_total_skus)      || 0,
      lowStock:     parseInt(latest.inventory_low_stock)       || 0,
      stockouts:    parseInt(latest.inventory_stockouts)       || 0,
      turnoverRate: parseFloat(latest.inventory_turnover_rate) || 0,
    },
    support: {
      openTickets:    parseInt(latest.support_open_tickets)        || 0,
      escalated:      parseInt(latest.support_escalated)           || 0,
      avgResponseHrs: parseFloat(latest.support_avg_response_hrs)  || 0,
      csat:           parseFloat(latest.support_csat)              || 0,
    },
    _rows: rows.length,
    _date: latest.date,
  }
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function DataInput({ theme, onDataLoaded }) {
  const isDark = theme === 'dark'
  const fileRef = useRef(null)

  const [dragOver, setDragOver]     = useState(false)
  const [status, setStatus]         = useState(null)
  const [statusMsg, setStatusMsg]   = useState('')
  const [fileName, setFileName]     = useState('')
  const [showCols, setShowCols]     = useState(false)
  const [loadedData, setLoadedData] = useState(null)

  // Theme tokens
  const surface    = isDark ? '#0d1526' : '#ffffff'
  const borderCol  = isDark ? '#1a2540' : '#e2e8f0'
  const textMain   = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted  = isDark ? '#4a6080' : '#64748b'
  const subSurface = isDark ? '#0a0f1e' : '#f8fafc'

  // ── Download template ──────────────────────────────────────────────
  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'opspulse_data_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Load demo data ─────────────────────────────────────────────────
  const loadDemoData = () => {
    try {
      const parsed = parseCSV(CSV_TEMPLATE)
      setLoadedData(parsed)
      setStatus('success')
      setStatusMsg(`Demo data loaded — ${parsed._rows} rows, latest: ${parsed._date}`)
      setFileName('demo_data (built-in)')
      onDataLoaded?.(parsed)
    } catch (e) {
      setStatus('error')
      setStatusMsg(e.message)
    }
  }

  // ── Process uploaded file ──────────────────────────────────────────
  const processFile = (file) => {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setStatus('error')
      setStatusMsg('Only CSV files are supported.')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = parseCSV(e.target.result)
        setLoadedData(parsed)
        setStatus('success')
        setStatusMsg(`Loaded ${parsed._rows} row${parsed._rows > 1 ? 's' : ''} — latest date: ${parsed._date}`)
        onDataLoaded?.(parsed)
      } catch (err) {
        setStatus('error')
        setStatusMsg(err.message)
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }

  const handleFile  = (e) => processFile(e.target.files[0])

  const clearData = () => {
    setStatus(null)
    setStatusMsg('')
    setFileName('')
    setLoadedData(null)
    onDataLoaded?.(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-4">

      {/* ── Section header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase" style={{ color: textMuted }}>
            Data Source
          </span>
        </div>
        {loadedData && (
          <button
            onClick={clearData}
            className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg border transition-all hover:border-red-500/50 hover:text-red-400"
            style={{ borderColor: borderCol, color: textMuted }}
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>

      {/* ── Two action cards ───────────────────────────────────────── */}
      {!loadedData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* Demo data card */}
          <button
            onClick={loadDemoData}
            className="flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all hover:scale-[1.02]"
            style={{ background: surface, borderColor: borderCol }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#00e5ff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = borderCol}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{ background: '#00e5ff10', borderColor: '#00e5ff30' }}>
              <RefreshCw size={16} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-mono font-bold" style={{ color: textMain }}>Use Demo Data</p>
              <p className="text-[11px] font-body mt-0.5" style={{ color: textMuted }}>
                Load 5 days of simulated business data instantly
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Load instantly →</span>
          </button>

          {/* Upload card */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02]"
            style={{
              background: dragOver ? (isDark ? '#00e5ff08' : '#e0f9ff') : surface,
              borderColor: dragOver ? '#00e5ff' : borderCol,
              borderStyle: 'dashed',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#00e5ff'}
            onMouseLeave={e => !dragOver && (e.currentTarget.style.borderColor = borderCol)}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{ background: '#00ff8810', borderColor: '#00ff8830' }}>
              <Upload size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-mono font-bold" style={{ color: textMain }}>Upload Your CSV</p>
              <p className="text-[11px] font-body mt-0.5" style={{ color: textMuted }}>
                Drop a CSV file here or click to browse
              </p>
            </div>
            <span className="text-[10px] font-mono text-green-400">Drop CSV here →</span>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </div>

        </div>
      )}

      {/* ── Status message ─────────────────────────────────────────── */}
      {status && (
        <div
          className="flex items-start gap-2 px-4 py-3 rounded-xl border"
          style={{
            background: status === 'success'
              ? isDark ? '#00ff8808' : '#f0fff4'
              : isDark ? '#ff3b5c08' : '#fff5f5',
            borderColor: status === 'success' ? '#00ff8840' : '#ff3b5c40',
          }}
        >
          {status === 'success'
            ? <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
            : <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          }
          <div className="flex-1">
            <p className="text-xs font-mono" style={{ color: status === 'success' ? '#00ff88' : '#ff3b5c' }}>
              {statusMsg}
            </p>
            {fileName && (
              <p className="text-[10px] font-mono mt-0.5" style={{ color: textMuted }}>
                📄 {fileName}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Loaded data preview ────────────────────────────────────── */}
      {loadedData && (
        <div
          className="rounded-xl border p-4 space-y-3"
          style={{ background: subSurface, borderColor: borderCol }}
        >
          <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: textMuted }}>
            Loaded Metrics Preview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Revenue',      value: `Rs.${(loadedData.sales.revenue / 1000).toFixed(1)}K`, color: '#00e5ff' },
              { label: 'Conversion',   value: `${loadedData.sales.conversion}%`,                     color: '#00ff88' },
              { label: 'Cash Runway',  value: `${loadedData.cashflow.runway}d`,                      color: '#ffb800' },
              { label: 'CSAT',         value: `${loadedData.support.csat}/5`,                        color: '#00ff88' },
              { label: 'Open Tickets', value: loadedData.support.openTickets,                        color: '#ff3b5c' },
              { label: 'Low Stock',    value: loadedData.inventory.lowStock,                         color: '#ffb800' },
              { label: 'Stockouts',    value: loadedData.inventory.stockouts,                        color: '#ff3b5c' },
              { label: 'Orders',       value: loadedData.sales.orders,                               color: '#00e5ff' },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-lg p-2.5 border"
                style={{ background: surface, borderColor: borderCol }}
              >
                <p className="text-[10px] font-mono" style={{ color: textMuted }}>{item.label}</p>
                <p className="text-sm font-mono font-bold mt-0.5" style={{ color: item.color }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Download template + column reference ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Column reference */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: surface, borderColor: borderCol }}
        >
          <button
            onClick={() => setShowCols(!showCols)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <FileText size={13} className="text-cyan-400" />
              <span className="text-xs font-mono font-bold" style={{ color: textMain }}>
                CSV Column Reference
              </span>
            </div>
            {showCols
              ? <ChevronUp size={13} style={{ color: textMuted }} />
              : <ChevronDown size={13} style={{ color: textMuted }} />
            }
          </button>

          {showCols && (
            <div
              className="border-t px-4 pb-3 space-y-1.5 max-h-56 overflow-y-auto"
              style={{ borderColor: borderCol }}
            >
              {COLUMN_REFERENCE.map(col => (
                <div key={col.key} className="flex items-start gap-2 py-0.5">
                  <span
                    className="text-[10px] font-mono font-bold flex-shrink-0 w-36"
                    style={{ color: col.required ? '#00e5ff' : textMuted }}
                  >
                    {col.key}{col.required && <span className="text-red-400 ml-0.5">*</span>}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: textMuted }}>
                    {col.type} — {col.desc}
                  </span>
                </div>
              ))}
              <p className="text-[9px] font-mono pt-1" style={{ color: isDark ? '#1a2540' : '#cbd5e1' }}>
                * Required columns
              </p>
            </div>
          )}
        </div>

        {/* Download template */}
        <div
          className="rounded-xl border flex flex-col justify-between p-4"
          style={{ background: surface, borderColor: borderCol }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Download size={13} className="text-green-400" />
            <span className="text-xs font-mono font-bold" style={{ color: textMain }}>
              Download Template
            </span>
          </div>
          <p className="text-[11px] font-body mb-4" style={{ color: textMuted }}>
            Get a pre-formatted CSV with 5 example rows matching the exact column structure expected by OpsPulse.
          </p>
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #00e5ff20, #00ff8820)',
              border: '1px solid #00e5ff40',
              color: '#00e5ff',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #00e5ff30, #00ff8830)'}
            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #00e5ff20, #00ff8820)'}
          >
            <Download size={12} />
            Download opspulse_data_template.csv
          </button>
        </div>

      </div>
    </div>
  )
}