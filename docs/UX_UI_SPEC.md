# UX/UI SPEC — دليل الواجهة العربية و RTL

> Every student-facing string in this document is the **actual Arabic copy** to implement. If a string is missing here, it is written in the content file, not invented in a component.
> Direction is RTL on every route. Numerals are Western (0–9) everywhere (FR-A-03).

---

## 1. Design principles (visual)

1. **Calm, not childish.** Rounded cards and soft depth, but no cartoon mascots, no confetti storms, no emoji as primary UI. The subject is secondary school, not primary.
2. **One accent per screen.** Primary blue carries the main action; unit colour appears only as a 4 px marker and in the unit header.
3. **Reading first.** A lesson is a text experience; typography (size, line-height, measure) outranks decoration.
4. **Motion explains.** Animation is used for state change and direction (request travelling, card becoming fixed), never for entrance spectacle on scroll.
5. **Touch-honest.** Anything visible is tappable at ≥ 44 px; hover is never required.
6. **RTL-native.** Layout is built with logical properties from the first commit; mirroring is not a later pass.

---

## 2. Design system

### 2.1 Colour tokens

| Token | Hex | Use | Contrast on white |
|---|---|---|---|
| `--canvas` | `#F7F9FC` | Page background | — |
| `--surface` | `#FFFFFF` | Cards, sheets | — |
| `--surface-2` | `#EEF3FA` | Inset panels, code background | — |
| `--ink` | `#0F1B2D` | Primary text | 15.8:1 |
| `--ink-2` | `#46586E` | Secondary text | 7.4:1 |
| `--ink-3` | `#6C7C90` | Captions, placeholders (never body) | 4.6:1 |
| `--border` | `#DCE5F0` | Dividers, card borders | 1.4:1 (non-text only) |
| `--primary` | `#1258A6` | Primary buttons, links, focus | 7.0:1 |
| `--primary-hover` | `#0E4A8C` | Hover/pressed | 8.9:1 |
| `--primary-tint` | `#E7F0FB` | Selected option background | — |
| `--teal` | `#0B7F6F` | Success text, "محمي" | 4.9:1 |
| `--teal-fill` | `#0E9F8A` | Success fills only (no text on it) | 3.2:1 → fill only |
| `--amber` | `#A65B00` | Warning text, hints | 5.1:1 |
| `--amber-fill` | `#F2A33C` | Warning accents | fill only |
| `--red` | `#B3271E` | Errors, unsafe state | 5.9:1 |
| `--red-tint` | `#FDECEA` | Error panel background | — |
| `--u1` | `#6D4AE0` | Unit 1 marker | 6.3:1 |
| `--u2` | `#0B7F6F` | Unit 2 marker | 4.9:1 |
| `--u3` | `#1258A6` | Unit 3 marker | 7.0:1 |
| `--u4` | `#A65B00` | Unit 4 marker | 5.1:1 |

Rules: text never sits on `--teal-fill`/`--amber-fill`; error and success always pair colour **with** an icon and a word; disabled = `--ink-3` on `#F1F5FA` at 0.6 opacity with `aria-disabled`.

### 2.2 Typography

| Role | Font | Size / line-height (mobile → desktop) | Weight |
|---|---|---|---|
| Display (landing hero) | Cairo | 30/42 → 40/54 | 800 |
| H1 (page title) | Cairo | 24/36 → 30/44 | 700 |
| H2 (section) | Cairo | 20/32 → 22/34 | 700 |
| H3 (subsection) | Cairo | 18/30 → 19/31 | 600 |
| Body | Cairo | 16/28 → 17/30 | 400 |
| Body strong | Cairo | 16/28 | 600 |
| Small / caption | Cairo | 13/22 | 400–600 |
| Button | Cairo | 16/24 | 600 |
| Code / identifiers | JetBrains Mono | 13.5/24 (LTR) | 400–500 |

- **Arabic font stack:** `Cairo` (self-hosted, subset `arabic` + `latin`), fallback `"IBM Plex Sans Arabic", "Segoe UI", system-ui, sans-serif`.
- Body line-height **≥ 1.8** to prevent diacritic/descender collisions; never letter-space Arabic.
- Measure: lesson body max `62ch` (~620 px), centred in a 1120 px container.
- No italics (Arabic has no italic tradition); use weight or a coloured inline term instead.
- Numerals: Western, `font-feature-settings: normal`. Format with `new Intl.NumberFormat('ar-EG-u-nu-latn')`.

