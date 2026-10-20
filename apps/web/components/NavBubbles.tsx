// The four big buttons on the home page (Specializări, Universități, Chestionar, Studenți, Ghiduri pe țări), drawn as little clouds.
import Link from "next/link";
import type { CSSProperties } from "react";

const ITEMS = [
  { href: "/specializari", label: "Specializări", icon: "📚", fill: "fill-teal-tint" },
  { href: "/universitati", label: "Universități", icon: "🏛️", fill: "fill-sky-tint" },
  { href: "/test", label: "Chestionar", icon: "✏️", fill: "fill-primary-tint" },
  { href: "/studenti", label: "Studenți", icon: "🎓", fill: "fill-mint-tint" },
  { href: "/ghiduri", label: "Ghiduri pe țări", icon: "🌍", fill: "fill-violet-tint" },
] as const;

// One cloud outline in a 120 x 80 box: a flat base and four round puffs.
const CLOUD = "M24 70a20 20 0 0 1-3-39.8A26 26 0 0 1 61 16a22 22 0 0 1 37 10.5A19 19 0 0 1 98 70Z";

export function NavBubbles() {
  return (
    <ul className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-4 gap-y-6">
      {ITEMS.map((it, i) => (
        <li key={it.href} className="rise w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(20%-0.8rem)]" style={{ "--d": `${i * 90}ms` } as CSSProperties}>
          <Link href={it.href} prefetch className="group flex flex-col items-center gap-2 rounded-3xl p-1 text-center">
            <span className="relative block w-full max-w-40 transition-transform duration-200 group-hover:-translate-y-1 group-active:scale-95">
              <svg aria-hidden viewBox="0 0 120 80" className="block w-full drop-shadow-md">
                <path d={CLOUD} className={`${it.fill} stroke-line`} strokeWidth="1.5" />
              </svg>
              <span aria-hidden className="absolute inset-x-0 top-[38%] text-center text-4xl leading-none sm:text-5xl">{it.icon}</span>
            </span>
            <span className="text-lg font-black text-ink group-hover:text-primary">{it.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
