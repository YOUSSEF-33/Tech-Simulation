# TECHNICAL ARCHITECTURE — البنية التقنية

> Goal: one developer, zero monthly cost, static delivery, and a simulation system that grows without rewrites.
> **Decision summary (TL;DR):** Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS v4, statically exported; all curriculum content in typed TypeScript files validated at build time; progress in versioned localStorage via Zustand; no server, no database, no auth in v1.0. Postgres + Prisma + accounts arrive only in Phase 5, behind the same content and progress interfaces.

---

## 1. Application architecture

```
                        ┌───────────────────────────────┐
                        │  Build time (Node, CI)        │
                        │  content/*.ts  ──▶ validator  │
                        │       │            (zod)      │
                        │       ▼                       │
                        │  static HTML/RSC per route    │
                        └──────────────┬────────────────┘
                                       │ static export (out/)
                                       ▼
                 ┌──────────────────────────────────────────┐
                 │  CDN (Vercel / Cloudflare Pages)         │
                 │  HTML · CSS · JS chunks · fonts · SVG    │
                 └──────────────┬───────────────────────────┘
                                │
                                ▼
      ┌────────────────────────────────────────────────────────┐
      │ Browser (RTL Arabic)                                   │
      │                                                        │
      │  Server Components: layout, lesson render, unit lists   │
      │  Client islands:                                       │
      │    • <LessonProgressBar>  • <QuizRunner>                │
      │    • <SimulationHost>     • <ProgressProvider>          │
      │                                                        │
      │  Zustand (progress) ◀──▶ localStorage (versioned)       │
      │  useReducer (sim state, per simulation, ephemeral)      │
      └────────────────────────────────────────────────────────┘
```

**Three properties this buys us:**
1. **Zero runtime cost and zero server attack surface** — there is no API to breach, no session to steal, no database to leak (important: the users are minors).
2. **Instant lessons** — every lesson is pre-rendered; the slowest thing on the page is the font, which is self-hosted and subset.
3. **Cheap escapes** — progress and content access go through interfaces (`progressRepository`, `getLesson()`), so adding a database or a CMS later changes an adapter, not pages.

### 1.1 Why static export works here

| Need | Static-compatible? |
|---|---|
| 11 lessons, 4 units, fixed routes | ✓ `generateStaticParams` |
| Step simulations (client state only) | ✓ lazy client chunk |
| Progress | ✓ localStorage |
| Quiz scoring | ✓ deterministic client logic |
| Preview of drafts | ✓ client route behind a build flag (or dev-only) |
| Accounts + sync (Phase 5) | ✗ → requires a server; that is the planned switch |

`next.config.ts`: `output: 'export'`, `images.unoptimized: true` (we ship SVG and no raster hero), `trailingSlash: false`.

### 1.2 Route map

| Route | Rendering | Notes |
|---|---|---|
| `/` | static | landing |
| `/dashboard` | static shell + client progress | progress hydrated client-side |
| `/units` | static | unit index |
| `/units/[unitSlug]` | static (`generateStaticParams`) | 4 pages |
| `/lessons/[lessonSlug]` | static (`generateStaticParams`) | 11 pages |
| `/lessons/[lessonSlug]/sim/[simSlug]` | static shell + lazy client sim | 3–4 in MVP |
| `/lessons/[lessonSlug]/quiz` | static shell + client runner | |
| `/lessons/[lessonSlug]/quiz/result` | static shell + client result | reads last attempt from store |
| `/progress` | static shell + client | |
| `/preview/[lessonSlug]` | dev/flag only | excluded from production export |
| `not-found`, `error` | static | Arabic |

---

## 2. Technology choices and rationale

