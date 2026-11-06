# PRODUCT SPEC — منصة تعلّم البرمجة والذكاء الاصطناعي

> **Status:** Planning package v1.0 — awaiting review. No implementation has started.
> **Date:** 2026-11-04
> **Product codename:** `manhag` (internal only; the student never sees this name).
> **Student-facing language:** Arabic (MSA, Egypt) — 100%. Planning documents: English.

---

## 1. Product vision

**One sentence:** An Arabic-first interactive platform where Egyptian second-year secondary students *manipulate* the concepts of the Programming & AI curriculum — encryption, networks, web architecture, HTTP, frontend code, and design — instead of only reading about them.

**The problem.** The curriculum is concept-dense and abstract (TLS handshakes, client/server/database flows, CRAP design principles). Students can memorise definitions and still fail application questions, because nothing in their materials lets them see a request travel, watch a certificate fail, or break a layout and repair it. Existing Arabic resources are mostly PDFs, recorded lectures, or English-language interactive tools.

**The bet.** If a student can *cause* an HTTP 401, *watch* a session key appear on both sides, and *fix* a bad layout with feedback in Arabic, retention and exam readiness improve without adding teacher workload.

**Product principles (in priority order):**

| # | Principle | What it means in practice |
|---|---|---|
| P1 | **Arabic is the product, not a translation layer** | Layout, terminology, punctuation, and examples are authored in Arabic first. English appears only as a parenthetical technical term. |
| P2 | **Interaction must teach, not decorate** | Every animation maps to a curriculum concept. If we remove the animation, the student loses understanding — otherwise it is cut. |
| P3 | **One concept per screen** | No lesson screen carries two ideas. Simulation steps are single-idea. |
| P4 | **Mobile is the primary device** | Assume a 360 px-wide Android phone on a slow connection in a school lab or at home. Desktop is the enhancement. |
| P5 | **Failure is a teaching state** | Wrong answers and broken simulations produce explanations, never red "خطأ" alone. |
| P6 | **A solo developer must be able to ship it** | No microservices, no admin CMS in v1, no real-time collaboration, no native apps. |
| P7 | **Curriculum fidelity over invention** | We do not invent textbook details. Uncertain scope is flagged `TBC` and marked for teacher review. |

---

## 2. Target audience

### 2.1 Primary persona — «سارة», 16, student

- Second-year secondary (الصف الثاني الثانوي), general or technical track.
- Android phone, 3–6 GB data per month, shares one device with siblings.
- Studies in Arabic; reads English words slowly, especially technical terms.
- Studies at night, in 10–20 minute blocks; revises heavily before exams.
- **Needs:** quick wins, visible progress, explanations when wrong, nothing that requires a laptop.
- **Frustrations:** long videos with no control, English-only tutorials, sites that break on mobile, being told "خطأ" with no reason.
- **Success for her:** "فهمت إزاي المفتاح العام بيشتغل" — she can explain a step to a classmate.

### 2.2 Secondary persona — «أ. Mahmoud», 34, teacher

- Teaches 5 classes, 180 students; has a classroom projector and a personal laptop.
- **Needs:** project a simulation in class, step through it under his control, see which lessons students struggle with (post-MVP).
- **MVP need only:** the simulations must work on a projector at 1280×720 and be steppable by keyboard.

### 2.3 Tertiary persona — content author (the same solo developer, later a teacher)

- Writes lessons in structured files, needs a preview route and a schema that fails loudly on missing Arabic fields.

### 2.4 Anti-persona

- A school administrator who wants SIS integration, timetables, or grade export. Explicitly out of scope.

---

## 3. Assumptions and curriculum uncertainty

The brief is the only source of curriculum scope. No textbook, PDF, or ministry document is available and **none will be requested**.

