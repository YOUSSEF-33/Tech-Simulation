# ROADMAP — خطة التنفيذ

> Solo developer, near-zero budget, AI coding agents available for implementation. Estimates are **focused developer-days** (6 productive hours), including tests for that task, excluding holidays.
> Strategy: **ship a vertical slice first** (read → simulate → check → track, with 3 lessons and 1 simulation), then widen to all 11 lessons and 3 simulations. This de-risks the two things that can kill the project: a simulation engine that does not teach, and Arabic RTL problems discovered late.

---

## 1. Effort summary

| Phase | Scope | Days | Cumulative |
|---|---|---|---|
| 0 | Project setup & design foundation | 5.0 | 5.0 |
| 1 | Curriculum & content structure (3 pilot lessons) | 7.0 | 12.0 |
| 2 | Core student experience (landing → progress) | 9.0 | 21.0 |
| 3 | Simulation engine + first simulation (`SIM-HTTP-01`) | 6.0 | **27.0** |
| — | **Release A: vertical slice (deployable)** | — | **27.0** |
| 4 | Additional MVP simulations (`SIM-ARCH-01`, `SIM-TLS-01`, `SIM-AI-01`) | 10.5 | 37.5 |
| 5 | Quizzes, completion rules & remaining content | 9.5 | 47.0 |
| 6 | Testing, accessibility, Arabic/RTL review | 5.0 | 52.0 |
| 7 | Deployment & initial release (v1.0) | 2.0 | **54.0** |
| 8 | Post-MVP (not scheduled) | — | — |

**MVP-lite (smallest realistic):** Phases 0–3 + 3 lessons + quizzes for those 3 = **~24 days**. It contains the full learning loop and is genuinely useful in a classroom.
**Full v1.0:** 54 days. At 4 h/day → ~27 weeks; at 6 h/day → ~18 weeks; full-time (8 h) → ~11 weeks.

**Calendar guidance:** do not compress Phase 6. Every day saved there costs two days of rework in Arabic RTL.

---

## 2. Milestones

| Milestone | Definition | Target (from start, 4 h/day) |
|---|---|---|
| M0 — Foundation | App boots in Arabic RTL, tokens + 8 primitives, CI green | Day 8 |
| M1 — Content pipeline | 3 pilot lessons render from typed files; validator blocks bad content | Day 18 |
| M2 — Learning loop | Student can read a lesson and see progress persist after reload | Day 33 |
| M3 — Release A | One simulation playable end-to-end on a phone, deployed | Day 43 |
| M4 — Feature complete | 3–4 sims + all quizzes + 11 lessons | Day 70 |
| M5 — Quality gate | a11y + RTL + perf pass, all acceptance criteria green | Day 78 |
| M6 — v1.0 live | Public URL, release checklist signed | Day 82 |

---

## 3. Phase 0 — Project setup & design foundation (5.0 days)

**Goals:** A deployable skeleton that already proves Arabic RTL, typography, and the component vocabulary. Nothing in this phase is throwaway.

**Deliverables**
- Next.js 15 + TS strict + Tailwind v4 repo, `output: 'export'`, CI (typecheck, lint, unit test, content validation stub, build).
- `<html lang="ar" dir="rtl">`, self-hosted Cairo (400/600/700/800), token file, global CSS reset with logical properties.
- 8 UI primitives: `Button`, `Card`, `Chip`, `Callout`, `ProgressBar`, `Skeleton`, `Sheet`, `SkipLink`.
- Layout shell: `Header`, `Footer`, `BottomNav`, `Breadcrumb`.
- `i18n/ar.ts` starter deck; `CONTENT_GUIDELINES.md` rules applied to the deck.
- Deployment to Vercel with CSP headers; a "hello" route at 360 px verified on a real phone.

