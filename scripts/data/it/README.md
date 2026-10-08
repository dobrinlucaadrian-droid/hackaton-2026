# Italy catalogue (cc = it)

Produces `apps/web/data/catalog/it-institutions.json` and `it-programs.json` from the Italian Ministry of University and Research (MUR) open statistics portal USTAT.

## Source

- Dataset "Metadati" (MUR, Ufficio di Statistica), portal https://dati-ustat.mur.gov.it , dataset id `bed0c71e-9f86-4a0f-a266-963b6f7bbbd2` (CKAN API: `https://dati-ustat.mur.gov.it/api/3/action/package_show?id=metadati`).
- Offer by course (all years 2010-2025, 82,100 rows): https://dati-ustat.mur.gov.it/dataset/bed0c71e-9f86-4a0f-a266-963b6f7bbbd2/resource/c0e63906-7190-4568-892b-0cf399f56071/download/03_offertaformativa-corsidilaurea_2010-2025.csv (save as `offerta.csv`; Windows-1252 text, `;` separated)
- Universities list: https://dati-ustat.mur.gov.it/dataset/bed0c71e-9f86-4a0f-a266-963b6f7bbbd2/resource/820aefe6-0662-4656-84ec-d8859a2a3b7e/download/01_atenei.csv (save as `atenei.csv`; UTF-8)
- Downloaded: 2026-10-08.

## Licence

Italian Open Data License v2.0 (IODL 2.0), as stated in the dataset's CKAN metadata (`license_title`; link http://www.dati.gov.it/content/italian-open-data-license-v20). Attribution to use: "Source: MUR - Ufficio di Statistica (dati-ustat.mur.gov.it), Italian Open Data License v2.0; data adapted by UniPath." The full licence text was not read in this session; derived data should be shared under compatible terms.

## Rebuild

1. Download the two CSV files above into one folder, named `offerta.csv` and `atenei.csv`.
2. `node scripts/data/it/build.mjs <that folder>` (Node 24, no packages).
3. `node scripts/data/validate.mjs it` must print VALID.

## What is kept

- Only the latest year in the file (2025, i.e. the 2025/26 offer) and only `TipoCorso` = "Laurea" (2,848 first-cycle) or "Laurea Magistrale Ciclo Unico" (410 single-cycle: medicine, dentistry, pharmacy, veterinary, law, architecture, primary education, restoration). "Laurea Magistrale" (2,737) is dropped. 5,995 rows in 2025, 3,258 kept.
- One row per course x university x seat (the source's own granularity). No duplicates remain on that key; keys get a suffix if two rows would collide.
- Institutions: the 92 universities that have kept rows, joined to `atenei.csv` by operative name. Public = `StataleLibera` S, private = L (telematic universities are private). City = the university's seat; programme city = `SedeCorso_Comune` (title-cased; the source placeholder "Comune Estero", 2 rows, is replaced by the institution seat).
- Reused app sheets (hasSheet true): unibo, polimi, polito, sapienza, unipd, bocconi.

## Field choices

- `domain` = class name and code, e.g. "Scienze e tecnologie informatiche (L-31)". `domainId` comes from the degree class (table in build.mjs), refined by keywords in the course name for L-3, L-8, L-9 and L/SNT2; null when unsure.
- `status` carries the access type in the source's words (accesso libero / nazionale / locale), not an accreditation status. `form` = distance for "Teledidattica" and "Prevalentemente a distanza"; left out otherwise (the source only says conventional/blended).
- Not in the source and therefore left out: faculty, credits, years, maxStudents, programme URL, institution website.
- Course names are the source text with spaces tidied, zero-width characters removed and ALL CAPS turned into sentence case. Some names keep the source's own suffixes such as "REPLICA ... (address)", "'A'", "HT".
- Language: Italiano, Inglese, Tedesco, Francese, Ladino mapped to Romanian names; "Altro" becomes "altă limbă".

## Counts (2026-10-08)

92 institutions, 3,258 programmes, 211 cities (programme cities). Without app domain: 172 (5.3%), all from classes L-1, L-8/L-9 (biomedical, management), L-43, L-P03, L/GASTR, LMR/02.

## Known limits

- The source has no faculty, credits, duration, capacity or links. Single-cycle durations are not given.
- One row can be a replica of the same course at another seat; they are separate rows by design.
- Class-to-domain mapping is our own and approximate (for example all L/SNT1, SNT3 and SNT4 health professions are "asistenta-medicala").
- The offer file lists courses activated in the year, not the accreditation status of each.