| ID | Assumption / uncertainty | Impact | Simplest safe decision | Action |
|---|---|---|---|---|
| A-01 | Curriculum scope = the 4 units and 11 lessons in the brief | Determines all content work | Treat the brief as source of truth; keep lesson content modular so it can be re-scoped per file | Accepted |
| CU-01 | Depth expected for Unit 1 (How AI works) — conceptual only, or with terminology such as "training data", "model"? | Unit 1 lesson length and quiz difficulty | Teach the data→learning→output loop with everyday examples only; no model families | **Teacher review** |
| CU-02 | Official lesson numbering (2-1, 2-2 …) and whether Unit 1 has more than one lesson | URLs, navigation labels | Use brief numbering as display label; slug is stable | **Teacher review** |
| CU-03 | Whether the TLS handshake must be known step-by-step for the exam, or only conceptually | Depth of SIM-TLS-01 narration and quiz items | Ship 6 simplified steps; mark certificate-chain detail as optional ("للمتقدمين") | **Teacher review** |
| CU-04 | Exact list of "media types and their basic properties" (4-1) | Content completeness for a lesson we have no detail on | Cover the safe superset: نص، صورة، صوت، فيديو، رسوم متحركة + properties (الحجم، الجودة، الصيغة، معدل البت) | **Teacher review** |
| CU-05 | Definitions taught for page views and conversion rate | Numeric wording in SIM-EVAL-01 | Use plain definitions and one worked example; avoid industry nuance | **Teacher review** |
| CU-06 | Assessment format/weight in the official exam | Quiz length and scoring model | 5 questions per lesson, unweighted, self-check only — never presented as an official grade | Accepted |
| CU-07 | Whether students need a "practical project" deliverable | Roadmap scope | Out of MVP; noted in Phase 8 backlog | **Teacher review** |
| CU-08 | Ministry-preferred Arabic terms (e.g. «التشفير المتماثل» vs «التشفير بالتماثل») | Consistency of terminology | Lock the glossary in `CONTENT_GUIDELINES.md` §4; a single file change swaps terms globally | **Teacher review** |
| A-02 | Students have a browser with JavaScript enabled (Android Chrome ≥ 110 / iOS Safari ≥ 16) | Tech choices | Target those baselines; show a clear Arabic unsupported-browser notice | Accepted |
| A-03 | No school Wi-Fi guarantee | Offline strategy | Content pages are statically rendered + cached; progress is local; simulations need no network after load | Accepted |
| A-04 | No budget for paid services in MVP | Architecture | Zero external services in MVP (see §7 and `TECHNICAL_ARCHITECTURE.md` §9) | Accepted |
| A-05 | No authentication data can be trusted from a minor without a guardian process | Auth design | No accounts in MVP; anonymous device-local progress | Accepted |

---

## 4. User stories

Format: `US-xx` — story — **acceptance signal**.

### Browse & start

- **US-01** As a student, I want to land on a page that tells me in one glance what this platform teaches, so I trust it enough to start. → Hero is Arabic, above the fold, with one primary CTA «ابدأ التعلّم مجانًا»; first content paints < 2.5 s on Slow 4G.
- **US-02** As a student, I want to see all four units and their lessons, so I know the size of the commitment. → `/units` lists 4 units, each with lesson count and completion ratio.
- **US-03** As a student, I want to open a unit and see lesson order, so I can follow the curriculum sequence. → `/units/[unitSlug]` shows ordered lessons with status chips.
- **US-04** As a student, I want to continue from where I stopped without hunting, so I don't waste my short study block. → Dashboard shows «أكمل من حيث توقفت» with a resume CTA to the exact last incomplete lesson (or the simulation step if mid-simulation — step resume is post-MVP, lesson resume is MVP).

### Learn

- **US-05** As a student, I want a lesson in short Arabic sections with one idea each, so I can read on a phone without losing my place. → Lesson renders as sections of ≤ 120 words each, with a sticky progress bar and «الدرس التالي» at the end.
- **US-06** As a student, I want technical English terms next to their Arabic meaning the first time, so I can answer exam questions that use either. → First occurrence renders `المصادقة (Authentication)`; the term is also in the lesson glossary.
- **US-07** As a student, I want code and URLs to stay readable, so LTR lines don't scramble inside Arabic text. → All `<code>`/URL/protocol tokens use `dir="ltr"` isolation and monospace; verified by the RTL checklist.
- **US-08** As a student, I want a diagram that shows the idea, not just words. → Each lesson has ≥ 1 static SVG diagram that is described in Arabic for screen readers.

### Simulate

- **US-09** As a student, I want to start a simulation from the lesson, so the activity is tied to what I just read. → Lesson page has a «جرّب بنفسك» card with the simulation title, duration, and «ابدأ المحاكاة».
- **US-10** As a student, I want to control each step myself, so I can go at my speed. → Step controls: «التالي» / «السابق» / «إعادة»; the animation pauses on each step and never auto-advances past an unread explanation.
- **US-11** As a student, I want a hint when I'm stuck, so I don't abandon the activity. → «تلميح» reveals a graded hint (concept → direction → near-answer); using a hint is recorded but never punished.
- **US-12** As a student, I want to understand *why* my choice was wrong, so I learn instead of guessing. → Failure states render a specific Arabic explanation naming the misconception, plus a «أعد المحاولة» action.
- **US-13** As a student, I want to reset and try again, so experimentation is free. → «إعادة المحاكاة» restores the initial state in one action, with an undo toast for 5 s.

