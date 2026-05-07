import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { addIntake } from '../../services/daily_tracking/dailyTrackingApi'

export default function AddFoodModal({ isOpen, onClose, intakeDate }) {
  const { foods = [], token, refreshDailyTotals, refreshDailyIntakes } = useApp()
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState(150)
  const [mealType, setMealType] = useState('Breakfast')
  const targetDate = intakeDate || new Date().toISOString().split('T')[0]
  const [submitError, setSubmitError] = useState('')
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
    setSelectedFood(item)
    setSubmitError('')
  }

  const handleSubmit = async () => {
    if (!selectedFood) return
    if (!token) {
      setSubmitError('Please sign in to add foods.')
      return
    }
    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      setSubmitError('Quantity must be greater than 0.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    try {
      await addIntake(token, {
        foodId: String(selectedFood.id),
        quantity: qty,
        mealType,
        intakeDate: targetDate,
      })
      await refreshDailyTotals(targetDate)
      await refreshDailyIntakes(targetDate)
      setSelectedFood(null)
      setQuantity(150)
      setMealType('Breakfast')
      setSearch('')
      setQuery('')
      setSelectedCategory('All')
      setShowAllCategories(false)
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add intake.')
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
                  className={`food-table-row ${selectedFood?.id === item.id ? 'active' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <span className="food-table-name">{item.name}</span>
                  <span className="food-table-source">{item.source || item.category || 'Local'}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedFood && (
          <div className="food-detail">
            <div className="food-detail-title">Add to diary</div>
            <div className="food-detail-name">{selectedFood.name}</div>

            <div className="food-detail-grid">
              <label className="food-detail-field">
                <span>Quantity (g)</span>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </label>
              <label className="food-detail-field">
                <span>Meal type</span>
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </label>
            </div>

            {submitError && <div className="food-detail-error">{submitError}</div>}

            <div className="food-detail-actions">
              <button type="button" className="btn btn-hi" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add to diary'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}