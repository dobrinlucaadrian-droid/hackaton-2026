// Builds the French catalogue (institutions + first-cycle programmes) from the Parcoursup 2026 cartography plus the MESR list of diplomas of public institutions (licences professionnelles, licence mentions): node scripts/data/fr/build.mjs <raw-folder>
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { DOMAIN_IDS } from "../isced.mjs";

const RAW = process.argv[2];
if (!RAW) { console.error("usage: node scripts/data/fr/build.mjs <raw-folder>"); process.exit(1); }
const API = "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/";
// Three open datasets of the French ministry of higher education (all Licence Ouverte v2.0), see README.md.
const FILES = {
  "carto-2026.csv": API + "fr-esr-cartographie_formations_parcoursup/exports/csv?delimiter=%3B&refine=annee%3A2026", // the offers (session 2026)
  "parcoursup.csv": API + "fr-esr-parcoursup/exports/csv?delimiter=%3B", // session 2025: places per offer and the plain establishment names
  "diplomes-2024-25.csv": API + "fr-esr-principaux-diplomes-et-formations-prepares-etablissements-publics/exports/csv?delimiter=%3B&refine=annee_universitaire%3A2024-25",
};
const SRC_PS = "Parcoursup 2026 (MESR open data, cartographie des formations, 2026-10-08)";
const SRC_MESR = "MESR, diplômes préparés dans les établissements publics 2024-25 (open data SISE, 2025-11-07)";
const OUT = new URL("../../../apps/web/data/catalog/", import.meta.url);