### Practise & assess

- **US-14** As a student, I want a few questions after each lesson, so I can check understanding immediately. → Quiz of 5 items; immediate per-question feedback with explanation; score shown at the end.
- **US-15** As a student, I want to see which questions I got wrong, so revision is targeted. → Results page lists each item with my answer, the correct answer, and the explanation, plus «راجع الدرس».
- **US-16** As a student, I want my retake to count, so I can improve. → Attempts are unlimited; the dashboard shows the best score and the last score, clearly labelled.

### Track

- **US-17** As a student, I want a progress page, so I can see what remains before an exam. → `/progress` shows per-unit completion, lesson status, simulation completion, quiz best scores, and total time studied.
- **US-18** As a student returning on another day, I want my progress intact, so I don't repeat lessons. → Progress survives reload and browser restart on the same device (localStorage), with an explicit Arabic note that progress is device-local until accounts exist.

### Secondary

- **US-19** As a teacher, I want to project a simulation and step it with arrow keys, so I can teach from the front of the class. → All step controls are keyboard-operable; focus ring visible; text ≥ 18 px at 1280×720.
- **US-20** As an author, I want a lesson preview that fails on missing Arabic, so broken content never ships. → Content validator runs in CI and in a `/preview/[lessonSlug]` route guarded by an env flag.

---

## 5. Functional requirements

Legend: **M** = MVP (must ship), **S** = MVP stretch (ship if Phase 4 finishes early), **L** = later. Each ID is referenced by `TASKS.md`.

### 5.1 Content & navigation (FR-C)

| ID | Requirement | Pri |
|---|---|---|
| FR-C-01 | Landing page states the value proposition in Arabic and offers two CTAs: «ابدأ التعلّم» and «تصفّح الوحدات». | M |
| FR-C-02 | The platform exposes 4 units / 11 lessons exactly as defined in `CURRICULUM_MAP.md`. | M |
| FR-C-03 | Units page lists units with title, description, lesson count, completion ratio, and a status chip (لم يبدأ / قيد التقدّم / مكتمل). | M |
| FR-C-04 | Unit page lists its lessons in curriculum order with duration, simulation badge, and quiz badge. | M |
| FR-C-05 | Lesson page renders title, objectives, sections, diagrams, examples, glossary, embedded simulation card, and a quiz CTA. | M |
| FR-C-06 | Every page has breadcrumb navigation in Arabic (`الرئيسية / الوحدات / الأمن السيبراني / التشفير والمصادقة`) with `dir="rtl"` separators that mirror correctly. | M |
| FR-C-07 | Previous/next lesson navigation respects curriculum order and the unit boundary. | M |
| FR-C-08 | Unknown slug returns a branded Arabic 404 («الصفحة غير موجودة») with links back to الوحدات. | M |
| FR-C-09 | Content pages are statically generated from local content files at build time (no CMS dependency). | M |
| FR-C-10 | A `/preview/[lessonSlug]` route renders unfinished content for authors, disabled in production builds unless `ENABLE_PREVIEW=1`. | L |

### 5.2 Lesson reading (FR-L)

| ID | Requirement | Pri |
|---|---|---|
| FR-L-01 | Lessons are composed of typed blocks: `paragraph`, `callout`, `diagram`, `example`, `code`, `term`, `activity`, `checkpoint`. | M |
| FR-L-02 | Reading position is remembered per lesson (closest section) and restored on return. | S |
| FR-L-03 | A lesson is auto-marked «مقروء» when the student reaches the final section, or manually via «أنهيت الدرس». | M |
| FR-L-04 | Technical terms render as Arabic + English on first occurrence in the lesson, and are collected in a per-lesson glossary block. | M |
| FR-L-05 | Every diagram has an Arabic `alt`/`desc` and a text equivalent table. | M |
| FR-L-06 | Long code samples are collapsible on mobile and always LTR. | M |
| FR-L-07 | Estimated reading time is computed from word count (150 Arabic words/min) and shown in the lesson header. | M |

### 5.3 Simulations (FR-S)

