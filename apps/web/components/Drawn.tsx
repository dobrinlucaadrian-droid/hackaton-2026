// Small shared pieces of the drawn look: the gold squiggle under page titles, a section title with a hand-drawn arrow, and the page opening (title and text on the left, a drawing on the right).
import type { ReactNode } from "react";

export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 300 16" className={`mt-2 block h-4 w-56 sm:w-72 ${className}`}>
      <path d="M3 10c36-9 62 7 98-2s62 7 98-2 62 7 98-4" fill="none" stroke="#c8962e" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function SectionTitle({ id, children, center = false }: { id?: string; children: ReactNode; center?: boolean }) {
  return (
    <h2 id={id} className={`mt-11 mb-4 flex items-center gap-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl ${center ? "justify-center" : ""}`}>
      <svg aria-hidden viewBox="0 0 40 30" className="h-7 w-9 shrink-0" fill="none" stroke="#61122d" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22c10-14 20 6 32-12" />
        <path d="M28 8l8 2-2 8" />
      </svg>
      {children}
    </h2>
  );
}

/** Title, squiggle and text on the left, the page's drawing on the right; on phones the drawing goes on top, smaller. */
export function PageOpening({ title, lead, scene, children }: { title: ReactNode; lead?: ReactNode; scene: ReactNode; children?: ReactNode }) {
  return (
    <section className="rise grid items-center gap-6 pt-2 pb-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <div className="min-w-0 text-center md:text-left">
        <h1 className="text-4xl font-extrabold leading-none tracking-tight text-ink sm:text-5xl lg:text-6xl">{title}</h1>
        <Squiggle className="mx-auto md:mx-0" />
        {lead && <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft md:mx-0">{lead}</p>}
        {children}
      </div>
      <div className="order-first mx-auto w-full max-w-[18rem] md:order-none md:ml-auto md:max-w-md">{scene}</div>
    </section>
  );
}
