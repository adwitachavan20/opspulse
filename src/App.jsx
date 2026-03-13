import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Activity, Zap, User, Settings, RefreshCw, Sun, Moon, LogOut, Clock, Database, Download } from 'lucide-react'
import DataInput from './components/DataInput'
import { useRealtimeData } from './hooks/useRealtimeData'
import OwnerDashboard from './pages/OwnerDashboard'
import OperationsDashboard from './pages/OperationsDashboard'
import WarRoom from './components/WarRoom'
import LoginPage from './pages/LoginPage'
import { getStressLabel } from './lib/dataEngine'
import { downloadDashboardPDF } from './lib/downloadPDF'
import DataDiffPanel from './components/DataDiffPanel'
import { supabase } from './lib/supabase'

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
  }

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem('owner_session')
    setUser(null)
    setWarRoom(false)
    setSessionWarning(false)
  }, [])

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
    await downloadDashboardPDF({ role, stressScore, scenario })
    setPdfGenerating(false)
  }, [role, stressScore, scenario])

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
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-cyan-400 tracking-wider">
                  📊 DATA INPUT
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

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header
        className="border-b sticky top-0 z-40 backdrop-blur-sm transition-colors duration-300"
        style={{ background: headerBg, borderColor: borderCol }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Activity size={16} className="text-cyan-400" />
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
            className="hidden md:flex items-center gap-1 rounded-xl p-1 border"
            style={{ background: surface, borderColor: borderCol }}
          >
            <button onClick={() => setScenario('normal')} className={scenarioBtnClass('normal')}>Normal</button>
            <button onClick={() => setScenario('opportunity')} className={scenarioBtnClass('opportunity')}>Opportunity</button>
            <button onClick={() => setScenario('crisis')} className={scenarioBtnClass('crisis')}>⚠ Crisis</button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* PDF Download Button */}
            <button
              id="pdf-download-btn"
              onClick={handleDownloadPDF}
              disabled={pdfGenerating || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: surface, borderColor: borderCol, color: textMuted }}
              title="Download Dashboard as PDF"
            >
              <Download size={12} />
              <span>{pdfGenerating ? 'Generating…' : 'Download PDF'}</span>
            </button>

            {/* ✅ CHANGE 4 — Data Input button */}
            <button
              onClick={() => setDataInput(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all hover:border-cyan-500/50 hover:text-cyan-400"
              style={{ background: surface, borderColor: borderCol, color: textMuted }}
            >
              <Database size={12} />
              <span className="hidden sm:inline">Data Input</span>
            </button>

            {/* War Room button */}
            <button
              onClick={() => setWarRoom(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                crisisCount > 0 || stressScore?.overall > 75
                  ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                  : ''
              }`}
              style={
                !(crisisCount > 0 || stressScore?.overall > 75)
                  ? { background: surface, borderColor: borderCol, color: textMuted }
                  : {}
              }
            >
              <Zap size={12} />
              <span className="hidden sm:inline">War Room</span>
              {crisisCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {crisisCount}
                </span>
              )}
            </button>

            {/* Dark / Light mode toggle */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:border-cyan-500/50"
              style={{ background: surface, borderColor: borderCol, color: textMuted }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* User info + Logout */}
            <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: borderCol }}>
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-mono font-semibold" style={{ color: textMain }}>{user.name}</span>
                <span className="text-[10px] font-mono" style={{ color: textMuted }}>{user.title}</span>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold border ${
                  user.role === 'owner'
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                }`}
              >
                {user.name.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:border-red-500/50 hover:text-red-400"
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

          <div className="flex items-center gap-1 text-xs font-mono" style={{ color: textMuted }}>
            <RefreshCw size={10} className={pulse && dataSource !== 'manual' ? 'animate-spin text-cyan-400' : ''} />
            <span className="hidden sm:inline">
              {dataSource === 'manual' ? 'Static — your data' : 'Updates every 3s'}
            </span>
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