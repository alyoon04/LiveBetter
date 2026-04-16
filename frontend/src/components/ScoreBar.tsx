interface ScoreBarProps {
  score: number;
  className?: string;
}

export function ScoreBar({ score, className = '' }: ScoreBarProps) {
  const percentage = Math.round(score * 100);

  const getAccentColor = (score: number) => {
    if (score >= 0.75) return '#2DD4BF';
    if (score >= 0.55) return '#22C55E';
    if (score >= 0.4) return '#EAB308';
    if (score >= 0.25) return '#F97316';
    return '#EF4444';
  };

  const color = getAccentColor(score);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-[#6B6B7E] font-mono">Score</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>{percentage}</span>
      </div>
      <div className="w-full h-px bg-[#1E1E2A]">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
