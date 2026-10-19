# Sweden (SE) catalogue

Result: BUILT. `node scripts/data/validate.mjs se` prints VALID (38 institutions, 1,725 programme rows, 84 cities, 10 institutions with a sheet, 398 rows = 23% without an app domain).
This replaces the earlier "NOT POSSIBLE" note: the Europass data has no university programmes, but Skolverket's Susa-navet API carries the full higher-education offer from UHR.

## Source

- Susa-navet open API (Skolverket; higher-education data delivered by UHR, Universitets- och högskolerådet), EMIL 3 JSON:
  `https://api.skolverket.se/susa-navet/emil3` — endpoints `educationProviders`, `educationInfos`, `educationEvents`, each with `schoolType=HS&size=2000&page=N` (all pages).
  OpenAPI description: https://api.skolverket.se/susa-navet/swagger-ui/index.html. Landing page: https://www.skolverket.se/om-skolverket/oppna-data/api-for-utbildningstillfallen-susa-navet
- Municipality names for the `areaCode` (kommunkod) of each study location: SCB statistical database, region list of table BE0101A/BefolkningNy,
  `https://api.scb.se/OV0104/v1/doris/sv/ssd/BE/BE0101/BE0101A/BefolkningNy` (only the code → name list is used).
- Downloaded on 2026-10-19: 49 providers, 60,811 education infos, 60,823 education events.

## Licence and attribution

- dataportal.se lists the dataset "Utbildningar i Sverige, Susa-navet" (publisher organisation SE2021004185 = UHR) with licence
  `http://creativecommons.org/publicdomain/zero/1.0/` (CC0 1.0). Metadata record: https://editera.dataportal.se/store/162/resource/20
  (read through `https://admin.dataportal.se/store/search?type=solr&query=title:susa*` on 2026-10-19).
