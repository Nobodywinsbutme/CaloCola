import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import BeeswarmPage   from './pages/BeeswarmPage'
import PyramidPage    from './pages/PyramidPage'
import TrackerPage    from './pages/TrackerPage'
import RadarPage      from './pages/RadarPage'
import CalculatorPage from './pages/CalculatorPage'

const PAGES = {
  beeswarm:   <BeeswarmPage />,
  pyramid:    <PyramidPage />,
  tracker:    <TrackerPage />,
  radar:      <RadarPage />,
  calculator: <CalculatorPage />,
}

export default function App() {
  const [active, setActive] = useState('beeswarm')

  return (
    <AppProvider>
      <div className="flex min-h-screen">
        <Sidebar active={active} onSelect={setActive} />
        <main className="ml-52 flex-1 min-h-screen bg-gray-50">
          {PAGES[active]}
        </main>
      </div>
    </AppProvider>
  )
}