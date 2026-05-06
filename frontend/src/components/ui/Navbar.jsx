import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import EditProfile from '../../pages/EditProfile'

const NAV_ITEMS = [
  { to: '/', label: 'Density Explorer', end: true },
  { to: '/strategy', label: 'Dietary Strategy', end: false },
  { to: '/analysis', label: 'Meal Balance', end: false },
  { to: '/planner', label: 'Planner & AI', end: false },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useApp()
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()

  const handleAvatarClick = () => {
    if (isAuthenticated) {
      setShowProfile(true)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

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
            {isAuthenticated ? (
            <div className="nav-auth">
              <div
                className="nav-avatar"
                onClick={handleAvatarClick}
                title={user?.email}
              >
                {getInitials(user?.name)}
              </div>
              <button className="nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <NavLink to="/login" className="nav-link">Login</NavLink>
              <NavLink to="/register" className="nav-link nav-link-primary">Sign Up</NavLink>
            </div>
          )}
        </div>
      </header>

      {showProfile && <EditProfile onClose={() => setShowProfile(false)} />}
    </>
  )
}
