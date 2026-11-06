# TESTING PLAN — خطة الاختبار والجودة

> Principles: test the **logic** exhaustively and the **UI** surgically. Never assert on animation timing. Every Arabic/RTL check is a release blocker, not a polish item.

---

## 1. Strategy

| Level | Share of effort | Tool | What it protects |
|---|---|---|---|
| Static | 20% | `tsc --noEmit`, ESLint, content validator | Types, Arabic completeness, curriculum coverage |
| Unit | 30% | Vitest | Simulation reducers, progress store/migration, formatters, selectors, scoring |
| Component | 25% | Vitest + Testing Library | Quiz runner, sim shell, lesson blocks, progress cards, RTL attributes |
| E2E | 20% | Playwright | 6 critical journeys, keyboard-only, mobile viewport, axe |
| Manual | 5% | Human eyes + a real phone | Arabic typography, screen reader, projector legibility |

**Coverage targets:** ≥ 80% lines on `src/lib/**` and `src/simulations/**/machine.ts`; ≥ 60% on components; E2E covers every route at least once.

---

## 2. Tooling and configuration

```jsonc
// package.json (scripts)
{
  "typecheck": "tsc --noEmit",
  "lint": "eslint . --max-warnings=0",
  "validate:content": "tsx scripts/validate-content.ts",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:a11y": "playwright test tests/e2e/a11y.spec.ts",
  "verify": "npm run typecheck && npm run lint && npm run validate:content && npm run test"
}
```

- **Vitest:** `environment: 'jsdom'`, `setupFiles: ['tests/setup.ts']` (jest-dom, `matchMedia` mock, `ResizeObserver` mock, `useReducedMotion` control).
- **Playwright:** projects `mobile-360` (Pixel 5, 360×640, `deviceScaleFactor 2`) and `desktop-1280` (Chromium 1280×720). `webServer` runs `next build && next start` (or `next dev` for fast loops — E2E gate uses the production build).
- **axe:** `@axe-core/playwright` on 8 routes + quiz answered state + sim mid-step.
- **CI:** `verify` on every push; E2E on PRs touching `app/`, `components/`, `simulations/`, `content/`.

---

## 3. Unit tests

### 3.1 Simulation reducers (`machine.test.ts` per sim)

| ID | Case | Expectation |
|---|---|---|
| UT-SIM-01 | Initial state | `status: 'idle'`, `step: 0`, empty actions |
| UT-SIM-02 | `start` | `status: 'running'`, `startedAt` set |
| UT-SIM-03 | `next` with unmet requirement | state unchanged, `canAdvance` false |
| UT-SIM-04 | `next` at last step | step stays, status unchanged (completion is evaluative) |
| UT-SIM-05 | `prev` | step −1, data preserved |
| UT-SIM-06 | `hint` × 4 | levels 1,2,3,3 (capped) |
| UT-SIM-07 | `hint` then step change | `hintLevel` resets to 0 |
| UT-SIM-08 | `reset` | deep-equals `initialState` except `attempts`/`startedAt` policy |
| UT-SIM-09 | Invalid action for current step | no throw, no mutation (no-op) |
| UT-SIM-10 | Success predicate truth table | all passing combinations → `won`; each failing one → not `won` |
| UT-SIM-11 | Purity | reducer does not mutate the input object (`Object.freeze` in test) |

### 3.2 Progress store

| ID | Case | Expectation |
|---|---|---|
| UT-PROG-01 | `markRead` | `readAt` set; unit ratio recomputed |
| UT-PROG-02 | Completion requires quiz ≥ 60% | read-only → not completed; read + 60% → completed |
| UT-PROG-03 | `recordAttempt` cap | 21st attempt drops the oldest, keeps best/last correct |
| UT-PROG-04 | Attempt `choiceId` persistence | answers survive shuffle (no index reliance) |
| UT-PROG-05 | Reset | empty doc, no crash, UI selectors return zeros |
| UT-PROG-06 | Corrupt JSON in storage | parse fails → empty doc + error flag (no throw) |
| UT-PROG-07 | Unknown schemaVersion (future) | read-only mode, no write |
| UT-PROG-08 | Migration v1 fields | defaults applied, attempts preserved |
| UT-PROG-09 | Quota exceeded on write | in-memory fallback, single toast flag |
| UT-PROG-10 | Streak | consecutive `activityDays` counted correctly across month boundary |
| UT-PROG-11 | `lastLessonId` | set on lesson open; resume selector skips completed |
| UT-PROG-12 | Server-safe import | importing the store module during SSR does not touch `localStorage` |

### 3.3 Utilities

