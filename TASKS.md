# TASKS — قائمة العمل التنفيذية

> Prioritised implementation backlog for a solo developer. One task = one focused work session that can be reviewed independently.
> **Estimates** are focused developer-days (6 h) including that task's tests. **Priority:** `P0` = required for v1.0 release · `P1` = required for the quality gate, may slip one week with written risk · `P2` = post-MVP / optional.
> **Status:** `todo` for every task (nothing has been implemented).

---

## 0. How to use this file

1. Work top-to-bottom inside a phase; do not start a phase before its dependencies are `done`.
2. A task is `done` only when its acceptance criteria are verified **and** `npm run verify` is green.
3. If a task reveals new work, add a task with the next free ID — never widen the current task silently.
4. Update this file in the same commit as the work.
5. Stop at the **Release A** marker and deploy; do not continue into Phase 4 without a deployable URL.

**Phase effort summary**

| Phase | Tasks | Days | Cumulative |
|---|---|---|---|
| 0 — Setup & design foundation | 10 | 5.0 | 5.0 |
| 1 — Content structure (3 pilot lessons) | 12 | 7.0 | 12.0 |
| 2 — Core student experience | 12 | 9.0 | 21.0 |
| 3 — Sim engine + HTTP sim | 8 | 6.0 | **27.0 (Release A)** |
| 4 — Three more sims | 11 | 10.5 | 37.5 |
| 5 — Quizzes + remaining content | 16 | 9.5 | 47.0 |
| 6 — Quality gate | 11 | 5.0 | 52.0 |
| 7 — Release | 5 | 2.0 | **54.0** |
| 8 — Post-MVP backlog | 6 | unscheduled | — |

---

## 1. Phase 0 — Project setup & design foundation (5.0 days)

| ID | Task description | Deps | Acceptance criteria | Days | Pri |
|---|---|---|---|---|---|
| **T-0101** | Scaffold the repo: Next.js 15 App Router, TypeScript `strict` + `noUncheckedIndexedAccess`, Tailwind CSS v4, ESLint + Prettier, `src/` folder skeleton, `output: 'export'`, npm scripts (`dev`, `build`, `typecheck`, `lint`, `verify`). | — | `npm run build` emits `out/`; `tsc --noEmit` and `eslint . --max-warnings=0` pass; folder layout matches `TECHNICAL_ARCHITECTURE.md` §3; lockfile committed. | 0.5 | P0 |
| **T-0102** | Arabic RTL root: `<html lang="ar" dir="rtl">`, self-hosted Cairo (400/600/700/800, `arabic`+`latin` subsets via `next/font/local`), `tokens.css` with every colour/spacing/radius token from `UX_UI_SPEC.md` §2. | 0101 | Arabic text renders in Cairo on `/`; no flash of Latin fallback; all §2.1 tokens exist as CSS variables and Tailwind theme entries; `/verify` green. | 0.5 | P0 |
| **T-0103** | UI primitives set A: `Button` (4 variants, 3 sizes, loading), `Card`, `Chip`, `Callout` (4 tones). | 0102 | Each renders in a scratch page at 360 px; tap targets ≥ 44 px; focus ring visible; loading state shows «جارٍ…»; keyboard operable. | 0.75 | P0 |
| **T-0104** | UI primitives set B: `ProgressBar` (role/aria), `Skeleton`, `Sheet` (focus trap + Esc), `SkipLink`. | 0103 | ProgressBar exposes `aria-valuenow` and Arabic value text; Sheet traps focus and restores it; SkipLink is first in tab order and jumps to `<main>`. | 0.75 | P0 |
| **T-0105** | Layout shell: `Header` (logo + 3 nav items + CTA), `Footer` (links + content version slot), `BottomNav` (3 items, mobile only), `Breadcrumb` (RTL separators, `aria-current`). | 0104 | Header/footer consistent on 2 routes; bottom nav visible < 768 px only; breadcrumb reads right→left with correct chevrons; active nav item marked. | 0.5 | P0 |
| **T-0106** | `src/i18n/ar.ts` shared copy deck (all strings from `UX_UI_SPEC.md` §7) and an ESLint rule (or custom check) that fails on Arabic string literals inside `src/components/**`. | 0102 | Deck covers every shared string used so far; a deliberate Arabic literal in a component fails lint; English literal in a component fails review checklist item in PR template. | 0.5 | P0 |
| **T-0107** | CI pipeline: install → typecheck → lint → unit tests (vitest placeholder) → content validation placeholder → build; dependency caching. | 0101 | A PR with a type error is red; a clean PR is green in < 6 min; artifacts (`out/`) uploaded. | 0.5 | P0 |
| **T-0108** | Deploy the skeleton to Vercel: static export, CSP + security headers, immutable asset caching, HTML revalidation. | 0107 | Public URL serves the shell; headers verified via `curl -I`; no CSP violation in console; font served from same origin. | 0.5 | P0 |
| **T-0109** | Developer conventions: PR template (Arabic/RTL checklist + "no new dependency without rationale"), component/test file templates, one ADR recording the static-export-first decision. | 0106 | Template exists and is used by the next PR; ADR states the decision, alternatives, and the Phase 5 trigger. | 0.25 | P1 |
| **T-0110** | Real-device foundation check at 360 px (Android) + fix discovered RTL/typography issues. | 0105, 0108 | Screenshots of 4 routes on a real phone; zero horizontal scroll; no clipped Arabic glyphs; issues fixed or filed with IDs. | 0.25 | P0 |

