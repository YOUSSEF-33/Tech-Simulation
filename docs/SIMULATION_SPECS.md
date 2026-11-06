# SIMULATION SPECS — مواصفات المحاكاة التفاعلية

> Every simulation below is specified so it can be implemented without further product decisions. Shared machinery (shell, steps, hints, progress) is defined once in §1 and referenced by each spec.
> **Educational, not production-grade:** each simulation must state its simplification in Arabic and must never imply it implements real cryptography, real networking, or a real HTTP server.

---

## 0. Index

| § | ID | Arabic title | Lesson | Build order |
|---|---|---|---|---|
| 1 | — | Simulation shell contract (shared) | — | Phase 3 |
| 2 | `SIM-TLS-01` | رحلة اتصال HTTPS | U2-L1 | 3rd (flagship) |
| 3 | `SIM-ARCH-01` | داخل تطبيق ويب | U3-L1 | 2nd |
| 4 | `SIM-HTTP-01` | طلب واستجابة | U3-L2 | **1st** |
| 5 | `SIM-NET-01` | صمّم شبكة آمنة | U2-L2 | postponed (v1.1) |
| 6 | `SIM-FE-01` | مختبر الواجهة الأمامية | U3-L3 | postponed (v1.1) |
| 7 | `SIM-AI-01` | درّب الآلة على التمييز | U1-L1 | MVP stretch |
| 8 | `SIM-IR-01` | ماذا تفعل الآن؟ | U2-L3 | v1.2 |
| 9 | `SIM-MEDIA-01` | اختر الوسيط المناسب | U4-L1 | v1.2 |
| 10 | `SIM-UX-01` | طبيب التخطيط | U4-L2 | v1.3 |
| 11 | `SIM-EVAL-01` | افحص هذا الموقع | U4-L3 | v1.3 |
| 12 | `SIM-ITER-01` | قبل وبعد | U4-L4 | v1.3 |
| 13 | — | MVP recommendation & sequencing | — | — |

---

## 1. Simulation shell contract (shared by every simulation)

### 1.1 Screen anatomy (identical for all sims)

```
┌──────────────────────────────────────────────────────────┐
│  ← رجوع إلى الدرس        رحلة اتصال HTTPS      [تقدّم ٤/٦] │  header
├──────────────────────────────────────────────────────────┤
│                                                          │
│                      STAGE  (sim-specific)               │
│        the interactive diagram; RTL flow (right→left)     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  الشرح: نص عربي قصير لهذه الخطوة (≤ 45 كلمة)              │  narration
├──────────────────────────────────────────────────────────┤
│  [تلميح]   [السابق]  ●●○○○○  [التالي]      [إعادة]        │  controls
└──────────────────────────────────────────────────────────┘
```

- Stage height: `min(52vh, 380px)` on mobile, `420px` on desktop; never causes page scroll-jump between steps.
- Narration panel is `aria-live="polite"`; controls are the only focusable group after a step change.
- The step timeline (`●●○○○○`) is clickable for already-visited steps only (no skipping ahead).

### 1.2 Shared state machine

Every simulation is a **pure reducer** over `{ step, phase, actions, result, hintsUsed }`:

```ts
type SimStatus = 'idle' | 'running' | 'won' | 'failed';

interface SimState<S, A> {
  status: SimStatus;
  step: number;          // 0-based index into steps
  data: S;               // sim-specific state
  hintLevel: 0 | 1 | 2 | 3;
  actions: A[];          // ordered action log (used by progress + tests)
  startedAt: number;
}

type SimAction<A> =
  | { type: 'start' }
  | { type: 'next' } | { type: 'prev' }
  | { type: 'do'; action: A }
  | { type: 'hint' }
  | { type: 'reset' };
```

Rules:
1. `next` is disabled while the current step has an unmet `requiredAction` (e.g. certificate checks in `SIM-TLS-01`).
2. `reset` returns `initialState` and keeps `startedAt` for time tracking, while clearing `actions` and `hintLevel`.
3. `won` is set only by `evaluateSuccess(state)`, never by reaching the last index.
4. Any `do` action not valid for the current step is a no-op and logs `{ ignored: true }` in dev — never throws.

### 1.3 Content-driven text (no Arabic inside components)

Every step pulls narration, instruction, hint ladder, and labels from the simulation's content file:

```ts
interface SimStepContent {
  id: string;                 // 'client-hello'
  title: string;              // «المتصفح يبدأ الحديث»
  narration: string;          // ≤ 45 words
  instruction?: string;       // «اضغط على كل فحص لتنفيذه»
  hints: [string, string, string];   // 3 graded levels
  a11yLabel: string;          // stage description for screen readers
}
```

**Build validation:** a step without 3 hints, or narration > 60 words, fails `npm run validate:content`.

### 1.4 Shared components (build once, in Phase 3)

| Component | Purpose |
|---|---|
| `<SimFrame>` | Header, progress, title, back link, RTL container |
| `<SimStage>` | Fixed-ratio stage with `role="img"` fallback description and reduced-motion context |
| `<SimNarration>` | Arabic explanation panel + instruction |
| `<SimControls>` | التالي/السابق/إعادة + step dots + keyboard handling (←/→) |
| `<SimHint>` | 3-level progressive hint drawer; logs `hintsUsed` |
| `<SimResult>` | Success/failure card with Arabic explanation + «أعد المحاولة» + «الدرس التالي» |
| `<NodeCard>` | Bordered entity card (browser/server/db) used by TLS + ARCH |
| `<Packet>` | Animated token that travels along a path with a payload label |
| `<KeyBadge>` | Public/private/session key chip with icon + Arabic label |
| `<VerifyCheck>` | One certification check row with state (untested/pass/fail) |
| `<CodeLtr>` | LTR code/URL/protocol token inside Arabic text |

### 1.5 Accessibility requirements (apply to *all* sims)

- Stage changes announced via `aria-live`; the narration text is also present as visible text (never tooltip-only).
- Status is never colour-only: every success/failure also has an icon and an Arabic word («محمي» / «غير آمن»).
- Keyboard: Tab through controls, Enter/Space to act, ←/→ for steps, `Esc` closes hint drawer.
- `prefers-reduced-motion: reduce` → packets jump between nodes (100 ms fade), no travel, no parallax, no shake.
- Minimum text 16 px (18 px for narration), line-height ≥ 1.8, tap targets ≥ 44 px.
- Focus order follows reading order: right → left within the stage, then narration, then controls.

### 1.6 Mobile interaction model

- Stage becomes **vertical**: source node top, destination bottom, packets travel downward.
- Long labels wrap; nodes become full-width rows; stage auto-scrolls to the active node with `scroll-margin-top: 72px`.
- Controls stick to the bottom above the safe-area inset; the narration panel is collapsible (default open on first step).
- No hover-only affordances; every hover state has a focus/tap equivalent.
- All sims must be fully usable at 360×640 with keyboard closed.

### 1.7 Progress recording

On `won` (or `failed` after 3 attempts), write to `manhag.progress.v1`:

```ts
{
  simId: 'SIM-HTTP-01',
  status: 'completed' | 'attempted',
  completedAt: ISOString | null,
  hintsUsed: 0 | 1 | 2 | 3,
  attempts: 2,
  durationSec: 214,
  lastStep: 5,
  version: 1
}
```

Lesson completion requires the lesson's primary sim `completed` **or** explicitly skipped («تخطّي المحاكاة» — logged, never blocks reading).

### 1.8 Testing (all sims)

- Reducer unit tests: every action sequence in the spec's flow table; invalid action; reset idempotency; success predicate truth table.
- Component tests (Testing Library): step advance disabled until required action; hint ladder levels; reset clears UI; Arabic text present; `aria-live` updates.
- Visual regression: 3 stages per sim (initial, mid, result) at 360 and 1280 px.
- Never assert on animation frames — assert on final state after `await findByText`.

---

## 2. `SIM-TLS-01` — رحلة اتصال HTTPS

### 2.1 Identity

| Field | Value |
|---|---|
| Arabic title | **رحلة اتصال HTTPS** |
| Subtitle | «من رسالة الترحيب إلى بيانات مشفّرة» |
| Unit / lesson | U2 — الأمن السيبراني / U2-L1 التشفير والمصادقة (Lesson 2-1) |
| Route | `/lessons/u2-1-encryption-auth/sim/tls-handshake` |
| Duration | 8–12 min |
| Difficulty | متوسط |
| Class | `sim` (step-based) |
| Version | MVP v1.0 |

### 2.2 Learning objectives

- U2-L1-O1 — يرى الفرق بين نص واضح ونص مشفّر على نفس البيانات.
- U2-L1-O2 — يميّز التشفير المتماثل من التشفير بالمفتاح العام من خلال *وظيفتهما* في الاتصال.
- U2-L1-O3 — يربط كل مفتاح بمالكه (عام للخادم، خاص للخادم، مفتاح جلسة مشترك).
- U2-L1-O4 — يتحقق من شهادة رقمية بنفسه (الجهة المُصدرة، الصلاحية، النطاق).
- U2-L1-O5 — يفسّر معنى القفل في شريط العنوان.
- U2-L1-O6 — يرتّب الخطوات العامة للمصافحة.
- U2-L1-O7 — يشرح لماذا يُستخدم مفتاح جلسة قصير العمر.

### 2.3 Concepts taught

تشفير · نص واضح/مشفّر · مفتاح عام/خاص · شهادة رقمية · جهة إصدار · مصافحة TLS · مفتاح جلسة · اتصال محمي مقابل غير محمي · اعتراض الاتصال (MITM) بمستوى تعريفي.

### 2.4 Student starting state

