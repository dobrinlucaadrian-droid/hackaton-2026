// Home page: the welcome with the drawing and the account choice, then "Urmărește-ne!" with the drawn phone that opens our TikTok and Instagram, in the page language.
import type { Metadata } from "next";
import { HeroScene } from "@/components/Illustrations";
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
      <section className="mt-2 grid items-center gap-4 md:grid-cols-2">
        <div className="rise text-center md:text-left">
          <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tighter text-ink sm:text-5xl lg:text-6xl">
            {t("Bine ai venit pe", "Welcome to")} <span className="text-primary">FindMy</span><span className="text-[#a8761a]">Uni</span>!
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-ink-soft md:mx-0">
            {t(
              "Ghidul tău între liceu și facultate: afli ce să studiezi și unde. Poți folosi tot site-ul fără cont; cu un cont gratuit îți păstrezi rezultatul chestionarului.",
              "Your guide from high school to university in Romania: find out what to study and where. You can use the whole site without an account; a free account keeps your quiz result.",
            )}
          </p>
          <WelcomeActions />
        </div>
        <HeroScene className="float mx-auto w-full max-w-[12rem] sm:max-w-sm md:max-w-none" />
      </section>

      <SocialPhone lang={l} />
    </Shell>
  );
}
