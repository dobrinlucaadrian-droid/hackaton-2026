# Nivelurile de taxă: praguri și verificare

Hotărât de echipă pe 2026-10-22. Nivelul de pe fiecare fișă (`budget`) se alege după **taxa de școlarizare pe an** la licență
pentru un student din România (cetățean UE), fără cazare și masă:

| Nivel | Taxă pe an |
| --- | --- |
| Fără taxă (`gratuit`) | 0 € (taxele administrative obligatorii sub 1.000 €/an nu contează) |
| Taxă mică (`mic`) | până la 2.000 € |
| Taxă medie (`mediu`) | 2.000–6.000 € |
| Taxă mare (`mare`) | peste 6.000 € |

Reguli: universitățile de stat din România cu locuri la buget sunt „fără taxă”; nivelul urmează taxa celor mai multe programe de licență
(medicina, mai scumpă, se spune în nota de cost); dacă taxa depinde de veniturile familiei (Italia), nu se presupune scutirea care cere
acte de venit din străinătate. Sumele din alte monede se transformă orientativ în euro. Intervalele apar în filtrul de pe pagina
„Universități” (`apps/web/lib/labels.ts`).

## Prima verificare (2026-10-22)

Șase agenți au căutat taxa pe pagini oficiale (universitate, minister, guvern). Rezultat: **436 din 751** fișe confirmate în prima rundă (nivelul
corect la aproape toate), **315** neverificate (s-a terminat porția de căutări sau site-urile au refuzat accesul); acestea au rămas neschimbate.

Schimbate (aprobate de echipă): eth-zurich, epfl, uzh mic → mediu; hsg-st-gallen, usi-lugano mediu → mare; lumsa mare → mediu;
agh-krakow mic → mediu; eamt-tallinn mediu → mic; utm, uvvg, cantemir-tgmures mediu → mic; upa-iasi mic → mediu.

Propuse, dar **nefăcute** (nesigure): uniupo, univaq, uniss, unicz, poliba, unitus, unior (gratuite doar cu acte italiene de venit);
hotelschool-the-hague (taxă ~4.600 €, dar ~8.500 € obligatorii în primul an pentru masă și cazare); unifr, wittenborg, sse-riga,
ism-vilnius, pw-warszawa, uj-krakow, lsmu, unist, unisob, unisr (la limită, sursă pentru alt an, un singur program sau neclar
dacă suma e pe semestru).

## A doua verificare (2026-10-22)

Reluate cele 315 neverificate și cele 18 nesigure, deschizând direct paginile oficiale de taxe. Rezultat total: **706 din 751** fișe
confirmate.

Schimbate (aprobate de echipă): unipi mică → medie (taxă fixă pentru familiile din străinătate); humanitas, unisr, lum mare → medie
(după cele mai multe programe de licență; medicina, mai scumpă, e spusă pe fișă); uni-gdansk, uj-krakow, uni-lodz, uek-krakow,
uni-wroclaw mică → medie (programele în engleză, ca la AGH); sse-riga mare → medie (bursa automată pentru UE); ism-vilnius medie → mare.

Lămurite fără schimbare: cele 7 universități de stat din Italia rămân „mică” (taxa nu e 0 fără acte de venit); hotelschool-the-hague
rămâne „mare” (decizia echipei: în anul I se adaugă ~8.600 € obligatorii); wittenborg rămâne „mare” (reducerea pentru UE se dă prin
concurs); unifr rămâne „mică”; pw-warszawa rămâne „mică” (4 din 11 programe în engleză gratuite); lsmu rămâne „medie” (cele mai multe
programe ~4.200 €; medicina mult mai scumpă); universitățile de stat din Franța rămân „mică” (178 €/an este taxa de școlarizare).

Nesigure, nefăcute: sciences-po și paris-dauphine (taxa depinde de venitul familiei), unist și pusan-national (scutire după note,
taxa 2026 nestabilită), uni-warszawa (tabel greu de citit), unisob (un singur program citit).

Corectat pe fișă: bournemouth — reducerea automată pentru UE începe abia pentru cei care încep în 2027.

## Rămase neverificate (45)

Site-urile lor blochează accesul sau nu publică taxele; nivelul a rămas cel vechi:

apollonia, athenaeum, itp-cluj, timotheus, kcl, west-london, lincoln-uk, northampton, hull, polito, univr, unipr, uv-valencia, upv-valencia, usal-salamanca, um-malta, ua-alicante, unito, unimi, unifi, unimib, unipv, univpm, unicampania, unitn, unisi, unibs, unibg, uniparthenope, uer, uniroma4, ouc-nicosia, neapolis-pafos, sciences-po-bordeaux, sciences-po-lyon, sciences-po-lille, mcmaster, usmf-chisinau, umk-torun, palacky-olomouc, unwe-sofia, upsc-chisinau, usarb-balti, skku, acu
