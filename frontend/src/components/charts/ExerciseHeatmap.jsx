import { useMemo, useState } from 'react'
import exerciseData from '../../../../data/activities/exercise_dataset.json'

const ExerciseHeatmap = () => {
  const [hoveredBar, setHoveredBar] = useState(null)
  const categories = useMemo(() => Object.keys(exerciseData.exercises || {}), [])
  const [activeCategory, setActiveCategory] = useState(categories.includes('Cardio') ? 'Cardio' : (categories[0] || ''))

  const categoryInfo = {
    'Gym & Strength': { vn_name: 'Tập Luyện Phòng Gym', color: '#6366f1', icon: '💪' },
    'Cardio': { vn_name: 'Cardio - Tim Mạch', color: '#ef4444', icon: '🏃' },
    'Team Sports': { vn_name: 'Thể Thao Tập Thể', color: '#8b5cf6', icon: '⚽' },
    'Individual Sports': { vn_name: 'Thể Thao Cá Nhân', color: '#10b981', icon: '🎾' },
    'Housework': { vn_name: 'Công Việc Nhà', color: '#f59e0b', icon: '🧹' },
  }

  const weights = ['59_kg', '70_kg', '82_kg', '93_kg']
  const weightLabels = { '59_kg': '59kg', '70_kg': '70kg', '82_kg': '82kg', '93_kg': '93kg' }
  const weightColors = {
    '59_kg': '#3b82f6',
    '70_kg': '#10b981',
    '82_kg': '#f97316',
    '93_kg': '#a855f7'
  }

  const processedData = useMemo(() => {
    const exercises = exerciseData.exercises || {}
    const categoryData = exercises[activeCategory]
    if (!categoryData) return { activities: [], maxValue: 0 }

    const activities = categoryData.activities.map(activity => ({
      name: activity.name,
      vn_name: activity.vn_name,
      calories: activity.calories,
    }))

    activities.sort((a, b) => {
      const aAvg = (a.calories['59_kg'] + a.calories['70_kg'] + a.calories['82_kg'] + a.calories['93_kg']) / 4
      const bAvg = (b.calories['59_kg'] + b.calories['70_kg'] + b.calories['82_kg'] + b.calories['93_kg']) / 4
      return bAvg - aAvg
    })

    let maxValue = 0
    activities.forEach(activity => {
      Object.values(activity.calories).forEach(cal => {
        maxValue = Math.max(maxValue, Number(cal) || 0)
      })
    })

    return { activities, maxValue }
  }, [activeCategory])

  const getLuminance = (hex) => {
    const h = hex.replace('#', '')
    const rgb = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
    const r = (rgb >> 16) & 255
    const g = (rgb >> 8) & 255
    const b = rgb & 255
    const a = [r, g, b].map(v => {
      v = v / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
  }

  const heatmapColor = (value) => {
    const baseHex = (categoryInfo[activeCategory]?.color) || '#3b82f6'
    const hex = baseHex.replace('#', '')
    const rgb = parseInt(hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex, 16)
    const r = (rgb >> 16) & 255
    const g = (rgb >> 8) & 255
    const b = rgb & 255
    const t = Math.max(0, Math.min(1, Number(value || 0) / (processedData.maxValue || 1)))
    const nr = 255 * (1 - t * 0.85) + r * (t * 0.85)
    const ng = 255 * (1 - t * 0.85) + g * (t * 0.85)
    const nb = 255 * (1 - t * 0.85) + b * (t * 0.85)
    return `rgb(${Math.round(nr)}, ${Math.round(ng)}, ${Math.round(nb)})`
  }

  const getTextColor = (bgRgb) => {
    const match = bgRgb.match(/\d+/g)
    if (!match || match.length < 3) return 'rgba(0, 0, 0, 0.85)'

    const r = Number(match[0])
    const g = Number(match[1])
    const b = Number(match[2])
    const a = [r, g, b].map(v => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    const lum = 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
    const opacity = 0.55 + lum * 0.45
    return `rgba(0, 0, 0, ${opacity.toFixed(2)})`
  }

  const barScale = processedData.maxValue || 1
  const axisTicks = [0, 400, 800, 1200, 1600]
  const barLabelWidth = 132

  return (
    <div>
      <div className="controls" style={{ alignItems: 'center', display: 'flex', gap: 12, marginBottom: 16 }}>
        <span className="control-label">Category:</span>
        <div className="pill-group">
          {categories.map(cat => (
            <button
              key={cat}
              className={`pill${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
        {categoryInfo[activeCategory]?.icon} {activeCategory} — {categoryInfo[activeCategory]?.vn_name}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {/* LEFT: Heatmap table */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 10, textTransform: 'uppercase' }}>Heat Grid</div>
          <div style={{ overflow: 'auto', maxHeight: '72vh' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ stickyTop: 0, background: 'var(--ink4)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: 'var(--t1)', borderBottom: '1px solid var(--line)' }}>Activity</th>
                  {weights.map(w => (
                    <th key={w} style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: 'var(--t2)', borderBottom: '1px solid var(--line)', minWidth: 72 }}>{weightLabels[w]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {processedData.activities.map((activity, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--ink4)' }}>
                    <td style={{ padding: '8px 10px', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--t1)', fontSize: 10, fontWeight: 600 }} title={activity.name}>
                      {activity.name}
                    </td>
                    {weights.map(w => {
                      const val = Number(activity.calories[w] || 0)
                      const bg = heatmapColor(val)
                      return (
                        <td key={w} style={{ padding: '8px 6px', textAlign: 'center', background: bg, color: getTextColor(bg), fontWeight: 700, fontSize: 10 }}>
                          {val.toFixed(0)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

     
    </div>
  )
}

export default ExerciseHeatmap

