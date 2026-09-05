/**
 * A Dalarna-folk floral divider — used only around the city and celebratory surfaces,
 * never on the quiz screen (SPEC.md §11.1: "never decorate a quiz").
 */
export default function KurbitsDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 16"
      preserveAspectRatio="none"
      className={'h-4 w-full text-falu/50 dark:text-gold/40 ' + (className ?? '')}
      aria-hidden="true"
    >
      <path
        d="M0 8 Q15 2 30 8 T60 8 T90 8 T120 8 T150 8 T180 8 T210 8 T240 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {[20, 60, 100, 140, 180, 220].map((x) => (
        <g key={x} transform={`translate(${x} 8)`} fill="currentColor">
          <circle r="2.4" />
          <circle cx="-5" cy="-1" r="1.3" />
          <circle cx="5" cy="-1" r="1.3" />
        </g>
      ))}
    </svg>
  );
}
