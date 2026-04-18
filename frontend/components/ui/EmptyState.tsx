// ─── Empty State Component ───────────────────
// Shared "no data" placeholder used across list pages.

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div
      className="glass-card p-12 text-center"
      style={{ color: "var(--text-muted)" }}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        {title}
      </h3>
      <p className="text-sm max-w-md mx-auto">{description}</p>
    </div>
  );
}
