# France: institutions and first-cycle programmes

Output: `apps/web/data/catalog/fr-institutions.json` (934 institutions: 619 public, 315 private) and `fr-programs.jsonl.gz` (7,104 programmes, 320 cities; gzipped JSON Lines because the plain JSON is 5.6 MB).

Two kinds of rows, told apart by the `source` field:

| `source` | Rows | What |
|---|---|---|
| `Parcoursup 2026 (MESR open data, cartographie des formations, 2026-10-08)` | 5,769 | offers a pupil can apply to after the baccalauréat |
| `MESR, diplômes préparés dans les établissements publics 2024-25 (open data SISE, 2025-11-07)` | 1,335 | licences professionnelles (1,079) and licence mentions without a named Parcoursup offer (256), public institutions only |

## Sources

All three datasets are published by the Ministère de l'Enseignement supérieur, de la Recherche et de l'Espace on data.enseignementsup-recherche.gouv.fr. Downloaded 2026-10-08. Raw files are not committed.

1. **"Cartographie des formations Parcoursup"** (id `fr-esr-cartographie_formations_parcoursup`), session 2026 only. The offers.
   - Page: https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-cartographie_formations_parcoursup/
   - CSV used (`carto-2026.csv`): https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-cartographie_formations_parcoursup/exports/csv?delimiter=%3B&refine=annee%3A2026
   - Metadata: modified 2025-12-17, updated daily, 157,509 records for sessions 2020 to 2026, of which 25,805 for 2026. Creator: "Service à compétence nationale Parcoursup".
2. **"Parcoursup 2025 - voeux de poursuite d'etudes et de reorientation dans l'enseignement superieur et reponses des etablissements"** (id `fr-esr-parcoursup`), 14,252 records, modified 2026-03-09. Used only for two things: the number of places (`capa_fin`) of an offer that has the same Parcoursup code in 2026, and the plain name of an establishment (`g_ea_lib_vx`).
   - CSV used (`parcoursup.csv`): https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-parcoursup/exports/csv?delimiter=%3B
3. **"Principaux diplômes et formations préparés dans les établissements publics sous tutelle du ministère en charge de l'Enseignement supérieur"** (id `fr-esr-principaux-diplomes-et-formations-prepares-etablissements-publics`), academic year 2024-25 only (30,007 of 531,062 records), modified 2025-11-07. From the student records system SISE. Licences professionnelles and licence mentions.
   - Page: https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-principaux-diplomes-et-formations-prepares-etablissements-publics/
   - CSV used (`diplomes-2024-25.csv`): https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-principaux-diplomes-et-formations-prepares-etablissements-publics/exports/csv?delimiter=%3B&refine=annee_universitaire%3A2024-25

ONISEP data (ODbL, share-alike) is NOT used.

## Licence and attribution

Each of the three datasets carries, in its metadata (`metas.default.license`) and on its page, the licence **"Licence Ouverte v2.0 (Etalab)"**, licence link https://www.etalab.gouv.fr/wp-content/uploads/2017/04/ETALAB-Licence-Ouverte-v2.0.pdf. Attribution only (source and date of last update); reuse, adaptation and commercial use allowed.

Attribution text to show in the app: "Sources : Cartographie des formations Parcoursup 2026 et Principaux diplômes et formations préparés dans les établissements publics 2024-25, Ministère de l'Enseignement supérieur, de la Recherche et de l'Espace (data.enseignementsup-recherche.gouv.fr), Licence Ouverte v2.0. Données reformatées par UniPath."

## Rebuild

```
node scripts/data/fr/build.mjs <scratch-folder>
node scripts/data/validate.mjs fr
```

`<scratch-folder>` receives `carto-2026.csv`, `parcoursup.csv` and `diplomes-2024-25.csv`; a file that is not there is downloaded from the URLs above. Only Node built-ins are used.

## Part 1: Parcoursup 2026 (5,769 rows)

One source row = one programme offer at one establishment (Parcoursup offer code `gta`, used in the programme key). Institution = one establishment UAI code (`etab_uai`); an IUT site, a university campus or a Sciences Po campus with its own UAI is its own institution. Existing app sheets are matched by UAI: `sorbonne` = 0755890V, `sciences-po` = 0753431X, `insa-lyon` = 0690192J.

