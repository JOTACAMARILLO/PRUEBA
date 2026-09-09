export default function StatTile({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: 'good' | 'warn' | 'bad';
}) {
  return (
    <div className={`stat-tile${accent ? ` stat-${accent}` : ''}`}>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
