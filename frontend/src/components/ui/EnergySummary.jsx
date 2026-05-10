import { useRef, useState } from 'react'
import ProgressRing from '../charts/ProgressRing'
import { useApp } from '../../context/AppContext'

function SegmentedRing({
  segments,
  size = 110,
  stroke = 10,
  label = 'kcal',
  value = 0,
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const rawTotal = segments.reduce((sum, seg) => sum + Math.max(0, seg.value), 0)
  const total = rawTotal > 0 ? rawTotal : 1
  const gap = 2
  const totalGap = gap * segments.length
  const usable = Math.max(1, circumference - totalGap)
  let cumulative = 0

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--ink4)" strokeWidth={stroke} fill="none" />
        {segments.map((seg, idx) => {
          const segValue = Math.max(0, seg.value)
          const segLength = usable * (segValue / total)
          const dashArray = `${segLength} ${circumference - segLength}`
          const dashOffset = -cumulative
          cumulative += segLength + gap

          return (
            <circle
              key={`${seg.label}-${idx}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={seg.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )
        })}
      </svg>
      <div className="ring-center">
        <div className="ring-value">{Math.round(value)}</div>
        <div className="ring-sub">{label}</div>
      </div>
    </div>
  )
}

export default function EnergySummary() {
  const { consumed, tdee, macros } = useApp()
  const cardRef = useRef(null)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '', items: [] })
  const remaining = Math.max(0, tdee - consumed.kcal)

  const proteinCals = Math.max(0, consumed.protein * 4)
  const carbCals = Math.max(0, consumed.carbs * 4)
  const fatCals = Math.max(0, consumed.fat * 9)

  const bmr = Math.round(tdee * 0.6)
  const activity = Math.round(tdee * 0.22)
  const exercise = Math.round(tdee * 0.12)
  const goal = Math.max(0, tdee - (bmr + activity + exercise))
  const expenditureTotal = bmr + activity + exercise + goal

  const proteinPct = macros.protein ? Math.min(100, Math.round(consumed.protein / macros.protein * 100)) : 0
  const carbPct = macros.carbs ? Math.min(100, Math.round(consumed.carbs / macros.carbs * 100)) : 0
  const fatPct = macros.fat ? Math.min(100, Math.round(consumed.fat / macros.fat * 100)) : 0

  const consumedTotal = proteinCals + carbCals + fatCals
  const expTotal = expenditureTotal || 1

  const consumedTooltip = {
    title: 'Calories Consumed (kcal)',
    items: [
      { label: 'Protein', value: proteinCals, pct: consumedTotal ? Math.round(proteinCals / consumedTotal * 100) : 0, color: 'var(--hi)' },
      { label: 'Carbs', value: carbCals, pct: consumedTotal ? Math.round(carbCals / consumedTotal * 100) : 0, color: 'var(--blue)' },
      { label: 'Fat', value: fatCals, pct: consumedTotal ? Math.round(fatCals / consumedTotal * 100) : 0, color: 'var(--red)' },
    ],
  }

  const expenditureTooltip = {
    title: 'Energy Expenditure (kcal)',
    items: [
      { label: 'BMR', value: bmr, pct: Math.round(bmr / expTotal * 100), color: 'var(--purp)' },
      { label: 'Activity', value: activity, pct: Math.round(activity / expTotal * 100), color: 'var(--teal)' },
      { label: 'Exercise', value: exercise, pct: Math.round(exercise / expTotal * 100), color: 'var(--amber)' },
      { label: 'Goal', value: goal, pct: Math.round(goal / expTotal * 100), color: 'var(--cn)' },
    ],
  }

  const remainingTooltip = {
    title: 'Remaining (kcal)',
    items: [
      { label: 'Target', value: tdee, pct: 100, color: 'var(--t3)' },
      { label: 'Consumed', value: consumed.kcal, pct: tdee ? Math.round(consumed.kcal / tdee * 100) : 0, color: 'var(--t2)' },
      { label: 'Remaining', value: remaining, pct: tdee ? Math.round(remaining / tdee * 100) : 0, color: 'var(--ink5)' },
    ],
  }

  const moveTooltip = (event) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip((prev) => ({
      ...prev,
      visible: true,
      x: event.clientX - rect.left + 12,
      y: event.clientY - rect.top + 12,
    }))
  }

  const showTooltip = (event, data) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({
      visible: true,
      title: data.title,
      items: data.items,
      x: event.clientX - rect.left + 12,
      y: event.clientY - rect.top + 12,
    })
  }

  const hideTooltip = () => setTooltip((prev) => ({ ...prev, visible: false }))

  return (
    <div ref={cardRef} className="card energy-summary" style={{ padding: 14 }}>
      <div className="energy-summary-layout">
        <div className="energy-rings">
          <div
            className="energy-ring-item"
            onMouseEnter={(event) => showTooltip(event, consumedTooltip)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          >
            <SegmentedRing
              value={consumed.kcal}
              size={110}
              segments={[
                { label: 'Protein', value: proteinCals, color: 'var(--hi)' },
                { label: 'Carbs', value: carbCals, color: 'var(--blue)' },
                { label: 'Fat', value: fatCals, color: 'var(--red)' },
              ]}
            />
            <div className="energy-ring-label">Consumed</div>
          </div>

          <div
            className="energy-ring-item"
            onMouseEnter={(event) => showTooltip(event, expenditureTooltip)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          >
            <SegmentedRing
              value={expenditureTotal}
              size={110}
              segments={[
                { label: 'BMR', value: bmr, color: 'var(--purp)' },
                { label: 'Activity', value: activity, color: 'var(--teal)' },
                { label: 'Exercise', value: exercise, color: 'var(--amber)' },
                { label: 'Goal', value: goal, color: 'var(--cn)' },
              ]}
            />
            <div className="energy-ring-label">Expenditure</div>
          </div>

          <div
            className="energy-ring-item"
            onMouseEnter={(event) => showTooltip(event, remainingTooltip)}
            onMouseMove={moveTooltip}
            onMouseLeave={hideTooltip}
          >
            <ProgressRing value={remaining} max={tdee || 1} size={110} stroke={10} color="var(--ink5)" />
            <div className="energy-ring-label">Remaining</div>
          </div>
        </div>

        <div className="energy-targets">
          <div className="energy-targets-head">
            <div className="energy-targets-title">Targets</div>
            <div className="energy-targets-meta">Consumed</div>
          </div>

          <div className="energy-target-row">
            <div className="energy-target-name">Energy</div>
            <div className="energy-target-value">{consumed.kcal} / {tdee} kcal</div>
            <div className="energy-target-pct">{tdee ? Math.round(consumed.kcal / tdee * 100) : 0}%</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${tdee ? Math.min(100, Math.round(consumed.kcal / tdee * 100)) : 0}%`, background: 'var(--ink5)' }} />
            </div>
          </div>

          <div className="energy-target-row">
            <div className="energy-target-name">Protein</div>
            <div className="energy-target-value">{consumed.protein} / {macros.protein} g</div>
            <div className="energy-target-pct">{proteinPct}%</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${proteinPct}%`, background: 'var(--hi)' }} />
            </div>
          </div>

          <div className="energy-target-row">
            <div className="energy-target-name">Net Carbs</div>
            <div className="energy-target-value">{consumed.carbs} / {macros.carbs} g</div>
            <div className="energy-target-pct">{carbPct}%</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${carbPct}%`, background: 'var(--blue)' }} />
            </div>
          </div>

          <div className="energy-target-row">
            <div className="energy-target-name">Fat</div>
            <div className="energy-target-value">{consumed.fat} / {macros.fat} g</div>
            <div className="energy-target-pct">{fatPct}%</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${fatPct}%`, background: 'var(--red)' }} />
            </div>
          </div>
        </div>
      </div>

      {tooltip.visible && (
        <div
          className="energy-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="energy-tooltip-title">{tooltip.title}</div>
          <div className="energy-tooltip-list">
            {tooltip.items.map((item, idx) => (
              <div key={`${item.label}-${idx}`} className="energy-tooltip-row">
                <span className="energy-tooltip-name">
                  <span className="energy-tooltip-dot" style={{ background: item.color }} />
                  {item.label}
                </span>
                <span className="energy-tooltip-value">{Math.round(item.value)} · {item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
