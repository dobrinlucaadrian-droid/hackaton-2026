# Ideas — ideation report (2026-10-04)

Report returned by the `ideator` agent for the challenge in `docs/challenge.md`.

## Avoided (what other teams will build)

- AI chatbot or translator that "mediates" between two people.
- Freelance, escrow or marketplace platforms ("trusted middleman").
- Price-comparison or broker apps (rent, flights, insurance).
- Email, message or tone rewriters.
- Man-in-the-middle cybersecurity explainers.
- Plain AI telephone game. Saturated in the searches; used below only with a twist.
- "Meet in the middle" midpoint finder. Saturated (Meetways, Mappr, Meedol).

Ideas considered (12): Middleman Receipt; farm-to-shelf price chain (merged into 1); bureaucracy letter translator; corporate telephone; midpoint finder; two-sided roommate dispute judge; broker game; slang translator; Wi-Fi MITM explainer; anonymous relay; "fire your middleman" plan (merged into 1); live per-person style chat. Five were shortlisted but only four fully searched and debated. The broker game was shortlisted but never searched or debated.

## Top 3

### 1. Middleman Receipt ("Cine mănâncă din banii tăi?")

- Pitch: For anyone who orders, books or rides. Type "100 lei Glovo order" and an animated bar splits the money into restaurant, courier, platform, card fee and VAT. A "fire the middleman" toggle shows what changes.
- Problem / for whom: People don't see how much of what they pay goes to intermediaries. It takes the theme literally and has local relevance (Glovo, Bolt, Booking, eMAG, Romanian market produce).
- MVP and demo moment: One page.
  - A picker of about 8 services plus 3 farm-to-shelf products (tomatoes, milk).
  - Seeded JSON of published commission rates, labelled "approximate, source linked".
  - An amount input and an animated split bar.
  - The moment: a judge types their own amount and a line reads "For every 100 lei, X lei never reaches who made it". Dragging the slider to remove a layer makes the numbers jump.
  - No API key and no database. Static Next.js.