### 2.3 Spacing, radius, elevation

- **Spacing scale (px):** 4, 8, 12, 16, 20, 24, 32, 40, 56, 72. Tailwind maps these to `space-*`/`gap-*`; no arbitrary values except stage math.
- **Radii:** `sm 8` (chips, inputs), `md 12` (buttons), `lg 16` (cards), `xl 24` (hero panels, sheets), `full` (pills, avatars).
- **Elevation:** `e1 0 1px 2px rgb(15 27 45 / .06)`, `e2 0 4px 16px rgb(15 27 45 / .08)`, `e3 0 12px 32px rgb(15 27 45 / .12)`. Cards use e1 by default, e3 only for sticky/bottom sheets.
- Grid: 4-col mobile, 8-col tablet, 12-col desktop; gutter 16 / 24 / 32.

### 2.4 Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `fast` | 120 ms | `ease-out` | Hover, focus ring |
| `base` | 200 ms | `cubic-bezier(.22,1,.36,1)` | Panels, options, chips |
| `slow` | 320 ms | `cubic-bezier(.22,1,.36,1)` | Sheets, page section reveal |
| `sim` | 500–700 ms | `cubic-bezier(.22,1,.36,1)` | Packets, key exchange |

- One animated property group per element; never animate `width/height/top/left` (use transforms and grid).
- `prefers-reduced-motion: reduce` → durations 100 ms, no travel > 24 px, no stagger, no parallax; all state changes remain visible.
- Student-triggered motion only. No auto-playing carousels.

### 2.5 Component library (build list)

| Component | Variants / notes |
|---|---|
| `Button` | primary, secondary (outline), ghost, danger; sizes sm/md/lg; `loading` state with Arabic «جارٍ…» |
| `IconButton` | 44×44 min, `aria-label` required |
| `Card` | default, interactive (whole card link), inset |
| `UnitCard` | unit colour marker, title, lesson count, progress bar, status chip |
| `LessonRow` | index, title, duration, badges (محاكاة/اختبار), status icon |
| `ProgressBar` | labelled, `role="progressbar"`, Arabic value text |
| `ProgressRing` | progress page header only (SVG, aria-hidden + text alternative) |
| `Chip` | neutral, success, warning, muted, unit-coloured |
| `Callout` | info, tip, warning, note; icon + title + body |
| `TermChip` | Arabic term + parenthetical English, `title` = definition |
| `CodeBlock` | LTR, copy button, collapse > 12 lines, label «مثال» |
| `Breadcrumb` | RTL chevrons pointing left (`‹` mirrored), `aria-current="page"` |
| `Tabs` | underline style, roving tabindex |
| `Accordion` | used for glossary and mobile narration |
| `Sheet` | bottom sheet on mobile, dialog on desktop; focus trap, `Esc` |
| `Toast` | bottom, 4 s, one at a time, `role="status"` |
| `Skeleton` | text and card shapes, no shimmer under reduced motion |
| `EmptyState` | icon + Arabic title + body + one action |
| `ErrorState` | Arabic message + «أعد المحاولة» |
| `QuizOption` | default, selected, correct, wrong, disabled (after answer) |
| `ScoreBadge` | 0–5 with Arabic label, 3 sizes |
| `HintDrawer` | 3 levels, progressive disclosure |
| `SkipLink` | «تخطَّ إلى المحتوى» |
| `BottomNav` | mobile: الرئيسية / الوحدات / تقدّمي |

---

## 3. RTL implementation rules

### 3.1 Foundation

```tsx
// src/app/layout.tsx
<html lang="ar" dir="rtl">
```

- Tailwind **logical utilities only**: `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`, `rounded-s-*`/`rounded-e-*`. `ml/mr/pl/pr/left/right` are banned by lint (`no-restricted-syntax` on class strings via `eslint-plugin-tailwindcss` custom rule or a regex lint rule; see `TESTING_PLAN.md` §4).
- Flex/grid order is authored for RTL (first item appears at the right). Do not add `flex-row-reverse` to "fix" direction.
- Absolute positioning uses `inset-inline-start/end`, never `left/right`.

### 3.2 LTR islands