**Phase 0 exit:** deployable Arabic RTL shell, 8 primitives, CI and conventions in place.

---

## 2. Phase 1 — Curriculum & content structure (7.0 days)

| ID | Task description | Deps | Acceptance criteria | Days | Pri |
|---|---|---|---|---|---|
| **T-0201** | `content/schema.ts`: zod schemas + TS types for `Unit`, `Lesson`, `Block` (8 kinds), `Objective`, `Question`, `GlossaryEntry`, `Quiz`. | 0101 | Types compile; zod parses a hand-written sample fixture; `Block` is a discriminated union with no nesting; schema documented in TSDoc. | 0.5 | P0 |
| **T-0202** | Content registry + helpers: `units`, `lessons`, `questions` maps; `getUnit`, `getLesson`, `getLessonBySlug`, `orderedLessons`, `nextLesson`, `prevLesson`, `unitForLesson`. | 0201 | Unit tests cover cross-unit prev/next boundaries; unknown slug returns `undefined` (no throw); duplicates throw at module load. | 0.5 | P0 |
| **T-0203** | `scripts/validate-content.ts`: all rules from `TECHNICAL_ARCHITECTURE.md` §5.2 (Arabic presence, explanation required, 1 correct choice, unique IDs/slugs, sim exists, hints ≥ 3, narration ≤ 60 words, Latin-punctuation warning) and `npm run validate:content`. | 0201 | A fixture set of 8 deliberately broken lessons each fails with a message naming field and lesson; a valid lesson passes; CI runs it. | 0.75 | P0 |
| **T-0204** | Lesson blocks A: `paragraph`, `heading`, `callout`, `term` (Arabic + parenthetical English, first-occurrence logic). | 0202 | Blocks render with correct heading levels; `term` shows English once per lesson and adds to glossary; Arabic line-height ≥ 1.8; DOM has no English-only text. | 0.75 | P0 |
| **T-0205** | Diagram block: inline SVG renderer by `diagramId`, caption, «وصف النص» toggle, `role="img"` + Arabic label. | 0204 | 3 diagrams render at 320–1280 px without distortion; each has a text description in an accordion; keyboard reachable. | 0.5 | P0 |
| **T-0206** | Code block (LTR, copy, collapse > 12 lines) + checkpoint block (question with reveal). | 0204 | Code is `dir="ltr"` with mono font, copy works, collapse keeps Arabic caption RTL; checkpoint reveals answer with `aria-expanded`. | 0.5 | P0 |
| **T-0207** | Lesson page assembly: header (unit chip, title, meta, display number), objectives card, section list, glossary accordion, prev/next footer. | 0204, 0205, 0206 | A lesson renders end-to-end from content; one `<h1>`; objectives before first section; footer nav respects curriculum order. | 0.75 | P0 |
| **T-0208** | Write `U2-L1` (التشفير والمصادقة): 6–7 sections, 2 diagrams, glossary (8 terms), 8 questions with explanations, activity reference to `SIM-TLS-01`. | 0207 | Passes validator; objectives U2-L1-O1…O8 each covered by ≥ 1 question; Arabic review checklist §10 complete; no invented textbook detail. | 0.75 | P0 |
| **T-0209** | Write `U3-L1` (البنية العامة لتطبيقات الويب): 5–6 sections, 2 diagrams, 6 questions. | 0207 | Same bars as T-0208 for U3-L1-O1…O5. | 0.75 | P0 |
| **T-0210** | Write `U3-L2` (أساليب الاتصال): 5–6 sections, request/response diagram, 7 questions. | 0207 | Same bars for U3-L2-O1…O5; status codes limited to the six in the curriculum map. | 0.75 | P0 |
| **T-0211** | Unit metadata for all 4 units (titles, descriptions, colour, order, lesson counts) — no lesson content yet. | 0202 | `/units` data ready; unit order and titles match `CURRICULUM_MAP.md` §1 exactly; no placeholder Arabic text. | 0.25 | P0 |
| **T-0212** | Content review round 1: self-check, Arabic read-through, validator fixes, teacher questions for CU-03 drafted. | 0208, 0209, 0210 | 3 lessons pass validator; 5 flagged questions collected in one document for the teacher; zero Latin punctuation warnings. | 0.25 | P1 |

