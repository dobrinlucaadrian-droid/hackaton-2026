# Challenge

## Requirements (verbatim)

> creeaza o prezentare sau o aplicatie cu tema The midle man
>
> Durata hackathonului: [ex. 24 de ore]

### Updated wording (second `/ideate`, 2026-10-04 11:52)

> gaseste o idee de start up sau o aplicatie cu tema the midle man
>
> Durata hackathonului: [ex. 24 de ore]
> Echipa: [câți sunteți și ce știe fiecare să facă]

(The duration and team placeholders were left unfilled; the values below come from the team's earlier answers.)

## Summary

- Theme / problem statement: "The Middle Man" — find a startup idea or an application on this theme (first wording: "a presentation or an application"). Open interpretation (intermediary between two parties: people, systems, services). With the updated wording, a startup angle matters: who the customer is, what problem it solves, how it could make money.
- Judging criteria (with weights if given): not announced. Assumed: originality, usefulness, how well the demo works — equal weights.
- Prize tracks and sponsor APIs/tech: none
- Hard rules (required tech, banned things, submission format): deliverable is a presentation or an application; nothing else stated. The organizers did not explain the theme further — free interpretation.
- Deliverable chosen by the team: a simple application that runs online, plus a short presentation about it.
- Duration and deadline: originally submission at 18:00 on 2026-10-04; changed by the organizers — the presentation is on 2026-10-05 (hour not given yet).
- Team preferences: no preferred domains, no ideas in mind, nothing to avoid.
- Team: size, strengths, tech each person is fast in: five beginners with little or no coding experience; Claude writes the code, the app must run on Vercel

## Chosen idea

Chosen by the team on 2026-10-04, after three ideation rounds (`docs/ideas.md`). It is the team's own idea, not one from the report; its originality was not checked with a search.

- **Idea:** a website that guides high-school students to the right university programme. The site is the "middle man" between high school and university. Name not decided yet (working name suggested: "Busola").
- **One-line pitch:** Tell it your high-school profile and answer a few questions; it shows the three programmes that fit you best, why, and what you need for admission.
- **Startup angle:** free for students; universities pay to be presented and to receive interested students, or high schools pay for counselling.
- **Demo flow:**
  1. Start screen: pick your high-school profile and specialization (real, uman, tehnologic, vocațional…).
  2. 10–12 short questions (subjects you like, people vs numbers, how much study you want, big city vs close to home).
  3. Result: top 3 matches with a percentage, a "why this fits you" explanation and what admission requires (exam subjects or bac average), plus two lists of named universities where it can be studied: "În România" and "În străinătate". One question asks where the student wants to study (Romania, abroad, anywhere) and the result shows only the matching list(s).
- **MVP scope:**
  - One web app, 3 screens, in Romanian.
  - Rule-based scoring, no AI and no API key.
  - Seeded JSON covering all study domains in Romania (about 35–40: medicine, law, computer science, engineering, economics, letters, arts, sport, theology, agronomy…), each with the big cities and state universities where it can be studied. Admission requirements are written in general terms per domain, with a "check the faculty's website" note. Confirmed by the team on 2026-10-04 instead of listing every faculty, which could not be verified in time.
  - Universities are shown by name (scope change confirmed by the team on 2026-10-04):
    - Romania, state universities — București: Universitatea din București, Politehnica București, ASE, UMF „Carol Davila”, SNSPA, Arhitectură „Ion Mincu”, UTCB, USAMV, UNATC, Universitatea Națională de Muzică, Universitatea Națională de Arte, UNEFS, Academia de Poliție, Academia Tehnică Militară. Cluj-Napoca: UBB, Universitatea Tehnică, UMF „Iuliu Hațieganu”, USAMV Cluj, Artă și Design, Academia de Muzică „Gheorghe Dima”. Iași: UAIC, Tehnică „Gheorghe Asachi”, UMF „Grigore T. Popa”, Științele Vieții, Arte „George Enescu”. Timișoara: Universitatea de Vest, Politehnica Timișoara, UMF „Victor Babeș”, Științele Vieții. Other cities: Transilvania Brașov, Universitatea din Craiova, UMF Craiova, Ovidius Constanța, Maritimă Constanța, Academia Navală, „Lucian Blaga” Sibiu, „Dunărea de Jos” Galați, Oradea, UMFST Târgu Mureș, „Ștefan cel Mare” Suceava, Petrol-Gaze Ploiești, „1 Decembrie 1918” Alba Iulia.
    - Abroad, well known and often chosen by Romanians — Netherlands: Groningen, UvA, VU Amsterdam, TU Delft, TU Eindhoven, Erasmus Rotterdam, Maastricht, Leiden, Utrecht, Twente. Denmark: Copenhagen, Aarhus, DTU, Aalborg, SDU. UK: Oxford, Cambridge, Imperial College, UCL, King's College London, Edinburgh, Manchester, Warwick. Germany: TU München, LMU München, Heidelberg, RWTH Aachen, Humboldt Berlin. Austria: Universität Wien, TU Wien, WU Wien. Italy: Bologna, Politecnico di Milano, Politecnico di Torino, Sapienza Roma, Padova, Bocconi. France: Sorbonne, Sciences Po, INSA Lyon. Others: KU Leuven, ETH Zürich, EPFL, Lund, KTH, Barcelona.
    - For universities abroad: teaching language and whether tuition is charged, in general terms, no exact amounts.
    - The list was written from Claude's general knowledge and not verified with a search; two team members check it during the build.
  - No accounts, no database.
- **Out of scope:** AI-generated advice, user accounts, saving results, live admission data (grades, number of places), exact tuition amounts, payments, a mobile app.
