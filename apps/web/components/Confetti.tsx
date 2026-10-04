"use client";
// A short burst of cool-coloured confetti, shown once when mounted and removed after about 3 seconds.
import { useEffect, useState, type CSSProperties } from "react";

const COLORS = ["#61122d", "#1a2a4c", "#c8962e", "#9a3553", "#35508a"];

// Deterministic pseudo-random so server and client render the same markup.
const r = (i: number, k: number) => (((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1) + 1) % 1;

export function Confetti() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setOn(false), 3000);
    return () => clearTimeout(t);
  }, []);
  if (!on) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 48 }, (_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${r(i, 1) * 100}%`,
              width: `${6 + r(i, 2) * 6}px`,
              height: `${8 + r(i, 3) * 8}px`,
              background: COLORS[i % COLORS.length],
              borderRadius: i % 3 === 0 ? "50%" : "2px",
              "--dx": `${(r(i, 4) - 0.5) * 160}px`,
              "--rot": `${360 + r(i, 5) * 540}deg`,
              "--d": `${r(i, 6) * 500}ms`,
              "--t": `${1.6 + r(i, 7) * 0.8}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
