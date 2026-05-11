import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import RadarChart from '../components/charts/RadarChart'
import ProgressRing from '../components/charts/ProgressRing'
import { useApp } from '../context/AppContext'

// Data matched to the 8 spokes: PROTEIN, VITAMIN A, IRON, FATS, FIBER, CALCIUM, MAGNESIUM, CARBS
const MEAL_DATA = [
  [45, 30, 20, 35, 40, 50, 40, 50],  // Breakfast
  [60, 50, 45, 55, 60, 70, 55, 65],  // Lunch
  [82, 70, 50, 48, 95, 60, 55, 64],  // Dinner
  [95, 85, 80, 75, 90, 85, 80, 88],  // Full Day
]

const MACROS = [
  { label: 'Protein', val: 15, max: 84, col: '#60a5fa' },
  { label: 'Fat', val: 25, max: 63, col: '#fbbf24' },
  { label: 'Carbohydrates', val: 38, max: 276, col: '#f472b6' },
  { label: 'Fiber', val: 4, max: 28, col: '#34d399' },
]

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEK_ACTUAL = [2100, 1950, 2400, 1800, 2213, 2050, 375]
const TARGET = 2213

// ── No-data placeholder for guest users ──────────────────────
function GuestChartPlaceholder({ title, height = 200 }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height, background: 'rgba(255,255,255,0.02)', borderRadius: 12,
      border: '1px dashed rgba(255,255,255,0.08)', gap: 12
    }}>
      <div style={{ fontSize: 32, opacity: 0.3 }}>📊</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#e5e7eb', fontWeight: 600, marginBottom: 4 }}>
          {title} — No Data
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          Log in to see your personalized analytics
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Link to="/login" style={{
            padding: '6px 16px', background: '#6effc4', color: '#0b0d14',
            borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none'
          }}>
            Sign In
          </Link>
          <Link to="/register" style={{
            padding: '6px 16px', background: 'transparent', color: '#6effc4',
            border: '1px solid #6effc4', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none'
          }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}

