export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-20 bg-brand-500 scale-150"
        />
        {/* Inner spinning ring */}
        <div 
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ 
            borderColor: "var(--bg-tertiary)",
            borderTopColor: "var(--brand-500)" 
          }}
        />
        {/* Center dot */}
        <div 
          className="absolute w-2 h-2 rounded-full animate-pulse"
          style={{ background: "var(--brand-500)" }}
        />
      </div>
      <p 
        className="mt-6 text-sm font-medium tracking-widest uppercase animate-pulse"
        style={{ color: "var(--text-secondary)" }}
      >
        Lade Inhalt...
      </p>
    </div>
  );
}
