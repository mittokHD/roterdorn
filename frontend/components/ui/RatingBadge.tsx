interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

function getRatingColor(rating: number): {
  bg: string;
  text: string;
  glow: string;
  label: string;
} {
  if (rating < 5) {
    return {
      bg: "rgba(239, 68, 68, 0.15)",
      text: "#ef4444",
      glow: "0 0 16px rgba(239, 68, 68, 0.3)",
      label: "Schwach",
    };
  }
  if (rating <= 7) {
    return {
      bg: "rgba(245, 158, 11, 0.15)",
      text: "#f59e0b",
      glow: "0 0 16px rgba(245, 158, 11, 0.3)",
      label: "Solide",
    };
  }
  return {
    bg: "rgba(34, 197, 94, 0.15)",
    text: "#22c55e",
    glow: "0 0 16px rgba(34, 197, 94, 0.3)",
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
      className={`inline-flex items-center justify-center font-semibold rounded-lg tabular-nums tracking-tight ${SIZE_CLASSES[size]}`}
      style={{
        background: colors.bg,
        color: colors.text,
        boxShadow: colors.glow,
        border: `1px solid ${colors.text}20`,
      }}
      title={`${rating.toFixed(1)} / 10 — ${colors.label}`}
    >
      {rating.toFixed(1)}
    </span>
  );
}
