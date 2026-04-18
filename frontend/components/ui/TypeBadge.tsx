import type { RezensionType } from "@/lib/types";
import { TYPE_META } from "@/lib/constants";

interface TypeBadgeProps {
  type: RezensionType;
  size?: "sm" | "md";
}

export default function TypeBadge({ type, size = "md" }: TypeBadgeProps) {
  const meta = TYPE_META[type];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1"
      }`}
      style={{
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.color}20`,
      }}
    >
      <span>{meta.icon}</span>
      {type}
    </span>
  );
}
