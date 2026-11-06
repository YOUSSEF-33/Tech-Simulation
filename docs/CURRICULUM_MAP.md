# CURRICULUM MAP — خريطة المنهج

> Scope source: the project brief only. No textbook was provided. Items marked **TBC** need teacher review before content freeze (see `PRODUCT_SPEC.md` §3).
> Every lesson below maps to: content, ≥ 1 activity, ≥ 1 assessment set, and exactly one primary simulation.

---

## 0. Conventions

- **Unit ID:** `U1`…`U4`. **Lesson ID:** `U2-L1`. **Objective ID:** `U2-L1-O3`. **Simulation ID:** `SIM-TLS-01`. **Question set:** `Q-U2-L1`.
- **Display labels** follow the brief's numbering: Lesson 2-1 renders as «الدرس 2-1» in Arabic UI, with the Latin digits (FR-A-03).
- **Duration** is estimated student time on a phone: content + activity + quiz.
- **Status:** `planned` (spec only) → `drafted` (Arabic content written) → `reviewed` (teacher-approved) → `live`.
- **Activity class:** `sim` = full step-based simulation (engine + shell); `activity` = single-screen data-driven exercise (lighter engine path); `reading` = content-only with checkpoints.

---

## 1. Unit overview

| Unit | Arabic title | Lessons | Student time | Primary thread |
|---|---|---|---|---|
| U1 | تكنولوجيا المعلومات والمجتمع | 1 | 35–45 min | What AI is and how data becomes output |
| U2 | الأمن السيبراني | 3 | 150–180 min | Protecting data and networks, responding to incidents |
| U3 | تطبيقات الويب | 3 | 150–180 min | How web apps are built and how they talk |
| U4 | تصميم الويب والوسائط | 4 | 150–200 min | Media, UX, evaluation, iteration |
| **Total** | | **11** | **~8.5–10 h** | |

**Prerequisite chain (recommended reading order):**

```
U1-L1 ─▶ (independent)
U2-L1 ─▶ U2-L2 ─▶ U2-L3
U3-L1 ─▶ U3-L2 ─▶ U3-L3
U2-L1 ─▶ U4-L1 ─▶ U4-L2 ─▶ U4-L3 ─▶ U4-L4
U3-L3 ─▶ U4-L2 (playground familiarity helps)
```

Units are unlocked by default (no gating in MVP — students revise out of order and teachers project lessons non-linearly). «الدرس التالي» follows the order above; the dashboard's "continue" card follows the same order and skips completed lessons.

---

## 2. U1 — تكنولوجيا المعلومات والمجتمع

### U1-L1 — كيف يعمل الذكاء الاصطناعي

- **Slug:** `u1-ai-basics` · **Duration:** 35–45 min · **Status:** planned · **Activity class:** activity (`SIM-AI-01`, MVP stretch)
- **Big idea:** AI is not magic and not a brain in a box; it is a system that finds patterns in **data** and uses them to produce **outputs** that people then judge.
- **Prerequisites:** none.
- **Curricular uncertainty:** CU-01 (depth and terminology), CU-02 (whether Unit 1 has further lessons).

| Objective | Statement (student-facing) | Evidence of achievement |
|---|---|---|
| U1-L1-O1 | أشرح بجملتي ما معنى الذكاء الاصطناعي. | Definition question + open prompt in lesson checkpoint |
| U1-L1-O2 | أُوضّح العلاقة بين البيانات والتعلّم والنتيجة. | Ordering activity in `SIM-AI-01` (data → training → output) |
| U1-L1-O3 | أذكر ثلاثة أمثلة للذكاء الاصطناعي في حياتي اليومية. | Quiz item Q3 + lesson example gallery |
| U1-L1-O4 | أُميّز بين «البيانات» و«النتيجة» في مثال بسيط. | Classification item in `SIM-AI-01` |
| U1-L1-O5 | أشرح لماذا يمكن أن يكون خرج الذكاء الاصطناعي خطأً. | Quiz item Q5 (bias/garbage-in) |

