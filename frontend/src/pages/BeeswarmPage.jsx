import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import * as d3 from 'd3'
import { buildColorMap } from '../config/categoryColors'
import { formatNutrientValue, getSizeByOptions, NUTRIENT_META } from '../config/nutrients'


const FALLBACK_COLOR = '#888780'
// US-02: Allow users to choose nutrient for bubble size (default: fat)
const MIN_RADIUS = 5
const MAX_RADIUS = 18
const CHART_HEIGHT = 280

//UC-05: Two view modes - overall vs by category
const ROW_HEIGHT = 44       
const TOP_PAD = 18
const BOTTOM_PAD = 44
const LEFT_PAD_BYCAT = 140   

export default function BeeswarmPage() {
  const { foods, loading, foodsError } = useApp()
  const svgRef = useRef(null)
  const wrapRef = useRef(null)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, food: null })

  // UC-02 
  const [sizeBy, setSizeBy] = useState('fat')
  const sizeByOptions = useMemo(() => getSizeByOptions(foods, { strict: true }), [foods])

  // UC-05 
  const [viewMode, setViewMode] = useState('overall') 

  const categories = useMemo(() => {
    if (!Array.isArray(foods) || foods.length === 0) return []
    return [...new Set(foods.map(food => food.category).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  }, [foods])
  // US-03: Map category to color 
  const colorMap = useMemo(() => buildColorMap(categories), [categories])

  useEffect(() => {
    if (loading) return
    if (foodsError) return
    if (!Array.isArray(foods) || foods.length === 0) return
    if (!svgRef.current || !wrapRef.current) return

    if (sizeByOptions.length > 0) {
      const availableKeys = sizeByOptions.map(option => option.key)
      if (!availableKeys.includes(sizeBy)) {
        setSizeBy(availableKeys.includes('fat') ? 'fat' : availableKeys[0])
        return
      }
    }

    const resizeObserver = new ResizeObserver(() => drawChart())
    resizeObserver.observe(wrapRef.current)

    drawChart()

    return () => resizeObserver.disconnect()
  }, [foods, loading, foodsError, sizeBy, sizeByOptions, colorMap, viewMode, categories])

  function drawChart() {
    const svg    = d3.select(svgRef.current)
    
    // Only clear non-essential elements; keep circles for smooth transitions
    const isFirstDraw = svg.selectAll('circle').empty()
    
    if (isFirstDraw) {
      svg.selectAll('*').remove()
    } else {
      svg.selectAll('g').remove()  // clear axes and labels, keep circles
    }

    const width = wrapRef.current.clientWidth
    const height =
      viewMode === 'byCategory'
        ? Math.max(CHART_HEIGHT, categories.length * ROW_HEIGHT + TOP_PAD + BOTTOM_PAD)
        : CHART_HEIGHT

    // Keep the chart X position fixed so bubbles only move vertically.
    const marginLeft = LEFT_PAD_BYCAT

    svg.attr('width', width).attr('height', height)

    const maxCal = d3.max(foods, d => Number(d.calories) || 0) || 0
    const xDomainMax = Math.max(100, Math.ceil(maxCal / 100) * 100)

    const xScale = d3.scaleLinear()
      .domain([0, xDomainMax])
      .range([marginLeft, width - 20])

    const yCenter = height / 2 - 8

    const yScale = viewMode === 'byCategory'
      ? d3.scalePoint()
          .domain(categories)
          .range([TOP_PAD, height - BOTTOM_PAD])
          .padding(0.6)
      : null

    const getSizeValue = (d) => {
      const v = d?.[sizeBy]
      return typeof v === 'number' && !Number.isNaN(v) ? v : 0
    }

    const maxSize = d3.max(foods, getSizeValue) || 0
    const radiusScale = d3.scaleSqrt()
      .domain([0, maxSize || 1])
      .range([MIN_RADIUS, MAX_RADIUS])

    const nodes = foods.map(d => ({
      ...d,
      x: xScale(d.calories),
      y: viewMode === 'byCategory'
        ? (yScale(d.category) ?? yCenter)
        : yCenter,
      r: Math.max(MIN_RADIUS, radiusScale(getSizeValue(d))),
    }))

    // Force layout for a stable beeswarm distribution.
    const sim = d3.forceSimulation(nodes)
      .force('x', d3.forceX(d => xScale(d.calories)).strength(1))
      // In "by category" mode, group by category on Y-axis. In "overall" mode, align to center.
      .force(
        'y',
        viewMode === 'byCategory'
          ? d3.forceY(d => (yScale(d.category) ?? yCenter)).strength(0.35)
          : d3.forceY(yCenter).strength(0.08)
      )
      .force('collide', d3.forceCollide(d => d.r + 1.5).strength(1))
      .stop()

    for (let i = 0; i < 300; i++) sim.tick()

    // Draw circles with smooth transitions
    const circleSelection = svg.selectAll('circle')
      .data(nodes, (d, i) => d.food_name ?? i)  // use food_name as key for consistency
      .join(
        enter =>
          enter
            .append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.r)
            .attr('fill', d => colorMap[d.category] || FALLBACK_COLOR)
            .attr('fill-opacity', 0.75)
            .attr('stroke', d => colorMap[d.category] || FALLBACK_COLOR)
            .attr('stroke-width', 1)
            .style('cursor', 'pointer'),
        update => update,
        exit => exit.remove()
      )
      // Animate to new positions smoothly
      .transition()
      .duration(600)  // 600ms animation
      .ease(d3.easeLinear)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.r)
      .attr('fill', d => colorMap[d.category] || FALLBACK_COLOR)
      .attr('stroke', d => colorMap[d.category] || FALLBACK_COLOR)
    
    // Attach event handlers (re-apply after transitions)
    svg.selectAll('circle')
      .attr('fill-opacity', 0.75)
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget)
          .attr('fill-opacity', 1)
          .attr('stroke-width', 2)

        const rect = wrapRef.current.getBoundingClientRect()
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          food: d,
        })
      })
      .on('mousemove', (event) => {
        const rect = wrapRef.current.getBoundingClientRect()
        setTooltip(prev => ({
          ...prev,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }))
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget)
          .attr('fill-opacity', 0.75)
          .attr('stroke-width', 1)

        setTooltip({ visible: false, x: 0, y: 0, food: null })
      })

    // Draw left-side labels for both modes.
    if (viewMode === 'byCategory') {
      svg.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(categories)
        .join('text')
        .attr('x', marginLeft - 12)
        .attr('y', cat => yScale(cat))
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#6B7280')
        .attr('font-size', 11)
        .text(cat => cat)
    } else {
      svg.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(['All categories'])
        .join('text')
        .attr('x', marginLeft - 12)
        .attr('y', yCenter)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#6B7280')
        .attr('font-size', 11)
        .text(label => label)
    }

    // Draw vertical lines for average calories in each category (only in "by category" mode)
    if (viewMode === 'byCategory') {
      const avgByCat = categories.map(cat => {
        const items = foods.filter(f => f.category === cat)
        return {
          category: cat,
          avg: d3.mean(items, d => Number(d.calories) || 0) || 0,
        }
      })

      svg.append('g')
        .attr('class', 'avg-lines')
        .selectAll('line')
        .data(avgByCat)
        .join('line')
        .attr('x1', d => xScale(d.avg))
        .attr('x2', d => xScale(d.avg))
        .attr('y1', d => yScale(d.category) - 16)
        .attr('y2', d => yScale(d.category) + 16)
        .attr('stroke', '#9CA3AF')
        .attr('stroke-width', 1.25)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.9)
    }
    const axisG = svg.append('g')
      .attr('transform', `translate(0, ${height - 28})`)

    axisG.call(
      d3.axisBottom(xScale)
        .ticks(6)
        .tickSize(4)
        .tickFormat(d => `${d} kcal`)
    )

    axisG.select('.domain').attr('stroke', '#D3D1C7')
    axisG.selectAll('.tick line').attr('stroke', '#D3D1C7')
    axisG.selectAll('.tick text').attr('fill', '#888780').attr('font-size', 11)
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-400">Loading foods...</p>
      </div>
    )
  }

  if (foodsError) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-400">Load failed, please try again.</p>
      </div>
    )
  }

  if (!foods?.length) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-400">No food data available.</p>
      </div>
    )
  }

  const sizeByLabel = NUTRIENT_META[sizeBy]?.label ?? sizeBy

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-medium text-gray-800 mb-1">Caloric density explorer</h1>
        <p className="text-sm text-gray-400">
          Each bubble is one food item. Position = calories per 100g, size = {sizeByLabel}.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-xs font-medium uppercase tracking-wide text-gray-400">Bubble size by</label>
        <select
          value={sizeBy}
          onChange={(event) => setSizeBy(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
        >
          {sizeByOptions.map(option => (
            <option key={option.key} value={option.key}>
              {option.label}{option.unit ? ` (${option.unit})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label className="text-xs font-medium uppercase tracking-wide text-gray-400 mr-2">
          View mode
        </label>

        <button
          type="button"
          onClick={() => setViewMode('overall')}
          className={`px-3 py-2 rounded-lg text-sm border shadow-sm transition
            ${viewMode === 'overall'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
        >
          Overall
        </button>

        <button
          type="button"
          onClick={() => setViewMode('byCategory')}
          className={`px-3 py-2 rounded-lg text-sm border shadow-sm transition
            ${viewMode === 'byCategory'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
        >
          By Category
        </button>
      </div>

      <div className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" ref={wrapRef}>
        <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />

        {tooltip.visible && tooltip.food && (
          <div
            className="absolute pointer-events-none bg-white border border-gray-200 rounded-lg p-3 text-xs shadow-sm"
            style={{
              left: tooltip.x + 14,
              top:  tooltip.y - 10,
              minWidth: 180,
              zIndex: 10,
              transform: tooltip.x > (wrapRef.current?.clientWidth - 180)
                ? 'translateX(-110%)'
                : 'none',
            }}
          >
            <p className="font-medium text-gray-800 mb-1">{tooltip.food.food_name}</p>
            <p className="text-gray-400 mb-2">{tooltip.food.category || 'Uncategorized'}</p>
            <div className="flex flex-col gap-0.5 text-gray-600">
              <span>{formatNutrientValue('calories', tooltip.food.calories)} / 100g </span>
              <span>{formatNutrientValue('protein', tooltip.food.protein)}</span>
              <span>{formatNutrientValue('fat', tooltip.food.fat)}</span>
              <span>{formatNutrientValue('carbs', tooltip.food.carbs)}</span>
              <span>{formatNutrientValue('cholesterol', tooltip.food.cholesterol)}</span>
              <span>{formatNutrientValue('sodium', tooltip.food.sodium)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}