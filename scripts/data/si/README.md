# Slovenia catalogue (cc = si)

Builds `apps/web/data/catalog/si-institutions.json` and `si-programs.json`: one row per first-cycle or integrated long programme that is **in the official call for enrolment 2026/2027**, per town where the call says it is taught.

## Sources

1. **eVŠ "Razvid visokošolskih zavodov in študijskih programov"** (the national register of higher-education institutions and study programmes, Ministry of Higher Education, Science and Innovation), public SOAP web service `https://portal-sola.evs.gov.si/ws/razvid/1.0` (operations `PridobiZavode`, `PridobiPrograme`; no key, only a sender name, a time stamp and a purpose in the request). Listed on the national open-data portal as "Šifrant študijskih programov": https://podatki.gov.si/dataset/sifrant-studijskih-programov
   - Licence: **CC BY 4.0** ("Priznanje avtorstva", reuse with the source named).
   - Attribution: "Vir: eVŠ – Razvid visokošolskih zavodov in študijskih programov, Ministrstvo za visoko šolstvo, znanost in inovacije (podatki.gov.si), CC BY 4.0; data adapted by FindMyUni."
   - Gives: programme names (Slovenian and English), type, one/two-subject flag, ISCED-F codes, duration, ECTS, teaching languages, institutions (with the carrier, `nosilec`) and places of delivery.
2. **"Razpis za vpis v dodiplomske in enovite magistrske študijske programe v študijskem letu 2026/2027"** (the joint call for enrolment, published by the same ministry): https://www.gov.si/zbirke/javne-objave/razpis-za-vpis-v-dodiplomske-in-enovite-magistrske-studijske-programe-v-studijskem-letu-2026-2027/
   - the eight tables of first-year places `Vpisna-mesta/<name>.xlsx` (Univerza v Ljubljani, v Mariboru, na Primorskem, v Novi Gorici, v Novem mestu, Nova univerza, Univerza Alma Mater Europaea, "Koncesije – javni in koncesionirani samostojni visokošolski zavodi"): institution abbreviation, programme, town (`KRAJ`), type, language (`JEZIK`), one/two-subject (`DVOPR.`);
   - the list "Razpisi za vpis v visokošolske študijske programe v študijskem letu 2026/2027" (31 pages, `?start=0…300`), which also covers the private institutions without a concession: institution, cycle, programmes with type (UN/VS/EMAG), funding (javno / koncesionirano / zasebno);
   - the notice "Obvestilo o neizvajanju študijskih programov" of 22 Sep 2026 (`Neizvajanje-SP-22.-9.-2026.docx`), read by hand; its two language variants are a table in `build.mjs` (`NOT_RUN`).
   - This is a public notice of a ministry; no reuse licence is printed on it. Only facts are taken from it (which programmes are offered, where, in which language, how they are funded).
- Downloaded: **2026-10-19** (register: programme versions valid in study year 2026/2027, plus all institution records).

## Rebuild

```
node scripts/data/si/build.mjs <raw folder>     # downloads what is missing into the folder, then builds
node scripts/data/validate.mjs si               # must print VALID
```

Node 24 built-ins only. The folder gets `evs-Zavode.xml`, `evs-Programe-2026-2027.xml`, `razpis/<table>.xlsx` and `list/p<start>.html`. `REPORT=1` prints every call row that was dropped, the register records not in the call and the programmes that have several register records. For the next year change `STUDY_YEAR`, the two gov.si addresses and `NOT_RUN`.

## Which programmes are current (the rule)

The register alone cannot say it. Asked for study year 2026/2027 it returns 410 first-cycle and integrated programmes with no end year, but:
- 254 of them carry an accreditation end date (`prog_konec_velj`) in the past, including programmes that the 2026/27 call offers (for example UL "Računalništvo in matematika", end date 2024-09-30), so this date cannot be used to decide;
- the register's own flag `prog_razpis` (D on 115) does not match the call either;
- it still holds superseded records of re-registered programmes (two or three numbers for one programme) and even test records ("kren", "Biologija – nova za test", "Kulturna dediščina TEST FHŠ", "Predmetni učitelj (test)", "Polonistika – nova šifra").

**Rule used: a programme is kept only when it is in the official call for enrolment 2026/2027.** Every row of the call (tables and list) is matched to the register by institution + exact programme name (case, dashes and punctuation ignored) + type (UN = univerzitetni, VS = visokošolski strokovni, EMAG = enoviti magistrski). When several register records match, the call's one/two-subject flag and then the carrier institution (`nosilec`) decide; when still several (same programme, same institution, re-registered under a new number: 7 cases, for example UL ZF "Babištvo", UL PEF "Socialna pedagogika", UP FVZ "Fizioterapija"), the programme is kept once and a field (ISCED-F, ECTS, years) is filled only when all those records agree. Register programmes that are not in the call are left out (85 records, among them the superseded and test records above, two-subject variants not offered, and programmes no longer enrolling such as several UL FDV four-year versions).

Levels kept: register type 01 univerzitetni and 02 visokošolski strokovni (first cycle) and 03 enoviti magistrski (integrated long programmes: medicine, dental medicine, pharmacy, veterinary medicine, architecture, law at UL, teacher education); second-cycle masters and doctorates are not in the call's first-cycle part and not in these types.

## Dropped because unclear (as required: doubtful rows are left out)

