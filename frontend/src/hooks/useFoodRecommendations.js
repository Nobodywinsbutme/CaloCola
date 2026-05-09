/**
 * useFoodRecommendations.js
 * --------------------------------------------------------------
 * Custom hook that returns food recommendations tailored to the
 * user's goal (if logged in) or the healthiest foods in the DB
 * (if guest). Foods are grouped by pyramid tier.
 *
 * Scoring formulas follow the spec exactly:
 *
 *  Energy_Density   = food.calories / 100
 *  Protein_Density  = (food.protein * 4) / food.calories   (0-1 ratio)
 *
 *  Lose:     Score = (Protein_Density * 100) - (Energy_Density * 15)
 *  Gain:     Score = (Protein_Density * 80)  + (Energy_Density * 10)
 *  Maintain: Score = (Protein_Density * 50)
 *            if Energy_Density > 3.5 → Score -= 10
 *
 * Extensible: to change recommendation logic, only edit this file.
 * --------------------------------------------------------------
 */
import { useMemo } from 'react'
import { PYRAMID_TIERS, categoryToTierId, getTierById, getIconForTier } from '../config/foodCategories'

// ── Category-level derived metrics ───────────────────────────
/**
 * Energy_Density = calories / 100  (kcal per gram)
 * Protein_Density = (protein_g * 4) / calories  (fraction of cals from protein)
 */
export function calcEnergyDensity(calories) {
  return (calories || 0) / 100
}

export function calcProteinDensity(protein, calories) {
  if (!calories || calories <= 0) return 0
  return (protein * 4) / calories
}

// ── Goal-based scoring (exact spec formulas) ──────────────────
const GOAL_SCORERS = {
  /**
   * LOSE – Maximize protein (satiety), heavily penalize calorie-dense foods.
   * Score = (Protein_Density * 100) - (Energy_Density * 15)
   */
  Lose: (food) => {
    const energyDensity  = calcEnergyDensity(food.calories)
    const proteinDensity = calcProteinDensity(food.protein, food.calories)
    return (proteinDensity * 100) - (energyDensity * 15)
  },

  /**
   * GAIN – Maximize protein (building), reward calorie-dense foods.
   * Score = (Protein_Density * 80) + (Energy_Density * 10)
   */
  Gain: (food) => {
    const energyDensity  = calcEnergyDensity(food.calories)
    const proteinDensity = calcProteinDensity(food.protein, food.calories)
    return (proteinDensity * 80) + (energyDensity * 10)
  },

  /**
   * MAINTAIN – Balance protein, lightly penalize extreme calorie density.
   * Score = (Protein_Density * 50)
   * if Energy_Density > 3.5 → Score -= 10
   */
  Maintain: (food) => {
    const energyDensity  = calcEnergyDensity(food.calories)
    const proteinDensity = calcProteinDensity(food.protein, food.calories)
    let score = proteinDensity * 50
    if (energyDensity > 3.5) score -= 10
    return score
  },
}

// ── Guest scoring (no user profile) ──────────────────────────
// Uses a nutrient-density composite (micronutrient richness)
// so guests see the globally healthiest foods across all categories.
function scoreForGuest(food) {
  let score = 0

  // Protein density as base signal
  const proteinDensity = calcProteinDensity(food.protein, food.calories)
  score += proteinDensity * 60

  // High fiber (universal health signal)
  score += (food.fiber || 0) * 5

  // Low sodium (cardiovascular health)
  score -= Math.min((food.sodium || 0) / 50, 10)

  // Low cholesterol (processed indicator)
  score -= Math.min((food.cholesterol || 0) / 10, 15)

  // Rich in micronutrients
  score += (food.beta_caroten || 0) / 20
  score += (food.vitamin_a    || 0) * 2
  score += (food.vitamin_c    || 0) * 1.5
  score += (food.calcium      || 0) / 30
  score += (food.iron         || 0) * 2
  score += (food.phosphorus   || 0) / 30
  score += (food.potassium    || 0) / 20

  // Penalize extreme calorie density (very low or very high = poor nutrient profile)
  const cal = food.calories || 0
  if (cal < 30)  score -= 5
  if (cal > 400) score -= 8

  return score
}

// ── Max items shown per tier ────────────────────────────────
const MAX_PER_TIER = 8

/**
 * Main hook.
 * @param {Array}  foods     – full food list (from context)
 * @param {Object} user      – user object from context (null if guest)
 * @param {string} localGoal – live UI goal override ('Lose'|'Gain'|'Maintain'|null)
 * @returns {Array} pyramidTierFoods – [{ tier, foods: [...] }, ...]
 */
export function useFoodRecommendations(foods = [], user = null, localGoal = null) {
  return useMemo(() => {
    if (!foods || foods.length === 0) return []

    // localGoal (from live UI) overrides user.profile.goal (saved to server)
    const goal = localGoal || user?.profile?.goal || null

    // Build per-tier food lists
    const tierMap = {}  // tierId -> { tier config, foods[] }

    for (const tier of PYRAMID_TIERS) {
      tierMap[tier.id] = { tier, foods: [] }
    }

    for (const food of foods) {
      const tierId = categoryToTierId(food.category)
      if (!tierId || !tierMap[tierId]) continue

      let score
      if (goal && GOAL_SCORERS[goal]) {
        // Authenticated user with a known goal → use spec formula
        score = GOAL_SCORERS[goal](food)
      } else if (user && !goal) {
        // Logged-in user but no goal set → default to Maintain formula
        score = GOAL_SCORERS['Maintain'](food)
      } else {
        // Guest user → micronutrient composite
        score = scoreForGuest(food)
      }

      tierMap[tierId].foods.push({ ...food, _score: score })
    }

    // Sort each tier by score descending, cap at MAX_PER_TIER
    const result = Object.values(tierMap)
      .map(({ tier, foods: tierFoods }) => ({
        tier,
        icon: getIconForTier(tier.id),
        foods: tierFoods
          .sort((a, b) => b._score - a._score)
          .slice(0, MAX_PER_TIER),
      }))
      .filter(item => item.foods.length > 0)

    // Sort result: follow PYRAMID_TIERS order (bottom-first = rau > trai_cay ...)
    const tierOrder = PYRAMID_TIERS.map(t => t.id)
    result.sort((a, b) => tierOrder.indexOf(a.tier.id) - tierOrder.indexOf(b.tier.id))

    return result
  }, [foods, user, localGoal])
}