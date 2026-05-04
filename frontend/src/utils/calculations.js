export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const calcBmi = (heightCm, weightKg) => {
  const heightM = Number(heightCm) / 100
  if (!heightM) return 0
  return Number((Number(weightKg) / (heightM * heightM)).toFixed(1))
}

export const calcBmr = ({ heightCm, weightKg, age, gender }) => {
  const w = Number(weightKg)
  const h = Number(heightCm)
  const a = Number(age)
  const base = 10 * w + 6.25 * h - 5 * a
  return gender === 'f' ? base - 161 : base + 5
}

export const calcTdee = (bmr, activity, goalOffset) => {
  return Math.round(bmr * Number(activity) + Number(goalOffset))
}

export const calcMacros = (tdee, weightKg) => {
  const protein = Math.round(Number(weightKg) * 1.5)
  const fat = Math.round((Number(tdee) * 0.3) / 9)
  const carbs = Math.round((Number(tdee) - protein * 4 - fat * 9) / 4)
  return { protein, fat, carbs }
}

export const bmiLabel = bmi => {
  if (bmi < 18.5) return { label: 'Underweight', tone: 'info' }
  if (bmi < 25) return { label: 'Normal', tone: 'good' }
  if (bmi < 30) return { label: 'Overweight', tone: 'warn' }
  return { label: 'Obese', tone: 'bad' }
}
