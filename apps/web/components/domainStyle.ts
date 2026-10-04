// Colour family and emoji for every study domain id, used on the result cards.
export type Family = "teal" | "primary" | "mint" | "violet" | "sky";

/** Full class names (written out so Tailwind can see them). */
export const FAMILY_CLASSES: Record<Family, { stroke: string; band: string; text: string; badge: string; chip: string; ring: string }> = {
  teal: { stroke: "stroke-teal", band: "bg-teal-tint", text: "text-teal-ink", badge: "bg-teal-ink", chip: "bg-teal-tint text-teal-ink", ring: "ring-teal" },
  primary: { stroke: "stroke-primary", band: "bg-primary-tint", text: "text-primary-dark", badge: "bg-primary-dark", chip: "bg-primary-tint text-primary-dark", ring: "ring-primary" },
  mint: { stroke: "stroke-mint", band: "bg-mint-tint", text: "text-mint-ink", badge: "bg-mint-ink", chip: "bg-mint-tint text-mint-ink", ring: "ring-mint" },
  violet: { stroke: "stroke-violet", band: "bg-violet-tint", text: "text-violet-ink", badge: "bg-violet-ink", chip: "bg-violet-tint text-violet-ink", ring: "ring-violet" },
  sky: { stroke: "stroke-sky", band: "bg-sky-tint", text: "text-sky-ink", badge: "bg-sky-ink", chip: "bg-sky-tint text-sky-ink", ring: "ring-sky" },
};

const STYLES: Record<string, [Family, string]> = {
  // health
  medicina: ["teal", "🩺"],
  "medicina-dentara": ["teal", "🦷"],
  farmacie: ["teal", "💊"],
  "medicina-veterinara": ["teal", "🐾"],
  "asistenta-medicala": ["teal", "🩹"],
  // tech, engineering, exact sciences
  informatica: ["primary", "💻"],
  "calculatoare-it": ["primary", "🖥️"],
  "inginerie-electrica-electronica": ["primary", "⚡"],
  "inginerie-mecanica": ["primary", "⚙️"],
  "inginerie-civila": ["primary", "🏗️"],
  "inginerie-chimica-materiale": ["primary", "⚗️"],
  "energie-petrol-mediu": ["primary", "🛢️"],
  matematica: ["primary", "➗"],
  fizica: ["primary", "🔭"],
  chimie: ["primary", "🧪"],
  // nature
  biologie: ["mint", "🧬"],
  "geografie-mediu": ["mint", "🌍"],
  "agronomie-silvicultura": ["mint", "🌱"],
  // people, education, psychology, social
  psihologie: ["violet", "🧠"],
  "sociologie-asistenta-sociala": ["violet", "🤝"],
  "stiintele-educatiei": ["violet", "🎓"],
  "litere-limbi-straine": ["violet", "📖"],
  istorie: ["violet", "🏛️"],
  filosofie: ["violet", "💭"],
  teologie: ["violet", "🕊️"],
  "comunicare-jurnalism": ["violet", "🎙️"],
  // business, law, politics, administration
  "economie-finante": ["primary", "📈"],
  "business-management": ["primary", "💼"],
  marketing: ["primary", "📣"],
  drept: ["primary", "⚖️"],
  "stiinte-politice-relatii-internationale": ["primary", "🌐"],
  "administratie-publica": ["primary", "🏢"],
  // arts
  arhitectura: ["sky", "📐"],
  "arte-vizuale-design": ["sky", "🎨"],
  muzica: ["sky", "🎵"],
  "teatru-film": ["sky", "🎭"],
  // sport, military, transport, tourism
  "sport-kinetoterapie": ["sky", "🏃"],
  "militar-politie": ["sky", "🛡️"],
  "marina-transporturi": ["sky", "⚓"],
  "turism-servicii": ["sky", "🧳"],
};

export function domainStyle(id: string): { family: Family; emoji: string } {
  const [family, emoji] = STYLES[id] ?? ["primary", "🎓"];
  return { family, emoji };
}