| Content | Treatment |
|---|---|
| URLs, paths (`/api/lessons`) | `<span dir="ltr" class="ltr-island">` |
| Code (inline and blocks) | `<code dir="ltr">` inside `<pre dir="ltr" class="text-left">` |
| Protocol/tech identifiers (`TLS`, `HTTPS`, `GET`, `POST`) | `CodeLtr`, not translated, never Arabic-ised |
| Mixed sentence («استخدم `GET` لجلب البيانات») | Isolate the token with `unicode-bidi: isolate`; sentence stays RTL |
| Email / numeric ranges (`401`) | `dir="ltr"` for ranges only, digits otherwise normal |
| File names, headers (`Content-Type`) | `dir="ltr"` |

CSS helper:

```css
.ltr-island { direction: ltr; unicode-bidi: isolate; text-align: left; font-family: var(--font-mono); }
```

Punctuation: Arabic comma «،», Arabic question mark «؟», Arabic semicolon «؛» in Arabic sentences. Never `,` or `?` inside an Arabic sentence. Parentheses stay as `()` and must not break: wrap mixed content in `<bdi>`.

### 3.3 Icon mirroring

| Mirror in RTL | Do **not** mirror |
|---|---|
| Chevron/arrow (next/prev), «التالي» arrow | Lock, shield, key, warning triangle, check |
| Back arrow (goes to start = right) | Play/pause (media semantics) |
| Breadcrumb separator | Clock, calendar, user avatars |
| Progress fill direction (fills from right) | Server/browser icons |

Use two SVGs (or `scaleX(-1)` on a wrapper with `[dir=rtl]`) — never flip by rotating text.

### 3.4 Numbers

- Western digits everywhere: «الخطوة 3 من 6»، «النتيجة: 4 من 5 (80%)»، «12 دقيقة».
- Do not use Arabic-Indic digits (`٣`) even in prose. This is a deliberate, consistent choice: exam papers and code mix Western digits, and mixed systems confuse students.
- Exception: lesson *content* may quote an Arabic-Indic numeral if a future textbook uses them (CU-08 review item) — this is content, not UI.
- Percent: `80%` with the sign after the number, no space. Time: `3:20` in LTR isolation.

### 3.5 Forms

- Label above the field, aligned `start`.
- Errors below the field, `--red`, with an icon and `aria-describedby`.
- Required marker «مطلوب» as text, not `*`.
- Inputs use `text-align: start`; numeric inputs `inputmode="numeric"`.

### 3.6 RTL test protocol (must be run before each release)

1. Load every route at 360 px and 1280 px with `dir="rtl"` and screenshot.
2. Check: no horizontal scrollbar, no clipped Arabic descenders, no reversed breadcrumb, no LTR text bleeding to a wrong side.
3. Check every simulation's packet direction matches its narration («من المتصفح إلى الخادم»).
4. Paste a mixed sentence with a URL into a callout; confirm the URL is isolated and the sentence still reads correctly.
5. Keyboard-tab through a lesson and a quiz; confirm focus starts at the right and moves in reading order.
6. Run `axe` with `lang="ar"`; confirm no `dir`/`lang` violations.
7. Check `Intl.NumberFormat` output for scores, durations, counts.

---

## 4. User flows

### 4.1 First visit → first lesson (the critical path, ≤ 3 taps to value)

```
/ (landing)
  └─ «ابدأ التعلّم مجانًا» ─▶ /units  (4 unit cards)
        └─ «تكنولوجيا المعلومات والمجتمع» ─▶ /units/u1
              └─ «كيف يعمل الذكاء الاصطناعي» ─▶ /lessons/u1-ai-basics
                    ├─ read sections → «جرّب بنفسك» ─▶ sim
                    └─ «اختبر فهمك» ─▶ /quiz ─▶ /result ─▶ «الدرس التالي»
```

Decision: the landing CTA goes to **/units**, not to a lesson, so the student sees scope first (US-02). The dashboard is reached from the header after the first visit (or directly via «لوحة الطالب»).

### 4.2 Returning student

```
/ ─▶ (progress exists) ─▶ /dashboard
      ├─ «أكمل من حيث توقفت» ─▶ last incomplete lesson
      ├─ unit card ─▶ /units/[unit]
      └─ «تقدّمي» ─▶ /progress
```

