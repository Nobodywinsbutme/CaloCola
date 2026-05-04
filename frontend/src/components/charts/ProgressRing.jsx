import { useEffect, useRef } from 'react'

export default function ProgressRing({
  value, max, size = 120, stroke = 10,
  color = 'var(--amber)', label = 'kcal'
}) {
  const circleRef = useRef(null)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(1, Math.max(0, value / max))
  const offset = circumference * (1 - progress)

  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    el.style.strokeDashoffset = circumference
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)'
        el.style.strokeDashoffset = offset
      })
    })
  }, [offset, circumference])

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--ink4)" strokeWidth={stroke} fill="none" />
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div className="ring-center">
        <div className="ring-value">{Math.round(value)}</div>
        <div className="ring-sub">{label}</div>
      </div>
    </div>
  )
}