| ID | Requirement | Pri |
|---|---|---|
| FR-S-01 | Simulations are lazily loaded per route (`/lessons/[lessonSlug]/sim/[simSlug]`) and never block lesson paint. | M |
| FR-S-02 | Every simulation declares metadata (title, objectives, duration, difficulty) from a single registry. | M |
| FR-S-03 | Step navigation supports التالي / السابق / إعادة, plus a step indicator «الخطوة ٢ من ٦» and a clickable step timeline. | M |
| FR-S-04 | Each step surfaces a short Arabic explanation (≤ 45 words) in a narration panel; explanation text is in the content file, not hardcoded in components. | M |
| FR-S-05 | Hints are graded (3 levels) and dismissible; hint usage is recorded in progress. | M |
| FR-S-06 | Completion requires satisfying the simulation's success predicate, not merely reaching the last step. | M |
| FR-S-07 | Reset restores initial state in one action, with an undo window of 5 s. | M |
| FR-S-08 | Every simulation exposes a deterministic reducer state so it can be unit-tested without a DOM. | M |
| FR-S-09 | Simulations announce step changes to assistive tech via an `aria-live="polite"` region. | M |
| FR-S-10 | Simulations are usable with keyboard only (Tab to controls, Enter/Space to activate, ←/→ for steps). | M |
| FR-S-11 | A simulation can be deep-linked to a step (`?step=3`) for classroom use. | S |
| FR-S-12 | Preferred-reduced-motion is honoured: step transitions become instant cross-fades with no travel animation. | M |

### 5.4 Practice & assessment (FR-Q)

| ID | Requirement | Pri |
|---|---|---|
| FR-Q-01 | Each lesson has a 5-item quiz (`single-choice` only in MVP; `true-false` allowed as a 2-option variant). | M |
| FR-Q-02 | One question per screen with «سؤال ٢ من ٥» and a progress bar. | M |
| FR-Q-03 | Answering reveals immediate feedback + explanation, then «السؤال التالي». | M |
| FR-Q-04 | Results page shows score, percentage, per-question review, and two actions: «أعد المحاولة» and «راجع الدرس». | M |
| FR-Q-05 | Quiz attempts are stored locally with timestamp, answers, score, and duration. | M |
| FR-Q-06 | A lesson counts as «مكتمل» only when read **and** quiz passed at ≥ 60%. | M |
| FR-Q-07 | Questions are shuffled per attempt from a pool of ≥ 6 per lesson; the order and choice order are stable within an attempt. | M |
| FR-Q-08 | A question can be flagged for teacher review (`needsReview: true`) and renders a discreet notice. | M |
| FR-Q-09 | Free-text / multi-select / drag-answer item types. | L |

### 5.5 Progress (FR-P)

| ID | Requirement | Pri |
|---|---|---|
| FR-P-01 | Progress is stored under a versioned localStorage key (`manhag.progress.v1`) with a JSON schema version field. | M |
| FR-P-02 | Dashboard shows: continue-learning card, 4 unit cards with ratios, last quiz result, current streak (consecutive days with activity). | M |
| FR-P-03 | Progress page shows per-lesson status, simulation completion, quiz best/last scores, and total active minutes. | M |
| FR-P-04 | Corrupted or older progress data is migrated or safely reset with an Arabic notice (never a crash). | M |
| FR-P-05 | A visible Arabic note explains that progress lives on this device, with a «كيف أحتفظ بتقدّمي؟» help entry. | M |
| FR-P-06 | Export/import progress as a copyable code (device transfer without accounts). | S |
| FR-P-07 | Server-side progress synced to an account across devices. | L |

### 5.6 Accounts (FR-U)

| ID | Requirement | Pri |
|---|---|---|
| FR-U-01 | No login required to use any MVP learning content. | M |
| FR-U-02 | Login/registration with email + password, server sessions, and password reset (`RESEND`-style transactional email). | L |
| FR-U-03 | On first login, local progress is merged into the account (server wins on conflicts, newest timestamp per lesson wins). | L |
| FR-U-04 | Account deletion removes progress and attempts within 30 days. | L |

### 5.7 Admin / authoring (FR-M)

| ID | Requirement | Pri |
|---|---|---|
| FR-M-01 | Content is authored as TypeScript files under `src/content/`, validated at build time. | M |
| FR-M-02 | No admin dashboard in MVP (rationale in §7.3). | M |
| FR-M-03 | Admin dashboard: CRUD units/lessons/questions, media upload, preview, publish/unpublish. | L |
| FR-M-04 | Content version is embedded in the build and shown in the footer (helps support). | M |