Field mapping: name = `nm`; domain (source label) = the official mentions of the offer from `fl` (several joined with " ; " for double licences and first-year "portails"; the speciality for a BUT); city = `commune`; url = `fiche` (the Parcoursup page of the offer); kind = `tc` ("Publics" = public, both private categories = private); institution website = `etab_url`; years only when the label says "Bac + N"; maxStudents = `capa_fin` of the **2025** session for the same offer code (5,128 of 5,769 rows; the 641 offers new in 2026 have none). Language is "franceză" for every row (the source has no language field).

Establishment name: `etab_nom` without the place in brackets at its end ("(Lyon 8e Arrondissement - 69)"). Where the offers of one UAI carry different labels (schools write the site or the track in the label), the institution takes the plain 2025 name and the label goes into `faculty` (526 rows).

Compared with the first version (Parcoursup 2025, 5,556 rows): 5,128 offer codes are in both, 428 are gone, 641 are new. 129 institution ids changed because the 2026 label of the establishment differs.

Kept, by formation type:

| Formation type | Rows |
|---|---|
| Licence (incl. double licences and first-year portails) | 3,055 |
| Licence with health access ("Accès Santé (LAS)") | 461 |
| PASS (Parcours d'accès spécifique santé) | 282 |
| Licence professorat des écoles (LPE, new in 2026) | 126 |
| BUT | 822 |
| Engineering schools, post-bac (Bac + 5, plus Bac + 3 and Bac + 4 programmes) | 699 |
| Business and management schools (Bac + 3, Bac + 4, Bac + 5) | 265 |
| Sciences Po / IEP | 49 |
| Formation valant grade de licence | 9 |
| Formations Bac + 3 (Ecole du Louvre) | 1 |

Filters (25,805 source rows for 2026):

- Dropped for type, 19,869 rows: BTS 14,652; CPGE 982; certificats de spécialisation and FCIL 1,181; "formations professionnelles" 647; nursing D.E Infirmier (IFSI) 338; other health diplomas 188; social work diplomas 442; DN MADE 330; DCG 196; DEUST 160; BPJEPS and DEJEPS 146; art schools (DNA, écoles supérieures d'art, DNSP, D.E professeur de musique/danse) 127; diplômes d'université/d'établissement and DSP 104; CMI 64; CPES 47; CUPGE 33; architecture, landscape and heritage schools 45; hotel schools 20; vet schools 6; preparatory and catch-up years about 130; Licence professionnelle 29 (taken from the MESR list instead, see part 2).
- Dropped as apprenticeship, 148 rows: offers of a kept type marked "Formations en apprentissage" (the same programme is normally also listed as a normal offer).
- Dropped as abroad, 19 rows: no commune and no French département in the label (Rabat, Singapore, Madrid, London...).

What the dropped families would add (offers that are not apprenticeships), if the team wants them later: nursing (IFSI) 338; other health diplomas (orthophoniste, ergothérapeute, imagerie médicale...) 185; DN MADE 321; art schools 113; architecture, landscape and heritage 45; vet schools 6; social work 238; CMI 64; CPES and CUPGE 80.

## Part 2: MESR list of diplomas, 2024-25 (1,335 rows)

The list has one row per institution, diploma, level and commune, with the number of students enrolled. 75 public institutions have licences professionnelles or licences in it.

**Licences professionnelles (1,079 rows).** Filter: `diplome_rgp` = "Licence professionnelle" (1,193 source rows: 1,133 "en 1 an", 60 "en 2 ou 3 ans"). One row per institution and mention (`libelle_intitule_1`), 73 institutions, 160 different mentions. name = "Licence professionnelle - " + mention; domain = `sect_disciplinaire_lib`; city = the commune (`implantation_commune`) with the most students of that diploma; years = 1 when the source says "Licence professionnelle en 1 an" (one year after a two-year diploma); no places, no url (the list has none). The 29 licence professionnelle offers of Parcoursup are not used, so no programme is listed twice; 3 of them are at private institutions and are therefore absent.

**Licence mentions (256 rows).** Filter: `typ_diplome` = "XA" (Licence LMD), without CPES and without the rows named "Portail ..." (first-year gateways). 1,353 institution and mention pairs. A pair is added only when the catalogue has no named licence for it:

- 1,090 skipped: a Parcoursup establishment of the same university already has a licence offer whose only mention is this one. "Same university" = same UAI code, or same ministry identifier (`etablissement_id_paysage`), or an establishment label containing the university's name. Mention names are compared without accents and case; the two lists use the same national names except for a few handled in `mentionKey()` (STAPS and its tracks, "Information-communication", "Droits français-droits étrangers", "Sciences de la terre et de l'environnement", "Sciences de l'éducation et de la formation").
- 7 skipped: a public establishment that could not be tied to any university has a single-mention offer for the same mention in the same commune (probably the same licence).
- 256 added. They are mentions that Parcoursup shows only inside a first-year portail or a double licence (for example Sorbonne Université: Chimie, Informatique, Mécanique, Electronique-énergie électrique-automatique, Sciences de la terre) or licences entered in the third year (Administration publique, Gestion).

**Which institution the rows hang on.** 68 of the 75 institutions have the same UAI code as a Parcoursup establishment and use its id. 7 have no Parcoursup establishment with their UAI and get their own entry (source = MESR): Université de Lorraine (47 rows), Université Paris-Saclay (26), Université de Pau et des Pays de l'Adour (13), Université de la Nouvelle-Calédonie (15), Université de technologie Tarbes Occitanie Pyrénées (4), Conservatoire national des arts et métiers (1), IAE Paris - Sorbonne Business School (1). For the first three, Parcoursup lists only faculties, campuses and IUT under their own UAI codes, so the university-level entry stands beside them.

**Accents.** The MESR list writes diploma names without accents ("Metiers de l'immobilier"). The build puts them back: a licence mention takes the spelling Parcoursup uses for the same mention; other words are accented when the Parcoursup and MESR texts write that word with one and the same accented form; 34 remaining words and acronyms are in the `SPELLING` table in `build.mjs`. Only spelling changes; no word is added or removed.

## Domain mapping

Parcoursup rows: keyword table `RULES` in `build.mjs` on the Licence mention or BUT speciality, then on the label; PASS = medicina; business schools = business-management (marketing, finance, tourism when the label says so); Sciences Po / IEP = stiinte-politice-relatii-internationale; engineering schools only when the label names exactly one field. An offer with several mentions gets a domain only when all its mentions map to the same one (for a double licence, the discipline named first). MESR licences professionnelles: keywords on the mention (`LP_RULES`), then the ministry's "secteur disciplinaire" (`SECTOR`).

Result: 1,320 of 7,104 programmes (18.6%) have no domain: engineering schools 664 of 699 (generic labels), Licence 258, licences professionnelles 198, BUT 88, Licence accès santé 75, MESR licence mentions 28, valant grade de licence 9. Unmapped on purpose: AES, Humanités, Sciences pour l'ingénieur, "Sciences et technologies", portails over several fields, maintenance, quality and other cross-field licences professionnelles.

## Known limits

- Parcoursup covers only offers recruited through Parcoursup. Still missing: schools with their own admission (emlyon and other business schools outside Parcoursup, Epitech, most private bachelors), the grandes écoles entered after a classe préparatoire, architecture, veterinary, art and design schools, nursing and other health and social-work diplomas, BTS and CPGE (left out on purpose).
- Licences professionnelles and the added licence mentions exist only for public institutions under the ministry (no private or agriculture-ministry institutions), describe 2024-25 (one year older than the Parcoursup rows), and sit at university level: no faculty, no places, no link. A licence professionnelle taught in several communes appears once, in the commune with most students.
- The number of places is the 2025 figure for the same offer; it is the capacity Parcoursup lists, not the intake.
- A programme can appear several times under one establishment when Parcoursup has one offer per baccalauréat track or per option (116 name repeats).
- One institution = one UAI, so a university with several UAIs (IUT, campuses) appears several times, as in the source. Institution city is the most common commune of its rows.
- The Parcoursup 2026 cartography is updated daily by the ministry; a later download can differ by a few rows.