**Phase 1 exit:** content pipeline that rejects broken content; 3 pilot lessons reading correctly on a phone.

---

## 3. Phase 2 — Core student experience (9.0 days)

| ID | Task description | Deps | Acceptance criteria | Days | Pri |
|---|---|---|---|---|---|
| **T-0301** | Landing page per `UX_UI_SPEC.md` §5.1: hero, CTAs, 4 unit cards, 3-step explainer, value props, footer; static TLS preview illustration. | 0105, 0211 | All copy Arabic; LCP ≤ 2.5 s on throttled mobile; 3 taps from `/` to a lesson; returning-user bar appears only when progress exists. | 1.25 | P0 |
| **T-0302** | `/units` index: 4 large unit cards with lesson count, duration, progress bar, status chip. | 0211 | Ratios correct for 0% and 100%; status chips map to the three Arabic states; no horizontal scroll at 320 px. | 0.75 | P0 |
| **T-0303** | `/units/[unitSlug]` with `generateStaticParams`: header, objectives, ordered `LessonRow`s, badges, «تابع من الدرس n», prev/next unit. | 0302 | 4 static pages generated; badges show only for available sims/quizzes; «تابع» targets the first incomplete lesson. | 0.75 | P0 |
| **T-0304** | Lesson page refinements: reading progress bar, section anchors + «محتويات» sheet, reading-position memory, «أنهيت الدرس», sticky header on mobile. | 0207, 0303 | Progress bar tracks sections ±1; anchors work with sticky header offset; position restored after reload; mobile header doesn't cover headings. | 0.75 | P0 |
| **T-0305** | Progress store: Zustand + `persist`, zod parse/strip, `schemaVersion` + `migrate`, corrupt-data reset, quota fallback, SSR-safe import. | 0201 | Unit tests UT-PROG-01…12 pass; no `localStorage` access during SSR; corrupt JSON never crashes a page. | 1.0 | P0 |
| **T-0306** | Progress selectors + completion rule (read + quiz ≥ 60%) + unit/overall ratios + streak + `nextLessonToStudy`. | 0305 | Boundary tests at 2/5 and 3/5; ratios exact for 0, partial, and complete units; no derived value stored. | 0.75 | P0 |
| **T-0307** | Dashboard part 1: continue-learning card (or first-lesson variant) + 3 stat cards. | 0306 | Continue card points at the correct lesson in 4 states (empty, reading, quiz-failed, complete); stats match stored data after reload. | 0.75 | P0 |
| **T-0308** | Dashboard part 2: unit grid + last-3-activity list + empty state + loading skeletons. | 0307 | Skeletons reserve correct heights (CLS ≈ 0); empty state has one action; relative Arabic dates («أمس»، «قبل 3 أيام») verified. | 0.75 | P0 |
| **T-0309** | `/progress`: summary ring, per-unit accordions with per-lesson status and best score, «ما زال متبقيًا», 14-day activity grid, device-local help dialog. | 0306 | Numbers match dashboard for the same state; help dialog explains device-local storage in ≤ 80 Arabic words; keyboard operable. | 0.75 | P0 |
| **T-0310** | `not-found.tsx`, `error.tsx`, footer content version, offline notice, generic error/empty components wired. | 0105 | Unknown lesson/unit slugs show Arabic 404 with 2 links; thrown render error shows recovery UI without losing progress; version visible in footer. | 0.5 | P0 |
| **T-0311** | Navigation behavior: header active states, mobile menu sheet, bottom-nav routing, scroll restoration, back-to-top on long lessons. | 0301 | Active route highlighted on all 6 routes; menu closes on navigation and on `Esc`; scroll position restored on back. | 0.5 | P0 |
| **T-0312** | Phase 2 RTL/empty/error pass on a real phone; fix issues; capture screenshots for the release notes. | 0308, 0309, 0310, 0311 | RTL-01…RTL-09 pass on all Phase 2 routes; all empty/error states reachable and correct; screenshots stored in `docs/` review folder. | 0.5 | P0 |

