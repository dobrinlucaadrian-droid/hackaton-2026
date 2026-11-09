// The ink drawings of the pages in the drawn look (each on a soft blue blob): study fields, universities, guides, the questionnaire, the result, the students, and the two error drawings (a road ending at a question-mark sign, a broken road).
const BLOB = "M40 90C70 30 180 20 260 30s140 40 130 130-60 130-170 130S20 260 24 180 20 130 40 90z";

function Spark({ x, y, delay = "0s" }: { x: number; y: number; delay?: string }) {
  return (
    <path className="twinkle" style={{ animationDelay: delay }} d={`M${x} ${y}l5 11 11 5-11 5-5 11-5-11-11-5 11-5z`} fill="#c8962e" stroke="#1a2a4c" strokeWidth="2" />
  );
}

/** Specializări: a row of books, a flask, a painter's palette and a gear on a table. */
export function FieldsDrawing({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 420 320" role="img" aria-label={label} className="h-auto w-full">
      <path d={BLOB} fill="#e2e8f4" />
      <path d="M30 262h360" className="o" fill="none" />
      <path d="M70 262v-74h36v74z" fill="#9a3553" className="o" />
      <path d="M106 262v-96h30v96z" fill="#c8962e" className="o" />
      <path d="M136 262l14-86 30 5-14 81z" fill="#5b6f9c" className="o" />
      <path d="M78 206h20M114 186h14" className="o" />
      <g className="bob">
        <path d="M232 150v58a22 22 0 0 1-44 0v-58" fill="#fffdf9" className="o" />
        <path d="M190 196h40v12a20 20 0 0 1-40 0z" fill="#61122d" />
        <path d="M182 150h56" className="o" />
        <circle cx="204" cy="132" r="5" fill="#fffdf9" className="o" />
        <circle cx="220" cy="116" r="4" fill="#fffdf9" className="o" />
      </g>
      <path d="M262 262c-6-30 12-56 44-58s52 18 46 40-26 10-30 18 6 18-6 18-48 0-54-18z" fill="#f9eed3" className="o" />
      <circle cx="292" cy="226" r="7" fill="#9a3553" className="o" />
      <circle cx="318" cy="220" r="7" fill="#5b6f9c" className="o" />
      <circle cx="334" cy="238" r="6" fill="#c8962e" className="o" />
      <circle cx="330" cy="104" r="30" fill="#fffdf9" className="o" />
      <circle cx="330" cy="104" r="10" fill="#e2e8f4" className="o" />
      <path d="M330 64v10M330 134v10M290 104h10M360 104h10M302 76l7 7M351 125l7 7M302 132l7-7M351 83l7-7" className="o" />
      <Spark x={150} y={90} />
    </svg>
  );
}

/** Universități: a big magnifying glass over a small town of university buildings, with a drifting cloud. */
export function UniversitiesDrawing({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 420 320" role="img" aria-label={label} className="h-auto w-full">
      <path d={BLOB} fill="#e2e8f4" />
      <g className="drift">
        <path d="M70 92a16 16 0 0 1 22-14 22 22 0 0 1 40 4 14 14 0 0 1 4 28H76a14 14 0 0 1-6-18z" fill="#fffdf9" className="o" />
      </g>
      <path d="M30 270h360" className="o" fill="none" />
      <path d="M60 270v-90h60v90z" fill="#fffdf9" className="o" />
      <path d="M52 182l38-26 38 26z" fill="#9a3553" className="o" />
      <path d="M74 270v-60M90 270v-60M106 270v-60" className="o" />
      <path d="M140 270v-130h70v130z" fill="#f9eed3" className="o" />
      <path d="M160 140a15 15 0 0 1 30 0" fill="#c8962e" className="o" />
      <path d="M154 160h14v16h-14zM182 160h14v16h-14zM154 196h14v16h-14zM182 196h14v16h-14z" fill="#e2e8f4" className="o" />
      <path d="M166 270v-30h18v30z" fill="#1a2a4c" />
      <path d="M230 270v-70h56v70z" fill="#e6ebf5" className="o" />
      <path d="M226 202l32-22 32 22z" fill="#5b6f9c" className="o" />
      <path d="M240 214h12v12h-12zM264 214h12v12h-12z" fill="#fffdf9" className="o" />
      <g className="bob">
        <circle cx="300" cy="140" r="52" fill="#fffdf9" fillOpacity="0.55" className="o" strokeWidth="5" />
        <path d="M338 178l40 40" stroke="#61122d" strokeWidth="14" strokeLinecap="round" />
        <path d="M276 116a30 30 0 0 1 22-10" className="o" fill="none" />
      </g>
      <Spark x={110} y={60} />
    </svg>
  );
}

