export default function StatCard({ label, value, unit, tone = 'default' }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        <span>{value}</span>
        {unit ? <span className="stat-unit">{unit}</span> : null}
      </div>
    </div>
  )
}
