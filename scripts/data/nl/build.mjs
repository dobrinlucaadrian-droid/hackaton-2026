// Builds the Netherlands catalogue (institutions + bachelor programmes) from the DUO RIO open data. Usage: node scripts/data/nl/build.mjs <folder with the downloaded CSV files>
// Needed files in the folder (see README.md): aangeboden_ho_opleidingen, ho_opleidingen, ho_opleidingserkenningen, ho_rel_oe (ho_relaties_opleidingseenheden),
// ho_rel_oe_erk (ho_relaties_opleidingseenheden_erkenningen), onderwijsaanbieders, rel_aanb_inst (relaties_onderwijsaanbieders_onderwijsinstellingserkenningen),
// oie (onderwijsinstellingserkenningen), onderwijslocaties, formeel (formele_instellingsadressen), contact (contactadressen),
// rel_bestuur_aanb (relaties_onderwijsbesturen_onderwijsaanbieders) — all as .csv.
import fs from "node:fs";
import path from "node:path";
import { DOMAIN_IDS } from "../isced.mjs";

const dir = process.argv[2];
if (!dir) { console.error("usage: node scripts/data/nl/build.mjs <raw folder>"); process.exit(1); }
const OUT = new URL("../../../apps/web/data/catalog/", import.meta.url);
const SOURCE = "DUO RIO 2026-10";
const TODAY = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10); // "current" = not ended on this date