**Concept list:** الذكاء الاصطناعي (Artificial Intelligence) · البيانات (Data) · التعلّم (Learning/Training) · النموذج (Model) · الخرج/النتيجة (Output) · الدقة (Accuracy) · التحيز في البيانات (Bias).

**Content sections (Arabic, one idea each):**
1. «الذكاء الاصطناعي في حياتك» — 4 everyday examples (ترجمة، توصيات، مساعد صوتي، تصحيح تلقائي).
2. «من أين تأتي المعرفة؟» — بيانات كأمثلة؛ لا أحد "يبرمج" كل قاعدة.
3. «كيف يتعلّم؟» — تكرار: مثال → توقّع → تصحيح → تحسّن (loop diagram).
4. «النتيجة ليست حكماً نهائياً» — outputs can be wrong; human review.
5. «جرّب بنفسك» — activity card.

**Activity:** `SIM-AI-01` — «درّب الآلة على التمييز» (label 8 shapes/items, watch accuracy rise, then feed a bad example and see it fall). Post-MVP stretch.
**Assessment:** `Q-U1-L1` — 6 items (5 used per attempt).
**Teacher review:** CU-01 (avoid terms like "الشبكات العصبية" unless the textbook uses them), CU-02.

---

## 3. U2 — الأمن السيبراني

### U2-L1 — التشفير والمصادقة (Lesson 2-1)

- **Slug:** `u2-1-encryption-auth` · **Duration:** 55–65 min · **Status:** planned · **Activity class:** sim (`SIM-TLS-01`, **MVP**)
- **Big idea:** Two separate problems — keeping data secret (**تشفير**) and proving who you are (**مصادقة**). HTTPS solves both, using public/private keys to agree on a temporary session key.
- **Prerequisites:** none (Unit 2 entry point).

| Objective | Statement | Evidence |
|---|---|---|
| U2-L1-O1 | أشرح الغرض من التشفير والفرق بين النص الواضح والنص المشفّر. | Quiz Q1 + sim step 6 (ciphertext view) |
| U2-L1-O2 | أفرّق بين التشفير المتماثل والتشفير بالمفتاح العام. | Sim classification sub-task + quiz Q2 |
| U2-L1-O3 | أُحدّد دور المفتاح العام والمفتاح الخاص. | Sim step 2–3 tasks (assign each key to its owner) |
| U2-L1-O4 | أشرح وظيفة الشهادة الرقمية في التحقق من هوية الخادم. | Sim step 3 certificate checks + quiz Q3 |
| U2-L1-O5 | أفسّر الغرض العام من HTTPS وTLS دون الدخول في تفاصيل التطبيق. | Quiz Q4 |
| U2-L1-O6 | أرتّب الخطوات العامة لإنشاء اتصال TLS. | Sim success state + ordering item Q5 |
| U2-L1-O7 | أشرح كيف يُستخدم مفتاح الجلسة لحماية الاتصال. | Sim step 4–5 + quiz Q6 |
| U2-L1-O8 | أذكر فائدة التوقيع الرقمي والمصادقة متعددة العوامل. | Quiz Q7–Q8, glossary cards |

**Concept list:** التشفير (Encryption) · النص الواضح/المشفّر (Plaintext/Ciphertext) · التشفير المتماثل (Symmetric) · التشفير بالمفتاح العام (Public-key) · المفتاح العام/الخاص (Public/Private key) · الشهادة الرقمية (Digital certificate) · جهة الإصدار (Certificate Authority) · HTTPS / TLS · المصافحة (Handshake) · مفتاح الجلسة (Session key) · التوقيع الرقمي (Digital signature) · المصادقة متعددة العوامل (MFA).

