// "Urmărește-ne!" on the home page (in the page language): a short message, two big buttons to our TikTok and Instagram accounts and a drawn phone whose app icons open the same accounts (they jump when pointed at or tapped).
import { tr, type Lang } from "@/lib/i18n";

const APPS = [
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@findmyuni.ro",
    tile: "bg-[#14141f]",
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="h-9 w-9" fill="#fff">
        <path d="M16.6 2h-3.3v13.1a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .8.1V8.9a6.3 6.3 0 1 0 5.4 6.2V8.4a7.9 7.9 0 0 0 4.6 1.5V6.6a4.6 4.6 0 0 1-4.6-4.6Z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/findmyuni.ro/",
    tile: "bg-gradient-to-tr from-[#f2a33a] via-[#d6336c] to-[#7b3fbf]",
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="#fff" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="#fff" stroke="none" />
      </svg>
    ),
  },
];

export function SocialPhone({ lang }: { lang: Lang }) {
  const t = tr(lang);
  return (
    <section aria-labelledby="social-titlu" className="mx-auto mt-16 grid max-w-4xl grid-cols-[1fr_auto] items-center gap-4 sm:gap-8 md:grid-cols-2">
      {/* Text and buttons always on the left, the phone always on the right (smaller on narrow screens). */}
      <div className="text-left">
        <h2 id="social-titlu" className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
          {t("Urmărește-ne!", "Follow us!")}
        </h2>
        <p className="mt-3 max-w-md text-base text-ink-soft sm:text-lg">
          {t(
            "Clipuri scurte despre facultăți, admitere și ce nu știai despre viața de student.",
            "Short videos about universities, admission and what you didn't know about student life.",
          )}
        </p>
        <div className="mt-5 flex flex-col items-start gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
          {APPS.map((app) => (
            <a
              key={app.name}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-12 items-center gap-2 rounded-2xl px-4 py-2.5 text-base font-black sm:min-h-14 sm:gap-3 sm:px-6 sm:py-3 sm:text-lg text-white shadow-lg shadow-ink/20 transition hover:brightness-110 active:scale-[0.98] ${app.tile}`}
            >
              <span className="flex h-7 w-7 items-center justify-center sm:h-8 sm:w-8 [&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-7 sm:[&>svg]:w-7">{app.icon}</span>
              {app.name}
            </a>
          ))}
        </div>
      </div>

      {/* The drawn phone: frame, notch, a small FindMyUni header and the two app icons as real links. */}
      <div className="float mx-auto w-32 rounded-[1.75rem] bg-ink p-2 shadow-2xl shadow-ink/30 sm:w-56 sm:rounded-[2.5rem] sm:p-3">
        <div className="relative flex h-60 flex-col items-center rounded-[1.4rem] bg-paper px-2 pt-6 sm:h-96 sm:rounded-[2rem] sm:px-5 sm:pt-8">
          <span aria-hidden className="absolute top-2 h-3.5 w-12 rounded-full bg-ink sm:top-2.5 sm:h-5 sm:w-20" />
          <p aria-hidden className="text-sm font-black tracking-tight text-ink sm:text-lg">
            <span className="text-primary">FindMy</span>
            <span className="text-[#a8761a]">Uni</span>
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-6">
            {APPS.map((app) => (
              <a
                key={app.name}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(`FindMyUni pe ${app.name} (se deschide într-o filă nouă)`, `FindMyUni on ${app.name} (opens in a new tab)`)}
                className="group flex flex-col items-center gap-1 rounded-2xl outline-offset-4 sm:gap-2"
              >
                <span
                  className={`relative flex h-11 w-11 items-center justify-center rounded-xl shadow-lg sm:h-16 sm:w-16 sm:rounded-2xl [&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-9 sm:[&>svg]:w-9 ${app.tile} transition-transform duration-200 motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:-rotate-6 motion-safe:group-active:scale-90 motion-safe:group-focus-visible:-translate-y-2`}
                >
                  {app.icon}
                  <span aria-hidden className="twinkle absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] sm:h-5 sm:w-5 sm:text-[11px] font-black text-white ring-2 ring-paper">
                    1
                  </span>
                </span>
                <span className="text-[10px] font-bold text-ink sm:text-xs">{app.name}</span>
              </a>
            ))}
          </div>
          <span aria-hidden className="absolute bottom-2 h-1 w-14 rounded-full bg-ink/20 sm:bottom-3 sm:h-1.5 sm:w-24" />
        </div>
      </div>
    </section>
  );
}
