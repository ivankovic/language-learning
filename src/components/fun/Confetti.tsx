const COLORS = ["#f43f5e", "#f59e0b", "#22c55e", "#0ea5e9", "#a855f7", "#ec4899"];

// Deterministic per-piece spread/delay/rotation so bursts look varied without
// needing Math.random() (keeps re-renders and tests predictable).
const PIECES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  x: `${((i * 53) % 60) - 30}px`,
  delay: `${(i % 5) * 60}ms`,
  color: COLORS[i % COLORS.length],
  rotate: (i * 47) % 360,
}));

/** A brief confetti burst, absolutely positioned over its nearest `relative` ancestor. Remount with a new `key` to replay. */
export function Confetti({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="fun-confetti-piece absolute top-0 h-2.5 w-2.5 rounded-sm"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            transform: `rotate(${p.rotate}deg)`,
            // @ts-expect-error custom property consumed by the fun-confetti-fall keyframes in index.css
            "--fun-confetti-x": p.x,
          }}
        />
      ))}
    </div>
  );
}