**Tasks:** T-0101 … T-0110 (see `TASKS.md`).
**Dependencies:** none.
**Risks:** Tailwind v4 + Next 15 integration friction (fallback: Tailwind 3.4 with logical utilities — same class names); Cairo subsetting mistakes (verify Arabic glyph coverage with the full lesson alphabet: «أإآءؤئ ة ى ـ»).
**Definition of done:** deploy URL loads with correct RTL, no FOUT flash of Latin fallback, Lighthouse a11y ≥ 95 on the skeleton, CI red on a deliberate type error.

---

## 4. Phase 1 — Curriculum & content structure (7.0 days)

**Goals:** One content schema that cannot express broken content, and three real lessons written in Arabic.

**Deliverables**
- `content/schema.ts` (zod + TS types: Unit, Lesson, Block, Objective, Question, Glossary).
- `scripts/validate-content.ts` with all rules from `TECHNICAL_ARCHITECTURE.md` §5.2.
- Block renderer (`SectionList` + blocks: paragraph, heading, callout, term, diagram, code, checkpoint, activity).
- Three pilot lessons fully written: `U2-L1`, `U3-L1`, `U3-L2` (+ their question sets), 6 SVG diagrams total.
- Content index helpers (`getUnit`, `getLesson`, `orderedLessons`, `nextLesson`).

**Tasks:** T-0201 … T-0212.
**Dependencies:** Phase 0 primitives; a teacher review slot booked for the pilot lessons.
**Risks:** Over-modelling blocks (mitigate: only 8 block kinds, no nested blocks in v1); Arabic content taking longer than estimated (mitigate: 45-minute timebox per section, stop at the word budget); diagrams becoming illustrations (mitigate: every diagram must encode a relationship, not decorate).
**Definition of done:** all 3 lessons render at 360 px without horizontal scroll; validator rejects an English-only title, a missing explanation, and an objective with no quiz item; a teacher has read U2-L1 and answered the CU-03 questions.

---

## 5. Phase 2 — Core student experience (9.0 days)

**Goals:** The full read-and-track loop with no simulation: landing, units, unit, lesson, dashboard, progress, resume.

**Deliverables**
- Landing page per `UX_UI_SPEC.md` §5.1.
- `/units`, `/units/[unitSlug]`, `/lessons/[lessonSlug]` (reading progress, completion button, next/prev).
- Progress store (Zustand + persist + zod parse + migration + failure fallback).
- `/dashboard` (continue card, stats, unit grid, last activity) and `/progress`.
- 404 + error boundaries in Arabic; footer content version.
- Bilingual-term rendering (`TermChip`) and glossary accordion.

**Tasks:** T-0301 … T-0312.
**Dependencies:** Phase 1 content + renderer.
**Risks:** Hydration mismatch between static HTML and localStorage-driven UI (mitigate: render neutral values on the server, hydrate in an effect, no `Date.now()` in render); dashboard complexity creep (mitigate: exactly 4 blocks as specified).
**Definition of done:** a student can start at `/`, reach a lesson in ≤ 3 taps, read it, see «مكتمل» after the required steps, reload, and find the state intact; the "continue" card points at the right lesson; empty and corrupt-storage states are both exercised manually.

---

## 6. Phase 3 — Simulation engine + `SIM-HTTP-01` (6.0 days)

**Goals:** A reusable shell proven by the simplest real simulation.

**Deliverables**
- `simulations/types.ts`, `registry.ts`, `engine/useSimulation.ts`.
- Shared shell: `SimFrame`, `SimStage`, `SimNarration`, `SimControls`, `SimHint`, `SimResult`, `CodeLtr`.
- `SIM-HTTP-01` complete (4 missions, 9 steps, hints, prediction, 401/403 sort).
- Sim route with lazy loading, progress write, completion chip on the lesson page.
- Reducer tests + 1 component test + 1 Playwright happy path.

**Tasks:** T-0401 … T-0408.
**Dependencies:** Phase 1 (block `activity`), Phase 2 (progress store).
**Risks:** Engine over-abstraction (mitigate: build only what HTTP needs; extract a primitive when a second sim needs it); mobile stage height fighting the browser chrome (mitigate: `dvh` units + safe-area insets, test on a real Android device); scope creep into real HTTP calls (forbidden — fixtures only).
**Definition of done:** Release A can be deployed: one lesson + one simulation + quiz preview completes on a phone, keyboard-only, with reduced motion, in ≤ 10 minutes.