### 5.8 Localization & RTL (FR-A)

| ID | Requirement | Pri |
|---|---|---|
| FR-A-01 | `<html lang="ar" dir="rtl">` on every route; no page overrides it. | M |
| FR-A-02 | All student-facing strings are Arabic and sourced from content files or `src/i18n/ar.ts`; no English string literals in components (enforced by lint rule / review checklist). | M |
| FR-A-03 | Numerals: Western digits (0–9) everywhere, including step counters and scores — including in Arabic sentences. | M |
| FR-A-04 | LTR islands: code, URLs, protocol names, and identifiers wrapped in `dir="ltr"` + `unicode-bidi: isolate`. | M |
| FR-A-05 | Directional icons (arrows, chevrons) mirror in RTL; non-directional icons (lock, warning) do not. | M |
| FR-A-06 | Arabic font loaded with `font-display: swap`, subset to Arabic + Latin basic, self-hosted. | M |
| FR-A-07 | Mixed Arabic/English sentences keep correct punctuation (Arabic comma «،»، question mark «؟») and never break parentheses. | M |
| FR-A-08 | An `ar` i18n scaffold exists so a future `en` locale is possible, but English UI is not built in v1. | S |

---

## 6. Non-functional requirements

| ID | Requirement | Target / measurement |
|---|---|---|
| NFR-01 | Performance on mid-range Android (Slow 4G, 4× CPU throttle) | LCP < 2.5 s lesson page; TBT < 200 ms; simulation route JS ≤ 180 KB gzip |
| NFR-02 | Mobile-first layout | No horizontal scroll at 320 / 360 / 390 / 414 / 768 px; tap targets ≥ 44×44 px |
| NFR-03 | Accessibility | WCAG 2.1 AA: contrast ≥ 4.5:1 body text, ≥ 3:1 large text and UI borders; full keyboard operability; visible focus; no motion-only meaning |
| NFR-04 | Arabic typography | Line height ≥ 1.8 for body; no clipped diacritics or descenders at 320 px; no mid-word breaking of Latin technical terms |
| NFR-05 | Reliability | Static pages; simulation state is client-only and must never white-screen — an error boundary shows Arabic recovery UI |
| NFR-06 | Privacy | No third-party analytics requiring consent in MVP; no PII collected; no student data leaves the device |
| NFR-07 | Security | No secrets in client bundle; strict CSP; no `dangerouslySetInnerHTML` on content except through the vetted renderer; playground runs in a sandboxed iframe |
| NFR-08 | Maintainability | Adding a lesson = adding one content file + one registry entry; adding a simulation = one folder + one registry entry, zero changes to existing sims |
| NFR-09 | Browser support | Chrome/Edge ≥ 110, Firefox ≥ 110, Safari (iOS) ≥ 16; graceful Arabic notice otherwise |
| NFR-10 | Cost | $0/month at MVP scale (≤ 500 monthly active students, static hosting) |
| NFR-11 | Test coverage of logic | ≥ 80% line coverage on `src/lib/**` and simulation reducers; E2E covers the 6 critical journeys |
| NFR-12 | Content quality | 0 untranslated strings; 0 missing explanations in quizzes; content validator passes in CI |

---

## 7. MVP scope

### 7.1 Definition of MVP (v1.0)

A student can, **on a phone, in Arabic**, browse all 4 units, read all 11 lessons, complete 4 interactive simulations (3 core + 1 stretch), answer a 5-question quiz per lesson, and see persistent progress — with no account and no server.

**Included:**

1. All 11 lessons with Arabic content, diagrams, glossaries (Unit 1 trimmed to one lesson per brief).
2. Simulation engine + shell (steps, narration, hints, reset, a11y, keyboard).
3. `SIM-HTTP-01` (طلب واستجابة HTTP), `SIM-ARCH-01` (بنية تطبيق الويب), `SIM-TLS-01` (اتصال HTTPS/TLS).
4. `SIM-AI-01` (كيف تتعلم الآلة) as the **MVP stretch** — lesson 1's activity.
5. Lesson quizzes (5 items from a 6–8 item pool) + results + review.
6. Device-local progress, dashboard, progress page, resume.
7. Design system + Arabic RTL foundation (tokens, fonts, layout primitives).
8. Static deployment, error/404 pages, RTL + a11y test pass.

### 7.2 Explicitly postponed (with reason)