- Stage shows: **المتصفح** on the right, **الخادم (store.example)** on the left, a dashed grey path between them labelled «اتصال غير محمي».
- Padlock is grey with text «غير آمن»; the login form below the browser contains a password field with the value `123456` (visible, to make the contrast tangible).
- Step 0 (idle): only «ابدأ المحاكاة» is enabled. Timeline is empty.
- Certificate panel is collapsed; key tray is empty; a tab «قارن: اتصال غير آمن» is available.

### 2.5 Main interactive elements

1. `NodeCard` المتصفح (with a small address bar `https://store.example`).
2. `NodeCard` الخادم (shows `🔒 مفتاح خاص` badge only after step 2).
3. `Packet` carrying a labelled payload (e.g. «ClientHello»).
4. `CertificatePanel` — fields: الجهة المُصدرة، اسم النطاق، تاريخ الانتهاء، بصمة.
5. `VerifyCheck` × 3 (interactive in step 3).
6. `KeyBadge` tray — المفتاح العام، المفتاح الخاص، مفتاح الجلسة (appears on both sides in step 4).
7. `PayloadInspector` — toggle «كما يراها المراقب» / «كما يراها الخادم».
8. `SecurityToggle` — «اتصال غير آمن (HTTP)» vs «HTTPS» comparison view.
9. `AttackerToggle` — «شخص يعترض الشبكة» (step 6 only, and in comparison mode).

### 2.6 Controls

| Control | Arabic label | Behaviour |
|---|---|---|
| Start | «ابدأ المحاكاة» | state → running, step 1 |
| Next | «التالي» | disabled until the step's required action is done |
| Prev | «السابق» | revisits a past step, read-only (actions stay recorded) |
| Reset | «إعادة المحاكاة» | full reset + undo toast «تمت الإعادة — تراجع» 5 s |
| Hint | «تلميح» | unlocks next hint level |
| Cert check | «تحقّق» (per row) | runs one verification, sets pass/fail |
| Send secret | «أرسل كلمة المرور» | triggers encrypted or plaintext transfer |
| Compare | «شاهد الفرق» | switches stage to the insecure view |
| Attacker | «اعتراض الاتصال» | injects MITM state |

### 2.7 Step-by-step flow

| # | Step (Arabic title) | What happens on stage | Required student action | Narration (verbatim, ≤ 45 words) |
|---|---|---|---|---|
| 0 | «قبل أن نبدأ» | Browser and server idle; grey padlock; visible password `123456` | Press «ابدأ المحاكاة» | «كلمة المرور هذه ستنتقل عبر الشبكة. تابع الخطوات لتعرف كيف تُحمى قبل أن تخرج من جهازك.» |
| 1 | «المتصفح يبدأ الحديث» | Plaintext packet labelled «ClientHello» travels right → left | Press «التالي» after reading the payload | «المتصفح يبدأ الحديث برسالة ترحيب غير مشفّرة: "أريد اتصالًا آمنًا، وهذه إصدارات التشفير التي أفهمها". لا سرّ في هذه الرسالة، لكنها بداية الاتصال.» |
| 2 | «الخادم يعرّف نفسه» | Server responds: «ServerHello» + certificate card flies to browser; private-key badge appears on server | Open the certificate panel (tap the card) | «الخادم يردّ ويرسل شهادته الرقمية. الشهادة بطاقة تعريف رقمية تخبر المتصفح: من صاحب الموقع، ومن أصدر الشهادة، ومتى تنتهي صلاحيتها.» |
| 3 | «هل أثق؟» | Three `VerifyCheck` rows appear; each must be pressed | Press all three checks; all must pass | «قبل أن يثق المتصفح، يتحقق من ثلاثة أمور: من أصدر الشهادة، وهل ما زالت صالحة، وهل اسم النطاق مطابق. نفّذ الفحوص بنفسك.» |
| 4 | «توليد مفتاح الجلسة» | Browser generates a key; a copy is sealed with the server's public key; server opens it with its private key; the same key badge lands on both sides | Press «أنشئ مفتاح الجلسة» | «المتصفح يُنشئ مفتاح جلسة جديدًا ويشفّر نسخة منه بالمفتاح العام للخادم. الخادم يفكّها بمفتاحه الخاص. الآن الطرفان يعرفان المفتاح نفسه فقط.» |
| 5 | «تأكيد الاتصال» | Encrypted «Finished» packets both ways; padlock turns green with «محمي» | Press «التالي» | «يرسل الطرفان رسالة تأكيد مشفّرة بمفتاح الجلسة. إذا فكّها كل طرف بنجاح، يصبح الاتصال آمنًا ويظهر القفل الأخضر.» |
| 6 | «البيانات المشفّرة» | Login form active; student sends the password; `PayloadInspector` shows ciphertext in transit and plaintext at the server | Choose «أرسل كلمة المرور» (or type a new one), then compare with «شاهد الفرق» | «كل ما تكتبه الآن يُشفّر قبل أن يخرج من جهازك، ويفكّ عند الخادم فقط. من يعترض الطريق يرى رموزًا لا معنى لها.» |

**Success:** all 6 steps completed + 3/3 certificate checks passed + at least one secret sent in HTTPS mode. Result card: «أحسنت! أنت الآن تعرف كيف يتحول اتصال مفتوح إلى اتصال محمي — ومَن يحمي ماذا في كل خطوة.»

**Insecure comparison view (any step ≥ 2):** same path, no handshake, password travels in clear text, attacker toggle reveals `123456`, padlock red «غير آمن». Narration: «في اتصال HTTP عادي تنتقل كلمة المرور كما هي. أي شخص على نفس الشبكة يمكنه قراءتها.» Then a button «عُد إلى HTTPS».

### 2.8 Visual design and animation

- Palette: neutral stage; keys use accent amber; encrypted payloads render as a mono `#7f3a…` token block; plaintext renders as Arabic text in a red-tinted chip.
- Packet travel: 700 ms, ease `cubic-bezier(.22,1,.36,1)`, single pass, trail disabled under reduced motion.
- Certificate panel slides up from the stage bottom on mobile, in from the start edge on desktop.
- Padlock animates a single 400 ms morph grey→green (colour + icon + label change, so colour is not the only cue).
- Attacker: a red dashed line drops onto the path; intercepted packet shows `PayloadInspector` side-by-side with «ما يراه المراقب» / «ما يراه الخادم».
- No laugh/shake effects; failure uses a calm amber panel, never red flashing.

### 2.9 Arabic instructions and feedback

- Instructions: «اضغط على كل فحص لتنفيذه» · «افتح الشهادة لتقرأ بياناتها» · «قارن بين الاتصالين».
- Feedback success: «صحيح: الشهادة صالحة واسم النطاق مطابق، لذلك يقبل المتصفح الشهادة.»
- Feedback failure: «توقّف الاتصال: تاريخ الشهادة منتهٍ. المتصفح لا يقبل شهادة منتهية لأن هوية الخادم لم تعد مؤكدة.»
- Never «خطأ» alone; each failure names the step and the reason.

### 2.10 Success and failure states

| State | Trigger | UI | Recovery |
|---|---|---|---|
| Won | 3 cert checks pass, 6 steps, 1 secret sent | Green result card + «الدرس التالي» + «شاهد شرحًا مختصرًا» | — |
| Cert failed (expired) | Student marks «الصلاحية» as failed → actually toggles a preset scenario? | Amber card: «شهادة منتهية» | «جرّب شهادة صالحة» |
| Cert failed (domain) | Student compares domain and finds mismatch (scenario `SIM-TLS-MITM`) | Attacker view + «توقف الاتصال» | «أعد المحاكاة» |
| Wrong order | Student tries to send data before step 5 | Toast: «لم يكتمل الاتصال بعد — لا يوجد مفتاح جلسة» | Buttons stay on current step |
| Abandoned | Leaves after start | Progress saved as `attempted` with `lastStep` | Resume card on lesson page |

The certificate is **not** failed by random chance: the primary path always uses a valid certificate; the invalid-certificate scenario is a deliberate branch the student selects («جرّب شهادة منتهية») or enters via the attacker toggle.

### 2.11 Hints (3 levels, per step)

| Level | Step 3 example | Step 4 example |
|---|---|---|
| 1 (توجيه) | «الشهادة فيها أربع معلومات. ابحث عن تاريخ الانتهاء.» | «مَن يستطيع فتح الرسالة المشفّرة؟» |
| 2 (تلميح أقرب) | «إذا كان التاريخ قبل اليوم، فالشهادة منتهية.» | «المفتاح العام يشفّر، والخاص يفكّ. من يملك الخاص؟» |
| 3 (شبه إجابة) | «الفحص الثالث: هل اسم النطاق في الشهادة يطابق `store.example`؟» | «المتصفح يشفّر مفتاح الجلسة بالمفتاح العام، والخادم يفكّه بمفتاحه الخاص.» |

### 2.12 Assessment questions (Arabic, with answers)

