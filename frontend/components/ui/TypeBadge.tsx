import type { RezensionType } from "@/lib/types";

interface TypeBadgeProps {
  type: RezensionType;
  size?: "sm" | "md";
}

const TYPE_CONFIG: Record<
  RezensionType,
  { icon: string; color: string; bg: string }
> = {
  Buch: {
    icon: "📚",
    color: "#818cf8",
    bg: "rgba(129, 140, 248, 0.12)",
  },
  Film: {
    icon: "🎬",
    color: "#f472b6",
    bg: "rgba(244, 114, 182, 0.12)",
  },
  Musik: {
    icon: "🎵",
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.12)",
  },
  Spiel: {
    icon: "🎮",
    color: "#60a5fa",
    bg: "rgba(96, 165, 250, 0.12)",
  },
  Event: {
    icon: "🎪",
    color: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.12)",
  },
};

export default function TypeBadge({ type, size = "md" }: TypeBadgeProps) {
  const config = TYPE_CONFIG[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1"
      }`}
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.color}20`,
      }}
    >
      <span>{config.icon}</span>
      {type}
    </span>
  );
}
