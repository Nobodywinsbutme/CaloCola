// src/components/layout/Navbar.jsx
import { useState, useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AppContext'
import UserProfilePopup from '../ui/UserProfilePopup'
import AccountSettingsModal from '../ui/AccountSettingsModal' // Import the new modal

const NAV_ITEMS = [
  { to: '/', label: 'Density Explorer', end: true },
  { to: '/strategy', label: 'Dietary Strategy', end: false },
  { to: '/analysis', label: 'Meal Balance', end: false },
  { to: '/planner', label: 'Planner & AI', end: false },
]

export default function Navbar() {
  const { isLoggedIn, getInitials } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false) // New state for modal
  const avatarRef = useRef(null)

  return (
    <>
      <header className="top-nav">
        <div className="brand">CaloCola</div>
        <nav className="top-tabs">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
            >
              <span className="tab-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="nav-tools">
          <input className="nav-search" type="text" placeholder="Search food…" />

          {isLoggedIn ? (
            <div className="nav-avatar-wrap" ref={avatarRef}>
              <button
                id="nav-avatar-btn"
                className="nav-avatar nav-avatar-active"
                onClick={() => setShowProfile(p => !p)}
                title="Your profile"
              >
                {getInitials()}
              </button>
              {showProfile && (
                <UserProfilePopup 
                  onClose={() => setShowProfile(false)} 
                  onOpenSettings={() => setShowSettings(true)} // Pass the trigger function
                />
              )}
            </div>
          ) : (
            <Link to="/login" id="nav-login-btn" className="nav-login-btn">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Render the modal outside the header flow */}
      {showSettings && (
        <AccountSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  )
}