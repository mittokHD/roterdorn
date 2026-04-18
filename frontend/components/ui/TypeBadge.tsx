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
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${
        size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1"
      } ${meta.className}`}
    >
      <span>{meta.icon}</span>
      {type}
    </span>
  );
}
