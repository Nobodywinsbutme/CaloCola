import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/ui/Navbar'
import Explorer from './pages/Explorer'
import Strategy from './pages/Strategy'
import Analysis from './pages/Analysis'
import Planner from './pages/Planner'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Explorer />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}