Numbers (`Intl` with `ar-EG-u-nu-latn`, percentages, durations), date formatting (relative Arabic), quiz scoring (0..5, 60% boundary at exactly 3/5), content selectors (next/prev across unit boundaries), `validateLesson` rule set.

---

## 4. Component tests

| ID | Component | Cases |
|---|---|---|
| CT-01 | `Button` | variants render, `loading` disables and shows «جارٍ…», `aria-disabled` |
| CT-02 | `QuizOption` | selected state, correct/wrong styling **and** text, disabled after answer, keyboard Space/Enter |
| CT-03 | `QuizRunner` | progress text «سؤال 2 من 5», confirm required, feedback appears, last question shows «إنهاء الاختبار», exit confirm |
| CT-04 | `ResultView` | score text, pass/fail copy, review list includes explanation, retry resets |
| CT-05 | `LessonRenderer` | all 8 block kinds render; `TermChip` shows Arabic + English; code block is `dir="ltr"`; diagram has `role="img"` + Arabic label |
| CT-06 | `ProgressBar` | `role="progressbar"`, `aria-valuenow`, Arabic value text, 0% and 100% edge cases |
| CT-07 | `SimControls` | next disabled when `canAdvance` false; ←/→ keyboard; reset triggers confirm/undo |
| CT-08 | `SimNarration` | `aria-live="polite"` present; step change updates text |
| CT-09 | `SimHint` | three levels, button label changes, no level 4 |
| CT-10 | `CertificateDialog` (TLS) | focus trap, `Esc` closes, focus returns to trigger |
| CT-11 | `EmptyState` / `ErrorState` | Arabic copy, single action, no English leakage |
| CT-12 | `BottomNav` | active route marked `aria-current`, 44 px targets |
| CT-13 | Layout | `<html dir="rtl" lang="ar">` present in the root layout test |
| CT-14 | `ContinueCard` | correct lesson for empty/mid/complete states |

**DOM assertion helper** (used across component tests):

```ts
const LTR_ISLANDS = ['code', '[dir="ltr"]'];
expect(container.querySelectorAll('*[dir="rtl"] *[dir="ltr"]').length).toBeGreaterThan(0);
```

---

## 5. End-to-end tests (Playwright)

### 5.1 Critical journeys

| ID | Journey | Steps | Assertions |
|---|---|---|---|
| E2E-01 | First visit → read a lesson | `/` → «ابدأ التعلّم» → unit → lesson | URL chain, lesson H1 in Arabic, no horizontal scroll at 360 px |
| E2E-02 | Lesson → simulation → completion | open U3-L2 → sim card → 4 missions → result | result card visible, «تمّت المحاكاة ✓» on lesson after back |
| E2E-03 | Quiz → results → retry | 5 answers (mix) → finish | score matches answers, explanations shown, retry reshuffles order (different first question across 3 runs, seeded) |
| E2E-04 | Persistence | complete a lesson → reload → `/dashboard` | continue card points to next lesson; completed chip present |
| E2E-05 | Corrupt storage recovery | seed invalid JSON in localStorage → reload | app renders, Arabic notice, no console error |
| E2E-06 | Keyboard-only run | Tab through lesson → sim (3 steps) → quiz (1 answer) | focus always visible, all actions reachable, no trap outside dialogs |
| E2E-07 | Deep link + 404 | `/lessons/nope` · `/units/nope` | Arabic 404, links back, status 404 |
| E2E-08 | Teacher projection | 1280×720, sim step via ←/→ | narration and stage both readable, no scroll needed to see controls |
| E2E-09 | Reset flow | sim mid-state → «إعادة» → undo | initial state restored; undo restores previous state within 5 s |
| E2E-10 | Reduced motion | emulate `prefers-reduced-motion: reduce` → run TLS sim | no element translates > 24 px (measure via `getBoundingClientRect` before/after), completion still works |

### 5.2 Visual checks

Screenshots at 360 and 1280 for: landing, units, lesson (mid-scroll), sim initial/mid/result × 3 sims, quiz, results, progress, 404. Baselines committed; diffs > 0.2% fail and require review. Arabic text rendering differences across OS font fallbacks are accepted only if the baseline uses the self-hosted font (which it does).

---

## 6. Arabic and RTL quality checks

Run the protocol in `UX_UI_SPEC.md` §3.6 and record results in the release notes.

