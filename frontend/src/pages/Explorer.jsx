import { useMemo, useState } from 'react'
import BeeswarmPlot from '../components/charts/BeeswarmPlot'
import { useApp } from '../context/AppContext'

const PALETTE_MAP = {
  Vegetable: '#6effc4', Meat: '#ff5a5a', Fruit: '#ffc147',
  Grain: '#ffd766', Fastfood: '#b094ff', Nuts: '#e07b1a', 'VN Dishes': '#2ee8c8',
  'Bánh mì': '#ff8a4c', 'Món nước': '#5bbcff', 'Món cuốn': '#2ee8c8',
  Cơm: '#ffd766', Canh: '#7ae1ff', 'Đồ uống': '#b094ff',
  Rau: '#6effc4', Thịt: '#ff5a5a', 'Tráng miệng': '#ff79b0',
}
const PALETTE_CYCLE = ['#6effc4', '#ff5a5a', '#ffc147', '#ffd766', '#b094ff', '#e07b1a', '#2ee8c8', '#5bbcff', '#ff79b0']

const EMOJIS = {
  Vegetable: '🥦', Meat: '🥩', Fruit: '🍎', Grain: '🌾', Fastfood: '🍔', Nuts: '🥜', 'VN Dishes': '🇻🇳',
  'Bánh mì': '🥖', 'Món nước': '🍜', 'Món cuốn': '🥢', Cơm: '🍚', Canh: '🥣',
  'Đồ uống': '🧋', Rau: '🥬', Thịt: '🍖', 'Tráng miệng': '🍮',
}

const WEEK = [
  { day: 'Sat', h: 72, col: 'var(--hi)' },
  { day: 'Sun', h: 88, col: 'var(--red)' },
  { day: 'Mon', h: 55, col: 'var(--hi)' },
  { day: 'Tue', h: 62, col: 'var(--hi)' },
  { day: 'Wed', h: 17, col: 'var(--amber)', today: true },
  { day: 'Thu', h: 0, col: 'var(--ink4)' },
  { day: 'Fri', h: 0, col: 'var(--ink4)' },
]

