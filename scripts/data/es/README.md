# Spain (es) - whole country: 91 universities, 4,302 Grado rows

Built 2026-10-08. Two national official sources, joined by the official centre code, plus one regional file used only for web links.
Every row says in `source` which of the two national sources it comes from.

| Part | Rows | Source | What a row is |
| --- | --- | --- | --- |
| Public in-person universities (47) | 3,078 | SIIU pre-enrolment file 2025-26 + RUCT centre list | one Grado (or double degree) offered in one centre, with the places offered |
| Private universities (43) and UNED | 1,224 | RUCT, titles per centre | one Grado registered as taught in one centre, not extinguished |

## Sources and reuse terms

### 1. SIIU - "Preinscripción a Grado de universidades públicas presenciales" (Ministerio de Ciencia, Innovación y Universidades)

- Page: https://www.ciencia.gob.es/Ministerio/Estadisticas/SIIU/UCT.html (section "Estadísticas y datos abiertos" of the Ministry).
- File: https://www.ciencia.gob.es/dam/jcr:002463cb-6984-4286-9252-649a69c3863f/PreinscripcionEUCT_2025_26.xlsx (7.7 MB), saved as `preinsc.xlsx`. Downloaded 2026-10-08.
- Sheet used: "Preinscripción Ámbito", rows of "Curso académico" 2025-2026 (3,092 rows, 47 universities, 805 centres).
  The sheet itself says: "Fuente: Sistema Integrado de Información Universitaria (SIIU). Ministerio de Ciencia, Innovación y Universidades."
- Reuse terms: the Ministry's legal notice, https://www.ciencia.gob.es/InfoGeneralPortal/AvisoLegal.html (read 2026-10-08). There is no named open licence. The notice says:
  - for the whole portal: "Se prohíbe expresamente la reproducción total o parcial de los contenidos del Portal sin citar su origen o sin haber solicitado autorización en su caso."
  - for SIIU information (the clause is written for the QEDU app, whose data "procede principalmente del Sistema Integrado de Información Universitaria (SIIU)"):
    "La reutilización de esta información podrá tener objeto comercial o no comercial y se realizará siempre bajo las siguientes condiciones generales: Se prohíbe expresamente desnaturalizar el sentido de la información. Debe citarse la fuente de la información objeto de reutilización. [...] Debe mencionarse la fecha de la última actualización [...]. No se podrá indicar, insinuar o sugerir que el Ministerio de Ciencia, Innovación y Universidades participa, patrocina o apoya la reutilización que se lleve a cabo con la información."
  - the citation it asks for when the data were processed: "Elaboración propia con datos extraídos del catálogo de datos del Ministerio de Ciencia, Innovación y Universidades (ciencia.gob.es)".

### 2. RUCT - Registro de Universidades, Centros y Títulos (same Ministry)

- Site: https://www.educacion.gob.es/ruct/home - the national public register. Its footer links to the same legal notice as above; it states no separate licence.
- robots.txt: https://www.educacion.gob.es/ruct/robots.txt answers 404 (no rules); the robots.txt at the root of the host could not be read (the server closes the connection). Nothing in the legal notice forbids automated consultation.
- What was fetched (2026-10-08, by `fetch.mjs`: one request at a time, 1.2 s apart, cached, 503 requests in total):
  - the register's own export of the full list of universities (109 entries) and of centres (2,156 entries), as CSV - 2 requests. The centre list has the municipality of every centre;
  - for the 47 universities SIIU does not cover (private ones and UNED): the export of their Grado titles (Excel, the only export with "Rama" and "Campo de estudio") and the page "Títulos impartidos en el centro" of each of their 393 teaching centres (plus the Excel export of that list for the 61 centres with more than 25 titles).
- This is the weaker of the two permissions: a public register consulted politely and cited, under a notice that allows reproduction with the origin cited, but without an explicit open-data licence. **Ask the Ministry (or re-check the notice) before a commercial launch.**

### 3. Generalitat Valenciana - "Grados y Másteres oficiales de la Comunitat Valenciana" (optional, web links only)

- https://dadesobertes.gva.es/ca/dataset/grados-y-masteres-oficiales-de-la-comunitat-valenciana ; CSV: https://terramapas.icv.gva.es/12_Titulaciones?request=GetFeature&service=WFS&version=2.0.0&typename=Titulaciones&outputformat=csv (saved as `gva.csv`).
- Licence on the dataset page: "Creative Commons Attribution" (CC BY). Used only to add `url` to 390 rows, matched by official title code + centre code. No row comes from it any more (the earlier build was only this file: 9 institutions, 481 rows, of which, according to the audit, 12 UPV "PARS" pathway rows were not degrees).

### Attribution to show

"Elaboración propia con datos extraídos del catálogo de datos del Ministerio de Ciencia, Innovación y Universidades (ciencia.gob.es): SIIU, preinscripción 2025-26, y Registro de Universidades, Centros y Títulos (RUCT), consulta de octubre de 2026. Enlaces de la Comunitat Valenciana: Generalitat Valenciana (dadesobertes.gva.es), CC BY. El Ministerio no participa ni apoya este sitio."

## Steps

