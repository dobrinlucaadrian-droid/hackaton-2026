# Greece (GR) catalogue

Result: BUILT. `node scripts/data/validate.mjs gr` prints VALID (20 institutions, 326 programme rows, 47 towns, 7 institutions with an existing sheet, 87 rows = 27% without an app domain). Four institutions are left out because their seat could not be confirmed (step 12).

One row = one university department (τμήμα) with its own admission code in the 2025 Panhellenic exams. In Greece a department is one first-cycle study programme;
all first-cycle places of the public universities are filled through these exams, so the admission file is the list of programmes offered in the latest admission.

## Sources

1. **Admission file 2025** (main source: which departments exist, their codes, institution and town).
   Ministry of Education, Religious Affairs and Sports (Υπουργείο Παιδείας, Θρησκευμάτων και Αθλητισμού), dataset
   "Αρχείο Βάσεων Εισαγωγής κατηγοριών ΓΕΛ & ΕΠΑΛ στην Τριτοβάθμια Εκπαίδευση στις Πανελλαδικές Εξετάσεις 2025":
   https://data.gov.gr/dataset/vaseis-eisagogis-gel-epal-tritovathmia-panelladikes-2025 — file `6_vaseis_gel_epal_2025.xlsx`
   (https://data.gov.gr/dataset/7b0af060-b1d7-4a05-8c0a-521c25430ca0/resource/0cc43d37-c2e3-4995-af77-7f27f5bc30c2/download/6_vaseis_gel_epal_2025.xlsx, resource created 2026-04-28).
   Only the columns ΙΔΡΥΜΑ, ΚΩΔΙΚΟΣ ΣΧΟΛΗΣ and ΣΧΟΛΗ are read. **Admission scores (ΜΟΡΙΑ), places and successful candidates are not read and not written anywhere.**
2. **Ministry list of AEI departments** (full institution names, school, semesters, department website).
   Same ministry, dataset "Κατάλογος καταγραφής εκπαιδευτικών ιδρυμάτων της χώρας: ΑΕΙ και Εκκλησιαστικών Ακαδημιών (Σχολή, Τμήμα, εξάμηνα φοίτησης, ταχ. και ηλεκτρονικές διευθύνσεις)":
   https://data.gov.gr/dataset/katalogos-katagrafis-ekpaideytikon-idrymaton-tis-choras-aei-kai-ekklisiastikon-akadimion-scholi-tmim — file `aei_aeaa-tmhmata-7.8.2025.xls`
   (https://data.gov.gr/dataset/82418b57-3254-44f0-8c69-b61ed67023d2/resource/4d20289a-870e-47b7-83e5-3e62fb101e8c/download/aei_aeaa-tmhmata-7.8.2025.xls).
- Downloaded on 2026-10-19 with plain HTTP requests (data.gov.gr CKAN API `package_show` for the metadata).
- Law 4957/2022 (ΦΕΚ Α' 141/21.07.2022), cited below for the AEI list, the legal status and foreign-language programmes; read from the gazette text republished at https://www.esos.gr/sites/default/files/articles-legacy/nomos_4957_2022.pdf.

## Licence and attribution

- Both files: the data.gov.gr resource metadata (CKAN API, field `license` and `rights` of each XLS/XLSX resource) states
  `http://publications.europa.eu/resource/authority/licence/CC_BY_4_0` and "Τα δεδομένα διατίθενται υπό την άδεια : Creative Commons Attribution 4.0 International".
  (The dataset-level `license_id` is empty; the licence is stated on the file resources.)
- Attribution to use: "Υπουργείο Παιδείας, Θρησκευμάτων και Αθλητισμού, data.gov.gr (CC BY 4.0): bazele de admitere 2025 și lista departamentelor AEI 7.8.2025; date adaptate de FindMyUni".
  Changes: only the department list is kept (no scores), names tidied as described below, fields joined from the second file.

## Steps

`node scripts/data/gr/build.mjs <raw folder>` (downloads both files into the folder when missing; no packages needed — the script has its own small XLSX and legacy XLS readers;
the XLS reader was checked cell by cell against an Excel re-save of the same file: identical apart from line endings and one phone number's float rounding).

1. Admission file: one entry per admission code (454 codes, 3,143 rows = code × candidate category; a code always has one name).
2. Dropped, not universities (65 codes): military academies and NCO schools (ΣΣΕ, ΣΙ, ΣΝΔ, ΣΣΑΣ, ΣΜΥ, ΣΜΥΑ, ΣΜΥΝ, ΣΑΝ: 26), police schools (ΑΣΤ. ΣΧΟΛΕΣ: 3),
   coast guard (Λ.Σ. - ΕΛ. ΑΚΤ.: 3), fire academy (Σ.Π.Α.: 3), merchant marine academy (Α.Ε.Ν.: 2), the ecclesiastical academies (Α.Ε.Α. ΑΘΗΝΑΣ, Π.Α.Ε.Α. ΚΡΗΤΗΣ: 2)
   and the higher schools of tourism education (Α.Σ.Τ.Ε., Rhodes and Crete: 2; not in the ministry's list of AEI).
   Kept: the 22 universities and polytechnics, the Ανώτατη Σχολή Καλών Τεχνών and the Ανώτατη Σχολή Παιδαγωγικής & Τεχνολογικής Εκπαίδευσης (ΑΣΠΑΙΤΕ), which Law 4957/2022 art. 3 par. 1 names among the AEI
   ("τα Πανεπιστήμια, τα Πολυτεχνεία, η Ανώτατη Σχολή Καλών Τεχνών και η Ανώτατη Σχολή Παιδαγωγικής…").
3. Institution: the abbreviation of the admission file (Α.Π.Θ., ΠΑΝ. ΔΥΤ. ΑΤΤΙΚΗΣ, …) is mapped to the full name as written in the ministry department list
   (column "Ονομασία Πανεπιστημίου"; the same 24 names, one with a Latin "KAI", are in the ministry's list of supervised bodies `epopteuomenoi_foreis_2024-.xlsx` on data.gov.gr). The mapping is checked by the
   department names: 387 of 413 departments are found under the mapped institution in the ministry list, and every institution has most of its departments found. The
   ministry list itself abbreviates three names (ΔΙ.ΠΑ.Ε, ΕΜΠ, ΠΑΔΑ); those are matched by their departments the same way.
4. Name and town: the department text is "NAME (TOWN)", sometimes with a direction after it ("… (ΗΡΑΚΛΕΙΟ) - ΜΑΘΗΜΑΤΙΚΩΝ"), an institution tag that only tells same-named
   departments apart (" - ΑΠΘ", " - ΕΚΠΑ", " - ΠΑΝ. ΠΑΤΡΩΝ", …) or a renaming note ("(Μετονομασία του Τμήματος …)"). Town = the first bracket; the renaming note and the
   institution tag are removed; a direction stays in the name. The 6 renamed departments appear under the new name only.
5. Join with the ministry department list: same institution and the same name after removing accents, brackets, a leading "ΤΜΗΜΑ" and writing "&" as "ΚΑΙ" (the town is
   used only when two departments of one institution have the same name — never needed). When exactly one department matches (387 rows) it gives `faculty` (column ΣΧΟΛΗ),
   `years` (ΕΞΑΜΗΝΑ ΦΟΙΤΗΣΗΣ / 2, only when written as a number of semesters: "8", "10 εξάμηνα", "ΟΚΤΩ (8)") and `url` (column WEB-SITE, "https://" added to "www…" values;
   for ΑΣΠΑΙΤΕ this is the institution's site). The other 26 rows keep only what the admission file gives (no faculty, years or url): names that differ between the two
   files (for example "ΕΠΙΣΤΗΜΗΣ ΦΥΣΙΚΗΣ ΑΓΩΓΗΣ ΚΑΙ ΑΘΛΗΤΙΣΜΟΥ, ΜΕ ΕΔΡΑ ΤΗ ΘΕΣΣΑΛΟΝΙΚΗ", "ΦΥΣΙΚΟΘΕΡΑΠΕΙΑ", typing errors in the list) or departments with two admission
   codes (directions) that the list has once. No department of the admission file is marked as abolished ("Καταργείται") in the list (the build stops if one is).
6. Domain: the sources have no field-of-study classification, so `domain` is "no field given in source" and `domainId` comes from careful whole-name keyword rules in the
   build script (for example ΙΑΤΡΙΚΗΣ → medicina, ΠΟΛΙΤΙΚΩΝ ΜΗΧΑΝΙΚΩΝ → inginerie-civila); interdisciplinary or unclear names (food science, dietetics, speech therapy,
   cultural technology, agricultural economics, …) get `null`.
7. Language: "nespecificată" for every row (the value used when the source has none). Neither ministry file has a language field, and no official text found states the
   teaching language of these departments (Law 4957/2022 art. 101 only makes foreign-language first-cycle programmes a separate category for foreign students; that is not
   a statement about the departments here), so the language is not set.
8. `kind`: "public" — Law 4957/2022 art. 3 par. 1: "Τα Α.Ε.Ι. είναι νομικά πρόσωπα δημοσίου δικαίου". No `form`, `credits`, `maxStudents` or `status` (not stated per programme;
   the admission places by candidate category are not summed into a capacity).
9. Existing sheets (`universities-abroad.json`, country "Grecia"; ΕΚΠΑ, ΕΜΠ and Κρήτης are currently left out, see step 12): ΕΚΠΑ → uoa-atena, ΑΠΘ → auth-salonic, ΕΜΠ → ntua-atena, ΟΠΑ → aueb-atena, Πανεπιστήμιο Κρήτης → uoc-heraklion
   (not the Πολυτεχνείο Κρήτης or the Ελληνικό Μεσογειακό Πανεπιστήμιο), Πατρών → upatras-patras, Θεσσαλίας → uth-volos, Δημοκρίτειο → duth-komotini, Ιωαννίνων → uoi-ioannina,
   Πειραιώς → unipi-pireu.
10. Search text: the Greek fields are transliterated to lower-case Latin letters (ELOT 743 style: θ → th, χ → ch, ψ → ps, ου → ou, η/ι/υ → i/i/y), plus the abbreviation.
11. Two codes, one department: rows with the same institution, name and town would be merged into one. The 2025 file has none (0 merges): every pair of codes of one
    department has a different direction in its name (ΑΣΠΑΙΤΕ 497/507, Πανεπιστήμιο Κρήτης 248/251, Πανεπιστήμιο Μακεδονίας 1211/1212), and ΑΠΘ 780
    "ΘΕΟΛΟΓΙΑΣ - ΜΟΥΣΟΥΛΜΑΝΙΚΩΝ ΣΠΟΥΔΩΝ" differs from 103 "ΘΕΟΛΟΓΙΑΣ"; these stay separate rows.
12. Institution `city` = seat, taken from an official source (checked 2026-10-19), written in capitals without accents like the programme towns:

    | Institution | City | Source |
    | --- | --- | --- |
    | ΑΝΩΤΑΤΗ ΣΧΟΛΗ ΚΑΛΩΝ ΤΕΧΝΩΝ | ΑΘΗΝΑ | https://www.asfa.gr/epikoinonia/ — "Κτίριο Διοίκησης: Πατησίων 42, Αθήνα, 106 82" |
    | ΑΣΠΑΙΤΕ | ΜΑΡΟΥΣΙ | https://www.aspete.gr/ (footer) — "ΑΣΠΑΙΤΕ, ΤΚ 15122 Μαρούσι" |
    | ΑΡΙΣΤΟΤΕΛΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΟΝΙΚΗΣ | ΘΕΣΣΑΛΟΝΙΚΗ | https://www.auth.gr/contact/ — "Πανεπιστημιούπολη, 54124 Θεσσαλονίκη" |
    | ΓΕΩΠΟΝΙΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΘΗΝΩΝ | ΑΘΗΝΑ | https://www2.aua.gr/el (footer) — "Ιερά Οδός 75, ΤΚ 11855, Αθήνα" |
    | ΔΗΜΟΚΡΙΤΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΡΑΚΗΣ | ΚΟΜΟΤΗΝΗ | https://duth.gr/contact/ — "Πανεπιστημιούπολη, Τ.Κ.69100 Κομοτηνή" |
    | ΔΙΕΘΝΕΣ ΠΑΝΕΠΙΣΤΗΜΙΟ ΤΗΣ ΕΛΛΑΔΟΣ | ΘΕΣΣΑΛΟΝΙΚΗ | Law 4610/2019 art. 1 par. 1 (ΦΕΚ Α' 70/2019, copy at https://www.uoc.gr/files/items/9/907/2019_n_4610.pdf): "με έδρα τη Θεσσαλονίκη" |
    | ΙΟΝΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ | ΚΕΡΚΥΡΑ | https://ionio.gr/ (footer) — "Ιωάννου Θεοτόκη 72, 49100 Κέρκυρα" |
    | ΟΙΚΟΝΟΜΙΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΘΗΝΩΝ | ΑΘΗΝΑ | https://www.aueb.gr/ (footer) — "Πατησίων 76 ΤΚ 104 34 Αθήνα" |
    | ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΙΓΑΙΟΥ | ΜΥΤΙΛΗΝΗ | https://www.aegean.gr/επικοινωνία — "Λόφος Πανεπιστημίου, Κτίριο Διοίκησης, Μυτιλήνη 81100" |
    | ΠΑΝΕΠΙΣΤΗΜΙΟ ΔΥΤΙΚΗΣ ΑΤΤΙΚΗΣ | ΑΘΗΝΑ | https://www.uniwa.gr/ (footer) — all four campus addresses end in "Αθήνα" (e.g. "Αγ. Σπυρίδωνος, Αιγάλεω Τ.Κ. 12243, Αθήνα") |
    | ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΙΑΣ | ΒΟΛΟΣ | https://www.uth.gr/ (footer) — "Αργοναυτών & Φιλελλήνων, 382 21, Βόλος" |
    | ΠΑΝΕΠΙΣΤΗΜΙΟ ΙΩΑΝΝΙΝΩΝ | ΙΩΑΝΝΙΝΑ | https://uoi.gr/epikoinonia/ — "Πανεπιστημιούπολη Ιωαννίνων, Τ.Θ. 1186, Τ.Κ. 45500 Ιωάννινα" |
    | ΠΑΝΕΠΙΣΤΗΜΙΟ ΜΑΚΕΔΟΝΙΑΣ | ΘΕΣΣΑΛΟΝΙΚΗ | https://www.uom.gr/ (footer) — "Εγνατία 156, 546 36, Θεσσαλονίκη" |
    | ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΑΤΡΩΝ | ΡΙΟ | https://www.upatras.gr/ (footer) — "Πανεπιστημιούπολη, 26504 Ρίο, Αχαΐα" (Rio, next to Patras; the source names Rio) |
    | ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΕΙΡΑΙΩΣ | ΠΕΙΡΑΙΑΣ | https://www.unipi.gr/ (footer) — "Μ. Καραολή & Α. Δημητρίου 80, 18534 Πειραιάς" |
    | ΠΑΝΕΠΙΣΤΗΜΙΟ ΠΕΛΟΠΟΝΝΗΣΟΥ | ΤΡΙΠΟΛΗ | https://www.uop.gr/epikoinonia — Πρυτανεία: "Ερυθρού Σταυρού 28 & Καρυωτάκη, 22 131, Τρίπολη" |
    | ΠΑΝΤΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ | ΑΘΗΝΑ | https://www.panteion.gr/epikoinonia/ — "Λεωφ. Συγγρού 136, 17671 Αθήνα" |
    | ΠΟΛΥΤΕΧΝΕΙΟ ΚΡΗΤΗΣ | ΧΑΝΙΑ | https://www.tuc.gr/el/to-polytechneio/epikoinonia — "Πολυτεχνειούπολη, Ακρωτήρι Χανιά 73500" |
    | ΧΑΡΟΚΟΠΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ | ΚΑΛΛΙΘΕΑ | https://www.hua.gr/ (footer) — "Ελ. Βενιζέλου 70, 17676, Καλλιθέα" |
    | ΕΛΛΗΝΙΚΟ ΜΕΣΟΓΕΙΑΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ | ΗΡΑΚΛΕΙΟ | Law 4610/2019 art. 23 par. 1 (ΦΕΚ Α' 70/2019, copy at https://www.uoc.gr/files/items/9/907/2019_n_4610.pdf): "Ιδρύεται … το Ελληνικό Μεσογειακό Πανεπιστήμιο … με έδρα το Ηράκλειο" |

    **Left out: seat not confirmed by an official text (4 institutions, 87 programme rows).** Their sites give no address (ΕΚΠΑ, ΠΑΝ. ΔΥΤ. ΜΑΚΕΔΟΝΙΑΣ) or several
    addresses with none marked as the seat (ΕΜΠ: Αθήνα and Ζωγράφου; Πανεπιστήμιο Κρήτης: Ηράκλειο and Ρέθυμνο), and the text of their founding acts could not be read
    online (only citations were found: ΕΚΠΑ and ΕΜΠ 19th-century foundation, no seat clause found; Πανεπιστήμιο Κρήτης ν.δ. 87/1973 and π.δ. 296/1973 ΦΕΚ Α' 239/1973
    "on the title and seat", text not read; ΠΑΝ. ΔΥΤ. ΜΑΚΕΔΟΝΙΑΣ π.δ. 92/2003 ΦΕΚ Α' 83/2003, text not read — the university's own study guides say "Έδρα … ήταν η
    Κοζάνη", which is not a law text). Following the team rule, these institutions and all their rows are not in the files:
    ΕΘΝΙΚΟ ΚΑΙ ΚΑΠΟΔΙΣΤΡΙΑΚΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΑΘΗΝΩΝ (41 rows, sheet uoa-atena), ΕΘΝΙΚΟ ΜΕΤΣΟΒΙΟ ΠΟΛΥΤΕΧΝΕΙΟ (9 rows, sheet ntua-atena), ΠΑΝΕΠΙΣΤΗΜΙΟ ΚΡΗΤΗΣ
    (17 rows, sheet uoc-heraklion), ΠΑΝΕΠΙΣΤΗΜΙΟ ΔΥΤΙΚΗΣ ΜΑΚΕΔΟΝΙΑΣ (20 rows). Adding a confirmed seat to `SEATS` in build.mjs brings an institution back.

## Spelling

Names stay in Greek as the sources write them: capital letters without accents (the usual Greek all-caps style), with the diaeresis where the source has it (ΒΙΟΪΑΤΡΙΚΗΣ).
Accents could not be restored from an official source: both ministry files and the other ministry datasets checked (staff by institution, mobility statistics) are all in capitals.
Latin letters typed by mistake inside Greek words ("KAI", "ΑΝΑΠTΥΞΗΣ") are replaced by the identical-looking Greek letters; nothing else is changed. Department names are in the
genitive, as in the source ("ΝΟΜΙΚΗΣ" = "[Department] of Law").

## Known limits

- Institution `city`: seat confirmed from an official source for all 20 institutions in the files; 4 institutions left out for lack of one (step 12). Programme rows keep the town from the brackets of the admission file.
  No institution `website` is set.
- `language` is "nespecificată" for all rows (step 7).
- The Hellenic Open University (ΕΑΠ) does not admit through the exams and is missing; foreign-language programmes (art. 101) and private colleges (not universities in Greece) are not included.
- The Ανώτατη Σχολή Καλών Τεχνών has one row (ΘΕΩΡΙΑΣ ΚΑΙ ΙΣΤΟΡΙΑΣ ΤΗΣ ΤΕΧΝΗΣ); its fine-arts department is not in the 2025 admission file and is not added. The ecclesiastical academies are left out as asked, although Greek law counts them in higher education.
- Places per department are in the admission file but are given per candidate category; they are not used.
- Counts in steps 3 and 5 (387 matched, 26 not) are over all 413 rows before the 4 institutions were left out; in the files 20 rows have no faculty or years, 31 no url, 87 (27%) no app domain.

## Counts (run of 2026-10-19)

454 admission codes → 65 dropped (not universities) → 413 rows at 24 institutions → 87 rows of 4 institutions without a confirmed seat left out → 326 programme rows at 20 institutions (7 with an existing sheet), 47 towns.
306 rows with faculty and years, 295 with a url, 87 without an app domain, 0 merged rows; 20 institution seats confirmed.