**Phase 2 exit:** read-and-track loop complete. A student can reach, read, complete, and resume a lesson with no simulation.

---

## 4. Phase 3 — Simulation engine + `SIM-HTTP-01` (6.0 days)

| ID | Task description | Deps | Acceptance criteria | Days | Pri |
|---|---|---|---|---|---|
| **T-0401** | `simulations/types.ts` + `registry.ts` (static meta + lazy loaders + graceful "not available yet" state). | 0201 | Types match `TECHNICAL_ARCHITECTURE.md` §4.1; unknown sim renders Arabic fallback card; meta importable without pulling a sim chunk. | 0.5 | P0 |
| **T-0402** | Shell A: `SimFrame` (header, back link, step progress), `SimStage` (fixed ratio, a11y label, reduced-motion context), `SimNarration`, `SimControls` (next/prev/reset/dots, ←/→ keys). | 0401, 0104 | Stage height stable across steps at 360 px and 1280 px; next disabled when `canAdvance` false; keyboard works; narration is `aria-live="polite"`. | 1.25 | P0 |
| **T-0403** | Shell B: `SimHint` (3 levels, labels change), `SimResult` (success/failure, retry, next), `useSimulation` hook (reducer, announcements, progress write, reset+undo). | 0402, 0305 | Hint level caps at 3 and resets on step change; result card names the skill; completion writes progress exactly once; undo window 5 s. | 0.75 | P0 |
| **T-0404** | `SIM-HTTP-01` machine + fixtures: 6 endpoints, missions 1–4, actions (`selectMission`, `inspect`, `predict`, `send`, `next`, `reset`), `canAdvance`, `evaluateSuccess`, reducer tests. | 0401 | UT-SIM-01…11 pass for this machine; every endpoint returns its specified status; reset is deep-equal to initial. | 0.75 | P0 |
| **T-0405** | `SIM-HTTP-01` stage + Arabic content: builder panel, hotspot tour, prediction, response panel with status meaning, 401/403 sort, 9-step narration, hints. | 0404 | All 4 missions completable; status meaning visible as text; mismatch path teaches; narration ≤ 45 words per step; content passes validator. | 1.25 | P0 |
| **T-0406** | Sim route `/lessons/[lessonSlug]/sim/[simSlug]`: static shell + dynamic client chunk, loading skeleton, error card, lesson-page activity card with completion chip. | 0405, 0207 | Route works for all 11 lessons (fallback for missing sims); JS chunk ≤ 180 KB gzip; sim card shows duration and completion state. | 0.5 | P0 |
| **T-0407** | Tests: component test for shell + Playwright happy path + keyboard path + reset test. | 0405, 0406 | CT-07…09 pass; E2E-02 and E2E-09 pass on mobile-360 and desktop-1280. | 0.5 | P0 |
| **T-0408** | **Release A:** deploy, observe 3 students for 20 minutes, write findings, file fixes. | 0406, 0108 | Deployed URL works on a real phone; 3/3 students complete the sim without help beyond one hint; findings documented with severity. | 0.5 | P0 |

