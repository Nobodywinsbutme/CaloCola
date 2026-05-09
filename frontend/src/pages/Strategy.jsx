import { useMemo, useState } from 'react'
import BmiCalculatorPanel from '../components/ui/BmiCalculatorPanel'
import PyramidChart from '../components/charts/PyramidChart'
import { useAuth } from '../context/AppContext'
import { useFoodRecommendations } from '../hooks/useFoodRecommendations'
import { PYRAMID_TIERS } from '../config/foodCategories'

// ── Goal display config ─────────────────────────────────────
const GOAL_LABELS = {
  Lose:     { badge: 'LOSE',     color: '#6effc4', text: 'Cutting — high protein, low density' },
  Maintain: { badge: 'MAINTAIN', color: '#5bbcff', text: 'Balanced — nutrient-dense whole foods' },
  Gain:     { badge: 'GAIN',     color: '#ffc147', text: 'Bulking — calorie-dense, protein-rich' },
}

// ── Strategy page ─────────────────────────────────────────────
export default function Strategy() {
  const { macros, tdee, updateTargets, user, foods } = useAuth()

  // ── Live goal from the BMI panel dropdown (updates without Save) ──
  // Initialized from the saved user profile if available, otherwise null.
  const [localGoal, setLocalGoal] = useState(
    user?.profile?.goal || null  // 'Lose' | 'Maintain' | 'Gain' | null
  )

  // Active goal = local override > saved profile > null (guest)
  const activeGoal = localGoal || user?.profile?.goal || null
  const goalConfig = GOAL_LABELS[activeGoal] || null

  // Build food lists per tier, sorted by scoring for the active goal.
  // localGoal makes this recompute instantly on dropdown change.
  const tierFoods = useFoodRecommendations(foods, user, localGoal)

  // Macro percentage breakdown
  const macroBreakdown = useMemo(() => {
    if (!macros) return { pPct: 0, fPct: 0, cPct: 0 }
    const pKcal = macros.protein * 4
    const fKcal = macros.fat * 9
    const cKcal = macros.carbs * 4
    const total = pKcal + fKcal + cKcal
    if (total === 0) return { pPct: 0, fPct: 0, cPct: 0 }
    return {
      pPct: Math.round((pKcal / total) * 100) || 0,
      fPct: Math.round((fKcal / total) * 100) || 0,
      cPct: Math.round((cKcal / total) * 100) || 0,
    }
  }, [macros])

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>Dietary Strategy &amp; Recommendations</h1>
          <p>Personalized pyramid · calorie target · macro breakdown</p>
        </div>
      </div>

      <div className="grid-strategy">
        {/* Left column: BMI input — pass onGoalChange to get live goal updates */}
        <BmiCalculatorPanel onUpdate={updateTargets} onGoalChange={setLocalGoal} />

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Interactive food pyramid */}
          <div className="card card-lg" style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 20 }}>
              Interactive Food Pyramid
              {goalConfig && (
                <span style={{
                  marginLeft: 10,
                  fontSize: 10,
                  fontWeight: 700,
                  color: goalConfig.color,
                  background: `${goalConfig.color}18`,
                  border: `1px solid ${goalConfig.color}40`,
                  borderRadius: 20,
                  padding: '2px 10px',
                  letterSpacing: 1,
                  verticalAlign: 'middle',
                  transition: 'all 0.3s ease',
                }}>
                  {goalConfig.badge} MODE
                </span>
              )}
            </div>
            <PyramidChart tiers={PYRAMID_TIERS} tierFoods={tierFoods} />
            <div style={{
              marginTop: 14,
              fontSize: 11,
              color: 'var(--t3)',
              textAlign: 'center',
            }}>
              {goalConfig
                ? `Hover to preview · Click to see ${goalConfig.text.toLowerCase()} recommendations`
                : 'Hover để xem gợi ý · Click để mở chi tiết — đặt mục tiêu để cá nhân hóa'
              }
            </div>
          </div>

          {/* Target composition */}
          <div className="card card-lg" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Target Composition</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#6effc4' }}>
                {tdee || 0} <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>kcal</span>
              </div>
            </div>

            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 24, gap: 2 }}>
              <div style={{ width: `${macroBreakdown.pPct}%`, background: '#6effc4', transition: 'width 1s ease' }} title="Protein" />
              <div style={{ width: `${macroBreakdown.cPct}%`, background: '#5bbcff', transition: 'width 1s ease' }} title="Carbs" />
              <div style={{ width: `${macroBreakdown.fPct}%`, background: '#b094ff', transition: 'width 1s ease' }} title="Fat" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Protein', pct: macroBreakdown.pPct, value: macros?.protein, color: '#6effc4' },
                { label: 'Carbs',   pct: macroBreakdown.cPct, value: macros?.carbs,   color: '#5bbcff' },
                { label: 'Fat',     pct: macroBreakdown.fPct, value: macros?.fat,     color: '#b094ff' },
              ].map(({ label, pct, value, color }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: 12,
                  borderRadius: 8,
                  borderLeft: `3px solid ${color}`,
                }}>
                  <div style={{
                    fontSize: 10, color: 'var(--t3)',
                    textTransform: 'uppercase', fontWeight: 600,
                    letterSpacing: 0.5,
                  }}>
                    {label} ({pct}%)
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>
                    {value || 0}<span style={{ fontSize: 12, color: 'var(--t2)' }}>g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}