import { useEffect, useRef } from 'react'

const SPOKES = ['PROTEIN', 'VITAMIN A', 'IRON', 'FATS', 'FIBER', 'CALCIUM', 'MAGNESIUM', 'CARBS']

function toPoint(i, n, r, cx, cy) {
  const angle = (Math.PI * 2 * i) / n - Math.PI / 2
  return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]
}

export default function RadarChart({ values = [85, 70, 50, 45, 95, 60, 55, 75] }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !values.length) return
    const W = canvas.offsetWidth || 400
    canvas.width = W
    const H = canvas.height
    const ctx = canvas.getContext('2d')
    const cx = W / 2, cy = H / 2
    const n = SPOKES.length
    const R = Math.min(W, H) * 0.32

    ctx.clearRect(0, 0, W, H)

    // Background Grid Rings
    ;[25, 50, 75, 100].forEach(p => {
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const [x, y] = toPoint(i, n, R * p / 100, cx, cy)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Center Spokes
    for (let i = 0; i < n; i++) {
      const [x, y] = toPoint(i, n, R, cx, cy)
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(x, y)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Value Polygon
    ctx.beginPath()
    values.forEach((v, i) => {
      const p = Math.min(v, 100) / 100
      const [x, y] = toPoint(i, n, R * p, cx, cy)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.closePath()

    // Apply Neon Glow Effect
    ctx.shadowColor = '#34d399' // Neon green glow
    ctx.shadowBlur = 25
    ctx.fillStyle = 'rgba(52, 211, 153, 0.15)'
    ctx.fill()

    // Stronger glow for the stroke
    ctx.shadowBlur = 12
    ctx.strokeStyle = '#34d399'
    ctx.lineWidth = 3
    ctx.stroke()

    // Reset shadow for text rendering
    ctx.shadowBlur = 0

    // Outer Labels
    ctx.font = '10px "Space Mono", monospace, sans-serif'
    ctx.fillStyle = '#6b7280'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    SPOKES.forEach((label, i) => {
      const [x, y] = toPoint(i, n, R + 35, cx, cy)
      ctx.fillText(label, x, y)
    })
  }, [values])

  return (
    <div style={{ background: '#0b0f19', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path>
        </svg>
        <h3 style={{ margin: 0, color: '#34d399', fontSize: '18px', fontWeight: 600 }}>Nutritional Fingerprint</h3>
        <span style={{ color: '#4b5563', fontSize: '10px', fontWeight: 600, marginLeft: '4px' }}>PROTEIN</span>
      </div>
      <div style={{ color: '#4b5563', fontSize: '12px', letterSpacing: '2px', marginBottom: '24px', fontFamily: 'monospace' }}>
        8-SPOKE BIOMETRIC RADAR
      </div>
      
      <canvas ref={canvasRef} height={350} style={{ width: '100%', display: 'block' }} />
    </div>
  )
}