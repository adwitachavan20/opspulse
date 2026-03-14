import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Activity, Zap, User, Settings, RefreshCw, Sun, Moon, LogOut, Clock, Database, Download } from 'lucide-react'
import DataInput from './components/DataInput'
import { useRealtimeData } from './hooks/useRealtimeData'
import OwnerDashboard from './pages/OwnerDashboard'
import OperationsDashboard from './pages/OperationsDashboard'
import WarRoom from './components/WarRoom'
import SplashScreen from './components/SplashScreen'
import { LOGO_URI } from './lib/logoData'
import LoginPage from './pages/LoginPage'
import { getStressLabel } from './lib/dataEngine'
import { downloadDashboardPDF } from './lib/downloadPDF'
import DataDiffPanel from './components/DataDiffPanel'
import ManagerHistoryPanel from './components/ManagerHistoryPanel'
import ManagerListPanel from './components/Managerlistpanel'
import { logManagerActivity } from './lib/managerHistory'
import { supabase } from './lib/supabase'
import AIChatbot from './components/AIChatbot'
import AlertHistoryPanel, { useSoundAlerts } from './components/AlertHistory'
import DateFilter from './components/DateFilter'
import AdvancedFeatures from './components/AdvancedFeatures'

// ── INTEGRATED FEATURES: Auto Pilot · SMS · Email ─────────────────────────────
import { useSMSAlerts } from './features/sms/useSMSAlerts'
import IncidentCommander from './features/autopilot/IncidentCommander'
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('owner')
  const [scenario, setScenario] = useState('normal')
  const [warRoom, setWarRoom] = useState(false)
  const [dataInput, setDataInput] = useState(false)
  const [manualData, setManualData] = useState(null)
  const [pulse, setPulse] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [sessionWarning, setSessionWarning] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [dateFilter, setDateFilter] = useState('today')
  const [showAdvanced, setShowAdvanced] = useState(false)
  // const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    const isRefresh = sessionStorage.getItem('app_started')

    if (isRefresh) {
      const ownerSession = sessionStorage.getItem('owner_session')
      if (ownerSession) {
        const profile = JSON.parse(ownerSession)
        setUser(profile)
        setRole(profile.role)
        return
      }

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata
          setUser({
            name: meta?.name || session.user.email.split('@')[0],
            role: meta?.role || 'ops',
            title: meta?.title || 'Operations Manager',
          })
          setRole(meta?.role || 'ops')
        }
      })
    } else {
      supabase.auth.signOut()
      sessionStorage.removeItem('owner_session')
      sessionStorage.setItem('app_started', 'true')
    }
  }, [])

  const isDark = theme === 'dark'

  const { metrics, alerts, stressScore, history, loading, resolveAlert, dataSource, changedKeys, demoSnapshot, demoStressSnapshot } = useRealtimeData(scenario, manualData)
  const { soundEnabled, setSoundEnabled, dispatched, setDispatched } = useSoundAlerts(alerts)

  // ── INTEGRATED: SMS + Email hook ──────────────────────────────────────────
  const { sendManualSMS, sendEmailReport } = useSMSAlerts({
    stressScore,
    metrics,
    enabled: true,  // set to false to disable SMS/Email without removing code
  })

  // ── INTEGRATED: Auto Pilot state + trigger ────────────────────────────────
  const [autoPilot, setAutoPilot] = useState(false)
  useEffect(() => {
    if ((stressScore?.overall ?? 0) > 85 && !autoPilot) {
      setAutoPilot(true)
    }
  }, [stressScore])
  // ─────────────────────────────────────────────────────────────────────────
  const { label: stressLabel, color: stressColor } = getStressLabel(stressScore?.overall ?? null)
  const crisisCount = alerts.filter(a => a.type === 'crisis').length

  useEffect(() => {
    document.body.style.background = isDark ? '#080c14' : '#f1f5f9'
    document.body.style.color = isDark ? '#e2e8f0' : '#0f172a'
  }, [theme])

  useEffect(() => {
    if (stressScore?.overall > 80 && !warRoom) {}
  }, [stressScore])

  useEffect(() => {
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 600)
    return () => clearTimeout(t)
  }, [metrics])

  const bg        = isDark ? '#080c14' : '#f1f5f9'
  const surface   = isDark ? '#0d1526' : '#ffffff'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const textMain  = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const headerBg  = isDark ? 'rgba(8,12,20,0.95)' : 'rgba(255,255,255,0.95)'
  const subBg     = isDark ? '#0a0f1e' : '#f8fafc'

  const handleLogin = (loggedUser) => {
    setUser(loggedUser)
    setRole(loggedUser.role)
    if (loggedUser.role === 'ops') {
      logManagerActivity('login', `${loggedUser.name} signed in as Operations Manager`)
    }
  }

  const handleLogout = useCallback(async () => {
    if (user?.role === 'ops') {
      logManagerActivity('logout', `${user.name} signed out`)
    }
    await supabase.auth.signOut()
    sessionStorage.removeItem('owner_session')
    setUser(null)
    setWarRoom(false)
    setSessionWarning(false)
  }, [user])

  const SESSION_TIMEOUT = 5 * 60 * 1000
  const timeoutRef = useRef(null)
  const warningRef = useRef(null)

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current)
    clearTimeout(warningRef.current)
    setSessionWarning(false)

    warningRef.current = setTimeout(() => {
      setSessionWarning(true)
    }, SESSION_TIMEOUT - 60000)

    timeoutRef.current = setTimeout(() => {
      handleLogout()
    }, SESSION_TIMEOUT)
  }, [handleLogout])

  useEffect(() => {
    if (!user) return
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      clearTimeout(timeoutRef.current)
      clearTimeout(warningRef.current)
    }
  }, [user, resetTimer])

  const handleDownloadPDF = useCallback(async () => {
    setPdfGenerating(true)
    if (user?.role === 'ops') logManagerActivity('pdf_export', `PDF exported — ${role} view, scenario: ${scenario}, BSS: ${stressScore?.overall}`)
    await downloadDashboardPDF({ role, stressScore, scenario })
    setPdfGenerating(false)
  }, [role, stressScore, scenario, user])

  const scenarioBtnClass = (s) =>
    `px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${scenario === s
      ? s === 'crisis'
        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
        : s === 'opportunity'
          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
          : isDark
            ? 'bg-white/10 text-white border border-white/40'
            : 'bg-white text-slate-900 border border-slate-400'
      : isDark
        ? 'bg-[#1a2540] text-[#4a6080] hover:text-white border border-transparent'
        : 'bg-slate-100 text-slate-500 hover:text-slate-800 border border-transparent'
    }`

  // if (!user) {
  //   return (
  //     <LoginPage
  //       onLogin={handleLogin}
  //       theme={theme}
  //       onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
  //     />
  //   )
  // }