**Content sections:**
1. «لماذا نحتاج التشفير؟» — رسالة على شبكة مفتوحة.
2. «مفتاح واحد أم مفتاحان؟» — symmetric vs public-key table with a lock metaphor.
3. «المفتاح العام والمفتاح الخاص» — public = قفل يمكن للجميع استخدامه؛ private = المفتاح الذي بيدك فقط.
4. «كيف أثق أن هذا الموقع هو الموقع؟» — digital certificate, issuer, expiry, domain.
5. «HTTPS وTLS» — what the padlock means; TLS as the protocol doing the work.
6. «من الشهادة إلى مفتاح الجلسة» — 6-step simplified handshake diagram.
7. «التوقيع الرقمي والمصادقة متعددة العوامل» — proof of origin + a second proof of identity.
8. «حدود التبسيط» — callout: «هذا شرح تعليمي مبسّط، والتطبيق الحقيقي أكثر تعقيدًا».

**Activity:** `SIM-TLS-01` (see `SIMULATION_SPECS.md` §2).
**Assessment:** `Q-U2-L1` — 8 items, 5 per attempt; 2 items flagged for teacher review (certificate chain depth, symmetric vs asymmetric naming).
**Teacher review:** CU-03, CU-08.

---

### U2-L2 — تصميم أمن الشبكات (Lesson 2-2)

- **Slug:** `u2-2-network-security` · **Duration:** 45–55 min · **Status:** planned · **Activity class:** sim (`SIM-NET-01`, v1.1)
- **Big idea:** Security is a property of **design**: where you put boundaries, what you expose, and what you inspect. Good design limits how far an attacker can travel.
- **Prerequisites:** U2-L1 (concept of protecting data in transit). Recommended, not enforced.

| Objective | Statement | Evidence |
|---|---|---|
| U2-L2-O1 | أشرح الغرض من أمن الشبكة. | Quiz Q1 |
| U2-L2-O2 | أُسمّي مكوّنات الشبكة الأساسية وحدود الأمان بينها. | Sim placement task + quiz Q2 |
| U2-L2-O3 | أشرح وظيفة جدار الحماية ومنطقة الشبكة المنعزلة (DMZ). | Sim inspection + quiz Q3 |
| U2-L2-O4 | أتوقّع أثر قرار تصميمي على مسار الهجوم. | Sim traffic run + quiz Q4–Q5 |
| U2-L2-O5 | أبرّر لماذا لا يكفي إجراء حماية واحد. | Sim debrief + quiz Q6 |

**Concept list:** أمن الشبكة (Network security) · جدار الحماية (Firewall) · منطقة منعزلة (DMZ) · الشبكة الداخلية (Internal network) · نقاط الوصول (Access points) · التقسيم (Segmentation) · مبدأ أقل صلاحية (Least privilege) · كشف التسلل (IDS/IPS) · سطح الهجوم (Attack surface).

**Content sections:** purpose → components & boundaries → controls (firewall, segmentation, DMZ, monitoring, least privilege) → design decisions that reduce risk → limitation: design ≠ complete protection.
**Activity:** `SIM-NET-01` — «صمّم شبكة آمنة» (place components, run traffic, attacker path highlights).
**Assessment:** `Q-U2-L2` — 7 items.
**Teacher review:** confirm the control vocabulary the textbook uses (CU-08).

---

### U2-L3 — الاستجابة للحوادث وإدارة المخاطر (Lesson 2-3)

- **Slug:** `u2-3-incident-response` · **Duration:** 40–50 min · **Status:** planned · **Activity class:** activity (`SIM-IR-01`, v1.2)
- **Big idea:** Risk = احتمال + أثر. Incidents are managed by preparation and a repeatable sequence, not by improvisation.
- **Prerequisites:** U2-L2 recommended.

| Objective | Statement | Evidence |
|---|---|---|
| U2-L3-O1 | أعرّف المخاطرة السيبرانية بعناصرها. | Quiz Q1 |
| U2-L3-O2 | أُحدّد المخاطر وأرتّبها حسب الاحتمال والأثر. | Sim risk-matrix task |
| U2-L3-O3 | أرتّب مراحل الاستجابة للحادث. | Sim sequence task + quiz Q4 |
| U2-L3-O4 | أشرح أهمية التحضير والاكتشاف والاستجابة والتعافي. | Sim debrief + quiz Q5 |
| U2-L3-O5 | أختار إجراءً مناسبًا في موقف واقعي وأبرّر اختياري. | Branching scenarios (3 of 5) |

