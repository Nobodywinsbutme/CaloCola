import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * GuestLoginBanner
 * Shown when a guest user interacts with personalized features.
 * Can be dismissed permanently for the session.
 */
export default function GuestLoginBanner({ message = 'Login to save your data and unlock all features.' }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="guest-banner" role="alert">
      <div className="guest-banner-content">
        <span className="guest-banner-icon">🔐</span>
        <div className="guest-banner-text">
          <strong>Guest Mode</strong>
          <span>{message}</span>
        </div>
      </div>
      <div className="guest-banner-actions">
        <Link to="/login" className="guest-banner-login-btn" id="guest-banner-login">
          Sign In
        </Link>
        <Link to="/register" className="guest-banner-register-btn" id="guest-banner-register">
          Create Account
        </Link>
        <button
          className="guest-banner-dismiss"
          onClick={() => setDismissed(true)}
          id="guest-banner-dismiss"
          title="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}
