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
- Duration and deadline: submission at 18:00 on 2026-10-04 (same day).
- Team preferences: no preferred domains, no ideas in mind, nothing to avoid.

## Chosen idea

Chosen by the team on 2026-10-04, after three ideation rounds (`docs/ideas.md`). It is the team's own idea, not one from the report; its originality was not checked with a search.

- **Idea:** a website that guides high-school students to the right university programme. The site is the "middle man" between high school and university. Name not decided yet (working name suggested: "Busola").
- **One-line pitch:** Tell it your high-school profile and answer a few questions; it shows the three programmes that fit you best, why, and what you need for admission.
- **Startup angle:** free for students; universities pay to be presented and to receive interested students, or high schools pay for counselling.
- **Demo flow:**
  1. Start screen: pick your high-school profile and specialization (real, uman, tehnologic, vocațional…).
  2. 10–12 short questions (subjects you like, people vs numbers, how much study you want, big city vs close to home).
  3. Result: top 3 matches with a percentage, a "why this fits you" explanation and what admission requires (exam subjects or bac average), plus where in Romania it can be studied.
- **MVP scope:**
  - One web app, 3 screens, in Romanian.
  - Rule-based scoring, no AI and no API key.
  - Seeded JSON of study programmes covering all of Romania (the team asked for all faculties in the country) — exact shape of that coverage to be confirmed before the build.
  - No accounts, no database.
- **Out of scope:** AI-generated advice, user accounts, saving results, universities abroad, live admission data (grades, number of places), payments, a mobile app.
- Team: size, strengths, tech each person is fast in: five beginners with little or no coding experience; Claude writes the code, the app must run on Vercel
