interface ScoreBarProps {
  score: number;
  className?: string;
}

export function ScoreBar({ score, className = '' }: ScoreBarProps) {
  // Convert score (0-1) to percentage
  const percentage = Math.round(score * 100);

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 0.8) return 'bg-accent-500';
    if (score >= 0.6) return 'bg-green-500';
    if (score >= 0.4) return 'bg-yellow-500';
    if (score >= 0.2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = (score: number) => {
    if (score >= 0.8) return 'text-accent-700 dark:text-accent-400';
    if (score >= 0.6) return 'text-green-700 dark:text-green-400';
    if (score >= 0.4) return 'text-yellow-700 dark:text-yellow-400';
    if (score >= 0.2) return 'text-orange-700 dark:text-orange-400';
    return 'text-red-700 dark:text-red-400';
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Affordability</span>
        <span className={`text-sm font-bold font-mono ${getTextColor(score)}`}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
