// "Urmărește-ne!" on the home page (in the page language): a short message and a drawn phone whose two app icons open our TikTok and Instagram accounts; the icons jump when pointed at or tapped.
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
    <section aria-labelledby="social-titlu" className="mx-auto mt-16 grid max-w-4xl items-center gap-8 md:grid-cols-2">
      <div className="text-center md:text-left">
        <h2 id="social-titlu" className="text-3xl font-black tracking-tight text-ink">
          {t("Urmărește-ne!", "Follow us!")}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-lg text-ink-soft md:mx-0">
          {t(
            "Clipuri scurte despre facultăți, admitere și ce nu știai despre viața de student.",
            "Short videos about universities, admission and what you didn't know about student life.",
          )}
        </p>
        <p className="mt-3 text-sm font-bold text-primary">
          {t("Apasă pe o aplicație din telefon", "Tap an app on the phone")} <span aria-hidden className="md:hidden">👇</span>
          <span aria-hidden className="hidden md:inline">👉</span>
        </p>
      </div>

      {/* The drawn phone: frame, notch, a small FindMyUni header and the two app icons as real links. */}
      <div className="float mx-auto w-56 rounded-[2.5rem] bg-ink p-3 shadow-2xl shadow-ink/30">
        <div className="relative flex h-96 flex-col items-center rounded-[2rem] bg-paper px-5 pt-8">
          <span aria-hidden className="absolute top-2.5 h-5 w-20 rounded-full bg-ink" />
          <p aria-hidden className="text-lg font-black tracking-tight text-ink">
            <span className="text-primary">FindMy</span>
            <span className="text-[#a8761a]">Uni</span>
          </p>
          <div className="mt-10 grid grid-cols-2 gap-6">
            {APPS.map((app) => (
              <a
                key={app.name}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(`FindMyUni pe ${app.name} (se deschide într-o filă nouă)`, `FindMyUni on ${app.name} (opens in a new tab)`)}
                className="group flex flex-col items-center gap-2 rounded-2xl outline-offset-4"
              >
                <span
                  className={`relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${app.tile} transition-transform duration-200 motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:-rotate-6 motion-safe:group-active:scale-90 motion-safe:group-focus-visible:-translate-y-2`}
                >
                  {app.icon}
                  <span aria-hidden className="twinkle absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-black text-white ring-2 ring-paper">
                    1
                  </span>
                </span>
                <span className="text-xs font-bold text-ink">{app.name}</span>
              </a>
            ))}
          </div>
          <span aria-hidden className="absolute bottom-3 h-1.5 w-24 rounded-full bg-ink/20" />
        </div>
      </div>
    </section>
  );
}
