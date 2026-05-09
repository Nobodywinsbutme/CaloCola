// src/components/Register.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AppContext'
import { 
  User, Mail, Lock, CheckCircle, Eye, EyeOff, 
  Ruler, Scale, Activity, Target 
} from 'lucide-react'
import '../styles/login.css'
import '../styles/register.css'

export default function Register() {
  const { register, isLoggedIn, loading, authError, clearAuthError } = useAuth()
  const navigate = useNavigate()
  
  // Single form state holding all fields for both steps
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', confirm: '',
    height: '', weight: '', age: '', gender: 'Male',
    activityLevel: 'Moderately Active', goal: 'Maintain'
  })
  
  const [step, setStep] = useState(1)
  const [localError, setLocalError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn, navigate])

  // Clear errors on initial mount
  useEffect(() => {
    clearAuthError()
  }, [clearAuthError])

  // NEW: Watch for backend authentication errors
  useEffect(() => {
    if (authError) {
      const errLower = authError.toLowerCase()
      // If the backend complains about the email being taken/duplicate
      if (errLower.includes('email') || errLower.includes('duplicate') || errLower.includes('exist') || errLower.includes('unique')) {
        setStep(1) // Bump the user back to step 1 to fix their email
        setLocalError('An account with this email already exists.')
      } else {
        setLocalError(authError)
      }
    }
  }, [authError])

  const update = (k, v) => {
    setLocalError('')
    if (authError) clearAuthError() // Clear context error when user types
    setForm(p => ({ ...p, [k]: v }))
  }

  // Validate Step 1 before proceeding
  const validateStep1 = () => {
    if (!form.email.trim()) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email'
    if (!form.password) return 'Password is required'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirm) return 'Passwords do not match'
    return null
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) return setLocalError(err)
    setLocalError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Final check before submission
    if (!form.height || !form.weight || !form.age) {
      return setLocalError('Please fill in all health metrics.')
    }

    const success = await register(
      form.email.trim(),
      form.password,
      form.name.trim() || undefined,
      parseFloat(form.height),
      parseFloat(form.weight),
      parseInt(form.age),
      form.gender,
      form.activityLevel,
      form.goal
    )
    
    // If successful, navigate. If not, the useEffect above handles the error UI.
    if (success) navigate('/', { replace: true })
  }

  // Password strength logic
  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength] || ''
  const strengthColor = ['', '#ff5a5a', '#ffc147', '#ffd766', '#6effc4', '#2ee8c8'][strength] || ''

  const displayError = localError || authError

  return (
    <div className="auth-bg">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <span className="auth-logo-text">CaloCola</span>
          <div className="auth-logo-sub">Nutrition Intelligence Dashboard</div>
        </div>

        <h2 className="auth-title">
          {step === 1 ? 'Create your account' : 'Health Profile'}
        </h2>
        <p className="auth-subtitle">
          {step === 1 
            ? 'Start tracking your nutrition and reach your goals' 
            : 'Help us personalize your dietary strategy'}
        </p>

        {displayError && (
          <div className="auth-error">
            <span className="auth-error-icon">⚠</span> {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* ================= STEP 1: ACCOUNT DETAILS ================= */}
          {step === 1 && (
            <>
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <User className="auth-input-icon" size={18} />
                  <input
                    id="reg-name"
                    type="text"
                    className="auth-input"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    autoComplete="name"
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" size={18} />
                  <input
                    id="reg-email"
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    className="auth-input auth-input-pass"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(p => !p)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.password && (
                  <div className="auth-strength">
                    <div className="auth-strength-bar">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className="auth-strength-seg"
                          style={{ backgroundColor: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)' }}
                        />
                      ))}
                    </div>
                    <span className="auth-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    id="reg-confirm"
                    type={showConfirmPass ? 'text' : 'password'}
                    className="auth-input auth-input-pass"
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={e => update('confirm', e.target.value)}
                    autoComplete="new-password"
                  />
                  {form.confirm && form.password === form.confirm && (
                    <CheckCircle className="auth-pass-check" size={18} />
                  )}
                  <button type="button" className="auth-pass-toggle" onClick={() => setShowConfirmPass(p => !p)}>
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="button" className="auth-btn" onClick={handleNext}>
                Next: Health Profile →
              </button>

              <div className="auth-divider"><span>or</span></div>

              <p className="auth-switch">
                Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
              </p>
              <Link to="/" className="auth-guest-link">Continue as guest →</Link>
            </>
          )}

          {/* ================= STEP 2: HEALTH PROFILE ================= */}
          {step === 2 && (
            <>
              <div className="auth-grid">
                <div className="auth-field">
                  <label className="auth-label">Age (years)</label>
                  <div className="auth-input-wrap">
                    <User className="auth-input-icon" size={18} />
                    <input
                      type="number"
                      min="1" max="120"
                      className="auth-input"
                      placeholder="25"
                      value={form.age}
                      onChange={e => update('age', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Gender</label>
                  <div className="auth-input-wrap">
                    <User className="auth-input-icon" size={18} />
                    <select
                      className="auth-input auth-select"
                      value={form.gender}
                      onChange={e => update('gender', e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="auth-grid">
                <div className="auth-field">
                  <label className="auth-label">Height (cm)</label>
                  <div className="auth-input-wrap">
                    <Ruler className="auth-input-icon" size={18} />
                    <input
                      type="number" step="0.1"
                      className="auth-input"
                      placeholder="170"
                      value={form.height}
                      onChange={e => update('height', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Weight (kg)</label>
                  <div className="auth-input-wrap">
                    <Scale className="auth-input-icon" size={18} />
                    <input
                      type="number" step="0.1"
                      className="auth-input"
                      placeholder="70"
                      value={form.weight}
                      onChange={e => update('weight', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Activity Level</label>
                <div className="auth-input-wrap">
                  <Activity className="auth-input-icon" size={18} />
                  <select
                    className="auth-input auth-select"
                    value={form.activityLevel}
                    onChange={e => update('activityLevel', e.target.value)}
                  >
                    <option value="Sedentary">Sedentary (Little/no exercise)</option>
                    <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                    <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                    <option value="Very Active">Very Active (6-7 days/week)</option>
                  </select>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Primary Goal</label>
                <div className="auth-input-wrap">
                  <Target className="auth-input-icon" size={18} />
                  <select
                    className="auth-input auth-select"
                    value={form.goal}
                    onChange={e => update('goal', e.target.value)}
                  >
                    <option value="Lose">Lose Weight</option>
                    <option value="Maintain">Maintain Weight</option>
                    <option value="Gain">Gain Muscle/Weight</option>
                  </select>
                </div>
              </div>

              <div className="auth-actions-row">
                <button 
                  type="button" 
                  className="auth-btn-outline" 
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Back
                </button>
                <button 
                  type="submit" 
                  className="auth-btn" 
                  disabled={loading}
                  style={{ flex: 2, marginTop: 0 }}
                >
                  {loading ? <span className="auth-spinner" /> : 'Create Account'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}