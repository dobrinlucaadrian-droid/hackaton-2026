// Flat inline-SVG illustrations in the cool palette: cap, diploma, books, sparkle, three dots, the start-page hero, the broken road of the error page, and the page drawings of Universități, Ghiduri, Specializări, Studenți, Chestionar and "nothing found".
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

/** The error-page drawing: a graduation cap above a road that breaks in the middle. */
export function BrokenPath(props: P) {
  return (
    <svg viewBox="0 0 220 120" aria-hidden {...props}>
      <path d="M10 100 C 50 100, 60 70, 95 70" fill="none" className="stroke-ink" strokeWidth="10" strokeLinecap="round" />
      <path d="M125 70 C 160 70, 170 40, 210 40" fill="none" className="stroke-primary" strokeWidth="10" strokeLinecap="round" />
      <path d="M10 100 C 50 100, 60 70, 95 70" fill="none" className="stroke-paper" strokeWidth="2" strokeDasharray="6 6" />
      <path d="M125 70 C 160 70, 170 40, 210 40" fill="none" className="stroke-paper" strokeWidth="2" strokeDasharray="6 6" />
      <polygon points="110,18 140,30 110,42 80,30" className="fill-ink" />
      <rect x="96" y="34" width="28" height="12" rx="3" className="fill-ink" />
      <line x1="140" y1="30" x2="140" y2="50" className="stroke-primary" strokeWidth="2" />
      <circle cx="140" cy="52" r="3" className="fill-primary" />
      <text x="110" y="80" textAnchor="middle" fontSize="20" fontWeight="700" className="fill-primary">?</text>
    </svg>
  );
}

/** Universități: a university building with columns and a magnifying glass in front of it. */
export function UniversityScene(props: P) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden {...props}>
      <circle cx="80" cy="64" r="54" className="fill-primary-tint" />
      {/* building */}
      <polygon points="80,18 128,40 32,40" className="fill-primary" />
      <polygon points="80,18 128,40 80,34 32,40" className="fill-white/20" />
      <rect x="36" y="40" width="88" height="6" rx="2" className="fill-primary-dark" />
      {[44, 60, 76, 92, 108].map((x) => (
        <rect key={x} x={x} y="48" width="8" height="36" rx="2" className="fill-white stroke-ink" strokeWidth="2" />
      ))}
      <rect x="30" y="84" width="100" height="8" rx="2" className="fill-ink" />
      <rect x="24" y="92" width="112" height="6" rx="2" className="fill-sky" />
      {/* magnifying glass */}
      <line x1="128" y1="96" x2="146" y2="114" className="stroke-ink" strokeWidth="7" strokeLinecap="round" />
      <circle cx="118" cy="86" r="17" className="fill-white/80 stroke-ink" strokeWidth="5" />
      <path d="M109 80a10 10 0 0 1 9-5" fill="none" className="stroke-teal" strokeWidth="3" strokeLinecap="round" />
      <Sparkle x="14" y="20" width="14" height="14" className="twinkle fill-teal" />
      <Sparkle x="138" y="16" width="10" height="10" className="twinkle fill-violet" />
    </svg>
  );
}

/** Ghiduri pe țări: a globe with a paper plane flying around it on a dashed path. */
export function GlobeScene(props: P) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden {...props}>
      <circle cx="78" cy="64" r="44" className="fill-sky" />
      {/* land */}
      <path d="M50 44c8-6 18-4 22 2s-2 12 4 16 4 12-4 14-14-4-18-10-12-14-4-22z" className="fill-teal" />
      <path d="M92 32c8 2 16 8 18 16-6 2-10-2-14 2s-8 2-10-4 0-14 6-14z" className="fill-teal" />
      <path d="M90 82c6-2 14 0 16 6-4 6-12 10-18 8s-4-12 2-14z" className="fill-teal" />
      <ellipse cx="78" cy="64" rx="44" ry="16" fill="none" className="stroke-white/40" strokeWidth="2" />
      <line x1="78" y1="20" x2="78" y2="108" className="stroke-white/40" strokeWidth="2" />
      {/* flight path and plane */}
      <path d="M14 96C30 118 120 118 136 70" fill="none" className="stroke-primary" strokeWidth="2.5" strokeDasharray="5 6" strokeLinecap="round" />
      <g transform="translate(130 44) rotate(-30)">
        <polygon points="0,10 30,0 12,14" className="fill-white stroke-ink" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="12,14 30,0 16,22" className="fill-primary-tint stroke-ink" strokeWidth="2" strokeLinejoin="round" />
      </g>
      <Sparkle x="10" y="30" width="14" height="14" className="twinkle fill-violet" />
      <Sparkle x="128" y="96" width="10" height="10" className="twinkle fill-teal" />
    </svg>
  );
}

