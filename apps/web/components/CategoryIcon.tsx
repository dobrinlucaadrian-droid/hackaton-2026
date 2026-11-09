// A small round ink drawing for each study category (stethoscope, laptop, gear, flask, briefcase, scales, people, book, palette, globe), used on the category tiles and in the search results.
import type { ReactNode } from "react";

const ICONS: Record<string, { bg: string; art: ReactNode }> = {
  sanatate: { bg: "#f3e1e6", art: <><path d="M24 18v14a12 12 0 0 0 24 0V18" fill="none" className="o" /><path d="M36 44v8a10 10 0 0 0 20 0v-6" fill="none" className="o" /><circle cx="56" cy="44" r="5" fill="#9a3553" className="o" /></> },
  it: { bg: "#e2e8f4", art: <><path d="M16 22h40v26H16z" fill="#fffdf9" className="o" /><path d="M10 54h52" className="o" /><path d="M28 31l-5 5 5 5M44 31l5 5-5 5M38 29l-4 14" fill="none" className="o" /></> },
  inginerie: { bg: "#f9eed3", art: <><circle cx="36" cy="36" r="13" fill="#c8962e" className="o" /><circle cx="36" cy="36" r="5" fill="#fffdf9" className="o" /><path d="M36 14v6M36 52v6M14 36h6M52 36h6M20 20l5 5M47 47l5 5M20 52l5-5M47 25l5-5" className="o" /></> },
  stiinte: { bg: "#e6ebf5", art: <><path d="M30 14h12M32 14v16l-12 22a4 4 0 0 0 4 6h24a4 4 0 0 0 4-6L40 30V14" fill="#fffdf9" className="o" /><path d="M24 46h24l4 6H20z" fill="#5b6f9c" /></> },
  business: { bg: "#f9eed3", art: <><path d="M14 28h44v26H14z" fill="#9a3553" className="o" /><path d="M28 28v-6h16v6M14 38h44" fill="none" className="o" /><path d="M33 36h6v6h-6z" fill="#c8962e" className="o" /></> },
  "drept-politica": { bg: "#e2e8f4", art: <><path d="M36 14v40M24 56h24M16 24h40" className="o" /><path d="M16 24l-7 16h14zM56 24l-7 16h14z" fill="#c8962e" className="o" /></> },
  "sociale-educatie": { bg: "#f3e1e6", art: <><circle cx="26" cy="28" r="7" fill="#fffdf9" className="o" /><circle cx="46" cy="28" r="7" fill="#fffdf9" className="o" /><path d="M14 54c0-10 6-16 12-16s12 6 12 16M34 54c0-10 6-16 12-16s12 6 12 16" fill="#9a3553" className="o" /></> },
  umaniste: { bg: "#e6ebf5", art: <><path d="M36 22c-6-4-14-6-22-4v32c8-2 16 0 22 4 6-4 14-6 22-4V18c-8-2-16 0-22 4z" fill="#fffdf9" className="o" /><path d="M36 22v32" className="o" /></> },
  arte: { bg: "#f9eed3", art: <><path d="M18 50c-6-16 6-34 24-32s22 18 14 24-12 0-14 8 4 12-6 12-16-2-18-12z" fill="#fffdf9" className="o" /><circle cx="30" cy="32" r="4" fill="#9a3553" /><circle cx="42" cy="28" r="4" fill="#5b6f9c" /><circle cx="48" cy="38" r="4" fill="#c8962e" /></> },
  "sport-servicii": { bg: "#e2e8f4", art: <><circle cx="36" cy="36" r="16" fill="#fffdf9" className="o" /><path d="M20 36h32M36 20c-6 6-6 26 0 32M36 20c6 6 6 26 0 32" fill="none" className="o" /></> },
};

export function CategoryIcon({ id, className = "h-12 w-12" }: { id: string; className?: string }) {
  const icon = ICONS[id];
  return (
    <svg aria-hidden viewBox="0 0 72 72" className={className}>
      <circle cx="36" cy="36" r="32" fill={icon?.bg ?? "#e2e8f4"} />
      {icon?.art ?? <circle cx="36" cy="36" r="12" fill="#fffdf9" className="o" />}
    </svg>
  );
}