| ID | Check | Pass condition |
|---|---|---|
| RTL-01 | `dir`/`lang` on every route | `<html dir="rtl" lang="ar">`, no route-level override |
| RTL-02 | No physical direction utilities | `rg "\b(ml|mr|pl|pr|left|right)-" src` returns only allowlisted LTR-island rules |
| RTL-03 | Mixed content | URL/`GET`/`401` inside Arabic sentences stays intact at 320–414 px (visual + DOM order) |
| RTL-04 | Punctuation | Arabic prose uses «،» «؟» «؛»; no Latin `,`/`?` inside Arabic sentences (validator warning list must be empty) |
| RTL-05 | Typography | no clipped diacritics/descenders at 320 px; body line-height ≥ 1.8; no letter-spacing on Arabic |
| RTL-06 | Icon direction | chevrons/back arrows mirrored; lock/shield/key/check not mirrored |
| RTL-07 | Numerals | Western digits in all UI; `Intl` formatting verified in scores/durations/dates |
| RTL-08 | Forms | labels at start, errors below field, `aria-describedby` present |
| RTL-09 | Breadcrumbs | order reads right → left, separators correct, `aria-current` on last |
| RTL-10 | Sim direction | every packet's narration matches its on-screen direction (رابط «من المتصفح إلى الخادم») |
| RTL-11 | Text expansion | English terms in parentheses do not overflow cards at 360 px |
| RTL-12 | Zoom | 200% zoom keeps content readable and horizontally scroll-free (code blocks scroll internally) |
| RTL-13 | Arabic copy review | a native Arabic reviewer reads 5 randomly chosen screens; zero awkward machine-like phrasing |
| RTL-14 | Untranslated leakage | no English UI string in any screenshot (excluding `CodeLtr` islands and English terms in parentheses) |

---

## 7. Accessibility and performance

### 7.1 Accessibility acceptance

- axe (WCAG 2.1 AA ruleset): **0 violations** on `/`, `/units`, `/units/u2`, `/lessons/u2-1-encryption-auth`, `/lessons/u3-2-http/sim/request-response` (initial + mid), `/lessons/u2-1-encryption-auth/quiz` (unanswered + answered), `/progress`, `/dashboard`.
- Keyboard: complete E2E-06 with focus ring visible at every step; no `outline: none` without replacement.
- Screen reader: NVDA (Windows) + VoiceOver (iOS) on lesson, quiz, and one sim — headings announced, `aria-live` narration updates, status words announced (not colour).
- Contrast: automated token check (all text pairs ≥ 4.5:1; large text ≥ 3:1).
- Tap targets: automated measure of interactive elements at 360 px (all ≥ 44×44).
- Reduced motion: E2E-10 passes.

### 7.2 Performance budgets

| Metric | Budget | Measured on |
|---|---|---|
| LCP (lesson route) | ≤ 2.5 s | Moto G4 profile, Slow 4G, 4× CPU |
| TBT | ≤ 200 ms | same |
| CLS | ≤ 0.02 | same |
| Lesson route JS | ≤ 90 KB gzip | build report |
| Sim route JS (incl. motion) | ≤ 180 KB gzip | build report |
| Fonts | ≤ 130 KB total (4 weights, subset) | network panel |
| Total requests (lesson) | ≤ 20 | network panel |
| Lighthouse performance | ≥ 90 | mobile preset |

**Rule:** if a simulation exceeds its JS budget, the animation library is the first thing to replace (CSS transitions for that sim), not the content.

---

## 8. Mobile and device matrix

| Device / config | Width | Why |
|---|---|---|
| Android Chrome (mid-range) | 360×640 | primary persona; real device required at least once per phase |
| iPhone Safari | 390×844 | safe-area insets, `dvh` behaviour |
| Small Android | 320×568 | worst-case wrap and tap targets |
| iPad / tablet | 768×1024 | two-column breakpoint |
| Classroom projector | 1280×720 | teacher mode; 18 px minimum text |
| Desktop | 1440×900 | max container, editorial layout |
| Landscape phone | 640×360 | sim stage height (must not trap controls) |

**Checks per device:** no horizontal scroll; sticky controls reachable; keyboard-open behaviour in quiz and playground; Arabic text not clipped; sim stage not taller than the viewport minus controls.

---

## 9. Data persistence and error handling

| ID | Scenario | Expected |
|---|---|---|
| DP-01 | Mid-lesson reload | reading position + read state preserved |
| DP-02 | Mid-quiz reload | attempt lost, no partial write, no crash; lesson unaffected |
| DP-03 | Storage disabled (Safari private) | app usable, one Arabic toast, progress in memory |
| DP-04 | Storage full (quota) | write fails gracefully, no duplicate attempts, toast once |
| DP-05 | Two tabs open | last write wins per action; no corrupted JSON (writes are whole-document) |
| DP-06 | Content updated after attempt | attempt preserved; review skips missing question IDs with a notice |
| DP-07 | Chunk load failure (sim) | Arabic error card + «أعد المحاولة» (no blank stage) |
| DP-08 | JS error in a sim | route error boundary keeps the rest of the app alive |
| DP-09 | Offline after first load | visited static routes still work from cache; sims work; no broken images |
| DP-10 | Rapid reset spam | state stays consistent; no duplicate progress records |

