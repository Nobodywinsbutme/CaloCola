const NAV = [
  { id: 'beeswarm',   label: 'Caloric Density',     icon: '⬤' },
  { id: 'pyramid',    label: 'Food Pyramid',         icon: '▲' },
  { id: 'tracker',    label: 'Daily Tracker',        icon: '◎' },
  { id: 'radar',      label: 'Meal Balance',         icon: '✦' },
  { id: 'calculator', label: 'BMI Calculator',       icon: '♡' },
]

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-52 bg-white border-r border-gray-100 flex flex-col py-6 px-3 z-10">
      <div className="mb-8 px-2">
        <span className="text-lg font-semibold text-gray-800">Calo</span>
        <span className="text-lg font-semibold text-green-600">Cola</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left
              ${active === item.id
                ? 'bg-green-50 text-green-700 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
          >
            <span className="text-xs">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto px-2">
        <div className="text-xs text-gray-400">Group TripleK</div>
        <div className="text-xs text-gray-400">IT138IU</div>
      </div>
    </aside>
  )
}