- The Skolverket landing page above says "Villkor för användning: Villkoren i Skolverkets källicens (Creative Commons)" and links to the CC0 1.0 deed (https://creativecommons.org/publicdomain/zero/1.0/deed.sv).
- SCB states that its open data is under CC0 (https://www.scb.se/vara-tjanster/oppna-data/); only municipality names are taken.
- CC0 needs no attribution; we still credit: "Susa-navet (Skolverket, data från UHR), CC0 1.0; date adaptate de FindMyUni".

## Steps

`node scripts/data/se/build.mjs <raw folder>` downloads every page into the folder when missing (no packages needed), then:

1. Programme level: keep an education info when status is ACTIVE, `configuration` is `program` (not `kurs` or `kurspaket`), `educationLevels` contains `grund`
   (first cycle) or `grundavancerad` (integrated programmes spanning both cycles, entered from upper secondary school: civilingenjör 300 hp, läkare, tandläkare,
   apotekare, psykolog, jurist, arkitekt, ämneslärare, civilekonom...), `resultIsDegree` is true with a degree other than "Ingen examen", and credits are given in hp and are at least 120.
   Second-cycle (`avancerad`) and preparatory (`förutbildning`) programmes are out.
2. Out by title: "senare del (av program)" (later-part entries for students already in the programme), "kompletterande (pedagogisk) utbildning"/"KPU",
   "kompletteringsutbildning", "vidareutbildning", exchange studies, basår/bastermin, behörighetsgivande. These need an earlier degree or are not a programme start.
3. Currently offered: the info must not be expired (expires ≥ 2026-10-19) and must have at least one event that (a) is not marked cancelled (`isCancelled: true`; a missing flag counts as not cancelled),
   (b) starts on or after 2026-08-01 (autumn 2026 intake or later), (c) is visible to Swedish or international applicants (`applicationDetails`), and
   (d) is not funded as further training for people who already hold a degree (formOfFunding VAL, ULV, UKU, KPL).
4. Provider: the event's single provider must be a higher-education institution (`p.uoh.*`). Polisutbildningen (providers `p.pu.e3.*`, run for the Police at five universities) is left out because
   its provider records do not identify the university records with certainty.
5. City: the municipality of the event's study location (`locations[0].areaCode`, a 4-digit kommunkod) named through the SCB list (for example 1480 → Göteborg, 0126 → Huddinge, 0980 → Gotland).
   Events without exactly one location with a known code are dropped (2 events).
6. Language: the event's `languageOfInstructions` (swe → suedeză, eng → engleză; several joined). Events without a language are dropped.
7. Form: "distance" when the study location says Distans/Ortsoberoende, else "full-time" at 100% pace and "part-time" below 100%; left out when the merged events disagree.
8. Rows: events are merged into one row per institution + Swedish title (English title when there is no Swedish one) + credits + city (the same programme in several admission rounds is one row).
   Duplicates of one programme are then resolved (see "Duplicates resolved" below).
   `url` = the programme page from the event; `credits` = hp (equal to ECTS). `years` is not filled (the source gives credits, not a duration).
9. `domain` = the degree(s) the programme leads to, as the source writes them (for example "Kandidatexamen; Sjuksköterskeexamen"); the source's subject field
   (`UH_Subject` codes such as "400", "437") comes without labels and no official code list was found, so it is not used.
   `domainId`: first from the professional degree (Läkarexamen → medicina, Tandläkarexamen → medicina-dentara, Apotekar/Receptarie → farmacie, Veterinär/Djursjukskötare → medicina-veterinara,
   Sjuksköterske/Röntgensjuksköterske/Biomedicinsk analytiker/Audionom/Optiker → asistenta-medicala, Fysioterapeut → sport-kinetoterapie, Psykolog → psihologie, Jurist → drept,
   Socionom → sociologie-asistenta-sociala, (Landskaps)arkitekt → arhitectura, all teacher degrees → stiintele-educatiei, Civilekonom → business-management,
   Agronom/Hortonom/Jägmästare/Skogsmästare/Lantmästare/Trädgårds- and Landskapsingenjör/Hippolog → agronomie-silvicultura, Sjökapten/Sjöingenjör → marina-transporturi,
   Officer → militar-politie), otherwise from careful keywords in the title (see `TITLE_RULES` in build.mjs). Dietist, arbetsterapeut, logoped, tandhygienist, tandtekniker,
   ortopedingenjör, brandingenjör, sjukhusfysiker and studie- och yrkesvägledare degrees stay `null` (no clearly fitting app domain), as do titles no rule matches (for example
   "Industriell ekonomi", "Civilingenjör i AI och maskininlärning", "Kognitionsvetenskap").
10. Institutions: name and website from the provider record; seat = provider visit-address town (capitals tidied, "GÖTEBORG" → "Göteborg"). Södertörns högskola's record has a phone number
    in the town field, so its seat is the municipality where most of its rows are taught (Huddinge). `kind` is "unknown" for all: the provider field `responsibleBody.type` says "statlig"
    even for private foundations (Handelshögskolan, Jönköping University, Beckmans), so it is not reliable.
11. Sheets (`apps/web/data/universities-abroad.json`, country "Suedia"), matched by provider id: p.uoh.lu → lund, p.uoh.kth → kth, p.uoh.uu → uppsala, p.uoh.su → stockholm-university,
    p.uoh.cth → chalmers, p.uoh.gu → gothenburg, p.uoh.liu → linkoping-university, p.uoh.umu → umea-university, p.uoh.mau → malmo-university, p.uoh.kau → karlstad-university.

## Filtered out (counts from the run of 2026-10-19)

Of 60,811 education infos: 50,998 courses or course packages; 4,779 programmes at second-cycle or preparatory level; 197 programmes without a degree; 658 under 120 hp or without hp
(mostly KPU and complementary programmes); 554 later-part / complementary / further-training / exchange entries by title; 800 without a current event open to applicants
(older admission rounds or programmes not offered from autumn 2026). Among the events of the remaining programmes, Polisutbildningen (police providers) and 2 events without a
municipality code were dropped. Resolving duplicates took the rows from 1,747 to 1,725. 1,725 rows remain (637 above 180 hp, 32 at 120 hp).

## Duplicates resolved

Checked by grouping the rows on institution + the source's programme code (`content.code`) + city (run with `DUPCHECK=1` to print the groups).
All merged pairs share the same programme code, so no row was dropped for being a different, possibly closed programme.

- Admission-round markers removed from titles, so national and international rounds of one programme become one row: "(Internationell antagningsomgång)",
  "(nationell/internationell antagningsomgång)", "första/andra antagningsomgången", ", internationella studenter", ", EU/EES-studenter". Examples: Karlstads universitet "Digitala medier och analys",
  "Globala perspektiv på genus, mänskliga rättigheter och social rättvisa", "Artificiell intelligens - Kandidatprogram i datavetenskap"; Karolinska institutet "Kandidatprogrammet i biomedicin"
  (3 titles → 1); Linköpings universitet "Kandidatprogrammet i Experimentell och industriell biomedicin"; Luleå tekniska universitet "Datorspelsutveckling och programmering kandidat",
  "Datorgrafik för spel och film kandidat", "Hållbar mineralutvinning kandidat" (3 titles → 1 each; punctuation is ignored when comparing); SLU "Trädgårdsingenjörsprogrammet - odling" (two dash characters).
- A title that repeats itself ("X - X") is shortened to "X": Umeå universitet "Kandidatprogrammet i Life Science - Kandidatprogrammet i Life Science" merged with "Kandidatprogrammet i Life Science".
- Same programme under an English and a Swedish title (same code, credits and city, same English title, one of the two "Swedish" titles is the English title and has no å/ä/ö); kept under the Swedish title:
  Handelshögskolan i Stockholm "Bachelor of Science Program in Business and Economics" into "Kandidatprogrammet i Business and Economics"; Malmö universitet "Interaction Design" into
  "Interaktionsdesign", and "Peace and Conflict Studies", "International Migration and Ethnic Relations", "International Relations", "Human Rights" into the same titles ending
  ", Bachelor's Programme".
- Same title with two programme codes, each with its own current open intake in the source, already one row (kept): Högskolan i Borås "Kandidatprogram i IT och ekonomi" (GITEK, KITEP),
  Högskolan Dalarna "Grundlärarprogrammet förskoleklass och grundskolans årskurs 1-3" (LLF3A, LLL3A) and "... årskurs 4-6" (LLL6A, LLP6A), Högskolan i Gävle "Ekonomprogrammet" (SGEKK, SGENK),
  Jönköping University "Socionomprogrammet" (HGSO9, HGSXY), Högskolan Kristianstad "Bachelor Programme in Software Development" (TBSE3, TBSE4), Linnéuniversitetet "Internationella affärer"
  (EGIBP, EGINB) and "Sjöingenjör" (YGSIJ, YGSIP).
- Kept as separate rows, because the source shows them as different choices under one code: study tracks (inriktning/ingång/förstaämne, for example teacher-programme subjects or Lund's
  "Naturvetenskapligt kandidatprogram" tracks) and campus versus distance versions (Luleå "Systemvetenskap, kandidat (Normal, Luleå)" and "(IT-distans)"; Mälardalens universitet
  "Personalvetarprogrammet" and "- distans"; Umeå "Studie- och yrkesvägledarprogrammet" and "- distans med campusträffar"). Blekinge tekniska högskola "Datavetenskap för spelutveckling" stays twice:
  120 hp leading to Högskoleexamen and 180 hp leading to Kandidatexamen are different degrees with different codes.
- Correction of the first report: there was no Läkarprogrammet at 300 hp. The 300 hp rows at Göteborg, Umeå and Karolinska are Tandläkarprogrammet (a text search for "läkarprogram" also matched
  "Tandläkarprogrammet"). Each of the three has one Läkarprogrammet row at 360 hp.

## Known limits

- Institutions with no row: Stockholms konstnärliga högskola (its programme events in the data start in 2024–2025, none from autumn 2026), Brunnsviks Enskilda Musikhögskola,
  Johannelunds teologiska högskola, Newmaninstitutet, Sankt Ignatios högskola, Högskolan Sapu (no first-cycle degree programme passing the filters).
- No faculty (the event's `department` is only an internal code), no capacity, no duration in years.
- City is the municipality, not the campus (Lund's Helsingborg campus shows as Helsingborg; Alnarp shows as Lomma).
- About 23% of rows have no app domain; keyword mapping is conservative.