### 4.3 Lesson → simulation → quiz

```
/lessons/[slug]
   read → activity card ─▶ /lessons/[slug]/sim/[simSlug]
            └─ result ─▶ «عُد إلى الدرس» (lesson marks sim ✓)
   quiz CTA ─▶ /lessons/[slug]/quiz
            └─ 5 questions ─▶ /result
                 ├─ «أعد المحاولة» (reshuffled)
                 └─ «راجع الدرس» → lesson section anchors
```

Lesson completion rule: read (final section reached) **and** quiz ≥ 60% → status «مكتمل». Simulation completion is recorded but not required (US-09, FR-S-07 note in §1.7).

### 4.4 Stuck state

Any quiz question after 20 s shows «تحتاج مساعدة؟» → hint (one per question). Any sim step after 45 s of inactivity shows a pulsing «تلميح» (no auto-open, to avoid stealing the challenge).

### 4.5 Error recovery

Any render error → route-level `error.tsx` with: «حدث خطأ غير متوقع» + «إعادة تحميل الصفحة» + «العودة إلى الوحدات». Progress is never lost because it is written on each completion event, not on unload.

---

## 5. Screen specifications

Each screen lists: **purpose · layout · components · Arabic copy · actions · mobile · states**.

### 5.1 Landing page — `/`

**Purpose:** Explain the product in 5 seconds, prove it is Arabic and interactive, and send the student to units.

**Layout (desktop):**
1. Header (64 px): logo wordmark «مَنهَج» (text only), nav «الوحدات» · «كيف يعمل؟» · «تقدّمي», CTA «ابدأ التعلّم».
2. Hero: two-column grid (text start, visual end).
   - H1: «تعلّم البرمجة والذكاء الاصطناعي بالفهم، لا بالحفظ.»
   - Sub: «دروس عربية قصيرة، ومحاكاة تفاعلية تجعلك ترى ما يحدث داخل الشبكة والخادم والمتصفح.»
   - CTAs: primary «ابدأ التعلّم مجانًا»، secondary «تصفّح الوحدات».
   - Trust line: «بدون تسجيل · يعمل على الهاتف · محتوى عربي بالكامل».
   - Visual: a static, non-interactive preview of the TLS stage (browser → certificate → server) with the caption «شاهد كيف يتحوّل الاتصال إلى محمي».
3. «ماذا ستتعلّم؟» — 4 unit cards with icons, titles, lesson counts.
4. «كيف تعمل المنصة؟» — 3 steps: «اقرأ» → «جرّب» → «اختبر نفسك» with one line each.
5. «لماذا هذه المنصة؟» — 3 short value props (عربي بالكامل · تفاعل حقيقي · يعمل على هاتفك).
6. Footer: «عن المنصة» · «للمعلّمين» · «سياسة الخصوصية» · «تقدّمك محفوظ على هذا الجهاز» + content version.

**Actions:** start (→ `/units`), browse (→ `/units`), open unit card (→ `/units/[slug]`).
**Mobile:** single column; hero visual becomes a 16:9 static illustration below the CTAs; header collapses to logo + «ابدأ» button; nav moves into a sheet («القائمة»).
**States:**
- Loading: static HTML, so only font swap; hero visual has fixed aspect ratio (no CLS).
- Empty: not applicable.
- Error: if content registry fails, the page still renders hero + a callout «تعذّر تحميل الوحدات» + retry.
- Success: no special state; returning users additionally see a small bar under the hero: «لديك تقدّم محفوظ — تابع من حيث توقفت» → `/dashboard`.

**Arabic samples:** «ابدأ التعلّم مجانًا» · «تصفّح الوحدات» · «اقرأ · جرّب · اختبر نفسك» · «بدون تسجيل» · «تقدّمك محفوظ على هذا الجهاز».

---

### 5.2 Student dashboard — `/dashboard`

**Purpose:** Answer "what do I do next?" in one screen.