| Layer | Choice | Why (and what we rejected) |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Static export + file routing + RSC for zero-JS lesson pages. *Rejected:* Vite SPA (worse SEO/first paint, manual routing), Astro (great for content but the simulation islands would be React anyway and the team knows Next). |
| UI | **React 19 + TypeScript (strict)** | Required by Next; strict types make content authoring safe. |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`) | Logical properties (`ms-`, `me-`) are first-class, which is *the* RTL requirement; tokens live in one CSS file. *Rejected:* CSS-in-JS (runtime cost, RTL plugin churn), plain CSS modules (slower to build the system). |
| Animation | **`motion`** (Framer Motion) | Declarative step transitions, `layout`, and a first-class `useReducedMotion`. *Rejected:* GSAP (license weight, imperative), CSS-only (hard for sequenced sim stages). |
| Sim state | **`useReducer`** + pure machines | Testable without DOM, deterministic, no library. *Rejected:* XState (more power than 3 sims need, extra concepts), Zustand for step state (globalising ephemeral state complicates reset). |
| App state | **Zustand** (one store: progress) | 1 KB, `persist` middleware, works with static export. *Rejected:* Context (re-render fan-out across the lesson tree), Redux (overhead). |
| Content | **Typed TS modules + zod validation script** | Type errors at author time; no runtime fetch; git review. *Rejected:* MDX (arbitrary JSX invites drift and inconsistent Arabic markup), headless CMS (cost + network + auth for 11 lessons), JSON (no types, no comments, poor authoring). |
| Fonts | **`next/font/local` with Cairo woff2 subsets** | No third-party request, no layout shift, no GDPR question. |
| Icons | **Inline SVG components** (Lucide subset, hand-tuned) | No icon font, correct mirroring control. |
| Tests | **Vitest + Testing Library + Playwright + axe-core** | Fast unit runs; real-browser E2E for RTL and simulations. |
| Hosting | **Vercel Hobby** (primary), Cloudflare Pages (alternative) | Free, global CDN, instant rollback. |
| DB (Phase 5) | **PostgreSQL + Prisma** | Relational shape (users → attempts → progress), strong migrations, free tiers exist. Decision deferred until Phase 5; no provider is committed in this plan because pricing changes — evaluate then. |
| Auth (Phase 5) | **Email + password, server sessions** (Better Auth or Auth.js — verify the current stable version at Phase 5) | Self-hosted, no per-MAU fee. Not in v1. |

**Version policy:** pin exact versions in `package.json`, commit the lockfile, and upgrade only at phase boundaries. AI coding agents must not bump majors mid-phase.

---

## 3. Project structure

```
.
├─ docs/                          # this planning package (not shipped)
├─ public/
│  ├─ fonts/cairo-{400,600,700,800}.woff2
│  └─ favicon.svg, og-image.png
├─ scripts/
│  └─ validate-content.ts         # zod + rules (Arabic, objectives coverage, hints)
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx               # <html lang="ar" dir="rtl">, fonts, ProgressProvider
│  │  ├─ page.tsx                 # landing
│  │  ├─ globals.css              # Tailwind v4 @theme tokens
│  │  ├─ dashboard/page.tsx
│  │  ├─ units/page.tsx
│  │  ├─ units/[unitSlug]/page.tsx
│  │  ├─ lessons/[lessonSlug]/page.tsx
│  │  ├─ lessons/[lessonSlug]/sim/[simSlug]/page.tsx
│  │  ├─ lessons/[lessonSlug]/quiz/page.tsx
│  │  ├─ lessons/[lessonSlug]/quiz/result/page.tsx
│  │  ├─ progress/page.tsx
│  │  ├─ not-found.tsx
│  │  └─ error.tsx
│  ├─ components/
│  │  ├─ ui/                      # Button, Card, Chip, Callout, Sheet, Toast, Skeleton…
│  │  ├─ layout/                  # Header, Footer, BottomNav, Breadcrumb, SkipLink
│  │  ├─ lesson/                  # LessonHeader, SectionList, blocks/*
│  │  ├─ quiz/                    # QuizRunner, QuestionCard, OptionButton, ResultView
│  │  ├─ progress/                # ContinueCard, UnitProgressCard, StatCard, ActivityGrid
│  │  └─ sim/                     # SimFrame, SimStage, SimNarration, SimControls,
│  │                              # SimHint, SimResult, NodeCard, Packet, KeyBadge,
│  │                              # VerifyCheck, CodeLtr, Transcript
│  ├─ simulations/
│  │  ├─ registry.ts              # id → lazy module + metadata
│  │  ├─ types.ts                 # SimulationModule, SimState, SimStepContent
│  │  ├─ engine/useSimulation.ts  # reducer + progress write + a11y announcements
│  │  ├─ http-request-response/   # index.tsx, machine.ts, content.ts, fixtures.ts
│  │  ├─ web-architecture/
│  │  └─ tls-handshake/
│  ├─ content/
│  │  ├─ units/u1.ts … u4.ts
│  │  ├─ lessons/u2-1-encryption-auth.ts …
│  │  ├─ questions/q-u2-l1.ts …
│  │  ├─ schema.ts                # zod schemas + TS types
│  │  └─ index.ts                 # registry helpers: getUnit, getLesson, orderedLessons
│  ├─ lib/
│  │  ├─ progress/                # store.ts, schema.ts, storage.ts, selectors.ts
│  │  ├─ format/                  # numbers.ts, duration.ts, date.ts
│  │  ├─ seo.ts
│  │  └─ cn.ts
│  ├─ i18n/ar.ts                  # all shared Arabic UI strings
│  └─ styles/tokens.css
├─ tests/
│  ├─ unit/                       # machines, formatters, validators
│  ├─ components/                 # Testing Library
│  └─ e2e/                        # Playwright + axe
├─ TASKS.md · README.md · package.json · tsconfig.json · next.config.ts
```

**Folder rules**
- `app/` = routing and composition only; no business logic, no Arabic strings beyond page titles.
- `components/ui/` has zero knowledge of curriculum; `components/lesson/` knows blocks; `components/sim/` knows simulations.
- `simulations/*/machine.ts` imports nothing from React — pure functions only.
- `content/` imports types, never components.
- No barrel `index.ts` in `components/` (kills tree-shaking discipline); import directly.

---

## 4. Simulation engine architecture

### 4.1 Contracts

```ts
// src/simulations/types.ts
export type SimId = 'SIM-HTTP-01' | 'SIM-ARCH-01' | 'SIM-TLS-01' | 'SIM-AI-01';

export interface SimulationMeta {
  id: SimId;
  slug: string;                     // 'request-response'
  title: string;                    // «طلب واستجابة»
  subtitle: string;
  unitId: UnitId;
  lessonId: LessonId;
  durationMin: number;
  difficulty: 'beginner' | 'intermediate';
  objectives: ObjectiveId[];
  version: string;
  /** shown on the summary card: «ماذا ستتعلّم؟» */
  takeaways: string[];
}