> **Release A checkpoint:** deploy, put it in front of 3 students for 20 minutes, observe (do not interview). Fix only comprehension failures before Phase 4.

---

## 7. Phase 4 — Additional MVP simulations (10.5 days)

**Goals:** Cover U2-L1 (the flagship) and U3-L1, plus U1-L1 if time allows.

**Deliverables**
- `SIM-ARCH-01` (3.0), `SIM-TLS-01` (5.0), `SIM-AI-01` (2.5).
- New shared primitives extracted only where two sims need them: `NodeCard`, `Packet`, `KeyBadge`, `VerifyCheck`, `Transcript`.
- Visual regression baselines (3 stages × 3 sims × 2 widths).

**Tasks:** T-0501 … T-0509.
**Dependencies:** Phase 3 shell; U2-L1 and U3-L1 content.
**Risks:** TLS stage density on a 360 px screen (mitigate: vertical stage + bottom sheet certificate, prototyped on day 1 of the TLS task); animation jank on low-end Android (mitigate: transform-only animation, max 2 concurrent animated elements, measure on a real device); certificate dialog a11y regressions (mitigate: native `<dialog>`).
**Definition of done:** each sim meets every acceptance criterion in `SIMULATION_SPECS.md`; no sim exceeds its JS budget; a first-time student completes TLS without a hint in ≤ 12 minutes.

---

## 8. Phase 5 — Quizzes, completion rules & remaining content (9.5 days)

**Goals:** Assessment everywhere, all 11 lessons live, completion semantics final.

**Deliverables**
- `QuizRunner` (5 questions, immediate feedback, explicit confirm), results page with review + retake.
- Completion rule (read + ≥ 60%) implemented as a derived selector, with UI states everywhere it matters.
- Remaining 8 lesson contents + question pools (48+ items), diagrams, glossaries.
- Question shuffling (seeded per attempt), attempt log with 20-item cap, best/last display.
- Content validation extended to objective coverage + question blueprint checks.

**Tasks:** T-0601 … T-0612.
**Dependencies:** Phases 1–2; teacher review availability for CU-04/CU-05 content.
**Risks:** Content authoring bottleneck (mitigate: batch by unit, 1 unit per day, validator as the safety net); quiz difficulty miscalibration (mitigate: 10-student pilot, target 45–75% first-attempt pass); explanation quality (mitigate: `CONTENT_GUIDELINES.md` §6 template enforced in review).
**Definition of done:** all 11 lessons have ≥ 5 questions with explanations; every objective has ≥ 1 item; retake reshuffles; results review deep-links to a lesson section; completion state is correct after refresh and after a corrupt-storage reset.

---

## 9. Phase 6 — Testing, accessibility, Arabic/RTL review (5.0 days)

**Goals:** Quality gate before the first public URL.

**Deliverables**
- Full E2E suite green on 360 px and 1280 px (`TESTING_PLAN.md` §5).
- axe scan clean on 8 routes; manual keyboard + screen-reader pass (NVDA or VoiceOver) on lesson, quiz, one sim.
- RTL protocol (`UX_UI_SPEC.md` §3.6) executed and documented with screenshots.
- Performance pass with budgets (`TESTING_PLAN.md` §7).
- Teacher/curriculum review of flagged items (CU-01…CU-08) closed or explicitly deferred in writing.
- Bug triage: all P0/P1 fixed; P2 either fixed or recorded.

**Tasks:** T-0701 … T-0711.
**Dependencies:** features complete.
**Risks:** discovery of systemic RTL issues late (mitigate: the protocol was already run in Phases 2 and 3; this is a regression pass); a11y fixes requiring component redesign (mitigate: 1.5-day buffer); scope pressure to skip the review (mitigate: it is a release blocker).
**Definition of done:** `TESTING_PLAN.md` §11 release gate fully signed; zero known P0; zero RTL defects; Lighthouse a11y ≥ 95 and perf ≥ 90 on the lesson route.

