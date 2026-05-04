import { useMemo } from 'react'
import BmiCalculatorPanel from '../components/ui/BmiCalculatorPanel'
import PyramidChart from '../components/charts/PyramidChart'
import { useApp } from '../context/AppContext'

// Added `sample` objects to fuel the hover tooltips
const PYRAMID_TIERS = [
  { 
    label: 'Vegetables', 
    subtitle: ' 3–5 servings · eat most', 
    width: 100, color: '#6effc4', icon: '🥦', 
    sample: { name: 'Avg. Serving (1 cup raw / ½ cup cooked)', calories: '~25-50', protein: '1-3', carbs: '5-10', fat: '<1' } 
  },
  { 
    label: 'Grains', 
    subtitle: ' 6–11 servings', 
    width: 86, color: '#ffd766', icon: '🌾', 
    sample: { name: 'Avg. Serving (1 slice / ½ cup cooked)', calories: '~80-100', protein: '2-4', carbs: '15-20', fat: '1-2' } 
  },
  { 
    label: 'Fruits', 
    subtitle: ' 2–4 servings', 
    width: 70, color: '#ffc147', icon: '🍎', 
    sample: { name: 'Avg. Serving (1 medium / ½ cup chopped)', calories: '~60-80', protein: '<1', carbs: '15-20', fat: '<1' } 
  },
  { 
    label: 'Protein Foods', 
    subtitle: ' 2–3 servings', 
    width: 55, color: '#ff79b0', icon: '🥩', 
    sample: { name: 'Avg. Serving (3 oz meat / ½ cup beans)', calories: '~150-200', protein: '20-25', carbs: '0-15', fat: '5-10' } 
  },
  { 
    label: 'Dairy', 
    subtitle: ' 2–3 servings', 
    width: 40, color: '#5bbcff', icon: '🥛', 
    sample: { name: 'Avg. Serving (1 cup milk / 1.5 oz cheese)', calories: '~100-150', protein: '8-10', carbs: '10-12', fat: '0-8' } 
  },
  { 
    label: 'Fats & Sweets', 
    subtitle: ' Eat sparingly', 
    width: 25, color: '#ff5a5a', icon: '🍩', 
    sample: { name: 'Avg. Serving (1 tbsp oil / small treat)', calories: '~100-150', protein: '0', carbs: '5-15', fat: '10-14' } 
  },
]

export default function Strategy() {
  const { macros, tdee, updateTargets } = useApp()

  // Calculate percentages for the Macro Distribution Bar
  const macroBreakdown = useMemo(() => {
    if (!macros) return { pPct: 30, fPct: 30, cPct: 40 } // fallback
    const pKcal = macros.protein * 4
    const fKcal = macros.fat * 9
    const cKcal = macros.carbs * 4
    const total = pKcal + fKcal + cKcal
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
          <h1>Dietary Strategy & Recommendations</h1>
          <p>BMI-calibrated food pyramid · personalized calorie target · required project feature</p>
        </div>
      </div>

      <div className="grid-strategy">
        <BmiCalculatorPanel onUpdate={updateTargets} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Enhanced Pyramid Card */}
          <div className="card card-lg" style={{ padding: 24 }}>
            <div className="section-title" style={{ marginBottom: 20 }}>Interactive Food Pyramid</div>
            <PyramidChart tiers={PYRAMID_TIERS} />
          </div>

          {/* Macro Composition Card */}
          <div className="card card-lg" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Target Composition</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#6effc4' }}>
                {tdee} <span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>kcal</span>
              </div>
            </div>

            {/* Horizontal Stacked Bar */}
            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 24, gap: 2 }}>
              <div style={{ width: `${macroBreakdown.pPct}%`, background: '#6effc4', transition: 'width 1s ease' }} title="Protein" />
              <div style={{ width: `${macroBreakdown.cPct}%`, background: '#5bbcff', transition: 'width 1s ease' }} title="Carbs" />
              <div style={{ width: `${macroBreakdown.fPct}%`, background: '#b094ff', transition: 'width 1s ease' }} title="Fat" />
            </div>

            {/* Stat Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, borderLeft: '3px solid #6effc4' }}>
                <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Protein ({macroBreakdown.pPct}%)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{macros.protein}<span style={{ fontSize: 12, color: 'var(--t2)' }}>g</span></div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, borderLeft: '3px solid #5bbcff' }}>
                <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Carbs ({macroBreakdown.cPct}%)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{macros.carbs}<span style={{ fontSize: 12, color: 'var(--t2)' }}>g</span></div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, borderLeft: '3px solid #b094ff' }}>
                <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Fat ({macroBreakdown.fPct}%)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 4 }}>{macros.fat}<span style={{ fontSize: 12, color: 'var(--t2)' }}>g</span></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}