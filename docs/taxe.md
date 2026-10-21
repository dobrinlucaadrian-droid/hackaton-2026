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

Șase agenți au căutat taxa pe pagini oficiale (universitate, minister, guvern). Rezultat: **436 din 751** fișe confirmate (nivelul
corect la aproape toate), **315** neverificate (s-a terminat porția de căutări sau site-urile au refuzat accesul); acestea au rămas neschimbate.

Schimbate (aprobate de echipă): eth-zurich, epfl, uzh mic → mediu; hsg-st-gallen, usi-lugano mediu → mare; lumsa mare → mediu;
agh-krakow mic → mediu; eamt-tallinn mediu → mic; utm, uvvg, cantemir-tgmures mediu → mic; upa-iasi mic → mediu.

Propuse, dar **nefăcute** (nesigure): uniupo, univaq, uniss, unicz, poliba, unitus, unior (gratuite doar cu acte italiene de venit);
hotelschool-the-hague (taxă ~4.600 €, dar ~8.500 € obligatorii în primul an pentru masă și cazare); unifr, wittenborg, sse-riga,
ism-vilnius, pw-warszawa, uj-krakow, lsmu, unist, unisob, unisr (la limită, sursă pentru alt an, un singur program sau neclar
dacă suma e pe semestru).

## A doua rundă (de făcut)

Fișele neverificate, de reluat când se reface porția de căutări:

apollonia, athenaeum, bioterra, itp-cluj, timotheus, kcl, bristol, birmingham, nottingham, aston, birmingham-city, anglia-ruskin, ulster, sheffield-hallam, liverpool-john-moores, oxford-brookes, city-st-georges, greenwich, salford, durham, de-montfort, ual, lancashire, leeds-beckett, glasgow-caledonian, south-wales, leicester, kingston, lancaster, plymouth, east-london, edinburgh-napier, sunderland, brighton, wolverhampton, staffordshire, west-london, hertfordshire, bournemouth, uea, heriot-watt, derby, lincoln-uk, robert-gordon, london-south-bank, huddersfield, northampton, teesside, cardiff-met, edge-hill, middlesex, keele, london-met, hull, brunel, canterbury-christ-church, bangor, atlantic-technological-university, polimi, polito, bocconi, unipi, unina, unive, unige, tor-vergata, roma-tre, units, univr, luiss, unicatt, unipr, unibz, uv-valencia, upv-valencia, usal-salamanca, unav-navarra, um-malta, unipg, unimore, unife, unict, iulm, unistrapg, humanitas, unistrasi, unical, uoa-atena, auth-salonic, ntua-atena, unic-nicosia, ua-alicante, um-murcia, uniovi-oviedo, usc-santiago, unito, unimi, unifi, unimib, uniba, unipv, unime, unica, univpm, unicampania, unich, unitn, unisi, unibs, unibg, uniparthenope, unisannio, uer, lum, liuc, uniroma4, univda, aueb-atena, uoc-heraklion, upatras-patras, uth-volos, duth-komotini, ouc-nicosia, neapolis-pafos, uoi-ioannina, unipi-pireu, sorbonne, sciences-po, insa-lyon, ku-leuven, lund, kth, uio, ntnu, paris-cite, paris-1-pantheon-sorbonne, paris-saclay, paris-dauphine, unistra, lyon-1, lyon-3, aix-marseille, u-bordeaux, toulouse-capitole, umontpellier, univ-lille, nantes-universite, univ-rennes, ghent-university, university-of-antwerp, vrije-universiteit-brussel, uclouvain, ulb, uliege, uppsala, stockholm-university, chalmers, gothenburg, helsinki, aalto, tampere, lyon-2, cote-d-azur, univ-lorraine, univ-toulouse, paris-nanterre, upec, clermont-auvergne, unicaen, univ-rouen, toulouse-jean-jaures, bourgogne-europe, u-picardie, univ-poitiers, univ-angers, univ-tours, cy-cergy-paris, marie-louis-pasteur, univ-reims, ubo-brest, paris-pantheon-assas, sorbonne-paris-nord, montpellier-paul-valery, paris-8, rennes-2, univ-st-etienne, univ-orleans, unilim, sorbonne-nouvelle, gustave-eiffel, bordeaux-montaigne, savoie-mont-blanc, uvsq, univ-pau, uphf, univ-artois, le-mans-universite, bretagne-sud, univ-toulon, univ-evry, haute-alsace, ulco, univ-perpignan, la-rochelle-universite, le-havre-normandie, avignon-universite, inalco, utc-compiegne, insa-toulouse, sciences-po-bordeaux, sciences-po-lyon, utt-troyes, insa-rennes, sciences-po-lille, utbm, unamur, umons, howest, linkoping-university, umea-university, malmo-university, karlstad-university, turku, oulu, jyvaskyla, lut, uef, metropolia, haaga-helia, uib, uia, nmbu, nord, inn, nhh, bi-norway, uit-tromso, columbia, dartmouth, cornell, waterloo, mcmaster, ualberta, sydney, anu, unsw, hku, ntu-singapore, uni-warszawa, uni-wroclaw, uam-poznan, pg-gdansk, uni-gdansk, sgh-warszawa, tul-lodz, uni-lodz, tartu, lu-riga, uni-ljubljana, caltech, uchicago, duke, northwestern, johns-hopkins, carnegie-mellon, georgetown, charles-prague, usm-chisinau, usmf-chisinau, asem-chisinau, mu-plovdiv, washu, emory, tufts, ut-austin, unc-chapel-hill, boston-college, us-katowice, umk-torun, uek-krakow, western-ontario, dalhousie, uvic, concordia-montreal, griffith, vut-brno, palacky-olomouc, uct-prague, uni-maribor, uni-primorska, uni-nova-gorica, emu-tartu, tu-sofia, unwe-sofia, upsc-chisinau, usarb-balti, amtap-chisinau, usem-chisinau, cuhk, hkust, polyu, hkbu, lingnan-hk, sutd, suss, snu-seoul, gist, skku, pusan-national, yonsei, ewha, macquarie, newcastle-au, acu, ecu
