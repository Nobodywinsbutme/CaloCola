import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { addIntake } from '../../services/daily_tracking/dailyTrackingApi'

export default function AddFoodModal({ isOpen, onClose, intakeDate }) {
  const {
    foods = [],
    token,
    refreshDailyTotals,
    refreshDailyIntakes,
    notify,
  } = useApp()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [activeFoodId, setActiveFoodId] = useState(null)
  // Per-selected-item values: { [foodId]: { quantity: number, mealType: string } }
  const [selectedItems, setSelectedItems] = useState({})
  const targetDate = intakeDate || new Date().toISOString().split('T')[0]
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = useMemo(() => {
    const set = new Set()
    foods.forEach((item) => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [foods])

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const selectedKey = selectedCategory.toLowerCase()
    const limit = q ? 120 : 60

    return foods.filter((item) => {
      const name = (item.name || '').toLowerCase()
      const category = (item.category || '').toLowerCase()
      const matchesQuery = !q || name.includes(q) || category.includes(q)
      const matchesCategory = selectedCategory === 'All' || category === selectedKey
      return matchesQuery && matchesCategory
    }).slice(0, limit)
  }, [foods, query, selectedCategory])

  const handleSearch = () => setQuery(search)

  const handleSelect = (item) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const id = item.id
      if (next.has(id)) {
        next.delete(id)
        setSelectedItems((s) => {
          const copy = { ...s }
          delete copy[id]
          return copy
        })
      } else {
        next.add(id)
        setSelectedItems((s) => ({
          ...s,
          [id]: { quantity: 150, mealType: 'Breakfast' },
        }))
      }
      return next
    })
    setActiveFoodId(item.id)
  }

  const selectedFoods = useMemo(() => {
    if (!selectedIds.size) return []
    const idSet = selectedIds
    return foods.filter((item) => idSet.has(item.id))
  }, [foods, selectedIds])

  const activeFood = useMemo(() => {
    if (!activeFoodId) return null
    return foods.find((item) => item.id === activeFoodId) || null
  }, [foods, activeFoodId])

  const handleSubmit = async () => {
    if (!selectedFoods.length) return
    if (!token) {
      notify({ type: 'error', message: 'Please sign in to add foods.' })
      return
    }

    // Validate per-item quantities
    for (const item of selectedFoods) {
      const vals = selectedItems[item.id] || {}
      const qty = Number(vals.quantity)
      if (!qty || qty <= 0) {
        notify({ type: 'error', message: `Quantity for ${item.name} must be greater than 0.` })
        return
      }
    }

    setIsSubmitting(true)
    try {
      await Promise.all(selectedFoods.map((item) => {
        const vals = selectedItems[item.id] || { quantity: 150, mealType: 'Breakfast' }
        return addIntake(token, {
          foodId: String(item.id),
          quantity: Number(vals.quantity),
          mealType: vals.mealType,
          intakeDate: targetDate,
        })
      }))

      await refreshDailyTotals(targetDate)
      await refreshDailyIntakes(targetDate)

      notify({ type: 'success', message: `${selectedFoods.length} food(s) added` })

      setSelectedIds(new Set())
      setActiveFoodId(null)
      setSelectedItems({})
      setSearch('')
      setQuery('')
      setSelectedCategory('All')
      setShowAllCategories(false)
      onClose()
    } catch (err) {
      notify({ type: 'error', message: err instanceof Error ? err.message : 'Failed to add intake.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box food-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Food to Diary</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="food-search">
          <input
            type="text"
            placeholder="Search all foods & recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
          />
          <button
            className="food-search-button"
            type="button"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <div className="food-categories">
          <div className="food-category-list">
            <button
              type="button"
              className={`food-category ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              All
            </button>
            {visibleCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`food-category ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          {categories.length > 8 && (
            <button
              type="button"
              className="food-category-toggle"
              onClick={() => setShowAllCategories((prev) => !prev)}
            >
              {showAllCategories ? 'Show less' : 'Show all'}
            </button>
          )}
        </div>

        <div className="food-table">
          <div className="food-table-head">
            <span>Description</span>
            <span>Source</span>
          </div>
          <div className="food-table-body">
            {results.length === 0 ? (
              <div className="food-empty">No foods match your search.</div>
            ) : (
              results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`food-table-row ${selectedIds.has(item.id) ? 'active' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <span className="food-table-name">{item.name}</span>
                  <span className="food-table-source">{item.source || item.category || 'Local'}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedFoods.length > 0 && (
          <div className="food-detail">
            <div className="food-detail-title">Add to diary</div>
            <div className="food-detail-name">
              {selectedFoods.length === 1 ? selectedFoods[0].name : `${selectedFoods.length} foods selected`}
            </div>
            {selectedFoods.length > 1 && (
              <div className="food-detail-list">
                {selectedFoods.slice(0, 3).map((item) => (
                  <span key={item.id}>{item.name}</span>
                ))}
                {selectedFoods.length > 3 && (
                  <span>+{selectedFoods.length - 3} more</span>
                )}
              </div>
            )}

                <div className="food-detail-grid multi">
                  {selectedFoods.map((item) => {
                    const vals = selectedItems[item.id] || { quantity: 150, mealType: 'Breakfast' }
                    return (
                      <div key={item.id} className="food-detail-item">
                        <div className="food-detail-item-name">{item.name}</div>
                        <label className="food-detail-field small">
                          <span>Quantity (g)</span>
                          <input
                            type="number"
                            min="1"
                            value={vals.quantity}
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0
                              setSelectedItems((s) => ({ ...s, [item.id]: { ...(s[item.id] || {}), quantity: v } }))
                            }}
                          />
                        </label>
                        <label className="food-detail-field small">
                          <span>Meal type</span>
                          <select
                            value={vals.mealType}
                            onChange={(e) => setSelectedItems((s) => ({ ...s, [item.id]: { ...(s[item.id] || {}), mealType: e.target.value } }))}
                          >
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snack">Snack</option>
                            <option value="Categorized">Categorized</option>
                          </select>
                        </label>
                      </div>
                    )
                  })}
                </div>

            <div className="food-detail-actions">
              <button type="button" className="btn btn-hi" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add selected'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}