**Layout:**
1. Greeting block: «أهلًا بك 👋» (no name in MVP — no accounts) + «أنت في منتصف الطريق» style status line.
2. **Continue card** (full width, primary tint): lesson title, «الدرس التالي»، progress ring or bar for the unit, CTA «تابع الدرس».
3. Stats row (3 cards): «دروس مكتملة 3 من 11»، «محاكاة مكتملة 2»، «أفضل نتيجة 5/5».
4. Unit grid (2×2 desktop, 1-col mobile): each `UnitCard` with ratio and status.
5. «آخر نشاط» list (last 3 events, Arabic relative time: «أمس»، «قبل 3 أيام»).
6. Empty-state variant when no progress: replaces 2–5 with a single card: «لم تبدأ بعد — أول درس يستغرق 10 دقائق» + «ابدأ الآن».

**Actions:** resume, open unit, open progress.
**Mobile:** continue card first, stats become a horizontal scroll of 3 chips, bottom nav visible.
**States:** loading (3 skeletons matching card heights), empty (as above), error («تعذّر قراءة تقدّمك» + «إعادة المحاولة»), success.
**Arabic:** «أكمل من حيث توقفت» · «الدرس التالي» · «تابع الدرس» · «تقدّمك في الوحدة» · «آخر نشاط» · «لم تبدأ بعد».

---

### 5.3 Curriculum units page — `/units`

**Purpose:** Show the full scope and let the student choose a unit.

**Layout:** page title «الوحدات الدراسية» + subtitle «4 وحدات · 11 درسًا · حوالي 9 ساعات». A vertical list of 4 large `UnitCard`s (not a marketing grid): unit number chip, title, 1-line description, lesson count, duration, progress bar, status chip, CTA «افتح الوحدة».
**Actions:** open unit.
**Mobile:** full-width cards, 16 px gutter, progress bar under the title.
**States:** loading (4 skeletons), empty (never — content is static; if the registry is empty show «لا توجد وحدات متاحة حاليًا»), error (retry), success.
**Arabic:** «الوحدات الدراسية» · «4 وحدات · 11 درسًا» · «افتح الوحدة» · «لم يبدأ» · «قيد التقدّم» · «مكتمل».

---

### 5.4 Unit details page — `/units/[unitSlug]`

**Purpose:** Show one unit's lessons in order with status, so the student can follow the sequence.

**Layout:** breadcrumb; unit header (colour marker, title, description, meta: عدد الدروس · المدة · عدد المحاكاة); «ماذا ستتعلّم في هذه الوحدة؟» objectives list (3–5); lesson list (`LessonRow` × n) with status icon and badges; footer navigation «الوحدة السابقة / التالية».
**Actions:** open lesson; jump to next incomplete lesson («تابع من الدرس 2»).
**Mobile:** header compresses (title 22 px), objectives in an accordion, rows 72 px tall with chevron at the end.
**States:** loading, empty («لا توجد دروس في هذه الوحدة بعد» — author-only in practice), 404 («لم نجد هذه الوحدة»), error, success.
**Arabic:** «ماذا ستتعلّم في هذه الوحدة؟» · «ابدأ الوحدة» · «تابع من الدرس 2» · «الوحدة السابقة» · «الوحدة التالية» · «محاكاة» · «اختبار قصير».

---

### 5.5 Lesson page — `/lessons/[lessonSlug]`

**Purpose:** Teach one concept set in short Arabic sections, then hand off to practice.

**Layout (desktop):** two columns — content (max 680 px) and a sticky sidebar (280 px) with «محتويات الدرس» anchors, objectives checklist, and the simulation card.
**Layout (mobile):** single column; sticky top bar with lesson title (truncated), reading progress bar, and «محتويات» button opening a sheet.

**Content blocks in order:**
1. Breadcrumb.
2. Header: unit chip, lesson title, meta («8 دقائق قراءة · محاكاة · 5 أسئلة»), «الدرس 2-1».
3. Objectives card: «في نهاية هذا الدرس ستكون قادرًا على…» + 3–5 items with checkmarks.
4. Sections H2 + paragraphs, `Callout` for «تذكّر», `TermChip` on first English occurrence, `Diagram` with caption + «وصف النص» toggle, `CodeBlock` where relevant.
5. «جرّب بنفسك» card: sim title, duration, one-line promise, CTA «ابدأ المحاكاة»، and after completion a success chip «تمّت المحاكاة ✓».
6. Glossary accordion: «مصطلحات الدرس».
7. Footer: «أنهيت الدرس؟» → primary «اختبر فهمك» (quiz), secondary «الدرس التالي» (locked until quiz attempted? No — enabled, but the CTA hierarchy prefers the quiz).
8. Prev/next lesson links.

