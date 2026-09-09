import type { WeightEntry } from '../types';

export default function WeightChart({
  entries,
  goalWeightKg,
}: {
  entries: WeightEntry[];
  goalWeightKg: number;
}) {
  if (entries.length < 2) {
    return <p className="muted">Registra al menos dos pesajes para ver tu tendencia.</p>;
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sorted.map((e) => e.weightKg);
  const min = Math.min(...weights, goalWeightKg) - 1;
  const max = Math.max(...weights, goalWeightKg) + 1;

  const width = 600;
  const height = 220;
  const padX = 30;
  const padY = 20;

  const xFor = (i: number) =>
    padX + (i / (sorted.length - 1)) * (width - padX * 2);
  const yFor = (w: number) =>
    height - padY - ((w - min) / (max - min)) * (height - padY * 2);

  const linePoints = sorted.map((e, i) => `${xFor(i)},${yFor(e.weightKg)}`).join(' ');
  const goalY = yFor(goalWeightKg);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="weight-chart" role="img" aria-label="Gráfico de peso">
      <line x1={padX} y1={goalY} x2={width - padX} y2={goalY} className="chart-goal-line" />
      <text x={width - padX} y={goalY - 6} textAnchor="end" className="chart-goal-label">
        Objetivo {goalWeightKg} kg
      </text>
      <polyline points={linePoints} className="chart-line" fill="none" />
      {sorted.map((e, i) => (
        <circle key={e.id} cx={xFor(i)} cy={yFor(e.weightKg)} r={3.5} className="chart-dot" />
      ))}
      <text x={padX} y={height - 4} className="chart-axis-label">
        {sorted[0].date}
      </text>
      <text x={width - padX} y={height - 4} textAnchor="end" className="chart-axis-label">
        {sorted[sorted.length - 1].date}
      </text>
    </svg>
  );
}
