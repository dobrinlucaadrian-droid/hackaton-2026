# Estonia (EE) catalogue

Result: BUILT. `node scripts/data/validate.mjs ee` prints VALID: 18 institutions (6 with an app sheet), 361 programme rows from 301 curricula, 15 places, 23 rows (6%) without an app domain.

## Source

- EHIS open data (Eesti Hariduse Infosüsteem, the national education information system run by Haridus- ja Teadusministeerium, the Ministry of Education and Research).
- Curricula query (all curricula of all levels, one XML file, 18.7 MB, 8,544 records): `http://enda.ehis.ee/avaandmed/rest/oppekavad/-/-/-/1/XML`
- Institutions query (seat, ownership, website): `http://enda.ehis.ee/avaandmed/rest/oppeasutused/-/-/-/-/-/-/-/-/-/-/0/0/XML` (12.7 MB).
- Only plain `http` works; the `https` address answers 404. The API guide (projektid.edu.ee) did not answer; the query paths were taken from the research notes and by trying the institutions path with the documented number of `-` placeholders.
- Dataset page: https://andmed.eesti.ee/datasets/eesti-hariduse-infosusteemi-avaandmed-oppeasutused ("Eesti Hariduse Infosüsteemi avaandmed - õppeasutused"); its description says all public EHIS data, including curricula (õppekavad), is open through the portal and the API (CSV, XML, JSON).
- Downloaded on 2026-10-19 (response header `vastuseLoomiseAeg` 19.10.2026).

## Licence and attribution (ShareAlike)

- andmed.eesti.ee lists the EHIS open-data distributions under **CC BY-SA 3.0** (https://creativecommons.org/licenses/by-sa/3.0/), on the dataset page cited above.
- Attribution to use: "Eesti Hariduse Infosüsteem (EHIS), Haridus- ja Teadusministeerium, avaandmed, CC BY-SA 3.0, retrieved 2026-10-19; adapted by FindMyUni."
- **ShareAlike**: the two files built here are an adaptation, so they (and anything derived from them) must be shared under CC BY-SA 3.0 or a compatible licence, with the attribution and a note that the data was changed. This must be said wherever the Estonian data is shown or offered for download.
- No separate licence was found on the API itself; the licence above is the one andmed.eesti.ee gives for the EHIS distributions.

## Steps

1. `node scripts/data/ee/build.mjs <raw folder>` (downloads the two XML files into the folder when missing; no packages needed).
2. Keep a curriculum when all of these hold:
   - `oppekavaLiik` = "Kõrghariduse õppekava" (higher-education curriculum);
   - level `ope` is `511 bakalaureuseõpe` (bachelor), `514 rakenduskõrgharidusõpe` (professional higher education, the first cycle of the universities of applied sciences) or `503 integreeritud õpe` (integrated bachelor + master entered from school: medicine, dentistry, pharmacy, veterinary medicine, architecture, civil engineering, class teacher);
   - `vastuvott` = "Avatud" (open for admission) — this is how "current" is decided;
   - `kehtivStaatus` = "Registreeritud".
3. Fields: name = `oppekavaNimetus` (Estonian; the English name `oppekavaNimetusInglise` goes only into `search`); domain = `ryhmaNimetus` (the ISCED-F narrow field in Estonian), domainId = `iscedToDomain(ryhmaKood)`;
   language = `oppeKeel` (eesti keel → estonă, inglise keel → engleză, vene keel → rusă); credits = `maht` (EKAP = ECTS); years = `nominaalKestusAastad` + `nominaalKestusKuud`/12 (3.5 for 210 ECTS curricula);
   url = `avalikOppekavaFailUrl` only when it is a web link with a path (bare home pages such as "http://www.tlu.ee" — 48 Tallinn University rows — and "https://www.euas.eu/", "https://rus.eek.ee/" are left out; 67 rows have no url).
   No faculty, study form, places or accreditation status: the source has no faculty or form field, and its accreditation decisions are old programme-level ones (2009–2013), so `status` is left out.
4. City: the source has a place-of-study list (`toimumisKohad`) for most curricula. One row is written per curriculum and per place, like the Dutch catalogue (301 curricula → 361 rows).
   Towns are written without " linn" ("Tartu linn" → "Tartu"); rural municipalities keep their name ("Kambja vald", "Vinni vald"). A county ("Harju maakond", "Lääne maakond") or "Välismaa" (abroad) is not a clear town and is left out (7 entries).
   When no clear place is left (30 curricula), the row takes the institution's seat.
5. Institutions: name and official name = EHIS `nimetus` (Estonian); seat (`city`) = municipality (`kov`) of the legal address in the EHIS institutions query (official); kind: `avalik-õiguslik` and `riigiomandus` → public, `eraomand` → private; website = `veebiLeht`.
6. App sheets, matched by EHIS school id and checked by Estonian and English name and seat: 61 Tartu Ülikool → `tartu`, 93 Tallinna Tehnikaülikool → `taltech`, 94 Tallinna Ülikool → `tlu-tallinn`, 112 Eesti Maaülikool → `emu-tartu`, 60 Eesti Muusika- ja Teatriakadeemia → `eamt-tallinn`, 75 Estonian Business School → `ebs-tallinn`.

## Filtered out (counts from the run)

- 7,454 records that are not higher-education curricula (vocational, general, hobby education);
- 693 higher-education curricula at other levels (master, doctorate, residency, old pre-2002 diploma and bachelor levels);
- 96 first-cycle or integrated curricula not open for admission ("Vastuvõtt lõppenud, õppimine lubatud" or "Vastuvõttu ei toimu, õppimine keelatud");
- doubtful rows (team rule: drop anything unclear): none of the 301 kept curricula lacked a name, field of study, language or institution, so no row was dropped for that;
  doubtful fields were left out instead (7 county/abroad places, home-page and non-link urls).

## Known limits

- One curriculum is one programme in EHIS; several curricula share a name at one institution (for example "Õigusteadus", "Informaatika") — different codes, often one in Estonian and one in English or at another college. They are kept as separate rows.
- Places of study are what the institution registered in EHIS; for 30 curricula EHIS gives none (or only a county), and the seat is used — the programme may be taught elsewhere.
- Eesti Lennuakadeemia's seat is "Kambja vald" (village of Reola, near Tartu) as EHIS gives it.
- One joint curriculum (Mainor with Vilnius Kollegija and Porto) is listed under its Estonian institution only.
- 6% of rows have no app domain (interdisciplinary ISCED codes ending in 88 and "not elsewhere classified" codes).
- Includes private theological seminaries and the state academies (Sisekaitseakadeemia, Kaitseväe Akadeemia), which offer professional higher education.