// ---------- CSV ----------
function parse(t) {
  const rows = []; let r = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { r.push(f); f = ""; }
    else if (c === "\n") { r.push(f); rows.push(r); r = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  return rows;
}
const load = (n) => {
  const t = parse(fs.readFileSync(path.join(dir, n + ".csv"), "utf8").replace(/^﻿/, ""));
  const h = t[0];
  return t.slice(1).filter((r) => r.length > 1).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ""])));
};
const cur = (d) => !d || d > TODAY;
const tidy = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const ascii = (s) => tidy(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const slug = (s) => ascii(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const latest = (rows, keyOf) => { const m = new Map(); for (const r of rows) { const k = keyOf(r); const p = m.get(k); if (!p || r.BEGINDATUM_PERIODE >= p.BEGINDATUM_PERIODE) m.set(k, r); } return m; };

// ---------- load ----------
const opl = latest(load("ho_opleidingen"), (o) => o.OPLEIDINGSEENHEIDCODE);
const offers = latest(load("aangeboden_ho_opleidingen"), (a) => a.AANGEBODEN_OPLEIDINGCODE);
const erkLatest = latest(load("ho_opleidingserkenningen"), (e) => e.UNIEKE_ERKENDEOPLEIDINGSCODE);
const erkByCode = new Map(); for (const e of erkLatest.values()) { const p = erkByCode.get(e.ERKENDEOPLEIDINGSCODE); if (!p || e.BEGINDATUM_PERIODE > p.BEGINDATUM_PERIODE) erkByCode.set(e.ERKENDEOPLEIDINGSCODE, e); }
const relErkList = load("ho_rel_oe_erk");
const relErk = new Map(relErkList.map((r) => [r.OPLEIDINGSEENHEIDCODE, r]));
// in the data the "VAN" side is the programme and the "NAAR" side its variant (specialisation)
const variantOf = new Map(); for (const r of load("ho_rel_oe")) if (r.RELATIESOORT === "VARIANT_VAN" && cur(r.EINDDATUM)) variantOf.set(r.NAAR_OPLEIDINGSEENHEIDCODE, r.VAN_OPLEIDINGSEENHEIDCODE);
const aanbieders = new Map(load("onderwijsaanbieders").map((a) => [a.ONDERWIJSAANBIEDERID, a]));
const oieMap = new Map(load("oie").map((o) => [o.OIE_CODE, o]));
const relAanbOie = load("rel_aanb_inst").filter((r) => cur(r.EINDDATUM));
const locations = new Map(load("onderwijslocaties").map((l) => [l.ONDERWIJSLOCATIECODE, l]));
const formeel = load("formeel");
const contacts = load("contact").filter((c) => cur(c.EINDDATUM) && c.WEBADRES);
const licences = load("ho_licenties").filter((l) => cur(l.EINDDATUM));
const accred = new Map(); // latest accreditation decision per licence
for (const a of load("ho_onderwijsaccreditaties")) { const p = accred.get(a.LICENTIECODE); if (!p || (a.BESLUITDATUM || a.BEGINDATUM) >= (p.BESLUITDATUM || p.BEGINDATUM)) accred.set(a.LICENTIECODE, a); }
const relBestuur = load("rel_bestuur_aanb").filter((r) => cur(r.EINDDATUM));

// ---------- helpers: sector, domain ----------
const SECTOR_LABEL = {
  GEDRAG_EN_MAATSCHAPPIJ: "Gedrag en maatschappij", TAAL_EN_CULTUUR: "Taal en cultuur", ECONOMIE: "Economie", NATUUR: "Natuur", TECHNIEK: "Techniek",
  LANDBOUW_EN_NATUURLIJKE_OMGEVING: "Landbouw en natuurlijke omgeving", RECHT: "Recht", SECTOROVERSTIJGEND: "Sectoroverstijgend", GEZONDHEIDSZORG: "Gezondheidszorg", ONDERWIJS: "Onderwijs",
};
const NO_SECTOR = "Niet ingedeeld";

// Ordered keyword rules on the ASCII lower-case programme name (Dutch + English). First match wins. null = deliberately no domain.
const RULES = [
  [/business.*(language|talen)|(language|talen).*business|(zorg|health\w*|care)\W.*(management|bedrijf)|(management|bedrijf\w*)\W.*(zorg|health)/, null],
  [/cognitiewetenschap|cognitive science/, null],
  [/technische bedrijfskunde|industrial engineering (and|&) management/, "business-management"],
  [/economie en recht|economics and law|management,? economie|management, economics/, "business-management"],
  [/\bliberal arts|university college|\bhonours?\b college|\bmedia en cultuur\b.*\bwetenschap|^(bachelor|ba|bsc)$/, null],
  [/biomedical (engineering|technolog)|biomedische technolog|\bmedical engineering/, null],
  [/tandheelkunde|dentistry|\bdental\b|mondzorg|mondhygi/, "medicina-dentara"],
  [/diergeneeskunde|veterinary/, "medicina-veterinara"],
  [/\bgeneeskunde\b|\bmedicine\b|\bmedical sciences\b|\bgeneeskunde\b/, "medicina"],
  [/farmac|pharmac/, "farmacie"],

  [/fysiotherap|physiotherap|oefentherap|bewegingstechnolog|human movement|sportkunde|\bsport|bewegingswetenschap|\bmovement\b|lichamelijke opvoeding|\bsports?\b|physical therapy|psychomotor/, "sport-kinetoterapie"],
  [/verpleegkund|nursing|vroedkunde|midwifery|physician assistant|ergotherap|occupational therap|logopedie|speech|dietetiek|\bdieeti|nutrition and dietetics|radiodiagnos|radiotherap|medische beeldvorming|medical imaging|optometr|orthopt|podotherap|orthopedische|huidtherap|ambulance|medisch laboratorium|medical laboratory|laboratoriumonderzoek|biomedische wetenschappen|biomedical sciences|gezondheidswetenschap|health sciences|\bzorg\b|\bhealthcare\b|health care|\bhealth\b|physical therapy|anesthesie|operatieassistent|medische hulpverlening|psychomotor|arts?-assistent|paramedic|vaktherap|speltherap|creatieve therap|arts therap|longfunctie/, "asistenta-medicala"],
  // teacher training and pedagogy before sport/social/language rules
  [/\bpabo\b|leraar|lerarenopleiding|docent|leerkracht|teacher|onderwijskunde|onderwijswetenschap|\bpedagog|\bonderwijs\b|primary education|kindcentrum|\beducation\b|\beducatie\b|vakleerkracht|onderwijsassistent|opvoed/, "stiintele-educatiei"],
  [/sociaal.?pedagog|maatschappelijk werk|social work|sociaal werk|social care|jongerenwerk|welzijn|social pedagog|community development|culturele maatschappelijke vorming|\bcmv\b|sociaal.?juridisch|sociaal-juridische/, "sociologie-asistenta-sociala"],
  [/psycholog|psychobiolog|gedragswetenschap/, "psihologie"],
  [/cyber/, "calculatoare-it"],
  [/\bict\b|information technology|network|netwerk|infrastructure|computer engineering|systems engineering|information systems|\bit\b/, "calculatoare-it"],
  [/informatica|informatiekunde|information science|data science|computer science|computing|software|kunstmatige intelligentie|artificial intelligence|\bai\b|game(s)? (development|technology|design)|games|web development|datavisualisatie|\bdata\b|\binformatie\b|\binformation\b/, "informatica"],
  [/forensisch (onderzoek|ict)|forensic|criminolog|\bpolitie\b|politiekunde|\bpolice\b|veiligheid|safety|security|\bmilitair|defensie|\bdefence\b|brandweer|\bfire\b|crisis|\bboa\b/, "militar-politie"],
  [/architectuur|architecture|bouwkunde|stedenbouw|urbanism|landschapsarchitect|interieurarchitect|interior architecture/, "arhitectura"],
  [/civiele|civil engineering|bouwtechniek|bouwmanagement|built environment|construction|bouwproces|\binfra\b|waterbouw|bouwkundig|\bbouw\b/, "inginerie-civila"],
  [/muziek|\bmusic\b|conservatorium|\bjazz\b|\bzang\b|vocal|compositie|composition|\binstrument|sonology|\bpiano\b|\bklassiek\b|\bpop\b|\b(barok )?(viool|altviool|cello|contrabas|fluit|blokfluit|hobo|fagot|klarinet|trombone|bastrombone|trompet|natuurtrompet|natuurhoorn|hoorn|harp|gitaar|slagwerk|saxofoon|accordeon|orgel|klavecimbel|fortepiano|luit|theorbe|cornetto|tuba|traverso|viola da gamba|violone|koordirectie|orkestdirectie)\b|\bluit\/|hafabra/, "muzica"],
  [/theater|theatre|\bdans\b|\bdance\b|\bfilm\b|\bdrama\b|\bacting\b|toneel|circus|scenograf|regie|\bcinema|mimespel|\bcabaret|musical|\bperformance\b|\bcodarts\b|\bchoreo/, "teatru-film"],
  [/journalist|communicatie|communication|\bmedia\b|mediastudies|\bpr\b|\bpublic relations|voorlichting|\btelevisie|\bradio\b/, "comunicare-jurnalism"],
  [/kunst|\bdesign\b|ontwerp|beeldende|\bart\b|fine art|animatie|animation|fotografie|photograph|\bmode\b|fashion|illustra|\bgraphic|vormgeving|keramiek|ceramic|autonome|\bcreatieve?\b|textiel|textile|juwel|jewel|\bgame art\b/, "arte-vizuale-design"],
  [/\brecht(en)?\b|\w*recht\b|rechts\w*|\blaw\b|\blegal\b|juridisch|notarie|\bjuridi/, "drept"],
  [/politicolog|political|politiek|international relations|internationale betrekkingen|international studies|european studies|\bbestuur\b|public affairs|global governance|conflict|internationale studies|midden-oosten|international.*development|\bpolicy\b/, "stiinte-politice-relatii-internationale"],
  [/bestuurskunde|public administration|publiek|overheid|public governance|public management|\bgovernance\b/, "administratie-publica"],
  [/geschiedenis|\bhistory\b|archeolog|archaeolog|erfgoed|heritage|\bhistor/, "istorie"],
  [/filosof|philosoph|\bethiek\b|\bethics\b|humanistiek/, "filosofie"],
  [/theolog|godsdienst|\breligi|bijbel|pastoraal|\bpastor|christelijk|\bimam\b|islam|\bkerk/, "teologie"],
  [/\btaal\b|\btalen\b|\blanguage|letteren|literature|literatuur|linguistic|taalwetenschap|\bnederlands\b|\bengels\b|\bduits\b|\bfrans\b|\bspaans\b|\bitaliaans\b|\brussisch\b|\bchinees\b|\bjapans\b|\barabisch\b|latijn|grieks|\barabic\b|vertal|tolk|translat|interpret|\bdutch\b|\benglish\b|\bgerman\b|\bfrench\b|\bspanish\b|\bamerican studies/, "litere-limbi-straine"],
  [/sociolog|antropolog|anthropolog|maatschappij|\bsociaal\b|\bsocial\b|cultuurwetenschap|cultural studies|culturele studies/, "sociologie-asistenta-sociala"],
  [/scheikunde(?!ige)|\bchemie\b|chemistry|\bchemical\b(?! engineering)/, "chimie"],
  [/chemische|scheikundige|chemical engineering|process technolog|procestechnolog|materials|materiaal|nanotechnolog|polymer|\blab\b.*technolog|biobased|bio-based/, "inginerie-chimica-materiale"],
  [/technische natuurkunde|applied physics|natuurkunde|\bphysics\b|\bfysica\b|sterrenkunde|astronom/, "fizica"],
  [/wiskunde|mathematic|statistic|statistiek|\bmaths?\b|econometri|actuari/, "matematica"],
  [/biolog|life sciences|biotechn|moleculair|molecular|ecolog|zoolog|bioinformatic|biochem|\bbio\b|\bbio-|levenswetenschap|\bbiotech/, "biologie"],
  [/energie|energy/, "energie-petrol-mediu"],
  [/aardwetenschap|earth sciences|geolog|geograf|geography|planolog|spatial planning|environmental|milieu|climate|klimaat|sustainab|duurzaam|water management|watermanagement|landschap|landscape|\baarde\b|ruimtelijk|urban planning|\bmilieukunde\b|\bwater\b|\bkust\b|coastal/, "geografie-mediu"],
  [/werktuigbouw|mechanical engineering|mechatronic|vliegtuigbouw|aerospace|aeronautic|automotive|autotechniek|voertuig|\bmechanical\b|\bscheepsbouw|industrial engineering/, "inginerie-mecanica"],
  [/elektrotechniek|electrical|electronic|elektronica|telecommunicatie|\belektro|\bembedded\b|\bsystem(s)? and control/, "inginerie-electrica-electronica"],
  [/maritiem|maritime|shipping|nautical|scheepvaart|zeevaart|\bscheeps|\bmarine\b|aviation|luchtvaart|\bpilot|transport|vervoer|luchtverkeer|air traffic|havens?\b/, "marina-transporturi"],
  [/landbouw|agricult|\bagro|tuinbouw|horticult|dierhouderij|\bdier\w*|\banimal|paard|natuurbeheer|\bforest|\bbos\b|\bbos-|aquacultu|\bfood\b|voedingsmiddel|\bplant\w*|\bgroen\b|\bgreen\b|veehouder|\bhorse|\bvoeding|natural resources|\bnatuur\b|\bnature\b|bloem|\btuin|\bagri|\bhovenier|\bwijn/, "agronomie-silvicultura"],
  [/toerisme|tourism|\bhotel|hospitality|recreatie|leisure|vrijetijd|\bevents?\b|evenement|gastronom|culinair|culinary|\btravel|\bvrije tijd/, "turism-servicii"],
  [/marketing|commerciele economie|\bsales\b|verkoop|\bretail|\bcommerce\b|\bcommercieel|\bbranding|\breclame|\badvertis/, "marketing"],
  [/econom|accountan|accounting|\bfinanc|fiscaal|fiscal|\bbank|verzeker|insurance|belasting|controlling|treasury|\bfinance\b|\bboekhoud|\bbedrijfseconomie|\btax\b|\bbetaalbaar/, "economie-finante"],
  [/bedrijfskunde|\bbusiness\b|management|ondernem|entrepreneur|logistiek|logistics|supply chain|\bhrm\b|human resource|personeel|\barbeid|organisat|office|secretar|leadership|\bleiderschap|facilit|\bcoach|\bconsult|\btrade\b|\bhandel|\bcommerce|\bbedrijfs\w*|\binternational business|\bimport|\bexport/, "business-management"],
];
for (const [, id] of RULES) if (id !== null && !DOMAIN_IDS.includes(id)) throw new Error("unknown domain id in RULES: " + id);
function domainOf(text) {
  for (const [re, id] of RULES) if (re.test(text)) return id;
  return null;
}

// ---------- institutions ----------
const SHEETS = { "21PC": "rug", "21PK": "uva", "21PL": "vu-amsterdam", "21PF": "tu-delft", "21PG": "tu-eindhoven", "21PE": "eur", "21PJ": "maastricht", "21PB": "leiden", "21PD": "utrecht", "21PH": "twente" };
const RANK = { UNIV: 0, HBOS: 1, ERK_HBOS: 2 };
function oieOf(aanbiederId) {
  const mine = relAanbOie.filter((r) => r.ONDERWIJSAANBIEDERID === aanbiederId).map((r) => oieMap.get(r.OIE_CODE)).filter((o) => o && cur(o.EINDDATUM));
  mine.sort((a, b) => (RANK[a.SOORT] ?? 9) - (RANK[b.SOORT] ?? 9));
  return mine[0] || null;
}
const seatOf = (oieCode) => {
  const rows = formeel.filter((f) => f.OIE_CODE === oieCode && !f.EINDDATUM && f.PLAATSNAAM);
  rows.sort((a, b) => (b.VESTIGINGSCODE.endsWith("00") ? 1 : 0) - (a.VESTIGINGSCODE.endsWith("00") ? 1 : 0));
  return rows[0]?.PLAATSNAAM || "";
};
const cityName = (s) => {
  let t = tidy(s).replace(/\s+(Gld|Ov|Lb|Nb|Ut|Fr|Dr|Gr|Zh|Nh|Zl|Fl)$/i, ""); // province disambiguation like "Elst Gld"
  if (t === t.toUpperCase() && /[A-Z]{2}/.test(t)) t = t.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
  return t.replace(/^'S-/i, "'s-");
};
const CITY_ALIAS = { "'s-gravenhage": "den haag", "'s-hertogenbosch": "den bosch" };
const urlOk = (u) => /^https?:\/\/[^\s]+\.[^\s]+$/.test(u);
const websiteOf = (aanbiederId) => {
  const pick = (id) => contacts.find((c) => c.ONDERWIJSAANBIEDERID === id && urlOk(tidy(c.WEBADRES)));
  let c = pick(aanbiederId);
  if (!c) for (const r of relBestuur.filter((r) => r.ONDERWIJSAANBIEDERID === aanbiederId)) { c = contacts.find((x) => x.ONDERWIJSBESTUURID === r.ONDERWIJSBESTUURID && !x.ONDERWIJSAANBIEDERID && urlOk(tidy(x.WEBADRES))); if (c) break; }
  try { return c ? new URL(tidy(c.WEBADRES)).origin : undefined; } catch { return undefined; }
};

// ---------- programmes ----------
const LANG = { NLD: "olandeză", ENG: "engleză", DEU: "germană", FRA: "franceză", SPA: "spaniolă", ITA: "italiană", FRY: "frizonă" };
const FORM = { VOLTIJD: "full-time", DEELTIJD: "part-time", DUAAL: "dual" };
const stats = { offers: 0, notBachelor: 0, notReal: 0, ended: 0, dup: 0 };
const insts = new Map(); const progs = []; const seen = new Set(); const usedKeys = new Set();
const aanbiederCount = new Map(); // oie -> set of aanbieder ids (for the faculty field)

const prelim = [];
for (const a of offers.values()) {
  stats.offers++;
  const o = opl.get(a.OPLEIDINGSEENHEIDCODE);
  if (!o || !["HBO-BA", "WO-BA"].includes(o.NIVEAU)) { stats.notBachelor++; continue; }
  if (/pre-?master|schakelprogramma|\bbootcamp\b|\bminors?\b|^(deeltijd|voltijd) opleiding$/i.test([a.EIGENNAAM, o.VOLLEDIGE_NAAM].join(" "))) { stats.notReal++; continue; }
  if (!cur(a.EINDDATUM) || !cur(a.EINDDATUM_PERIODE) || !cur(o.EINDDATUM)) { stats.ended++; continue; }
  const an = aanbieders.get(a.ONDERWIJSAANBIEDERID);
  if (!an) continue;
  const oie = oieOf(a.ONDERWIJSAANBIEDERID);
  const iKey = oie ? oie.OIE_CODE : a.ONDERWIJSAANBIEDERID;
  if (!aanbiederCount.has(iKey)) aanbiederCount.set(iKey, new Set());
  aanbiederCount.get(iKey).add(a.ONDERWIJSAANBIEDERID);
  prelim.push({ a, o, an, oie, iKey });
}

const nameUsed = new Set(); const instId = new Map();
for (const { an, oie, iKey } of prelim) {
  if (instId.has(iKey)) continue;
  const name = tidy(oie ? oie.VOLLEDIGE_NAAM : an.NAAM);
  let id = SHEETS[iKey] || "nl-" + slug(name);
  if (!SHEETS[iKey] && nameUsed.has(id)) id += "-" + slug(iKey);
  nameUsed.add(id); instId.set(iKey, { id, name, oie, an, hasSheet: !!SHEETS[iKey] });
}

for (const { a, o, an, oie, iKey } of prelim) {
  const inst = instId.get(iKey);
  // parent programme for a variant (credits, sector)
  const parentCode = o.SOORT === "VARIANT" ? variantOf.get(o.OPLEIDINGSEENHEIDCODE) : null;
  const parent = parentCode ? opl.get(parentCode) : null;
  const erkRel = relErk.get(o.OPLEIDINGSEENHEIDCODE) || (parentCode && relErk.get(parentCode));
  const erk = erkRel ? erkLatest.get(erkRel.UNIEKE_ERKENDEOPLEIDINGSCODE) || erkByCode.get(erkRel.ERKENDEOPLEIDINGSCODE) : null;
  const sector = erk?.ONDERDEEL && SECTOR_LABEL[erk.ONDERDEEL] ? SECTOR_LABEL[erk.ONDERDEEL] : NO_SECTOR;

  const name = tidy(a.EIGENNAAM || o.VOLLEDIGE_NAAM || o.KORTE_NAAM || a.EIGENNAAM_ENGELS || o.INTERNATIONALE_NAAM_ENGELS).replace(/\s*\(o\d+\)$/, "");
  if (name.length < 2) continue;
  const nameEn = tidy(a.EIGENNAAM_ENGELS || o.INTERNATIONALE_NAAM_ENGELS || parent?.INTERNATIONALE_NAAM_ENGELS);
  const language = a.VOERTAAL ? a.VOERTAAL.split(",").map((c) => LANG[c.trim()] || c.trim().toLowerCase()).join(", ") : "nespecificată";
  const form = FORM[a.VORM];
  const loc = locations.get(a.ONDERWIJSLOCATIECODE);
  const placeRaw = loc?.PLAATSNAAM;
  const seat = oie ? cityName(seatOf(oie.OIE_CODE)) : "";
  const city = cityName(placeRaw) || seat || "Nederland";
  const dedupe = [o.OPLEIDINGSEENHEIDCODE, a.ONDERWIJSAANBIEDERID, a.ONDERWIJSLOCATIECODE, a.VORM, a.VOERTAAL, name].join("|");
  if (seen.has(dedupe)) { stats.dup++; continue; }
  seen.add(dedupe);

  const text = ascii([name, nameEn, o.VOLLEDIGE_NAAM, o.KORTE_NAAM].join(" "));
  const domainId = domainOf(ascii(name)) ?? domainOf(text);

  const rawStudielast = o.STUDIELAST || parent?.STUDIELAST;
  const credits = rawStudielast && /^\d+$/.test(rawStudielast) && (o.STUDIELASTEENHEID || parent?.STUDIELASTEENHEID) === "ECTS_PUNT" ? Number(rawStudielast) : undefined;
  let years;
  const n = Number(a.AFWIJKENDE_OPLEIDINGSDUUROMVANG);
  if (n > 0 && a.AFWIJKENDE_OPLEIDINGSDUUREENHEID === "J") years = n;
  else if (n > 0 && a.AFWIJKENDE_OPLEIDINGSDUUREENHEID === "M") years = Math.round((n / 12) * 10) / 10;
  if (years !== undefined && (years < 1 || years > 8)) years = undefined;

  const multi = (aanbiederCount.get(iKey)?.size || 0) > 1;
  const facRaw = tidy(an.NAAM.replace(/^Radboud Universiteit Nijmegen \(RU\)\s*/, ""));
  const faculty = multi && facRaw.toLowerCase() !== inst.name.toLowerCase() && facRaw.length >= 2 ? facRaw : undefined;
  const url = urlOk(tidy(a.WEBSITE)) ? tidy(a.WEBSITE) : undefined;

  const baseKey = ("nl-" + [slug(inst.id.startsWith("nl-") ? inst.id.slice(3) : inst.id), slug(name), slug(city), slug(language), form || "x"].join("--")).slice(0, 190);
  let key = baseKey, i = 2;
  while (usedKeys.has(key)) key = `${baseKey}-${i++}`;
  usedKeys.add(key);

  const search = [name, nameEn, sector !== NO_SECTOR ? sector : "", faculty || "", inst.name, city, placeRaw && cityName(placeRaw) !== city ? cityName(placeRaw) : "", language, o.NIVEAU === "WO-BA" ? "wo universiteit" : "hbo hogeschool applied sciences"]
    .map(ascii).concat(CITY_ALIAS[ascii(city)] || []).join(" ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
  const row = {
    key, country: "NL", institutionId: inst.id, institutionName: inst.name, city, faculty, domain: sector, domainId, name, language, form, credits, years,
    status: o.NIVEAU, url, source: SOURCE, search,
  };
  for (const k of Object.keys(row)) if (row[k] === undefined) delete row[k];
  progs.push(row);
}

// ---------- licence-only rows ----------
// Many universities register only a few "offered programmes" (aangeboden opleidingen). The register of licences (ho_onderwijslicenties) lists every
// bachelor programme an institution is accredited to teach. Where no offer is registered for such a licence, add one row per form of study
// (language unknown, city = seat of the institution).
const oesOfErk = new Map();
for (const r of relErkList) { if (!oesOfErk.has(r.UNIEKE_ERKENDEOPLEIDINGSCODE)) oesOfErk.set(r.UNIEKE_ERKENDEOPLEIDINGSCODE, []); oesOfErk.get(r.UNIEKE_ERKENDEOPLEIDINGSCODE).push(r.OPLEIDINGSEENHEIDCODE); }
const oieAlias = new Map(); const cover = new Set();
for (const { a, o, iKey } of prelim) {
  for (const r of relAanbOie.filter((r) => r.ONDERWIJSAANBIEDERID === a.ONDERWIJSAANBIEDERID)) if (!oieAlias.has(r.OIE_CODE)) oieAlias.set(r.OIE_CODE, iKey);
  cover.add(iKey + "|" + o.OPLEIDINGSEENHEIDCODE);
  const par = variantOf.get(o.OPLEIDINGSEENHEIDCODE); if (par) cover.add(iKey + "|" + par);
}
stats.licBachelor = 0; stats.licCovered = 0; stats.licInactive = 0; stats.licAdded = 0;
for (const l of licences) {
  const oes = (oesOfErk.get(l.UNIEKE_ERKENDEOPLEIDINGSCODE) || []).map((c) => opl.get(c)).filter((o) => o && o.SOORT === "OPLEIDING" && ["HBO-BA", "WO-BA"].includes(o.NIVEAU) && cur(o.EINDDATUM));
  const ac = accred.get(l.LICENTIECODE);
  for (const o of oes) {
    stats.licBachelor++;
    const iKey = oieAlias.get(l.OIE_CODE) || l.OIE_CODE;
    if (cover.has(iKey + "|" + o.OPLEIDINGSEENHEIDCODE)) { stats.licCovered++; continue; }
    if (ac && ((ac.AFBOUW_DATUM && !cur(ac.AFBOUW_DATUM)) || (ac.INTREKKINGSDATUM && !cur(ac.INTREKKINGSDATUM)) || (ac.VERVALDATUM && !cur(ac.VERVALDATUM)))) { stats.licInactive++; continue; }
    const name = tidy(o.VOLLEDIGE_NAAM || o.KORTE_NAAM || o.INTERNATIONALE_NAAM_ENGELS).replace(/\s*\(o\d+\)$/, "");
    if (name.length < 2 || /pre-?master|schakelprogramma|\bbootcamp\b|\bminors?\b/i.test(name)) continue;
    const oie = oieMap.get(l.OIE_CODE);
    if (!oie || !seatOf(l.OIE_CODE)) { stats.licNoSeat = (stats.licNoSeat || 0) + 1; continue; } // no Dutch seat = foreign partner of a joint degree
    let inst = instId.get(iKey);
    if (!inst) {
      const iname = tidy(oie.VOLLEDIGE_NAAM); let id = SHEETS[iKey] || "nl-" + slug(iname);
      if (!SHEETS[iKey] && nameUsed.has(id)) id += "-" + slug(iKey);
      nameUsed.add(id); inst = { id, name: iname, oie, an: null, hasSheet: !!SHEETS[iKey] }; instId.set(iKey, inst);
      aanbiederCount.set(iKey, new Set(relAanbOie.filter((r) => r.OIE_CODE === iKey).map((r) => r.ONDERWIJSAANBIEDERID)));
    }
    const nameEn = tidy(o.INTERNATIONALE_NAAM_ENGELS);
    const erk = erkLatest.get(l.UNIEKE_ERKENDEOPLEIDINGSCODE);
    const sector = erk?.ONDERDEEL && SECTOR_LABEL[erk.ONDERDEEL] ? SECTOR_LABEL[erk.ONDERDEEL] : NO_SECTOR;
    const domainId = domainOf(ascii(name)) ?? domainOf(ascii([name, nameEn].join(" ")));
    const credits = /^\d+$/.test(o.STUDIELAST) && o.STUDIELASTEENHEID === "ECTS_PUNT" ? Number(o.STUDIELAST) : undefined;
    const city = cityName(seatOf(l.OIE_CODE));
    const language = "nespecificată";
    for (const vf of (l.VORM || "").split(",")) {
      const form = FORM[vf.trim()];
      const dd = ["lic", iKey, o.OPLEIDINGSEENHEIDCODE, form].join("|");
      if (seen.has(dd)) { stats.dup++; continue; }
      seen.add(dd);
      const baseKey = ("nl-" + [slug(inst.id.startsWith("nl-") ? inst.id.slice(3) : inst.id), slug(name), slug(city), slug(language), form || "x"].join("--")).slice(0, 190);
      let key = baseKey, i = 2;
      while (usedKeys.has(key)) key = `${baseKey}-${i++}`;
      usedKeys.add(key);
      const search = [name, nameEn, sector !== NO_SECTOR ? sector : "", inst.name, city, language, o.NIVEAU === "WO-BA" ? "wo universiteit" : "hbo hogeschool applied sciences"]
        .map(ascii).concat(CITY_ALIAS[ascii(city)] || []).join(" ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
      const row = { key, country: "NL", institutionId: inst.id, institutionName: inst.name, city, domain: sector, domainId, name, language, form, credits, status: o.NIVEAU, source: SOURCE, search };
      for (const k of Object.keys(row)) if (row[k] === undefined) delete row[k];
      progs.push(row); stats.licAdded++;
    }
  }
}

// institutions file
const counts = new Map(); for (const p of progs) counts.set(p.institutionId, (counts.get(p.institutionId) || 0) + 1);
const institutions = [];
for (const [iKey, v] of instId) {
  const n = counts.get(v.id); if (!n) continue;
  const seat = v.oie ? cityName(seatOf(v.oie.OIE_CODE)) : "";
  const cities = {}; for (const p of progs) if (p.institutionId === v.id) cities[p.city] = (cities[p.city] || 0) + 1;
  const city = seat || Object.entries(cities).sort((x, y) => y[1] - x[1])[0][0];
  const web = [...(aanbiederCount.get(iKey) || [])].map(websiteOf).find(Boolean);
  const inst = { id: v.id, country: "NL", source: SOURCE, name: v.name, officialName: v.name, city, kind: !v.oie || /politieacademie|defensie/i.test(v.name) ? "unknown" : v.oie.BEKOSTIGINGSCODE === "BEKOSTIGD" ? "public" : "private", hasSheet: v.hasSheet, website: web, programs: n };
  if (!inst.website) delete inst.website;
  institutions.push(inst);
}
institutions.sort((a, b) => a.id.localeCompare(b.id));
progs.sort((a, b) => a.key.localeCompare(b.key));

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(new URL("nl-institutions.json", OUT), JSON.stringify(institutions, null, 1) + "\n");
fs.writeFileSync(new URL("nl-programs.json", OUT), JSON.stringify(progs) + "\n");

const nul = progs.filter((p) => p.domainId === null);
console.log(`dataset offers (latest period each): ${stats.offers}; not bachelor: ${stats.notBachelor}; bridging/bootcamp/minor dropped: ${stats.notReal}; ended: ${stats.ended}; exact duplicates dropped: ${stats.dup}`);
console.log(`licences (current bachelor programmes per institution): ${stats.licBachelor}; already covered by an offer: ${stats.licCovered}; phased out/withdrawn skipped: ${stats.licInactive}; foreign partner (no Dutch seat) skipped: ${stats.licNoSeat}; rows added from licences: ${stats.licAdded}`);
console.log(`wrote ${institutions.length} institutions, ${progs.length} programmes (WO ${progs.filter((p) => p.status === "WO-BA").length}, HBO ${progs.filter((p) => p.status === "HBO-BA").length}); without domain: ${nul.length} (${Math.round((100 * nul.length) / progs.length)}%)`);
if (process.env.REPORT_NULL) { const m = {}; for (const p of nul) m[p.name] = (m[p.name] || 0) + 1; console.log(Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, +process.env.REPORT_NULL).map(([k, v]) => `${v} ${k}`).join("\n")); }