- Why it can win: Instantly understood, visual, local, and works live offline. It is very safe to build.
- Originality: Exists, differentiable. Closest match is the USDA farm-to-consumer price-spread charts (https://www.ers.usda.gov/data-products/price-spreads-from-farm-to-consumer/highlights-and-interactive-charts). Those are US-only, static and food-only. Differentiator: an interactive per-purchase calculator across platforms, with a Romanian focus. Queries: GitHub "middleman commission breakdown where your money goes" (no results); web "food supply chain markup farmer to consumer price breakdown interactive app".
- Biggest risk:
  - Tiger: the rates may be inaccurate or challenged. Mitigation: show ranges, cite a source per row, and have the team collect the figures from official pages in the first hour.
  - Elephant: judges may call it "just a calculator". Mitigation: the animation, the slider and a strong story in the pitch.
- Stack: Next.js static, CSS or Framer Motion. No key.
- Score: 7.7 (originality 7, usefulness 8, demo 8; feasibility 10)

### 2. Birocrația pe înțelesul tuturor (translator between citizen and state)

- Pitch: For people who get an official letter (ANAF, primărie, bank, utilities) and don't understand it. Paste the text and get "what they want, by when, what happens if you ignore it", plus a draft reply.
- MVP and demo moment:
  - One text box and one API route with one LLM call that returns JSON (summary, deadline, steps, reply).
  - Three sample letters the team writes in advance, as one-click buttons.
  - The moment: a dense paragraph of legalese becomes three plain lines and a red "deadline: 15 days" badge.
- Why it can win: Real local usefulness, and the "middle man" is the translator.
- Originality: Exists, differentiable. The web results showed Romanian public-service chatbots and the generic legal-explainer repo AIKA-AI (https://github.com/Rethika-2782/AIKA-AI), but no letter-in-plain-Romanian tool. Differentiator: it works on the user's own document, in Romanian, with a deadline and a reply draft rather than chat. Queries: GitHub "bureaucracy letter plain language explainer LLM" (no results); web "AI explain government letter plain language Romania ANAF app".
- Biggest risk:
  - Tiger: needs one LLM API key, and the demo breaks if the API fails. Mitigation: pre-cache the three sample outputs as a fallback.
  - Elephant: it can look like "ChatGPT with a skin". Mitigation: the structured output (deadline badge, checklist) and the pitch about citizens with no access to a lawyer.
- Stack: Next.js with one API route; LLM key set via `vercel env add`. **Needs an API key.**
- Score: 7.3 (originality 6, usefulness 9, demo 7; feasibility 8)

### 3. Middle Management (corporate telephone game)

- Pitch: Type a simple message ("the server is down, fix it tonight") and it passes through Intern, Manager, PR, Legal and Director. Each layer rewrites it, and a "meaning left" meter drops from 100% to 12%.
- MVP and demo moment: One LLM call returns all five hops as JSON. A staged reveal shows one layer at a time. The moment is the final output ("We are proactively synergising our availability posture") next to the original. Mostly UI work.
- Originality: Saturated for plain telephone games, so kept only with a twist. Closest matches are elias1328/ai-telephone-game (https://github.com/elias1328/ai-telephone-game) and Tel-AI-phone (https://telaiphone.com/). Differentiator: role-based layers, a meaning-loss meter, and a message about hierarchy rather than random noise. Queries: GitHub "telephone game LLM message rewrite chain" (no results); web "telephone game AI message passes through characters web game".
- Biggest risk:
  - Tiger: the fun fades fast and judges may see a toy. Mitigation: frame it as a demonstration of information loss through intermediaries, with a one-line takeaway.
  - Tiger: needs an LLM key. Mitigation: cached examples as a fallback.
  - Elephant: it resembles other telephone games. Mitigation: lean on the role layers and the meter.
- Stack: Next.js with one API route. **Needs an API key.**
- Score: 6.5 (originality 5, usefulness 5, demo 9; feasibility 8)

## Recommendation

Build idea 1. It is the most original and safest, needs no key, and always works live. If time remains after it passes the gate, add idea 3's staged-reveal UI as a bonus screen; the two share a theme.

## Eliminated

- Meet-in-the-middle midpoint finder: saturated.
- Plain AI telephone game: saturated (kept only as idea 3, with a twist).
- Two-sided roommate dispute judge: needs a database and an LLM, and similar tools exist.
- Broker game (rewrite messages between two stubborn AI clients): needs LLM state; not searched or debated.
- Anonymous message relay: needs storage.
- Live per-person style chat: needs websockets, not possible on Vercel.
- Man-in-the-middle Wi-Fi explainer: common.
- Grandparent and teen slang translator: thin.

## Search notes

All four GitHub searches returned empty arrays — treated as "nothing found", not as proof of novelty. Web searches were one per idea, and no pages were opened. The midpoint finder was searched once on each of GitHub and the web.

---

# Round 2 (widened interpretation: the user IS the middle man)

The team asked for another round without picking from round one. Budget used: 4 searches in total (3 web, 1 GitHub). The GitHub search returned an empty array again. Prior art was judged from titles only; no pages were opened.

## Top 3 (round 2)

### 1. Între două focuri ("Caught in the Middle") — a relay-and-consequences game

- Pitch: For teenagers. You are the kid between two people in conflict (parents on a holiday plan, or two best friends fighting in a group chat). Each turn one side hands you a message. You choose how to pass it on (honest, soften, lie, stay silent). Two mood bars and a "your stress" bar react, with face emoji, and the game ends with one of 4 endings.
- Why it can win: It is emotional and relatable, so the moment is instant. After you soften a harsh message, the other face lights up, and then the lie gets discovered. It literally makes you the middle man and shows the cost of intermediaries.
- Originality: Exists, differentiable. The closest match was "Monster X Mediator", a fantasy narrative game about mediating between species, not relatable family or friend conflict. Differentiator: a short, personal, teen-life scenario with a visible honesty-versus-peace trade-off. Queries: web "browser game you are the mediator between two people relay messages choices consequences"; web "middle child game narrative caught between parents interactive story web" (nothing relevant); GitHub "mediator negotiation game relay messages between two parties" (no results).
- Demo flow: Title screen, then 6 to 8 scenes (about 2 minutes of play), then an ending card with a shareable summary ("You kept the peace, lost both trust bars"). Judges play it live on a laptop.
- MVP scope:
  - Scripted branching story as one JSON file of scenes and choices, with a tiny state machine in a single React page.
  - The team writes the scenes, using the Romanian everyday life they know. This uses the non-coders' strength.
  - Emoji and CSS only for visuals, no images.
  - Static Next.js, no API key, no database.
- Biggest risk:
  - Tiger: weak writing makes it feel flat. Mitigation: two team members write dialogue in the first hour, and Claude balances the bars.
  - Elephant: judges may call it "just a quiz". Mitigation: strong ending screens and visible consequences.
- Score: 8.0 (originality 8, usefulness 6, demo 9; feasibility 9)

### 2. Mediatorul — the broker game, evaluated properly

- Pitch: For anyone who likes negotiation games. Two clients (a landlord and a tenant, a buyer and a seller) cannot talk to each other. You relay each offer, choosing from 3 rewrites per turn, and win only if both walk away happy before patience runs out. It is the same engine as idea 1 but built around deals and numbers.
- Why it can win: It is a strong middle-man mechanic where both sides' hidden limits are discovered through your choices, and the final screen reveals them: "The landlord would have gone down to 1900 lei".
- Originality: Exists, differentiable. Same Monster X Mediator result and no other close match (same queries as idea 1). Differentiator: a hidden-limits reveal and a short, realistic deal.
- Demo flow: Pick a scenario, then 5 to 6 turns of relaying, then the reveal screen showing both hidden limits and your score.
- MVP scope: A scripted version with 3 pre-written rewrites per turn needs no key. A free-text version with an LLM is possible but flaky and needs a key, so cut it.
- Biggest risk:
  - Tiger: balancing the numbers so the game is winnable but not obvious. Mitigation: 2 scenarios and playtest by the team.
  - Elephant: it overlaps idea 1 and the team should build only one engine. Mitigation: treat it as a second scenario inside idea 1's engine.
- Score: 7.3 (originality 7, usefulness 5, demo 8; feasibility 8)

### 3. Compromis ("Compromise Machine") — a pass-the-phone decision tool

- Pitch: For two friends or a couple deciding something (where to eat, what film, what to do tonight). Each privately rates 6 options by sliding, one after another on the same phone. The app then reveals the compromise and a "sacrifice meter" that shows who gave up more ("Andrei gave up 62%, he owes you a coffee").
- Why it can win: It is playful, takes the middle of a decision literally, and the reveal is funny. It is usable right away at the event.
- Originality: Exists, differentiable. The searches found compromise-effect papers and relationship articles, but no app. Differentiator: the sacrifice meter and the "who owes whom" joke. Query: web "find compromise between two people each rate preferences app fair sacrifice decision". The midpoint-finder apps from round one are a different product.
- Demo flow: Two judges each slide privately, then the reveal.
- MVP scope: Preset option lists (food, films, activities) and a simple scoring formula. Static page, no key.
- Biggest risk:
  - Tiger: the interaction needs two people on one device, which is awkward on a projector. Mitigation: a "solo demo" mode with a pre-filled second person.
  - Elephant: it is thinner than the other two. Mitigation: a good reveal animation and several funny verdict lines.
- Score: 6.7 (originality 6, usefulness 6, demo 8; feasibility 9)

## Recommendation (round 2)

Build Între două focuri and add Mediatorul's deal scenario as a second scenario in the same engine, since scenes are JSON. The shared engine makes the second scenario cheap.

## Eliminated (round 2)

- Spy dead-drop courier game: needs more writing and art than the time allows.
- "Don't shoot the messenger" tone dial: merged into idea 1 as a scene.
- Gossip relay in a school class: covered by idea 1.
- Live group-chat peacekeeper with an LLM: needs a key and is flaky.
- Free-text negotiation with an LLM: needs a key and risks a failed demo.
- Middle-of-the-road voting app: needs shared state across devices, which does not suit Vercel without a database.

## Comparison with round one

Între două focuri (8.0) edges Middleman Receipt (7.7): it is more original and emotional and just as safe (no key), but it depends on the quality of the writing, while the Receipt depends on the accuracy of its data. If the team can write 6 to 8 good scenes in an hour, pick Între două focuri. Otherwise keep the Receipt.

---

# Round 3 (startup lens)

The team re-sent the challenge as "find a startup idea or an application". Budget: 5 searches (4 web, 0 GitHub). Prior art was judged from search titles only. "Novel" means "nothing close in these queries", not proof. No key is needed unless flagged.

## Re-score of earlier finalists as startups (no new searches)

- Middleman Receipt (7.7 as a demo): weak as a startup, about 4/10. Customers are curious consumers who won't pay, so it makes money only through ads or affiliate links, and the "why now" is thin. It works as a feature, not a company.
- Birocrația pe înțelesul tuturor (7.3): decent, about 6.5/10. Sell the translator and reply drafter to utilities, banks and city halls (B2B), who pay to cut call-center volume and reduce errors. Consumers use it free. Needs an LLM key.
- Între două focuri (8.0): weak to medium, about 5/10. The plausible customer is schools and counselors (social-emotional learning), but selling to them is slow and the product is a game. Better as a demo than as a business.

## Top 3 across all rounds (startup lens)

### 1. Nepotul — a vetted "digital nephew" for parents back home

- Pitch: A Romanian student near the parent handles paperwork, bills and errands, paid and supervised by the adult child living abroad.
- Customer: Romanians working abroad with older parents at home. The user and payer is the diaspora child. The parent is the beneficiary and the student is the supply.
- Problem: Parents struggle with online forms, utilities, ID renewals and doctor visits, and the child cannot be there. Today they depend on a favor from a neighbor or a Facebook group.
- Why now: Digital-only public services in Romania are growing, and the diaspora is very large.
- Business model: A subscription of about 15 EUR a month, or a per-task fee, with the student keeping about 70%.
- Why it can win: It has a clear human story, is local and emotional, and the "middle man" is a trusted person who replaces the stranger or the favor.
- Originality: Exists, differentiable. Closest: Papa (US, students helping seniors) and the RoOmenia diaspora volunteer network on Facebook (148,000 members). Differentiator: a paid, accountable service for remote adult children and a Romanian bureaucracy focus. Queries: web "Romania diaspora app help elderly parents back home errands paperwork bills volunteer service"; web "startup translator between elderly grandparents and digital services bureaucracy family helper app".
- Demo flow: The child posts a task ("pay electricity bill, renew ID card"), sees a matched student with a rating, then watches a status timeline (accepted, done, photo proof) and a receipt.
- MVP scope: 3 screens (post a task, matched student, timeline) with seeded students and tasks. No key, no database.
- Biggest risk:
  - Tiger: trust and safety (strangers handling a pensioner's documents). Mitigation: show vetting steps, task limits (no access to bank cards), and a "proof for every task" rule in the pitch.
  - Elephant: it is still a marketplace. Mitigation: pitch it as a care service for one niche, not a platform.
- Score: 8.0 (originality 7, usefulness 9, demo 7; startup strength 8; feasibility 9)

### 2. Garanția — evidence and deposit protection for student renters

- Pitch: A neutral check-in and check-out report with timestamped photos and a shared checklist, plus a held deposit, so landlords and students stop fighting over who damaged what.
- Customer: Students and young people renting in Romanian university cities, and landlords who want proof.
- Problem: Deposits disputed without evidence, and informal contracts.
- Why now: Student housing demand is high, and photo-based apps are common abroad but not localised.
- Business model: A flat fee of about 29 lei per rental for the report, plus a small deposit-holding fee.
- Why it can win: The team's peers are the customers, so the story is credible, and the "side-by-side before and after" is a clear moment.
- Originality: Exists, differentiable. Closest: Rentproof, MoveProof, RentCheck and similar (all general, not Romanian). Differentiator: the Romanian student market, Romanian-language flow, and the deposit-hold. Query: web "rental deposit dispute check-in check-out photo evidence report app tenants landlords Romania" (no Romania-specific result found).
- Demo flow: Open a flat, view check-in photos by room, open the check-out photos, and see the side-by-side with a "difference found: sofa stain" and a suggested deposit split.
- MVP scope: Seeded photos and rooms, a comparison view and a generated report page. No runtime uploads, so no storage and no key.
- Biggest risk:
  - Tiger: this is close to escrow and a crowded app category. Mitigation: stress the Romanian student niche and the neutral-party role.
  - Elephant: the legal value of the report in Romania is unclear. Mitigation: call it "evidence for mediation" and not a legal document.
- Score: 7.2 (originality 6, usefulness 8, demo 7; startup strength 7; feasibility 8)

### 3. Birocrația pe înțelesul tuturor — B2B reframe

- Pitch: A plain-language translator for official letters, sold to utilities, banks and city halls so their customers understand them and stop calling.
- Customer: Utilities and city halls (payers), with citizens as users.
- Problem: Official language is impenetrable, call centers are overloaded, and people miss deadlines.
- Why now: LLMs make this cheap, and Romania is digitising services. Public-sector AI chatbots (such as ANAF's ANA) exist, but they are chat-only (round one search).
- Business model: Per-letter or monthly B2B license, with a free consumer app.
- Originality: Exists, differentiable. See round one (AIKA-AI and Romanian gov chatbots). Differentiator: the B2B angle and structured output (deadline badge, steps, reply draft).
- Demo flow: Paste a letter, and see the summary, the red deadline badge, the checklist and the reply draft. Cached outputs for 3 sample letters.
- MVP scope: One page and one API route. **Needs an LLM key**; cached fallbacks make the demo safe.
- Biggest risk:
  - Tiger: the API failing during the demo. Mitigation: cached samples.
  - Elephant: it looks like "ChatGPT with a skin". Mitigation: the B2B pitch and the structured output.
- Score: 6.8 (originality 6, usefulness 8, demo 7; startup strength 6.5; feasibility 8)

## Recommendation (round 3)

Pick Nepotul. It is the strongest as a startup (customer, payer, supply and model are all clear), it is local and emotional, and it needs no key. Garanția is the best alternative if the team wants a young-peer story.

## Eliminated (round 3)

- Local producer direct-sales platform: several Romanian players already (Legume Fericite, Farmlovers, others) — saturated.
- OLX safe-handoff with QR at partner shops: too close to existing delivery and locker services, and escrow-like.
- AI agent that calls businesses on your behalf: crowded (Instinct Concierge, AI Haggler, Assindo and others) and needs telephony.
- Group-project fairness tracker for students: thin as a startup.
- Teen-to-counselor anonymous relay: sensitive and needs moderation.
- Prompt broker for small shops: vague customer.