**Concept list:** المخاطرة (Risk) · الاحتمال (Likelihood) · الأثر (Impact) · التهديد (Threat) · الثغرة (Vulnerability) · التحضير (Preparation) · الاكتشاف (Detection) · الاحتواء (Containment) · الاستجابة (Response) · التعافي (Recovery) · الدرس المستفاد (Lessons learned).
**Content sections:** risk meaning → identify & rank → incident response stages (prepare, detect, contain, eradicate, recover, review) → why order matters → scenario preview.
**Activity:** `SIM-IR-01` — «ماذا تفعل الآن؟» (risk matrix sort + 3 branching incident decisions with consequences).
**Assessment:** `Q-U2-L3` — 6 items.
**Teacher review:** CU-06 (whether the response-stage count must match the textbook exactly).

---

## 4. U3 — تطبيقات الويب

### U3-L1 — البنية العامة لتطبيقات الويب (Lesson 3-1)

- **Slug:** `u3-1-web-architecture` · **Duration:** 50–60 min · **Status:** planned · **Activity class:** sim (`SIM-ARCH-01`, **MVP**)
- **Big idea:** Every web app is a conversation: the browser asks, the server decides, the database remembers, and the answer travels back to be drawn on screen.
- **Prerequisites:** none.

| Objective | Statement | Evidence |
|---|---|---|
| U3-L1-O1 | أُحدّد أدوار العميل والخادم وقاعدة البيانات. | Sim component inspection + quiz Q1 |
| U3-L1-O2 | أرتّب مسار الطلب والمعالجة والاستجابة. | Sim step ordering + quiz Q2 |
| U3-L1-O3 | أفرّق بين الواجهة الأمامية والواجهة الخلفية. | Sim layer toggle + quiz Q3 |
| U3-L1-O4 | أشرح لماذا لا يتصل المتصفح بقاعدة البيانات مباشرة. | Sim failure mode («بدون خادم») + quiz Q4 |
| U3-L1-O5 | أتوقّع ما يحدث عند تعطّل مكوّن. | Sim fault injection + quiz Q5 |

**Concept list:** العميل (Client) · الخادم (Server) · قاعدة البيانات (Database) · الواجهة الأمامية (Frontend) · الواجهة الخلفية (Backend) · الطلب (Request) · الاستجابة (Response) · واجهة برمجة التطبيقات (API) · مسار الطلب (Request path).
**Content sections:** the three roles → the round trip (diagram) → who does what (front/back responsibility table) → data storage and why the server mediates → what breaks when a piece fails.
**Activity:** `SIM-ARCH-01` (see specs §3).
**Assessment:** `Q-U3-L1` — 6 items.
**Teacher review:** CU-08 (API terminology).

---

### U3-L2 — أساليب الاتصال في تطبيقات الويب (Lesson 3-2)

- **Slug:** `u3-2-http` · **Duration:** 45–55 min · **Status:** planned · **Activity class:** sim (`SIM-HTTP-01`, **MVP**)
- **Big idea:** A request carries a method, a path, headers and sometimes a body; a response carries a status code, headers and a body. The status code is the server's one-line answer.
- **Prerequisites:** U3-L1.

| Objective | Statement | Evidence |
|---|---|---|
| U3-L2-O1 | أُسمّي أجزاء طلب HTTP وأشرح وظيفة كل جزء. | Sim inspection checklist + quiz Q1 |
| U3-L2-O2 | أفرّق بين GET وPOST من حيث الغرض. | Sim mission 2 + quiz Q2 |
| U3-L2-O3 | أفسّر معنى رموز الحالة الشائعة (200, 301, 401, 403, 404, 500). | Sim response reading + quiz Q3–Q4 |
| U3-L2-O4 | أتوقّع نتيجة طلب قبل إرساله. | Sim prediction field |
| U3-L2-O5 | أشرح كيف تتبادل المتصفحات والخوادم المعلومات. | Sim debrief + quiz Q5 |

