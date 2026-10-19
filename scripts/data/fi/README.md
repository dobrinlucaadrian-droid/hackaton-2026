# Finland (FI) catalogue

Result: BUILT. `node scripts/data/validate.mjs fi` prints VALID (36 institutions, 1,118 programme rows, 47 towns, 10 institutions with an app sheet, 351 rows = 31% without an app domain).

## Source

- Europass "Learning Opportunities and Qualifications" open data (QDR, European Learning Model), Finnish country dataset. The records are the study offers of
  Opintopolku / Studyinfo, published by the Finnish National Agency for Education (Opetushallitus).
  Catalogue entry: https://data.europa.eu/data/datasets/european-learning-data (publisher: European Commission DG EMPL). DCAT catalogue: https://europa.eu/europass/qdr/open-data/dcat
  File: `https://europa.eu/europass/qdr/open-data/dcat/download?url=http://data.europa.eu/snb/data/downloadable/country/fin/ttl/fin-ttl_1.zip` (Turtle, 31 MB zip, 22 files dated 2026-10-18).
- Downloaded on 2026-10-19. Every field in the output comes from this file, except the seat (town) of three universities whose own records in the file have no town,
  taken from the institution's official website (checked 2026-10-19, written in the script as `OFFICIAL_SEAT`):
  - Helsingin yliopisto: Helsinki — https://www.helsinki.fi/en ("The University operates on four campuses in Helsinki and in ten other locations.");
  - Turun yliopisto: Turku — https://www.utu.fi/en (organisation address on the page: addressLocality "Turku", postal code 20014);
  - Aalto-yliopisto: Espoo — https://www.aalto.fi/en/campus ("Aalto University's campus in Otaniemi, Espoo").
  No other register or website is used (an earlier version read the Opintopolku organisation register; it was removed because no licence for it was found).

## Licence and attribution

