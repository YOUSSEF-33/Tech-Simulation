# مَنهَج — Interactive Arabic Curriculum Platform (Planning Package)

An Arabic-first interactive learning platform for the **Programming & Artificial Intelligence** curriculum of Egyptian second-year secondary students. Students read short Arabic lessons, manipulate simulations (HTTPS/TLS, web architecture, HTTP), take short quizzes, and track progress — on a phone, entirely in Arabic.

> **Status: planning complete, implementation not started.** Every document here is implementation-ready. No platform code exists yet, by design.

---

## 1. What this repository contains

| File | What it decides |
|---|---|
| **[docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md)** | Vision, personas, 20 user stories, 60+ functional requirements, non-functional targets, MVP scope, out-of-scope list, assumptions, success metrics |
| **[docs/CURRICULUM_MAP.md](docs/CURRICULUM_MAP.md)** | All 4 units / 11 lessons, objective IDs, concepts, content outline, activity + assessment + simulation mapping, teacher-review flags |
| **[docs/SIMULATION_SPECS.md](docs/SIMULATION_SPECS.md)** | The shared simulation shell, plus 11 fully specified simulations (19 fields each) and the MVP recommendation + build order |
| **[docs/UX_UI_SPEC.md](docs/UX_UI_SPEC.md)** | Design system, RTL implementation rules, all 11 screens with real Arabic copy, states, mobile layouts, accessibility checklist |
| **[docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md)** | Stack and rationale, folder structure, simulation engine contracts, data flow, state management, deployment, security, costs, tradeoffs |
| **[docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** | The localStorage progress document (MVP), the full Postgres/Prisma schema for when accounts arrive, storage rules |
| **[docs/ROADMAP.md](docs/ROADMAP.md)** | Phases 0–8, milestones, effort estimates, dependencies, risks, definition of done per phase |
| **[docs/TESTING_PLAN.md](docs/TESTING_PLAN.md)** | Test strategy, test-case tables, RTL/Arabic QA, accessibility, performance budgets, release gate, bug severity |
| **[docs/CONTENT_GUIDELINES.md](docs/CONTENT_GUIDELINES.md)** | Arabic writing rules, locked terminology glossary, lesson structure, question standards, review process |
| **[TASKS.md](TASKS.md)** | 91 prioritised tasks with IDs, dependencies, acceptance criteria, estimates, and the first 10 to implement |

---

## 2. Product in one screen

**The problem:** the curriculum's core concepts are invisible — a TLS handshake, a request travelling to a database, four design principles. Students memorise words and still cannot apply them.

**The approach:** three learning moves per lesson, all Arabic:

1. **اقرأ** — 5–7 short sections, one idea each, with one diagram that encodes a relationship.
2. **جرّب** — a step-based simulation the student controls: send an HTTP request and read the 401; watch a certificate fail; watch a row appear in the database.
3. **اختبر** — 5 questions with an explanation for every answer, then a review screen with a link back to the exact section.

Progress is visible everywhere (dashboard, unit cards, progress page) and requires no account.

**MVP scope (v1.0):** 11 lessons · 3 simulations (`SIM-HTTP-01`, `SIM-ARCH-01`, `SIM-TLS-01`) + 1 stretch (`SIM-AI-01`) · quizzes for every lesson · device-local progress · full Arabic RTL.

**Smallest realistic MVP:** **Release A** after ~27 developer-days — 3 lessons, the engine, one simulation, deployed. Then widen.

---

## 3. Proposed stack (and why)

| Choice | Rationale |
|---|---|
| **Next.js 15 App Router, static export** | Every lesson is a pre-rendered page; no server to secure, nothing to pay for. |
| **React 19 + TypeScript (strict)** | Typed content and simulation machines catch curriculum/content errors at build time. |
| **Tailwind CSS v4** | Logical properties (`ms-`, `me-`) make RTL the default rather than a patch. |
| **`motion` (Framer Motion)** | Declarative step animation with first-class reduced-motion support. |
| **`useReducer` pure machines** | Simulations are testable without a browser and deterministic in tests. |
| **Zustand + `persist`** | One small store for progress, versioned localStorage document. |
| **Typed content files + zod validator** | 11 lessons do not justify a CMS; git review + a build-time validator is faster and safer. |
| **Vitest · Testing Library · Playwright · axe** | Unit coverage for logic, real-browser coverage for RTL and simulations. |
| **Vercel Hobby** (or Cloudflare Pages) | Free, global, instant rollback. |
| **PostgreSQL + Prisma — later** | Only when accounts arrive (Phase 5 architecture, not MVP). |

**Cost:** $0/month at MVP scale. **No third-party scripts, no tracking, no PII** — the users are minors.

---

## 4. Key decisions already made (so implementation does not stall)

| Question | Decision |
|---|---|
| Do we need a database in v1? | **No.** Progress in versioned localStorage; Postgres schema is ready for Phase 5. |
| Do we need authentication? | **No.** No accounts, no cookies, no PII in v1.0. |
| Admin dashboard? | **No.** Content in typed files + CI validation. Revisit at 40+ lessons or a second author. |
| Which simulations first? | HTTP → web architecture → TLS. Playground and network designer are v1.1. |
| Arabic numerals? | **Western digits (0–9) everywhere**, formatted with `Intl.NumberFormat('ar-EG-u-nu-latn')`. |
| Font? | **Cairo**, self-hosted, 4 weights, subset `arabic`+`latin`. |
| Design direction? | Calm and educational: blue primary, unit colour markers, soft cards, motion that explains. |
| How is RTL handled? | `dir="rtl"` at the root + logical CSS properties only; physical `left/right` utilities are banned. |
| Where does Arabic copy live? | `src/i18n/ar.ts` (UI) and `src/content/**` (lessons, questions, sim narration). Never in components. |
| How much content is invented? | None. Curriculum unknowns are flagged **CU-01…CU-08** for teacher review. |

---

## 5. How implementation begins (after approval)

```bash
# once implementation is authorised:
npm install
npm run dev      # http://localhost:3000 — Arabic RTL shell after T-0101…T-0102
npm run verify   # typecheck + lint + content validation + unit tests
```

1. Read `TASKS.md` §10 (first 10 tasks) and start with **T-0101**.
2. Build Phase 0 completely (foundation), then Phase 1 (content pipeline + 3 pilot lessons).
3. Build Phase 2 (read + track), then Phase 3 (engine + HTTP sim) and **deploy Release A**.
4. Pause, observe 3 students, then continue with Phases 4–7.
5. Before writing any component, read the matching screen in `UX_UI_SPEC.md` §5; before writing any Arabic, read `CONTENT_GUIDELINES.md`.

**The single recommended first action:** create the repo and the Arabic RTL shell (T-0101 + T-0102), deploy it, and review it on a 360 px phone — before any content or simulation work.

---

## 6. Effort at a glance

| Phase | Days |
|---|---|
| 0 · Setup & design foundation | 5.0 |
| 1 · Content structure + 3 pilot lessons | 7.0 |
| 2 · Core student experience | 9.0 |
| 3 · Sim engine + HTTP sim → **Release A** | 6.0 |
| 4 · Architecture + TLS + AI sims | 10.5 |
| 5 · Quizzes + remaining 8 lessons | 9.5 |
| 6 · Quality gate (a11y, RTL, perf) | 5.0 |
| 7 · Release | 2.0 |
| **Total v1.0** | **54.0** |

At 4 h/day ≈ 27 weeks; at 6 h/day ≈ 18 weeks; full-time ≈ 11 weeks. Add a 10% buffer at the quality gate.

---

## 7. Acceptance of this planning package

The package is complete when all of the following are true — and they are:

- [x] All 10 required documents exist, plus `TASKS.md` and this README.
- [x] Every unit and lesson in the brief appears in `CURRICULUM_MAP.md` with objectives, activities, assessment, and simulation mapping.
- [x] 11 simulations are specified; the 5 prioritised ones carry all 19 required fields (title, unit, objectives, concepts, start state, interactive elements, controls, flow, visuals, Arabic feedback, success/failure, hints/reset, assessment, accessibility, mobile, technical approach, complexity, dependencies, acceptance criteria).
- [x] Every student-facing example, label, question, and explanation in the specs is Arabic; English survives only as an LTR technical identifier or a parenthetical term.
- [x] RTL and mobile requirements appear in the UX spec, the simulation specs, the testing plan, and the backlog — not as a final polish phase.
- [x] The roadmap is sized for one developer with a near-zero budget and names a 22–27-day smallest release.
- [x] `TASKS.md` contains 91 tasks with IDs, dependencies, acceptance criteria, estimates and priorities, and names the first 10.
- [x] Uncertain curriculum details are marked for teacher review (CU-01…CU-08) instead of invented.

---

## 8. Out of scope (explicit)

Accounts, teacher dashboards, grades, class codes, video lessons, native apps, social features, gamification, English UI, AI tutors, and any use of a real textbook we were not given.

## 9. Licence / content note

Lesson content is original, written for this platform in Arabic. Cairo font is OFL; icons are inline SVG. No third-party curriculum text, figures, or exam items are reproduced.