---

## 10. Phase 7 — Deployment & initial release (2.0 days)

**Deliverables**
- Production deploy on Vercel (custom domain optional), CSP + cache headers verified, `robots.txt`, `sitemap.xml`, OG image.
- Privacy note page (Arabic) stating: no accounts, no tracking, progress on device.
- Release checklist executed; 5 students invited; a feedback route (a simple Arabic form link or a WhatsApp group — no in-app analytics).
- `README.md` "how to run / how to add a lesson" sections verified by a second person (or by following them literally).
- Monitoring: uptime check (free), client error boundary logs reviewed weekly.

**Tasks:** T-0801 … T-0805.
**Dependencies:** Phase 6 gate.
**Risks:** domain/DNS delays (mitigate: ship on the platform subdomain first); last-minute content edits (mitigate: content freeze 24 h before release).
**Definition of done:** public URL serves the app with correct `Content-Type`, correct CSP, no console errors; a student on a real phone completes one lesson and one simulation; rollback rehearsed (redeploy previous build).

---

## 11. Phase 8 — Post-MVP (unscheduled backlog)

| Priority | Item | Why now (later) | Est. |
|---|---|---|---|
| 1 | `SIM-FE-01` playground | Highest "wow" and directly serves U3-L3; deferred only for sandbox/mobile risk | 4.0 |
| 2 | `SIM-NET-01` network designer | Covers U2-L2 which otherwise has no activity | 5.5 |
| 3 | `SIM-IR-01`, `SIM-MEDIA-01` | Cheap, completes activity coverage for U2-L3/U4-L1 | 3.5 |
| 4 | `SIM-UX-01`, `SIM-EVAL-01`, `SIM-ITER-01` | Completes U4 | 7.5 |
| 5 | PWA offline + install prompt | Students with intermittent data | 2.0 |
| 6 | Progress export/import code | Device change without accounts | 1.0 |
| 7 | Accounts + sync (Phase 5 architecture) | Only when students ask | 6.0 |
| 8 | Teacher projection mode (bigger type, step deep links, blackboard view) | Low effort, high classroom value | 1.5 |
| 9 | Minimal admin CMS | Only at 40+ lessons or a second author | 8.0 |
| 10 | Privacy-friendly aggregate analytics | Needs a consent/ethics decision for minors | 2.0 |
| 11 | More question pools (10+ per lesson) | Better retakes | 3.0 |
| 12 | English UI | Only if a non-Arabic audience appears | 5.0 |

---

## 12. Critical path and buffers

```
P0 ─▶ P1 ─▶ P2 ─▶ P3 ─▶ [Release A] ─▶ P4 ─▶ P5 ─▶ P6 ─▶ P7
                       ▲                    │
                       └── TLS is the long pole in P4 (5 days) ──┘
```

- **Longest single task:** `SIM-TLS-01` (5 days). If it slips, Release B slips 1:1 — protect it by starting its stage prototype during P3.
- **Content is the hidden long pole:** 11 lessons × 0.75 day. Author one lesson per day in P5; do not batch all 8 at the end of the phase.
- **Buffer:** 10% (≈ 5 days) is *not* included above. Add it at M5, not at the start.
- **Hard sequencing rules:** no sim before the progress store exists (P2 → P3); no quiz before the lesson renderer is stable (P1 → P5); no public release before the RTL protocol passes (P6 → P7).

---

## 13. Definition of done (applies to every phase)

1. Typecheck, lint, content validation, and unit tests pass in CI.
2. Each new student-facing string is Arabic and lives in `i18n/ar.ts` or a content file.
3. New UI verified at 360 px and 1280 px, keyboard-only, with reduced motion.
4. Acceptance criteria for every task in the phase are met (not "mostly").
5. No new dependency without a one-line rationale in the PR description.
6. `TASKS.md` updated (status + any discovered tasks).
7. A deployed preview URL exists for the phase's work.
