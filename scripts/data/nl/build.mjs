// Builds the Netherlands catalogue (institutions + one row per accredited bachelor programme per institution and city) from the DUO RIO open data. Usage: node scripts/data/nl/build.mjs <folder with the downloaded CSV files>
// Needed files in the folder (see README.md): aangeboden_ho_opleidingen, ho_opleidingen, ho_opleidingserkenningen, ho_rel_oe (ho_relaties_opleidingseenheden),
// ho_rel_oe_erk (ho_relaties_opleidingseenheden_erkenningen), onderwijsaanbieders, rel_aanb_inst (relaties_onderwijsaanbieders_onderwijsinstellingserkenningen),
// ho_licenties (ho_onderwijslicenties), ho_onderwijsaccreditaties, oie (onderwijsinstellingserkenningen), onderwijslocaties, formeel (formele_instellingsadressen), contact (contactadressen),
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
const relErkList = load("ho_rel_oe_erk");
const relErk = new Map(relErkList.map((r) => [r.OPLEIDINGSEENHEIDCODE, r]));
// in the data the "VAN" side is the programme and the "NAAR" side its variant (specialisation)
const variantOf = new Map(); for (const r of load("ho_rel_oe")) if (r.RELATIESOORT === "VARIANT_VAN" && cur(r.EINDDATUM)) variantOf.set(r.NAAR_OPLEIDINGSEENHEIDCODE, r.VAN_OPLEIDINGSEENHEIDCODE);
const aanbieders = new Map(load("onderwijsaanbieders").map((a) => [a.ONDERWIJSAANBIEDERID, a]));
const oieMap = latest(load("oie"), (o) => o.OIE_CODE);
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
const SHEETS = { "21PC": "rug", "21PK": "uva", "21PL": "vu-amsterdam", "21PF": "tu-delft", "21PG": "tu-eindhoven", "21PE": "eur", "21PJ": "maastricht", "21PB": "leiden", "21PD": "utrecht", "21PH": "twente",
  "21PN": "tilburg-university", "21PM": "radboud", "21PI": "wageningen", "27UM": "the-hague-uas", "30GB": "fontys", "23AH": "saxion", "25KB": "han", "25BE": "hanze", "21UI": "buas", "25JX": "zuyd", "27PZ": "inholland", "01VU": "windesheim" };
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
// One row = one accredited bachelor programme (ISAT/CROHO code) of one recognised institution, per city where it is taught.
// The backbone is the register of licences (ho_onderwijslicenties): one licence = one institution (OIE code) x one recognised programme.
// The register of offers (aangeboden_ho_opleidingen) has one record per year, phase, specialisation, evening/day group and location; it is used
// only to learn, for a licensed programme, the cities, the teaching languages, the forms and the web page. It never creates a row by itself.
const LANG = { NLD: "olandeză", ENG: "engleză", DEU: "germană", FRA: "franceză", SPA: "spaniolă", ITA: "italiană", FRY: "frizonă" };
const LANG_ORDER = Object.values(LANG);
const langRank = (l) => (LANG_ORDER.includes(l) ? LANG_ORDER.indexOf(l) : 99);
const FORM = { VOLTIJD: "full-time", DEELTIJD: "part-time", DUAAL: "dual" };
const FORM_ORDER = ["VOLTIJD", "DEELTIJD", "DUAAL"];
const BACHELOR = ["HBO-BA", "WO-BA"];
const DUTCH_HO = ["UNIV", "HBOS", "ERK_HBOS"]; // kinds of recognised Dutch higher-education institutions; anything else is a foreign partner of a joint degree
// Two OIE codes that are one school in the source (same name, same town): the private legal entity is folded into the funded one.
const MERGE = { "27VY": "22HH" }; // "Viaa" (Zwolle) -> "Stichting Hogeschool Viaa" (Zwolle)
const instKey = (oieCode) => MERGE[oieCode] || oieCode;
// Offer names that are not the degree programme itself (bridging, single modules, guest students); such offers are ignored for cities and languages.
const NOT_A_DEGREE = /pre-?master|schakel|\bbootcamp\b|\bminors?\b|educatieve module|bijvak|keuzedeel|keuzevak|kopopleiding|contractonderwijs|losse module|^(deeltijd|voltijd) opleiding$/i;