**Phase 3 exit (Release A):** one playable simulation, deployed, observed. **Pause here if time is short — this is the MVP-lite.**

---

## 5. Phase 4 — Additional MVP simulations (10.5 days)

| ID | Task description | Deps | Acceptance criteria | Days | Pri |
|---|---|---|---|---|---|
| **T-0501** | Extract shared sim primitives now that a second sim needs them: `NodeCard`, `Packet`, `KeyBadge`, `VerifyCheck`, `Transcript`. | 0402 | Each primitive has one consumer + tests; TLS/ARCH compose them; no prop drilling beyond 2 levels. | 0.75 | P0 |
| **T-0502** | `SIM-ARCH-01` machine + content: 3 missions, fault states, 8 steps narration, 3 hints per step. | 0401, 0501 | Reducer tests cover each mission and each fault; `canAdvance` requires all three inspectors; content validator passes. | 0.75 | P0 |
| **T-0503** | `SIM-ARCH-01` stage: RTL three-node flow, server sub-steps, DB table read/write visuals, fault lab, mission tabs. | 0502 | Mission 1 (7 steps) and mission 2 (write + 201 + new row) complete; 3 faults produce distinct explained outcomes; vertical layout at 360 px. | 1.25 | P0 |
| **T-0504** | `SIM-ARCH-01` tests + a11y pass (inspectors, table semantics, fault toggles). | 0503 | All acceptance criteria in `SIMULATION_SPECS.md` §3.18 verified; axe clean on the sim route; keyboard-only completion. | 0.25 | P0 |
| **T-0505** | `SIM-TLS-01` machine + content: 6 steps, cert scenarios (valid/expired/MITM), key exchange actions, 3 hints per step, assessment mapping. | 0501 | Reducer tests cover success, wrong order, failed check, reset; no randomness on the main path; narration matches spec verbatim or better. | 1.25 | P0 |
| **T-0506** | `SIM-TLS-01` stage A: browser/server nodes, packet travel, certificate `<dialog>` with 3 interactive checks, padlock state. | 0505 | All 3 checks required before advancing; `Esc` closes dialog and restores focus; padlock change has icon + word; works at 360 px. | 1.5 | P0 |
| **T-0507** | `SIM-TLS-01` stage B: key generation/transfer, encrypted payload inspector (observer vs server), insecure comparison, attacker toggle. | 0506 | Same message shows ciphertext to the observer and plaintext at the server; HTTP comparison reveals the password; attacker view explains the failure. | 1.25 | P0 |
| **T-0508** | `SIM-TLS-01` tests + a11y + transcript toggle. | 0507 | Full acceptance list §2.18; reduced-motion path verified; transcript makes the sim completable without animation; Playwright happy path green. | 0.75 | P0 |
| **T-0509** | `SIM-AI-01` machine + content: labeling flow, accuracy meter, test view, bad-example injection. | 0501 | Accuracy reaches 100% with 8 labels; bad example drops accuracy and flips exactly 1 prediction; pure reducer; Arabic callout present. | 1.0 | P1 |
| **T-0510** | `SIM-AI-01` stage + mobile tap-only flow + tests. | 0509 | Tap-only completion at 320 px; `role="meter"` with text alternative; reset clears labels/predictions; acceptance list §7.19. | 1.0 | P1 |
| **T-0511** | Visual regression baselines for 3 sims × 3 stages × 2 widths + real-device pass + fixes. | 0504, 0508, 0510 | 18 baselines committed; diffs reviewed; real Android run with no jank on packet animation (measured, not assumed). | 0.75 | P1 |

**Phase 4 exit:** 3–4 simulations meet their specs; shared primitives stable.

---

## 6. Phase 5 — Quizzes, completion rules & remaining content (9.5 days)