| ID | Question | Choices | Correct | Why (shown after answering) |
|---|---|---|---|---|
| Q-U2-L1-1 | ما الغرض الأساسي من التشفير؟ | أ) إخفاء معنى البيانات عمّن لا يملك المفتاح · ب) تسريع الاتصال · ج) تقليل حجم الملفات · د) منع الفيروسات | أ | التشفير يحوّل النص إلى صورة لا تُفهم إلا بالمفتاح الصحيح. |
| Q-U2-L1-2 | أي مفتاح يُستخدم لتشفير رسالة موجّهة إلى الخادم في التشفير بالمفتاح العام؟ | أ) المفتاح العام للخادم · ب) المفتاح الخاص للخادم · ج) مفتاح المستخدم الخاص · د) لا مفتاح | أ | أي شخص يستطيع التشفير بالمفتاح العام، لكن الفك يحتاج المفتاح الخاص. |
| Q-U2-L1-3 | ما وظيفة الشهادة الرقمية؟ | أ) تربط المفتاح العام بهوية الموقع وتصادق عليها جهة موثوقة · ب) تخزّن كلمة المرور · ج) تسرّع تحميل الصور · د) تمنع الإعلانات | أ | الشهادة هي «بطاقة هوية» الخادم، موقّعة من جهة إصدار موثوقة. |
| Q-U2-L1-4 | لماذا يُنشأ مفتاح جلسة جديد لكل اتصال بدل استخدام المفتاح العام دائمًا؟ | أ) لأنه أسرع، ولأن كشفه يؤثر في اتصال واحد فقط · ب) لأنه أكبر حجمًا · ج) لأنه لا يحتاج تشفيرًا · د) لأنه يُخزَّن على الخادم | أ | التشفير المتماثل أسرع، وقِصَر عمر المفتاح يحدّ من الضرر. |
| Q-U2-L1-5 | رتّب الخطوات: (١) مفتاح جلسة (٢) التحقق من الشهادة (٣) رسالة الترحيب (٤) تبادل البيانات المشفّرة | ترتيب | ٣ ← ٢ ← ١ ← ٤ | الترحيب أولًا، ثم الشهادة، ثم المفتاح، ثم البيانات. |
| Q-U2-L1-6 | ما الذي يميّز مفتاح الجلسة؟ | أ) مشترك بين الطرفين ومؤقت · ب) عام للجميع · ج) محفوظ في الشهادة · د) يُستخدم مرة واحدة فقط للترحيب | أ | مفتاح واحد للطرفين، لاتصال واحد. |
| Q-U2-L1-7 | ما فائدة التوقيع الرقمي؟ | أ) إثبات أن البيانات صادرة ممّن يدّعي الإرسال وأنها لم تُعدّل · ب) ضغط البيانات · ج) إخفاء عنوان IP · د) تسريع المصافحة | أ | التوقيع يثبت المصدر والسلامة، لا السرية. |
| Q-U2-L1-8 | أي مثال يمثّل المصادقة متعددة العوامل؟ | أ) كلمة مرور + رمز على الهاتف · ب) كلمة مرور قوية فقط · ج) اسم مستخدم فقط · د) بريد إلكتروني فقط | أ | عوامل من أنواع مختلفة: شيء تعرفه + شيء تملكه. |

Questions 5 and 7 are the ones flagged `needsReview` for CU-03/CU-08 depth.

### 2.13 Accessibility requirements (specific)

- Stage has a text transcript of every step («نص المحاكاة» toggle) so the sim is fully usable without animation.
- Certificate panel is a real `<dialog>` with focus trap and `Esc` to close; its fields are a `<dl>`.
- `VerifyCheck` is a `<button role="checkbox" aria-checked>` with an Arabic state label, not a custom div.
- The attacker/ciphertext view exposes both payload variants as text — never image-only.
- No meaning relies on the packet's position: every step also states the direction in words.

### 2.14 Mobile interaction design

- Vertical stage: browser top → server bottom; packets travel down; certificate panel is a bottom sheet at 85% height.
- Key tray becomes a horizontal scroll strip of 3 chips, each 44 px tall.
- «شاهد الفرق» comparison uses a segmented control (HTTPS | HTTP) above the stage, not two side-by-side panes.
- Narration collapses to 3 lines with «اقرأ المزيد» after step 2 to preserve stage space.

### 2.15 Technical implementation approach

- **Rendering:** DOM + inline SVG (no canvas) — all nodes are real elements for a11y and responsive text.
- **Animation:** `motion` (Framer Motion) `layout` + `x/y` transforms on a fixed-position layer; a single `<motion.div>` per packet, keyed by `packetId`.
- **State:** `useReducer(tlsReducer, initialState)`; `tlsReducer` is a pure function in `src/simulations/tls-handshake/machine.ts`, exported and unit-tested. React state lives in a Zustand store only for cross-sim progress, not for step state.
- **Ciphertext:** deterministic fake: `fakeEncrypt(text, keyId)` maps each char to a fixed hex pair from a seeded table — no crypto library, and the Arabic callout says it is a visual simulation.
- **Randomness:** none in the main path; scenario branches are explicit choices, so tests are deterministic.
- **Bundle:** sim route is a separate lazy chunk (`dynamic(() => import(...), { ssr: false })`), ≤ 90 KB gzip including animation lib.
- **Data:** all text in `content.ts` colocated with the sim; type-checked by `SimStepContent[]`.

### 2.16 Complexity estimate

| Work | Days |
|---|---|
| Stage layout + node/packet primitives (shared) | 1.0 |
| Certificate dialog + 3 verification checks | 1.0 |
| Key exchange + encrypted payload inspector | 1.0 |
| Comparison view + attacker toggle | 0.75 |
| Narration/sidebar content + hints + result states | 0.5 |
| Reducer tests + component tests + a11y pass | 0.75 |
| **Total** | **5.0** |

### 2.17 Dependencies

- Simulation shell (§1) + `SimFrame`, `NodeCard`, `Packet`, `KeyBadge`, `VerifyCheck` primitives (built in Phase 3).
- U2-L1 lesson content written (the sim assumes the student read sections 1–3).
- Arabic transcript text (part of the sim content file).
- No external library, no network, no storage beyond progress.

### 2.18 Acceptance criteria

1. A first-time student can complete the main path in ≤ 12 min without using a hint.
2. «التالي» is disabled until all three certificate checks are performed.
3. After the handshake, the payload inspector shows different values for «ما يراه المراقب» and «ما يراه الخادم» on the exact same message.
4. Switching to «اتصال غير آمن» shows the password in clear text and a red padlock with the word «غير آمن».
5. Reset from any state returns to step 0, clears keys, checks, and payloads, and shows the undo toast.
6. Keyboard-only completion is possible; no focus trap except inside the certificate dialog.
7. With `prefers-reduced-motion`, no element travels more than 24 px and all steps still convey direction in text.
8. All narration and hints are Arabic; no English sentence appears except technical identifiers inside `CodeLtr`.
9. Reducer unit tests cover success, wrong order, failed check, reset; coverage ≥ 80% for `machine.ts`.
10. At 360 px width there is no horizontal scroll, and the certificate sheet is scrollable to its last field.
11. Completion writes `SIM-TLS-01` progress and the lesson page shows «تمّت المحاكاة ✓».
12. The simplification callout («شرح تعليمي مبسّط») is visible on the result card.

---

## 3. `SIM-ARCH-01` — داخل تطبيق ويب

### 3.1 Identity

| Field | Value |
|---|---|
| Arabic title | **داخل تطبيق ويب** |
| Subtitle | «من ضغطة زر إلى صف في قاعدة البيانات» |
| Unit / lesson | U3 / U3-L1 البنية العامة لتطبيقات الويب |
| Route | `/lessons/u3-1-web-architecture/sim/request-journey` |
| Duration | 8–10 min · Difficulty: مبتدئ · Class: `sim` · Version: MVP |

### 3.2 Learning objectives

U3-L1-O1…O5 (roles; request→process→response order; frontend vs backend; why the browser never talks to the DB directly; what breaks when a component fails).

### 3.3 Concepts

العميل · الخادم · قاعدة البيانات · الواجهة الأمامية · الواجهة الخلفية · الطلب/الاستجابة · واجهة برمجة التطبيقات (API) · مسار الطلب · فشل المكوّن.

### 3.4 Student starting state

- Stage holds three `NodeCard`s in RTL flow: **المتصفح (العميل)** right → **الخادم** centre → **قاعدة البيانات** left. A thin path connects them, grey (inactive).
- Mission selector at the top with two missions: «١. افتح صفحة الدرس» (read path) and «٢. احفظ نتيجة الاختبار» (write path). Mission 1 selected.
- The browser card shows a mini page with a link «التشفير والمصادقة»; the DB card shows an empty table `lessons(id, title)`.
- Layer legend: chips «الواجهة الأمامية» (browser) and «الواجهة الخلفية» (server + DB).

### 3.5 Main interactive elements

1. Three `NodeCard`s, each tappable to open an inspector («ماذا يفعل هذا المكوّن؟»).
2. `Packet` with a JSON-ish payload preview maintained in `CodeLtr`.
3. Server sub-panels: «استقبال الطلب» → «قراءة البيانات» → «تجهيز الاستجابة» (three sub-steps revealed in sequence).
4. DB table visualisation with rows highlighting on read and a new row appearing on write.
5. Browser render preview — a skeleton that turns into the actual lesson card.
6. `FaultChip`s: «أوقف الخادم»، «أوقف قاعدة البيانات»، «أوقف JavaScript» — three fault toggles available in an «اختبر الفشل» tab.
7. Layer legend toggling a translucent highlight over frontend vs backend.

### 3.6 Controls

«شغّل الطلب» · «التالي» · «السابق» · «إعادة» · mission tabs · «افحص المكوّن» (per node) · fault toggles · «تلميح».

### 3.7 Step-by-step flow (Mission 1 — read path)

