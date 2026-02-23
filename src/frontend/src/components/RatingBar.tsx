interface RatingBarProps {
  rating: number;
  maxRating?: number;
}

export default function RatingBar({ rating, maxRating = 10 }: RatingBarProps) {
  const percentage = (rating / maxRating) * 100;
  
  const getColorClass = () => {
    if (percentage >= 80) return 'bg-gold';
    if (percentage >= 60) return 'bg-chart-2';
    if (percentage >= 40) return 'bg-chart-3';
    return 'bg-chart-4';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">Rating</span>
        <span className="font-semibold text-gold">{rating}/{maxRating}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${getColorClass()} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
