import { useMemo, useState } from 'react'
import BeeswarmPlot from '../components/charts/BeeswarmPlot'
import ExerciseHeatmap from '../components/charts/ExerciseHeatmap'
import { useApp } from '../context/AppContext'
import {buildColorMap} from '../config/categoryColors'




export default function Explorer() {
  const { foods, loading, error } = useApp()
  const [nutrient, setNutrient] = useState('fat')
  const [mode, setMode] = useState('overall')
  const [filterCategory, setFilterCategory] = useState('all')

  const categories = useMemo(() => {
    if (!Array.isArray(foods) || foods.length === 0) return []
    return [...new Set(foods.map(food => food.category).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  }, [foods])


  const colorMap = useMemo(() => buildColorMap(categories), [categories])

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
              {cat}
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

      {/* Exercise Heatmap Card */}
      <div className="card card-lg" style={{ marginTop: 24 }}>
        <div className="card-head">
          <div>
            <div className="section-title" style={{ marginBottom: 2 }}>Exercise Calorie Heatmap — Energy by Activity & Body Weight</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>Hover cells for details · Darker colors = more calories burned · Top 25 activities shown</div>
          </div>
        </div>
        <ExerciseHeatmap/>
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

      </div>
    </section>
  )
}