**Actions:** scroll/read, start sim, open glossary, take quiz, next/prev lesson, mark complete.
**Mobile:** sidebar becomes (a) progress bar in header, (b) objectives above content, (c) sim card inline after section 3 rather than at the end.
**States:**
- Loading: skeleton title (2 lines) + 3 paragraph skeletons; no layout shift (reserved heights).
- Empty: not applicable for a published lesson; draft lesson shows a callout «هذا الدرس قيد المراجعة» (preview only).
- Error: «تعذّر تحميل الدرس» + «أعد المحاولة» + «العودة إلى الوحدة».
- Success: after reading, a subtle banner appears at the end: «وصلت إلى نهاية الدرس — اختبر فهمك الآن».
**Arabic:** «أهداف الدرس» · «الفكرة الأساسية» · «مثال» · «تذكّر» · «جرّب بنفسك» · «ابدأ المحاكاة» · «مصطلحات الدرس» · «أنهيت الدرس؟» · «اختبر فهمك» · «الدرس التالي» · «الدرس السابق» · «8 دقائق قراءة».

---

### 5.6 Simulation page — `/lessons/[lessonSlug]/sim/[simSlug]`

**Purpose:** Let the student manipulate the concept step by step (specs: `SIMULATION_SPECS.md` §1).

**Layout:** `SimFrame` (header with back link «رجوع إلى الدرس», title, step progress) → `SimStage` (sim-specific, fixed height) → `SimNarration` (Arabic explanation + instruction) → `SimControls` (تلميح · السابق · dots · التالي · إعادة). Below the fold on desktop: «ماذا تعلّمت؟» summary (revealed at the end) + a link back to the lesson section.
**Actions:** start, next/prev, hints, sim-specific actions, reset, finish.
**Mobile:** stage 52vh max, vertical flow, sticky controls above safe area, narration collapsible after step 2.
**States:**
- Loading: stage skeleton with the sim title and «جارٍ تحميل المحاكاة…» (lazy chunk).
- Empty/error: «تعذّر تحميل المحاكاة» + «أعد المحاولة» + «العودة إلى الدرس» (never a blank stage).
- Success: `SimResult` card («أحسنت!») with two actions: «الدرس التالي» and «شاهد الشرح مرة أخرى».
- Failure: amber card naming the misconception + «أعد المحاولة».
**Arabic:** «المحاكاة» · «الخطوة 3 من 6» · «التالي» · «السابق» · «إعادة» · «تلميح» · «ماذا يحدث الآن؟» · «أحسنت!» · «حاول مرة أخرى».

---

### 5.7 Quiz page — `/lessons/[lessonSlug]/quiz`

**Purpose:** Five questions, immediate feedback, no timer pressure.

**Layout:** progress bar at top + «سؤال 2 من 5»; question card (stem, optional diagram); 4 options as full-width `QuizOption` rows (radio semantics), start-aligned text, option letter in a circle at the **start** (right); after answering: correct/incorrect banner + «لماذا؟» explanation + «السؤال التالي».
**Rules:** no back navigation between questions (attempts are cheap; going back invites second-guessing and complicates state). «إنهاء الاختبار» appears on the last question and on an exit confirm.
**Actions:** select option, confirm («تأكيد الإجابة» — optional; selecting may auto-advance after 400 ms? No: explicit confirm to avoid mis-taps), next, exit.
**Mobile:** options stacked, min height 56 px, sticky bottom confirm button; the stem stays visible (not in a scroll-collapsed header).
**States:** loading (skeleton question + 4 option bars), empty («لا يوجد اختبار لهذا الدرس بعد» + back to lesson), error (retry), answered, finished.
**Arabic:** «اختبار قصير» · «سؤال 1 من 5» · «اختر إجابة واحدة» · «تأكيد الإجابة» · «السؤال التالي» · «إنهاء الاختبار» · «إجابة صحيحة» · «إجابة غير صحيحة» · «لماذا؟» · «هل أنت متأكد من الخروج؟ سيُلغى هذا المحاولة.».

---

### 5.8 Quiz results page — `/lessons/[lessonSlug]/quiz/result`

**Purpose:** Turn a score into a learning action.