function LineChart() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.offsetWidth || 400
    canvas.width = W
    const ctx = canvas.getContext('2d')
    const H = canvas.height
    const ml = 36, mr = 12, mt = 14, mb = 24
    const pw = W - ml - mr, ph = H - mt - mb, maxV = 2800
    ctx.clearRect(0, 0, W, H)

    // Grid
    ;[700, 1400, 2100, 2800].forEach(v => {
      const y = mt + ph - (v / maxV) * ph
      ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.moveTo(ml, y); ctx.lineTo(W - mr, y); ctx.stroke()
      ctx.fillStyle = '#505368'; ctx.font = '9px Bricolage Grotesque'; ctx.textAlign = 'right'
      ctx.fillText((v / 1000).toFixed(1) + 'k', ml - 3, y + 3)
    })

    // Target line
    const ty = mt + ph - (TARGET / maxV) * ph
    ctx.beginPath(); ctx.setLineDash([4, 4]); ctx.strokeStyle = '#505368'; ctx.lineWidth = 1
    ctx.moveTo(ml, ty); ctx.lineTo(W - mr, ty); ctx.stroke(); ctx.setLineDash([])

    // Area fill
    ctx.beginPath()
    WEEK_ACTUAL.forEach((v, i) => {
      const x = ml + (i / (WEEK_DAYS.length - 1)) * pw
      const y = mt + ph - (v / maxV) * ph
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.lineTo(W - mr, mt + ph); ctx.lineTo(ml, mt + ph); ctx.closePath()
    ctx.fillStyle = 'rgba(91,188,255,.08)'; ctx.fill()

    // Line
    ctx.beginPath()
    WEEK_ACTUAL.forEach((v, i) => {
      const x = ml + (i / (WEEK_DAYS.length - 1)) * pw
      const y = mt + ph - (v / maxV) * ph
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke()

    // Dots + labels
    WEEK_ACTUAL.forEach((v, i) => {
      const x = ml + (i / (WEEK_DAYS.length - 1)) * pw
      const y = mt + ph - (v / maxV) * ph
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#60a5fa'; ctx.fill()
      ctx.strokeStyle = '#0b0d14'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.fillStyle = '#505368'; ctx.font = '9px Bricolage Grotesque'
      ctx.textAlign = 'center'; ctx.fillText(WEEK_DAYS[i], x, H - 5)
    })
  }, [])
  return <canvas ref={canvasRef} height={175} style={{ width: '100%', display: 'block' }} />
}

function RDIAlignment({ values }) {
  const protein = values[0] || 0;
  const lipids = values[3] || 0;
  const carbs = values[7] || 0;
  const micros = Math.round(((values[1]||0) + (values[2]||0) + (values[5]||0) + (values[6]||0)) / 4);

  const ALIGNMENT_DATA = [
    { label: 'PROTEIN', pct: protein, color: '#34d399' },
    { label: 'CARBOHYDRATES', pct: carbs, color: '#60a5fa' },
    { label: 'LIPIDS', pct: lipids, color: '#c084fc' },
    { label: 'MICROS (AVG)', pct: micros, color: '#34d399' },
  ]

  return (
    <div style={{ background: '#0b0f19', padding: '24px', borderRadius: '12px', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#e5e7eb' }}>RDI Alignment</h3>
        <span style={{ color: '#4b5563', letterSpacing: '2px', cursor: 'pointer' }}>•••</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', flexGrow: 1 }}>
        {ALIGNMENT_DATA.map((item) => (
          <div key={item.label}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '10px',
              fontFamily: '"Space Mono", monospace', color: '#d1d5db'
            }}>
              <span>{item.label}</span>
              <span>{item.pct}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(item.pct, 100)}%`, height: '100%', background: item.color,
                borderRadius: '2px', boxShadow: `0 0 8px ${item.color}80`
              }} />
            </div>
          </div>
        ))}
      </div>

      <button style={{
        width: '100%', marginTop: '36px', padding: '14px', background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#9ca3af',
        fontSize: '12px', fontFamily: '"Space Mono", monospace', letterSpacing: '1px',
        cursor: 'pointer', transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}
      onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
      >
        VIEW DEEP BREAKDOWN
      </button>
    </div>
  )
}

export default function Analysis() {
  const {  isAuthenticated } = useApp()
  const [mealIdx, setMealIdx] = useState(2)
  const values = MEAL_DATA[mealIdx]
  const MEAL_LABELS = ['Breakfast', 'Lunch', 'Dinner', 'Full Day']

  return (
    <section className="page" style={{ background: '#050505', color: '#fff', padding: '24px', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div className="page-head" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Meal Balance Analysis</h1>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
            Multivariate nutritional profiling · 8-spoke radar · 7-day calorie trend
            {!isAuthenticated && (
              <span style={{ marginLeft: 10, color: '#ffc147', fontSize: 12 }}>
                — Guest Mode: charts show sample data only
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Meal selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#6b7280', alignSelf: 'center', marginRight: '8px' }}>Timeline Filter:</span>
        {MEAL_LABELS.map((lbl, i) => (
          <button
            key={lbl}
            style={{
              background: mealIdx === i ? '#34d399' : 'transparent',
              color: mealIdx === i ? '#000' : '#d1d5db',
              border: `1px solid ${mealIdx === i ? '#34d399' : '#374151'}`,
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px',
              cursor: 'pointer', fontWeight: mealIdx === i ? '600' : '400', transition: 'all 0.2s ease'
            }}
            onClick={() => setMealIdx(i)}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Radar + RDI — guest sees no-data placeholder */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {isAuthenticated ? (
          <>
            <RadarChart values={values} />
            <RDIAlignment values={values} />
          </>
        ) : (
          <>
            <GuestChartPlaceholder title="Radar — Nutritional Profile" height={340} />
            <GuestChartPlaceholder title="RDI Alignment" height={340} />
          </>
        )}
      </div>

      {/* 7-day line + macro snapshot — guest sees no-data */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* 7-Day Trend */}
        <div style={{ background: '#0b0f19', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#e5e7eb', marginBottom: '16px' }}>7-Day Calorie Trend</div>
          {isAuthenticated ? (
            <>
              <LineChart />
              <div style={{ display: 'flex', gap: 14, marginTop: 16, fontSize: 11, color: '#9ca3af' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 18, height: 2, background: '#60a5fa' }} /> Actual intake</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 18, height: 0, borderTop: '2px dashed #4b5563' }} /> Daily target</span>
              </div>
            </>
          ) : (
            <GuestChartPlaceholder title="7-Day Calorie Trend" height={180} />
          )}
        </div>

        {/* Macro snapshot */}
        <div style={{ background: '#0b0f19', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#e5e7eb', marginBottom: '16px' }}>Macro Balance Snapshot</div>
          {isAuthenticated ? (
            <>
              <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MACROS.map(m => {
                  const pct = Math.round((m.val / m.max) * 100)
                  return (
                    <div key={m.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span style={{ color: m.col }}>{m.label}</span>
                        <span style={{ color: '#d1d5db' }}>{m.val} / {m.max}g · <b style={{ color: m.col }}>{pct}%</b></span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                        <div style={{ background: m.col, width: `${Math.min(pct, 100)}%`, height: '100%', borderRadius: '2px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#e5e7eb', marginBottom: '12px' }}>Calorie Progress</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ProgressRing value={375} max={TARGET} size={70} stroke={6} color="#fbbf24" />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>375 <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>/ {TARGET} kcal</span></div>
                  <div style={{ color: '#34d399', fontSize: 12, marginTop: 3 }}>{TARGET - 375} kcal remaining today</div>
                  <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{Math.round(375 / TARGET * 100)}% of daily goal</div>
                </div>
              </div>
            </>
          ) : (
            <GuestChartPlaceholder title="Macro Balance Snapshot" height={220} />
          )}
        </div>
      </div>
    </section>
  )
}