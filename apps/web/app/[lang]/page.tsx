// Home page: the welcome with the big road drawing and the account choice, a dotted path down to "Urmărește-ne!" with the drawn phone that opens our TikTok and Instagram, in the page language.
import type { Metadata } from "next";
import { HomeScene } from "@/components/HomeScene";
import { Shell } from "@/components/Shell";
import { SocialPhone } from "@/components/SocialPhone";
import { WelcomeActions } from "@/components/WelcomeActions";
import { hasLang, tr } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "en") return {};
  const description = "FindMyUni helps you choose a university in Romania: answer a few questions, find the field that fits you and where you can study it.";
  return {
    title: "FindMyUni — find the right university in Romania",
    description,
    openGraph: { title: "FindMyUni", description, siteName: "FindMyUni", locale: "en_GB", type: "website", url: "/en" },
  };
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const l = hasLang(lang) ? lang : "ro";
  const t = tr(l);
  return (
    <Shell wide>
      <section className="mt-2 grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="rise text-center md:text-left">
          <h1 className="text-4xl font-extrabold leading-[0.98] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {t("Bine ai venit pe", "Welcome to")} <span className="text-primary">FindMy</span><span className="text-[#a8761a]">Uni</span>!
          </h1>
          <svg aria-hidden viewBox="0 0 340 18" className="mx-auto mt-2 h-4 w-60 md:mx-0 sm:w-80">
            <path d="M3 12c40-10 70 8 110-2s70 8 110-2 70 8 114-4" fill="none" stroke="#c8962e" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <p className="mx-auto mt-4 max-w-md text-lg text-ink-soft md:mx-0">
            {t(
              "Ghidul tău între liceu și facultate: afli ce să studiezi și unde. Poți folosi tot site-ul fără cont; cu un cont gratuit îți păstrezi rezultatul chestionarului.",
              "Your guide from high school to university in Romania: find out what to study and where. You can use the whole site without an account; a free account keeps your quiz result.",
            )}
          </p>
          <WelcomeActions />
        </div>
        <HomeScene lang={l} className="order-first mx-auto w-full max-w-md md:order-none md:max-w-none" />
      </section>

      <svg aria-hidden viewBox="0 0 1200 120" preserveAspectRatio="none" className="mt-6 hidden h-28 w-full md:block">
        <path d="M760 0c0 50-200 40-300 60S280 90 300 120" fill="none" stroke="#1a2a4c" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" opacity=".45" />
      </svg>

      <SocialPhone lang={l} />
    </Shell>
  );
}