| # | Title | Stage | Action | Narration |
|---|---|---|---|---|
| 0 | «ثلاثة أدوار» | Three nodes idle; paths grey | Inspect all three nodes (required) | «كل تطبيق ويب ثلاث شخصيات: متصفح يطلب، وخادم يقرّر، وقاعدة بيانات تتذكّر. لنرَ من يفعل ماذا.» |
| 1 | «ضغطة على رابط» | Browser highlights; a click ripple on the lesson link | Press «شغّل الطلب» | «ضغطة واحدة على رابط تبدأ رحلة. المتصفح يجهّز طلبًا ويحدّد له مسارًا: `/lessons` — أي "أريد قائمة الدروس".» |
| 2 | «الطلب يعبر الشبكة» | Packet right → centre labelled `GET /lessons` | Press «التالي» | «الطلب يخرج من المتصفح عبر الشبكة. لاحظ أنه طلب قراءة فقط: لا يغيّر شيئًا، فقط يسأل.» |
| 3 | «الخادم يستقبل» | Server sub-panel 1 lights; shows the parsed request | Press «التالي» | «الخادم يستقبل الطلب ويقرأه: ما المسار؟ وما الطريقة؟ هنا تعمل الواجهة الخلفية — الكود الذي لا يراه المستخدم.» |
| 4 | «الخادم يسأل قاعدة البيانات» | Server → DB packet `SELECT`; DB rows highlight | Press «التالي» | «الخادم لا يملك البيانات عادةً، بل يسأل قاعدة البيانات. الجملة التي يرسلها تسمّى استعلامًا، والنتيجة تعود إليه لا إلى المتصفح.» |
| 5 | «تجهيز الاستجابة» | Server builds a response card with `200` and a JSON body preview | Press «التالي» | «يجمع الخادم النتيجة ويجهّز استجابة: رمز الحالة `200` يعني "تم بنجاح"، ومعها البيانات المطلوبة.» |
| 6 | «العودة والعرض» | Packet centre → right; browser skeleton becomes the lesson cards | Press «التالي» | «تصل الاستجابة إلى المتصفح، فيستخدم HTML وCSS ليرسم الصفحة. هذه هي الواجهة الأمامية: ما تراه وتلمسه.» |
| 7 | «خلاصة المسار» | Full path glows; numbered 1–4 overlay | Press «أنهِ المهمة» | «طلب ← خادم ← قاعدة بيانات ← استجابة ← عرض. أي تطبيق ويب يعيد هذه الدورة، مهما كبر.» |

**Mission 2 (write path, 3 extra steps):** student presses «احفظ النتيجة» in the mini page → `POST /attempts` → server validates → `INSERT` row appears in `attempts(id, score)` → `201` → browser shows «تم حفظ نتيجتك». Narration focuses on "write vs read" and why the server must validate before writing.

**Mission 3 (fault lab, optional):** three toggles with pre-written consequences:
- «أوقف قاعدة البيانات» → server returns `500`, browser shows «تعذّر تحميل البيانات» — «الخادم موجود، لكنه لا يستطيع الوصول إلى ذاكرته.»
- «أوقف الخادم» → browser shows a network error — «بدون خادم لا يوجد من يردّ. المتصفح لا يستطيع الوصول إلى قاعدة البيانات مباشرة.»
- «أوقف JavaScript» → page loads but the button does nothing — «البنية موجودة، لكن السلوك (JavaScript) توقّف.»

### 3.8 Visual design and animation

- Three cards with a strong identity colour each: browser = teal, server = indigo, database = violet; icons: window, gears, cylinder.
- Packet is a small chip with a `CodeLtr` label; 600 ms travel; server sub-steps appear as stacked mini-rows with 120 ms stagger.
- DB writes animate a row sliding in from the end edge; reads pulse the matching row once.
- Successful response shows `200` in a green chip with the text «نجاح»; errors use amber and always carry words.
- Fault state dims the failed node, breaks the path with a visible gap and a label «انقطع المسار».

### 3.9 Arabic instructions and feedback

«افحص كل مكوّن أولًا» · «اختر المهمة» · «شغّل الطلب ولاحظ اتجاه السهم» · Feedback: «صحيح: قاعدة البيانات لا تتصل بالمتصفح مباشرة، لأنها لا تعرف من يطلب ولا تتحقق من صلاحيته.» Failure: «هذا المكوّن لا يرسل الطلب بنفسه؛ إنه يجيب عليه فقط.»

### 3.10 Success and failure states

- **Won:** missions 1 and 2 completed + all three nodes inspected + at least one fault observed → card: «فهمت الدورة كاملة: طلب، معالجة، استجابة.»
- **Partial:** mission 1 only → «أكملت مسار القراءة. جرّب مسار الكتابة الآن.»
- **Failure class:** only in the prediction sub-task («ماذا سيحدث لو أوقفنا الخادم؟») — wrong prediction gets an explanation and a "شاهد بنفسك" button that runs the fault.
- No dead ends: every fault can be cleared with «أصلح الشبكة».

### 3.11 Hints

1. «المكوّن الذي يطلب هو المتصفح، والمكوّن الذي يخزّن هو قاعدة البيانات.»
2. «اسأل نفسك: من يعرف كلمة المرور ومن يتحقق منها؟»
3. «الخادم هو الوسيط: يستقبل الطلب، يتحقق، يسأل قاعدة البيانات، ثم يردّ.»

### 3.12 Assessment questions

| ID | Question | Correct answer |
|---|---|---|
| Q-U3-L1-1 | أي مكوّن يعرض الصفحة للمستخدم؟ | الواجهة الأمامية في المتصفح |
| Q-U3-L1-2 | ما الترتيب الصحيح؟ | طلب ← خادم ← قاعدة بيانات ← استجابة ← عرض |
| Q-U3-L1-3 | من يتحقق من صلاحية المستخدم قبل قراءة بياناته؟ | الخادم |
| Q-U3-L1-4 | لماذا لا يتصل المتصفح بقاعدة البيانات مباشرة؟ | لأن ذلك سيكشف البيانات ويعطي العميل صلاحيات لا يجب أن يملكها |
| Q-U3-L1-5 | ما الذي يحدث عند تعطّل قاعدة البيانات؟ | يستقبل الخادم الطلب لكنه لا يستطيع القراءة أو الكتابة، فيعيد خطأً |
| Q-U3-L1-6 | أين تُخزَّن نتائج الاختبارات؟ | في قاعدة البيانات، عبر الخادم |

### 3.13 Accessibility

Focusable node cards with `aria-expanded` inspectors; packet travel accompanied by a text sentence; fault toggles are real checkboxes with Arabic labels; the DB table is a semantic `<table>` with `<caption>`; path direction stated in words («من المتصفح إلى الخادم»).

### 3.14 Mobile

Vertical stack browser → server → DB with downward packets; server sub-steps inside an accordion; fault lab as a segmented tab; inspectors as bottom sheets; mission tabs become a 2-item scroll-snap row.

### 3.15 Technical approach

`useReducer` machine (`archReducer`) with `mission`, `step`, `inspected: Set`, `fault: 'none'|'db'|'server'|'js'`, `rows`. Nodes are absolutely positioned in a CSS grid so RTL/LTR mirror automatically via logical properties. Packet path uses SVG `path` with `offset-path` (`motion` fallback: transform interpolation). DB rows come from a static fixture array (5 rows), not a real database. No network calls.

### 3.16 Complexity: **3.0 days** (stage 0.75, server sub-steps 0.5, DB visual 0.5, missions 2–3 0.75, content/Arabic 0.25, tests 0.25).

### 3.17 Dependencies: shell + `NodeCard`/`Packet` (shared with TLS), U3-L1 content, lesson-page sim card.

### 3.18 Acceptance criteria

1. Student can run mission 1 end-to-end with 7 steps and sees the DB read before the response.
2. Mission 2 inserts a visible row and returns `201`.
3. All three fault toggles produce a distinct, explained outcome and can be cleared.
4. Packet direction is always stated in text as well as animation.
5. All three node inspectors are required before «شغّل الطلب» enables.
6. Reset returns to mission 1, empty DB writes, no faults.
7. Works at 360 px with no horizontal scroll; inspector sheets scroll internally.
8. Keyboard path: inspect → run → next → next … → finish, with visible focus.
9. Reducer tests cover each fault and each mission; ≥ 80% coverage.
10. Completion records `SIM-ARCH-01` progress.

---

## 4. `SIM-HTTP-01` — طلب واستجابة

### 4.1 Identity

| Field | Value |
|---|---|
| Arabic title | **طلب واستجابة** |
| Subtitle | «اقرأ الطلب، توقّع الرد، ثم أرسله» |
| Unit / lesson | U3 / U3-L2 أساليب الاتصال في تطبيقات الويب |
| Route | `/lessons/u3-2-http/sim/request-response` |
| Duration | 7–10 min · Difficulty: مبتدئ · Class: `sim` · Build **first** |

### 4.2 Learning objectives

U3-L2-O1…O5 (request anatomy; GET vs POST; status codes 200/301/401/403/404/500; predicting outcomes; how browser and server exchange information).

### 4.3 Concepts

HTTP · method · path · headers · body · status code · Content-Type · 401 vs 403 · HTTPS as HTTP + TLS.

### 4.4 Student starting state

- Left panel (end edge in RTL): a **request builder** with method select (`GET`, `POST`, `DELETE`), path field pre-filled `/api/lessons`, read-only headers, optional body editor.
- Right panel: an empty **response panel** with a grey placeholder «لم يُرسل أي طلب بعد».
- Below: a **mission strip** with 4 request cards (see below) and a status chip «0 / 4».
- A «توقّع النتيجة» select appears once the student inspects the request: choices 200 / 301 / 401 / 403 / 404 / 500.

### 4.5 Request catalogue (data-driven fixture, no real network)

