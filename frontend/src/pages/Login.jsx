import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AppContext'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import '../styles/login.css'

export default function Login() {
  const { login, isLoggedIn, loading, authError, clearAuthError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState('')
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn, navigate])

  useEffect(() => {
    clearAuthError()
  }, [clearAuthError])

  const update = (k, v) => {
    setLocalError('')
    setForm(p => ({ ...p, [k]: v }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) return setLocalError('Email is required')
    if (!form.password)     return setLocalError('Password is required')
    const loginSucceeded = await login(form.email.trim(), form.password)
    if (loginSucceeded) navigate('/', { replace: true })
  }

  const displayError = localError || authError

  return (
    <div className="auth-bg">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-text">CaloCola</span>
          <div className="auth-logo-sub">Nutrition Intelligence Dashboard</div>
        </div>

        <h2 className="auth-title">Welcome back</h2>

        {displayError && (
          <div className="auth-error">
            <span className="auth-error-icon">⚠</span> {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label className="auth-label">Email address</label>
            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <Lock className="auth-input-icon" size={18} />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                /* MUST include auth-input-pass so it gets right padding */
                className="auth-input auth-input-pass" 
                placeholder="Your password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-pass-toggle"
                onClick={() => setShowPass(p => !p)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button id="login-submit" type="submit" className="auth-btn" disabled={loading} cursor="pointer">
            {loading ? <span className="auth-spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>

        <Link to="/" className="auth-guest-link">
          Continue as guest →
        </Link>
      </div>
    </div>
  )
}