export interface SimStepContent {
  id: string;
  title: string;
  narration: string;                // ≤ 45 words, Arabic
  instruction?: string;
  hints: readonly [string, string, string];
  a11yLabel: string;
}

export interface SimState<S = unknown, A = unknown> {
  status: 'idle' | 'running' | 'won' | 'failed';
  step: number;
  data: S;
  hintLevel: 0 | 1 | 2 | 3;
  actions: ReadonlyArray<{ at: number; action: A }>;
  attempts: number;
  startedAt: number | null;
}

export type SimControl<A> =
  | { type: 'start' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'hint' }
  | { type: 'reset' }
  | { type: 'do'; action: A };

export interface SimulationModule<S, A> {
  meta: SimulationMeta;
  steps: readonly SimStepContent[];
  initialState: SimState<S, A>;
  /** pure: (state, control) => state. Must not mutate. */
  reduce(state: SimState<S, A>, control: SimControl<A>): SimState<S, A>;
  /** gate for «التالي»: an unmet requirement keeps the button disabled. */
  canAdvance(state: SimState<S, A>): boolean;
  /** success is evaluative, not positional. */
  evaluateSuccess(state: SimState<S, A>): boolean;
  /** optional: renders the stage; receives state + dispatch from the engine. */
  Stage: React.ComponentType<SimStageProps<S, A>>;
}

