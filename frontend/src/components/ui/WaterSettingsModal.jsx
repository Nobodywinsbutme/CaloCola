import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { updateUserProfile } from '../../services/user_profile/userProfileApi'

export default function WaterSettingsModal({
  isOpen,
  onClose,
  defaultTarget = 2000,
  defaultCupSize = 250,
}) {
  const { token, refreshUserProfile } = useApp()
  const [target, setTarget] = useState(defaultTarget)
  const [cupSize, setCupSize] = useState(defaultCupSize)
  const [localError, setLocalError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTarget(defaultTarget)
      setCupSize(defaultCupSize)
      setLocalError('')
    }
  }, [isOpen, defaultTarget, defaultCupSize])

  if (!isOpen) return null

  const handleSubmit = async () => {
    const targetValue = Number(target)
    const cupValue = Number(cupSize)

    if (!targetValue || targetValue <= 0 || !cupValue || cupValue <= 0) {
      setLocalError('Water target and cup size must be greater than 0.')
      return
    }

    if (!token) {
      setLocalError('Please sign in to update water settings.')
      return
    }

    setIsSaving(true)
    setLocalError('')
    try {
      await updateUserProfile(token, {
        waterTarget: targetValue,
        cupSizeMl: cupValue,
      })
      await refreshUserProfile()
      onClose()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to update water settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box water-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Water Settings</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        <div className="modal-form">
          <div className="form-grid">
            <label className="form-field">
              <span>Daily target (ml)</span>
              <input
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Cup size (ml)</span>
              <input
                type="number"
                min="1"
                value={cupSize}
                onChange={(e) => setCupSize(e.target.value)}
              />
            </label>
          </div>

          {localError && (
            <div className="field-error">{localError}</div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
            <button type="button" className="btn btn-hi" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