| ID | Task description | Deps | Acceptance criteria | Days | Pri |
|---|---|---|---|---|---|
| **T-0601** | Quiz types + question bank structure (pool ≥ per-lesson target, `objectiveId`, `explanation`, `needsReview`, stable `choiceId`s). | 0201 | Validator enforces pool size, one correct choice, explanation presence; objective coverage report generated. | 0.5 | P0 |
| **T-0602** | `QuizRunner`: one question per screen, «سؤال n من 5», confirm-then-feedback, progress bar, exit confirmation, no back navigation. | 0601, 0104 | CT-03 passes; feedback appears only after confirm; exit warns and records nothing; keyboard + screen reader usable. | 0.75 | P0 |
| **T-0603** | Results page: score header, pass/fail copy, review list (student answer vs correct + explanation), retry, «راجع الدرس» deep links to section anchors. | 0602 | Boundary scores 2/5 and 3/5 show correct copy; every item shows an explanation; deep links land on the right section with sticky-header offset. | 0.75 | P0 |
| **T-0604** | Attempt recording + seeded shuffle (stable within attempt, different across attempts) + best/last derivation. | 0602, 0305 | Same attempt reload keeps order; 3 retakes produce ≥ 2 distinct first questions (seeded test); 20-attempt cap works. | 0.25 | P0 |
| **T-0605** | Completion integration: derived lesson status across lesson page, unit page, dashboard, progress page; «مكتمل» requires read + ≥ 60%. | 0604, 0306 | One state change reflects in all 4 surfaces after reload; no stale badges; sim completion still recorded separately. | 0.25 | P0 |
| **T-0606** | Content `U1-L1` (كيف يعمل الذكاء الاصطناعي) + 6 questions + 1 diagram + `SIM-AI-01` reference. | 0601 | Objectives U1-L1-O1…O5 covered; CU-01 flag recorded; validator passes. | 0.75 | P0 |
| **T-0607** | Content `U2-L2` (تصميم أمن الشبكات) + 7 questions + 1 diagram. | 0601 | Objectives U2-L2-O1…O5 covered; network diagrams use Arabic labels only. | 0.75 | P0 |
| **T-0608** | Content `U2-L3` (الاستجابة للحوادث) + 6 questions + risk diagram + `SIM-IR-01` reference (fallback card until built). | 0601 | Objectives U2-L3-O1…O5 covered; stages named consistently with the glossary. | 0.75 | P0 |
| **T-0609** | Content `U3-L3` (أساسيات الواجهة الأمامية) + 7 questions + code-reading items. | 0601 | No syntax-recall item; code blocks LTR; objectives U3-L3-O1…O6 covered. | 0.75 | P0 |
| **T-0610** | Content `U4-L1` (أنواع الوسائط) + 6 questions + media properties table. | 0601 | CU-04 flag recorded; objectives U4-L1-O1…O4 covered. | 0.75 | P0 |
| **T-0611** | Content `U4-L2` (تصميم المعلومات وتجربة المستخدم) + 7 questions + 4 CRAP before/after examples. | 0601 | Objectives U4-L2-O1…O5 covered; CRAP examples are SVG pairs with descriptions. | 0.75 | P0 |
| **T-0612** | Content `U4-L3` (طرق تقييم المواقع) + 6 questions + worked conversion example. | 0601 | CU-05 flag recorded; calculation item's answer verified twice. | 0.75 | P0 |
| **T-0613** | Content `U4-L4` (التحسين التكراري) + 5 questions + loop diagram. | 0601 | Objectives U4-L4-O1…O4 covered; all 11 lessons now `live`. | 0.75 | P0 |
| **T-0614** | Objective-coverage validator + difficulty blueprint check (2 recall / 2 application / 1 analysis) + correct-answer position balance report. | 0606–0613 | Build fails if any objective lacks an item; blueprint report shows each lesson within ±1 of the mix; position distribution roughly even. | 0.5 | P0 |
| **T-0615** | Quiz tests: component + Playwright (E2E-03) + persistence of attempts. | 0602, 0603 | E2E-03 green on both projects; attempt survives reload; no partial attempt on exit. | 0.5 | P1 |
| **T-0616** | Difficulty calibration pilot with 10 students; adjust 5 weakest items. | 0614, 0615 | First-attempt pass rate in 45–75%; 5 items revised with recorded reason; results logged in `docs/` review folder. | 0.5 | P1 |