/** Specializări: small signs of different fields around a circle: a flask, a laptop, the scales of justice and a paint brush. */
export function FieldsScene(props: P) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden {...props}>
      <circle cx="80" cy="62" r="52" className="fill-primary-tint" />
      {/* laptop (centre) */}
      <rect x="54" y="42" width="52" height="34" rx="4" className="fill-ink" />
      <rect x="59" y="47" width="42" height="24" rx="2" className="fill-sky-tint" />
      <path d="M66 55l-4 4 4 4M94 55l4 4-4 4M84 52l-8 14" fill="none" className="stroke-sky" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 78h68l-6 6H52z" className="fill-ink" />
      {/* flask (left) */}
      <path d="M22 26h12v14l10 20c2 4-1 8-5 8H17c-4 0-7-4-5-8l10-20z" className="fill-white stroke-ink" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M15 58l6-12h14l6 12c1 3-1 5-4 5H19c-3 0-5-2-4-5z" className="fill-teal" />
      <rect x="20" y="22" width="16" height="5" rx="2" className="fill-ink" />
      {/* scales (right) */}
      <line x1="134" y1="20" x2="134" y2="60" className="stroke-ink" strokeWidth="3" strokeLinecap="round" />
      <line x1="116" y1="28" x2="152" y2="28" className="stroke-ink" strokeWidth="3" strokeLinecap="round" />
      <path d="M110 44a8 4 0 0 0 16 0l-8-16z" className="fill-violet" />
      <path d="M142 44a8 4 0 0 0 16 0l-8-16z" className="fill-violet" />
      <rect x="126" y="58" width="16" height="5" rx="2" className="fill-ink" />
      {/* brush (bottom) */}
      <g transform="rotate(-35 80 104)">
        <rect x="56" y="100" width="30" height="7" rx="3.5" className="fill-primary" />
        <rect x="86" y="99" width="8" height="9" className="fill-teal" />
        <path d="M94 99c8 0 14 2 16 4.5-2 2.5-8 4.5-16 4.5z" className="fill-ink" />
      </g>
      <Sparkle x="64" y="12" width="12" height="12" className="twinkle fill-teal" />
      <Sparkle x="140" y="84" width="10" height="10" className="twinkle fill-violet" />
    </svg>
  );
}

/** "Nothing found": a magnifying glass with a question mark and a small cap waiting next to it. */
export function NothingFound(props: P) {
  return (
    <svg viewBox="0 0 140 100" aria-hidden {...props}>
      <ellipse cx="70" cy="90" rx="52" ry="6" className="fill-ink/10" />
      <line x1="80" y1="62" x2="102" y2="84" className="stroke-ink" strokeWidth="8" strokeLinecap="round" />
      <circle cx="62" cy="44" r="28" className="fill-white stroke-ink" strokeWidth="6" />
      <text x="62" y="56" textAnchor="middle" fontSize="34" fontWeight="900" className="fill-primary">?</text>
      <Cap x="98" y="20" width="36" height="36" />
      <Sparkle x="14" y="16" width="12" height="12" className="twinkle fill-teal" />
    </svg>
  );
}

/** Studenți: two speech bubbles talking to each other, one with quotation marks and one with three dots, and a small heart. */
export function VoicesScene(props: P) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden {...props}>
      <circle cx="80" cy="62" r="52" className="fill-primary-tint" />
      {/* big bubble (left) with quotation marks */}
      <path d="M22 22h70a12 12 0 0 1 12 12v30a12 12 0 0 1-12 12H48l-16 14 3-14H22a12 12 0 0 1-12-12V34a12 12 0 0 1 12-12z" className="fill-primary" />
      <path d="M38 40c-6 0-9 4-9 10s4 9 8 9c3 0 5-2 5-5s-2-5-5-5c0-3 1-5 4-6zM62 40c-6 0-9 4-9 10s4 9 8 9c3 0 5-2 5-5s-2-5-5-5c0-3 1-5 4-6z" className="fill-white" />
      <rect x="72" y="46" width="22" height="4" rx="2" className="fill-white/60" />
      <rect x="72" y="55" width="16" height="4" rx="2" className="fill-white/60" />
      {/* small bubble (right) with three dots */}
      <path d="M96 60h44a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10h-8l3 12-14-12H96a10 10 0 0 1-10-10V70a10 10 0 0 1 10-10z" className="fill-white stroke-ink" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="106" cy="79" r="4" className="fill-sky" />
      <circle cx="118" cy="79" r="4" className="fill-teal" />
      <circle cx="130" cy="79" r="4" className="fill-violet" />
      {/* heart */}
      <path d="M128 30c-3-5-11-3-11 3 0 6 11 12 11 12s11-6 11-12c0-6-8-8-11-3z" className="fill-violet" />
      <Sparkle x="6" y="96" width="12" height="12" className="twinkle fill-teal" />
      <Sparkle x="146" y="46" width="10" height="10" className="twinkle fill-sky" />
    </svg>
  );
}

/** Chestionar: a clipboard with a checklist being ticked and a pencil leaning on it. */
export function QuizScene(props: P) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden {...props}>
      <circle cx="80" cy="62" r="52" className="fill-primary-tint" />
      {/* clipboard */}
      <rect x="46" y="14" width="64" height="94" rx="8" className="fill-primary" />
      <rect x="52" y="24" width="52" height="78" rx="4" className="fill-white" />
      <rect x="64" y="8" width="28" height="12" rx="4" className="fill-ink" />
      {/* checklist rows */}
      {[38, 58, 78].map((y, i) => (
        <g key={y}>
          <rect x="58" y={y - 6} width="12" height="12" rx="3" className={i < 2 ? "fill-teal" : "fill-white stroke-ink"} strokeWidth="2" />
          {i < 2 && <path d={`M60.5 ${y}l3 3 5-6`} fill="none" className="stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
          <rect x="76" y={y - 3} width={i === 1 ? 18 : 24} height="5" rx="2.5" className="fill-ink/25" />
        </g>
      ))}
      {/* pencil */}
      <g transform="rotate(35 120 70)">
        <rect x="112" y="30" width="12" height="54" rx="2" className="fill-teal" />
        <rect x="112" y="30" width="12" height="9" rx="2" className="fill-violet" />
        <rect x="112" y="38" width="12" height="4" className="fill-sky-tint" />
        <path d="M112 84h12l-6 13z" className="fill-paper stroke-ink" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M116.5 93.5l1.5 3.5 1.5-3.5z" className="fill-ink" />
      </g>
      <Sparkle x="20" y="26" width="14" height="14" className="twinkle fill-teal" />
      <Sparkle x="22" y="88" width="10" height="10" className="twinkle fill-violet" />
    </svg>
  );
}