Call programmes not taken (31 distinct names), with the reason:
- **No register programme with that name at that institution** (the call uses a new name or a programme the register does not show yet): UL BF Biologija (the register has only "Biologija – nova za test"), UL FGG Geodetsko inženirstvo in upravljanje nepremičnin, UL FMF Aplikativna matematika, UL FF Hispanistika, UL TEOF Človek in medosebni odnosi, UM FF Prevajalske študije (the register has three language variants), UM PEF Razredni pouk (EMAG), UP FHŠ Kulturna dediščina (only a test record), UP FAMNIT Agronomija, Inovacije v lesarstvu za trajnostni razvoj and Matematika in računalništvo, UNG FH Jezik in literatura v digitalnem svetu, AMEU ISH Humanistični študiji (the register record has no institution), AMEU ECM "Zdravstvena nega (izvedba v nemščini)" (the table says language SLO), B2 Poslovna analitika, FKPV Poslovne vede I, DOBA Informatika in menedžment, Marketing in digitalno komuniciranje, Menedžment and Uporabna psihologija, FZAB Delovna terapija, GEA College Podjetništvo in management, ERUDIO Gerokineziologija, B&B "Visoka šola za trajnostni razvoj" Trajnostno upravljanje okolja.
- **Institution not in the register under the call's name** (probably renamed, not confirmed): Fakulteta za varstvo okolja (register: Visoka šola za varstvo okolja), Fakulteta za pravo in ekonomijo (register: Fakulteta za pravo in poslovne vede), NOA visoka šola (register has the same programme at Visoka šola za transport in logistiko), Visoka šola za management Bled (register: Visoka šola za hotelirstvo in turizem Bled), Visoka strokovna šola za oblikovanje materialov Sežana.
- **Not running in 2026/27** per the notice of 22 Sep 2026: FIŠ "Poslovanje v informacijski družbi" (the only row in the call is Slovenian, and the Slovenian version will not run). The English row of UM FOV "Krizni management" is removed the same way (the Slovenian one stays). The other three items of the notice are part-time variants, which do not make separate rows here.

## How rows and fields are made

- **Institution** = the university for faculties and academies of a university (UL, UM, UP, UNG, UNM, Nova univerza, AMEU), otherwise the independent higher-education institution; `officialName` and website from the register, `city` = the register's seat (`sedez`). The faculty goes in `faculty` (joint programmes of several faculties list them all). Exceptions, both stated by the official sources: MLC Fakulteta za management in pravo is counted under **B2 Visoka šola za poslovne vede**, because the register's own name says "od 2. 6. 2025 pripojen k B2" and the call lists the programme under B2; **Fakulteta za informacijske študije v Novem mestu** is its own institution, as in the call (the register still names Univerza v Novem mestu as its university).
- `kind`: `public` when the call's list shows at least one of its programmes as "javno" funded; otherwise `private` ("koncesionirano" = private with a state concession, or "zasebno"); `unknown` would be used for an institution absent from the list (none in this build).
- Four institutions reuse app sheets (`hasSheet: true`): Univerza v Ljubljani → `uni-ljubljana`, Univerza v Mariboru → `uni-maribor`, Univerza na Primorskem → `uni-primorska`, Univerza v Novi Gorici → `uni-nova-gorica`. No other Slovenian sheet exists.
- **City and language**: from the call's tables, one row per town (`KRAJ`); "Koper; Izola (delno)" (partly in Izola) gives Koper, "Krško in/ali Velenje" gives both towns; "Na daljavo" gives `form: "distance"` with the institution's seat as city. Language = the table's `JEZIK` values for that town (SLO → slovenă, ANG → engleză, NEM → germană, ITA → italiană, HRV → croată, SRB → sârbă, ALB → albaneză), Slovenian first. For programmes only in the call's list (private institutions without a concession) the city is the register's single place of delivery of that institution, or its seat when the register lists several, and the language is the register's teaching-language field (`prog_ucni_jezik`, the languages the programme is accredited to be taught in).
- `name` = register name (Slovenian; the English name is only in `search`). `status` = programme type in the register's words (univerzitetni / visokošolski strokovni / enoviti magistrski). `credits` (ECTS) and `years` from the register. `form` only for distance study; full-time/part-time is not separated (the call offers both for many programmes). No `maxStudents` (the tables split places by group and some cells are not numbers), no programme `url`.
- **Domain**: `domain` = "ISCED-F" + the register's main ISCED-F 2013 code(s); `domainId` = `iscedToDomain`; a "not further defined" code (xxx0) takes the app domain only when every detailed code of that narrow field maps to the same one (for example 0230 → litere-limbi-straine). Interdisciplinary codes (xx88, for example 0488, 0888, 0788), codes with several app domains (0610, 0410, 0210) or several main codes with different domains give `null`. No keyword guessing.

## Counts (build of 2026-10-19)

- Register: 1,024 programme versions valid in 2026/2027, 410 of them first cycle or integrated (244 univerzitetni, 152 visokošolski strokovni, 14 enoviti magistrski).
- Call: 384 table rows and 339 programme entries of the list (first cycle).
- **Programmes kept: 316** (from 324 register records; 7 with several records), **333 rows** (188 univerzitetni, 132 visokošolski strokovni, 13 enoviti magistrski) in 22 towns.
- **Institutions: 33**, 4 with an app sheet (266 rows, 80%); 5 public, 28 private. One row is distance study.
- Without an app domain: **86 rows (26%)**, mostly interdisciplinary ISCED-F codes. Language: 311 slovenă, 20 several languages, 1 engleză only.

## Known limits

- A programme the call lists under a new name, or at a renamed institution, is missing until the register uses the same name (see the list above; about 31 programmes, roughly 9% of the call).
- Languages and towns of the private institutions without a concession come from the register, not from the call; the register's language field lists the languages the programme may be taught in.
- Two-subject programmes are one row; the call does not list the subject combinations.
- Matching uses exact names; it was checked by reading the report (`REPORT=1`), not against the call's PDF documents.
