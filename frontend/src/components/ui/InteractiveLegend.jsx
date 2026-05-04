export default function InteractiveLegend({ items = [], active, onSelect }) {
  return (
    <div className="legend">
      {items.map(item => (
        <button
          key={item.label}
          type="button"
          className={`legend-item${active === item.value ? ' active' : ''}`}
          onClick={() => onSelect?.(item.value)}
        >
          <span className="legend-dot" style={{ background: item.color }} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
