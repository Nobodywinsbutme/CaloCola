import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Density Explorer', end: true },
  { to: '/strategy', label: 'Dietary Strategy', end: false },
  { to: '/analysis', label: 'Meal Balance', end: false },
  { to: '/planner', label: 'Planner & AI', end: false },
]

export default function Navbar() {
  return (
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
        <div className="nav-avatar">NK</div>
      </div>
    </header>
  )
}
