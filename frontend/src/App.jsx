import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom' // <-- Import useLocation
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/ui/Navbar'
import ToastHost from './components/ui/ToastHost'
import Explorer from './pages/Explorer'
import Strategy from './pages/Strategy'
import Planner from './pages/Planner'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedRoute({ element }) {
  const { isAuthenticated } = useApp()
  return isAuthenticated ? element : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useApp()
  const location = useLocation() // <-- Get the current route information

  // <-- Check if the current path is login or register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="app-shell">
      {/* <-- Conditionally render the Navbar: Only show it if we are NOT on an auth page */}
      {!isAuthPage && <Navbar />}
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Explorer />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/planner" element={<ProtectedRoute element={<Planner />} />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastHost />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}