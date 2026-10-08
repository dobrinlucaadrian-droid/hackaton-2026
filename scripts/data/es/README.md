# Spain (es) - PARTIAL: Comunitat Valenciana only

Outcome: a national open dataset of Grado programmes with the municipality of each centre does NOT exist (checked 2026-10-08).
The only official, openly licensed programme-level file with municipality is regional, so this folder covers
**only the Comunitat Valenciana (provinces Alicante, Castellón, València): 9 universities, 481 Grado rows.**
The `source` field of every row says so.

## Source used

- Dataset: "Grados y Másteres oficiales de la Comunitat Valenciana" (Generalitat Valenciana, Institut Cartogràfic Valencià), https://dadesobertes.gva.es/ca/dataset/grados-y-masteres-oficiales-de-la-comunitat-valenciana
- File: CSV through the open WFS service, https://terramapas.icv.gva.es/12_Titulaciones?request=GetFeature&service=WFS&version=2.0.0&typename=Titulaciones&outputformat=csv (saved as `gva.csv`, 1109 lines, 1.0 MB)
- Dataset page says: last updated 2026-09-23; licence "Creative Commons Attribution" (CC BY). Downloaded 2026-10-08.
- Attribution to show: "Fuente: Generalitat Valenciana (dadesobertes.gva.es), Grados y Másteres oficiales de la Comunitat Valenciana, licencia CC BY."

## Steps

1. `mkdir <raw>` and download the CSV URL above to `<raw>/gva.csv`.
2. `node scripts/data/es/build.mjs <raw>` writes `apps/web/data/catalog/es-institutions.json` and `es-programs.json`.
3. `node scripts/data/validate.mjs es` prints VALID.

## What is kept / filtered

- Kept: rows with `tipo` GU (Grado universitario) and GI (Grado interuniversitario) and `nomtipo_c` = "Universitario". One row per Grado x university x centre x campus (including "Doble Grado" rows, as the source lists them).
- Dropped: Máster (MU, MI) and the 80 rows of Enseñanzas Artísticas Superiores (ISEACV, not universities).
- Names are the source's `nomgrado_c` (Spanish) without the trailing "por la Universidad ..." and with the source's "en en" typo fixed; the source's "Graduado o Graduada en ..." wording is kept.
- city = `municipio_c` (municipality of the centre). Institution city = the municipality with most of its programmes (the source gives no seat).
- kind: the source marks "naturaleza" per centre; a university is public/private by the majority of its rows (public universities such as UMH and UPV have some private affiliated centres, which are listed under them).
- language: "spaniolă" for all rows (the source does not give the teaching language; the contract default). Real teaching language may be Valencian or English for some.
- form: presencial -> full-time, no presencial -> distance; semi-presencial and "varias modalidades" left out.
- domainId: ISCED code `codambito` through `iscedToDomain` when present (112 rows have one); otherwise Spanish keyword rules on the programme name in `build.mjs`; null when unsure or when a code exists but has no domain. Double degrees without a code are null.
- credits, years, maxStudents, status: not in the source, left out.

## Counts

9 institutions (public: UA, UV, UMH, UJI, UPV; Europea, Internacional (VIU), Católica, CEU Cardenal Herrera private), 481 programmes, 19 cities, 138 programmes without domain (29%).
No existing app sheet matched (hasSheet false everywhere).

## Spot checks (output row vs raw row, all matched)

Universidad Europea de Valencia ADE (Facultad de Ciencias Sociales, València); CEU Diseño Industrial (Alfara del Patriarca, ISCED 0715 -> inginerie-mecanica); EDEM Ingeniería y Gestión Empresarial (UPV centre, València, domain null); UV Química (Burjassot, chimie); UA Historia (San Vicente del Raspeig, istorie).

## National sources opened and why they could not be used for the rest of Spain

| Source | What it offers | Why not used |
| --- | --- | --- |
| SIIU "Estadística de universidades, centros y titulaciones" (https://www.ciencia.gob.es/Ministerio/Estadisticas/SIIU/UCT.html), file `PreinscripcionEUCT_2025_26.xlsx` (7.7 MB) | Bulk XLSX, official: per Grado x centre x university for **public in-person universities only** (47 universities, 3092 rows for 2025-26, places, admission grade, ámbito) | Has NO municipality or city (only autonomous community and a centre code), and excludes private and online universities. The contract requires a city and forbids filling it from memory. Could be used later if the team accepts province-level location or joins a municipality source (e.g. DIR3). Reuse terms: the Ministry's aviso legal (https://www.ciencia.gob.es/InfoGeneralPortal/AvisoLegal.html) says for SIIU-derived information "La reutilización de esta información podrá tener objeto comercial o no comercial" with the source cited ("Fuente: Catálogo de datos del Ministerio de Ciencia, Innovación y Universidades") and no suggestion of Ministry endorsement; it is written for the QEDU app, and the portal clause only forbids reproduction "sin citar su origen". |
| estadisticas.ciencia.gob.es UNIVbase (TITU, ESTR, PREINS tables, PC-Axis) | Official counts | Aggregates only (number of degrees per branch/type), no programme list. |
| RUCT (https://www.educacion.gob.es/ruct/home, also universidades.sede.gob.es) | Official registry of universities, centres and titles | Search-only web application (consultacentros / consultaestudios / consultauniversidades); no bulk download or export found, and no reuse licence stated beyond the aviso legal. Not crawled, as that would mean thousands of result pages. (Earlier certificate error was only in the fetch tool; curl opened it.) |
| QEDU app | Same SIIU data | App only, no file. |
| datos.gob.es per-university "titulaciones" datasets (URJC, UCM, UC3M, UGR) | Per-university CSV | Single universities; not collected in this run (only seen in search results, files not opened). A possible extension for Madrid and Andalucía. |

## Limits

- Covers only 9 of Spain's roughly 85 universities; no Catalonia, Madrid, Andalucía, etc.
- The Valencian dataset has no capacity, credits or years.
- 29% of programmes have no app domain.
- Check licence wording again before public launch (CC BY text read from the dataset page, not from a licence file).