**Layout:**
1. Score header: «نتيجتك 4 من 5» + `80%` + status chip «ناجح» (≥ 60%) or «لم تصل بعد» + one-line Arabic judgement («فهمك جيد — راجع السؤال 3»).
2. Primary actions: «أعد المحاولة» (reshuffles) · «راجع الدرس».
3. Review list: each question with the student's answer (red, «إجابتك»), the correct one (green, «الإجابة الصحيحة»), and the explanation.
4. «الدرس التالي» card at the end.
**Actions:** retry, review lesson (deep-links to the relevant section anchor), next lesson.
**Mobile:** score header first screen; review items collapsible (question stem visible, details expand).
**States:** loading (score skeleton), empty (no attempt found → «لم نجد محاولة حديثة» + «ابدأ الاختبار»), error, success/fail variants.
**Arabic:** «نتيجتك» · «من 5» · «ناجح» · «لم تصل بعد» · «إجابتك» · «الإجابة الصحيحة» · «لماذا هذه الإجابة؟» · «أعد المحاولة» · «راجع الدرس» · «الدرس التالي».

---

### 5.9 Progress page — `/progress`

**Purpose:** Give an exam-prep view of what is done and what remains.

**Layout:** header «تقدّمي» + «آخر تحديث: اليوم»; overall summary (ring: 3/11 lessons + «27%»); per-unit accordion with lesson rows (status icon, best score chip, sim chip); «ما زال متبقيًا» list (next 3 incomplete lessons); «نشاطك» simple 14-day dot grid (no chart library); footer note «تقدّمك محفوظ على هذا الجهاز» + «كيف أحتفظ بتقدّمي؟» (help dialog explaining device-local storage and the future account option).
**Actions:** open any lesson, jump to next incomplete, open help.
**Mobile:** summary card, then unit accordions; dot grid scrolls horizontally if needed.
**States:** loading (skeletons), empty («لا يوجد تقدّم بعد» + «ابدأ بأول درس»), error, success.
**Arabic:** «تقدّمي» · «أكملت 3 من 11 درسًا» · «ما زال متبقيًا» · «نشاطك في آخر 14 يومًا» · «تقدّمك محفوظ على هذا الجهاز» · «كيف أحتفظ بتقدّمي؟».

---

### 5.10 Login & registration — `/login`, `/register` *(post-MVP, design ready)*

**Purpose:** Optional account to keep progress across devices (FR-U-02). **Not in v1.0**; every MVP screen must work without it.

**Layout:** centred card 420 px; logo; title; email + password; submit; link to the other page; «متابعة بدون حساب» link back to `/units`. No social login in v1 (adds provider review + consent complexity).
**Arabic:** «تسجيل الدخول» · «إنشاء حساب» · «البريد الإلكتروني» · «كلمة المرور» · «ليس لديك حساب؟» · «أنشئ حسابًا» · «متابعة بدون حساب» · «نسيت كلمة المرور؟».
**States:** idle, submitting («جارٍ التحقق…»), invalid («البريد أو كلمة المرور غير صحيحة» — never reveal which), locked (too many attempts: «حاول بعد قليل»), success (redirect to `/dashboard`).
**Rule:** no password strength meter with English words; use Arabic labels only («8 أحرف على الأقل»).
**Minor-safety note:** registration is optional; the privacy page must state what is stored, and the account is deletable. Parental consent text is a CU/legal review item before enabling.

---

### 5.11 Admin / content management — `/admin/*` *(post-MVP, minimal)*

**Decision:** not built in MVP (`PRODUCT_SPEC.md` §7.3). When triggered, the minimum is:

| Page | Contents |
|---|---|
| `/admin` | List of units/lessons with status + «معاينة» + «تعديل» |
| `/admin/lessons/[id]` | Arabic fields (title, objectives, sections), block editor (paragraph/callout/diagram/code), save draft |
| `/admin/lessons/[id]/questions` | Question CRUD, 4 choices, correct answer, explanation, `needsReview` flag |
| `/admin/preview/[id]` | Renders the lesson exactly as a student sees it (same renderer, no duplication) |
| `/admin/publish` | Publish/unpublish with a confirmation and a content-version bump |

Arabic labels: «الوحدات والدروس» · «تعديل الدرس» · «حفظ كمسودة» · «معاينة» · «نشر» · «إلغاء النشر» · «الأسئلة» · «الإجابة الصحيحة» · «الشرح». All fields Arabic-first; the form must refuse to save while any student-facing field is empty (the same validator as CI).

