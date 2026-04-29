import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function CalculatorPage() {
  const { updateTargets } = useApp()
  const [form, setForm] = useState({
    age: 22, gender: 'm', height: 170, weight: 65, activity: 1.375, goal: 0
  })
  const [result, setResult] = useState(null)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const calculate = async () => {
    const res = await fetch('http://localhost:8000/bmr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        age:      Number(form.age),
        gender:   form.gender,
        height:   Number(form.height),
        weight:   Number(form.weight),
        activity: Number(form.activity),
        goal:     Number(form.goal),
      })
    })
    const data = await res.json()
    setResult(data)
    updateTargets({ tdee: data.tdee, protein: data.protein, fat: data.fat, carbs: data.carbs })
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-medium text-gray-800 mb-1">BMI Calculator</h1>
      <p className="text-sm text-gray-400 mb-6">Enter your stats to get personalized daily targets</p>

      <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Age</label>
            <input name="age" type="number" value={form.age} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Height (cm)</label>
            <input name="height" type="number" value={form.height} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Weight (kg)</label>
            <input name="weight" type="number" value={form.weight} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm"/>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Activity level</label>
          <select name="activity" value={form.activity} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="1.2">Sedentary</option>
            <option value="1.375">Lightly active</option>
            <option value="1.55">Moderately active</option>
            <option value="1.725">Very active</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Goal</label>
          <select name="goal" value={form.goal} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="-300">Lose weight (−300 kcal)</option>
            <option value="0">Maintain weight</option>
            <option value="300">Gain muscle (+300 kcal)</option>
          </select>
        </div>

        <button onClick={calculate} className="bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 transition-colors">
          Calculate my targets
        </button>

        {result && (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            {[
              { label: 'BMI',     value: result.bmi },
              { label: 'BMR',     value: Math.round(result.bmr) + ' kcal' },
              { label: 'TDEE',    value: Math.round(result.tdee) + ' kcal' },
              { label: 'Protein', value: result.protein + ' g' },
              { label: 'Fat',     value: result.fat + ' g' },
              { label: 'Carbs',   value: result.carbs + ' g' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                <div className="text-sm font-medium text-gray-800">{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}