1. `mkdir <raw>`; download the SIIU file to `<raw>/preinsc.xlsx` and (optional) the Valencian CSV to `<raw>/gva.csv`.
2. `node scripts/data/es/fetch.mjs <raw>` - fills `<raw>/ruct/` (about 15 minutes; needs `curl`, because the server does not send its intermediate certificate and Node's own fetch refuses it).
3. `node scripts/data/es/build.mjs <raw>` - writes `apps/web/data/catalog/es-institutions.json` and `es-programs.json` (3.6 MB; it switches to `es-programs.jsonl.gz` by itself above 4.5 MB).
4. `node scripts/data/validate.mjs es` - prints VALID.

## How the fields are filled

- **Institution**: name, public/private ("Tipo"), seat municipality and web address from the RUCT university list. Kept only when it has at least one programme row.
  Existing app sheets: Universidad de Barcelona -> `ub-barcelona`, IE Universidad -> `ie-university` (`hasSheet: true`).
- **city**: the "Municipio" of the centre in the RUCT centre list (checked against centre pages: the other place column is "Localidad", e.g. Bellaterra for Cerdanyola del Vallès). All 805 SIIU centre codes were found in RUCT, so **100% of rows have the municipality of their own centre**; nothing falls back to the university seat. Names are the official ones ("Elx/Elche", "Pamplona/Iruña"); a trailing article is moved to the front ("Rozas de Madrid, Las" -> "Las Rozas de Madrid").
- **faculty**: the centre name (SIIU "Unidad" resolved to the RUCT centre name).
- **name**: the official title without the trailing "por la Universidad ...". Double degrees keep the source wording ("PCEO Grado en X / Grado en Y").
- **domain**: SIIU "Ámbito de estudio"; for RUCT rows "Campo de estudio", or "Rama" when the title has no field.
- **domainId**: our own rules in `build.mjs` - keywords in the title first, then the field label where it points to one app domain; `null` when unsure. Double degrees get a domain only when both halves map to the same one. 977 rows (23%) have none: 472 double degrees and 505 single degrees (Historia del Arte, Criminología, Nutrición, Humanidades, Ingeniería Biomédica, Organización Industrial ...).
- **maxStudents**: SIIU "Plazas ofertadas" (public rows only). The file notes: "En las titulaciones sin límite en la oferta de plazas se hace constar la oferta que figura en la memoria de verificación del título".
- **form**: `full-time` for SIIU rows (the file covers in-person public universities); `distance` for the universities RUCT marks "No Presencial" (UNED, UNIR, UOC, VIU, UDIMA, Isabel I ...); left out for the other private universities.
- **status**: RUCT rows only, in the register's words ("Titulación renovada", "Publicado en B.O.E." ...).
- **url**: only the 390 Valencian rows. **language**: "spaniolă" everywhere - neither source gives the teaching language; many programmes in Catalonia, Valencia, the Balearic Islands, Galicia and the Basque Country are taught partly or wholly in the co-official language, some in English.
- credits, years: not in the sources, left out.

## What is filtered out

- SIIU: 14 rows that are admission routes, not degrees - common-entry groupings of several engineering degrees in Catalonia ("(agrupació)") and open first years ("Grado Abierto", "Grau obert").
- RUCT: every level other than "Grado" (Máster, Doctor, old Licenciado/Diplomado "Ciclo" titles); 384 Grado-in-centre entries marked "TITULACIÓN EXTINGUIDA" or "A EXTINGUIR"; research institutes, doctoral schools, departments and hospitals (not fetched).
- Not universities: RUCT codes 000 (other centres), 086 (defence centres), 091-096/101/105 (foreign centres), 099 (arts schools). UIMP and UNIA (public, no Grado) do not appear.
- Kept on purpose: the 602 double-degree rows (they are separate admission offers with their own places); 6 titles that SIIU lists twice in one centre (separate groups with their own places; key suffix `-x2`).

## Counts and checks (2026-10-08)

- 91 institutions (48 public, 43 private) - the Ministry counts 91 teaching universities (50 public, 41 private; UIMP and UNIA have no Grado; the Ministry figure is for 2023-24 and RUCT has newer private universities). 4,302 rows, 149 municipalities.
- Public universities: 3,111 rows (3,078 SIIU + 33 UNED). Private: 1,191 rows.
- Rows / single-degree rows / distinct single-degree names: Complutense 108 / 84 / 75; Barcelona 87 / 73 / 73; Granada 95 / 77 / 62 (Granada, Ceuta, Melilla); Sevilla 109 / 78 / 66; Politécnica de Madrid 57 / 48 / 46; Politécnica de Catalunya 53 / 50 / 46.
- Spot checks against the raw rows: UGR Medicina (Facultad de Medicina, Granada, 272 places); UCM Veterinaria (160 places); UPM Ingeniería Aeroespacial (465 places); Deusto Derecho (Bilbao, RUCT status "Titulación renovada por acreditación institucional"); UDIMA Psicología (Collado Villalba, distance).

## Limits

- The two halves are not the same kind of list. Public rows are the real admission offer of 2025-26. Private and UNED rows are the register: a title registered in a centre and not extinguished, which may not be open for admission this year, and has no places.
- Private rows can repeat a title across several centres of one university (as registered).
- Affiliated private centres of public universities are included (they are in SIIU, 244 rows) and are listed under the public university.
- Public Grados outside the general pre-enrolment (for example defence centres) are missing.
- The Catalan common-entry engineering groupings are dropped, so a few UPC/UdL/UAB/UPF-Tecnocampus engineering degrees that are only entered through a grouping are missing.
- Regional open data (Catalonia `dadesobertes.gencat.cat`, Castilla y León) were not used: for public universities they would duplicate SIIU, and one national source keeps the rows consistent. They could later add teaching language or web links.
- No teaching language, credits or duration.