---

## 6. Accessibility checklist (per screen, WCAG 2.1 AA)

- [ ] One `<h1>`; heading levels never skip.
- [ ] Landmarks: `header`, `nav[aria-label="التنقل الرئيسي"]`, `main`, `footer`.
- [ ] Skip link first in tab order.
- [ ] All interactive elements reachable and operable by keyboard; focus ring `2px solid var(--primary)` with 2 px offset, never `outline: none` without a replacement.
- [ ] Focus order follows RTL reading order.
- [ ] Contrast ≥ 4.5:1 for text, ≥ 3:1 for large text and meaningful borders/icons.
- [ ] State not conveyed by colour alone (icon + Arabic label).
- [ ] Images/diagrams: Arabic `alt` or `role="img"` + `aria-label`; complex diagrams have a text alternative in an accordion.
- [ ] Forms: label + `aria-describedby` for errors; `aria-invalid` on failure.
- [ ] Live regions: quiz feedback (`assertive`), sim narration (`polite`), toasts (`status`).
- [ ] Modal/sheet: focus trap, `Esc`, focus returns to the trigger.
- [ ] `prefers-reduced-motion` respected; no essential content only in motion.
- [ ] Tap targets ≥ 44×44 px with ≥ 8 px spacing.
- [ ] Zoom to 200% without loss of content or horizontal scroll (except code blocks, which scroll internally).
- [ ] Language: `lang="ar"` on `<html>`; LTR islands use `lang="en"` where the word is English (`<span lang="en" dir="ltr">`).

---

## 7. Arabic copy deck (shared strings)

| Context | Arabic |
|---|---|
| Primary CTA | «ابدأ التعلّم» |
| Secondary CTA | «تصفّح الوحدات» |
| Resume | «تابع الدرس» / «أكمل من حيث توقفت» |
| Next | «التالي» · «السابق» · «رجوع» · «إغلاق» |
| Save/confirm | «حفظ» · «تأكيد» · «إلغاء» |
| Loading | «جارٍ التحميل…» |
| Retry | «أعد المحاولة» |
| Empty (generic) | «لا يوجد شيء هنا بعد» |
| Error (generic) | «حدث خطأ. حاول مرة أخرى.» |
| Offline | «يبدو أنك غير متصل بالإنترنت.» |
| Completion | «أحسنت!» · «أكملت الدرس» · «مكتمل» |
| Quiz | «اختبار قصير» · «اختبر فهمك» · «النتيجة» · «إجابة صحيحة» · «إجابة غير صحيحة» |
| Simulation | «محاكاة» · «جرّب بنفسك» · «الخطوة X من Y» · «تلميح» · «إعادة» |
| Progress | «تقدّمي» · «دروس مكتملة» · «أفضل نتيجة» · «آخر نشاط» |
| Help | «كيف أحتفظ بتقدّمي؟» · «هل تحتاج مساعدة؟» |
| Honesty | «هذه محاكاة تعليمية مبسّطة، وليست تطبيقًا حقيقيًا.» |

**Never use:** «امتحان» (implies official grading), «فشلت» (use «لم تصل بعد»), «خطأ» alone, English UI words (Next, Submit, Loading), Latin punctuation inside Arabic sentences.

---

## 8. Content-to-screen contract

| Screen region | Source | Must be Arabic | LTR island allowed |
|---|---|---|---|
| Nav, buttons, labels, states | `src/i18n/ar.ts` | ✓ | ✗ |
| Lesson title/sections/callouts | `src/content/lessons/*.ts` | ✓ | ✗ |
| Objectives | lesson content | ✓ | ✗ |
| Glossary terms | lesson content | ✓ (Arabic + English in parentheses) | ✓ (English term) |
| Quiz stems/choices/explanations | question content | ✓ | ✓ (code/status codes) |
| Sim titles, narration, hints | sim content | ✓ | ✓ (protocol names) |
| Diagram captions | lesson content | ✓ | ✗ |

The content validator rejects a lesson where any of these files contain a string field matching `^[A-Za-z0-9 ,.'"-]+$` longer than 3 words (heuristic for "accidentally English"), with an allowlist for code fields (`code`, `path`, `method`, `identifier`).
