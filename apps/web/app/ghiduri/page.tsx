// Country guides index: one tile per country that has a "how to apply" guide.
import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { guides } from "@/lib/guides";
import { counted } from "@/lib/labels";
import { universities } from "@/lib/universities";

export const metadata: Metadata = {
  title: "Ghiduri pe țări | FindMyUni",
  description: "Cum aplici la facultate în alte țări: pași, acte, costuri, burse și cazare, pe înțelesul unui licean.",
};

export default function GuidesPage() {
  return (
    <Shell wide>
      <h1 className="rise text-4xl font-black tracking-tighter text-ink sm:text-5xl">Cum aplici în altă țară</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Câte un ghid scurt pentru fiecare țară: pe ce platformă te înscrii, ce acte îți trebuie, cât costă pentru un cetățean UE, ce burse poți primi și cum găsești cazare.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-guides>
        {guides.map((g) => {
          const count = universities.filter((u) => u.country === g.country).length;
          return (
            <li key={g.id}>
              <Link href={`/ghiduri/${g.id}`} className="opt flex h-full min-h-36 flex-col rounded-3xl bg-card p-5 shadow-sm ring-1 ring-line hover:ring-primary/50">
                <span className="text-2xl font-black tracking-tight text-ink">{g.country}</span>
                <span className="mt-2 text-sm text-ink-soft">{g.intro}</span>
                <span className="mt-auto pt-3 text-sm font-bold text-primary">
                  Citește ghidul → <span className="font-semibold text-ink-soft">· {counted(count, "universitate cu fișă", "universități cu fișă")}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark" role="note">
        Ghidurile sunt scrise după paginile oficiale ale fiecărei țări și sunt orientative. Regulile, taxele și termenele se schimbă: verifică mereu la sursă.
      </p>
    </Shell>
  );
}