export interface SimStageProps<S, A> {
  state: SimState<S, A>;
  dispatch: (c: SimControl<A>) => void;
  reducedMotion: boolean;
}
```

### 4.2 Registration and loading

```ts
// src/simulations/registry.ts
import type { ComponentType } from 'react';
import type { SimId, SimulationMeta } from './types';

export const simMeta: Record<SimId, SimulationMeta> = { /* static, importable by lesson content */ };

export const simLoaders: Record<SimId, () => Promise<{ default: ComponentType<SimHostProps> }>> = {
  'SIM-HTTP-01': () => import('./http-request-response'),
  'SIM-ARCH-01': () => import('./web-architecture'),
  'SIM-TLS-01':  () => import('./tls-handshake'),
};
```

- `simMeta` is **static data** used by lesson content and the sim card (no bundle cost).
- The module (machine + stage) is a **separate chunk** loaded when the sim route mounts (`next/dynamic`, `ssr: false`).
- A sim not present in `simLoaders` renders an Arabic «هذه المحاكاة غير متاحة بعد» card — content can reference a future sim safely.
- Adding a sim = add folder + two registry lines. Nothing else changes (NFR-08).

### 4.3 The engine hook

```ts
// src/simulations/engine/useSimulation.ts
export function useSimulation<S, A>(mod: SimulationModule<S, A>) {
  const [state, dispatch] = useReducer(
    (s: SimState<S, A>, c: SimControl<A>) => mod.reduce(s, c),
    mod.initialState,
  );
  const reducedMotion = useReducedMotion();
  const announce = useAnnouncer();                       // aria-live="polite"
  const recordProgress = useProgress(s => s.recordSimulation);

  useEffect(() => {
    if (state.status === 'won' || state.status === 'failed') {
      recordProgress({ simId: mod.meta.id, status: state.status === 'won' ? 'completed' : 'attempted', /* … */ });
    }
    announce(mod.steps[state.step]?.narration ?? '');
  }, [state.step, state.status]);

  return { state, dispatch, reducedMotion, canAdvance: mod.canAdvance(state) };
}
```

Responsibilities of the engine (and nothing else): step execution, announcements, progress write, reduced-motion flag, reset/undo. **All** curriculum text comes from `mod.steps`.

### 4.4 Step-based animation

- Each step is an **id-targeted** visual state (`data-step="client-hello"`), not a timeline. The stage re-renders into the new configuration; `motion` animates only the delta (`layout` + `AnimatePresence` for packets).
- No `setTimeout` chains. A packet is a component that mounts on step N and unmounts on step N+1; its travel is a single `animate` prop.
- Determinism: no `Date.now()` in rendering, no `Math.random()`, no `window` reads during render. Time only enters via `useSimulation` progress timestamps.
- Reduced motion: `reducedMotion` is passed to the stage; packets use opacity-only transitions.

### 4.5 Hints and feedback

- `hintLevel` is monotonic within a step and resets on step change.
- `SimHint` renders `steps[step].hints[hintLevel - 1]`; the button label changes per level («تلميح» → «تلميح أعمق» → «أظهر الإرشاد»).
- Failure feedback lives in `mod.steps[step].feedback` (optional field) or in the stage's localized error copy; it must name the misconception.

### 4.6 Testing a simulation independently

```ts
// machine.test.ts (no React, no DOM)
const run = (ctrl: SimControl<A>[]) => ctrl.reduce(mod.reduce, mod.initialState);
it('requires all certificate checks before advancing', () => {
  let s = run([{ type: 'start' }]);
  expect(mod.canAdvance(s)).toBe(false);
  s = run.call(null, [{ type: 'do', action: { kind: 'check', id: 'issuer' } }]);
  expect(mod.canAdvance(s)).toBe(false);
});
```

Every stage is also rendered in isolation in Storybook-less fixtures: a `tests/components/sim-*.test.tsx` with `render(<Stage state={fixture} dispatch={spy} />)`.

### 4.7 Adding a future simulation (the 6-step checklist)

1. Write `content.ts` (steps + 3 hints each) and `machine.ts` (state, actions, `canAdvance`, `evaluateSuccess`).
2. Write `Stage` using existing primitives; add a new primitive only if a second sim needs it.
3. Add `meta` + loader to `registry.ts`.
4. Add the `sim` reference to the lesson content file.
5. Add reducer tests (flow table) + one component test + one Playwright happy path.
6. Add the sim's Arabic transcript and run `/validate:content`.

No changes to `SimFrame`, the engine, progress, or other sims.

---

## 5. Content management strategy

### 5.1 Content model (authoring shape)

```ts
export interface Lesson {
  id: LessonId;               // 'U2-L1'
  slug: string;               // 'u2-1-encryption-auth'
  unitId: UnitId;
  displayNumber: string;      // '2-1'
  title: string;              // «التشفير والمصادقة»
  summary: string;
  durationMin: number;
  objectives: Objective[];    // { id, text }
  sections: Section[];        // ordered blocks
  glossary: GlossaryEntry[];
  simId?: SimId;
  quizId: QuizId;
  teacherReview?: ReviewFlag[];
  status: 'draft' | 'reviewed' | 'live';
}

type Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string; level: 2 | 3 }
  | { kind: 'callout'; tone: 'info' | 'tip' | 'warning'; title: string; text: string }
  | { kind: 'term'; ar: string; en: string; definition: string }
  | { kind: 'diagram'; id: DiagramId; caption: string; description: string }
  | { kind: 'code'; language: 'html' | 'css' | 'js' | 'http'; code: string; caption?: string }
  | { kind: 'checkpoint'; question: string; answer: string }   // reveal-style, not graded
  | { kind: 'activity'; simId: SimId };                        // renders the sim card
```

### 5.2 Validation (`npm run validate:content`)

Fails the build on:
- missing/empty Arabic field (`title`, `summary`, objective text, every block text);
- a lesson whose objective IDs are not covered by the quiz set;
- a `simId` not in the registry;
- a quiz item without `explanation` or with ≠ 1 correct choice;
- narration > 60 words, or fewer than 3 hints in a sim step;
- duplicate lesson/question/sim IDs, duplicate slugs;
- characters that break RTL punctuation rules (Latin `,`/`?` in Arabic prose) — warning, not error.

CI runs `tsc --noEmit && validate:content && vitest run` on every push. **A content error is a build failure, not a runtime surprise.**

### 5.3 Why not a CMS now

11 lessons; one author; content reviewed in git. A CMS would add auth, uploads, an editor UI, and a database — all to save typing into a typed file. Revisit trigger: 40+ lessons or a second non-technical author (`PRODUCT_SPEC.md` §7.3).

---

## 6. Data flow

### 6.1 Reading a lesson

```
request /lessons/u2-1-encryption-auth
  → CDN returns pre-rendered HTML (title, sections, objectives, diagram captions)
  → RSC already resolved getLesson(slug) at build time
  → client hydrates only: progress bar, sim card state, completion button
  → store hydrates from localStorage (once, in ProgressProvider)
  → progress bar animates if already read
```

### 6.2 Completing a lesson

```
student reaches final section / presses «أنهيت الدرس»
  → markRead(lessonId)             (Zustand action)
  → persist middleware writes manhag.progress.v1
  → derived selector recomputes unit ratio → dashboard/progress pages read selectors on mount
  → "completed" requires quiz best ≥ 60%: completion is derived, never stored twice
```

### 6.3 Quiz attempt

```
select option → confirm → local answer state
5th question → «إنهاء الاختبار»
  → score = correct / total
  → recordAttempt({ lessonId, answers, score, durationSec, at })
  → navigate /result (attempt read from store by id in the URL? No: "last attempt for lesson")
  → review list rendered from question content + saved answers
```

### 6.4 Simulation

```
sim route mounts → dynamic import chunk → useSimulation(mod)
  → dispatch(do/next/hint) → pure reduce → new state → stage animates
  → evaluateSuccess on each reduce → status 'won'
  → engine writes sim progress + toasts «تمّت المحاكاة ✓»