mkdirSync(RAW, { recursive: true });
for (const [name, url] of Object.entries(FILES)) {
  if (existsSync(join(RAW, name))) continue;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed for ${name}: HTTP ${res.status}`);
  writeFileSync(join(RAW, name), Buffer.from(await res.arrayBuffer()));
}

function parseCsv(t, d = ";") {
  t = t.replace(/^﻿/, "");
  const rows = []; let r = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === d) { r.push(f); f = ""; }
    else if (c === "\n") { r.push(f); rows.push(r); r = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  return rows;
}
function load(name) {
  const [head, ...body] = parseCsv(readFileSync(join(RAW, name), "utf8"));
  const rows = body.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((k, i) => [k, r[i]])));
  if (rows.length !== body.length) throw new Error(`${name}: malformed rows: ${body.length - rows.length}`);
  return rows;
}
const carto = load("carto-2026.csv"), psup2025 = load("parcoursup.csv"), diplomas = load("diplomes-2024-25.csv");
if (carto.some((x) => x.annee !== "2026")) throw new Error("carto-2026.csv must hold only the 2026 session");
if (diplomas.some((x) => x.annee_universitaire !== "2024-25")) throw new Error("diplomes-2024-25.csv must hold only 2024-25");

const tidy = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const ascii = (s) => tidy(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/gi, "oe").replace(/æ/gi, "ae").toLowerCase();
const norm = (s) => ascii(s).replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s, max) => ascii(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, max).replace(/-$/, "");
const search = (s) => { const t = norm(s); return t.length <= 600 ? t : t.slice(0, 600).replace(/ \S*$/, ""); };
const city = (s) => tidy(s).replace(/^(Paris|Lyon|Marseille)\s+\d+(er|e)(\s+Arrondissement)?$/i, "$1");
const mode = (arr) => { const m = new Map(); arr.forEach((v) => m.set(v, (m.get(v) || 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length || a[0].localeCompare(b[0]))[0][0]; };
const count = (m, k) => m.set(k, (m.get(k) || 0) + 1);
// Parcoursup writes the establishment as "Name (Commune - 75)" or "Name (75)": the part in brackets is the place, not the name.
const PLACE = /\s*\((?:([^()]*) - )?(\d{2,3}|2[AB])\)$/;
const bareName = (s) => { let t = tidy(s); while (PLACE.test(t)) t = t.replace(PLACE, "").trim(); return t; };

// ---------- Part 1: Parcoursup 2026 offers ----------

// Which formation types are kept (see README). The returned label is the type used in the counts.
function classify(x) {
  const n = x.nm, tf = x.tf;
  if (/^BUT - /.test(n)) return "BUT";
  if (/^Licence professionnelle/.test(n)) return null; // licences professionnelles come from the MESR diplomas list (part 2)
  if (/^(Licence|Double licence) - /.test(n)) {
    if (/Parcours d'Accès Spécifique Santé/.test(n)) return "PASS";
    if (/Accès Santé \(LAS\)/i.test(n)) return "Licence accès santé (LAS)";
    if (/Professorat des Ecoles/i.test(x.fl)) return "Licence professorat des écoles (LPE)";
    return "Licence";
  }
  if (/écoles d'ingénieurs/.test(tf) && !/^Formation des écoles de commerce/.test(n)) return "Ecole d'ingénieurs";
  if (/écoles de commerce/.test(tf)) return "Ecole de commerce";
  if (/Sciences Po/.test(tf) && !/^Diplôme d'Université/.test(n)) return "Sciences Po / IEP";
  if (/^Formation valant grade de licence/.test(n)) return "Formation valant grade de licence";
  if (/^EA-BAC3 /.test(x.fl)) return "Formations Bac + 3"; // Ecole du Louvre, kept since the first version
  return null;
}

// Domain mapping: first matching rule wins; a null rule means deliberately unmapped.
// Applied to the official mention / BUT speciality, then to the programme label. Text is lower-case without accents.
const RULES = [
  [/staps|activites physiques/, "sport-kinetoterapie"],
  [/theologie|droit canonique/, "teologie"],
  [/sciences sanitaires et sociales|carrieres sociales/, "sociologie-asistenta-sociala"],
  [/pass\b|parcours d'acces specifique sante|sciences pour la sante|^sante\b/, "medicina"],
  [/administration publique/, "administratie-publica"],
  [/carrieres juridiques|\bdroits?\b/, "drept"],
  [/techniques de commercialisation|marketing/, "marketing"],
  [/economie/, "economie-finante"],
  [/gestion|management de la logistique/, "business-management"],
  [/science politique|etudes politiques|etudes europeennes/, "stiinte-politice-relatii-internationale"],
  [/sciences de l'education|professorat des ecoles/, "stiintele-educatiei"],
  [/information et communication|information communication|information-communication|journalisme/, "comunicare-jurnalism"],
  [/arts du spectacle|etudes theatrales|cinema/, "teatru-film"],
  [/musicologie/, "muzica"],
  [/arts plastiques|^arts$/, "arte-vizuale-design"],
  [/langues etrangeres appliquees|langues, litterat|^lettres|sciences du langage|langues, enseignement/, "litere-limbi-straine"],
  [/histoire/, "istorie"],
  [/geographie|sciences de la terre|transition ecologique|terre, eau, environnement/, "geografie-mediu"],
  [/philosophie/, "filosofie"],
  [/psychologie/, "psihologie"],
  [/sociologie|sciences sociales|sciences de l'homme/, "sociologie-asistenta-sociala"],
  [/mathematiques et informatique appliquees/, "matematica"],
  [/^informatique|science des donnees/, "informatica"],
  [/reseaux et telecommunications/, "calculatoare-it"],
  [/^mathematiques/, "matematica"],
  [/physique, chimie|^physique|mesures physiques|acoustique/, "fizica"],
  [/genie chimique|science et genie des materiaux/, "inginerie-chimica-materiale"],
  [/^chimie/, "chimie"],
  [/genie biologique parcours agronomie|vigne et du vin/, "agronomie-silvicultura"],
  [/dietetique/, null],
  [/genie biologique|sciences de la vie|sciences biomedicales/, "biologie"],
  [/genie civil|genie urbain/, "inginerie-civila"],
  [/genie mecanique|^mecanique|genie industriel/, "inginerie-mecanica"],
  [/electrique|electronique/, "inginerie-electrica-electronica"],
  [/efficacite energetiques/, "energie-petrol-mediu"],
  [/tourisme/, "turism-servicii"],
];
const ENG_RULES = [ // engineering schools: used only when the label names exactly one field
  [/informatique/, "informatica"], [/\bbtp\b|genie civil|construction/, "inginerie-civila"], [/mecani/, "inginerie-mecanica"],
  [/electri|electronique/, "inginerie-electrica-electronica"], [/chimi|materiaux/, "inginerie-chimica-materiale"], [/agro|agricol/, "agronomie-silvicultura"],
];
const first = (text, rules) => { for (const [re, id] of rules) if (re.test(text)) return id; return undefined; };

// The official mentions (Licence) or the speciality (BUT) behind an offer, from the "Mentions/Spécialités" column.
const mentionsOf = (x) => [...new Set(x.fl.split(/,(?=L1 - )/).map((m) => tidy(m.replace(/^L1 - /, ""))).filter(Boolean))];
function butSpeciality(x) {
  const items = x.fl.split(/,(?=BUT - )/).map((m) => tidy(m.replace(/^BUT - /, ""))).filter(Boolean);
  const label = ascii(x.nm.replace(/^BUT - /, ""));
  const hit = items.filter((m) => label.startsWith(ascii(m))).sort((a, b) => b.length - a.length)[0];
  return hit ?? items[items.length - 1] ?? "";
}
function mapDomain(type, x, domainParts) {
  const label = ascii(x.nm);
  if (type === "PASS") return "medicina";
  if (type === "Sciences Po / IEP") return "stiinte-politice-relatii-internationale";
  if (type === "Ecole de commerce") {
    if (/marketing/.test(label)) return "marketing";
    if (/finance/.test(label)) return "economie-finante";
    if (/tourisme|hospitality|hotel/.test(label)) return "turism-servicii";
    return "business-management";
  }
  if (type === "Ecole d'ingénieurs") {
    const ids = new Set(ENG_RULES.filter(([re]) => re.test(label)).map(([, id]) => id));
    return ids.size === 1 ? [...ids][0] : null;
  }
  if (type === "Formation valant grade de licence" || type === "Formations Bac + 3") return first(label.replace(/^formation valant grade de licence - /, ""), RULES) ?? null;
  const rest = label.replace(/^(licence|but|double licence)\s*-\s*/, "");
  if (domainParts.length === 1) return first(ascii(domainParts[0]), RULES) ?? first(rest, RULES) ?? null;
  // several mentions (double licences, first-year "portails"): a domain only when they all agree, or, for a double licence, the discipline named first
  const ids = new Set(domainParts.map((m) => first(ascii(m), RULES) ?? null));
  if (ids.size === 1) return [...ids][0];
  if (/^double licence/.test(label) && rest.includes(" / ")) return first(rest.split(" / ")[0], RULES) ?? null;
  return null;
}

const old = new Map(psup2025.map((x) => [x.cod_aff_form, x])); // the same offer code in the 2025 session
const oldName = new Map(psup2025.map((x) => [x.cod_uai, tidy(x.g_ea_lib_vx)]));

// Count every formation type in the source, keep the wanted ones.
const kept = [], dropped = new Map(), keptCount = new Map(); let foreign = 0, apprenticeship = 0;
for (const x of carto) {
  const type = classify(x);
  if (!type) { count(dropped, `${x.tf} | ${x.nm.split(" - ")[0].slice(0, 50)}`); continue; }
  if (x.app) { apprenticeship++; continue; } // the same programme taken as an apprenticeship is a second offer in the source
  let place = city(x.commune);
  if (!place) { // no commune: abroad, unless the name ends with a French département
    const m = tidy(x.etab_nom).match(PLACE);
    if (!m) { foreign++; continue; }
    place = city(m[1] || "");
  }
  kept.push({ x, type, place }); count(keptCount, type);
}

// Existing app sheets, matched by the establishment's official UAI code.
const SHEETS = { "0755890V": "sorbonne", "0753431X": "sciences-po", "0690192J": "insa-lyon" };

const byUai = new Map();
for (const k of kept) { const a = byUai.get(k.x.etab_uai) || []; a.push(k); byUai.set(k.x.etab_uai, a); }
// Name of the establishment: the 2026 label when every offer agrees; otherwise (schools that write the track in the label) the plain 2025 name.
const nameOf = new Map();
for (const [uai, rows] of byUai) {
  const names = [...new Set(rows.map((k) => bareName(k.x.etab_nom)))];
  nameOf.set(uai, names.length === 1 ? names[0] : oldName.get(uai) || mode(rows.map((k) => bareName(k.x.etab_nom))));
}
const slugCount = new Map();
for (const uai of byUai.keys()) count(slugCount, slug(nameOf.get(uai), 60));
const instOf = new Map();
for (const [uai, rows] of byUai) {
  const name = nameOf.get(uai), s = slug(name, 60);
  const id = SHEETS[uai] ?? (slugCount.get(s) > 1 ? `fr-${s}-${uai.toLowerCase()}` : `fr-${s}`);
  const places = rows.map((k) => k.place).filter(Boolean);
  const seat = places.length ? mode(places) : city(old.get(rows[0].x.gta)?.ville_etab || psup2025.find((p) => p.cod_uai === uai)?.ville_etab || "");
  if (!seat) throw new Error(`no city for ${uai} ${name}`);
  const inst = { id, country: "FR", source: SRC_PS, name, officialName: name, city: seat, kind: rows[0].x.tc === "Publics" ? "public" : "private", hasSheet: uai in SHEETS };
  const sites = rows.map((k) => tidy(k.x.etab_url)).filter((u) => /^https?:\/\/[^\s]+\.[^\s]+$/.test(u));
  if (sites.length) inst.website = mode(sites);
  inst.programs = 0;
  instOf.set(uai, inst);
}

const programs = [], usedKeys = new Set(), noDomainByType = new Map(), bySourceType = new Map();
function add(p, inst, type) {
  if (p.domainId && !DOMAIN_IDS.includes(p.domainId)) throw new Error(`bad domain ${p.domainId}`);
  if (usedKeys.has(p.key)) throw new Error(`duplicate key ${p.key}`);
  usedKeys.add(p.key);
  if (p.domainId === null) count(noDomainByType, type);
  count(bySourceType, type);
  programs.push(p); inst.programs++;
}
for (const { x, type, place } of kept) {
  const inst = instOf.get(x.etab_uai);
  const name = tidy(x.nm).replace(/\s*-$/, "");
  const parts = type === "BUT" ? [butSpeciality(x)].filter(Boolean) : /^(Licence|PASS)/.test(type) ? mentionsOf(x) : [tidy(x.fl)].filter(Boolean);
  let domain = parts.join(" ; ") || tidy(x.tf);
  if (domain.length > 300) domain = domain.slice(0, 300).replace(/ ; [^;]*$/, "");
  // gta is Parcoursup's unique code of the offer, so keys never collide
  const p = { key: `fr-${slug(inst.id.replace(/^fr-/, ""), 40)}--${slug(name, 70)}--${x.gta}`, country: "FR", institutionId: inst.id, institutionName: inst.name, city: place || inst.city };
  const label = bareName(x.etab_nom); // schools often write the site or the track in the establishment label
  if (norm(label) !== norm(inst.name) && label.length >= 2 && label.length <= 300) p.faculty = label;
  Object.assign(p, { domain, domainId: mapDomain(type, x, parts), name, language: "franceză" });
  const bac = name.match(/Bac\s*\+\s*([3-6])\b/i); if (bac) p.years = Number(bac[1]);
  const cap = parseInt(old.get(x.gta)?.capa_fin, 10); if (Number.isInteger(cap) && cap >= 0) p.maxStudents = cap; // places of the same offer in the 2025 session
  if (/^https?:\/\/[^\s]+\.[^\s]+$/.test(tidy(x.fiche))) p.url = tidy(x.fiche);
  p.source = SRC_PS;
  p.search = search([name, domain, p.faculty, inst.name, p.city, "franceza"].filter(Boolean).join(" "));
  add(p, inst, type);
}
const fromParcoursup = programs.length;

// ---------- Part 2: MESR list of diplomas of public institutions (licences professionnelles and licence mentions) ----------

// The MESR list writes labels without accents. Accents are put back word by word, only where the Parcoursup texts always write that word with the same accents.
const forms = new Map();
const learn = (text) => { for (const t of text.match(/\p{L}+/gu) || []) {
  if (/^[AEIOU]/.test(t) || (t.length > 1 && t === t.toUpperCase())) continue; // a capital vowel is often written without its accent, and so are words in capitals
  const k = ascii(t); let m = forms.get(k); if (!m) forms.set(k, (m = new Map())); count(m, t.toLowerCase());
} };
for (const x of carto) learn(`${x.nm} ${x.fl}`);
for (const x of psup2025) learn(`${x.lib_for_voe_ins} ${x.fil_lib_voe_acc} ${x.detail_forma} ${x.lib_comp_voe_ins}`);
for (const x of diplomas) learn(`${x.sect_disciplinaire_lib} ${x.discipline_lib} ${x.spec_iut_lib} ${x.gd_disciscipline_lib}`);
// Words of the MESR labels that the Parcoursup texts never use: spelling written by hand (accents and acronyms only, the words are the source's).
const SPELLING = { automatises: "automatisés", conferencier: "conférencier", cosmetologiques: "cosmétologiques", decisionnel: "décisionnel", electricite: "électricité", entites: "entités",
  experimentale: "expérimentale", fiscalite: "fiscalité", foret: "forêt", hydrotherapie: "hydrothérapie", maitrise: "maîtrise", marches: "marchés", metallurgie: "métallurgie", microelectronique: "microélectronique",
  operationnels: "opérationnels", pedagogiques: "pédagogiques", prive: "privé", privees: "privées", redaction: "rédaction", revision: "révision", vegetales: "végétales", vulnerables: "vulnérables",
  hygiene: "hygiène", synthese: "synthèse", hoteliers: "hôteliers", competences: "compétences", reinsertion: "réinsertion", specifiques: "spécifiques", biomedicale: "biomédicale", comptabilite: "comptabilité",
  electronique: "électronique", grh: "GRH", btp: "BTP", staps: "STAPS" };
const accentWord = (w) => {
  const k = ascii(w), m = forms.get(k);
  if (SPELLING[k]) return w[0] === w[0].toLowerCase() || SPELLING[k] === SPELLING[k].toUpperCase() ? SPELLING[k] : SPELLING[k][0].toUpperCase() + SPELLING[k].slice(1);
  if (!m || w !== (w[0] + w.slice(1).toLowerCase()) && w !== w.toLowerCase()) return w;
  const plain = m.get(k) || 0;
  const best = [...m].filter(([f]) => f !== k).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] < 2 || best[1] < 5 * plain) return w;
  return w[0] === w[0].toLowerCase() ? best[0] : best[0][0].toUpperCase() + best[0].slice(1);
};
const accent = (s) => tidy(s).replace(/\p{L}+/gu, accentWord);
// The official spelling of a licence mention, as Parcoursup writes it.
const mentionSpelling = new Map();
{ const seen = new Map();
  for (const { x, type } of kept) if (/^(Licence|PASS)/.test(type)) for (const m of mentionsOf(x)) { const k = norm(m); if (!seen.has(k)) seen.set(k, []); seen.get(k).push(m); }
  for (const [k, v] of seen) mentionSpelling.set(k, mode(v)); }
// The two lists name a few mentions differently; this key makes them comparable.
const mentionKey = (s) => norm(s).replace(/^sciences et techniques des activites physiques et sportives.*$/, "staps").replace(/^(portail )?staps\b.*$/, "staps")
  .replace(/^information communication$/, "information et communication").replace(/^droits francais droits etrangers$/, "droit francais droit etranger")
  .replace(/^sciences de la terre et de l environnement$/, "sciences de la terre et environnement").replace(/^sciences de l education et de la formation$/, "sciences de l education");

// Licences professionnelles: keywords on the mention first, then the ministry's "secteur disciplinaire".
const LP_RULES = [
  [/maintenance|mecatronique|industrie navale|aeronautique|automobile|optique professionnelle|securite des biens|agent de recherches|structures sanitaires|^metiers de la sante|pharmaceutiques|medicale|produits de sante|^metiers de la qualite|^qualite,|^analyse, qualite|controle qualite|\bbois\b|metiers de la mer|agencement|jeu video|decisionnel|relation a l'animal/, null],
  [/comptabilite|banque|finance|fiscalite/, "economie-finante"],
  [/agronom|agricol|agriculture|productions animales|productions vegetales|vigne|foret|agro-ressources|agroalimentaire|amenagement paysager/, "agronomie-silvicultura"],
  [/tourisme|hotelier|arts culinaires|guide conferencier/, "turism-servicii"],
  [/intervention sociale|animation sociale|services a la personne/, "sociologie-asistenta-sociala"],
  [/administrations et collectivites/, "administratie-publica"],
  [/activites juridiques|notariat|protection juridique/, "drept"],
  [/marketing|^commercialisation|technico-commercial/, "marketing"],
  [/reseaux informatiques|administration et securite des systemes/, "calculatoare-it"],
  [/\bbtp\b/, "inginerie-civila"],
  [/electri|electroni|domotique|systemes automatises/, "inginerie-electrica-electronica"],
  [/energie|energeti|frigorifiques|nucleaire/, "energie-petrol-mediu"],
  [/genie des procedes|procedes industriels|materiaux/, "inginerie-chimica-materiale"],
  [/^chimie/, "chimie"],
  [/acoustique/, "fizica"],
  [/cartographie/, "geografie-mediu"],
  [/formation des adultes|projets pedagogiques/, "stiintele-educatiei"],
  [/metiers du design|metiers de la mode/, "arte-vizuale-design"],
];
const SECTOR = {
  "Sciences de gestion": "business-management", "Sciences juridiques": "drept", "Pluridisciplinaire droit, sciences politiques": "drept", "Informatique": "informatica",
  "Sciences de l'information et la communication": "comunicare-jurnalism", "Sciences de la vie": "biologie", "Sciences économiques": "economie-finante", "Sociologie, démographie": "sociologie-asistenta-sociala",
  "Aménagement": "geografie-mediu", "STAPS": "sport-kinetoterapie", "Électronique, génie électrique": "inginerie-electrica-electronica", "Génie civil": "inginerie-civila",
  "Mécanique, génie mécanique": "inginerie-mecanica", "Physique": "fizica", "Physique et chimie": "fizica", "Chimie": "chimie",
};

const isLp = (x) => x.diplome_rgp === "Licence professionnelle";
const isLicence = (x) => x.typ_diplome === "XA" && x.diplome_lib !== "CPES" && !/^portail /i.test(x.libelle_intitule_1); // "Portail ..." rows are first-year gateways, not mentions
const mesr = new Map(); // public institution -> its LP and licence mentions
for (const x of diplomas) {
  const kind = isLp(x) ? "lp" : isLicence(x) ? "licence" : null; if (!kind) continue;
  let e = mesr.get(x.etablissement_id_paysage);
  if (!e) mesr.set(x.etablissement_id_paysage, (e = { paysage: new Set([x.etablissement_id_paysage, x.etablissement_id_paysage_actuel]), name: tidy(x.etablissement_lib), uais: x.etablissement_id_uai.split(",").map(tidy).filter(Boolean), seat: city(x.etablissement_commune), lp: new Map(), licence: new Map() }));
  const k = kind === "lp" ? norm(x.libelle_intitule_1) : mentionKey(x.libelle_intitule_1);
  let m = e[kind].get(k);
  if (!m) e[kind].set(k, (m = { labels: [], sector: x.sect_disciplinaire_lib, codes: new Set(), where: new Map(), oneYear: true }));
  m.labels.push(tidy(x.libelle_intitule_1)); m.codes.add(x.diplom);
  if (x.diplome_lib !== "Licence professionnelle en 1 an") m.oneYear = false;
  const c = city(x.implantation_commune) || e.seat; m.where.set(c, (m.where.get(c) || 0) + (Number(x.effectif) || 0));
}

// Which Parcoursup establishments belong to a public institution of the MESR list: same UAI code, same "paysage" identifier, or a name that contains the institution's name.
const paysageOf = new Map();
for (const { x } of kept) if (x.etablissement_id_paysage) (paysageOf.get(x.etab_uai) || paysageOf.set(x.etab_uai, new Set()).get(x.etab_uai)).add(x.etablissement_id_paysage);
const labelsOf = new Map();
for (const { x } of kept) (labelsOf.get(x.etab_uai) || labelsOf.set(x.etab_uai, new Set()).get(x.etab_uai)).add(norm(bareName(x.etab_nom)));
const owned = new Set(); // establishments attributed to some MESR institution
for (const e of mesr.values()) {
  const n = norm(e.name);
  e.group = [...byUai.keys()].filter((u) => e.uais.includes(u) || [...(paysageOf.get(u) || [])].some((p) => e.paysage.has(p)) || [...labelsOf.get(u), norm(instOf.get(u).name)].some((l) => l.includes(n)));
  e.group.forEach((u) => owned.add(u));
}
// Licence offers with exactly one mention: these are the "named" licences already in the catalogue.
const single = new Map(), singleUnowned = new Set(); // uai -> mention keys; "commune|mention" for public establishments that belong to no MESR institution
for (const { x, type, place } of kept) {
  if (!/^(Licence|PASS)/.test(type)) continue;
  const m = mentionsOf(x); if (m.length !== 1) continue;
  (single.get(x.etab_uai) || single.set(x.etab_uai, new Set()).get(x.etab_uai)).add(mentionKey(m[0]));
  if (!owned.has(x.etab_uai) && x.tc === "Publics") singleUnowned.add(`${norm(place)}|${mentionKey(m[0])}`);
}

const match = { uai: [], name: [], created: [] }; const licenceStats = { mentions: 0, alreadyNamed: 0, sameCommune: 0, added: 0 }; let lpRows = 0;
const usedIds = new Set([...instOf.values()].map((i) => i.id));
for (const e of [...mesr.values()].sort((a, b) => a.name.localeCompare(b.name))) {
  // the institution these rows hang on: the Parcoursup establishment with the same UAI code, else one with exactly the same name, else a new entry
  let inst = e.uais.map((u) => instOf.get(u)).filter(Boolean).sort((a, b) => b.programs - a.programs)[0];
  if (inst) match.uai.push(e.name);
  else if ((inst = [...instOf.values()].find((i) => norm(i.name) === norm(e.name)))) match.name.push(e.name);
  else {
    let id = `fr-${slug(e.name, 60)}`; if (usedIds.has(id)) id += `-${e.uais[0].toLowerCase()}`;
    inst = { id, country: "FR", source: SRC_MESR, name: e.name, officialName: e.name, city: e.seat, kind: "public", hasSheet: false, programs: 0 };
    usedIds.add(id); instOf.set(`mesr:${id}`, inst); match.created.push(`${e.name} (${e.group.length} Parcoursup establishments)`);
  }
  const row = (m, name, domain, domainId, type) => {
    const place = [...m.where].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]; // the commune with most students of this diploma
    const p = { key: `fr-${slug(inst.id.replace(/^fr-/, ""), 40)}--${slug(name, 70)}--mesr${[...m.codes].sort()[0]}`, country: "FR", institutionId: inst.id, institutionName: inst.name, city: place, domain, domainId, name, language: "franceză" };
    if (type === "Licence professionnelle (MESR)" && m.oneYear) p.years = 1; // "Licence professionnelle en 1 an": one year after a two-year diploma
    p.source = SRC_MESR;
    p.search = search([name, domain, inst.name, place, "franceza"].join(" "));
    add(p, inst, type);
  };
  for (const m of e.lp.values()) {
    const a = ascii(m.labels[0]);
    const hit = first(a, LP_RULES);
    row(m, `Licence professionnelle - ${accent(m.labels[0])}`, m.sector, hit !== undefined ? hit : SECTOR[m.sector] ?? null, "Licence professionnelle (MESR)"); lpRows++;
  }
  for (const [k, m] of e.licence) {
    licenceStats.mentions++;
    if (e.group.some((u) => single.get(u)?.has(k))) { licenceStats.alreadyNamed++; continue; } // already a Parcoursup row of this university
    if ([...m.where.keys()].some((c) => singleUnowned.has(`${norm(c)}|${k}`))) { licenceStats.sameCommune++; continue; } // probably the same licence under an establishment we could not attribute
    const label = mentionSpelling.get(norm(m.labels[0])) ?? accent(m.labels[0]);
    row(m, `Licence - ${label}`, m.sector, first(ascii(m.labels[0]), RULES) ?? null, "Licence, mention (MESR)"); licenceStats.added++;
  }
}

const institutions = [...instOf.values()].filter((i) => i.programs > 0).sort((a, b) => a.id.localeCompare(b.id));
programs.sort((a, b) => a.key.localeCompare(b.key));
mkdirSync(OUT, { recursive: true });
writeFileSync(new URL("fr-institutions.json", OUT), JSON.stringify(institutions, null, 1) + "\n");
// gzipped JSON Lines: the plain JSON is over the 5 MB per-file limit of the project gate (see scripts/data/CONTRACT.md)
writeFileSync(new URL("fr-programs.jsonl.gz", OUT), gzipSync(programs.map((p) => JSON.stringify(p)).join("\n") + "\n"));

const list = (m) => [...m].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join("; ");
console.log(`Parcoursup 2026 rows: ${carto.length}; kept: ${kept.length}; dropped (type): ${[...dropped.values()].reduce((a, b) => a + b, 0)}; dropped (apprenticeship offer of a kept type): ${apprenticeship}; dropped (abroad): ${foreign}`);
console.log(`offer codes also in the 2025 session (places known): ${kept.filter((k) => old.has(k.x.gta)).length} of ${kept.length}`);
console.log("ROWS BY TYPE:", list(bySourceType));
console.log("DROPPED:", list(dropped));
console.log(`MESR 2024-25: ${mesr.size} public institutions; LP rows ${lpRows}; licence mentions ${licenceStats.mentions}: already a named Parcoursup licence ${licenceStats.alreadyNamed}, skipped as probably the same (same commune) ${licenceStats.sameCommune}, added ${licenceStats.added}`);
console.log(`MESR institutions matched by UAI: ${match.uai.length}; by exact name: ${match.name.length} ${match.name.join(", ")}; new entries: ${match.created.length}: ${match.created.join("; ")}`);
const nul = programs.filter((p) => p.domainId === null).length;
console.log(`institutions ${institutions.length}, programmes ${programs.length} (Parcoursup ${fromParcoursup}, MESR ${programs.length - fromParcoursup}), cities ${new Set(programs.map((p) => p.city)).size}, no domain ${nul} (${((100 * nul) / programs.length).toFixed(1)}%)`);
console.log("no domain by type:", list(noDomainByType));
