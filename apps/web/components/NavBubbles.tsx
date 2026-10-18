// The four big buttons on the home page (Specializări, Universități, Chestionar, Studenți), drawn as little clouds or as circles.
import Link from "next/link";
import type { CSSProperties } from "react";

export type BubbleShape = "nor" | "cerc";

const ITEMS = [
  { href: "/specializari", label: "Specializări", icon: "📚", fill: "fill-teal-tint", ring: "bg-teal-tint" },
  { href: "/universitati", label: "Universități", icon: "🏛️", fill: "fill-sky-tint", ring: "bg-sky-tint" },
  { href: "/test", label: "Chestionar", icon: "✏️", fill: "fill-primary-tint", ring: "bg-primary-tint" },
  { href: "/studenti", label: "Studenți", icon: "🎓", fill: "fill-mint-tint", ring: "bg-mint-tint" },
] as const;

// One cloud outline in a 120 x 80 box: a flat base and four round puffs.
const CLOUD = "M24 70a20 20 0 0 1-3-39.8A26 26 0 0 1 61 16a22 22 0 0 1 37 10.5A19 19 0 0 1 98 70Z";

export function NavBubbles({ shape }: { shape: BubbleShape }) {
  return (
    <ul className="mx-auto grid max-w-3xl grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
      {ITEMS.map((it, i) => (
        <li key={it.href} className="rise" style={{ "--d": `${i * 90}ms` } as CSSProperties}>
          <Link href={it.href} className="group flex flex-col items-center gap-2 rounded-3xl p-1 text-center">
            {shape === "nor" ? (
              <span className="relative block w-full max-w-40 transition-transform duration-200 group-hover:-translate-y-1 group-active:scale-95">
                <svg aria-hidden viewBox="0 0 120 80" className="block w-full drop-shadow-md">
                  <path d={CLOUD} className={`${it.fill} stroke-line`} strokeWidth="1.5" />
                </svg>
                <span aria-hidden className="absolute inset-x-0 top-[38%] text-center text-4xl leading-none sm:text-5xl">{it.icon}</span>
              </span>
            ) : (
              <span
                aria-hidden
                className={`flex aspect-square w-28 items-center justify-center rounded-full ${it.ring} text-4xl shadow-md ring-2 ring-line transition-transform duration-200 group-hover:-translate-y-1 group-hover:ring-primary/50 group-active:scale-95 sm:w-32 sm:text-5xl`}
              >
                {it.icon}
              </span>
            )}
            <span className="text-lg font-black text-ink group-hover:text-primary">{it.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