const stats = { lic: 0, notBachelor: 0, foreign: 0, future: 0, phasedOut: 0, noIntake: 0, noSeat: 0, dupLicence: 0 };
const oesOfErk = new Map();
for (const r of relErkList) { if (!oesOfErk.has(r.UNIEKE_ERKENDEOPLEIDINGSCODE)) oesOfErk.set(r.UNIEKE_ERKENDEOPLEIDINGSCODE, []); oesOfErk.get(r.UNIEKE_ERKENDEOPLEIDINGSCODE).push(r.OPLEIDINGSEENHEIDCODE); }

// 1. licensed bachelor programmes
const licensed = new Map(); // "<institution>|<ISAT code>" -> programme
const byName = new Map(); // "<institution>|<ascii name>" -> programme, or null when two programmes of the institution share the name
const normName = (s) => ascii(s).replace(/^b /, "").replace(/[^a-z0-9]+/g, " ").trim();
for (const l of licences) {
  stats.lic++;
  const erk = erkLatest.get(l.UNIEKE_ERKENDEOPLEIDINGSCODE);
  const o = (oesOfErk.get(l.UNIEKE_ERKENDEOPLEIDINGSCODE) || []).map((c) => opl.get(c))
    .find((o) => o && o.SOORT === "OPLEIDING" && BACHELOR.includes(o.NIVEAU) && o.GRAAD === "BACHELOR" && cur(o.EINDDATUM));
  if (!o || !erk) { stats.notBachelor++; continue; } // master, associate degree, post-initial ...
  const oie = oieMap.get(instKey(l.OIE_CODE));
  if (!oie || !DUTCH_HO.includes(oie.SOORT) || !DUTCH_HO.includes(oieMap.get(l.OIE_CODE)?.SOORT)) { stats.foreign++; continue; }
  if (l.BEGINDATUM > TODAY) { stats.future++; continue; } // licence starts later (programme not open yet)
  const ac = accred.get(l.LICENTIECODE);
  if (ac && ((ac.AFBOUW_DATUM && !cur(ac.AFBOUW_DATUM)) || (ac.INTREKKINGSDATUM && !cur(ac.INTREKKINGSDATUM)) || (ac.VERVALDATUM && !cur(ac.VERVALDATUM)))) { stats.phasedOut++; continue; }
  if (!cur(erk.EINDDATUM) || (erk.INSTROOM_EINDDATUM && !cur(erk.INSTROOM_EINDDATUM))) { stats.noIntake++; continue; } // no new students admitted any more
  const seat = cityName(seatOf(oie.OIE_CODE));
  if (!seat) { stats.noSeat++; continue; }
  const name = tidy(o.VOLLEDIGE_NAAM || o.KORTE_NAAM || o.INTERNATIONALE_NAAM_ENGELS);
  if (name.length < 2) continue;
  const lforms = l.VORM.split(",").map((f) => f.trim()).filter((f) => FORM[f]);
  const k = oie.OIE_CODE + "|" + erk.ERKENDEOPLEIDINGSCODE;
  if (licensed.has(k)) { stats.dupLicence++; for (const f of lforms) licensed.get(k).forms.add(f); continue; }
  const p = { oie, isat: erk.ERKENDEOPLEIDINGSCODE, o, erk, name, seat, forms: new Set(lforms), offers: [] };
  licensed.set(k, p);
  const nk = oie.OIE_CODE + "|" + normName(name);
  byName.set(nk, byName.has(nk) ? null : p);
}

