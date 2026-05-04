import { useState } from 'react'
import ProgressRing from '../components/charts/ProgressRing'
import RadarChart from '../components/charts/RadarChart'
import { useApp } from '../context/AppContext'

const MEAL_LOG = [
  {
    id: 'breakfast', label: 'Breakfast', kcal: 148, color: 'var(--amber)', open: true,
    foods: [
      { name: 'Spinach (50g)', kcal: '12 kcal', macro: 'P:1.4 F:0.2 C:1.7g', col: '#6effc4' },
      { name: 'Oatmeal (100g)', kcal: '136 kcal', macro: 'P:4.7 F:2.6 C:24g', col: '#ffd766' },
    ]
  },
  {
    id: 'lunch', label: 'Lunch', kcal: 227, color: 'var(--teal)', open: true,
    foods: [
      { name: 'Phở Bò (350g)', kcal: '227 kcal', macro: 'P:18 F:6 C:26g', col: '#2ee8c8' },
    ]
  },
  {
    id: 'dinner', label: 'Dinner', kcal: 0, color: 'var(--blue)', open: false, foods: [] },
]

const RECS = [
  { name: 'Chicken Breast', sub: '+38g protein · 165 kcal' },
  { name: 'Brown Rice', sub: '+45g carbs · 123 kcal' },
  { name: 'Cơm tấm (200g)', sub: '+32g carbs · 280 kcal' },
  { name: 'Greek Yogurt', sub: '+17g protein · 97 kcal' },
  { name: 'Almonds (30g)', sub: '+6g protein · 173 kcal' },
]

const ALMOND_RADAR = [80, 65, 30, 88, 20, 95, 55, 40]