- data.europa.eu lists the distributions under "European Commission reuse notice" (Commission Decision 2011/833/EU). The Commission legal notice
  (https://commission.europa.eu/legal-notice_en) licenses EU-owned content under CC BY 4.0, reuse allowed with credit and an indication of changes.
- Attribution to use: "Europass Qualifications Dataset Register (European Commission), Finnish data from Opintopolku / Finnish National Agency for Education, retrieved 2026-10-19; date adaptate de FindMyUni."
- Caveat: the records are third-party national data republished by the Commission; no separate licence text of the Finnish agency was found for the Europass copy.

## Steps

1. `node scripts/data/fi/build.mjs <raw folder>` (downloads and unpacks the zip when missing; no packages, no other downloads).
2. Keep a `LearningOpportunity` (one application offer on Opintopolku) only when all of these hold:
   - status "released";
   - its providers belong to exactly one Finnish university or university of applied sciences (list in the script: 13 universities, 23 UAS, Högskolan på Åland,
     Poliisiammattikorkeakoulu; matched on the provider name, which is the institution name or "institution, unit"). Summer universities, folk high schools,
     vocational colleges, upper-secondary schools and other providers are out;
   - the degree (the linked `LearningAchievementSpecification`) is a bachelor degree. The source has no EQF level, so this is read from the degree title it gives in Finnish, Swedish or English:
     at a UAS "… (AMK)" / "… (YH)" / "Bachelor of …", never "ylempi AMK", "högre YH", "Master" or "maisteri";
     at a university "kandidaatti" / "kandidat" / "Bachelor", "oikeusnotaari" / "rättsnotarie" (bachelor of law) or "Farmaseutti" / "Farmaceut" (bachelor of pharmacy),
     and no title of the degree that names only a master or doctoral degree. Most Finnish university places are a bachelor and a master admitted together
     ("kandidaatti ja maisteri (3 v + 2 v)"); they are kept, because the student enters at bachelor level. Medicine, dentistry and veterinary medicine
     ("Lääketiede / Hammaslääketiede / Eläinlääketiede, kandidaatti ja lisensiaatti") are kept as long first degrees;
   - the offer is an entry into the degree: titles or provider units with open university / open UAS, path studies (polkuopinnot), start studies (starttiopinnot),
     separate or supplementary studies, conversion training (muuntokoulutus), top-up degrees, routes for people who completed cooperation studies, qualification routes for
     nurses trained abroad (SAILA, laillistumisväylä), preparatory courses, continuous learning, specialisation training or transfer admission (siirtohaku) are left out;
   - its own start date, when the record has one, is not before 2026 (older intakes that are still published are not taken as proof that the programme runs now).
3. Programme name = the degree title in the teaching language (Finnish title when the record has none in that language). When that title is really the title of one
   application offer (it names the application round, intake, study mode or campus: "haku", "Application", "opinnot alkaa", "syksyn 2026", "toteutus", "verkko-opinnot",
   "blended", "monimuoto", "på Campus"), a clean bachelor title of the same degree record in another language is used; when there is none, the offer is left out (list below).
4. Town: the postal town in the address of the provider unit (faculty or campus). When the file writes one postcode with two names (Finnish and Swedish, "65100 Vaasa" /
   "65100 Vasa"), the name it uses most often for that postcode is written. A university post-office name ("40014 Jyväskylän yliopisto"), "University of Helsinki",
   "FI-00076 AALTO" or "Ei tiedossa" is not a town. A unit with no town gets the institution's seat (the contract allows it), but only when the unit is the institution itself
   or a plain "institution, faculty" unit; the seat is the town in the address of the institution's own record in the file, or for the three universities above their official
   website. 129 rows are placed this way. A unit that names a campus or another town, or whose institution has no clear seat, is left out (list below).
   An offer taught on several campuses gives one row per town. An online campus ("Verkkokampus", "Online kampus") is used only when it is the offer's only unit.
5. One row per institution + programme name + town + teaching language: several application offers of the same programme (spring and autumn intake, joint and separate
   application, day and blended study) are merged (1,743 offers became 1,118 rows).
6. Other fields: language = the record's default language (FIN finlandeză, SWE suedeză, ENG engleză); faculty = the unit after the institution name, only at universities,
   only when it names a faculty, school, department or academy and all merged offers agree; domain = "ISCED-F" + every 4-digit code of the degree; domainId = the app domain
   when all its codes that are not interdisciplinary ("…88") map to one domain with `iscedToDomain`, else null; years = the planned duration only for a bachelor-only degree and
   only when all merged offers give the same one (left out for bachelor + master / licentiate programmes, whose duration covers both degrees); url = the Opintopolku page of
   one of the merged offers (the first by record id); institution city = its seat as in step 4; kind = "unknown" (the source does not say).
7. Check of the language field: for 80 random rows the public Opintopolku page of the offer was read (not used in the output): the teaching language matched in 80 of 80,
   every offer was published, and every degree code was bachelor level (6…) or, for the combined programmes, master/licentiate level (7…).

## Filtered out (counts from the run)

20,167 records: 5,579 not released, 7,553 not at one university or UAS, 5,172 not a bachelor-level degree (master, ylempi AMK, doctoral, specialist, vocational,
open-university and other courses), 76 offers that are not an entry into the degree, 30 offers whose start date is before 2026, 17 offers named only by an application-offer
title, 66 offers with no clear town. 1,743 offers remain, merged into 1,118 rows (696 at UAS, 422 at universities, of which 401 bachelor + master or licentiate).

Offer titles left out (no clean programme name in the same record):
- Laurea-ammattikorkeakoulu: "Bachelor of Health Care, Nursing, Laurea UAS, International Separate Application 1", "Bachelor of Health Care, Nursing, Laurea UAS International
  Separate application", "Bachelor of Business Administration (BBA), Business Management, International Separate Application, Laurea UAS";
- Lapin ammattikorkeakoulu: "Joustava haku, Lapin AMK, Sairaanhoitaja, (AMK), Kemi ja Rovaniemi, opinnot alkaa keväällä 2027", "Sairaanhoitaja (AMK), Rovaniemi, syksyn 2026 yhteishaku";
- Hämeen ammattikorkeakoulu: "Artenomi (AMK), Digitaalisten ratkaisujen muotoilu, verkko-opinnot";
- Högskolan på Åland: "Sjukskötare (YH), Åland - på Campus", "Tradenom (YH), Företagsekonomi, Åland på Campus";
- Metropolia Ammattikorkeakoulu: "Bachelor of Social Services and Health Care, Biomedical Laboratory Science, blended studies, Metropolia University of Applied Sciences";
- Turun ammattikorkeakoulu: "Insinööri (AMK), kemiantekniikka, monimuotototeutus".

Provider units left out because no town is clear (their offers are dropped unless another unit of the same offer has a town):
- Jyväskylän yliopisto: Humanistis-yhteiskuntatieteellinen tiedekunta, Jyväskylän yliopiston kauppakorkeakoulu (JSBE), Informaatioteknologian tiedekunta
  (the file and the university's contact pages give only the post-office name "40014 Jyväskylän yliopisto");
- Itä-Suomen yliopisto: Luonnontieteiden, metsätieteiden ja tekniikan tiedekunta without a campus (the university has campuses in Joensuu and Kuopio);
- units that name another place but have no address: Tampereen yliopisto, Yhteiskuntatieteiden tiedekunta, Pori; Turun yliopisto, Kasvatustieteiden tiedekunta, Rauma;
  Turun yliopisto, Humanistinen tiedekunta, Pori; Savonia-ammattikorkeakoulu, Iisalmen kampus ("00000 Ei tiedossa");
- Helsingin yliopisto, Svenska social- och kommunalhögskolan vid Helsingfors universitet (no address, and not named as a faculty).

## Known limits

- Rows are named after the degree title, which at a UAS is the degree and the field ("Insinööri (AMK), tieto- ja viestintätekniikka"), not always the programme's marketing name;
  some English titles end with the institution's name ("…, Metropolia University of Applied Sciences"), as in the source.
- The same degree taught in Finnish and English at the same town is two rows (one per language).
- No ECTS, study form, capacity or public/private flag is used: `kind` is "unknown", no `credits`/`form`/`maxStudents`.
- 31% of rows have no app domain: most have only an interdisciplinary ISCED code (0688 ICT, 0488 business, 0788 engineering, 0288 arts) or codes of two different domains.
- City is the postal town of the provider unit (or the institution's seat, step 4); a programme taught on a campus that the record does not list as a unit is not shown there.
  Some towns appear under the Swedish postal name the file uses for them (for example "Ekenäs", "Mariehamn").
- Jyväskylä university offers of the three faculties above are missing (no clear town); the University of Jyväskylä still has 25 rows from its other faculties.
- The National Defence University (Maanpuolustuskorkeakoulu) and the Police University College (Poliisiammattikorkeakoulu) have no provider record in the file and are missing.
- The file is the set of offers published on Opintopolku at export time; programmes with no open or upcoming application round may be missing.
