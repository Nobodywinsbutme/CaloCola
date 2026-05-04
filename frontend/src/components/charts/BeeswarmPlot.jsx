import { useEffect, useMemo, useRef, useState } from 'react'
import { forceCollide, forceSimulation, forceX, forceY, scaleLinear, scaleSqrt } from 'd3'

const DEFAULT_HEIGHT = 280

const useContainerSize = () => {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: DEFAULT_HEIGHT })
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const obs = new ResizeObserver(entries => {
      entries.forEach(e => setSize(prev => ({ width: e.contentRect.width, height: prev.height })))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, size]
}

export default function BeeswarmPlot({ foods, nutrient, mode, filterCategory, colorMap }) {
  const [containerRef, size] = useContainerSize()
  const [nodes, setNodes] = useState([])
  const [height, setHeight] = useState(DEFAULT_HEIGHT)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, food: null })

  const categories = useMemo(() => {
    const set = new Set(foods.map(f => f.category))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [foods])

  useEffect(() => {
    if (mode === 'category') {
      setHeight(Math.max(280, categories.length * 54 + 80))
    } else {
      setHeight(DEFAULT_HEIGHT)
    }
  }, [categories, mode])

  const layout = useMemo(() => {
    if (!foods.length || !size.width) return null
    const padding = { left: 50, right: 20, top: 24, bottom: 36 }
    const width = size.width
    const usableWidth = Math.max(1, width - padding.left - padding.right)
    const minCal = Math.min(...foods.map(f => f.calories))
    const maxCal = Math.max(...foods.map(f => f.calories))
    const xScale = scaleLinear().domain([minCal * 0.9, maxCal * 1.05]).range([padding.left, padding.left + usableWidth])
    const nutrientMax = Math.max(1, ...foods.map(f => f[nutrient]))
    const radiusScale = scaleSqrt().domain([0, nutrientMax]).range([4, 18])
    return { padding, width, xScale, radiusScale }
  }, [foods, nutrient, size.width])

  useEffect(() => {
    if (!layout || !foods.length) { setNodes([]); return }
    const { xScale, radiusScale } = layout
    const nodesCopy = foods.map((food, i) => ({
      id: food.id ?? `${food.name}-${i}`,
      name: food.name, category: food.category,
      calories: food.calories, protein: food.protein, fat: food.fat, carbs: food.carbs,
      radius: Math.max(4, radiusScale(food[nutrient] || 0)),
      x: xScale(food.calories), y: height / 2,
    }))
    const targetY = node => {
      if (mode !== 'category') return height / 2
      const idx = categories.indexOf(node.category)
      const band = (height - 80) / Math.max(1, categories.length)
      return 40 + idx * band + band / 2
    }
    const sim = forceSimulation(nodesCopy)
      .force('x', forceX(n => xScale(n.calories)).strength(0.9))
      .force('y', forceY(targetY).strength(mode === 'category' ? 0.9 : 0.6))
      .force('collide', forceCollide(n => n.radius + 2))
      .stop()
    for (let i = 0; i < 200; i++) sim.tick()
    setNodes(nodesCopy)
    return () => sim.stop()
  }, [layout, foods, nutrient, mode, height, categories])

  const ticks = useMemo(() => layout ? layout.xScale.ticks(6) : [], [layout])

  const showTT = (event, node) => {
    const offset = 16, tw = 220, th = 140
    let x = event.clientX + offset, y = event.clientY + offset
    if (x + tw > window.innerWidth) x = event.clientX - tw - offset
    if (y + th > window.innerHeight) y = event.clientY - th - offset
    setTooltip({ visible: true, x, y, food: node })
  }
  const hideTT = () => setTooltip({ visible: false, x: 0, y: 0, food: null })

  return (
    <div className="chart-frame" ref={containerRef}>
      {layout ? (
        <svg width={layout.width} height={height} className="chart-svg">
          {/* Grid lines */}
          <g className="chart-grid">
            {ticks.map(tick => (
              <g key={`tick-${tick}`}>
                <line
                  x1={layout.xScale(tick)} x2={layout.xScale(tick)}
                  y1={layout.padding.top} y2={height - layout.padding.bottom}
                />
                <text x={layout.xScale(tick)} y={height - 8}>{tick}</text>
              </g>
            ))}
          </g>

          {/* Category rows */}
          {mode === 'category' && categories.map((cat, idx) => {
            const band = (height - 80) / Math.max(1, categories.length)
            const y = 40 + idx * band + band / 2
            const avg = foods.filter(f => f.category === cat).reduce((s, f, _, a) => s + f.calories / a.length, 0)
            return (
              <g key={`row-${cat}`} className="category-row">
                <line x1={layout.padding.left} x2={layout.width - layout.padding.right} y1={y} y2={y} />
                <text x={layout.padding.left - 6} y={y + 4}>{cat}</text>
                <line x1={layout.xScale(avg)} x2={layout.xScale(avg)} y1={y - 16} y2={y + 16} className="avg-marker" />
              </g>
            )
          })}

          {/* Dots */}
          {nodes.map(node => {
            const active = filterCategory === 'all' || node.category === filterCategory
            return (
              <circle
                key={node.id}
                cx={node.x} cy={node.y} r={node.radius}
                fill={colorMap[node.category] ?? 'var(--hi)'}
                className={active ? 'bee-dot' : 'bee-dot dim'}
                onMouseEnter={e => showTT(e, node)}
                onMouseMove={e => showTT(e, node)}
                onMouseLeave={hideTT}
              />
            )
          })}
        </svg>
      ) : (
        <div className="status">Loading chart…</div>
      )}

      {tooltip.visible && tooltip.food && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="tooltip-title">{tooltip.food.name}</div>
          <div className="tooltip-row"><span>Category</span><span>{tooltip.food.category}</span></div>
          <div className="tooltip-row"><span>Calories</span><span>{tooltip.food.calories} kcal/100g</span></div>
          <div className="tooltip-row"><span>Protein</span><span>{tooltip.food.protein} g</span></div>
          <div className="tooltip-row"><span>Fat</span><span>{tooltip.food.fat} g</span></div>
          <div className="tooltip-row"><span>Carbs</span><span>{tooltip.food.carbs} g</span></div>
        </div>
      )}

      <div className="axis-hint">
        <span>← Low calorie density (vegetables, fruits)</span>
        <span>High calorie density (nuts, processed) →</span>
      </div>
    </div>
  )
}
