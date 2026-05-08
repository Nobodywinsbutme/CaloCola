import { useEffect, useMemo, useState } from 'react'
import AddFoodModal from '../components/ui/AddFoodModal'
import EnergySummary from '../components/ui/EnergySummary'
import WaterSettingsModal from '../components/ui/WaterSettingsModal'
import { useApp } from '../context/AppContext'
import { addWaterIntake, deleteIntake, deleteLatestWaterIntake, updateIntake } from '../services/daily_tracking/dailyTrackingApi'



export default function Planner() {
  const {
    intakes,
    token,
    refreshDailyTotals,
    refreshDailyIntakes,
    userProfile,
    waterTotalMl,
    notify,
    applyWaterDelta,
  } = useApp()
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false)
  const [isWaterSettingsOpen, setIsWaterSettingsOpen] = useState(false)
  const [dateOffset, setDateOffset] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editMealType, setEditMealType] = useState('Breakfast')
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [waterLoading, setWaterLoading] = useState(false)
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

  const waterTargetMl = useMemo(() => {
    const profile = userProfile?.profile
    const weight = Number(profile?.weight || 0)
    const fallbackTarget = weight ? Math.round(weight * 30) : 2000
    const target = Number(profile?.waterTarget || 0)
    return Math.round(target || fallbackTarget)
  }, [userProfile])

  const cupSizeMl = useMemo(() => {
    const profile = userProfile?.profile
    const size = Number(profile?.cupSizeMl || 0)
    return Math.round(size || 250)
  }, [userProfile])

  const totalWaterMl = Math.max(0, Math.round(Number(waterTotalMl || 0)))
  const totalCups = Math.max(1, Math.ceil(waterTargetMl / cupSizeMl))
  const filledCups = Math.min(totalCups, Math.floor(totalWaterMl / cupSizeMl))
  const waterPercent = waterTargetMl ? Math.min(100, Math.round((totalWaterMl / waterTargetMl) * 100)) : 0

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
        protein,
        carbs,
        fats: fat,
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
    // Only allow valid meal types for the edit control (server accepts Breakfast, Lunch, Dinner, Snack)
    const allowed = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
    setEditMealType(allowed.includes(food.mealType) ? food.mealType : 'Breakfast')
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

  const handleAddWater = async (amountMl) => {
    if (!token) {
      notify({ type: 'error', message: 'Please sign in to add water.' })
      return false
    }
    if (!amountMl || amountMl <= 0) {
      notify({ type: 'error', message: 'Water amount must be greater than 0.' })
      return false
    }
    setWaterLoading(true)
    applyWaterDelta(amountMl)
    try {
      await addWaterIntake(token, { amountMl, intakeDate: selectedDateIso })
      await refreshDailyTotals(selectedDateIso)
      return true
    } catch (err) {
      applyWaterDelta(-amountMl)
      notify({ type: 'error', message: err instanceof Error ? err.message : 'Failed to add water.' })
      return false
    } finally {
      setWaterLoading(false)
    }
  }

  const handleRemoveWater = async () => {
    if (!token) {
      notify({ type: 'error', message: 'Please sign in to remove water.' })
      return
    }
    if (totalWaterMl <= 0) return
    const amountMl = Math.min(cupSizeMl, totalWaterMl)
    setWaterLoading(true)
    applyWaterDelta(-amountMl)
    try {
      await deleteLatestWaterIntake(token, selectedDateIso)
      await refreshDailyTotals(selectedDateIso)
    } catch (err) {
      applyWaterDelta(amountMl)
      notify({ type: 'error', message: err instanceof Error ? err.message : 'Failed to remove water.' })
    } finally {
      setWaterLoading(false)
    }
  }

  const handleSaveCustomWater = async (amountMl) => {
    const ok = await handleAddWater(amountMl)
    return ok
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
                                  <option value="Uncategorized">Uncategorized</option>
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
                                <span className="food-cals">{food.carbs} g</span>
                                <span className="food-cals">{food.protein} g</span>
                                <span className="food-cals">{food.fats} g</span>
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
                <div className="planner-water-sub">{filledCups} / {totalCups} cups</div>
              </div>
            </div>

            <div className="planner-water-row">
              <div
                className="planner-water-cups"
                style={{ gridTemplateColumns: `repeat(${totalCups}, 1fr)` }}
              >
                {Array.from({ length: totalCups }).map((_, idx) => (
                  <div key={`water-cup-${idx}`} className={`water-cup ${idx < filledCups ? 'full' : ''}`} />
                ))}
              </div>
              <div className="planner-water-controls">
                <button type="button" className="btn btn-ghost" onClick={handleRemoveWater} disabled={waterLoading || totalWaterMl <= 0}>-</button>
                <button type="button" className="btn btn-ghost" onClick={() => handleAddWater(cupSizeMl)} disabled={waterLoading}>+</button>
              </div>
            </div>

            <div className="planner-water-tip">
              Water added here will contribute to your total water target.
            </div>

            <div className="planner-water-total">
              <span>Total Water - {totalWaterMl} / {waterTargetMl} ml</span>
              <span>{waterPercent}%</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${waterPercent}%`, background: 'var(--blue)' }} />
            </div>

            <div className="planner-water-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setIsWaterSettingsOpen(true)
                }}
                disabled={waterLoading}
              >
                Water settings
              </button>
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
        <WaterSettingsModal
          isOpen={isWaterSettingsOpen}
          onClose={() => setIsWaterSettingsOpen(false)}
          defaultTarget={waterTargetMl}
          defaultCupSize={cupSizeMl}
        />
      </div>
    </section>
    )
}