| Item | Reason | Target |
|---|---|---|
| `SIM-FE-01` frontend playground | Highest value but needs sandboxed iframe, 3-pane mobile UX, and careful CSP work; ~4 days | v1.1 |
| `SIM-NET-01` network design | Drag-and-place graph with scoring is the most expensive sim (~5.5 days) and has the least exam-critical content | v1.1 |
| `SIM-IR-01`, `SIM-MEDIA-01`, `SIM-UX-01`, `SIM-EVAL-01`, `SIM-ITER-01` | Cheap, data-driven "activity" class; build after the engine proves itself | v1.2–v1.3 |
| Accounts, sync, password reset | Zero trust benefit for a minor's first release; adds attack surface and cost | v1.4 |
| Admin CMS | 11 lessons do not justify it; files + CI validation are faster and safer | v2.0 (only if a second author joins) |
| Teacher dashboard, class codes, grade export | Requires accounts and a privacy policy for minors | v2 |
| Offline PWA / service worker | Useful but not required for first release; add once content stabilises | v1.5 |
| Analytics | Privacy and consent cost outweigh insight at 0 users | v1.5 (privacy-friendly, aggregate only) |

### 7.3 Admin dashboard decision (rationale)

**Decision: files, not a CMS, for MVP.**

- Volume: 11 lessons, ~55 questions. A CMS saves less time than it costs to build + secure.
- Safety: content in git gives review, diff, and rollback for free.
- Cost: zero database, zero auth surface, static hosting for free.
- **Trigger to revisit:** more than one non-technical author, or > 40 lessons, or content edits needed more than weekly without a deploy. Then build the minimum in FR-M-03 (create/edit lesson, manage questions, preview, publish toggle) — not a general-purpose CMS.

### 7.4 Smallest realistic MVP (MVP-lite, if time is short)

4 lessons (U2-1, U3-1, U3-2, U2-2) + 2 simulations (`SIM-HTTP-01`, `SIM-ARCH-01`) + quizzes + local progress + deploy. ≈ 22 developer-days. It still proves the core loop: read → simulate → check → track. Everything else is content fill-in on a proven shell.

---

## 8. Success metrics

| Metric | Definition | Target (first term) |
|---|---|---|
| Lesson completion | % of started lessons reaching «مكتمل» | ≥ 55% |
| Simulation completion | % of launched sims reaching success state | ≥ 65% |
| Quiz pass rate | First-attempt score ≥ 60% | 45–75% (outside this band means the lesson or the quiz is miscalibrated) |
| Hint usage | % of sim sessions using ≥ 1 hint | 20–50% (too low = unclear; too high = too hard) |
| Mobile share | Sessions on width < 768 px | Informational: expect > 80% |
| RTL defects | Reported mixed-direction rendering bugs per release | 0 |
| Return rate | Students active on ≥ 2 distinct days | ≥ 35% |

Instrumentation for these is post-MVP (privacy-first); until then, measure with a manual review of 10 student sessions.

---

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Curriculum mismatch with the official textbook (CU-01…CU-08) | Medium | High | Flagged TBC items; one teacher review before content freeze; terminology driven by a single glossary file |
| Simulations overbuilt, MVP slips | High | High | Hard rule: no sim beyond its spec's acceptance criteria; engine features gated by two consumers |
| Arabic RTL bugs found late | Medium | Medium | RTL checklist in CI review, RTL test cases in Phase 0/2, no left/right CSS utilities at all |
| Mobile performance on low-end Android | Medium | High | Static pages, lazy sim bundles, perf budget in Phase 6, test on throttled profile |
| Solo-developer burnout / scope creep | High | High | Fixed MVP list in §7.1; everything else explicitly postponed; phases ship independently |
| Content quality (Arabic pedagogy) | Medium | High | `CONTENT_GUIDELINES.md` + review checklist + "one idea per section" rule |
| Font load blocking Arabic text | Low | Medium | Self-hosted subset, `swap`, preload only the 400/700 weights |

---

## 10. Glossary (product level)

| Arabic | English | Note |
|---|---|---|
| محاكاة تفاعلية | Interactive simulation | Student-facing word is «محاكاة» or «جرّب بنفسك» |
| درس | Lesson | |
| وحدة | Unit | |
| اختبار قصير | Quiz | Never «امتحان» — avoids implying an official grade |
| تقدّم | Progress | |
| تلميح | Hint | |
| إعادة | Reset | |
| أهداف الدرس | Learning objectives | |

Full terminology rules: `CONTENT_GUIDELINES.md` §4.
