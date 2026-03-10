import React, { useState, useEffect } from 'react'
import { Activity, Zap, User, Settings, RefreshCw, Sun, Moon, LogOut } from 'lucide-react'
import { useRealtimeData } from './hooks/useRealtimeData'
import OwnerDashboard from './pages/OwnerDashboard'
import OperationsDashboard from './pages/OperationsDashboard'
import WarRoom from './components/WarRoom'
import LoginPage from './pages/LoginPage'
import { getStressLabel } from './lib/dataEngine'

export default function App() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('owner')
  const [scenario, setScenario] = useState('normal')
  const [warRoom, setWarRoom] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [theme, setTheme] = useState('dark')

  const isDark = theme === 'dark'

  const { metrics, alerts, stressScore, history, loading, resolveAlert } = useRealtimeData(scenario)
  const { label: stressLabel, color: stressColor } = getStressLabel(stressScore?.overall ?? null)
  const crisisCount = alerts.filter(a => a.type === 'crisis').length

  // Apply theme to body
  useEffect(() => {
    document.body.style.background = isDark ? '#080c14' : '#f1f5f9'
    document.body.style.color = isDark ? '#e2e8f0' : '#0f172a'
  }, [theme])

  useEffect(() => {
    if (stressScore?.overall > 80 && !warRoom) {
      // flash the war room button - handled by CSS
    }
  }, [stressScore])

  useEffect(() => {
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 600)
    return () => clearTimeout(t)
  }, [metrics])

  // Theme color tokens
  const bg        = isDark ? '#080c14' : '#f1f5f9'
  const surface   = isDark ? '#0d1526' : '#ffffff'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const textMain  = isDark ? '#e2e8f0' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const headerBg  = isDark ? 'rgba(8,12,20,0.95)' : 'rgba(255,255,255,0.95)'
  const subBg     = isDark ? '#0a0f1e' : '#f8fafc'

  // Login / Logout handlers
  const handleLogin = (loggedUser) => {
    setUser(loggedUser)
    setRole(loggedUser.role)
  }

  const handleLogout = () => {
    setUser(null)
    setWarRoom(false)
  }

  const scenarioBtnClass = (s) =>
    `px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
      scenario === s
        ? s === 'crisis'
          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
          : s === 'opportunity'
          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
        : isDark
          ? 'bg-[#1a2540] text-[#4a6080] hover:text-white border border-transparent'
          : 'bg-slate-100 text-slate-500 hover:text-slate-800 border border-transparent'
    }`

  // Show login page if not logged in
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
      {/* War Room overlay */}
      {warRoom && (
        <WarRoom
          metrics={metrics}
          alerts={alerts}
          stressScore={stressScore}
          onExit={() => setWarRoom(false)}
        />
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
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
              <span
                className="text-base font-display font-bold tracking-tight"
                style={{ color: textMain }}
              >
                OpsPulse
              </span>
              <span
                className="hidden sm:inline text-xs font-mono ml-2"
                style={{ color: textMuted }}
              >
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
            style={
              !(stressScore?.overall > 50)
                ? { borderColor: borderCol, background: surface }
                : {}
            }
          >
            <div
              className={`w-2 h-2 rounded-full transition-transform ${pulse ? 'scale-125' : ''}`}
              style={{
                background:
                  stressScore?.overall > 70
                    ? '#ff3b5c'
                    : stressScore?.overall > 50
                    ? '#ffb800'
                    : '#00ff88',
              }}
            />
            <span className="text-sm font-mono font-bold" style={{ color: textMain }}>
              {stressScore?.overall ?? '—'}
            </span>
            <span className={`text-xs font-mono ${stressColor}`}>{stressLabel}</span>
          </div>

          {/* Scenario switcher — desktop only */}
          <div
            className="hidden md:flex items-center gap-1 rounded-xl p-1 border"
            style={{ background: surface, borderColor: borderCol }}
          >
            <button onClick={() => setScenario('normal')} className={scenarioBtnClass('normal')}>
              Normal
            </button>
            <button onClick={() => setScenario('opportunity')} className={scenarioBtnClass('opportunity')}>
              🚀 Opportunity
            </button>
            <button onClick={() => setScenario('crisis')} className={scenarioBtnClass('crisis')}>
              ⚠ Crisis
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">

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
                <span className="text-xs font-mono font-semibold" style={{ color: textMain }}>
                  {user.name}
                </span>
                <span className="text-[10px] font-mono" style={{ color: textMuted }}>
                  {user.title}
                </span>
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

            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-mono text-green-400">LIVE</span>
            </div>

          </div>
        </div>
      </header>

      {/* ── ROLE + MOBILE SCENARIO BAR ────────────────────────────────── */}
      <div
        className="border-b transition-colors"
        style={{ background: subBg, borderColor: borderCol }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">

          {/* Role switcher */}
          <div
            className="flex items-center gap-1 rounded-xl p-1 border"
            style={{ background: surface, borderColor: borderCol }}
          >
            <button
              onClick={() => setRole('owner')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                role === 'owner' ? 'bg-cyan-400 text-[#080c14] font-bold' : ''
              }`}
              style={role !== 'owner' ? { color: textMuted } : {}}
            >
              <User size={11} />
              Business Owner
            </button>
            <button
              onClick={() => setRole('ops')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                role === 'ops' ? 'bg-cyan-400 text-[#080c14] font-bold' : ''
              }`}
              style={role !== 'ops' ? { color: textMuted } : {}}
            >
              <Settings size={11} />
              Ops Manager
            </button>
          </div>

          {/* Mobile scenario switcher */}
          <div className="flex md:hidden items-center gap-1">
            <button onClick={() => setScenario('normal')} className={scenarioBtnClass('normal')}>N</button>
            <button onClick={() => setScenario('opportunity')} className={scenarioBtnClass('opportunity')}>🚀</button>
            <button onClick={() => setScenario('crisis')} className={scenarioBtnClass('crisis')}>⚠</button>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono" style={{ color: textMuted }}>
            <RefreshCw size={10} className={pulse ? 'animate-spin text-cyan-400' : ''} />
            <span className="hidden sm:inline">Updates every 3s</span>
          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-sm font-mono" style={{ color: textMuted }}>
              Connecting to data streams...
            </p>
          </div>
        ) : role === 'owner' ? (
          <OwnerDashboard
            metrics={metrics}
            stressScore={stressScore}
            alerts={alerts}
            history={history}
            onResolveAlert={resolveAlert}
            theme={theme}
          />
        ) : (
          <OperationsDashboard
            metrics={metrics}
            stressScore={stressScore}
            alerts={alerts}
            history={history}
            onResolveAlert={resolveAlert}
            theme={theme}
          />
        )}
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer
        className="border-t mt-12 px-6 py-4 text-center transition-colors"
        style={{ borderColor: borderCol }}
      >
        <p className="text-xs font-mono" style={{ color: textMuted }}>
          OpsPulse · HORIZON 1.0 · Vidyavardhini's College of Engineering & Technology ·
          <span className="text-cyan-400 ml-1">Demo Mode (Simulated Data)</span>
        </p>
      </footer>
    </div>
  )
}