export default function Planner() {
  const { consumed, macros, tdee } = useApp()
  const remaining = Math.max(0, tdee - consumed.kcal)
  const [openMeals, setOpenMeals] = useState(() => {
    const state = {}
    MEAL_LOG.forEach(m => { state[m.id] = m.open })
    return state
  })

  const toggleMeal = id => setOpenMeals(prev => ({ ...prev, [id]: !prev[id] }))

  const macroPairs = [
    { label: 'Protein', val: consumed.protein, max: macros.protein, col: 'var(--blue)' },
    { label: 'Fat', val: consumed.fat, max: macros.fat, col: 'var(--amber)' },
    { label: 'Carbs', val: consumed.carbs, max: macros.carbs, col: 'var(--pink)' },
  ]

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>Automated Meal Construction & Food Detail</h1>
          <p>Gap-filling algorithm · food detail deep dive · stretch goal AI integration mockup</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: '5px 10px' }}>←</button>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Wednesday, 23 Apr 2026</div>
          <button className="btn btn-ghost" style={{ padding: '5px 10px' }}>→</button>
          <span className="badge warn" style={{ marginLeft: 8 }}>🔥 5 day streak</span>
        </div>
      </div>

      {/* Top row: ring + macros + AI */}
      <div className="grid-three">
        {/* Progress ring */}
        <div className="card">
          <div className="section-title">Daily Progress Ring</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <ProgressRing value={consumed.kcal} max={tdee} size={96} stroke={10} color="var(--amber)" />
            <div>
              <div style={{ fontSize: 12.5, color: 'var(--t2)' }}>Goal: <b style={{ color: 'var(--t1)' }}>{tdee} kcal</b></div>
              <div style={{ color: 'var(--hi)', fontSize: 13, fontWeight: 700, marginTop: 3 }}>{remaining} remaining</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>{Math.round(consumed.kcal / tdee * 100)}% complete</div>
            </div>
          </div>
        </div>

        {/* Live macro bars */}
        <div className="card">
          <div className="section-title">Live Macro Progress</div>
          {macroPairs.map(m => {
            const pct = Math.round(m.val / m.max * 100)
            const over = pct > 100
            return (
              <div key={m.label} className="bar-row">
                <div className="bar-meta">
                  <span style={{ color: m.col }}>{m.label}</span>
                  <span style={{ color: over ? 'var(--red)' : 'inherit' }}>{m.val}/{m.max}g · {pct}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ background: over ? 'var(--red)' : m.col, width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* AI mockup */}
        <div className="card">
          <div className="section-title">Future AI Integration (Stretch Goal)</div>
          <div className="ai-box">
            <div className="ai-icon">📷</div>
            <div className="ai-title">Snap Your Plate</div>
            <div className="ai-text">AI food recognition will detect items and auto-fill your tracker</div>
            <div className="ai-cta">Coming Soon — Upload Photo</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
            <span className="itag">🤖 OpenCV / YOLO architecture planned</span>
            <span className="itag">📱 mobile camera integration</span>
          </div>
        </div>
      </div>

      {/* Main log + recommendations */}
      <div className="grid-planner">
        {/* Left: meal log + food detail */}
        <div>
          <div className="section-title" style={{ marginBottom: 10 }}>Meal Log</div>
          {MEAL_LOG.map(meal => (
            <div key={meal.id} className="meal-section">
              <div className="meal-header" onClick={() => toggleMeal(meal.id)}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: meal.color }} />
                <div className="meal-name">{meal.label}</div>
                <div className="meal-kcal">{meal.kcal} kcal</div>
                <div className={`meal-chevron${openMeals[meal.id] ? ' open' : ''}`}>▼</div>
              </div>
              {openMeals[meal.id] && (
                <div className="meal-body">
                  {meal.foods.map(food => (
                    <div key={food.name} className="food-row">
                      <div className="food-dot" style={{ background: food.col }} />
                      <div className="food-name">{food.name}</div>
                      <div className="food-cals">{food.kcal} · {food.macro}</div>
                    </div>
                  ))}
                  <input type="text" placeholder={`+ Add food to ${meal.label}…`} style={{ marginTop: 4, fontSize: 12 }} />
                </div>
              )}
            </div>
          ))}

          <hr className="divider" />

          {/* Food detail */}
          <div className="section-title" style={{ marginBottom: 10 }}>Food Detail — Almonds</div>
          <div className="grid-two" style={{ gap: 12 }}>
            <div className="card">
              <div className="badge" style={{ background: 'rgba(224,123,26,.18)', color: '#e07b1a', marginBottom: 8 }}>
                <div className="bdot" style={{ background: '#e07b1a' }} /> Nuts
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.3, marginBottom: 2 }}>Almonds</div>
              <div style={{ color: '#e07b1a', fontSize: 22, fontWeight: 800 }}>5.76 <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 400 }}>cal/g</span></div>
              <hr className="divider" />
              <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 8 }}>
                Serving: <b style={{ color: 'var(--hi)' }}>100g</b> = <b>576 kcal</b>
              </div>
              <button className="btn btn-hi btn-full" style={{ marginTop: 4 }}>+ Add to Today</button>
            </div>
            <div className="card">
              <div className="section-title">In Nuts Category</div>
              <div className="grid-two" style={{ gap: 7 }}>
                {[['Cashews', '5.53', '-0.23', 'var(--hi)'], ['Walnuts', '6.54', '+0.78', 'var(--red)'], ['Peanuts', '5.67', '-0.09', 'var(--hi)'], ['Pistachio', '5.57', '-0.19', 'var(--hi)']].map(([n, v, d, c]) => (
                  <div key={n} className="sim-card">
                    <div className="sim-name">{n}</div>
                    <div className="sim-val">{v} <span style={{ color: c }}>{d}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: recommendations + radar */}
        <div>
          <div className="section-title" style={{ marginBottom: 10 }}>Algorithmic Recommendations</div>
          {RECS.map(rec => (
            <div key={rec.name} className="rec-card">
              <div className="rec-info">
                <div className="rec-name">{rec.name}</div>
                <div className="rec-sub">{rec.sub}</div>
              </div>
              <button className="rec-add">+ Add</button>
            </div>
          ))}

          <hr className="divider" />
          <div className="section-title" style={{ marginBottom: 8 }}>Food Detail Radar</div>
          <RadarChart values={ALMOND_RADAR} color="#ff79b0" fillColor="rgba(255,121,176,0.2)" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', fontSize: 10.5, marginTop: 6 }}>
            <span style={{ color: 'var(--pink)' }}>■ Almonds</span>
            <span style={{ color: 'var(--teal)' }}>-- RDI</span>
          </div>
        </div>
      </div>
    </section>
  )
}