**Concept list:** بروتوكول HTTP · الطلب/الاستجابة · الطريقة (Method) · المسار (Path/URL) · الترويسات (Headers) · جسم الطلب (Body) · رمز الحالة (Status code) · نوع المحتوى (Content-Type) · HTTPS as HTTP + TLS (link back to U2-L1).
**Content sections:** what a protocol is → request anatomy → methods → response anatomy → status families → why 401 ≠ 403 → HTTPS recap.
**Activity:** `SIM-HTTP-01` (see specs §4).
**Assessment:** `Q-U3-L2` — 7 items.
**Teacher review:** whether the textbook lists specific codes (CU-08); we teach the six most common only.

---

### U3-L3 — أساسيات تقنيات الواجهة الأمامية (Lesson 3-3)

- **Slug:** `u3-3-frontend` · **Duration:** 55–70 min · **Status:** planned · **Activity class:** sim (`SIM-FE-01`, v1.1)
- **Big idea:** HTML = structure and meaning, CSS = presentation, JavaScript = behaviour. They are three layers of one page, and the separation is a design decision.
- **Prerequisites:** U3-L2 recommended.

| Objective | Statement | Evidence |
|---|---|---|
| U3-L3-O1 | أُحدّد وظيفة HTML وCSS وJavaScript. | Quiz Q1 + playground tab labels |
| U3-L3-O2 | أقرأ بنية صفحة HTML بسيطة وأُميّز عناصرها. | Playground challenge 1 |
| U3-L3-O3 | أغيّر خاصية CSS وأتوقّع أثرها. | Playground challenge 2 + quiz Q3 |
| U3-L3-O4 | أُشغّل سلوكًا بسيطًا بـJavaScript وأفهم حدث النقر. | Playground challenge 3 |
| U3-L3-O5 | أشرح معنى HTML الدلالي (semantic). | Quiz Q4 |
| U3-L3-O6 | أذكر مبدأ التصميم المتجاوب (responsive) ببساطة. | Quiz Q5 |

**Concept list:** HTML · العنصر (Element) · الوسم (Tag) · السمة (Attribute) · CSS · المحدد (Selector) · الخاصية (Property) · JavaScript · الحدث (Event) · HTML الدلالي (Semantic HTML) · التصميم المتجاوب (Responsive design).
**Content sections:** three layers → HTML structure & semantics → CSS rules & the box idea → JS behaviour & events at a glance → responsive in one paragraph → playground preview.
**Activity:** `SIM-FE-01` (see specs §6).
**Assessment:** `Q-U3-L3` — 7 items (no syntax-recall item — reading code only).
**Teacher review:** whether students are expected to *write* code in exams or only read it (CU-07).

---

## 5. U4 — تصميم الويب والوسائط

### U4-L1 — أنواع الوسائط وخصائصها (Lesson 4-1)

- **Slug:** `u4-1-media` · **Duration:** 35–45 min · **Status:** planned · **Activity class:** activity (`SIM-MEDIA-01`, v1.2)
- **Big idea:** Every media type is a trade-off between quality and cost (size, load time, compatibility). Choosing media is a design decision, not decoration.
- **Prerequisites:** none. **Curricular uncertainty:** CU-04 (exact taxonomy).

| Objective | Statement | Evidence |
|---|---|---|
| U4-L1-O1 | أُصنّف أنواع الوسائط الرقمية الأساسية. | Classification task + quiz Q1 |
| U4-L1-O2 | أشرح خصائص الوسائط (الحجم، الجودة، الصيغة، معدل البت). | Properties table task + quiz Q2 |
| U4-L1-O3 | أختار نوع الوسيط المناسب لهدف تعليمي. | Scenario choices + quiz Q3–Q4 |
| U4-L1-O4 | أفسّر أثر حجم الوسيط على سرعة تحميل الصفحة. | Sim comparison + quiz Q5 |