/** Ghiduri: a globe with a paper plane flying round it and a suitcase. */
export function GuidesDrawing({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 420 320" role="img" aria-label={label} className="h-auto w-full">
      <path d={BLOB} fill="#e2e8f4" />
      <path d="M210 250v26M170 280h80" className="o" fill="none" />
      <circle cx="210" cy="150" r="96" fill="#fffdf9" className="o" />
      <path d="M150 104c20 6 26 26 16 40s6 30-10 40M240 74c-10 20 4 30 24 30s20 26 6 40M250 210c-14-6-30 4-26 20" fill="none" className="o" />
      <path d="M150 100c14-6 30 0 34 14s-10 20-4 34-14 30-30 22-24-30-18-44 6-20 18-26z" fill="#f9eed3" className="o" strokeWidth="2.6" />
      <path d="M236 96c16-8 40 0 44 18s-12 16-8 34-20 22-30 10 4-26-6-38-6-18 0-24z" fill="#f3e1e6" className="o" strokeWidth="2.6" />
      <path d="M90 150c30-90 210-110 250-20" fill="none" stroke="#1a2a4c" strokeWidth="2.5" strokeDasharray="6 9" strokeLinecap="round" />
      <g className="bob">
        <path d="M330 112l26-14 8 4-16 16 14 10-4 6-18-6-12 8-4-2 4-12z" fill="#61122d" className="o" strokeWidth="2.4" />
      </g>
      <path d="M300 236h70v52h-70z" fill="#c8962e" className="o" />
      <path d="M322 236v-12h26v12M300 256h70" fill="none" className="o" />
      <Spark x={70} y={70} />
    </svg>
  );
}

/** Chestionar: a clipboard with ticked boxes and a big pencil. */
export function QuizDrawing({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 420 320" role="img" aria-label={label} className="h-auto w-full">
      <path d={BLOB} fill="#e2e8f4" />
      <g transform="rotate(-6 200 170)">
        <path d="M120 60h160v220H120z" fill="#c8962e" className="o" />
        <path d="M136 80h128v186H136z" fill="#fffdf9" className="o" />
        <path d="M174 50h52v24h-52z" fill="#1a2a4c" className="o" />
        <path d="M152 112h18v18h-18zM152 162h18v18h-18zM152 212h18v18h-18z" fill="#fffdf9" className="o" strokeWidth="2.6" />
        <path d="M154 120l6 6 12-14M154 170l6 6 12-14" fill="none" stroke="#61122d" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M184 120h62M184 170h50M184 220h56" className="o" />
      </g>
      <g className="bob">
        <path d="M300 230l60-90 22 14-60 90-24 10z" fill="#f9eed3" className="o" />
        <path d="M360 140l22 14 8-12-22-14z" fill="#9a3553" className="o" />
        <path d="M298 254l2-24 22 14z" fill="#1a2a4c" />
      </g>
      <Spark x={90} y={60} />
      <Spark x={340} y={70} delay="0.8s" />
    </svg>
  );
}

/** Rezultat: a podium with places 1, 2 and 3 and a little confetti. */
export function PodiumDrawing({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 300 240" role="img" aria-label={label} className="h-auto w-full">
      <path d="M30 70C50 20 140 10 200 20s90 40 80 110-50 90-130 90S10 190 14 140 20 100 30 70z" fill="#e2e8f4" />
      <path d="M40 210h220" className="o" fill="none" />
      <path d="M115 210v-90h70v90z" fill="#c8962e" className="o" />
      <path d="M45 210v-60h70v60z" fill="#e6ebf5" className="o" />
      <path d="M185 210v-44h70v44z" fill="#f3e1e6" className="o" />
      <text x="150" y="172" textAnchor="middle" fontWeight="800" fontSize="34" fill="#1a2a4c">1</text>
      <text x="80" y="190" textAnchor="middle" fontWeight="800" fontSize="26" fill="#1a2a4c">2</text>
      <text x="220" y="196" textAnchor="middle" fontWeight="800" fontSize="22" fill="#1a2a4c">3</text>
      <g className="bob">
        <path d="M128 92l22-8 22 8-22 8z" fill="#1a2a4c" className="o" />
        <path d="M139 96v8c6 4 16 4 22 0v-8" fill="#1a2a4c" className="o" />
      </g>
      <g className="twinkle">
        <rect x="70" y="60" width="10" height="5" rx="1" fill="#9a3553" transform="rotate(30 75 62)" />
        <rect x="220" y="70" width="10" height="5" rx="1" fill="#c8962e" transform="rotate(-20 225 72)" />
        <rect x="190" y="40" width="9" height="5" rx="1" fill="#5b6f9c" transform="rotate(50 194 42)" />
        <rect x="100" y="36" width="9" height="5" rx="1" fill="#c8962e" />
      </g>
    </svg>
  );
}

