interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

function getRatingColor(rating: number): {
  className: string;
  label: string;
} {
  if (rating < 5) {
    return {
      className: "text-red-500 bg-red-500/15 border-red-500/20 shadow-[0_0_16px_rgba(239,68,68,0.3)]",
      label: "Schwach",
    };
  }
  if (rating <= 7) {
    return {
      className: "text-amber-500 bg-amber-500/15 border-amber-500/20 shadow-[0_0_16px_rgba(245,158,11,0.3)]",
      label: "Solide",
    };
  }
  return {
    className: "text-green-500 bg-green-500/15 border-green-500/20 shadow-[0_0_16px_rgba(34,197,94,0.3)]",
    label: "Stark",
  };
}

const SIZE_CLASSES = {
  sm: "text-xs px-2 py-0.5 min-w-[36px]",
  md: "text-sm px-2.5 py-1 min-w-[44px]",
  lg: "text-lg px-3 py-1.5 min-w-[52px] font-bold",
};

export default function RatingBadge({ rating, size = "md" }: RatingBadgeProps) {
  if (rating == null || isNaN(rating)) {
    return null;
  }

  const colors = getRatingColor(rating);

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold rounded-lg tabular-nums tracking-tight border ${SIZE_CLASSES[size]} ${colors.className}`}
      title={`${rating.toFixed(1)} / 10 — ${colors.label}`}
    >
      {rating.toFixed(1)}
    </span>
  );
}
