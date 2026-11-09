// The big drawing on the home page, in ink outlines: a student walks the road from the high school up to a university on the hill, with clouds, the sun, a paper plane and a cap thrown in the air (labels in the page language).
import type { Lang } from "@/lib/i18n";

export function HomeScene({ lang, className }: { lang: Lang; className?: string }) {
  const en = lang === "en";
  const road = "M140 470C210 470 250 430 300 410s70-60 150-70 40-50 20-62";
  return (
    <svg viewBox="0 0 640 540" role="img" aria-labelledby="home-scene-title" className={className}>
      <title id="home-scene-title">
        {en ? "Drawing: a student walks the road from high school up to a university on a hill" : "Desen: un elev merge pe drumul de la liceu până la o universitate de pe deal"}
      </title>
      <defs>
        <clipPath id="home-scene-blob">
          <path d="M70 120C110 40 260 20 360 34s220 30 250 140-10 250-60 300-210 60-330 50S50 470 36 360 30 200 70 120z" />
        </clipPath>
      </defs>
      <path d="M70 120C110 40 260 20 360 34s220 30 250 140-10 250-60 300-210 60-330 50S50 470 36 360 30 200 70 120z" fill="#e2e8f4" />
      <g clipPath="url(#home-scene-blob)">
        <g className="twinkle" style={{ animationDuration: "6s" }}>
          <circle cx="500" cy="110" r="36" fill="#c8962e" className="o" />
          <path d="M500 54v-14M500 180v-14M444 110h-14M570 110h-14M461 71l-10-10M549 159l-10-10M461 149l-10 10M549 61l-10 10" className="o" fill="none" />
        </g>
        <g className="drift">
          <path d="M120 150a22 22 0 0 1 30-26 30 30 0 0 1 56 6 20 20 0 0 1 6 40H128a20 20 0 0 1-8-20z" fill="#fffdf9" className="o" />
        </g>
        <g className="drift" style={{ animationDirection: "alternate-reverse", animationDuration: "12s" }}>
          <path d="M330 92a18 18 0 0 1 26-20 24 24 0 0 1 44 6 16 16 0 0 1 4 32h-66a16 16 0 0 1-8-18z" fill="#fffdf9" className="o" />
        </g>
        <path d="M20 330C120 250 220 270 300 300s150-110 340-60v320H20z" fill="#e6ebf5" className="o" />
        <path d="M20 420c90-60 200-50 290-10s200 30 330-30v220H20z" fill="#f9eed3" className="o" />
        <path d="M250 296v-26" className="o" />
        <circle cx="250" cy="258" r="16" fill="#9a3553" className="o" />
        <path d="M582 270v-28" className="o" />
        <circle cx="582" cy="230" r="18" fill="#c8962e" className="o" />
        <path d="M560 430v-30" className="o" />
        <circle cx="560" cy="388" r="20" fill="#5b6f9c" className="o" />
        <path d={road} fill="none" stroke="#1a2a4c" strokeWidth="34" strokeLinecap="round" />
        <path d={road} fill="none" stroke="#fffdf9" strokeWidth="3" strokeDasharray="10 12" strokeLinecap="round" />
      </g>
      {/* the university on the hill */}
      <path d="M392 278h176v12H392z" fill="#fffdf9" className="o" />
      <path d="M404 202h152v76H404z" fill="#fffdf9" className="o" />
      <path d="M424 214v58M452 214v58M480 214v58M508 214v58M536 214v58" className="o" />
      <path d="M394 204l86-40 86 40z" fill="#61122d" className="o" />
      <path d="M452 160a28 28 0 0 1 56 0z" fill="#c8962e" className="o" />
      <path d="M480 132v-30" className="o" />
      <path d="M480 102l26 8-26 8z" fill="#9a3553" className="o" />
      <path d="M468 278v-22a12 12 0 0 1 24 0v22z" fill="#1a2a4c" />
      {/* the high school */}
      <path d="M60 420h110v66H60z" fill="#fffdf9" className="o" />
      <path d="M52 422l63-38 63 38z" fill="#5b6f9c" className="o" />
      <path d="M104 486v-30h22v30z" fill="#c8962e" className="o" />
      <path d="M72 436h20v16H72zM138 436h20v16h-20z" fill="#e2e8f4" className="o" />
      <text x="115" y="414" textAnchor="middle" className="hand" fontSize="17" fill="#fffdf9">{en ? "SCHOOL" : "LICEU"}</text>
      {/* signpost */}
      <path d="M226 470v-62" className="o" />
      <path d="M196 412h76l14 12-14 12h-76z" fill="#fffdf9" className="o" />
      <text x="235" y="430" textAnchor="middle" className="hand" fontSize="18" fill="#61122d">{en ? "university" : "facultate"}</text>
      {/* the student walking up the road */}
      <g className="walk">
        <path d="M338 396l-8 22M346 396l10 20" className="o" />
        <path d="M326 352c0-10 26-10 26 0v46h-26z" fill="#61122d" className="o" />
        <path d="M318 360c-6 4-8 14-6 22" className="o" fill="none" />
        <path d="M352 360c8-6 12-16 12-26" className="o" fill="none" />
        <rect x="316" y="356" width="14" height="26" rx="5" fill="#c8962e" className="o" />
        <circle cx="339" cy="336" r="13" fill="#f0c8a0" className="o" />
        <path d="M326 333c2-10 22-12 26 0" fill="#1a2a4c" className="o" />
      </g>
      {/* the cap thrown in the air */}
      <g transform="translate(-150,-6)">
        <g className="bob">
          <path d="M360 92l52-20 52 20-52 20z" fill="#1a2a4c" className="o" />
          <path d="M386 102v18c14 10 38 10 52 0v-18" fill="#1a2a4c" className="o" />
          <path d="M412 92l30 10v26" stroke="#c8962e" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="442" cy="132" r="5" fill="#c8962e" />
        </g>
      </g>
      {/* paper plane with its trail */}
      <g className="bob" style={{ animationDuration: "5s" }}>
        <path d="M70 250c40-30 70-10 100-40" fill="none" stroke="#1a2a4c" strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round" />
        <path d="M170 196l40 4-30 26-4-14z" fill="#fffdf9" className="o" />
      </g>
      {/* books */}
      <path d="M20 486h70v14H20z" fill="#9a3553" className="o" />
      <path d="M26 472h62v14H26z" fill="#c8962e" className="o" />
      <path d="M18 458h66v14H18z" fill="#5b6f9c" className="o" />
      {/* sparkles */}
      <path className="twinkle" d="M300 150l5 12 12 5-12 5-5 12-5-12-12-5 12-5z" fill="#c8962e" stroke="#1a2a4c" strokeWidth="2" />
      <path className="twinkle" style={{ animationDelay: "1.1s" }} d="M600 330l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#fffdf9" stroke="#1a2a4c" strokeWidth="2" />
      <path className="twinkle" style={{ animationDelay: "0.5s" }} d="M40 190l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#f3e1e6" stroke="#1a2a4c" strokeWidth="2" />
    </svg>
  );
}
