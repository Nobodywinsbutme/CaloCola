import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { updateUserProfile } from '../services/user_profile/userProfileApi'
import '../styles/auth.css'

export default function EditProfile({ onClose }) {
  const { user, token } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Male')
  const [activityLevel, setActivityLevel] = useState('Moderately Active')
  const [goal, setGoal] = useState('Maintain')
  const [calorieTarget, setCalorieTarget] = useState('')
  const [proteinTarget, setProteinTarget] = useState('')
  const [fatTarget, setFatTarget] = useState('')
  const [carbTarget, setCarbTarget] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateUserProfile(token, {
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        age: age ? parseInt(age) : undefined,
        gender,
        activityLevel,
        goal,
        calorieTarget: calorieTarget ? parseFloat(calorieTarget) : undefined,
        proteinTarget: proteinTarget ? parseFloat(proteinTarget) : undefined,
        fatTarget: fatTarget ? parseFloat(fatTarget) : undefined,
        carbTarget: carbTarget ? parseFloat(carbTarget) : undefined,
      })

      setSuccess(true)
      setTimeout(() => {
        if (onClose) onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">Profile updated!</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age (years)</label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={loading}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="activityLevel">Activity Level</label>
            <select
              id="activityLevel"
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              disabled={loading}
            >
              <option>Sedentary</option>
              <option>Lightly Active</option>
              <option>Moderately Active</option>
              <option>Very Active</option>
              <option>Extremely Active</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="goal">Goal</label>
            <select
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={loading}
            >
              <option>Lose</option>
              <option>Maintain</option>
              <option>Gain</option>
            </select>
          </div>

          <div className="section-title" style={{ marginTop: '20px' }}>Daily Targets</div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="calorieTarget">Calorie Target (kcal)</label>
              <input
                id="calorieTarget"
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
                placeholder="2500"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="proteinTarget">Protein (g)</label>
              <input
                id="proteinTarget"
                type="number"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(e.target.value)}
                placeholder="120"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fatTarget">Fat (g)</label>
              <input
                id="fatTarget"
                type="number"
                value={fatTarget}
                onChange={(e) => setFatTarget(e.target.value)}
                placeholder="70"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="carbTarget">Carbs (g)</label>
              <input
                id="carbTarget"
                type="number"
                value={carbTarget}
                onChange={(e) => setCarbTarget(e.target.value)}
                placeholder="300"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
