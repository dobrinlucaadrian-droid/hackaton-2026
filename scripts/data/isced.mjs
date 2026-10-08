// Shared mapping from ISCED-F 2013 detailed fields (4-digit codes) to the app's 40 study domains. Our own choice; null = no good match.
const MAP = {
  // 01 Education
  "0110": "stiintele-educatiei", "0111": "stiintele-educatiei", "0112": "stiintele-educatiei", "0113": "stiintele-educatiei", "0114": "stiintele-educatiei", "0119": "stiintele-educatiei",
  // 02 Arts and humanities
  "0211": "teatru-film", "0212": "arte-vizuale-design", "0213": "arte-vizuale-design", "0214": "arte-vizuale-design", "0215": "muzica", "0219": "arte-vizuale-design",
  "0221": "teologie", "0222": "istorie", "0223": "filosofie", "0229": null,
  "0231": "litere-limbi-straine", "0232": "litere-limbi-straine", "0239": "litere-limbi-straine",
  // 03 Social sciences, journalism and information
  "0311": "economie-finante", "0312": "stiinte-politice-relatii-internationale", "0313": "psihologie", "0314": "sociologie-asistenta-sociala", "0319": null,
  "0321": "comunicare-jurnalism", "0322": "comunicare-jurnalism", "0329": "comunicare-jurnalism",
  // 04 Business, administration and law
  "0411": "economie-finante", "0412": "economie-finante", "0413": "business-management", "0414": "marketing", "0415": "business-management", "0416": "business-management", "0417": null, "0419": "business-management",
  "0421": "drept", "0429": "drept",
  // 05 Natural sciences, mathematics and statistics
  "0511": "biologie", "0512": "biologie", "0519": "biologie", "0521": "geografie-mediu", "0522": "geografie-mediu", "0529": "geografie-mediu",
  "0531": "chimie", "0532": "geografie-mediu", "0533": "fizica", "0539": null, "0541": "matematica", "0542": "matematica", "0549": "matematica",
  // 06 Information and communication technologies
  "0611": "informatica", "0612": "calculatoare-it", "0613": "informatica", "0619": "calculatoare-it",
  // 07 Engineering, manufacturing and construction
  "0711": "inginerie-chimica-materiale", "0712": "energie-petrol-mediu", "0713": "inginerie-electrica-electronica", "0714": "inginerie-electrica-electronica", "0715": "inginerie-mecanica", "0716": "inginerie-mecanica", "0719": null,
  "0721": "inginerie-chimica-materiale", "0722": "inginerie-chimica-materiale", "0723": "inginerie-chimica-materiale", "0724": "energie-petrol-mediu", "0729": "inginerie-chimica-materiale",
  "0731": "arhitectura", "0732": "inginerie-civila", "0739": "inginerie-civila",
  // 08 Agriculture, forestry, fisheries and veterinary
  "0811": "agronomie-silvicultura", "0812": "agronomie-silvicultura", "0819": "agronomie-silvicultura", "0821": "agronomie-silvicultura", "0831": "agronomie-silvicultura", "0841": "medicina-veterinara",
  // 09 Health and welfare
  "0911": "medicina-dentara", "0912": "medicina", "0913": "asistenta-medicala", "0914": "asistenta-medicala", "0915": "sport-kinetoterapie", "0916": "farmacie", "0917": "asistenta-medicala", "0919": "asistenta-medicala",
  "0921": "sociologie-asistenta-sociala", "0922": "sociologie-asistenta-sociala", "0923": "sociologie-asistenta-sociala", "0929": "sociologie-asistenta-sociala",
  // 10 Services
  "1011": null, "1012": null, "1013": "turism-servicii", "1014": "sport-kinetoterapie", "1015": "turism-servicii", "1019": "turism-servicii",
  "1021": null, "1022": null, "1031": "militar-politie", "1032": "militar-politie", "1039": "militar-politie", "1041": "marina-transporturi",
};

/** The app's 40 study-domain ids. */
export const DOMAIN_IDS = [
  "medicina", "medicina-dentara", "farmacie", "medicina-veterinara", "asistenta-medicala", "informatica", "calculatoare-it", "inginerie-electrica-electronica", "inginerie-mecanica", "inginerie-civila",
  "arhitectura", "inginerie-chimica-materiale", "energie-petrol-mediu", "matematica", "fizica", "chimie", "biologie", "geografie-mediu", "agronomie-silvicultura", "economie-finante", "business-management",
  "marketing", "drept", "stiinte-politice-relatii-internationale", "administratie-publica", "comunicare-jurnalism", "psihologie", "sociologie-asistenta-sociala", "stiintele-educatiei", "litere-limbi-straine",
  "istorie", "filosofie", "teologie", "arte-vizuale-design", "muzica", "teatru-film", "sport-kinetoterapie", "militar-politie", "marina-transporturi", "turism-servicii",
];

/** ISCED-F 2013 code ("0613", "613", "061", 613…) -> app domain id, or null. Interdisciplinary codes (…88) and unknown codes give null. */
export function iscedToDomain(code) {
  const c = String(code ?? "").replace(/\D/g, "");
  if (!c) return null;
  const four = c.length === 3 ? `0${c}` : c.slice(0, 4);
  return four in MAP ? MAP[four] : null;
}
