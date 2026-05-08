import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/ui/Navbar'
import ToastHost from './components/ui/ToastHost'
import Explorer from './pages/Explorer'
import Strategy from './pages/Strategy'
import Analysis from './pages/Analysis'
import Planner from './pages/Planner'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedRoute({ element }) {
  const { isAuthenticated } = useApp()
  return isAuthenticated ? element : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useApp()

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Explorer />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/planner" element={<ProtectedRoute element={<Planner />} />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/planner" replace />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/planner" replace />} />
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