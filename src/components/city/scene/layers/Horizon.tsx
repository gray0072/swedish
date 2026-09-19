/**
 * Layer 2 (`horizon`) — the distant mainland ridge, three fixed depth bands. No parallax, no
 * motion: it exists purely to give the water a far edge instead of ending at a hard rectangle.
 */
export default function Horizon() {
  return (
    <g aria-hidden="true">
      <path d="M0 560 Q 200 520 420 545 T 820 540 T 1200 555 V 640 H 0 Z" fill="var(--horizon)" opacity="0.06" />
      <path d="M0 580 Q 260 545 520 568 T 940 560 T 1200 572 V 650 H 0 Z" fill="var(--horizon)" opacity="0.1" />
      <path d="M0 600 Q 300 575 600 592 T 1050 588 T 1200 596 V 660 H 0 Z" fill="var(--horizon)" opacity="0.14" />
    </g>
  );
}