**Concept list:** الوسائط (Media) · نص/صورة/صوت/فيديو/رسوم متحركة · الصيغة (Format) · الدقة (Resolution) · حجم الملف (File size) · الضغط (Compression) · معدل البت (Bitrate) · التوافق (Compatibility).
**Content sections:** what counts as media → five types with one example each → the four properties → quality vs size trade-off → choosing for a purpose.
**Activity:** `SIM-MEDIA-01` — «اختر الوسيط المناسب» (pick media + format for 4 scenarios; see estimated size and load time; feedback).
**Assessment:** `Q-U4-L1` — 6 items.
**Teacher review:** CU-04.

---

### U4-L2 — تصميم المعلومات وتجربة المستخدم (Lesson 4-2)

- **Slug:** `u4-2-ux-design` · **Duration:** 55–70 min · **Status:** planned · **Activity class:** activity (`SIM-UX-01`, v1.3)
- **Big idea:** Design starts from a user's need. Wireframes make structure cheap to change; CRAP principles explain *why* a layout feels clear or messy.
- **Prerequisites:** U4-L1 (media choices), U3-L3 helpful.

| Objective | Statement | Evidence |
|---|---|---|
| U4-L2-O1 | أُحدّد احتياجات المستخدم وأبني شخصية مستخدم بسيطة. | Persona form task |
| U4-L2-O2 | أشرح الغرض من الرسم التخطيطي (wireframe). | Quiz Q2 |
| U4-L2-O3 | أُطبّق مبادئ CRAP لتفسير مشكلة في تخطيط. | Layout doctor task (6 issues) |
| U4-L2-O4 | أذكر مبدأين من مبادئ سهولة الاستخدام. | Quiz Q4 |
| U4-L2-O5 | أُحدّد مشكلة وصول (accessibility) وأقترح حلًا. | A11y hotspot task + quiz Q5 |

**Concept list:** تجربة المستخدم (UX) · احتياجات المستخدم · شخصية المستخدم (Persona) · الرسم التخطيطي (Wireframe) · سهولة الاستخدام (Usability) · إمكانية الوصول (Accessibility) · التباين (Contrast) · التكرار (Repetition) · المحاذاة (Alignment) · التقارب (Proximity) · CRAP.
**Content sections:** users first → personas & needs → wireframes → usability basics → accessibility basics → CRAP with 4 before/after examples → activity.
**Activity:** `SIM-UX-01` — «طبيب التخطيط» (diagnose 6 seeded layout problems, fix each, get CRAP-linked feedback).
**Assessment:** `Q-U4-L2` — 7 items (includes 2 image/layout items rendered as SVG pairs).
**Teacher review:** whether CRAP is taught under this name (CU-08).

---

### U4-L3 — طرق تقييم المواقع (Lesson 4-3)

- **Slug:** `u4-3-evaluation` · **Duration:** 45–55 min · **Status:** planned · **Activity class:** activity (`SIM-EVAL-01`, v1.3)
- **Big idea:** Evaluation can be qualitative (what people say and struggle with) or quantitative (what numbers show). Heuristic evaluation finds problems before users do.
- **Prerequisites:** U4-L2.

| Objective | Statement | Evidence |
|---|---|---|
| U4-L3-O1 | أفرّق بين التقييم النوعي والكمّي. | Classification task + quiz Q1 |
| U4-L3-O2 | أستخدم قائمة تحقق تقريبية (heuristic) لاكتشاف مشكلات. | Audit task: find 5 issues |
| U4-L3-O3 | أقرأ مؤشر مشاهدات الصفحة وأفسّره بحذر. | Metric panel + quiz Q3 |
| U4-L3-O4 | أحسب معدل التحويل في مثال بسيط. | Calculation item Q4 |
| U4-L3-O5 | أُبرّر لماذا لا يكفي رقم واحد للحكم على موقع. | Debrief + quiz Q5 |