| # | Method | Path | Sent body | Status | Response body | Arabic meaning |
|---|---|---|---|---|---|---|
| 1 | `GET` | `/api/lessons` | — | `200` | `[{ "id": 1, "title": "التشفير" }]` | نجاح — البيانات موجودة |
| 2 | `GET` | `/api/lessons/99` | — | `404` | `{ "error": "not found" }` | الدرس غير موجود |
| 3 | `POST` | `/api/login` | `{ "user": "sara", "pass": "123" }` | `401` | `{ "error": "unauthorized" }` | بيانات الدخول غير صحيحة |
| 4 | `DELETE` | `/api/lessons/3` | — | `403` | `{ "error": "forbidden" }` | لا تملك صلاحية الحذف |
| 5 | `GET` | `/api/reports` | — | `500` | `{ "error": "server error" }` | خطأ في الخادم |
| 6 | `POST` | `/api/lessons` | `{ "title": "" }` | `400` | `{ "error": "title required" }` | الطلب ناقص |

Missions: (١) «اجلب قائمة الدروس» → 200 · (٢) «سجّل الدخول بكلمة مرور خاطئة» → 401 · (٣) «حاول الحذف بدون صلاحية» → 403 · (٤) «افتح درسًا غير موجود» → 404. Requests 5 and 6 are free-exploration extras.

### 4.6 Controls

Mission card select · method select · «افحص الطلب» (reveals the three anatomy hotspots) · «توقّع النتيجة» select · «أرسل الطلب» · «التالي»/«السابق» (within the anatomy tour) · «إعادة» · «تلميح» · «أرسل نفس الطلب كـ HTTPS» (comparison chip).

### 4.7 Step-by-step flow

| # | Title | Stage | Action | Narration |
|---|---|---|---|---|
| 0 | «اختر طلبًا» | Builder + empty response + mission strip | Select mission 1 | «كل مهمة هنا طلب حقيقي الشكل. اختر واحدة، ثم افحص أجزاءها قبل الإرسال.» |
| 1 | «أجزاء الطلب» | Three hotspots pulse on the builder: الطريقة، المسار، الترويسات (+ الجسم) | Tap each hotspot (3 required) | «الطلب أربعة أجزاء: الطريقة (ماذا تريد؟)، والمسار (أين؟)، والترويسات (معلومات إضافية)، وأحيانًا جسم يحمل بيانات.» |
| 2 | «GET أم POST؟» | Method chip highlights; a tiny table compares read vs change | Answer the inline question «أي طريقة تُستخدم لجلب بيانات دون تغييرها؟» | «GET يطلب قراءة، وPOST يرسل بيانات لتُحفظ أو تُعالَج. اختيار الطريقة جزء من تصميم الواجهة، وليس تفصيلًا.» |
| 3 | «توقّع قبل الإرسال» | Prediction select appears | Choose a status | «قبل الإرسال: ماذا تتوقّع؟ التوقّع يجعل الملاحظة أدقّ — لا مشكلة إن كان توقّعك خطأً.» |
| 4 | «أرسل» | Packet leaves builder → server card → response arrives | Press «أرسل الطلب» | «الطلب يعبر الشبكة إلى الخادم. الخادم يقرأ الطريقة والمسار، ثم يقرّر ماذا يفعل.» |
| 5 | «اقرأ الاستجابة» | Response panel fills: status chip, headers (`Content-Type: application/json`), body in `CodeLtr` | Expand the status chip to see the Arabic meaning | «الاستجابة ثلاثة أجزاء أيضًا: رمز الحالة، والترويسات، والجسم. ابدأ دائمًا برمز الحالة: هو ملخّص الرد في رقم.» |
| 6 | «قارن توقّعك» | Prediction vs actual side-by-side; match → «توقّع صحيح ✓» | Press «التالي» | «توقّعك كان `___` والنتيجة `___`. الفرق بينهما هو أهم جزء في التعلم، وليس الدرجة.» |
| 7 | «401 أم 403؟» | Two mini cards appear with icons (key vs shield) | Sort two examples into 401/403 | «`401` تعني: لم أعرف من أنت. `403` تعني: عرفتك، لكن لا يُسمح لك. الفرق صغير في الشكل وكبير في المعنى.» |
| 8 | «أكمل المهام» | Mission strip shows progress; remaining missions available | Complete all 4 missions | «أكملت المهام الأربع: نجاح، وعدم وجود، ورفض هوية، ورفض صلاحية. هذه أشهر ما ستراه في أي تطبيق.» |

**Success:** 4/4 missions + 3 hotspots inspected + 1 correct prediction. Result: «أصبحت تقرأ الطلب قبل إرساله، وتعرف معنى الرد بمجرد النظر إلى رقمه.»

### 4.8 Visual design and animation

Request builder looks like a form with mono values in `CodeLtr`; server card is a simple "rack" icon; response slides in from the end edge with a 200 ms fade. Status chips are coloured **and** labelled: `200` «نجاح» green, `301` «انتقال» blue, `400` «طلب غير صحيح» amber, `401`/`403` «ممنوع» red-amber with distinct icons, `404` «غير موجود» grey, `500` «خطأ في الخادم» red. Packet travel 500 ms (shortest of all sims — the point is the content, not the motion).

### 4.9 Arabic instructions and feedback

«اختر مهمة من الأسفل» · «افحص الأجزاء الثلاثة» · «توقّع، ثم أرسل» · Feedback: «الخادم لم يجد الدرس رقم 99، فأعاد `404`. الرقم يخبرك أن المشكلة في المسار، لا في الخادم.» Failure: «المسار الذي كتبته غير موجود في هذه القائمة — استخدم المسار المكتوب في المهمة.»

### 4.10 Success and failure states

- **Won:** as above.
- **Mission mismatch:** sending a request that does not match the mission (e.g. `DELETE` for mission 1) → response is still shown (teaching moment) + chip «هذا ليس طلب المهمة» with «جرّب الطلب الصحيح».
- **Malformed path:** non-catalogue path → `404` + hint «المسارات المتاحة مكتوبة في المهام».
- No hard failure state: exploration always returns a response with explanation.

### 4.11 Hints

1. «اقرأ المسار في المهمة كما هو.»
2. «`POST` يرسل جسمًا؛ `GET` لا يرسل جسمًا عادةً.»
3. «`401` = الهوية غير مؤكدة. `403` = الهوية مؤكدة لكن الصلاحية ممنوعة.»

### 4.12 Assessment questions

| ID | Question | Correct |
|---|---|---|
| Q-U3-L2-1 | أي جزء يحدّد «ماذا تريد أن تفعل»؟ | الطريقة (Method) |
| Q-U3-L2-2 | ما الفرق الأساسي بين GET وPOST؟ | GET للقراءة وPOST لإرسال بيانات لتُحفظ أو تُعالَج |
| Q-U3-L2-3 | ماذا يعني `404`؟ | المورد المطلوب غير موجود |
| Q-U3-L2-4 | ماذا يعني `401`؟ | لم يتم التحقق من هوية الطالب |
| Q-U3-L2-5 | ماذا يعني `500`؟ | حدث خطأ داخل الخادم |
| Q-U3-L2-6 | ما الذي تحمله الترويسات (Headers)؟ | معلومات إضافية عن الطلب أو الاستجابة (نوع المحتوى، اللغة…) |
| Q-U3-L2-7 | ما علاقة HTTPS بـ HTTP؟ | HTTPS هو HTTP داخل قناة مشفّرة |

### 4.13 Accessibility

Each hotspot is a focusable button with `aria-describedby` explaining the part; status meaning is text, never colour-only; the response body is a `<pre dir="ltr">` with `aria-label="جسم الاستجابة"`; prediction select is a native `<select>`; after sending, focus moves to the response heading.

### 4.14 Mobile

Builder stacks above the response; mission strip becomes a horizontal snap row; hotspots become an ordered list («١ الطريقة، ٢ المسار، ٣ الترويسات») that the student taps; body editor is collapsed behind «أضف جسمًا»; response is a collapsible card with status always visible.

### 4.15 Technical approach

Fixture table in `fixtures.ts` (`Endpoint[]`), reducer `httpReducer` handling `selectMission | inspect | predict | send | next | reset`. Response resolution is a pure lookup, so tests are trivial and fast. Payload rendering uses a tiny syntax highlighter (regex-based, ≤ 40 lines) or plain `<pre>` — no Prism/Shiki in v1 (bundle budget).

### 4.16 Complexity: **2.5 days** (builder 0.5, response 0.5, missions + fixtures 0.5, 401/403 sort 0.25, content 0.25, tests 0.5).

### 4.17 Dependencies: shell + `CodeLtr`; U3-L2 content; no shared visual primitive beyond `Packet`.

### 4.18 Acceptance criteria

1. All 4 missions completable; each shows a distinct status and Arabic explanation.
2. Prediction is compared to the actual result in words.
3. Sending a non-matching request still teaches (response + mismatch chip), never blocks.
4. 401 vs 403 sort task has feedback for both items.
5. Status meaning is visible as text next to the code.
6. Reset clears builder, response, prediction, and mission progress.
7. Fully keyboard operable; focus moves to the response after send.
8. No horizontal scroll at 320 px; response body scrolls internally.
9. Reducer tests cover every endpoint and reset.
10. Completion records progress and unlocks the quiz CTA.

---

## 5. `SIM-NET-01` — صمّم شبكة آمنة (postponed to v1.1)

