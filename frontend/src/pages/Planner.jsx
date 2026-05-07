import { useEffect, useMemo, useState } from 'react'
import AddFoodModal from '../components/ui/AddFoodModal'
import EnergySummary from '../components/ui/EnergySummary'
import { useApp } from '../context/AppContext'
import { deleteIntake, updateIntake } from '../services/daily_tracking/dailyTrackingApi'



export default function Planner() {
  const { intakes, token, refreshDailyTotals, refreshDailyIntakes } = useApp()
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false)
  const [dateOffset, setDateOffset] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editMealType, setEditMealType] = useState('Breakfast')
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const MEAL_ORDER = ['Uncategorized', 'Breakfast', 'Lunch', 'Dinner', 'Snack']
  const MEAL_COLORS = {
    Uncategorized: 'var(--line2)',
    Breakfast: 'var(--blue)',
    Lunch: 'var(--pink)',
    Dinner: 'var(--teal)',
    Snack: 'var(--amber)',
  }

  const selectedDate = useMemo(() => {
    const base = new Date()
    base.setHours(12, 0, 0, 0)
    base.setDate(base.getDate() + dateOffset)
    return base
  }, [dateOffset])

  const selectedDateIso = selectedDate.toISOString().split('T')[0]

  const dateLabel = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compare = new Date(selectedDate)
    compare.setHours(0, 0, 0, 0)
    const diffDays = Math.round((compare - today) / 86400000)

    if (diffDays === 0) return 'Today'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays === 1) return 'Tomorrow'
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }, [selectedDate])

  const meals = useMemo(() => {
    const map = new Map()
    MEAL_ORDER.forEach((label) => {
      map.set(label, {
        id: label,
        label,
        kcal: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        foods: [],
      })
    })

    intakes.forEach((intake) => {
      const mealLabel = MEAL_ORDER.includes(intake.mealType) ? intake.mealType : 'Uncategorized'
      const meal = map.get(mealLabel)
      const food = intake.food || intake.foodItem || {}
      const qty = Number(intake.quantity || 0)
      const ratio = qty ? qty / 100 : 1
      const kcal = Math.round((Number(food.calories) || 0) * ratio)
      const protein = Math.round((Number(food.protein) || 0) * ratio)
      const fat = Math.round((Number(food.fat) || 0) * ratio)
      const carbs = Math.round((Number(food.carbs) || 0) * ratio)

      meal.kcal += kcal
      meal.protein += protein
      meal.fat += fat
      meal.carbs += carbs

      meal.foods.push({
        intakeId: intake.id,
        name: food.name || intake.foodName || 'Food',
        qty: qty ? `${qty} g` : '-',
        quantity: qty || 0,
        mealType: mealLabel,
        kcal,
        col: MEAL_COLORS[mealLabel],
      })
    })

    return MEAL_ORDER.map((label) => {
      const meal = map.get(label)
      return {
        ...meal,
        macro: `${meal.protein}p · ${meal.fat}f · ${meal.carbs}c`,
      }
    })
  }, [intakes])

  const [openMeals, setOpenMeals] = useState({})
  useEffect(() => {
    setOpenMeals((prev) => {
      const next = { ...prev }
      meals.forEach((meal) => {
        if (next[meal.id] === undefined) next[meal.id] = true
      })
      return next
    })
  }, [meals])

  const toggleMeal = (id) => setOpenMeals((prev) => ({ ...prev, [id]: !prev[id] }))

  useEffect(() => {
    refreshDailyTotals(selectedDateIso)
    refreshDailyIntakes(selectedDateIso)
  }, [selectedDateIso, refreshDailyTotals, refreshDailyIntakes])

  const handleEdit = (food) => {
    setEditingId(food.intakeId)
    setEditQuantity(food.quantity)
    setEditMealType(food.mealType || 'Breakfast')
    setActionError('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditQuantity('')
    setEditMealType('Breakfast')
    setActionError('')
  }

  const handleSaveEdit = async (intakeId) => {
    if (!token) return
    const qty = Number(editQuantity)
    if (!qty || qty <= 0) {
      setActionError('Quantity must be greater than 0.')
      return
    }
    setActionLoading(true)
    setActionError('')
    try {
      await updateIntake(token, intakeId, {
        quantity: qty,
        mealType: editMealType,
      })
      await refreshDailyTotals(selectedDateIso)
      await refreshDailyIntakes(selectedDateIso)
      handleCancelEdit()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update intake.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (intakeId) => {
    if (!token) return
    setActionLoading(true)
    setActionError('')
    try {
      await deleteIntake(token, intakeId)
      await refreshDailyTotals(selectedDateIso)
      await refreshDailyIntakes(selectedDateIso)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete intake.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <section className="page planner-page">
      <div className="page-head">
        <div>
          <h1>Planner</h1>
          <p>Daily log and nutrition targets overview.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: '5px 10px' }} onClick={() => setDateOffset((prev) => prev - 1)}>←</button>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{dateLabel}</div>
          <button className="btn btn-ghost" style={{ padding: '5px 10px' }} onClick={() => setDateOffset((prev) => prev + 1)}>→</button>
          <span className="badge warn" style={{ marginLeft: 8 }}>🔥 5 day streak</span>
        </div>
      </div>

      {/* Dashboard summary */}
      <div className="planner-summary">
        <EnergySummary />
      </div>

      <div className="planner-grid">
        <div className="planner-main">
          <div className="card planner-log">
            <div className="planner-log-toolbar">
              <div className="planner-tabs">
                <button type="button" className="tab active">Food</button>
                <button type="button" className="tab">Exercise</button>
              </div>
              <div className="planner-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddFoodOpen(true)}>+ Add food</button>
                <button type="button" className="btn btn-ghost">+ Add exercise</button>
              </div>
            </div>

            {actionError && <div className="meal-error">{actionError}</div>}

            <div>
              {meals.map((meal) => (
                <div key={meal.id} className="meal-section">
                  <div className="meal-header" onClick={() => toggleMeal(meal.id)}>
                    <span className="meal-name">{meal.label}</span>
                    <span className="meal-macro">{meal.kcal} kcal · {meal.macro}</span>
                    <span className={`meal-chevron ${openMeals[meal.id] ? 'open' : ''}`}>▾</span>
                  </div>
                  {openMeals[meal.id] && (
                    <div className="meal-body">
                      {meal.foods.length === 0 ? (
                        <div className="meal-empty">No entries yet.</div>
                      ) : (
                        meal.foods.map((food, idx) => (
                          <div key={`${meal.id}-${idx}`} className="food-row">
                            <span className="food-dot" style={{ background: food.col }} />
                            <span className="food-name">{food.name}</span>
                            {editingId === food.intakeId ? (
                              <div className="food-edit">
                                <input
                                  type="number"
                                  min="1"
                                  value={editQuantity}
                                  onChange={(e) => setEditQuantity(e.target.value)}
                                />
                                <select value={editMealType} onChange={(e) => setEditMealType(e.target.value)}>
                                  <option value="Breakfast">Breakfast</option>
                                  <option value="Lunch">Lunch</option>
                                  <option value="Dinner">Dinner</option>
                                  <option value="Snack">Snack</option>
                                </select>
                                <button type="button" className="btn btn-hi" onClick={() => handleSaveEdit(food.intakeId)} disabled={actionLoading}>Save</button>
                                <button type="button" className="btn btn-ghost" onClick={handleCancelEdit} disabled={actionLoading}>Cancel</button>
                              </div>
                            ) : (
                              <>
                                <span className="food-qty">{food.qty}</span>
                                <span className="food-cals">{food.kcal} kcal</span>
                                {food.intakeId && (
                                  <span className="food-actions">
                                    <button type="button" className="btn btn-ghost" onClick={() => handleEdit(food)}>Edit</button>
                                    <button type="button" className="btn btn-ghost" onClick={() => handleDelete(food.intakeId)} disabled={actionLoading}>Delete</button>
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="planner-side">
          <div className="card planner-date">
            <button type="button" className="btn btn-ghost" onClick={() => setDateOffset((prev) => prev - 1)}>←</button>
            <div className="planner-date-label">{dateLabel}</div>
            <button type="button" className="btn btn-ghost" onClick={() => setDateOffset((prev) => prev + 1)}>→</button>
          </div>

          <div className="card planner-targets">
            <div className="planner-targets-title">Daily Target Editor</div>
            <div className="planner-targets-sub">Thu - Default Macronutrient Targets</div>
          </div>

          <div className="card planner-water">
            <div className="planner-water-head">
              <div>
                <div className="planner-water-title">Water</div>
                <div className="planner-water-sub">48 / 64 fl oz</div>
              </div>
              <button type="button" className="btn btn-ghost">▴</button>
            </div>

            <div className="planner-water-cups">
              <div className="water-cup full" />
              <div className="water-cup full" />
              <div className="water-cup full" />
              <div className="water-cup full" />
              <div className="water-cup full" />
              <div className="water-cup full" />
              <div className="water-cup" />
              <div className="water-cup" />
            </div>

            <div className="planner-water-tip">
              Water added here will contribute to your total water target.
            </div>

            <div className="planner-water-total">
              <span>Total Water - 55.86 / 125.11 fl oz</span>
              <span>45%</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: '45%', background: 'var(--blue)' }} />
            </div>

            <div className="planner-water-actions">
              <button type="button" className="btn btn-ghost">+ Add custom</button>
              <button type="button" className="btn btn-ghost">Water settings</button>
            </div>
          </div>
        </aside>
      </div>

      <div>
        <AddFoodModal
          isOpen={isAddFoodOpen}
          onClose={() => setIsAddFoodOpen(false)}
          intakeDate={selectedDateIso}
        />
      </div>
    </section>
    )
}