**Concept list:** تقييم نوعي/كمّي · التقييم الاستكشافي (Heuristic evaluation) · مشاهدات الصفحة (Page views) · الزائر الفريد (Unique visitor) · معدل التحويل (Conversion rate) · عينة المستخدمين · ملاحظة الاستخدام (Usability observation).
**Content sections:** two families of evaluation → heuristic checklist (5 checks) → quantitative metrics and their limits → a worked conversion example → combining signals.
**Activity:** `SIM-EVAL-01` — «افحص هذا الموقع» (audit a mock site: mark 5 issues, read 3 metrics, answer 2 interpretation questions).
**Assessment:** `Q-U4-L3` — 6 items.
**Teacher review:** CU-05 (metric definitions).

---

### U4-L4 — التحسين التكراري للمواقع (Lesson 4-4)

- **Slug:** `u4-4-iteration` · **Duration:** 40–50 min · **Status:** planned · **Activity class:** activity (`SIM-ITER-01`, v1.3)
- **Big idea:** Design is a loop: evaluate → find the biggest problem → change one thing → evaluate again. Small measured changes beat one big redesign.
- **Prerequisites:** U4-L3.

| Objective | Statement | Evidence |
|---|---|---|
| U4-L4-O1 | أرتّب دورة التحسين التكراري. | Ordering task + quiz Q1 |
| U4-L4-O2 | أختار المشكلة الأعلى أثرًا من نتائج التقييم. | Sim prioritisation step |
| U4-L4-O3 | أقترح تحسينًا محددًا وقابلًا للقياس. | Sim fix form + quiz Q3 |
| U4-L4-O4 | أفسّر لماذا نُعيد التقييم بعد كل تغيير. | Quiz Q4–Q5 |

**Concept list:** التحسين التكراري (Iteration) · التقييم → التعديل → إعادة التقييم · الأولوية · التغيير الصغير · قياس الأثر.
**Content sections:** the loop diagram → from findings to priorities → writing a measurable change → re-measuring (before/after) → when to stop.
**Activity:** `SIM-ITER-01` — «قبل وبعد» (3 rounds: pick issue → choose fix → see metric change; final debrief).
**Assessment:** `Q-U4-L4` — 5 items.

---

## 6. Assessment mapping

| Lesson | Question set | Items in pool | Per attempt | Item types | Notes |
|---|---|---|---|---|---|
| U1-L1 | `Q-U1-L1` | 6 | 5 | single-choice, ordering | 1 item flagged TBC |
| U2-L1 | `Q-U2-L1` | 8 | 5 | single-choice, ordering, matching | 2 flagged TBC |
| U2-L2 | `Q-U2-L2` | 7 | 5 | single-choice, scenario | |
| U2-L3 | `Q-U2-L3` | 6 | 5 | single-choice, ordering | |
| U3-L1 | `Q-U3-L1` | 6 | 5 | single-choice, diagram-label | |
| U3-L2 | `Q-U3-L2` | 7 | 5 | single-choice, prediction | |
| U3-L3 | `Q-U3-L3` | 7 | 5 | single-choice, code-reading | no syntax recall |
| U4-L1 | `Q-U4-L1` | 6 | 5 | single-choice, matching | |
| U4-L2 | `Q-U4-L2` | 7 | 5 | single-choice, image-pair | |
| U4-L3 | `Q-U4-L3` | 6 | 5 | single-choice, calculation | |
| U4-L4 | `Q-U4-L4` | 5 | 5 | single-choice, ordering | |

**Blueprint per lesson** (every attempt covers all objectives):

| Cognitive level | Share of items | Example verb |
|---|---|---|
| تذكّر / فهم | 40% | «ما معنى…؟» |
| تطبيق | 40% | «أي إجراء يناسب هذا الموقف؟» |
| تحليل / تبرير | 20% | «لماذا لا يكفي…؟» |

**Pass rule:** ≥ 60% (3/5) to mark the lesson «مكتمل» (FR-Q-06). Retakes are unlimited; the attempt log keeps every result. Quizzes are explicitly «اختبار قصير للتأكد من فهمك» — never presented as an official exam (CU-06).