**Phase 5 exit:** feature-complete v1.0 (11 lessons, 3–4 sims, quizzes everywhere, progress).

---

## 7. Phase 6 — Quality gate (5.0 days)

| ID | Task description | Deps | Acceptance criteria | Days | Pri |
|---|---|---|---|---|---|
| **T-0701** | Complete the E2E suite (E2E-01…10) and fix failures. | 0615 | All 10 journeys green on `mobile-360` and `desktop-1280` against a production build. | 0.75 | P0 |
| **T-0702** | axe audit on 8 routes/states + fix violations. | 0701 | 0 violations; no `aria-*` suppressions added without a written justification. | 0.5 | P0 |
| **T-0703** | Screen-reader pass (NVDA + VoiceOver) on lesson, quiz, one sim + fixes. | 0702 | Narration updates announced; status words announced; heading order correct; no unlabeled controls. | 0.5 | P0 |
| **T-0704** | Execute the full RTL protocol (RTL-01…14) with screenshots + fixes. | 0701 | All 14 checks pass; screenshot evidence attached to the release notes. | 0.5 | P0 |
| **T-0705** | Arabic copy review with a native reviewer (5 screens + all sim narration). | 0704 | Reviewer signs off; every awkward phrase rewritten; zero English UI leakage. | 0.5 | P0 |
| **T-0706** | Performance profiling on throttled mobile (Lighthouse + WebPageTest-style trace). | 0701 | Budgets measured and recorded per route; regressions identified with the responsible chunk. | 0.25 | P0 |
| **T-0707** | Performance fixes: trim sim chunks, verify font subset, remove unused deps, defer non-critical client code. | 0706 | Lesson route LCP ≤ 2.5 s, TBT ≤ 200 ms, CLS ≤ 0.02; sim chunk ≤ 180 KB gzip; Lighthouse perf ≥ 90. | 0.5 | P0 |
| **T-0708** | Finalize visual regression baselines for all key screens. | 0511, 0704 | Baselines match approved screenshots; diff threshold set; CI job documented. | 0.25 | P1 |
| **T-0709** | Device matrix run (5 devices/widths from `TESTING_PLAN.md` §8) + fixes. | 0707 | No horizontal scroll, no clipped Arabic, controls reachable in landscape; issues fixed or filed. | 0.5 | P0 |
| **T-0710** | Bug triage: close all P0/P1, document P2, update `TASKS.md`. | 0701–0709 | Zero open P0/P1; P2 list with owners/estimates; release gate draft complete. | 0.5 | P0 |
| **T-0711** | Close teacher review items CU-01…CU-08 (or record written deferrals). | 0613 | Each CU item has a decision in `CURRICULUM_MAP.md`; no item left silently open. | 0.25 | P0 |

**Phase 6 exit:** `TESTING_PLAN.md` §11 release gate signed.

---

## 8. Phase 7 — Deployment & initial release (2.0 days)

| ID | Task description | Deps | Acceptance criteria | Days | Pri |
|---|---|---|---|---|---|
| **T-0801** | Production deploy (custom domain optional): CSP/security headers, cache rules, 404 route, HTTPS, `Content-Type` for HTML/JS/CSS/fonts. | 0710 | Public URL verified with `curl -I` and a browser; no CSP or mixed-content errors; asset caching immutable; rollback rehearsed. | 0.5 | P0 |
| **T-0802** | SEO/metadata: per-page Arabic titles and descriptions, `sitemap.xml`, `robots.txt`, OG image with Arabic text, canonical URLs. | 0801 | Every route has a unique Arabic `<title>`; OG image renders Arabic correctly (rendered as SVG→PNG, not text-in-image guess); sitemap lists all public routes. | 0.25 | P1 |
| **T-0803** | Arabic privacy note page: no accounts, no tracking, progress on device, contact route. | 0801 | Page states exactly what is stored; linked from footer and the progress help dialog; reviewed for plain language. | 0.25 | P0 |
| **T-0804** | Release checklist execution + onboard 5 students + set up a feedback channel (external form/group, no in-app analytics). | 0711, 0801 | 5 students complete one lesson and one sim; ≥ 3 pieces of actionable feedback collected; checklist signed and archived. | 0.5 | P0 |
| **T-0805** | Verify README by following it literally on a clean machine; record time-to-running; rehearse rollback. | 0801 | A second person (or clean clone) reaches a running dev server in ≤ 10 min using only the README; rollback takes ≤ 2 min. | 0.5 | P1 |

