/** Fun Mode's mascot: a friendly ladybug. Pure inline SVG (no image assets) so it scales crisply and themes via currentColor/Tailwind classes. */
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
      aria-label="Ladybug mascot"
    >
      {/* legs */}
      <ellipse
        cx="16"
        cy={celebrating ? "52" : "64"}
        rx="7"
        ry={celebrating ? "12" : "11"}
        fill="#1f2937"
        transform={celebrating ? "rotate(-30 16 52)" : undefined}
      />
      <ellipse
        cx="84"
        cy={celebrating ? "52" : "64"}
        rx="7"
        ry={celebrating ? "12" : "11"}
        fill="#1f2937"
        transform={celebrating ? "rotate(30 84 52)" : undefined}
      />
      {/* shell */}
      <ellipse cx="50" cy="60" rx="33" ry="30" fill="#dc2626" />
      {/* wing split */}
      <path d="M50,34 L50,88" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
      {/* spots */}
      <circle cx="36" cy="44" r="4.2" fill="#1f2937" />
      <circle cx="64" cy="44" r="4.2" fill="#1f2937" />
      <circle cx="30" cy="60" r="5.2" fill="#1f2937" />
      <circle cx="70" cy="60" r="5.2" fill="#1f2937" />
      <circle cx="38" cy="78" r="4.6" fill="#1f2937" />
      <circle cx="62" cy="78" r="4.6" fill="#1f2937" />
      {/* antennae */}
      {celebrating ? (
        <>
          <path d="M40,16 Q30,6 24,12" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M60,16 Q70,6 76,12" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="24" cy="12" r="2.6" fill="#1f2937" />
          <circle cx="76" cy="12" r="2.6" fill="#1f2937" />
        </>
      ) : (
        <>
          <path d="M40,16 Q34,4 26,6" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M60,16 Q66,4 74,6" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="26" cy="6" r="2.6" fill="#1f2937" />
          <circle cx="74" cy="6" r="2.6" fill="#1f2937" />
        </>
      )}
      {/* head */}
      <ellipse cx="50" cy="27" rx="18" ry="16" fill="#1f2937" />
      {/* eyes */}
      {celebrating ? (
        <>
          <path d="M35,27 Q42,20 49,27" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d="M51,27 Q58,20 65,27" stroke="white" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="42" cy="27" r="8.5" fill="white" />
          <circle cx="58" cy="27" r="8.5" fill="white" />
          <circle cx="43" cy="28" r="4.2" fill="#1f2937" />
          <circle cx="57" cy="28" r="4.2" fill="#1f2937" />
          <circle cx="41.5" cy="26" r="1.4" fill="white" />
          <circle cx="55.5" cy="26" r="1.4" fill="white" />
        </>
      )}
    </svg>
  );
}
