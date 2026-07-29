/** Fun Mode's mascot: a friendly owl. Pure inline SVG (no image assets) so it scales crisply and themes via currentColor/Tailwind classes. */
export function Mascot({
  expression = "happy",
  className = "h-20 w-20",
}: {
  expression?: "happy" | "celebrate";
  className?: string;
}) {
  const celebrating = expression === "celebrate";
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${celebrating ? "" : "fun-bob"}`}
      role="img"
      aria-label="Owl mascot"
    >
      {/* wings */}
      <ellipse
        cx="20"
        cy={celebrating ? "45" : "60"}
        rx="10"
        ry="16"
        fill="#f59e0b"
        transform={celebrating ? "rotate(-25 20 45)" : undefined}
      />
      <ellipse
        cx="80"
        cy={celebrating ? "45" : "60"}
        rx="10"
        ry="16"
        fill="#f59e0b"
        transform={celebrating ? "rotate(25 80 45)" : undefined}
      />
      {/* body */}
      <ellipse cx="50" cy="58" rx="34" ry="32" fill="#fbbf24" />
      <ellipse cx="50" cy="64" rx="22" ry="20" fill="#fff7ed" />
      {/* ear tufts */}
      <path d="M28 30 L34 12 L42 28 Z" fill="#f59e0b" />
      <path d="M72 30 L66 12 L58 28 Z" fill="#f59e0b" />
      {/* eyes */}
      <circle cx="38" cy="50" r="14" fill="white" />
      <circle cx="62" cy="50" r="14" fill="white" />
      {celebrating ? (
        <>
          <path d="M32 50 L38 44 L44 50" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M56 50 L62 44 L68 50" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="39" cy="51" r="5" fill="#1e293b" />
          <circle cx="63" cy="51" r="5" fill="#1e293b" />
        </>
      )}
      {/* beak */}
      <path d="M46 62 L54 62 L50 70 Z" fill="#fb923c" />
      {/* feet */}
      <path d="M40 88 L40 80 M36 88 L44 88" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 88 L60 80 M56 88 L64 88" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
