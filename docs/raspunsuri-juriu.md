# UniPath — răspunsuri la grila de jurizare

Adresa aplicației: https://unipath-taupe-mu.vercel.app

## 1. Problema și relevanța (20p)

1.1 Claritatea problemei
Un elev de liceu trebuie să aleagă o facultate fără să știe ce i se potrivește, ce se învață acolo și cum e de fapt. Informația există, dar e împrăștiată pe zeci de site-uri și scrisă pentru adulți.

1.2 Importanța problemei
Alegerea se face o dată și costă ani și bani dacă e greșită. Fiecare generație de clasa a XII-a trece prin asta, iar consilierii școlari au prea mulți elevi ca să stea cu fiecare.

1.3 Înțelegerea utilizatorului
Utilizatorul e liceanul, pe telefon, fără răbdare. De aceea aplicația nu cere cont sau nume, are un singur răspuns pe ecran, limbaj simplu și durează cam 6 minute. Pornește de la profilul lui de liceu și de la ce a făcut deja (concursuri, voluntariat).

## 2. Inovație (20p)

2.1 Originalitatea ideii
Întrebările nu sunt „ce materie îți place”, ci 18 situații din viața unui licean (proiect de grup, o regulă nedreaptă în școală). Rezultatul vine cu explicația „de ce ți se potrivește”, iar la „Ce-ar fi dacă?” elevul mută cursoare și vede cum se schimbă.

2.2 Diferența față de soluțiile existente
Testele de personalitate îți dau un tip, nu o facultate. Site-urile de admitere îți dau liste, dar nu te ajută să alegi. UniPath le leagă într-un singur drum: chestionar, domeniu, specializări, materiile pe ani, universități din orașul tău și ce spun studenții de acolo.

2.3 Relația cu tema
UniPath este „omul de la mijloc” între liceu și facultate. Stă între elev și informația oficială, și între elev și studenții care au trecut deja pe acolo.

## 3. Fezabilitate tehnică (20p)

3.1 Funcționalitatea prototipului
Aplicația e publică și merge pe telefon și laptop. Tot drumul funcționează: chestionar, rezultat, specializări, căutare cu filtre, fișe de universități, păreri.

3.2 Arhitectura soluției
Un singur site (Next.js) publicat pe Vercel. Datele sunt fișiere incluse în aplicație, iar potrivirea se calculează direct în telefonul elevului. Nu există server propriu, bază de date sau chei, deci nu are ce să pice la demo și nu păstrăm nimic despre elev.

3.3 Realismul soluției
Costă aproape nimic de ținut online. Ce cere muncă reală este actualizarea datelor în fiecare an (admitere, taxe, planuri).

## 4. Impact și scalabilitate (15p)

4.1 Beneficiari și impact
Elevii de liceu din România, mai ales clasele a XI-a și a XII-a; apoi părinții și consilierii școlari, care o pot folosi la ora de consiliere.

4.2 Potențial de extindere
Se pot adăuga universități și păreri fără schimbări de cod. Avem deja 131 de universități cu fișă (74 din România, 57 din străinătate), 206 specializări și o listă de peste 10.000 de universități din lume.

4.3 Sustenabilitate
Costuri foarte mici, iar părerile pot veni de la studenți voluntari. Pe termen lung s-ar putea susține prin parteneriate cu licee sau universități; asta e o idee, nu ceva ce avem.

## 5. Validare / research (10p)

5.1 Calitatea documentării
Chestionarul se bazează pe 17 surse citite, printre care modelul Holland (RIASEC), folosit în orientarea în carieră, și surse românești de consiliere. Materiile pe ani sunt luate din planuri de învățământ oficiale, cu link la fiecare.

5.2 Teste și feedback
Avem 70 de teste automate și o simulare cu 30.000 de elevi, în care toate cele 40 de domenii pot ieși pe primul loc. Avem și 24 de păreri reale de la studenți. Ce nu avem: nu am testat chestionarul cu liceeni reali.

5.3 Claritatea ipotezelor
Ipoteza principală e că interesele arătate în situații concrete, plus profilul de liceu, indică un domeniu potrivit. Am verificat-o doar prin simulare, cu 10 elevi „tip”. În aplicație scrie cinstit că nu e un test psihologic validat, ci un punct de pornire.

## 6. Pitch și demonstrație (15p)

6.1 Claritatea prezentării
Ordinea: problema, cine e utilizatorul, demo, ce e diferit, ce urmează.

6.2 Demo live
Facem chestionarul pe telefon, alegem „În România” și un oraș, arătăm rezultatul cu „Ce înveți, an cu an”, apoi căutăm „ASE” și deschidem fișa cu părerea studentului.

6.3 Răspunsuri la întrebări
- „De unde sunt datele?” Din site-urile oficiale; informațiile sunt marcate ca orientative.
- „E validat științific?” Nu, și o spunem în aplicație.
- „Ce faceți cu datele elevilor?” Nimic, nu părăsesc telefonul.