1. **Arabic title:** صمّم شبكة آمنة · Subtitle: «أين تضع الحدود؟»
2. **Unit/lesson:** U2 / U2-L2 تصميم أمن الشبكات · Route `/lessons/u2-2-network-security/sim/design-network` · 12–15 min · صعب.
3. **Objectives:** U2-L2-O1…O5.
4. **Concepts:** جدار حماية · DMZ · تقسيم الشبكة · أقل صلاحية · سطح الهجوم · كشف التسلل.
5. **Starting state:** empty canvas with three labelled zones (الإنترنت / المنطقة المنعزلة / الشبكة الداخلية) and a component tray: خادم ويب، خادم قاعدة بيانات، جهاز طالب، نقطة وصول Wi-Fi، جدار حماية، نظام كشف التسلل. Attacker icon parked outside.
6. **Interactive elements:** zone containers, draggable component chips, connection lines, «شغّل حركة المرور», attack-path overlay, score panel, boundary badges.
7. **Controls:** drag/tap-place, remove (×), «شغّل السيناريو», «التالي سيناريو», «إعادة», «تلميح», «أظهر الهجوم».
8. **Flow:** (0) اقرأ الأدوار → (1) ضع المكوّنات في المناطق → (2) ضع جدار الحماية على الحدود → (3) شغّل حركة المرور المشروعة → (4) شغّل سيناريو هجوم على خادم الويب → (5) شغّل هجومًا على قاعدة البيانات → (6) راجع التقرير والنتيجة.
9. **Visuals:** zones as tinted bands (blue = internet, amber = DMZ, green = internal); traffic dots; attacker path drawn in dashed red with numbered hops; blocked hops show a shield animation and the Arabic word «حُجب».
10. **Arabic feedback:** «الخادم العام في المنطقة المنعزلة: صحيح، لأنه يحتاج الوصول من الإنترنت. قاعدة البيانات في الداخل: صحيح، لا يجب أن تُرى مباشرة.» · «قاعدة البيانات مكشوفة على الإنترنت: سيصل إليها المهاجم مباشرة.»
11. **Success/failure:** success = all components in defensible zones + both attack scenarios blocked at ≥ 2 layers. Failure = attack reaches DB → amber report with the exact hop and a targeted hint.
12. **Hints:** 3 levels, targeted at the failing hop.
13. **Assessment:** 5 items (Q-U2-L2-1…5) + in-sim evaluation score.
14. **Accessibility:** tap-to-place fallback (no drag required); every zone and connection has a text list view («قائمة الاتصالات») so the exercise is completable non-visually; blocked/allowed stated in words.
15. **Mobile:** vertical zone bands, tray as a bottom sheet, connections auto-route as straight lines; no precision dragging.
16. **Technical:** same reducer pattern; placement validation is a pure function `scorePlacement(placement): Finding[]`; graph drawn with plain SVG lines (no diagram library). Drag via pointer events with keyboard alternative.
17. **Complexity:** 5.5 days (placement 1.25, scoring engine 1, traffic animation 1, attack scenarios 1, a11y list view 0.75, tests 0.5).
18. **Dependencies:** shell, `NodeCard`, zone layout, scoring utilities. Independent of TLS/HTTP.
19. **Acceptance:** (a) can complete with tap-only on a phone; (b) each scenario's failure names the exact exposed hop; (c) score is explainable in Arabic, not just numeric; (d) reset restores tray; (e) works at 360 px.

---

## 6. `SIM-FE-01` — مختبر الواجهة الأمامية (postponed to v1.1)

1. **Arabic title:** مختبر الواجهة الأمامية · Subtitle: «عدّل، شاهد، افهم»
2. **Unit/lesson:** U3 / U3-L3 أساسيات تقنيات الواجهة الأمامية · `/lessons/u3-3-frontend/sim/playground` · 12–18 min · متوسط.
3. **Objectives:** U3-L3-O1…O4, O6.
4. **Concepts:** HTML structure/semantics · CSS selectors/properties · JS behaviour/events · responsive basics.
5. **Starting state:** three-tab editor (HTML / CSS / JavaScript) pre-filled with a small Arabic card («بطاقة درس») plus a live preview iframe; challenge 1 active in a side panel; «شاهد النتيجة» auto-runs on 600 ms debounce.
6. **Interactive elements:** code editors (plain `<textarea>` with mono LTR + line numbers optional), tab switcher, live preview, challenge list (3), «أظهر الحل» (locked until 2 hints), reset, error console («لوحة الرسائل»).
7. **Controls:** tab select · «شغّل» · «إعادة المثال» · «تلميح» · «تلميح أعمق» · challenge next.
8. **Flow:** (0) «ثلاث طبقات» — toggle each layer off to see its effect → (1) «غيّر النص» in HTML → (2) «غيّر اللون والمسافة» in CSS → (3) «أضف تفاعلًا» — button click changes text → (4) «اجعلها تعمل على الهاتف» — one media query task → (5) «خلاصة».
9. **Visuals:** editor/preview split (top/bottom on mobile); layer toggles as three chips with eye icons; preview card styled clearly; errors shown as Arabic messages mapped from common syntax errors, never raw stack traces.
10. **Arabic feedback:** «غيّرت `color` إلى `#1B4DB1`؟ ستلاحظ أن اللون تغيّر في المعاينة مباشرة. الـ CSS هو المسؤول عن الشكل، لا عن المعنى.» · «الزر لا يفعل شيئًا لأن JavaScript لم تُربط به بعد:»

