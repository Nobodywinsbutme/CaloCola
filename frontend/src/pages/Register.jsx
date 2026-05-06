import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import '../styles/auth.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Male')
  const [activityLevel, setActivityLevel] = useState('Moderately Active')
  const [goal, setGoal] = useState('Maintain')
  const [step, setStep] = useState(1)

  const { register, authLoading, authError } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await register(
      email,
      password,
      name,
      parseFloat(height),
      parseFloat(weight),
      parseInt(age),
      gender,
      activityLevel,
      goal
    )
    if (success) navigate('/planner')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <div className="auth-logo">CaloCola</div>
            <p className="auth-subtitle">Start tracking your nutrition today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {authError && <div className="auth-error">{authError}</div>}

            {step === 1 ? (
              <>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={authLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={authLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    disabled={authLoading}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="auth-button"
                  disabled={authLoading}
                >
                  Next: Health Profile
                </button>
              </>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="height">Height (cm) *</label>
                    <input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="170"
                      required
                      disabled={authLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="weight">Weight (kg) *</label>
                    <input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70"
                      required
                      disabled={authLoading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="age">Age (years) *</label>
                    <input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="25"
                      required
                      disabled={authLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gender">Gender *</label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={authLoading}
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="activityLevel">Activity Level *</label>
                  <select
                    id="activityLevel"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    disabled={authLoading}
                  >
                    <option>Sedentary</option>
                    <option>Lightly Active</option>
                    <option>Moderately Active</option>
                    <option>Very Active</option>
                    <option>Extremely Active</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="goal">Goal *</label>
                  <select
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    disabled={authLoading}
                  >
                    <option>Lose</option>
                    <option>Maintain</option>
                    <option>Gain</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={authLoading}
                >
                  {authLoading ? 'Creating account...' : 'Create Account'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="auth-button-back"
                  disabled={authLoading}
                >
                  Back
                </button>
              </>
            )}
          </form>

          {step === 1 && (
            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Log in</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