//   if (showSplash) {
//   return (
//     <SplashScreen
//       onComplete={() => setShowSplash(false)}
//       logoSrc={null}
//     />
//   )
// }
if (showSplash) {
  return <SplashScreen onComplete={() => setShowSplash(false)} logoSrc={LOGO_URI} />
}

if (!user) {
  return (
    <LoginPage
      onLogin={handleLogin}
      theme={theme}
      onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
    />
  )
}

  return (
    <div
      className="min-h-screen font-body transition-colors duration-300"
      style={{ background: bg, color: textMain }}
    >

      {/* ── SESSION TIMEOUT WARNING TOAST ─────────────────────────── */}
      {sessionWarning && (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl"
          style={{
            background: isDark ? '#1a0a00' : '#fffbeb',
            borderColor: '#ffb80060',
            boxShadow: '0 0 30px #ffb80030'
          }}
        >
          <Clock size={16} className="text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-mono font-bold text-amber-400">Session expiring soon</p>
            <p className="text-[10px] font-mono" style={{ color: isDark ? '#ffb80080' : '#92400e' }}>
              You'll be logged out in 1 minute due to inactivity
            </p>
          </div>
          <button
            onClick={resetTimer}
            className="px-3 py-1 rounded-lg text-xs font-mono font-bold border border-amber-500/50 text-amber-400 hover:bg-amber-500/20 transition-all"
          >
            Stay
          </button>
        </div>
      )}

      {/* ── DATA INPUT OVERLAY ─────────────────────────────────────── */}
      {/* ✅ CHANGE 5 */}
      {dataInput && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: isDark ? '#080c14' : '#f1f5f9' }}>
          <div className="absolute inset-0 border-2 border-cyan-500/20 pointer-events-none" />

          {/* Header */}
          <div
            className="flex items-center justify-between px-8 py-4 border-b"
            style={{ background: isDark ? '#0a0f1e' : '#ffffff', borderColor: isDark ? '#1a2540' : '#e2e8f0' }}
          >
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-cyan-400 tracking-wider">
                  DATA INPUT
                </h1>
                <p className="text-xs font-mono" style={{ color: isDark ? '#4a6080' : '#64748b' }}>
                  LOAD DEMO DATA OR UPLOAD YOUR OWN CSV
                </p>
              </div>
            </div>
            <button
              onClick={() => setDataInput(false)}
              className="px-4 py-2 border border-cyan-500/50 text-cyan-400 font-mono text-sm rounded hover:bg-cyan-500/20 transition-all"
            >
              EXIT DATA INPUT
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto">
              <DataInput
                theme={theme}
                onDataLoaded={(data) => {
                  if (data) {
                    setManualData(data)
                    if (user?.role === 'ops') logManagerActivity('data_upload', `CSV uploaded — ${data._rows} rows, latest date: ${data._date}, Revenue: ₹${(data.sales.revenue/1000).toFixed(1)}K`)
                    setDataInput(false)
                  } else {
                    setManualData(null)
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* War Room overlay */}
      {warRoom && (
        <WarRoom
          metrics={metrics}
          alerts={alerts}
          stressScore={stressScore}
          onExit={() => setWarRoom(false)}
          theme={theme}
        />
      )}

      {/* ── INTEGRATED: Auto Pilot overlay ──────────────────────────────── */}
      {autoPilot && (
        <IncidentCommander
          metrics={metrics}
          stressScore={stressScore}
          alerts={alerts}
          theme={theme}
          sendManualSMS={sendManualSMS}
          onExit={() => setAutoPilot(false)}
        />
      )}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header
        className="border-b sticky top-0 z-40 backdrop-blur-sm transition-colors duration-300"
        style={{ background: headerBg, borderColor: borderCol }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 overflow-x-auto">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <img src={LOGO_URI} alt="OpsPulse Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <span className="text-base font-display font-bold tracking-tight" style={{ color: textMain }}>
                OpsPulse
              </span>
              <span className="hidden sm:inline text-xs font-mono ml-2" style={{ color: textMuted }}>
                SMB Health Dashboard
              </span>
            </div>
          </div>

          {/* Stress score badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              stressScore?.overall > 70
                ? 'border-red-500/40 bg-red-500/10'
                : stressScore?.overall > 50
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : ''
            }`}
            style={!(stressScore?.overall > 50) ? { borderColor: borderCol, background: surface } : {}}
          >
            <div
              className={`w-2 h-2 rounded-full transition-transform ${pulse ? 'scale-125' : ''}`}
              style={{
                background: stressScore?.overall > 70 ? '#ff3b5c' : stressScore?.overall > 50 ? '#ffb800' : '#00ff88',
              }}
            />
            <span className="text-sm font-mono font-bold" style={{ color: textMain }}>
              {stressScore?.overall ?? '—'}
            </span>
            <span className={`text-xs font-mono ${stressColor}`}>{stressLabel}</span>
          </div>

          {/* Data source badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all"
            style={{
              background: dataSource === 'manual' ? '#00ff8810' : dataSource === 'live' ? '#00e5ff10' : '#ffb80010',
              borderColor: dataSource === 'manual' ? '#00ff8840' : dataSource === 'live' ? '#00e5ff40' : '#ffb80040',
              color: dataSource === 'manual' ? '#00ff88' : dataSource === 'live' ? '#00e5ff' : '#ffb800',
            }}
            title={
              dataSource === 'manual' ? 'Using your uploaded CSV data'
              : dataSource === 'live' ? 'Connected to live Supabase data'
              : 'Using simulated demo data'
            }
          >
            <span>{dataSource === 'manual' ? '📄' : dataSource === 'live' ? '🟢' : '⚡'}</span>
            <span className="hidden sm:inline">
              {dataSource === 'manual' ? 'YOUR DATA' : dataSource === 'live' ? 'LIVE' : 'DEMO'}
            </span>
            {manualData && (
              <button
                onClick={() => setManualData(null)}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                title="Clear — return to demo"
              >
                ×
              </button>
            )}
          </div>

          {/* Scenario switcher — desktop only */}
          <div
            className="hidden lg:flex items-center gap-1 rounded-xl p-1 border"
            style={{ background: surface, borderColor: borderCol }}
          >
            <button onClick={() => { setScenario('normal'); if(user?.role==='ops') logManagerActivity('scenario_change', 'Switched to Normal scenario') }} className={scenarioBtnClass('normal')}>Normal</button>
            <button onClick={() => { setScenario('opportunity'); if(user?.role==='ops') logManagerActivity('scenario_change', 'Switched to Opportunity scenario') }} className={scenarioBtnClass('opportunity')}>Opportunity</button>
            <button onClick={() => { setScenario('crisis'); if(user?.role==='ops') logManagerActivity('scenario_change', 'Switched to Crisis scenario ⚠') }} className={scenarioBtnClass('crisis')}>⚠ Crisis</button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Alert History + Sound toggle */}
            <AlertHistoryPanel
              dispatched={dispatched}
              setDispatched={setDispatched}
              theme={theme}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
            />

            {/* Date Filter */}
            <DateFilter value={dateFilter} onChange={setDateFilter} theme={theme} />

            {/* Advanced Features */}
            <button
              onClick={() => setShowAdvanced(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all hover:border-cyan-500/50 hover:text-cyan-400"
              style={{ background: surface, borderColor: borderCol, color: textMuted }}
              title="Advanced Features"
            >
              <Activity size={12} />
              <span className="hidden sm:inline">Advanced</span>
            </button>

            {/* ── INTEGRATED: Email Report + SMS Alert buttons ────────── */}
            <button
              onClick={() => sendEmailReport('report', alerts)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all hover:border-cyan-500/50 hover:text-cyan-400"
              style={{ background: surface, borderColor: borderCol, color: textMuted }}
              title="Send Email Report"
            >
              <span>📧</span>
              <span className="hidden sm:inline">Email</span>
            </button>
            <button
              onClick={() => sendManualSMS(`Horizon Manual Report — Stress: ${stressScore?.overall}/100 — ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all hover:border-cyan-500/50 hover:text-cyan-400"
              style={{ background: surface, borderColor: borderCol, color: textMuted }}
              title="Send SMS Alert"
            >
              <span>📱</span>
              <span className="hidden sm:inline">SMS</span>
            </button>
            {/* ─────────────────────────────────────────────────────────── */}

            {/* PDF Download Button */}
            <button
              id="pdf-download-btn"
              onClick={handleDownloadPDF}
              disabled={pdfGenerating || loading}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-mono border transition-all hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: surface, borderColor: borderCol, color: textMuted }}
              title="Download Dashboard as PDF"
            >
              <Download size={12} />
              <span className="hidden lg:inline">{pdfGenerating ? 'Generating…' : 'PDF'}</span>
            </button>

            {/* Data Input button (hidden for guests) */}
            {user?.title !== 'Guest Viewer' && (
            <button
              onClick={() => setDataInput(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-mono border transition-all hover:border-cyan-500/50 hover:text-cyan-400"
              style={{ background: surface, borderColor: borderCol, color: textMuted }}
              title="Data Input"
            >
              <Database size={12} />
              <span className="hidden lg:inline">Data</span>
            </button>
            )}

            {/* War Room button */}
            <button
              onClick={() => { setWarRoom(true); if(user?.role==='ops') logManagerActivity('war_room', `War Room activated — BSS: ${stressScore?.overall}, Crisis alerts: ${crisisCount}`) }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                crisisCount > 0 || stressScore?.overall > 75
                  ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                  : ''
              }`}
              style={
                !(crisisCount > 0 || stressScore?.overall > 75)
                  ? { background: surface, borderColor: borderCol, color: textMuted }
                  : {}
              }
              title="War Room"
            >
              <Zap size={12} />
              <span className="hidden lg:inline">War Room</span>
              {crisisCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {crisisCount}
                </span>
              )}
            </button>

            {/* ── INTEGRATED: Auto Pilot button ────────────────────────── */}
            <button
              onClick={() => setAutoPilot(true)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                stressScore?.overall > 85
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 animate-pulse'
                  : 'hover:border-orange-500/50 hover:text-orange-400'
              }`}
              style={
                stressScore?.overall <= 85
                  ? { background: surface, borderColor: borderCol, color: textMuted }
                  : {}
              }
              title="Auto Pilot — AI Incident Commander"
            >
              <span>🤖</span>
              <span className="hidden lg:inline">Auto Pilot</span>
            </button>
            {/* ─────────────────────────────────────────────────────────── */}

            {/* Dark / Light mode toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:border-cyan-500/50"
              style={{ background: surface, borderColor: borderCol, color: textMuted }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* User avatar + Logout — always visible */}
            <div className="flex items-center gap-1 pl-1 border-l flex-shrink-0" style={{ borderColor: borderCol }}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold border flex-shrink-0 ${
                  user.role === 'owner'
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                }`}
                title={`${user.name} — ${user.title}`}
              >
                {user.name.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:border-red-500/50 hover:text-red-400 flex-shrink-0"
                style={{ background: surface, borderColor: borderCol, color: textMuted }}
                title="Logout"
              >
                <LogOut size={13} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── ROLE + MOBILE SCENARIO BAR ───────────────────────────────── */}
      <div className="border-b transition-colors" style={{ background: subBg, borderColor: borderCol }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">

          {/* Role switcher */}
          <div
            className="flex items-center gap-1 rounded-xl p-1 border"
            style={{ background: surface, borderColor: borderCol }}
          >
            {user.role === 'owner' && (
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-cyan-400 text-[#080c14] font-bold">
                <User size={11} />
                Business Owner
              </button>
            )}
            {user.role === 'ops' && (
              <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-cyan-400 text-[#080c14] font-bold">
                <Settings size={11} />
                Ops Manager
              </button>
            )}
          </div>

          {/* Mobile scenario switcher */}
          <div className="flex md:hidden items-center gap-1">
            <button onClick={() => setScenario('normal')} className={scenarioBtnClass('normal')}>N</button>
            <button onClick={() => setScenario('opportunity')} className={scenarioBtnClass('opportunity')}>🚀</button>
            <button onClick={() => setScenario('crisis')} className={scenarioBtnClass('crisis')}>⚠</button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: textMuted }}>
            <RefreshCw size={10} className={pulse && dataSource !== 'manual' ? 'animate-spin text-cyan-400' : ''} />
            <span className="hidden sm:inline">
              {dataSource === 'manual' ? 'Static — your data' : 'Updates every 3s'}
            </span>
            <button
              onClick={() => setShowAdvanced(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border transition-all hover:border-cyan-500/50 hover:text-cyan-400"
              style={{ background: surface, borderColor: borderCol, color: textMuted, fontSize: 10 }}
            >
              <Activity size={10} />
              <span>Advanced</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-sm font-mono" style={{ color: textMuted }}>Connecting to data streams...</p>
          </div>
        ) : role === 'owner' ? (
          <div id="dashboard-report">
            {/* Diff panel — only shows when user has uploaded their own data */}
            {dataSource === 'manual' && demoSnapshot && (
              <div className="mb-6">
                <DataDiffPanel
                  demoMetrics={demoSnapshot}
                  userMetrics={metrics}
                  demoStress={demoStressSnapshot}
                  userStress={stressScore}
                  theme={theme}
                />
              </div>
            )}
            <OwnerDashboard
              metrics={metrics}
              stressScore={stressScore}
              alerts={alerts}
              history={history}
              onResolveAlert={resolveAlert}
              theme={theme}
              changedKeys={changedKeys}
            />
            {/* Manager list + history — only visible to owner (not guest) */}
            {user?.title !== 'Guest Viewer' && (
            <div className="mt-6 space-y-4">
              <ManagerListPanel theme={theme} />
              <ManagerHistoryPanel theme={theme} />
            </div>
            )}
          </div>
        ) : (
          <div id="dashboard-report">
            {/* Diff panel — only shows when user has uploaded their own data */}
            {dataSource === 'manual' && demoSnapshot && (
              <div className="mb-6">
                <DataDiffPanel
                  demoMetrics={demoSnapshot}
                  userMetrics={metrics}
                  demoStress={demoStressSnapshot}
                  userStress={stressScore}
                  theme={theme}
                />
              </div>
            )}
            <OperationsDashboard
              metrics={metrics}
              stressScore={stressScore}
              alerts={alerts}
              history={history}
              onResolveAlert={resolveAlert}
              theme={theme}
              changedKeys={changedKeys}
            />
          </div>
        )}
      </main>

      {/* ── ADVANCED FEATURES ────────────────────────────────────────── */}
      {showAdvanced && (
        <AdvancedFeatures
          metrics={metrics}
          stressScore={stressScore}
          alerts={alerts}
          history={history}
          theme={theme}
          onClose={() => setShowAdvanced(false)}
        />
      )}

      {/* ── AI CHATBOT ───────────────────────────────────────────────── */}
      <AIChatbot metrics={metrics} stressScore={stressScore} alerts={alerts} theme={theme} />

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer
        className="border-t mt-12 px-6 py-4 text-center transition-colors"
        style={{ borderColor: borderCol }}
      >
        <p className="text-xs font-mono" style={{ color: textMuted }}>
          OpsPulse · HORIZON 1.0 · Vidyavardhini's College of Engineering & Technology ·{' '}
          {dataSource === 'manual'
            ? <span className="text-green-400 ml-1">📄 Your Data (CSV Upload)</span>
            : dataSource === 'live'
            ? <span className="text-cyan-400 ml-1">🟢 Live Data (Supabase)</span>
            : <span className="text-amber-400 ml-1">⚡ Demo Mode (Simulated Data)</span>
          }
        </p>
      </footer>
    </div>
  )
}