```

---

## 7. State management

| State | Owner | Lifetime | Persisted |
|---|---|---|---|
| Simulation step/data | `useReducer` inside the sim | mounted sim | No (except `lastStep` on completion) |
| Quiz in-flight answers | local `useState` in `QuizRunner` | one attempt | No (lost on exit, by design) |
| Progress (lessons, sims, attempts, activity) | Zustand + `persist` | app | `manhag.progress.v1` |
| UI (sheet open, toast) | component state | ephemeral | No |
| Content | build-time modules | immutable | n/a |

**Store shape**

```ts
interface ProgressStore {
  schemaVersion: 1;
  lessons: Record<LessonId, { readAt?: string; completedAt?: string }>;
  sims: Record<SimId, SimProgress>;
  attempts: Record<QuizId, QuizAttempt[]>;   // capped at 20 per lesson
  activityDays: string[];                    // 'YYYY-MM-DD', capped at 60
  lastLessonId?: LessonId;
  actions: {
    markRead(id: LessonId): void;
    completeSim(p: SimProgress): void;
    recordAttempt(a: QuizAttempt): void;
    setLastLesson(id: LessonId): void;
    resetAll(): void;
  };
}
```

Derived selectors (never stored): lesson completeness, unit ratios, overall percentage, streak, "next lesson".

Persistence rules: `storage: createJSONStorage(() => localStorage)`; `version: 1` with a `migrate` that drops unknown fields and preserves known ones; failures (quota, corrupt JSON, private mode) fall back to in-memory with a one-time Arabic toast.

---

## 8. Database requirements

**MVP: none.** Documented fully in `DATABASE_SCHEMA.md` so the Phase 5 switch is a schema, not a redesign.

When accounts land:
- Postgres (single instance, free tier), Prisma migrations, one connection pool.
- Server sessions (httpOnly, `Secure`, `SameSite=Lax`) — never JWT in localStorage.
- Merge rule on first login: newest timestamp per lesson wins; attempts are appended; nothing is deleted.
- Content **stays in files** even then; the DB holds users and progress only.
- New routes: `POST /api/progress/sync`, `GET /api/progress`, auth handlers. The app gains a Node runtime; static export is dropped at that point.

---

## 9. Authentication requirements

| Phase | Requirement |
|---|---|
| v1.0 | None. No cookies, no accounts, no PII. A footer note states progress is device-local. |
| v1.4 | Optional email+password, verified email, reset flow, session cookie, rate limiting on login, generic error messages, account deletion. |
| Never in MVP | Social login, phone OTP (SMS cost), SSO, teacher/student roles. |

**Minors:** because users are ~16, v1.0 deliberately collects nothing. Before enabling accounts, publish a short Arabic privacy note (what is stored, why, how to delete) and have it reviewed (CU-07/legal). No analytics SDKs, no ad pixels, ever.

---

## 10. Deployment architecture

```
git push → CI (typecheck + content validation + unit tests + build + Playwright)
        → Vercel preview URL (per PR)
        → merge to main → production deploy (static, atomic, instant rollback)
