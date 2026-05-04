/**
 * nutrients.js
 * Nutrient metadata for consistent labels/units/formatting.
 * Keep this as the "UI contract" for nutrients.
 */

export const NUTRIENT_META = {
  calories:     { label: 'Calories',     unit: 'kcal', decimals: 0 },
  protein:      { label: 'Protein',      unit: 'g',   decimals: 1 },
  fat:          { label: 'Fat',          unit: 'g',   decimals: 1 },
  carbs:        { label: 'Carbs',        unit: 'g',   decimals: 1 },
  fiber:        { label: 'Fiber',        unit: 'g',   decimals: 1 },
  sugar:        { label: 'Sugar',        unit: 'g',   decimals: 1 },
  sodium:       { label: 'Sodium',       unit: 'mg',  decimals: 0 },
  cholesterol:  { label: 'Cholesterol',  unit: 'mg',  decimals: 0 },
}

/**
 * Returns numeric keys that exist in the dataset.
 * (Any key that is numeric in at least one food item.)
 */
export function getNumericKeysFromFoods(foods) {
  if (!Array.isArray(foods) || foods.length === 0) return []

  const keys = new Set()
  for (const f of foods) {
    for (const [k, v] of Object.entries(f)) {
      if (typeof v === 'number' && !Number.isNaN(v)) keys.add(k)
    }
  }
  return [...keys]
}

/**
 * Nutrients suitable for "bubble size" (exclude calories because it's X-axis).
 * If you want strict control, keep only keys that exist in NUTRIENT_META.
 */
export function getSizeByOptions(foods, { strict = true } = {}) {
  const numericKeys = getNumericKeysFromFoods(foods).filter(k => k !== 'calories')

  const filtered = strict
    ? numericKeys.filter(k => Boolean(NUTRIENT_META[k]))
    : numericKeys

  return filtered.map(key => ({
    key,
    label: NUTRIENT_META[key]?.label ?? key,
    unit: NUTRIENT_META[key]?.unit ?? '',
  }))
}

/**
 * Format a nutrient value using metadata (decimals + unit).
 */
export function formatNutrientValue(key, value) {
  const meta = NUTRIENT_META[key]
  if (!meta) return String(value ?? '')

  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return `0 ${meta.unit}`.trim()

  const fixed =
    typeof meta.decimals === 'number' ? n.toFixed(meta.decimals) : String(n)

  return `${meta.label}: ${fixed} ${meta.unit}`.trim()
}