**Phase 7 exit:** v1.0 live.

---

## 9. Phase 8 — Post-MVP backlog (unscheduled)

| ID | Task | Deps | Acceptance criteria (summary) | Days | Pri |
|---|---|---|---|---|---|
| **T-0901** | `SIM-FE-01` frontend playground (sandboxed iframe, 3 editors, 3 challenges, 4 hints/reset). | Phase 7 | Meets `SIMULATION_SPECS.md` §6.19; iframe cannot reach network or parent; works at 360 px with keyboard open. | 4.0 | P2 |
| **T-0902** | `SIM-NET-01` network design sim (tap-to-place, traffic, attack paths, scoring). | Phase 7 | §5.19 met; keyboard/tap-only completion; failing hop named in Arabic. | 5.5 | P2 |
| **T-0903** | `SIM-IR-01` + `SIM-MEDIA-01` activity sims. | Phase 7 | §8.19 and §9.19 met; both data-driven, no new engine features. | 3.5 | P2 |
| **T-0904** | `SIM-UX-01` + `SIM-EVAL-01` + `SIM-ITER-01`. | 0903 | §10.19, §11.19, §12.19 met; completes activity coverage for U4. | 7.5 | P2 |
| **T-0905** | Progress export/import code + PWA offline shell. | Phase 7 | Export code restores progress on another device; offline opens visited lessons and one sim; no accounts needed. | 3.0 | P2 |
| **T-0906** | Accounts + server sync (Postgres/Prisma per `DATABASE_SCHEMA.md` §4) + minimal admin CMS. | 0905, legal review | Two-account isolation test; merge-on-login per spec; admin can edit/publish a lesson; CSP/auth headers verified. | 14.0 | P2 |

---

## 10. The first 10 tasks to implement (in this exact order)

| # | ID | Why it is first |
|---|---|---|
| 1 | **T-0101** | Nothing exists yet. The repo, strict types, and build pipeline define every later decision. **← start here** |
| 2 | T-0102 | Arabic RTL + Cairo + tokens are foundational: retrofitting them is the most expensive mistake in this project. |
| 3 | T-0103 | Buttons/cards/chips/callouts appear on every screen; building them once prevents inconsistent Arabic UI. |
| 4 | T-0104 | Progress, sheets, and skeletons are needed by Phase 2 and by every simulation. |
| 5 | T-0105 | Header/footer/nav define the shell every route composes into. |
| 6 | T-0106 | Centralising Arabic copy before writing screens prevents string literals leaking into components. |
| 7 | T-0107 | CI must exist before the first real feature, or quality becomes a manual habit. |
| 8 | T-0108 | A deployable URL in week 1 proves fonts, headers, and static export — it de-risks Phase 7 early. |
| 9 | T-0109 | Conventions (PR template, ADR) cost an hour and pay back on every task. |
| 10 | T-0110 | A real-phone check of the foundation catches RTL/typography issues while they are still cheap. |

**Recommended first action after plan approval:** execute **T-0101**, then stop and show the running Arabic shell at 360 px before starting T-0102 — so the RTL foundation is reviewed while it is still one file.

---

## 11. Cross-cutting rules for every task

- Arabic strings only in `src/i18n/ar.ts` or `src/content/**`.
- No `ml-*`/`mr-*`/`left-*`/`right-*` utilities; logical properties only.
- Every new student-facing screen ships with its empty, loading, and error states.
- Every new simulation ships with reducer tests and one E2E path.
- No new dependency without a one-line rationale; no version bumps mid-phase.
- Update this file's status and, if scope changed, the relevant doc — the plan is a living artefact until release.
