import { useState } from 'react'
import { getIconForTier } from '../../config/foodCategories'

// ── Vertical Grouped Bar Chart ────────────────────────────────
// X-axis = food names, Y-axis = grams (Protein / Carbs / Fat)
// Each food gets 3 side-by-side colored bars.
const MACRO_SERIES = [
  { key: 'protein', label: 'Protein', color: '#5bbcff' },
  { key: 'carbs', label: 'Carbs', color: '#b094ff' },
  { key: 'fat', label: 'Fat', color: '#ffc147' },
]

function MacroStackBar({ foods }) {
  const [hoveredBar, setHoveredBar] = useState(null) // { foodIdx, key, val, food, s }
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  if (!foods || foods.length === 0) return null

  const maxVal = foods.reduce((m, f) => Math.max(m, f.protein || 0, f.carbs || 0, f.fat || 0), 1)

  const BAR_H = 300
  const BAR_W = 20
  const BAR_GAP = 3
  const GROUP_GAP = 20
  const GROUP_W = MACRO_SERIES.length * (BAR_W + BAR_GAP) - BAR_GAP + GROUP_GAP

  // Smart tooltip position: keep inside viewport on all sides
  const TIP_W = 150, TIP_H = 76
  const tipLeft = mouse.x + 16 + TIP_W > window.innerWidth ? mouse.x - TIP_W - 12 : mouse.x + 16
  const tipTop = mouse.y - TIP_H - 14 < 0 ? mouse.y + 14 : mouse.y - TIP_H - 14

  return (
    <div style={{ marginTop: 6 }}>
      {/* Title row */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Macro per 100g · Top {foods.length} foods
        </span>
      </div>

      {/* Chart — horizontally scrollable */}
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', position: 'relative' }}>

          {/* Y-axis labels */}
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            height: BAR_H, paddingBottom: 20, marginRight: 6, flexShrink: 0,
          }}>
            {[1, 0.75, 0.5, 0.25, 0].map(frac => (
              <span key={frac} style={{ fontSize: 13, color: 'var(--t5)', lineHeight: 2 }}>
                {Math.round(maxVal * frac)}
              </span>
            ))}
          </div>

          {/* Bars + x-labels */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: GROUP_GAP, flex: 1 }}>
            {foods.map((food, fi) => (
              <div key={food.id || food.name || fi}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
              >
                {/* Bar group */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: BAR_GAP, height: BAR_H - 20, position: 'relative' }}>
                  {/* Grid lines */}
                  {fi === 0 && [0.25, 0.5, 0.75, 1].map(frac => (
                    <div key={frac} style={{
                      position: 'absolute', left: 0, right: -(GROUP_W * foods.length),
                      top: `${(1 - frac) * 100}%`,
                      borderTop: '1px dashed rgba(255,255,255,0.07)',
                      pointerEvents: 'none',
                    }} />
                  ))}

                  {MACRO_SERIES.map(s => {
                    const val = food[s.key] || 0
                    const hPct = (val / maxVal) * 100
                    const isHov = hoveredBar?.foodIdx === fi && hoveredBar?.key === s.key
                    return (
                      <div
                        key={s.key}
                        onMouseEnter={() => setHoveredBar({ foodIdx: fi, key: s.key, val, food, s })}
                        onMouseMove={e => setMouse({ x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredBar(null)}
                        style={{
                          width: BAR_W,
                          height: `${hPct}%`,
                          minHeight: val > 0 ? 2 : 0,
                          background: isHov
                            ? `${s.color}dd`
                            : `linear-gradient(180deg, ${s.color} 0%, ${s.color}99 100%)`,
                          borderRadius: '3px 3px 0 0',
                          transition: 'background 0.15s, height 0.4s ease',
                          cursor: 'default', flexShrink: 0,
                          boxShadow: isHov ? `0 0 12px ${s.color}60` : 'none',
                        }}
                      />
                    )
                  })}
                </div>

                {/* X label */}
                <div style={{
                  width: MACRO_SERIES.length * (BAR_W + BAR_GAP) - BAR_GAP,
                  marginTop: 8, fontSize: 12, color: 'var(--t4)',
                  textAlign: 'center', lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', maxWidth: 68,
                }}>
                  {food.name.length > 12 ? food.name.slice(0, 12) + '…' : food.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend — bottom-right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginTop: 10 }}>
        {MACRO_SERIES.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, boxShadow: `0 0 6px ${s.color}60` }} />
            <span style={{ fontSize: 11, color: 'var(--t4)', letterSpacing: 0.3 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Fixed tooltip — follows cursor, never clipped ── */}
      {hoveredBar && (() => {
        const { val, food, s } = hoveredBar
        return (
          <div style={{
            position: 'fixed', left: tipLeft, top: tipTop,
            background: '#0f1020',
            border: `1px solid ${s.color}`,
            borderRadius: 10, padding: '8px 14px',
            whiteSpace: 'nowrap', zIndex: 99999,
            pointerEvents: 'none',
            boxShadow: `0 8px 28px rgba(0,0,0,0.85), inset 0 1px 0 ${s.color}30`,
          }}>
            {/* Shimmer */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)`,
              borderRadius: '10px 10px 0 0',
            }} />
            <div style={{ fontSize: 10, color: 'var(--t4)', marginBottom: 5, lineHeight: 1 }}>
              {food.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{val}</span>
              <span style={{ fontSize: 11, color: 'var(--t4)' }}>g</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// (FoodCard, MacroPill, MicroBadge, CalorieDensityGauge removed)

// ── Tier popup modal (click) ──────────────────────────────────
function TierPopup({ tier, foods, onClose }) {
  const avg = tier.avgNutrition   // may be undefined for tiers without it

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        @keyframes popIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .popup-scroll::-webkit-scrollbar { width: 4px; }
        .popup-scroll::-webkit-scrollbar-track { background: transparent; }
        .popup-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
      `}</style>
      <div style={{
        background: '#0f1020',
        border: `1px solid ${tier.color}35`,
        borderRadius: 20,
        width: '100%', maxWidth: 760, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: `0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)`,
        animation: 'popIn 0.2s ease',
      }}>

        {/* ── Header ── */}
        <div style={{
          background: `linear-gradient(135deg, ${tier.color}18 0%, transparent 80%)`,
          borderBottom: `1px solid ${tier.color}25`,
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, ${tier.color}60, transparent)`
          }} />
          <div style={{
            width: 48, height: 48,
            background: `${tier.color}20`, border: `1px solid ${tier.color}40`,
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>
            {getIconForTier(tier.id)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: tier.color, letterSpacing: 0.3 }}>{tier.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>{tier.subtitle}</div>
              {tier.servingHint && (
                <span style={{
                  fontSize: 10, color: tier.color,
                  background: `${tier.color}15`,
                  border: `1px solid ${tier.color}30`,
                  borderRadius: 20, padding: '1px 8px',
                }}>
                  {tier.servingHint}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: 'var(--t2)', fontSize: 16,
            width: 34, height: 34, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--t2)' }}
          >✕</button>
        </div>

        {/* ── Description + tip ── */}
        {tier.description && (
          <div style={{
            padding: '14px 24px',
            background: `${tier.color}08`,
            borderBottom: `1px solid ${tier.color}15`,
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.65, marginBottom: tier.tip ? 8 : 0 }}>
              {tier.description}
            </div>
            {tier.tip && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 6,
                background: `${tier.color}12`, border: `1px solid ${tier.color}25`,
                borderRadius: 8, padding: '8px 12px',
              }}>
                <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>💡</span>
                <span style={{ fontSize: 11, color: tier.color, lineHeight: 1.5 }}>{tier.tip}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Vertical Macro Bar Chart + Calorie Density Gauge ── */}
        <div className="popup-scroll" style={{
          overflowY: 'auto', padding: '16px 24px 24px',
          background: `${tier.color}06`,
          borderBottom: `1px solid ${tier.color}15`,
          flexShrink: 1,
        }}>
          <MacroStackBar foods={foods} tierColor={tier.color} />
        </div>
      </div>
    </div>
  )
}


function PyramidBar({ tier, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)
  const isHighlighted = isActive || hovered
  const p = tier.portionPer100g
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: `${tier.width}%`,
        alignSelf: 'center',
        marginBottom: 4,
        background: isActive
          ? `linear-gradient(135deg, ${tier.color}30, ${tier.color}18)`
          : hovered
            ? `linear-gradient(135deg, ${tier.color}22, ${tier.color}10)`
            : `${tier.color}0e`,
        borderColor: isHighlighted ? tier.color : `${tier.color}35`,
        borderWidth: isActive ? 2 : 1,
        borderStyle: 'solid',
        borderRadius: 9,
        minHeight: 50,
        padding: hovered ? '8px 14px 10px' : '0 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isActive ? 'scaleX(1.025)' : hovered ? 'scaleX(1.012)' : 'scaleX(1)',
        boxShadow: isActive
          ? `0 6px 24px ${tier.color}28, inset 0 1px 0 ${tier.color}40`
          : hovered
            ? `0 4px 18px ${tier.color}28`
            : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isHighlighted && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${tier.color}70, transparent)`,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        display: 'flex', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, width: '100%',
        transition: 'transform 0.25s ease',
      }}>
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>
          {getIconForTier(tier.id)}
        </span>
        <div style={{ textAlign: 'center', lineHeight: 1.25 }}>
          <div style={{
            color: isHighlighted ? tier.color : `${tier.color}cc`,
            fontWeight: 700, fontSize: 12,
            letterSpacing: 0.6, textTransform: 'uppercase',
            transition: 'color 0.2s', whiteSpace: 'nowrap',
          }}>
            {tier.label}
          </div>
          <div style={{ color: 'var(--t3)', fontSize: 10, whiteSpace: 'nowrap' }}>
            {tier.subtitle}
          </div>
        </div>
      </div>
      {/* Inline macro ranges — slide in on hover */}
      <div style={{
        overflow: 'hidden',
        maxHeight: hovered ? 32 : 0,
        opacity: hovered ? 1 : 0,
        transition: 'max-height 0.25s ease, opacity 0.2s ease',
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginTop: 7,
          paddingTop: 6,
          borderTop: `1px solid ${tier.color}25`,
          flexWrap: 'wrap',
        }}>
          {[
            { key: 'calories', label: 'Cal', color: '#6effc4' },
            { key: 'protein', label: 'Pro', color: '#5bbcff' },
            { key: 'carbs', label: 'Carb', color: '#b094ff' },
            { key: 'fat', label: 'Fat', color: '#ffc147' },
          ].map(({ key, label, color }) => p?.[key] ? (
            <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {label}
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, color, whiteSpace: 'nowrap' }}>
                {p[key]}
              </span>
            </div>
          ) : null)}
        </div>
      </div>
    </div>
  )
}

// ── PyramidChart ─────────────────────────────────────────────
export default function PyramidChart({ tiers = [], tierFoods = [] }) {
  const [activeTierId, setActiveTierId] = useState(null)

  // PYRAMID_TIERS is bottom-to-top; reverse so narrowest (top) renders first
  const ordered = [...tiers].reverse()

  // tierId → foods[] lookup
  const foodMap = {}
  for (const item of tierFoods) {
    if (item?.tier?.id) foodMap[item.tier.id] = item.foods || []
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{
          width: '100%', fontSize: 10, color: 'var(--t4)',
          marginBottom: 12, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: 1.4,
          textAlign: 'right',
        }}>
          Ăn ít ▲
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {ordered.map((tier) => (
            <PyramidBar
              key={tier.id}
              tier={tier}
              isActive={activeTierId === tier.id}
              onClick={() => setActiveTierId(activeTierId === tier.id ? null : tier.id)}
            />
          ))}
        </div>
        <div style={{
          width: '100%', fontSize: 10, color: 'var(--t4)',
          marginTop: 10, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: 1.4,
          textAlign: 'left',
        }}>
          ▼ Ăn nhiều nhất
        </div>
      </div>

      {/* Click popup */}
      {activeTierId && (() => {
        const tier = tiers.find(t => t.id === activeTierId)
        if (!tier) return null
        return (
          <TierPopup
            tier={tier}
            foods={foodMap[tier.id] || []}
            onClose={() => setActiveTierId(null)}
          />
        )
      })()}
    </>
  )
}