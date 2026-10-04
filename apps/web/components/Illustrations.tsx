// Flat inline-SVG illustrations in the cool palette: cap, diploma, books, sparkle, three dots and the start-page hero.
import type { SVGProps } from "react";
type P = SVGProps<SVGSVGElement>;

export function Cap(props: P) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden {...props}>
      <path d="M14 30v12c0 6 36 6 36 0V30L32 38z" className="fill-primary-dark" />
      <polygon points="32,10 62,24 32,38 2,24" className="fill-primary" />
      <polygon points="32,10 62,24 32,26 2,24" className="fill-white/20" />
      <path d="M56 26v16" className="stroke-teal" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="56" cy="45" r="3.5" className="fill-teal" />
    </svg>
  );
}

export function Diploma(props: P) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden {...props}>
      <g transform="rotate(-18 32 32)">
        <rect x="6" y="22" width="52" height="20" rx="10" className="fill-white stroke-ink" strokeWidth="2.5" />
        <ellipse cx="52" cy="32" rx="6" ry="10" className="fill-primary-tint stroke-ink" strokeWidth="2.5" />
        <rect x="26" y="21" width="8" height="22" className="fill-violet" />
        <path d="M30 42l-4 10 6-3 6 3-4-10z" className="fill-violet-ink" />
      </g>
    </svg>
  );
}

export function Books(props: P) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden {...props}>
      <rect x="8" y="40" width="48" height="12" rx="3" className="fill-teal" />
      <rect x="12" y="27" width="42" height="12" rx="3" className="fill-violet" />
      <rect x="6" y="14" width="44" height="12" rx="3" className="fill-sky" />
      <path d="M14 46h32M18 33h26M12 20h28" className="stroke-white/70" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Sparkle(props: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12-1-8-4-11-12-12C8 11 11 8 12 0z" />
    </svg>
  );
}

export function ThreeDots(props: P) {
  return (
    <svg viewBox="0 0 36 10" aria-hidden {...props}>
      <circle cx="5" cy="5" r="4" className="fill-primary" />
      <circle cx="18" cy="5" r="4" className="fill-teal" />
      <circle cx="31" cy="5" r="4" className="fill-violet" />
    </svg>
  );
}

/** Thin outlined pill with a line running across the page behind it. */
export function PillLine(props: P) {
  return (
    <svg viewBox="0 0 600 40" aria-hidden preserveAspectRatio="none" {...props}>
      <line x1="0" y1="20" x2="600" y2="20" className="stroke-primary/30" strokeWidth="1.5" />
      <rect x="170" y="6" width="150" height="28" rx="14" className="fill-paper stroke-primary" strokeWidth="1.5" />
    </svg>
  );
}

export function HeroScene(props: P) {
  return (
    <svg viewBox="0 0 400 360" aria-hidden {...props}>
      <circle cx="200" cy="190" r="165" className="fill-primary-tint" />
      <circle cx="338" cy="70" r="26" className="fill-sky-tint" />
      <circle cx="70" cy="95" r="16" className="fill-teal-tint" />
      {/* winding road */}
      <path d="M70 335C70 255 340 265 300 190C268 130 205 160 205 118" fill="none" className="stroke-ink" strokeWidth="40" strokeLinecap="round" />
      <path d="M70 335C70 255 340 265 300 190C268 130 205 160 205 118" fill="none" className="stroke-white" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 14" />
      {/* objects */}
      <Books x="18" y="236" width="96" height="96" />
      <Diploma x="262" y="238" width="104" height="104" />
      <Cap x="112" y="2" width="176" height="176" />
      <Sparkle x="296" y="118" width="26" height="26" className="twinkle fill-violet" />
      <Sparkle x="48" y="150" width="20" height="20" className="twinkle fill-teal" />
      <Sparkle x="348" y="192" width="14" height="14" className="twinkle fill-sky" />
    </svg>
  );
}
