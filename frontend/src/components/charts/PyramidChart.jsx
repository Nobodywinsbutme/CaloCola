import { useState } from 'react'

export default function PyramidChart({ tiers = [] }) {
  const [hoveredTier, setHoveredTier] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // tiers come in bottom-to-top order from parent; reverse for visual (tip at top)
  const ordered = [...tiers].reverse()

  const handleMouseMove = (e) => {
    // Track mouse position for the floating tooltip
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div 
      className="pyramid" 
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative' }}
      onMouseMove={handleMouseMove}
    >

      {/* Added width: '100%' so the text can actually align to the right edge */}
      <div style={{ width: '100%', fontSize: 11, color: 'var(--t3)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' }}>
        Eat Sparingly ▲
      </div>

      {ordered.map((tier) => {
        const isHov = hoveredTier?.label === tier.label
        return (
          <div
            key={tier.label}
            onMouseEnter={() => setHoveredTier(tier)}
            onMouseLeave={() => setHoveredTier(null)}
            style={{
              width: `${tier.width}%`,
              background: isHov ? `${tier.color}33` : `${tier.color}16`,
              borderColor: isHov ? tier.color : `${tier.color}40`,
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 8,
              minHeight: 46,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHov ? 'scale(1.03)' : 'scale(1)',
              boxShadow: isHov ? `0 8px 16px ${tier.color}20` : 'none',
              zIndex: isHov ? 10 : 1
            }}
          >
            <span style={{ fontSize: 18 }}>{tier.icon}</span>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ color: tier.color, fontWeight: 700, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                {tier.label}
              </div>
              <div style={{ color: 'var(--t2)', fontSize: 11 }}>
                {tier.subtitle}
              </div>
            </div>
          </div>
        )
      })}
      
      {/* Added width: '100%' so the text can actually align to the left edge */}
      <div style={{ width: '100%', fontSize: 11, color: 'var(--t3)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left' }}>
        ▼ Eat Most
      </div>

      {/* Floating Tooltip */}
      {hoveredTier && hoveredTier.sample && (
        <div style={{
          position: 'fixed',
          left: mousePos.x + 16,
          top: mousePos.y + 16,
          background: 'rgba(20, 20, 26, 0.95)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${hoveredTier.color}60`,
          borderRadius: 8,
          padding: 14,
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          minWidth: 220,
          color: '#fff'
        }}>
          <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8, color: hoveredTier.color, borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: 6 }}>
            {hoveredTier.label}: <span style={{ color: '#fff' }}>{hoveredTier.sample.name}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 12px' }}>
            <span>Calories:</span> <strong style={{ color: '#fff' }}>{hoveredTier.sample.calories}</strong>
            <span>Protein:</span> <strong style={{ color: '#fff' }}>{hoveredTier.sample.protein}g</strong>
            <span>Carbohydrates:</span> <strong style={{ color: '#fff' }}>{hoveredTier.sample.carbs}g</strong>
            <span>Fat:</span> <strong style={{ color: '#fff' }}>{hoveredTier.sample.fat}g</strong>
          </div>
        </div>
      )}
    </div>
  )
}