// 2. attach the current offers to the licensed programmes
const offerStats = { bachelor: 0, ended: 0, notDegree: 0, byCode: 0, byName: 0, unmatched: 0 };
const oiesOfAanbieder = new Map();
for (const r of relAanbOie) { if (!oiesOfAanbieder.has(r.ONDERWIJSAANBIEDERID)) oiesOfAanbieder.set(r.ONDERWIJSAANBIEDERID, new Set()); oiesOfAanbieder.get(r.ONDERWIJSAANBIEDERID).add(instKey(r.OIE_CODE)); }
// ISAT code of a programme unit: its own recognition, else the one of the programme it is a variant of
const isatOf = (code) => { for (let c = code, i = 0; c && i < 4; c = variantOf.get(c), i++) { const r = relErk.get(c); if (r) return r.ERKENDEOPLEIDINGSCODE; } return null; };
const aanbiedersOfInst = new Map();
const unmatchedNames = {};
for (const a of offers.values()) {
  const o = opl.get(a.OPLEIDINGSEENHEIDCODE);
  if (!o || !BACHELOR.includes(o.NIVEAU)) continue;
  offerStats.bachelor++;
  if (!cur(a.EINDDATUM) || !cur(a.EINDDATUM_PERIODE) || !cur(o.EINDDATUM) || (a.LAATSTE_INSTROOMDATUM && !cur(a.LAATSTE_INSTROOMDATUM))) { offerStats.ended++; continue; }
  if (NOT_A_DEGREE.test([a.EIGENNAAM, o.VOLLEDIGE_NAAM].join(" "))) { offerStats.notDegree++; continue; }
  const oies = [...(oiesOfAanbieder.get(a.ONDERWIJSAANBIEDERID) || [])];
  const isat = isatOf(o.OPLEIDINGSEENHEIDCODE);
  let hits = isat ? oies.map((c) => licensed.get(c + "|" + isat)).filter(Boolean) : [];
  let direct = o.SOORT === "OPLEIDING";
  if (hits.length) offerStats.byCode++;
  else if (!isat) {
    // some schools (Hogeschool Rotterdam, Hogeschool Leiden ...) register their offers on units of their own, without a link to the ISAT code:
    // these are matched by the exact programme name inside the same institution, only to learn city and language
    const parent = opl.get(variantOf.get(o.OPLEIDINGSEENHEIDCODE));
    const names = [o.VOLLEDIGE_NAAM, parent?.VOLLEDIGE_NAAM, a.EIGENNAAM].filter(Boolean).map(normName);
    for (const n of names) { hits = oies.map((c) => byName.get(c + "|" + n)).filter(Boolean); if (hits.length) break; }
    if (hits.length) { offerStats.byName++; direct = normName(o.VOLLEDIGE_NAAM) === normName(hits[0].name); }
  }
  if (!hits.length) { offerStats.unmatched++; const n = (aanbieders.get(a.ONDERWIJSAANBIEDERID)?.NAAM || "?") + " | " + (a.EIGENNAAM || o.VOLLEDIGE_NAAM); unmatchedNames[n] = (unmatchedNames[n] || 0) + 1; continue; }
  for (const p of hits) {
    p.offers.push({ a, direct });
    if (!aanbiedersOfInst.has(p.oie.OIE_CODE)) aanbiedersOfInst.set(p.oie.OIE_CODE, new Set());
    aanbiedersOfInst.get(p.oie.OIE_CODE).add(a.ONDERWIJSAANBIEDERID);
  }
}

// 3. institutions
const nameUsed = new Set(); const instId = new Map();
const displayName = (s) => tidy(s).replace(/^Stichting\s+(?=Hogeschool\b)/i, "").replace(/\s+B\.?V\.?$/i, "");
for (const p of licensed.values()) {
  const code = p.oie.OIE_CODE;
  if (instId.has(code)) continue;
  const officialName = tidy(p.oie.VOLLEDIGE_NAAM);
  let id = SHEETS[code] || "nl-" + slug(officialName);
  if (!SHEETS[code] && nameUsed.has(id)) id += "-" + slug(code);
  nameUsed.add(id); instId.set(code, { id, name: displayName(officialName), officialName, oie: p.oie, hasSheet: !!SHEETS[code] });
}