```

- **Primary:** Vercel Hobby (free). Build ~60 s; output `out/`.
- **Alternative:** Cloudflare Pages (`_headers` for CSP/caching) if Vercel limits change.
- **Headers (both):**
  - `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'`
  - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Cache-Control`: HTML `max-age=0, must-revalidate`; `/assets/*` (hashed) `max-age=31536000, immutable`; fonts same.
- **Rollback:** redeploy the previous build (Vercel instant rollback). Content is in git, so content rollback = revert commit.
- **Environment:** none required in v1.0. `.env` holds nothing; `NEXT_PUBLIC_CONTENT_VERSION` is injected at build from `package.json` + git SHA.

---

## 11. Testing strategy (summary — detail in `TESTING_PLAN.md`)

| Layer | Tool | What it covers |
|---|---|---|
| Types | `tsc --noEmit` | contracts, content shapes |
| Content | `scripts/validate-content.ts` | Arabic completeness, objective coverage, hints |
| Unit | Vitest | sim reducers, progress store, formatters, selectors |
| Component | Testing Library | quiz runner, sim shell, progress cards, RTL attributes |
| E2E | Playwright | 6 critical journeys at 360 px and 1280 px, keyboard-only run, axe scan |
| Visual | Playwright screenshots | 3 stages × 3 sims × 2 widths |

No test asserts on animation timing; all assert final state via `findBy*`.

---

## 12. Security considerations

| Risk | Control |
|---|---|
| XSS through content | Content is typed data rendered as text nodes; no `dangerouslySetInnerHTML`; the playground iframe is `sandbox="allow-scripts"` **without** `allow-same-origin` and with `default-src 'none'` |
| Prototype pollution / JSON tampering | Progress is parsed through a zod schema; unknown keys dropped; no `eval` |
| Third-party data leakage | Zero third-party scripts; fonts and icons self-hosted |
| Supply-chain | Pinned deps, lockfile, `npm audit` at phase boundaries; no postinstall scripts from unknown packages |
| Sandbox escape in playground (post-MVP) | Separate origin via `sandbox` without same-origin; no `allow-top-navigation`; timeout on message |
| Privacy of minors | No accounts/PII in v1; no analytics; no cookies |
| Future sessions | httpOnly, Secure, SameSite=Lax; CSRF token on mutations; rate limit login; generic auth errors |
| Content integrity | Build-time validation + git review; content version in footer |

---

## 13. Cost model (MVP)

| Item | Choice | Monthly |
|---|---|---|
| Hosting | Vercel Hobby / Cloudflare Pages free | $0 |
| Domain | optional `.com` | ~$0.85/mo amortised |
| Fonts | self-hosted (Cairo, OFL) | $0 |
| Database | none in v1 | $0 |
| Auth | none in v1 | $0 |
| Email | none in v1 | $0 |
| Monitoring | Vercel build logs + client error boundary | $0 |
| **Total** | | **$0** (≤ 500 MAU, < 100 GB bandwidth) |

Phase 5 adds a free-tier Postgres and a transactional email free tier; budget **$0–10/mo** until ~2,000 students, then a paid DB tier (~$19/mo) is the first real cost.

---

## 14. Tradeoffs accepted (and the trigger to revisit)

| Tradeoff | Cost | Benefit | Revisit when |
|---|---|---|---|
| No accounts in v1 | Progress lost on cache clear; no teacher view | Zero infra, zero PII risk | Students ask for cross-device, or a teacher needs class data |
| Content in TS files | Deploy needed to fix a typo; author must use git | Type safety, review, rollback, no CMS to secure | 40+ lessons or a non-technical author |
| Static export | No server routes, no dynamic personalization | Fast, free, unhackable | Phase 5 (accounts) |
| localStorage progress | Device-bound, ~5 MB limit | Instant, offline, private | Same as accounts |
| Tailwind v4 | Newer ecosystem, fewer plugins | Logical-property RTL built in | Only if a plugin gap blocks work (unlikely) |
| No chart library | Progress visuals are simple bars/dots | Bundle stays small | If a teacher dashboard needs real charts |
| Three sims only | Two lessons have no interactive activity at launch | Ship faster, prove the engine | v1.1 adds playground + network |
| One locale | No English UI for non-Arabic speakers | Full focus on Arabic quality | Not planned |

---

## 15. Engineering standards

- TypeScript `strict`, `noUncheckedIndexedAccess`, no `any` in `src/` (allowed in tests with justification comment).
- Components: function components, named exports, props interfaces, no default exports except route files and lazy sim modules.
- Arabic strings: only in `src/i18n/ar.ts` or `src/content/**`; a component with an Arabic literal fails review.
- CSS: Tailwind utilities + tokens; no `ml-*`/`mr-*`; no inline styles except dynamic stage geometry.
- Commits: conventional prefixes (`feat:`, `fix:`, `content:`, `test:`); one concern per commit.
- Definition of done for any task: typecheck, content validation, unit tests for new logic, Arabic/RTL check at 360 px, and the acceptance criteria in `TASKS.md`.
- AI-agent rule: when a task is ambiguous, implement the smallest version that satisfies its acceptance criteria and record the assumption in the PR description — do not invent curriculum.
