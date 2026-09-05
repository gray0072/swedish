/**
 * The Dalarna horse (dalahäst) — the app's mascot. Flat silhouette, falu red, kurbits-style
 * saddle dots. Used as a loading spinner (`spin`) and as empty-state illustration. See
 * SPEC.md §11.4 — one of the few pieces of ornament allowed outside the city screen.
 */
export default function DalaHorse({
  className,
  spin = false,
}: {
  className?: string;
  spin?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 80"
      className={(spin ? 'animate-dala-rock ' : '') + (className ?? '')}
      style={spin ? { transformOrigin: '50% 90%' } : undefined}
      role="img"
      aria-label="Dalahäst"
    >
      <g fill="#7C3228">
        {/* legs */}
        <rect x="30" y="52" width="7" height="20" rx="2" />
        <rect x="44" y="54" width="7" height="18" rx="2" />
        <rect x="58" y="54" width="7" height="18" rx="2" />
        <rect x="70" y="52" width="7" height="20" rx="2" />
        {/* body */}
        <ellipse cx="52" cy="46" rx="30" ry="15" />
        {/* neck + chest */}
        <path d="M74 40 Q86 30 82 16 Q78 8 68 12 Q64 22 66 34 Z" />
        {/* head */}
        <ellipse cx="80" cy="14" rx="9" ry="7" />
        {/* ears */}
        <path d="M74 8 L76 1 L79 8 Z" />
        <path d="M83 7 L86 1 L88 8 Z" />
        {/* muzzle */}
        <ellipse cx="88" cy="16" rx="4" ry="3" />
        {/* tail */}
        <path d="M22 40 Q10 44 12 56 Q14 62 20 58 Q16 50 22 44 Z" />
      </g>
      {/* kurbits saddle dots */}
      <g fill="#C8A24A">
        <circle cx="45" cy="38" r="2.4" />
        <circle cx="53" cy="35" r="2.4" />
        <circle cx="61" cy="38" r="2.4" />
        <circle cx="53" cy="43" r="1.8" />
      </g>
    </svg>
  );
}
