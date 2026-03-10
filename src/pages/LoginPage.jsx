import React, { useState } from 'react'
import { Activity, Eye, EyeOff, Lock, Mail, User, Sun, Moon, AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage({ onLogin, theme, onToggleTheme }) {
  const isDark = theme === 'dark'

  const [screen, setScreen] = useState('select')
  const [selectedRole, setSelectedRole] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [registeredUsers, setRegisteredUsers] = useState([])

  const surface   = isDark ? '#0d1526' : '#ffffff'
  const borderCol = isDark ? '#1a2540' : '#e2e8f0'
  const textMain  = isDark ? '#ffffff' : '#0f172a'
  const textMuted = isDark ? '#4a6080' : '#64748b'
  const inputBg   = isDark ? '#080c14' : '#f8fafc'

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setError('')
    setSuccess('')
    setIsRegister(false)
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    resetForm()
    setScreen('login')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 800))

    const user = registeredUsers.find(
      u => u.email === email.toLowerCase() &&
      u.password === password &&
      u.role === selectedRole
    )

    if (user) {
      onLogin(user)
    } else {
      setError('Invalid email or password. Please register first.')
    }

    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 800))

    if (!name.trim()) {
      setError('Please enter your full name.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    const exists = registeredUsers.find(
      u => u.email === email.toLowerCase()
    )
    if (exists) {
      setError('An account with this email already exists.')
      setLoading(false)
      return
    }

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: selectedRole,
      title: selectedRole === 'owner' ? 'Business Owner' : 'Operations Manager',
    }

    setRegisteredUsers(prev => [...prev, newUser])
    setSuccess('Account created! You can now sign in.')
    setIsRegister(false)
    setPassword('')
    setName('')
    setLoading(false)
  }

  // ── Role Selection Screen ──────────────────────────────────────────────
  if (screen === 'select') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300"
        style={{ background: isDark ? '#080c14' : '#f1f5f9' }}
      >
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center border transition-all z-10"
          style={{ background: surface, borderColor: borderCol, color: textMuted }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#00e5ff' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: '#00ff88' }} />

        <div className="relative w-full max-w-lg">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border"
              style={{ background: '#00e5ff18', borderColor: '#00e5ff40', boxShadow: '0 0 30px #00e5ff33' }}
            >
              <Activity size={32} className="text-cyan-400" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight" style={{ color: textMain }}>
              OpsPulse
            </h1>
            <p className="text-sm font-mono mt-1" style={{ color: textMuted }}>
              Who are you signing in as?
            </p>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Business Owner card */}
            <button
              onClick={() => handleRoleSelect('owner')}
              className="p-6 rounded-2xl border text-left transition-all hover:scale-105"
              style={{ background: surface, borderColor: borderCol }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#00e5ff'}
              onMouseLeave={e => e.currentTarget.style.borderColor = borderCol}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border"
                style={{ background: '#00e5ff15', borderColor: '#00e5ff30' }}
              >
                <User size={22} className="text-cyan-400" />
              </div>
              <h2 className="text-lg font-display font-bold mb-1" style={{ color: textMain }}>
                Business Owner
              </h2>
              <p className="text-xs font-body leading-relaxed" style={{ color: textMuted }}>
                View high-level KPIs, revenue, cash flow, stress score and business health overview.
              </p>
              <div className="mt-4 text-xs font-mono text-cyan-400">
                Sign in as Owner →
              </div>
            </button>

            {/* Operations Manager card */}
            <button
              onClick={() => handleRoleSelect('ops')}
              className="p-6 rounded-2xl border text-left transition-all hover:scale-105"
              style={{ background: surface, borderColor: borderCol }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.borderColor = borderCol}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border"
                style={{ background: '#a78bfa15', borderColor: '#a78bfa30' }}
              >
                <Activity size={22} className="text-purple-400" />
              </div>
              <h2 className="text-lg font-display font-bold mb-1" style={{ color: textMain }}>
                Operations Manager
              </h2>
              <p className="text-xs font-body leading-relaxed" style={{ color: textMuted }}>
                Monitor inventory, support tickets, operational metrics and detailed stress breakdowns.
              </p>
              <div className="mt-4 text-xs font-mono text-purple-400">
                Sign in as Manager →
              </div>
            </button>
          </div>

          <p
            className="text-center text-[10px] font-mono mt-8"
            style={{ color: isDark ? '#1a2540' : '#cbd5e1' }}
          >
            HORIZON 1.0 · Vidyavardhini's College of Engineering
          </p>
        </div>
      </div>
    )
  }

  // ── Login / Register Screen ────────────────────────────────────────────
  const isOwner = selectedRole === 'owner'
  const accentColor = isOwner ? '#00e5ff' : '#a78bfa'
  const roleLabel = isOwner ? 'Business Owner' : 'Operations Manager'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300"
      style={{ background: isDark ? '#080c14' : '#f1f5f9' }}
    >
      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center border transition-all z-10"
        style={{ background: surface, borderColor: borderCol, color: textMuted }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Glow blob */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: accentColor }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl border p-8 shadow-2xl"
        style={{ background: surface, borderColor: borderCol }}
      >
        {/* Back button */}
        <button
          onClick={() => setScreen('select')}
          className="flex items-center gap-1 text-xs font-mono mb-6 transition-colors"
          style={{ color: textMuted }}
          onMouseEnter={e => e.currentTarget.style.color = textMain}
          onMouseLeave={e => e.currentTarget.style.color = textMuted}
        >
          ← Back
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 border"
            style={{
              background: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              boxShadow: `0 0 20px ${accentColor}33`
            }}
          >
            {isOwner
              ? <User size={22} style={{ color: accentColor }} />
              : <Activity size={22} style={{ color: accentColor }} />
            }
          </div>
          <h2 className="text-xl font-display font-bold" style={{ color: textMain }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
            <span className="text-xs font-mono" style={{ color: accentColor }}>
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="flex items-start gap-2 rounded-xl p-3 border border-green-500/30 bg-green-500/10 mb-4">
            <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-400 font-body">{success}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl p-3 border border-red-500/30 bg-red-500/10 mb-4">
            <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-400 font-body">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">

          {/* Name — only on register */}
          {isRegister && (
            <div>
              <label className="block text-xs font-mono mb-1.5" style={{ color: textMuted }}>
                FULL NAME
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                  style={{ background: inputBg, borderColor: borderCol, color: textMain }}
                  onFocus={e => e.target.style.borderColor = accentColor}
                  onBlur={e => e.target.style.borderColor = borderCol}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-mono mb-1.5" style={{ color: textMuted }}>
              EMAIL
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                style={{ background: inputBg, borderColor: borderCol, color: textMain }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = borderCol}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono mb-1.5" style={{ color: textMuted }}>
              PASSWORD
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter Your Password"
                required
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all"
                style={{ background: inputBg, borderColor: borderCol, color: textMain }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = borderCol}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: textMuted }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {isRegister && (
              <p className="text-[10px] font-mono mt-1" style={{ color: textMuted }}>
                Minimum 6 characters
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-mono font-bold text-sm transition-all disabled:opacity-60 mt-2"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${isOwner ? '#00ff88' : '#7c3aed'})`,
              color: '#080c14',
              boxShadow: loading ? 'none' : `0 0 20px ${accentColor}44`,
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#080c14]/30 border-t-[#080c14] rounded-full animate-spin" />
                {isRegister ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (
              isRegister ? 'Create Account →' : 'Sign In →'
            )}
          </button>
        </form>

        {/* Toggle login / register */}
        <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: borderCol }}>
          {isRegister ? (
            <p className="text-xs font-mono" style={{ color: textMuted }}>
              Already have an account?{' '}
              <button
                onClick={() => { setIsRegister(false); setError(''); setSuccess('') }}
                className="font-bold"
                style={{ color: accentColor }}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs font-mono" style={{ color: textMuted }}>
              Don't have an account?{' '}
              <button
                onClick={() => { setIsRegister(true); setError(''); setSuccess('') }}
                className="font-bold"
                style={{ color: accentColor }}
              >
                Register
              </button>
            </p>
          )}
        </div>

        <p className="text-center text-[10px] font-mono mt-4" style={{ color: isDark ? '#1a2540' : '#cbd5e1' }}>
          HORIZON 1.0 · Vidyavardhini's College of Engineering
        </p>
      </div>
    </div>
  )
}