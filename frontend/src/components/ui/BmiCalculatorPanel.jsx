import { useEffect, useMemo, useRef, useState } from 'react'
import { bmiLabel, calcBmi, calcBmr, calcMacros, calcTdee } from '../../utils/calculations'
import { useAuth } from '../../context/AppContext'
import { updateUserProfile } from '../../services/user_profile/userProfileApi'

const RANGES = { height: { min: 100, max: 250 }, weight: { min: 30, max: 200 }, age: { min: 10, max: 120 } }

export default function BmiCalculatorPanel({ onUpdate, onGoalChange }) {
  const { user, isLoggedIn, token, refreshUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'm',
    activityLevel: '',
    goal: 0,
  })
  const [touched, setTouched] = useState({})
  
  const errors = useMemo(() => {
    const next = {}
    Object.entries(RANGES).forEach(([key, { min, max }]) => {
      const v = Number(form[key])
      if (!v) next[key] = 'Required'
      else if (v < min || v > max) next[key] = `${min}–${max}`
    })
    return next
  }, [form])

  const isValid = Object.keys(errors).length === 0

  const result = useMemo(() => {
    if (!isValid) return null 
    const bmi = calcBmi(form.height, form.weight)
    const bmr = calcBmr({ heightCm: form.height, weightKg: form.weight, age: form.age, gender: form.gender })
    const tdee = calcTdee(bmr, form.activityLevel, form.goal)
    const macros = calcMacros(tdee, form.weight)
    return { bmi, bmr, tdee, macros }
  }, [form, isValid])

  const lastTdeeRef = useRef(null)
  useEffect(() => {
    if (result && isValid && result.tdee !== lastTdeeRef.current) {
      lastTdeeRef.current = result.tdee
      onUpdate?.({ tdee: result.tdee, ...result.macros })
    }
  }, [result, isValid, onUpdate])

  const update = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
    // When goal changes, immediately notify parent with a string label
    if (name === 'goal') {
      const goalStr = Number(value) < 0 ? 'Lose' : Number(value) > 0 ? 'Gain' : 'Maintain'
      onGoalChange?.(goalStr)
    }
  }
  const blur = name => setTouched(prev => ({ ...prev, [name]: true }))

  const label = result ? bmiLabel(result.bmi) : null

  const targetKcal = result ? result.tdee + Number(form.goal) : 0
  const deficitText = Number(form.goal) === 0 ? 'Maintenance' : Number(form.goal) > 0 ? `+${form.goal} Surplus` : `${form.goal} Deficit`
  const deficitColor = Number(form.goal) === 0 ? 'var(--t2)' : Number(form.goal) > 0 ? '#ffc147' : '#6effc4'

  const bmiColor = result ? (result.bmi < 18.5 ? '#5bbcff' : result.bmi < 25 ? '#6effc4' : result.bmi < 30 ? '#ffc147' : '#ff5a5a') : '#6effc4'
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const bmiPct = result ? Math.min(Math.max((result.bmi - 15) / 25, 0), 1) : 0
  const strokeDashoffset = circumference - bmiPct * circumference

  const handleCalculate = () => {
    if (!result || !isValid) return
    onUpdate?.({ tdee: result.tdee, ...result.macros })
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return
    setLoading(true)

    const weight = parseFloat(form.weight)
    const height = parseFloat(form.height)
    const age = parseInt(form.age, 10)

    // Calculate BMR
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (form.gender === 'm' ? 5 : -161);

    let calculatedTdee = Math.round(bmr * Number(form.activityLevel));
    calculatedTdee += Number(form.goal);

    // Calculate Macros
    const protein = Math.round((calculatedTdee * 0.30) / 4);
    const carbs = Math.round((calculatedTdee * 0.35) / 4);
    const fat = Math.round((calculatedTdee * 0.35) / 9);

    onUpdate({ tdee: calculatedTdee, protein, fat, carbs });

    if (user && token) {
      try {
        await updateUserProfile(token, {
          age: age,
          height: height,
          weight: weight,
          gender: form.gender,
          activityLevel: form.activityLevel,
          goal: form.goal
        });

        await refreshUserProfile();
      } catch (error) {
        console.error("Failed to save profile:", error);
      }
    }

    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      <div className="card card-lg">
        <div className="section-title">Your Profile Input</div>
        <form className="form-grid" onSubmit={handleSave}>
          <div className="form-field">
            <label>Height (cm)</label>
            <input
              type="number"
              value={form.height}
              placeholder="175"
              onChange={e => update('height', e.target.value)}
              onBlur={() => blur('height')}
            />
            {touched.height && errors.height && <span className="field-error">{errors.height}</span>}
          </div>
          <div className="form-field">
            <label>Weight (kg)</label>
            <input
              type="number"
              value={form.weight}
              placeholder="70"
              onChange={e => update('weight', e.target.value)}
              onBlur={() => blur('weight')}
            />
            {touched.weight && errors.weight && <span className="field-error">{errors.weight}</span>}
          </div>
          <div className="form-field">
            <label>Age</label>
            <input
              type="number"
              value={form.age}
              placeholder="25"
              onChange={e => update('age', e.target.value)}
              onBlur={() => blur('age')}
            />
            {touched.age && errors.age && <span className="field-error">{errors.age}</span>}
          </div>
          <div className="form-field">
            <label>Gender</label>
            <select value={form.gender} onChange={e => update('gender', e.target.value)}>
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
          </div>
        </form>
        <div className="form-field" style={{ marginTop: 12 }}>
          <label>Activity Level</label>
          <select value={form.activityLevel} onChange={e => update('activityLevel', Number(e.target.value))}>
            <option value={1.2}>Sedentary</option>
            <option value={1.375}>Light (1–3 days/week)</option>
            <option value={1.55}>Moderate (3–5 days/week)</option>
            <option value={1.725}>Very Active</option>
          </select>
        </div>
        <div className="form-field" style={{ marginTop: 12 }}>
          <label>Goal</label>
          <select value={form.goal} onChange={e => update('goal', Number(e.target.value))}>
            <option value={-500}>Lose weight (−500 kcal/day)</option>
            <option value={0}>Maintain weight</option>
            <option value={300}>Gain muscle (+300 kcal/day)</option>
          </select>
        </div>
        
        {isLoggedIn && (
          <button
            type="submit"
            className="btn btn-hi btn-full"
            style={{ marginTop: 16 }}
            disabled={!isValid || loading}
            onClick={handleSave}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>BMI Index</div>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <svg width={80} height={80} viewBox="0 0 80 80">
                <circle cx={40} cy={40} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
                <circle
                  cx={40} cy={40} r={radius} fill="none"
                  stroke={result ? bmiColor : 'var(--ink4)'} strokeWidth={6}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
                {result ? result.bmi : '—'}
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: result ? bmiColor : 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {result && label ? (label?.label || 'Optimal Range') : 'Enter details'}
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontWeight: 600 }}>Daily TDEE</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#6effc4' }}>
                {result ? result.tdee.toLocaleString() : '0'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>kcal</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: 13, marginTop: 16 }}>
              <span style={{ color: 'var(--t3)' }}>BMR</span>
              <span style={{ fontWeight: 600 }}>{result ? Math.round(result.bmr).toLocaleString() : '0'}</span>
              <span style={{ color: 'var(--t3)' }}>Base:</span>
              <span style={{ fontWeight: 600 }}>kcal</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Target Distribution</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              {result ? targetKcal.toLocaleString() : '0'} kcal{' '}
              <span style={{ fontSize: 16, color: 'var(--t2)' }}>/ Day</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: deficitColor }}>{deficitText}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              {
                label: `PROTEIN`,
                g: result ? result.macros.protein : 0,
                kcal: result ? result.macros.protein * 4 : 0,
                col: '#6effc4'
              },
              {
                label: 'CARBOHYDRATES',
                g: result ? result.macros.carbs : 0,
                kcal: result ? result.macros.carbs * 4 : 0,
                col: '#5bbcff'
              },
              {
                label: 'DIETARY FATS',
                g: result ? result.macros.fat : 0,
                kcal: result ? result.macros.fat * 9 : 0,
                col: '#b094ff'
              },
            ].map(m => {
              const pct = targetKcal > 0 ? Math.min(100, Math.round((m.kcal / targetKcal) * 100)) : 0
              return (
                <div key={m.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <span style={{ fontWeight: 500 }}>{m.label}</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{m.g}g / {m.kcal} kcal</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: m.col, borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}