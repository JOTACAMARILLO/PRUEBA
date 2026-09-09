import type { Recommendation } from '../lib/calc';

export default function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className={`recommendation recommendation-${rec.tone}`}>
      <div className="recommendation-headline">{rec.headline}</div>
      <div className="recommendation-detail">{rec.detail}</div>
    </div>
  );
}
