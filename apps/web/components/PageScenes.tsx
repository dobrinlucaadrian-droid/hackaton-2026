// The ink drawings at the top of the pages in the drawn look (each on a soft blue blob): study fields (books, flask, palette, gear) and universities (a magnifier over a town).
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
