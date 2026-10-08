# France: institutions and first-cycle programmes

Output: `apps/web/data/catalog/fr-institutions.json` (831 institutions) and `fr-programs.jsonl.gz` (5,556 programmes, 279 cities).

## Source

- Dataset: "Parcoursup 2025 - voeux de poursuite d'etudes et de reorientation dans l'enseignement superieur et reponses des etablissements" (id `fr-esr-parcoursup`), Ministere de l'Enseignement superieur et de la Recherche (MESR), published on data.enseignementsup-recherche.gouv.fr.
- Page: https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-parcoursup/
- Metadata API: https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-parcoursup (dataset last modified 2026-03-09, 14,252 records, column `session` = 2025 on every row)
- CSV used: https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-parcoursup/exports/csv?delimiter=%3B
- Downloaded: 2026-10-08.
- Note: the dataset description text mentions "session 2024" but its title and the `session` column say 2025; we cite it as 2025.
- ONISEP data (ODbL, share-alike) is NOT used.

## Licence and attribution

Licence Ouverte v2.0 (Etalab), shown as "Licence Ouverte v2.0 (Etalab)" in the dataset metadata and on the dataset page (https://github.com/etalab/licence-ouverte/blob/master/LO.md). Attribution only; reuse, adaptation and commercial use allowed.

Attribution text to show in the app: "Source : Parcoursup 2025, Ministere de l'Enseignement superieur et de la Recherche (data.enseignementsup-recherche.gouv.fr), Licence Ouverte v2.0. Donnees reformatees par UniPath."

## Rebuild

```
node scripts/data/fr/build.mjs <scratch-folder>
node scripts/data/validate.mjs fr
```

`<scratch-folder>` receives `parcoursup.csv`; if it is not there, the script downloads it from the CSV URL above. Only Node built-ins are used.

## What each row is

One source row = one programme offer at one establishment (Parcoursup offer code `cod_aff_form`, used in the programme key). Institution = one establishment UAI code (`cod_uai`); an IUT site, a university campus or a Sciences Po campus with its own UAI is its own institution, named as in the source (`g_ea_lib_vx`). Existing app sheets are matched by UAI: `sorbonne` = 0755890V, `sciences-po` = 0753431X (Institut d'etudes politiques de Paris), `insa-lyon` = 0690192J.

Field mapping: name = `lib_for_voe_ins`; domain (source label) = `fil_lib_voe_acc` (Licence mention, BUT speciality; generic label for engineering and business schools); city = `ville_etab` (Paris/Lyon/Marseille arrondissements collapsed to the city); maxStudents = `capa_fin` ("Capacite de l'etablissement par formation"); kind = `contrat_etab` (Public = public, all private categories = private); url = Parcoursup page of the offer; years only when the label says "Bac + N". Language is "franceză" for every row (the source has no language field). Credits, form and faculty are left out (not in the source; the file excludes apprenticeship offers).

## Filters applied (counts are source rows, 14,252 in total)

Kept, 5,556 rows:

| Formation type | Rows |
|---|---|
| Licence (incl. double licences) | 3,052 |
| Licence with health access (Licence_Las) | 511 |
| PASS (Parcours d'acces specifique sante) | 287 |
| BUT | 820 |
| Engineering schools, post-bac (Bac + 5 programmes, incl. 2 flagged Licence_Las) | 585 |
| Business and management schools (Bac + 3 and Bac + 5) | 245 |
| Sciences Po / IEP (grade Licence and grade Master programmes) | 46 |
| Formation valant grade de licence | 9 |
| Formations Bac + 3 (Ecole du Louvre) | 1 |

Dropped for type, 8,681 rows: BTS 5,351 (Services 3,096, Production 1,711, Agricole 525, Maritime 19); CPGE 986 (scientific 490, economic 360, literary 136); Certificat de specialisation 369; nursing and health state diplomas (D.E secteur sanitaire / IFSI) 525; DN MADE 321; social work diplomas (D.E secteur social) 243; FCIL 111; DCG 96; BPJEPS 79; CMI (Cursus Master en Ingenierie) 70; mise a niveau and annee preparatoire 86; Diplome National d'Art 57; DEUST 57; Diplome d'etablissement / d'Universite 91; classe preparatoire aux etudes superieures 42; "Formations Bac + 5" (architecture schools, heritage institute) 42; art schools 36; CPES 26; CUPGE 27; cooking schools 15; Licence professionnelle (LP, entry after Bac + 2) 30; other (DSP, vet schools, professional, DEJEPS) 21.
Dropped as abroad, 15 rows: establishments with department code 99 (for example Hanoi, Barcelona, Rabat).

Judgement calls to review: nursing (IFSI, 344 rows, grade licence) and CMI are dropped because they are outside the stated scope; they can be added by extending `classify()` in `build.mjs`. Engineering and business rows are 5-year (Bac + 5) or 3-year programmes, kept because the scope names them.

## Domain mapping

Keyword table in `build.mjs` (French, on the Licence mention or BUT speciality, then on the label); PASS = medicina; business schools = business-management (marketing, finance, tourism when the label says so); Sciences Po / IEP = stiinte-politice-relatii-internationale; engineering schools only when the label names exactly one field. Result: 829 of 5,556 programmes (14.9%) have no domain: engineering schools 572 of 585 (their labels are generic), Licence 147, BUT 88, Licence-Las 13, valant grade de licence 9. Unmapped on purpose: AES (Administration economique et sociale), Humanites, Metiers du multimedia, Pluridisciplinaire, "Sciences et technologies", Hygiene Securite Environnement, Packaging, dietetics.

## Known limits

- Parcoursup covers only offers recruited through Parcoursup. Programmes with their own admission (for example the Sciences Po Paris Bachelor, many private schools) are absent or partial; Sciences Po (sheet `sciences-po`) has 9 rows, all double degrees.
- Universities that teach through "portails" show the portail name (for example Sorbonne has "Licence - Portail Mathematiques, Informatique", not a separate Licence Informatique).
- Capacity is the number of places Parcoursup lists for the offer, not the intake or the whole programme.
- Institution `website` is not in this dataset and is omitted. Institution city is the most common commune of its rows.
- One institution = one UAI, so a university with several UAIs (IUT, antennas) appears several times, as in the source.