```js
document.querySelector('#b').addEventListener('click', ...)
```
11. **Success/failure:** success per challenge (state check on the generated HTML/CSS/JS output or on a target element's computed style) + all 3 challenges = sim complete. Failure = friendly Arabic message naming the layer at fault.
12. **Hints:** level 1 conceptual, level 2 code snippet partial, level 3 full snippet with explanation (reveals solution).
13. **Assessment:** Q-U3-L3-1…7 (code-reading, not syntax recall).
14. **Accessibility:** editor is a labelled textarea (code is inherently LTR, `dir="ltr"`); preview iframe has a title; challenge status announced; all actions keyboard-reachable; error messages are text.
15. **Mobile:** editor above preview, sticky «شغّل» button, tabs scrollable, keyboard-open layout keeps the run button visible; no side-by-side panes.
16. **Technical:** `iframe sandbox="allow-scripts"` with `srcdoc` composed from the three panes + a fixed base CSS; **no** `allow-same-origin`, no network (`CSP: default-src 'none'`), 1 s timeout guard, message passing via `postMessage` for error capture (with `try/catch` + `window.onerror` inside the frame). Debounce 600 ms. Store last code per challenge in localStorage (`manhag.playground.v1`).
17. **Complexity:** 4.0 days (iframe sandbox + CSP 1, editors 0.75, live run 0.75, challenges + validation 1, mobile 0.5).
18. **Dependencies:** shell; U3-L3 content; CSP configuration for the app itself (`frame-src 'self' blob:`).
19. **Acceptance:** (a) editing CSS updates the preview within 700 ms; (b) invalid HTML never breaks the app shell; (c) reset restores the exact original code; (d) iframe cannot navigate the parent or fetch the network (verified by test); (e) 3 challenges completable with hints; (f) usable at 360 px with the keyboard open; (g) no eval outside the sandbox.

---

## 7. `SIM-AI-01` — درّب الآلة على التمييز (MVP stretch, 2.5 days)

1. **Arabic title:** درّب الآلة على التمييز · Subtitle: «كيف تتعلّم الآلة من الأمثلة؟»
2. **Unit/lesson:** U1 / U1-L1 كيف يعمل الذكاء الاصطناعي · `/lessons/u1-ai-basics/sim/train` · 6–9 min · مبتدئ.
3. **Objectives:** U1-L1-O2, O4, O5 (data → learning → output; data vs output; why output can be wrong).
4. **Concepts:** بيانات · مثال · تسمية (label) · تعلّم · دقة · خرج · تحيّز.
5. **Starting state:** a tray of 8 illustrated items (تفاحة، موزة، سيارة، دراجة…) with two bins («فاكهة» / «مركبة»); the machine's accuracy meter shows `50%` (random guess); a «بيانات التدريب» counter shows `0 / 8`.
6. **Interactive elements:** item cards, two bins (tap or drag), accuracy meter, label feedback, «اختبر الآلة» button that shows 4 new items' predictions, an «مثال سيئ» toggle that injects a mislabelled item.
7. **Controls:** tap-to-label, «درّب», «اختبر», «أضف مثالًا سيئًا», «إعادة», «تلميح».
8. **Flow:** (0) «ما هذه الآلة؟» → (1) صنّف 8 أمثلة (each label updates the counter) → (2) «درّب» — the accuracy meter rises from 50% to 100% with each labelled example → (3) «اختبر على أمثلة جديدة» — predictions appear with confidence → (4) «أضف مثالًا مُصنَّفًا خطأً» — accuracy drops, one prediction flips → (5) «الخلاصة»: «البيانات الجيدة = نتيجة جيدة.»
9. **Visuals:** friendly geometric illustrations (SVG, no photos), a simple meter, a "training" pulse on the machine icon for 300 ms per example; predictions as cards with a ✓/✗ and a confidence bar (no percentages beyond 5% steps).
10. **Arabic feedback:** «أضفت مثالًا: تفاحة → فاكهة. صار عند الآلة مثال جديد تتعلّم منه.» · «هذا المثال كان مُصنَّفًا خطأً، فتعلّمت الآلة شيئًا غير صحيح — وهذا سبب انخفاض الدقة.»
11. **Success/failure:** success = 8 labeled + 1 test run + 1 bad example observed. No punitive failure; the bad-example step is the lesson.
12. **Hints:** «الآلة لا تعرف "تفاحة" إلا إذا أعطيتها أمثلة مسمّاة» → «جرّب أن تصنّف كل البطاقات أولًا» → «اضغط "درّب" بعد كل تسمية لترى الرقم يتغيّر».
13. **Assessment:** Q-U1-L1-1…6 (definition, data/output distinction, why wrong output happens).
14. **Accessibility:** bins are buttons; the meter has `role="meter"` with `aria-valuenow` and a text equivalent; accuracy changes announced; drag replaced by tap always available.
15. **Mobile:** bins side by side at 360 px (two columns), tray vertical scroll, meter sticky at top.
16. **Technical:** deterministic fake classifier: accuracy = `labels / 8`; predictions from a fixed lookup keyed by item; the "bad example" flips exactly one prediction from a fixture. Pure reducer, no ML, no network. Arabic callout: «هذه محاكاة تعليمية مبسّطة وليست نموذج ذكاء اصطناعي حقيقيًا.»
17. **Complexity:** 2.5 days (tray/bins 0.5, meter + training loop 0.5, test view 0.5, bad example 0.25, content 0.25, tests 0.5).
18. **Dependencies:** shell; U1-L1 content; item illustrations (8 SVGs).
19. **Acceptance:** (a) labeling all 8 raises accuracy to 100%; (b) test view predicts all 4 new items correctly; (c) bad example drops accuracy and flips one prediction, with Arabic explanation; (d) no percentage shown without a word label; (e) works tap-only on mobile; (f) reset clears labels, accuracy, and predictions.

---

## 8. `SIM-IR-01` — ماذا تفعل الآن؟ (v1.2, 2 days)

1. **Arabic title:** ماذا تفعل الآن؟ · Subtitle: «قرارات في أثناء حادث أمني»
2. **Unit/lesson:** U2 / U2-L3 · `/lessons/u2-3-incident-response/sim/incident` · 8–10 min · متوسط.
3. **Objectives:** U2-L3-O2, O3, O5.
4. **Concepts:** مخاطرة · احتمال/أثر · تحضير · اكتشاف · احتواء · استجابة · تعافي · درس مستفاد.
5. **Starting state:** a "risk board" with 5 risks (كلمة مرور ضعيفة، نسخ احتياطي قديم، خادم غير محدّث، موظف يفتح رابط تصيّد، لا يوجد سجلّ) and two axes (احتمال × أثر). Incident scenario locked until risks are ranked.
6. **Interactive elements:** risk cards, 2×2 matrix drop zones, timeline of 6 response stages, branching choice cards (3 decisions), consequence panel, debrief.
7. **Controls:** tap-to-place risk, «ابدأ الحادث», choice buttons, «رجوع خطوة», «إعادة».
8. **Flow:** (0) «ما المخاطرة؟» → (1) رتّب 5 مخاطر على المصفوفة → (2) «وصل تنبيه: محاولات دخول كثيرة» — اختر: تتجاهل / تفحص السجلّ / تعيد تشغيل الخادم → (3) consequence + second decision (احتواء) → (4) third decision (تعافٍ) → (5) debrief يربط كل اختيار بمرحلة.
9. **Visuals:** matrix grid with quadrant labels (خطر عالٍ / متوسط / منخفض), risk chips, a timeline that lights stages as the story progresses, consequence panel with amber/red framing and Arabic wording.
10. **Arabic feedback:** لكل خيار تعليق يوضّح المرحلة: «فحص السجلّ = الاكتشاف. بدأت من المكان الصحيح.» · «إعادة التشغيل فورًا = استجابة متسرّعة قد تمحو الأدلة.»
11. **Success/failure:** no single "win"; a score of "قرارات متوازنة" (e.g. 2 of 3 optimal) yields success; a poor path yields a debrief that explains the cost, plus «أعد المحاولة».
12. **Hints:** «ابدأ بالسؤال: هل أعرف ما حدث؟» → «الاحتواء قبل الإصلاح» → «راجع السجلّ أولًا.»
13. **Assessment:** Q-U2-L3-1…6.
14. **Accessibility:** matrix placement available as a keyboard list («اختر مستوى الاحتمال» + «مستوى الأثر» selects); timeline is an `<ol>`; consequences announced.
15. **Mobile:** matrix stays 2×2 (min 150 px cells), risk chips scroll above it; decisions as full-width buttons.
16. **Technical:** data-driven branch graph (`scenario.ts` with nodes and choices), reducer `irReducer`; no free text.
17. **Complexity:** 2.0 days.
18. **Dependencies:** shell, risk matrix component, U2-L3 content.
19. **Acceptance:** (a) all 5 risks placeable by tap and by keyboard; (b) 3 decisions each with a distinct consequence; (c) debrief names the stage for each choice; (d) reset restores the board; (e) mobile 360 px without scroll traps.

---

## 9. `SIM-MEDIA-01` — اختر الوسيط المناسب (v1.2, 1.5 days)

1. **Arabic title:** اختر الوسيط المناسب · Subtitle: «الجودة والحجم والسرعة»
2. **Unit/lesson:** U4 / U4-L1 · `/lessons/u4-1-media/sim/choose-media` · 6–8 min · مبتدئ.
3. **Objectives:** U4-L1-O1, O3, O4.
4. **Concepts:** أنواع الوسائط · الصيغة · الدقة · الحجم · الضغط · التوافق.
5. **Starting state:** 4 scenario cards (شرح درس صوتي، صورة منتج، فيديو تعليمي قصير، رسم توضيحي لمعادلة) + a media picker per scenario (نوع + صيغة).
6. **Interactive elements:** scenario cards, type/format selects, a live "cost" panel (الحجم التقريبي، زمن التحميل على 3G، التوافق), «أكّد الاختيار», feedback.
7. **Controls:** scenario tabs, selects, «أكّد», «التالي», «إعادة».
8. **Flow:** (0) اقرأ الهدف → (1) اختر النوع → (2) اختر الصيغة → (3) شاهد الحجم وزمن التحميل → (4) أكّد واستمع للتعليل → ×4 سيناريوهات → (5) خلاصة: «لا يوجد أفضل مطلق، بل أنسب لهدفك».
9. **Visuals:** cost panel with a simple bar comparing 3 formats; media type icons; a phone-frame preview of load time (skeleton → loaded).
10. **Arabic feedback:** «PNG مناسب للرسم الحادّ، لكنه أثقل من JPG للصور الفوتوغرافية.» · «فيديو بدقة 1080p لشرح قصير قد يستهلك بيانات الطالب بلا داعٍ؛ 720p غالبًا كافٍ.»
11. **Success/failure:** 3 of 4 choices within the "reasonable" set = success; every choice explained regardless.
12. **Hints:** «اسأل: هل التفاصيل الحادة مهمة؟» → «الصور الفوتوغرافية تُضغط جيدًا بصيغة JPG» → «للرسوم الخطية استخدم SVG.»
13. **Assessment:** Q-U4-L1-1…6.
14. **Accessibility:** selects are native; cost comparison has a text table; no audio-only content; icons labelled.
15. **Mobile:** scenarios as a scroll-snap row, cost panel sticky; selects full width.
16. **Technical:** fixture table of formats with pre-computed sizes (`{format, kbPerMp, note}`); pure selection reducer; no real encoding.
17. **Complexity:** 1.5 days.
18. **Dependencies:** shell (activity path), U4-L1 content, media fixtures.
19. **Acceptance:** (a) 4 scenarios, each with type+format; (b) cost panel updates immediately; (c) every choice produces Arabic reasoning; (d) works at 320 px; (e) reset clears all selections.

---

## 10. `SIM-UX-01` — طبيب التخطيط (v1.3, 3 days)

1. **Arabic title:** طبيب التخطيط · Subtitle: «شخّص المشكلة قبل أن تصلحها»
2. **Unit/lesson:** U4 / U4-L2 · `/lessons/u4-2-ux-design/sim/layout-doctor` · 10–12 min · متوسط.
3. **Objectives:** U4-L2-O2, O3, O5.
4. **Concepts:** wireframe · CRAP · تباين · تكرار · محاذاة · تقارب · إمكانية الوصول.
5. **Starting state:** a deliberately flawed wireframe of a lesson page (6 seeded issues: low contrast CTA, 4 unrelated font sizes, misaligned cards, cramped spacing, unlabeled icon button, missing focus state). An empty diagnosis list on the side.
6. **Interactive elements:** wireframe hotspots (6), diagnosis chips (each maps to a CRAP/a11y principle), «أصلح» toggles that apply the fix, before/after slider, score panel.
7. **Controls:** tap hotspot, choose principle, «أصلح المشكلة», «قارن قبل/بعد», «إعادة», «تلميح».
8. **Flow:** (0) «اقرأ الصفحة كناقد» → (1) اكتشف 3 مشكلات (hotspot + principle) → (2) أصلحها → (3) اكتشف الثلاثة الباقية → (4) شاهد قبل/بعد → (5) خلاصة CRAP.
9. **Visuals:** grayscale wireframe with one accent colour; fix application animates only the affected element (200 ms); before/after slider draggable with keyboard arrows.
10. **Arabic feedback:** «الزر الأساسي منخفض التباين: لا يُقرأ بسهولة. هذا مبدأ التباين (Contrast).» · «المسافات بين البطاقات غير منتظمة: التقارب (Proximity) يساعد على فهم المجموعات.»
11. **Success/failure:** all 6 issues found and fixed = success; wrong principle pairing gets «ليست هذه المشكلة» + a nudge, no penalty.
12. **Hints:** «اقرأ العناصر التي يصعب رؤيتها» → «هل المسافات متساوية؟» → «الزر بلا نص: كيف يعرفه قارئ الشاشة؟»
13. **Assessment:** Q-U4-L2-1…7.
14. **Accessibility:** hotspots are buttons with Arabic names; principle choices are a listbox; the comparison slider has keyboard control; the wireframe has a full text description so the exercise is meaningful without seeing it.
15. **Mobile:** wireframe scales to width, hotspots enlarge to 44 px, diagnosis panel becomes a bottom sheet; comparison uses tap-to-toggle instead of drag.
16. **Technical:** two static wireframe variants (flawed/fixed) rendered as React + CSS with a `fixedIssues: Set` state; each fix toggles a class. No image assets — fully DOM/CSS.
17. **Complexity:** 3.0 days.
18. **Dependencies:** shell (activity path), wireframe components, U4-L2 content.
19. **Acceptance:** (a) 6 issues diagnosable with the right principle; (b) each fix visually changes only its target; (c) before/after comparable without motion; (d) keyboard-only completion; (e) 360 px usable; (f) reset restores the flawed state.

---

## 11. `SIM-EVAL-01` — افحص هذا الموقع (v1.3, 2.5 days)

1. **Arabic title:** افحص هذا الموقع · Subtitle: «أرقام + ملاحظات = حكم أفضل»
2. **Unit/lesson:** U4 / U4-L3 · `/lessons/u4-3-evaluation/sim/audit` · 8–10 min · متوسط.
3. **Objectives:** U4-L3-O1, O2, O3, O4.
4. **Concepts:** تقييم نوعي/كمّي · heuristic · مشاهدات الصفحة · زائر فريد · معدل التحويل.
5. **Starting state:** a mock site (3 screens) with 5 seeded heuristic issues; a metrics panel (مشاهدات 1,200 · زوار 800 · تحويلات 24); an empty report form.
6. **Interactive elements:** screens to browse, issue flags (5 categories from the heuristic checklist), metrics panel with tooltips, conversion calculator (2 inputs), report summary.
7. **Controls:** browse, «أضف ملاحظة», category select, «احسب معدل التحويل», «أرسل التقرير», «إعادة».
8. **Flow:** (0) «نوعي أم كمّي؟» تصنيف 4 أمثلة → (1) افحص الشاشات وحدّد 5 مشكلات من قائمة التحقق → (2) اقرأ المؤشرات → (3) احسب معدل التحويل (24 ÷ 800 = 3%) → (4) اختر استنتاجًا صحيحًا من بين ثلاثة → (5) التقرير النهائي.
9. **Visuals:** mock site in a phone frame, metrics as three plain cards (no charts needed in v1), calculation as a small inline form, report as a checklist with Arabic sentences.
10. **Arabic feedback:** «معدل التحويل = عدد التحويلات ÷ عدد الزوار × 100. هنا 3%.» · «مشاهدات عالية مع تحويل منخفض لا تعني موقعًا ناجحًا؛ الرقمان معًا يحكيان قصة.»
11. **Success/failure:** success = 4/5 issues + correct calculation + correct inference. Failure = wrong inference → explanation with the numbers.
12. **Hints:** «التحويلات ÷ الزوار، لا ÷ المشاهدات» → «ابحث عن زر لا يعمل، ونص صغير، وصفحة بلا عنوان» → «3% تعني 3 من كل 100 زائر.»
13. **Assessment:** Q-U4-L3-1…6.
14. **Accessibility:** mock site is real DOM with landmarks; metrics are a `<dl>`; the calculator uses labelled number inputs with `inputmode="numeric"`; the report is a list of checkboxes.
15. **Mobile:** phone frame fills width, report form below, calculator in a bottom sheet with numeric keyboard.
16. **Technical:** seeded issues as a fixture with rectangles over the mock DOM; calculation validated as a number with tolerance 0.1; reducer `evalReducer`.
17. **Complexity:** 2.5 days.
18. **Dependencies:** shell, mock-site fixture, U4-L3 content.
19. **Acceptance:** (a) 5 issues discoverable with categories; (b) correct conversion rate accepted, wrong format rejected with Arabic guidance; (c) inference step has explanations for all three options; (d) no chart library required; (e) 360 px usable; (f) reset clears the report.

---

## 12. `SIM-ITER-01` — قبل وبعد (v1.3, 2 days)

1. **Arabic title:** قبل وبعد · Subtitle: «حسّن شيئًا واحدًا، ثم قِس»
2. **Unit/lesson:** U4 / U4-L4 · `/lessons/u4-4-iteration/sim/iterate` · 7–9 min · متوسط.
3. **Objectives:** U4-L4-O1…O4.
4. **Concepts:** التحسين التكراري · الأولوية · تغيير صغير · قياس الأثر.
5. **Starting state:** round 1 of 3; a report from `SIM-EVAL-01`-style findings (4 issues) and 4 candidate fixes; metrics: «إكمال الشراء 42%»، «متوسط الوقت 3:20».
6. **Interactive elements:** findings list, fix cards (each with cost/impact hint), «طبّق التعديل», metric delta panel, round counter, final before/after view.
7. **Controls:** select fix, «طبّق», «الجولة التالية», «إعادة».
8. **Flow:** (0) «دورة التحسين» ترتيب 4 مراحل → (1) اختر المشكلة الأعلى أثرًا → (2) اختر تعديلًا واحدًا مناسبًا → (3) شاهد تغيّر المؤشر → (4) كرّر لجولتين → (5) خلاصة «قبل/بعد» + «متى نتوقف؟».
9. **Visuals:** metric deltas with arrows + Arabic words («ارتفع 6 نقاط»), a 3-step loop diagram that rotates a highlight per round, final split view before/after.
10. **Arabic feedback:** «اخترت إصلاحًا كبيرًا في جولة واحدة: أثره واضح لكنه يستغرق وقتًا. التغيير الصغير المقيس أسرع تعلّمًا.» · «ارتفع الإكمال من 42% إلى 48% بعد إصلاح زر الشراء.»
11. **Success/failure:** success = 2 rounds with a positive measured delta and a correct "when to stop" answer; failure = choosing a fix unrelated to the top finding → explanation + retry.
12. **Hints:** «ابدأ من الأعلى أثرًا لا الأسهل» → «تعديل واحد لكل جولة» → «قارن الرقم قبل وبعد.»
13. **Assessment:** Q-U4-L4-1…5.
14. **Accessibility:** ordering task keyboard-friendly; deltas stated in words; no colour-only arrows.
15. **Mobile:** one column, fix cards full width, delta sticky under the header.
16. **Technical:** fixture-driven rounds (`rounds: [{finding, fixes[], deltas}]`), reducer `iterReducer`, no simulation of real analytics.
17. **Complexity:** 2.0 days.
18. **Dependencies:** shell (activity path), U4-L4 content, findings fixture shared conceptually with EVAL-01 (§11) but implemented independently.
19. **Acceptance:** (a) 3 rounds playable; (b) every fix shows a numeric + verbal delta; (c) ordering task has feedback; (d) final before/after is textual as well as visual; (e) reset restarts at round 1.

---

## 13. MVP recommendation and build sequencing

### 13.1 Evaluation matrix

Scores 1–5 (5 = best).

| Sim | Educational value | Effort (5 = cheap) | Feasibility solo | Exam criticality | Mobile risk (5 = low) | **Weighted** | Decision |
|---|---|---|---|---|---|---|---|
| `SIM-HTTP-01` | 5 | 5 | 5 | 5 | 5 | **25** | **MVP #1** |
| `SIM-ARCH-01` | 5 | 4 | 5 | 5 | 4 | **23** | **MVP #2** |
| `SIM-TLS-01` | 5 | 3 | 4 | 5 | 4 | **21** | **MVP #3 (flagship)** |
| `SIM-AI-01` | 4 | 4 | 5 | 3 | 5 | **21** | MVP stretch |
| `SIM-FE-01` | 5 | 3 | 3 | 4 | 2 | **17** | v1.1 |
| `SIM-NET-01` | 4 | 2 | 3 | 3 | 3 | **15** | v1.1 |
| `SIM-IR-01` | 4 | 4 | 5 | 4 | 5 | **22** | v1.2 (cheap win) |
| `SIM-MEDIA-01` | 3 | 5 | 5 | 3 | 5 | **21** | v1.2 |
| `SIM-UX-01` | 4 | 3 | 4 | 4 | 3 | **18** | v1.3 |
| `SIM-EVAL-01` | 4 | 3 | 4 | 4 | 4 | **19** | v1.3 |
| `SIM-ITER-01` | 3 | 4 | 5 | 3 | 5 | **20** | v1.3 |

### 13.2 MVP simulation set — decision

**Ship in v1.0:** `SIM-HTTP-01`, `SIM-ARCH-01`, `SIM-TLS-01`. **Stretch:** `SIM-AI-01`.

Rationale:
- These three share one visual vocabulary (nodes + packet + step narration), so the shell work is amortised three times.
- They cover the two units with the highest exam weight in the brief (U2 and U3) and the first lesson a student ever opens (U1-L1 via `SIM-AI-01`).
- **Postpone the playground** (highest wow, but needs sandboxed iframe, CSP, and a mobile editor UX — the riskiest unknown before launch) and **the network designer** (most expensive, least exam-critical).
- `SIM-AI-01` is cheap (2.5 days), sits in lesson 1, and prevents the "first lesson is plain text" first impression — ship it if Phase 4 has ≥ 3 spare days.

### 13.3 Build order and why

1. **`SIM-HTTP-01` first** — smallest surface, validates the shell (steps, narration, hints, reset, a11y, progress write) with a data-driven sim. If the shell is wrong, it is cheapest to fix here.
2. **`SIM-ARCH-01`** — reuses `NodeCard`/`Packet`, adds multi-stage server animation and fault injection; proves the shell handles multi-mission flows.
3. **`SIM-TLS-01`** — adds dialog, interactive verification, comparison view, and crypto-ish visuals; by then the shell is stable.
4. **`SIM-AI-01`** — different interaction class (labeling), fast, and closes the Unit 1 gap.

**Do not build the engine generically first.** Build the shell with `SIM-HTTP-01`, extract shared primitives only after the second sim needs them (rule of two). Anything used by fewer than two sims stays local to that sim.