**Objective coverage check (must be true before content freeze):** each `O` ID appears in ≥ 1 quiz item *and* ≥ 1 lesson checkpoint or activity step. The content validator (`TASKS.md` T-0114) fails the build if any objective has no assessment mapping.

---

## 7. Simulation / activity mapping

| ID | Arabic title | Lesson | Class | Version | Effort (dev-days) |
|---|---|---|---|---|---|
| `SIM-AI-01` | درّب الآلة على التمييز | U1-L1 | activity | MVP stretch | 2.5 |
| `SIM-TLS-01` | رحلة اتصال HTTPS | U2-L1 | sim | **MVP** | 5.0 |
| `SIM-NET-01` | صمّم شبكة آمنة | U2-L2 | sim | v1.1 | 5.5 |
| `SIM-IR-01` | ماذا تفعل الآن؟ | U2-L3 | activity | v1.2 | 2.0 |
| `SIM-ARCH-01` | داخل تطبيق ويب | U3-L1 | sim | **MVP** | 3.0 |
| `SIM-HTTP-01` | طلب واستجابة | U3-L2 | sim | **MVP** | 2.5 |
| `SIM-FE-01` | مختبر الواجهة الأمامية | U3-L3 | sim | v1.1 | 4.0 |
| `SIM-MEDIA-01` | اختر الوسيط المناسب | U4-L1 | activity | v1.2 | 1.5 |
| `SIM-UX-01` | طبيب التخطيط | U4-L2 | activity | v1.3 | 3.0 |
| `SIM-EVAL-01` | افحص هذا الموقع | U4-L3 | activity | v1.3 | 2.5 |
| `SIM-ITER-01` | قبل وبعد | U4-L4 | activity | v1.3 | 2.0 |

Details, learning design, and acceptance criteria for each: `SIMULATION_SPECS.md`.

---

## 8. Content status board (to be updated during Phase 1)

| Lesson | Content | Diagrams | Activity | Questions | Teacher review | Status |
|---|---|---|---|---|---|---|
| U1-L1 | ☐ | ☐ | ☐ `SIM-AI-01` | ☐ 6 | ☐ CU-01/02 | planned |
| U2-L1 | ☐ | ☐ | ☐ `SIM-TLS-01` | ☐ 8 | ☐ CU-03/08 | planned |
| U2-L2 | ☐ | ☐ | ☐ `SIM-NET-01` | ☐ 7 | ☐ | planned |
| U2-L3 | ☐ | ☐ | ☐ `SIM-IR-01` | ☐ 6 | ☐ CU-06 | planned |
| U3-L1 | ☐ | ☐ | ☐ `SIM-ARCH-01` | ☐ 6 | ☐ | planned |
| U3-L2 | ☐ | ☐ | ☐ `SIM-HTTP-01` | ☐ 7 | ☐ CU-08 | planned |
| U3-L3 | ☐ | ☐ | ☐ `SIM-FE-01` | ☐ 7 | ☐ CU-07 | planned |
| U4-L1 | ☐ | ☐ | ☐ `SIM-MEDIA-01` | ☐ 6 | ☐ CU-04 | planned |
| U4-L2 | ☐ | ☐ | ☐ `SIM-UX-01` | ☐ 7 | ☐ CU-08 | planned |
| U4-L3 | ☐ | ☐ | ☐ `SIM-EVAL-01` | ☐ 6 | ☐ CU-05 | planned |
| U4-L4 | ☐ | ☐ | ☐ `SIM-ITER-01` | ☐ 5 | ☐ | planned |

---

## 9. Explicit non-goals for the curriculum layer

- No content beyond the 4 units in the brief (no extra units, no exam-prep section).
- No invented textbook page references, figure numbers, or ministry wording.
- No programming-language teaching: U3-L3 teaches **reading and understanding** HTML/CSS/JS layers, not writing a program from scratch (unless CU-07 says otherwise).
- No mathematics of cryptography (no modular arithmetic, no key sizes beyond "long key = harder to break").
- No claim that any simulation is a real implementation.
