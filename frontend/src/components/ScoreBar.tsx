interface ScoreBarProps {
  score: number;
  className?: string;
}

export function ScoreBar({ score, className = '' }: ScoreBarProps) {
  const percentage = Math.round(score * 100);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">Score</span>
        <span className="text-sm font-mono font-bold text-white">{percentage}</span>
      </div>
      <div className="w-full h-px bg-white/10">
        <div
          className="h-full transition-all duration-700 ease-out bg-white"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
