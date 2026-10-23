// Picks the best freely licensed photo for every university sheet: the Wikidata item whose official website matches ours, its main image plus the photos of its Wikimedia Commons category; keeps only large landscape photos with a free licence, scores them (size, 16:9 fit, Commons quality badges, age, light, contrast, sharpness), saves the winner as a 1280×720 WebP in apps/web/public/photos and records author and licence in apps/web/data/photos.json.
// Usage (from the repo root): node scripts/data/photos.mjs [--only id1,id2] [--rebuild]. Without --rebuild, sheets that already have a photo are skipped.
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const web = fileURLToPath(new URL("../../apps/web/", import.meta.url));
const require = createRequire(web + "package.json");
const sharp = require("sharp");
const UA = "FindMyUni/1.0 (https://findmyuni.ro; findmyuni.ro@gmail.com)";
const OUT = web + "public/photos/";
const LIST = web + "data/photos.json";
const W = 1280, H = 720;
const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
const only = arg("--only")?.split(",") ?? null;
const rebuild = process.argv.includes("--rebuild");

const sheets = [...JSON.parse(readFileSync(web + "data/universities-ro.json", "utf8")), ...JSON.parse(readFileSync(web + "data/universities-abroad.json", "utf8"))];
let photos = existsSync(LIST) ? JSON.parse(readFileSync(LIST, "utf8")) : [];
// Photos a person looked at and rejected (people, interiors, signs...): never picked again.
const REJECTS = new Set(existsSync(web + "data/photo-rejects.json") ? JSON.parse(readFileSync(web + "data/photo-rejects.json", "utf8")) : []);
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function json(url) {
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return res.json();
    await sleep(2000 * (i + 1)); // Wikimedia asks clients to back off when busy
  }
  throw new Error(`HTTP error for ${url}`);
}
const host = (u) => {
  try {
    return new URL(u).hostname.toLowerCase().replace(/^www\d?\./, "");
  } catch {
    return "";
  }
};
const sameSite = (a, b) => a && b && (a === b || a.endsWith("." + b) || b.endsWith("." + a));
const plain = (html) => String(html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[„”"'’.,()]/g, "").replace(/\s+/g, " ").trim();
const FREE = /^(cc0|cc[- ]by(-sa)?( \d(\.\d)?)?( [a-z]{2,})?|public domain|pd\b.*)$/i;
// Not a photo of the place: logos, maps, plans, documents, people, objects.
const NOT_PLACE = /logo|emblem|coat[_ ]of[_ ]arms|wappen|stema|sigla|seal|map|plan|lageplan|diagram|chart|poster|flyer|document|certificate|diploma|portrait|bust|statue|plaque|sign\b|signature|graffiti|mural|interior|innen|inside|lecture|hörsaal|corridor|stair|toilet|classroom|desk|computer|screen|event|ceremony|graduation|conference|meeting|students|crowd|award|panorama|magazine|brochure|leaflet|cover|press|speech|speaker|talk|interview|visit|night|nacht|noapte/i;

// Words of a file name that point to the institution's buildings, and name words too common to identify one institution.
const BUILDING = /building|hall|halls|tower|library|bibliot|gebaude|hauptgebaude|campus|main|facade|fassade|exterior|aussenansicht|rectorat|rectorate|rektorat|palat|palazzo|edificio|batiment|gebouw|budynek|budova|corp |corpul|sediul|headquarters|old college|quad|universitat|universiteit|universite|universita|uniwersytet|univerzit/;
const GENERIC = new Set(["universitatea", "university", "universitat", "universitet", "universite", "universita", "universidad", "universidade", "universiteit", "uniwersytet", "univerzita", "college", "institute", "institut", "technology", "technical", "tehnica", "national", "nationala", "studii", "stiinte", "sciences", "applied", "school", "academia", "academy", "politehnica", "medicina", "farmacie", "medicine", "superior", "superiore", "degli", "della", "studi", "hochschule", "technische", "fachhochschule", "state"]);

// Wikidata: the item whose official website is ours, found by name search or among the country's institutions.
const COUNTRY_QID = {
  România: "Q218", "Marea Britanie": "Q145", Germania: "Q183", Italia: "Q38", Franța: "Q142", Olanda: "Q55", Danemarca: "Q35", SUA: "Q30",
  Spania: "Q29", Austria: "Q40", Polonia: "Q36", Belgia: "Q31", Elveția: "Q39", Suedia: "Q34", Canada: "Q16", "Coreea de Sud": "Q884",
  Norvegia: "Q20", Lituania: "Q37", Irlanda: "Q27", Finlanda: "Q33", Cehia: "Q213", Grecia: "Q41", Bulgaria: "Q219", Australia: "Q408",
  Letonia: "Q211", Portugalia: "Q45", Cipru: "Q229", "Republica Moldova": "Q217", "Hong Kong": "Q8646", Estonia: "Q191", Slovenia: "Q215",
  Singapore: "Q334", Malta: "Q233",
};
const countryIndex = new Map();
async function countryItems(country) {
  if (countryIndex.has(country)) return countryIndex.get(country);
  const qid = COUNTRY_QID[country];
  let rows = [];
  if (qid) {
    const sparql = `SELECT ?item ?site ?label WHERE { ?item wdt:P17 wd:${qid}; wdt:P31/wdt:P279* wd:Q38723 . { ?item wdt:P18 [] } UNION { ?item wdt:P373 [] }
      OPTIONAL { ?item wdt:P856 ?site } OPTIONAL { ?item rdfs:label ?label FILTER(LANG(?label) IN ("ro","en")) } OPTIONAL { ?item wdt:P1705 ?label } }`;
    try {
      const r = await json(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`);
      rows = r.results.bindings.map((b) => ({ qid: b.item.value.split("/").pop(), host: b.site ? host(b.site.value) : "", label: b.label ? norm(b.label.value) : "" }));
    } catch (e) {
      console.error(`${country}: country query failed (${e.message})`);
    }
  }
  countryIndex.set(country, rows);
  return rows;
}
async function findQid(u) {
  const known = photos.find((p) => p.id === u.id)?.wikidata;
  if (known) return known;
  const siteHost = host(u.website);
  const rows = await countryItems(u.country);
  const bySite = siteHost && rows.find((r) => sameSite(r.host, siteHost));
  if (bySite) return bySite.qid;
  const byName = [...new Set(rows.filter((r) => r.label && r.label === norm(u.name)).map((r) => r.qid))];
  if (byName.length === 1) return byName[0];
  if (!siteHost) return null;
  for (const lang of u.region === "ro" ? ["ro", "en"] : ["en", "ro"]) {
    const s = await json(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&type=item&limit=7&language=${lang}&uselang=${lang}&search=${encodeURIComponent(u.name)}`);
    const ids = (s.search ?? []).map((x) => x.id);
    if (!ids.length) continue;
    const e = await json(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=${ids.join("|")}`);
    for (const id of ids) {
      const sites = (e.entities?.[id]?.claims?.P856 ?? []).map((c) => host(c.mainsnak?.datavalue?.value));
      if (sites.some((h) => sameSite(h, siteHost))) return id;
    }
  }
  return null;
}

// Candidates: the item's main image and the files of its Commons category.
async function candidates(qid) {
  const e = await json(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=${qid}`);
  const claims = e.entities?.[qid]?.claims ?? {};
  const main = claims.P18?.[0]?.mainsnak?.datavalue?.value ?? null;
  const category = claims.P373?.[0]?.mainsnak?.datavalue?.value ?? null;
  const titles = new Set(main ? ["File:" + main] : []);
  if (category) {
    const c = await json(`https://commons.wikimedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=file&cmlimit=80&cmtitle=${encodeURIComponent("Category:" + category)}`);
    for (const m of c.query?.categorymembers ?? []) titles.add(m.title);
  }
  const list = [...titles];
  const out = [];
  for (let i = 0; i < list.length; i += 40) {
    const q = await json(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo|categories&clshow=!hidden&cllimit=max&iiprop=url|size|mime|extmetadata&iiurlwidth=1600&titles=${encodeURIComponent(list.slice(i, i + 40).join("|"))}`);
    for (const page of Object.values(q.query?.pages ?? {})) {
      const info = page.imageinfo?.[0];
      if (!info) continue;
      const m = info.extmetadata ?? {};
      out.push({
        title: page.title,
        isMain: main !== null && page.title === "File:" + main,
        width: info.width, height: info.height, mime: info.mime,
        thumb: info.thumburl ?? info.url, source: info.descriptionurl,
        license: plain(m.LicenseShortName?.value), licenseUrl: plain(m.LicenseUrl?.value) || null,
        author: (/unknown|necunoscut/i.test(plain(m.Artist?.value)) ? "" : plain(m.Artist?.value).slice(0, 120)) || "autor necunoscut",
        year: Number(String(m.DateTimeOriginal?.value ?? m.DateTime?.value ?? "").match(/(19|20)\d{2}/)?.[0] ?? 0),
        categories: (page.categories ?? []).map((c) => c.title).join(" ") + " " + plain(m.Categories?.value),
      });
    }
    await sleep(150);
  }
  return out;
}

// First the facts we know without downloading (size, shape, licence, badges, age), then light and sharpness on the best few.
function metaScore(c) {
  const ratio = c.width / c.height;
  let s = Math.min(c.width, 4000) / 4000 + Math.max(0, 1 - Math.abs(ratio - 16 / 9) / 0.6);
  if (/Quality images|Featured pictures|Valued images/i.test(c.categories)) s += 1;
  if (c.isMain) s += 0.4; // chosen by Wikidata editors as the picture of the institution
  if (c.year >= 2012) s += 0.3;
  else if (c.year && c.year < 2000) s -= 0.4;
  return s;
}
async function lookScore(buf) {
  const img = sharp(buf).resize(480, 270, { fit: "cover" }).greyscale();
  const st = await img.stats();
  const mean = st.channels[0].mean, contrast = st.channels[0].stdev;
  const edges = await img.clone().convolve({ width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0] }).stats();
  const sharp_ = Math.min(edges.channels[0].stdev / 25, 1);
  const light = 1 - Math.min(Math.abs(mean - 135) / 135, 1); // neither dark nor washed out
  return light + Math.min(contrast / 60, 1) + sharp_;
}

let kept = 0, none = 0, failed = 0;
const done = new Map(photos.map((p) => [p.id, p]));
for (const u of sheets) {
  if (only && !only.includes(u.id)) continue;
  if (!rebuild && done.has(u.id)) continue;
  try {
    const qid = await findQid(u);
    const pool = qid ? await candidates(qid) : [];
    const good = pool.filter((c) =>
      c.mime === "image/jpeg" && c.width >= 1600 && c.height >= 900 && c.width / c.height >= 1.3 && c.width / c.height <= 2.4 &&
      FREE.test(c.license) && !/\b(nc|nd)\b/i.test(c.license) && !NOT_PLACE.test(c.title + " " + c.categories) && !REJECTS.has(c.title),
    );
    if (!good.length) {
      if (done.has(u.id)) { try { unlinkSync(OUT + u.id + ".webp"); } catch {} done.delete(u.id); }
      none++;
      continue;
    }
    // The main image (chosen by Wikidata editors) wins when it fits; otherwise only category photos whose file name points to the
    // institution's buildings, because a category also holds events, people and other places.
    const mainFits = good.find((c) => c.isMain);
    const cityWords = new Set(norm(u.city ?? "").split(/[ -]/));
    const nameWords = norm(u.name).split(" ").filter((w) => w.length >= 5 && !GENERIC.has(w) && !cityWords.has(w));
    const buildingLike = (c) => {
      const t = norm(decodeURIComponent(c.title));
      // A building word is required: names alone also match people, posters and events of the institution.
      return BUILDING.test(t) && (nameWords.some((w) => t.includes(w)) || /univ|hochschul|college|politec|akadem|campus|rectorat|rektorat|sediul/.test(t));
    };
    const top = mainFits ? [mainFits] : good.filter(buildingLike).sort((a, b) => metaScore(b) - metaScore(a)).slice(0, 3);
    if (!top.length) {
      if (done.has(u.id)) { try { unlinkSync(OUT + u.id + ".webp"); } catch {} done.delete(u.id); }
      none++;
      continue;
    }
    let best = null;
    for (const c of top) {
      const buf = Buffer.from(await (await fetch(c.thumb, { headers: { "User-Agent": UA } })).arrayBuffer());
      const score = metaScore(c) + (await lookScore(buf));
      if (!best || score > best.score) best = { c, buf, score };
      await sleep(150);
    }
    await sharp(best.buf).rotate().resize(W, H, { fit: "cover", position: "attention" }).webp({ quality: 60 }).toFile(OUT + u.id + ".webp");
    const c = best.c;
    done.set(u.id, { id: u.id, file: `/photos/${u.id}.webp`, author: c.author, license: c.license, licenseUrl: c.licenseUrl, source: c.source, wikidata: qid });
    kept++;
    if (kept % 20 === 0) writeFileSync(LIST, JSON.stringify([...done.values()].sort((a, b) => a.id.localeCompare(b.id)), null, 1) + "\n");
  } catch (e) {
    failed++;
    console.error(`${u.id}: ${e.message}`);
  }
  await sleep(150);
}
photos = [...done.values()].sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(LIST, JSON.stringify(photos, null, 1) + "\n");
console.log(`photos: ${photos.length} in total; chosen now ${kept}, no good photo ${none}, failed ${failed}`);
