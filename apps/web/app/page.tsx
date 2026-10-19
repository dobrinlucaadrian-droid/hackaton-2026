// Home page: the welcome with the drawing and the account choice, the four big buttons drawn as clouds.
import { HeroScene } from "@/components/Illustrations";
import { NavBubbles } from "@/components/NavBubbles";
import { Shell } from "@/components/Shell";
import { WelcomeActions } from "@/components/WelcomeActions";

export default function Home() {
  return (
    <Shell wide>
      <section className="mt-2 grid items-center gap-4 md:grid-cols-2">
        <div className="rise text-center md:text-left">
          <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-tighter text-ink sm:text-5xl lg:text-6xl">
            Bine ai venit pe <span className="text-primary">FindMy</span><span className="text-teal">Uni</span>!
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-ink-soft md:mx-0">
            Ghidul tău între liceu și facultate: afli ce să studiezi și unde. Poți folosi tot site-ul fără cont; cu un cont gratuit îți păstrezi rezultatul chestionarului.
          </p>
          <WelcomeActions />
        </div>
        <HeroScene className="float mx-auto w-full max-w-[12rem] sm:max-w-sm md:max-w-none" />
      </section>

      <section id="exploreaza" aria-labelledby="exploreaza-titlu" className="mx-auto mt-14 max-w-4xl scroll-mt-6">
        <h2 id="exploreaza-titlu" className="mb-6 text-center text-3xl font-black tracking-tight text-ink">
          De unde vrei să începi?
        </h2>
        <NavBubbles />
      </section>
    </Shell>
  );
}
