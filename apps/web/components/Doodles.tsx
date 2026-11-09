// Small faint pen doodles (a cross, squiggles, a heart, an arrow, a star, a smile) scattered behind the page on wide screens; purely decorative.
const DOODLES = [
  { style: { left: "3%", top: "150px", width: 34 }, box: "0 0 24 24", d: "M12 2v6M12 16v6M2 12h6M16 12h6" },
  { style: { left: "45%", top: "110px", width: 40 }, box: "0 0 40 20", d: "M2 14c6-10 10 6 16-4s10 6 20-6" },
  { style: { right: "4%", top: "560px", width: 30 }, box: "0 0 24 24", d: "M12 21s-8-5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11z" },
  { style: { left: "4%", top: "720px", width: 46 }, box: "0 0 48 16", d: "M2 8h34M30 2l8 6-8 6" },
  { style: { right: "7%", top: "1180px", width: 28 }, box: "0 0 24 24", d: "M12 2l2.5 7.5H22l-6 4.5 2.5 7.5L12 17l-6.5 4.5L8 14 2 9.5h7.5z" },
  { style: { left: "2%", top: "1050px", width: 36 }, box: "0 0 24 24", d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" },
];

export function Doodles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block">
      {DOODLES.map((doodle, i) => (
        <svg key={i} viewBox={doodle.box} style={{ position: "absolute", ...doodle.style }} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-ink opacity-20">
          <path d={doodle.d} />
        </svg>
      ))}
    </div>
  );
}
