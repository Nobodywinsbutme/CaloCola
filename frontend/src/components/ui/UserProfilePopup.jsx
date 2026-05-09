// src/components/ui/UserProfilePopup.jsx
import { useEffect, useRef } from 'react'
import { useAuth } from '../../context/AppContext'
import { LogOut, Settings } from 'lucide-react' // Added Lucide icons

export default function UserProfilePopup({ onClose, onOpenSettings }) {
  const { user, logout, getInitials } = useAuth()
  const popupRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleLogout = () => {
    logout()
    onClose()
  }

  const handleSettingsClick = () => {
    onClose() // Close the small dropdown
    onOpenSettings() // Tell Navbar to open the big modal
  }

  const initials = getInitials()
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null

  return (
    <div className="profile-popup" ref={popupRef}>
      {/* Header */}
      <div className="profile-popup-header">
        <div className="profile-popup-avatar">{initials}</div>
        <div className="profile-popup-info">
          <div className="profile-popup-name">{user?.name || 'CaloCola User'}</div>
          <div className="profile-popup-email">{user?.email}</div>
          {joinDate && <div className="profile-popup-joined">Member since {joinDate}</div>}
        </div>
      </div>

      <div className="profile-popup-divider" />

      {/* Status section */}
      <div className="profile-popup-section">
        <div className="profile-popup-section-title">Account Status</div>
        <div className="profile-popup-status">
          <span className="profile-status-dot" />
          <span>Active — Logged in</span>
        </div>
      </div>

      <div className="profile-popup-divider" />

      {/* Actions */}
      <div className="profile-popup-actions">
        <button className="profile-popup-action" onClick={handleSettingsClick}>
          <Settings size={16} /> Account Settings
        </button>
        <button className="profile-popup-action profile-popup-action-danger" onClick={handleLogout} id="logout-btn">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  )
}