---

## 10. Acceptance criteria for the most important features

### 10.1 Lesson reading
- All 11 lesson routes return 200 with Arabic content and one `<h1>`.
- Objectives render before the first content section.
- Every English term appears with its Arabic equivalent on first occurrence.
- Every diagram has an Arabic description reachable by keyboard.
- Reading progress bar reflects section position within ±1 section.
- At 320 px there is no horizontal scroll and no clipped Arabic glyphs.

### 10.2 Simulation
- Start → complete on the happy path in ≤ 12 minutes (TLS) / ≤ 10 (others) without hints.
- «التالي» is disabled until the step's required action is done.
- Every failure state names the misconception in Arabic and offers a recovery action.
- Reset restores the exact initial state; undo works for 5 s.
- Keyboard-only completion; `aria-live` narration updates on every step.
- Completion writes progress exactly once per session.

### 10.3 Quiz
- 5 questions per attempt, drawn from a ≥ 5-item pool, in a stable order within the attempt.
- Immediate feedback with an explanation for every item (no item without one).
- Score is correct at boundaries: 2/5 = «لم تصل بعد»، 3/5 = «ناجح».
- Review shows the student's answer and the correct answer distinctly, with text labels, not colour alone.
- Retake reshuffles; best and last are both visible on the dashboard/progress page.
- Leaving mid-quiz never records a partial attempt.

### 10.4 Progress
- Completing a lesson updates: lesson status, unit ratio, overall percentage, dashboard continue card, progress page — after a reload, from the same device.
- Corrupt storage resets safely with an Arabic explanation.
- No progress is ever sent over the network in v1.0 (verify in the network panel: zero outbound requests beyond assets).

### 10.5 RTL / Arabic
- All 14 RTL checks pass, with screenshots attached to the release notes.
- Zero English UI strings; zero Latin punctuation in Arabic prose.
- All numerals Western and consistently formatted.

---

## 11. Release gate (must all be true)

- [ ] `npm run verify` green (typecheck, lint, content validation, unit + component tests).
- [ ] E2E suite green on `mobile-360` and `desktop-1280`.
- [ ] axe: 0 violations on the 8 routes/states.
- [ ] RTL-01…RTL-14 pass with screenshots.
- [ ] Performance budgets met on the lesson route; sim JS within budget.
- [ ] All P0 and P1 bugs closed; P2s documented.
- [ ] Curriculum TBC items (CU-01…CU-08) closed or explicitly deferred in writing with the teacher.
- [ ] Privacy note published; zero third-party requests verified in the network panel.
- [ ] Manual device run on a real Android phone and one iPhone.
- [ ] Rollback rehearsed.

---

## 12. Bug severity scale

| Level | Definition | Action |
|---|---|---|
| **P0** | Blocks learning (lesson/sim/quiz unusable), data loss, or a security issue | Fix before any release; hotfix immediately if live |
| **P1** | Wrong teaching content, broken RTL in a core screen, a11y blocker (keyboard trap), score miscalculation | Fix before release |
| **P2** | Cosmetic RTL issue, awkward Arabic phrasing, non-blocking a11y gap, slow animation | Fix in the next scheduled pass |
| **P3** | Nice-to-have polish | Backlog |

**Content errors are always ≥ P1**, even when cosmetic: a wrong Arabic term teaches the wrong thing.

---

## 13. Manual exploratory script (30 minutes, before each release)

1. Open `/` on a phone with slow network; start the timer at tap, stop when the lesson text is readable. Record seconds.
2. Read U2-L1 fully. Note every sentence you would rewrite; check 3 terms against the glossary.
3. Play `SIM-TLS-01` with a hint at each step. Note where the narration and the stage disagree.
4. Fail the certificate check deliberately; confirm the explanation teaches rather than scolds.
5. Take the quiz, answer 2 wrong; confirm you can find the relevant lesson section from the review.
6. Reload the browser mid-lesson; confirm nothing is lost.
7. Rotate the phone during a simulation; confirm controls remain usable.
8. Enable a screen reader; complete 2 quiz questions without sight.
9. At 200% browser zoom, read a lesson section; confirm no content is cut off.
10. Turn on airplane mode after load; open a visited lesson and one sim; confirm they work.
