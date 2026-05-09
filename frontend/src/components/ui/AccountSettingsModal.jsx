import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AppContext'
import { updateUserProfile } from '../../services/user_profile/userProfileApi' 
import { X, Ruler, Scale, Activity, Target, User } from 'lucide-react'
import '../../styles/login.css' 
import '../../styles/settings-modal.css'

export default function AccountSettingsModal({ onClose }) {
  // Added refreshUserProfile
  const { user, token, refreshUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [form, setForm] = useState({
    age: user?.profile?.age || '',
    gender: user?.profile?.gender || 'Male',
    height: user?.profile?.height || '',
    weight: user?.profile?.weight || '',
    activityLevel: user?.profile?.activityLevel || 'Sedentary',
    goal: user?.profile?.goal || 'Maintain'
  })

  // Syncs the form to display database data once it loads
  useEffect(() => {
    if (user?.profile) {
      setForm({
        age: user.profile.age || '',
        gender: user.profile.gender || 'Male',
        height: user.profile.height || '',
        weight: user.profile.weight || '',
        activityLevel: user.profile.activityLevel || 'Sedentary',
        goal: user.profile.goal || 'Maintain'
      })
    }
  }, [user])
  
  const update = (field, value) => {
    setError(null) 
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const profileData = {
        age: parseInt(form.age, 10),
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
        gender: form.gender,
        activityLevel: form.activityLevel,
        goal: form.goal
      }

      // 1. Save to database
      await updateUserProfile(token, profileData)
      
      // 2. Fetch fresh data so TDEE math recalculates globally
      await refreshUserProfile()
      
      // 3. Close the modal
      onClose()
      
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <button className="settings-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="settings-header">
          <h2>Account Settings</h2>
          <p>Update your physical metrics to recalculate your dietary strategy.</p>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: '20px' }}>
            <span className="auth-error-icon">⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSave} className="settings-form">
          <div className="settings-grid">
            
            {/* Age */}
            <div className="auth-field">
              <label className="auth-label">Age (years)</label>
              <div className="auth-input-wrap">
                <User className="auth-input-icon" size={18} />
                <input 
                  type="number" 
                  min="1" 
                  max="120"
                  className="auth-input" 
                  value={form.age}
                  onChange={(e) => update('age', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div className="auth-field">
              <label className="auth-label">Gender</label>
              <div className="auth-input-wrap">
                <User className="auth-input-icon" size={18} />
                <select 
                  className="auth-input settings-select"
                  value={form.gender}
                  onChange={(e) => update('gender', e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Height */}
            <div className="auth-field">
              <label className="auth-label">Height (cm)</label>
              <div className="auth-input-wrap">
                <Ruler className="auth-input-icon" size={18} />
                <input 
                  type="number" 
                  step="0.1"
                  className="auth-input" 
                  value={form.height}
                  onChange={(e) => update('height', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Weight */}
            <div className="auth-field">
              <label className="auth-label">Weight (kg)</label>
              <div className="auth-input-wrap">
                <Scale className="auth-input-icon" size={18} />
                <input 
                  type="number" 
                  step="0.1"
                  className="auth-input" 
                  value={form.weight}
                  onChange={(e) => update('weight', e.target.value)}
                  required
                />
              </div>
            </div>

          </div>

          <hr className="settings-divider" />

          {/* Activity Level */}
          <div className="auth-field">
            <label className="auth-label">Activity Level</label>
            <div className="auth-input-wrap">
              <Activity className="auth-input-icon" size={18} />
              <select 
                className="auth-input settings-select"
                value={form.activityLevel}
                onChange={(e) => update('activityLevel', e.target.value)}
              >
                <option value="Sedentary">Sedentary (Little to no exercise)</option>
                <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                <option value="Very Active">Very Active (6 days/week)</option>
              </select>
            </div>
          </div>

          {/* Goal */}
          <div className="auth-field">
            <label className="auth-label">Primary Goal</label>
            <div className="auth-input-wrap">
              <Target className="auth-input-icon" size={18} />
              <select 
                className="auth-input settings-select"
                value={form.goal}
                onChange={(e) => update('goal', e.target.value)}
              >
                <option value="Lose">Lose Weight</option>
                <option value="Maintain">Maintain Weight</option>
                <option value="Gain">Gain Muscle/Weight</option>
              </select>
            </div>
          </div>

          <div className="settings-actions">
            <button type="button" className="settings-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="settings-btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}