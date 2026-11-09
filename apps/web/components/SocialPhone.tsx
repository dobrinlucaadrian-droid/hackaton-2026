// "Urmărește-ne!" on the home page (in the page language): a drawn, slightly tilted phone with pen doodles around it on the left and, on the right, a short message, two big buttons to our TikTok and Instagram accounts (the phone's app icons open the same accounts and jump when pointed at or tapped).
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
    <section aria-labelledby="social-titlu" className="mx-auto mt-6 grid max-w-4xl grid-cols-[auto_1fr] items-center gap-4 sm:gap-8 md:grid-cols-2">
      {/* The phone always on the left (smaller on narrow screens), text and buttons on the right; the text comes first for screen readers. */}
      <div className="text-left">
        <h2 id="social-titlu" className="text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
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
              className={`inline-flex min-h-12 items-center gap-2 rounded-2xl px-4 py-2.5 text-base font-extrabold sm:min-h-14 sm:gap-3 sm:px-6 sm:py-3 sm:text-lg text-white shadow-[0_14px_24px_-14px_rgb(26_42_76_/_0.7)] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] ${app.tile}`}
            >
              <span className="flex h-7 w-7 items-center justify-center sm:h-8 sm:w-8 [&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-7 sm:[&>svg]:w-7">{app.icon}</span>
              {app.name}
            </a>
          ))}
        </div>
      </div>

      {/* The drawn phone, a little tilted, with pen doodles around it (hearts, a chat bubble, play, music notes): frame, notch, the FindMyUni header and the two app icons as real links. */}
      <div className="relative order-first mx-auto">
        <svg aria-hidden viewBox="0 0 380 560" className="pointer-events-none absolute -inset-x-10 -inset-y-8 hidden h-[calc(100%+4rem)] w-[calc(100%+5rem)] sm:block" fill="none" stroke="#1a2a4c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path className="bob" d="M40 120s-22-14-22-30a11 11 0 0 1 22-3 11 11 0 0 1 22 3c0 16-22 30-22 30z" fill="#9a3553" />
          <path className="bob" style={{ animationDelay: "0.8s" }} d="M338 70s-16-10-16-22a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 12-16 22-16 22z" fill="#f3e1e6" />
          <g className="bob" style={{ animationDelay: "0.4s" }}>
            <path d="M300 170h58a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10h-34l-14 14v-14h-10a10 10 0 0 1-10-10v-28a10 10 0 0 1 10-10z" fill="#fffdf9" />
            <path d="M312 190h34M312 202h22" />
          </g>
          <g className="bob" style={{ animationDelay: "1.2s" }}>
            <circle cx="38" cy="330" r="22" fill="#c8962e" />
            <path d="M32 320l16 10-16 10z" fill="#1a2a4c" />
          </g>
          <path d="M340 380v-34l18-5v30" />
          <circle cx="334" cy="382" r="6" fill="#1a2a4c" />
          <circle cx="352" cy="374" r="6" fill="#1a2a4c" />
          <path className="twinkle" d="M70 470l5 11 11 5-11 5-5 11-5-11-11-5 11-5z" fill="#c8962e" />
          <path className="twinkle" style={{ animationDelay: "0.9s" }} d="M330 500l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#fffdf9" />
          <path d="M14 230c10-8 22-8 30 0M8 244c16-14 34-14 46 0" />
        </svg>
        <div className="float relative w-32 -rotate-3 rounded-[1.75rem] bg-ink p-2 shadow-[0_26px_40px_-22px_rgb(26_42_76_/_0.55)] sm:w-56 sm:rounded-[2.5rem] sm:p-3">
          <div className="relative flex h-60 flex-col items-center overflow-hidden rounded-[1.4rem] bg-card px-2 pt-6 sm:h-96 sm:rounded-[2rem] sm:px-5 sm:pt-9">
            <span aria-hidden className="absolute top-2 h-3.5 w-12 rounded-full bg-ink sm:top-2.5 sm:h-5 sm:w-20" />
            <p aria-hidden className="text-sm font-extrabold tracking-tight text-ink sm:text-lg">
              <span className="text-primary">FindMy</span>
              <span className="text-[#a8761a]">Uni</span>
            </p>
            <p aria-hidden className="hand text-sm text-ink-soft sm:text-xl">{t("ne vedem acolo!", "see you there!")}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-7 sm:gap-6">
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
                    <span aria-hidden className="twinkle absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-extrabold text-white ring-2 ring-card sm:h-5 sm:w-5 sm:text-[11px]">
                      1
                    </span>
                  </span>
                  <span className="text-[10px] font-bold text-ink sm:text-xs">{app.name}</span>
                </a>
              ))}
            </div>
            <div aria-hidden className="mt-5 grid w-4/5 gap-2 sm:mt-8">
              <span className="h-2 rounded-full bg-mint-tint sm:h-2.5" />
              <span className="h-2 w-3/4 rounded-full bg-mint-tint sm:h-2.5" />
              <span className="h-2 w-5/6 rounded-full bg-mint-tint sm:h-2.5" />
            </div>
            <span aria-hidden className="absolute bottom-2 h-1 w-14 rounded-full bg-ink/20 sm:bottom-3 sm:h-1.5 sm:w-24" />
          </div>
        </div>
      </div>
    </section>
  );
}