/** Studenți: three students talking, with speech bubbles (one with a heart) above them. */
export function VoicesDrawing({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 420 320" role="img" aria-label={label} className="h-auto w-full">
      <path d={BLOB} fill="#e2e8f4" />
      <path d="M30 290h360" className="o" fill="none" />
      <path d="M70 290v-60c0-22 60-22 60 0v60" fill="#9a3553" className="o" />
      <circle cx="100" cy="198" r="24" fill="#f0c8a0" className="o" />
      <path d="M76 194c0-24 48-24 48 0-8-8-40-8-48 0z" fill="#1a2a4c" className="o" />
      <path d="M170 290v-74c0-26 70-26 70 0v74" fill="#5b6f9c" className="o" />
      <circle cx="205" cy="176" r="26" fill="#d9a77e" className="o" />
      <path d="M180 172c0-30 50-30 50 0-4-14-46-14-50 0z" fill="#61122d" className="o" />
      <path d="M280 290v-58c0-22 58-22 58 0v58" fill="#c8962e" className="o" />
      <circle cx="309" cy="200" r="23" fill="#f0c8a0" className="o" />
      <path d="M286 196c2-24 44-24 46 0l-6-8-8 4-10-6-10 6z" fill="#1a2a4c" className="o" />
      <g className="bob">
        <path d="M60 70h90a12 12 0 0 1 12 12v30a12 12 0 0 1-12 12h-50l-16 16v-16H60a12 12 0 0 1-12-12V82a12 12 0 0 1 12-12z" fill="#fffdf9" className="o" />
        <path d="M64 92h70M64 106h44" className="o" />
      </g>
      <g className="bob" style={{ animationDelay: "1s" }}>
        <path d="M250 50h104a12 12 0 0 1 12 12v30a12 12 0 0 1-12 12h-24v16l-16-16h-64a12 12 0 0 1-12-12V62a12 12 0 0 1 12-12z" fill="#f3e1e6" className="o" />
        <path d="M298 92s-14-8-14-17a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 9-14 17-14 17z" fill="#9a3553" className="o" strokeWidth="2.4" />
      </g>
      <Spark x={200} y={70} />
    </svg>
  );
}

/** Pagina nu există: the road ends at a signpost with a question mark. */
export function LostRoadDrawing({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label={label} className="h-auto w-full">
      <path d="M40 60C60 20 150 12 210 20s100 30 92 90-40 80-120 80S20 170 22 120 30 80 40 60z" fill="#e2e8f4" />
      <path d="M30 170h260" className="o" fill="none" />
      <path d="M120 170l26-96h28l26 96z" fill="#1a2a4c" />
      <path d="M160 82v14M160 112v16M160 146v18" stroke="#fffdf9" strokeWidth="3" strokeLinecap="round" />
      <path d="M230 170v-92" className="o" />
      <path d="M200 60h60v40h-60z" fill="#fffdf9" className="o" />
      <path d="M222 74a8 8 0 1 1 11 7c-2 1-3 3-3 5M230 93v1" fill="none" stroke="#61122d" strokeWidth="3.4" strokeLinecap="round" />
      <path className="twinkle" d="M80 50l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#c8962e" stroke="#1a2a4c" strokeWidth="2" />
    </svg>
  );
}

/** Ceva n-a mers: the road broken by a gap, with a warning sign. */
export function BrokenRoadDrawing({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label={label} className="h-auto w-full">
      <path d="M40 60C60 20 150 12 210 20s100 30 92 90-40 80-120 80S20 170 22 120 30 80 40 60z" fill="#e2e8f4" />
      <path d="M30 170h260" className="o" fill="none" />
      <path d="M40 150c30-6 60-6 86-2l-6 18c-26-4-52-4-80 2z" fill="#1a2a4c" />
      <path d="M150 146c40-6 80-2 120 10l-4 14c-40-12-78-14-116-8z" fill="#1a2a4c" />
      <path d="M126 148l10 8-6 6 8 6M150 146l-8 8 6 6-6 8" fill="none" className="o" strokeWidth="2.4" />
      <path d="M220 110v42" className="o" />
      <path d="M220 66l26 44h-52z" fill="#c8962e" className="o" />
      <path d="M220 82v14M220 102v1" stroke="#1a2a4c" strokeWidth="4" strokeLinecap="round" />
      <g className="bob">
        <path d="M84 60l22-8 22 8-22 8z" fill="#1a2a4c" className="o" />
        <path d="M95 64v8c6 4 16 4 22 0v-8" fill="#1a2a4c" className="o" />
      </g>
    </svg>
  );
}
