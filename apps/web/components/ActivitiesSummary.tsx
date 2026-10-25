// Read-only list (in the page language) of the student's activities with thumbnails (a tap opens the photo larger).
import { useLang, useT } from "@/components/LangProvider";
import { ACTIVITY_AREAS, describeActivity } from "@/lib/activities";
import type { StoredActivity } from "@/lib/session";

export function ActivitiesSummary({ activities }: { activities: StoredActivity[] }) {
  const lang = useLang();
  const t = useT();
  if (activities.length === 0) return null;
  return (
    <section className="rise mx-auto mt-6 max-w-2xl rounded-3xl bg-card p-5 ring-1 ring-line sm:max-w-3xl" aria-labelledby="activitati">
      <h2 id="activitati" className="text-xl font-black tracking-tight text-ink">
        {t("Am ținut cont și de activitățile tale", "We also took your activities into account")}
      </h2>
      <ul className="mt-3 space-y-2">
        {activities.map((a, i) => {
          const text = describeActivity(a, lang);
          const emoji = ACTIVITY_AREAS.find((x) => x.id === a.areaId)?.emoji ?? "⭐";
          return (
            <li key={i} className="flex items-center gap-3 rounded-2xl bg-paper px-4 py-3">
              <span aria-hidden className="text-2xl">{emoji}</span>
              <span className="flex-1 font-semibold text-ink">{text}</span>
              {a.photo && (
                <a href={a.photo} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.photo} alt={t(`Poza diplomei pentru ${text}`, `Certificate photo for ${text}`)} className="h-12 w-12 rounded-lg object-cover ring-1 ring-line" />
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