// 4. rows
const progs = []; const usedKeys = new Set();
let withOffer = 0, extraCityRows = 0;
for (const p of licensed.values()) {
  const inst = instId.get(p.oie.OIE_CODE);
  const { o, erk } = p;
  const sector = erk.ONDERDEEL && SECTOR_LABEL[erk.ONDERDEEL] ? SECTOR_LABEL[erk.ONDERDEEL] : NO_SECTOR;
  const nameEn = tidy(o.INTERNATIONALE_NAAM_ENGELS);
  const domainId = domainOf(ascii(p.name)) ?? domainOf(ascii([p.name, nameEn, o.KORTE_NAAM].join(" ")));
  const credits = /^\d+$/.test(o.STUDIELAST) && o.STUDIELASTEENHEID === "ECTS_PUNT" ? Number(o.STUDIELAST) : undefined;
  if (p.offers.length) withOffer++;
  const byCity = new Map(); // city -> offers there (an offer without a location counts for the seat)
  for (const x of p.offers) { const c = cityName(locations.get(x.a.ONDERWIJSLOCATIECODE)?.PLAATSNAAM) || p.seat; if (!byCity.has(c)) byCity.set(c, []); byCity.get(c).push(x); }
  if (!byCity.size) byCity.set(p.seat, []);
  extraCityRows += byCity.size - 1;
  const multiAanbieder = (aanbiedersOfInst.get(p.oie.OIE_CODE)?.size || 0) > 1;
  for (const [city, list] of byCity) {
    const langs = new Set(); for (const x of list) for (const c of (x.a.VOERTAAL || "").split(",")) if (c.trim()) langs.add(LANG[c.trim()] || c.trim().toLowerCase());
    const language = langs.size ? [...langs].sort((a, b) => langRank(a) - langRank(b)).join(", ") : "nespecificată";
    // forms: those of the licence; in a city with offers, the licensed forms actually offered there
    const offered = new Set(list.map((x) => x.a.VORM).filter((f) => p.forms.has(f)));
    const forms = FORM_ORDER.filter((f) => (offered.size ? offered : p.forms).has(f));
    const form = FORM[forms[0]];
    const own = list.filter((x) => x.direct);
    const url = [...own, ...list].map((x) => tidy(x.a.WEBSITE)).find(urlOk);
    const facs = new Set(list.map((x) => x.a.ONDERWIJSAANBIEDERID));
    const facRaw = facs.size === 1 ? tidy((aanbieders.get([...facs][0])?.NAAM || "").replace(/^Radboud Universiteit Nijmegen \(RU\)\s*/, "")) : "";
    const faculty = multiAanbieder && facRaw.length >= 2 && ![inst.name, inst.officialName].some((n) => n.toLowerCase() === facRaw.toLowerCase()) ? facRaw : undefined;

    const key = "nl-" + [slug(inst.id.startsWith("nl-") ? inst.id.slice(3) : inst.id), slug(p.isat + " " + p.name).slice(0, 110), slug(city)].join("--");
    if (usedKeys.has(key)) throw new Error("duplicate key " + key);
    usedKeys.add(key);
    const search = [p.name, nameEn, sector !== NO_SECTOR ? sector : "", faculty || "", inst.name, city, language, forms.map((f) => f.toLowerCase()).join(" "), o.NIVEAU === "WO-BA" ? "wo universiteit" : "hbo hogeschool applied sciences"]
      .map(ascii).concat(CITY_ALIAS[ascii(city)] || []).join(" ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
    const row = { key, country: "NL", institutionId: inst.id, institutionName: inst.name, city, faculty, domain: sector, domainId, name: p.name, language, form, credits, status: o.NIVEAU, url, source: SOURCE, search };
    for (const k of Object.keys(row)) if (row[k] === undefined) delete row[k];
    progs.push(row);
  }
}

// institutions file
const counts = new Map(); for (const p of progs) counts.set(p.institutionId, (counts.get(p.institutionId) || 0) + 1);
const institutions = [];
for (const [code, v] of instId) {
  const n = counts.get(v.id); if (!n) continue;
  const aanb = new Set([...(aanbiedersOfInst.get(code) || []), ...relAanbOie.filter((r) => instKey(r.OIE_CODE) === code).map((r) => r.ONDERWIJSAANBIEDERID)]);
  const web = [...aanb].map(websiteOf).find(Boolean);
  const inst = { id: v.id, country: "NL", source: SOURCE, name: v.name, officialName: v.officialName, city: cityName(seatOf(code)), kind: /politieacademie|defensie/i.test(v.name) ? "unknown" : v.oie.BEKOSTIGINGSCODE === "BEKOSTIGD" ? "public" : "private", hasSheet: v.hasSheet, website: web, programs: n };
  if (!inst.website) delete inst.website;
  institutions.push(inst);
}
institutions.sort((a, b) => a.id.localeCompare(b.id));
progs.sort((a, b) => a.key.localeCompare(b.key));

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(new URL("nl-institutions.json", OUT), JSON.stringify(institutions, null, 1) + "\n");
fs.writeFileSync(new URL("nl-programs.json", OUT), JSON.stringify(progs) + "\n");

const nul = progs.filter((p) => p.domainId === null);
const lev = (s) => [...licensed.values()].filter((p) => p.o.NIVEAU === s);
const funded = (list) => list.filter((p) => p.erk.BEKOSTIGINGSCODE === "BEKOSTIGD" && p.oie.BEKOSTIGINGSCODE === "BEKOSTIGD").length;
console.log(`current licences: ${stats.lic}; not a bachelor programme (master, associate degree ...): ${stats.notBachelor}; foreign partner of a joint degree: ${stats.foreign}; licence starts in the future: ${stats.future}; accreditation phased out/withdrawn/expired: ${stats.phasedOut}; closed for new students: ${stats.noIntake}; no Dutch seat: ${stats.noSeat}; second licence of a merged institution for the same programme: ${stats.dupLicence}`);
console.log(`bachelor programmes kept (institution x ISAT code): ${licensed.size} = WO ${lev("WO-BA").length} (state-funded ${funded(lev("WO-BA"))}) + HBO ${lev("HBO-BA").length} (state-funded ${funded(lev("HBO-BA"))})`);
console.log(`bachelor-level offer records: ${offerStats.bachelor}; ended: ${offerStats.ended}; not a degree (bridging, module, minor ...): ${offerStats.notDegree}; attached by ISAT code: ${offerStats.byCode}; attached by name: ${offerStats.byName}; no licensed programme found (ignored): ${offerStats.unmatched}`);
console.log(`programmes with at least one offer: ${withOffer}; extra rows for further cities: ${extraCityRows}`);
console.log(`wrote ${institutions.length} institutions, ${progs.length} programmes (WO ${progs.filter((p) => p.status === "WO-BA").length}, HBO ${progs.filter((p) => p.status === "HBO-BA").length}) in ${new Set(progs.map((p) => p.city)).size} cities; language unknown: ${progs.filter((p) => p.language === "nespecificată").length}; with url: ${progs.filter((p) => p.url).length}; with credits: ${progs.filter((p) => p.credits).length}; without domain: ${nul.length} (${Math.round((100 * nul.length) / progs.length)}%)`);
if (process.env.REPORT_NULL) { const m = {}; for (const p of nul) m[p.name] = (m[p.name] || 0) + 1; console.log(Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, +process.env.REPORT_NULL).map(([k, v]) => `${v} ${k}`).join("\n")); }
if (process.env.REPORT_UNMATCHED) console.log(Object.entries(unmatchedNames).sort((a, b) => b[1] - a[1]).slice(0, +process.env.REPORT_UNMATCHED).map(([k, v]) => `${v} ${k}`).join("\n"));