export default function Explorer() {
  const { foods, loading, error } = useApp()
  const [nutrient, setNutrient] = useState('fat')
  const [mode, setMode] = useState('overall')
  const [filterCategory, setFilterCategory] = useState('all')

  const categories = useMemo(() => {
    const set = new Set(foods.map(f => f.category))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [foods])

  const colorMap = useMemo(() => {
    const map = {}
    categories.forEach((cat, i) => { map[cat] = PALETTE_MAP[cat] ?? PALETTE_CYCLE[i % PALETTE_CYCLE.length] })
    return map
  }, [categories])

  const visibleCount = filterCategory === 'all' ? foods.length : foods.filter(f => f.category === filterCategory).length

  const statusMessage = loading ? 'Loading foods…' : error ? error : !foods.length ? 'No food data available.' : ''

  return (
    <section className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1>Global Caloric Density Explorer</h1>
          <p>Analytical hub for the Food Master Table · <strong style={{ color: 'var(--hi)' }}>Beeswarm Chart centerpiece</strong></p>
        </div>
        <div className="page-meta">Showing <strong style={{ color: 'var(--t1)' }}>{visibleCount}</strong> foods</div>
      </div>

      {/* Controls */}
      <div className="controls">
        <span className="control-label">Category:</span>
        <div className="pill-group">
          <button className={`pill${filterCategory === 'all' ? ' active' : ''}`} onClick={() => setFilterCategory('all')}>All</button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`pill${filterCategory === cat ? ' active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {EMOJIS[cat] ?? ''} {cat}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="control-label">Bubble size:</span>
          <div className="pill-group">
            {['protein', 'fat', 'carbs'].map(n => (
              <button key={n} className={`pill${nutrient === n ? ' active' : ''}`} onClick={() => setNutrient(n)}>
                {n.charAt(0).toUpperCase() + n.slice(1)}
              </button>
            ))}
          </div>
          <div className="pill-group" style={{ marginLeft: 8 }}>
            {['overall', 'category'].map(m => (
              <button key={m} className={`pill${mode === m ? ' active' : ''}`} onClick={() => setMode(m)}>
                {m === 'overall' ? 'Overall' : 'By Category'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main beeswarm card */}
      <div className="card card-lg">
        <div className="card-head">
          <div>
            <div className="section-title" style={{ marginBottom: 2 }}>Beeswarm — Energy Density Distribution</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>Hover bubble → tooltip · Filter by category above</div>
          </div>
        </div>

        {statusMessage ? (
          <div className="status">{statusMessage}</div>
        ) : (
          <BeeswarmPlot foods={foods} nutrient={nutrient} mode={mode} filterCategory={filterCategory} colorMap={colorMap} />
        )}

        {/* Legend */}
        <div className="legend" style={{ marginTop: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--t3)', marginRight: 2 }}>CATEGORY:</span>
          {categories.map(cat => (
            <div
              key={cat}
              className={`legend-item${filterCategory === cat ? ' active' : ''}`}
              onClick={() => setFilterCategory(prev => prev === cat ? 'all' : cat)}
            >
              <div className="legend-dot" style={{ background: colorMap[cat] }} />
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid-two">
        {/* Category avg bars */}
        <div className="card">
          <div className="section-title">Average Cal/100g by Category</div>
          {categories.map(cat => {
            const fs = foods.filter(f => f.category === cat)
            const avg = fs.reduce((s, f) => s + f.calories, 0) / (fs.length || 1)
            const max = 500
            const col = colorMap[cat]  
            return (
              <div
                key={cat}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}
                onClick={() => setFilterCategory(prev => prev === cat ? 'all' : cat)}
              >
                <div style={{ width: 70, fontSize: 10.5, color: col, textAlign: 'right', fontWeight: 600 }}>{cat}</div>
                <div style={{ flex: 1, height: 14, background: 'var(--ink4)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: col, borderRadius: 99, width: `${(avg / max) * 100}%`, transition: 'width 1s ease' }} />
                </div> 
                <div style={{ width: 45, fontSize: 10, color: 'var(--t2)', fontFamily: 'var(--fm)', whiteSpace: 'nowrap' }}>
                  {avg.toFixed(0)} / 500
                </div>
              </div>
            )
          })}
        </div>

        {/* Daily snapshot */}
        <div className="card">
          <div className="section-title">Daily Snapshot - UPDATING - IN COMMING </div>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-label">Calories Today</div><div><span className="stat-value">375</span><span className="stat-unit">kcal</span></div></div>
            <div className="stat-card"><div className="stat-label">Daily Goal</div><div><span className="stat-value">2,213</span><span className="stat-unit">kcal</span></div></div>
            <div className="stat-card"><div className="stat-label">Protein</div><div><span className="stat-value info">15</span><span className="stat-unit">/ 84g</span></div></div>
            <div className="stat-card accent"><div className="stat-label">Remaining</div><div><span className="stat-value accent">1,838</span><span className="stat-unit">kcal</span></div></div>
          </div>

          <div className="section-title" style={{ marginTop: 4 }}>This Week</div>
          <div className="week-bars">
            {WEEK.map(w => (
              <div key={w.day} className="week-col">
                <div className="week-bar" style={{ background: w.col, height: `${w.h}%` }} />
                <div className={`week-day${w.today ? ' today' : ''}`}>{w.day}</div>
              </div>
            ))}
          </div>
          <div className="snap-legend" style={{ marginTop: 8 }}>
            <span className="snap-dot" style={{ background: 'var(--hi)' }} /> <span style={{ fontSize: 10.5 }}>Within goal</span>
            <span className="snap-dot" style={{ background: 'var(--red)' }} /> <span style={{ fontSize: 10.5 }}>Exceeded</span>
            <span className="snap-dot" style={{ background: 'var(--amber)' }} /> <span style={{ fontSize: 10.5 }}>In progress</span>
          </div>
        </div>
      </div>
    </section>
  )
}
