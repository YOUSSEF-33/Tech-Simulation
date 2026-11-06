# CONTENT GUIDELINES — دليل كتابة المحتوى العربي

> This is the law for every student-facing word. If a sentence contradicts this document, the document wins — including in a simulation's narration.
> Audience: Egyptian second-year secondary students, reading on a phone, often at night, often anxious about exams.

---

## 1. Voice and tone

| Attribute | We are | We are not |
|---|---|---|
| Register | Modern Standard Arabic, simple and spoken-adjacent | Classical, literary, or academic |
| Person | Direct address, second person singular: «أنت»، «سترى»، «جرّب» | «يقوم الطالب بـ…» |
| Sentence | Short: 8–16 words, one idea | Long, nested, multi-clause |
| Attitude | Calm, respectful, encouraging | Childish, over-excited, ironic |
| Certainty | Precise about limits: «هذا شرح مبسّط» | Absolute claims («هذا كل ما تحتاجه») |
| Failure | Explains the misconception | Grades the student («إجابة خاطئة») |

**The three-second test:** read any sentence aloud. If a 16-year-old would need to re-read it, rewrite it.

**Forbidden tone markers:** exclamation marks more than once per screen, emoji as a substitute for words, «يا بطل»، «رائع جدًا!!!»، slang that will date.

---

## 2. Structural rules for a lesson

Every lesson follows this skeleton (fields map to `Lesson` in `TECHNICAL_ARCHITECTURE.md` §5.1):

| Part | Length | Rule |
|---|---|---|
| Title | 3–6 words | Names the concept, not the activity: «التشفير والمصادقة»، not «درس ممتع عن الأمان» |
| Summary | 20–30 words | One sentence answering "why should I care?" |
| Objectives | 3–5 items | Each starts with a verb: «أشرح»، «أفرّق»، «أرتّب»، «أختار»، «أفسّر» |
| Sections | 3–7 | One idea per section; heading is a statement or question, not a label |
| Paragraph | ≤ 70 words | Mobile: 3–5 lines |
| Callout | ≤ 25 words | One per section maximum |
| Diagram | 1+ per lesson | Must encode a relationship; caption explains it in one sentence |
| Glossary | 4–8 terms | Arabic + English + definition ≤ 20 words |
| Checkpoint | 1–2 per lesson | Reveal-style, not graded |
| Activity | 1 (sim or activity) | Loaded after the concept, never before it |
| Quiz | 5 per attempt | See §6 |

**Section heading style:** prefer questions the student is already asking.
- ✓ «لماذا نحتاج التشفير؟» · «كيف يعرف المتصفح أن الموقع حقيقي؟»
- ✗ «مقدمة» · «معلومات عامة» · «الجزء الثاني»

---

## 3. Sentence-level rules

1. **One idea per sentence.** Split at «و» when it joins two independent ideas.
2. **Define before use.** Every technical term is introduced with a plain-Arabic definition before it is used in a sentence.
3. **Concrete before abstract.** Start with an everyday example, then name the concept.
4. **Active voice.** «الخادم يرسل الشهادة» not «تُرسَل الشهادة من الخادم».
5. **Present tense for mechanisms, past for examples.** «يعمل TLS على…» · «أرسل أحمد الرابط…».
6. **No personification beyond a metaphor we explain once.** A firewall «يفحص» traffic; it does not «يقرّر بذكاء».
7. **Numbers as Western digits:** «3 خطوات»، «80%». No Arabic-Indic digits in prose (consistent with UI).
8. **Units with a space:** `2 MB`، `1080p`، `3 ثوانٍ`.
9. **Arabic punctuation only:** «،» «؛» «؟» «.» Statements end with a full stop, not nothing.
10. **No diacritics** except to disambiguate a rare word (max 1 per lesson). No tatweel.
11. **No transliteration of English terms** («إنكريبت» is forbidden). Use the Arabic term + the English word in parentheses.
12. **No invented statistics.** «أكثر من نصف المستخدمين» requires a source we do not have; use «كثير من المستخدمين» or drop the claim.
13. **No ministry/exam claims** unless the teacher review confirms them.

### Before / after

| ✗ | ✓ | Why |
|---|---|---|
| «يقوم الخادم بعملية التحقق من هوية المستخدم ومن ثم إرسال الاستجابة» | «الخادم يتحقق من هويتك، ثم يرسل الاستجابة.» | Active, short, direct address |
| «التشفير هو عملية تحويل البيانات إلى شكل غير مفهوم باستخدام خوارزميات رياضية معقدة» | «التشفير يحوّل الرسالة إلى رموز لا يفهمها إلا من يملك المفتاح.» | Plain definition first |
| «هذه المحاكاة تحاكي عملية المصافحة الثلاثية» | «جرّب: شاهد كيف يتفق المتصفح والخادم على مفتاح مشترك.» | Action-oriented |
| «خطأ! الإجابة غير صحيحة.» | «ليست هذه الإجابة. المتصفح يتحقق من الشهادة قبل أن يثق بالخادم.» | Teaches, doesn't grade |

---

## 4. Terminology glossary (single source of truth)

**Rule:** the first occurrence in a lesson renders `العربي (English)`; later occurrences use Arabic only. Identifiers, protocols, and code stay LTR and untranslated.

### Security (U2)

| English | Arabic (locked) | Never use | Note |
|---|---|---|---|
| Encryption | التشفير | الترميز، الإنكريبت | الترميز = encoding, a different thing |
| Plaintext | النص الواضح | النص العادي | |
| Ciphertext | النص المشفّر | الشيفرة | |
| Symmetric encryption | التشفير المتماثل | التشفير المتناظر | CU-08 |
| Public-key encryption | التشفير بالمفتاح العام | التشفير غير المتماثل (unless the textbook uses it) | |
| Public key | المفتاح العام | | |
| Private key | المفتاح الخاص | المفتاح السري | «السري» implies shared secret |
| Digital certificate | الشهادة الرقمية | | |
| Certificate Authority (CA) | جهة إصدار الشهادات | السلطة | |
| HTTPS | HTTPS (اتصال آمن) | | keep as identifier, gloss in Arabic |
| TLS | TLS | | never spelled out in Arabic |
| Handshake | المصافحة | المهادنة | |
| Session key | مفتاح الجلسة | | |
| Digital signature | التوقيع الرقمي | | |
| Multi-factor authentication | المصادقة متعددة العوامل | التحقق بخطوتين (narrower) | |
| Firewall | جدار الحماية | الفايروول | |
| DMZ | المنطقة المنعزلة | | |
| Network segmentation | تقسيم الشبكة | | |
| Least privilege | أقل صلاحية | | |
| Attack surface | سطح الهجوم | | |
| Intrusion detection | كشف التسلل | | |
| Risk | المخاطرة | الخطر (as a synonym) | الخطر = threat in our text |
| Threat | التهديد | | |
| Vulnerability | الثغرة | | |
| Incident response | الاستجابة للحوادث | | |
| Containment | الاحتواء | | |
| Recovery | التعافي | الاستعادة | |
| Phishing | التصيّد | الفيشينغ | |

### Web (U3)

| English | Arabic | Never use |
|---|---|---|
| Client | العميل | الكلاينت |
| Server | الخادم | السيرفر |
| Database | قاعدة البيانات | الداتابيز |
| Frontend | الواجهة الأمامية | الفرونت إند |
| Backend | الواجهة الخلفية | الباك إند |
| Request | الطلب | الريكوست |
| Response | الاستجابة | الريسبونس |
| HTTP | HTTP | |
| Method | الطريقة | الميثود |
| Path / URL | المسار / العنوان | |
| Headers | الترويسات | الهيدرز |
| Body | جسم الطلب | |
| Status code | رمز الحالة | |
| API | واجهة برمجة التطبيقات (API) | |
| Semantic HTML | HTML الدلالي | |
| Responsive design | التصميم المتجاوب | |
| Event | الحدث | |

### Design (U4)

| English | Arabic | Never use |
|---|---|---|
| Media | الوسائط | الميديا |
| Format | الصيغة | الفورمات |
| Resolution | الدقة | الريزوليوشن |
| Compression | الضغط | |
| Bitrate | معدل البت | |
| UX | تجربة المستخدم | |
| Persona | شخصية المستخدم | |
| Wireframe | الرسم التخطيطي | الوايرفريم |
| Usability | سهولة الاستخدام | |
| Accessibility | إمكانية الوصول | الأكسسبيليتي |
| Contrast | التباين | |
| Repetition | التكرار | |
| Alignment | المحاذاة | |
| Proximity | التقارب | |
| Heuristic evaluation | التقييم الاستكشافي | |
| Page views | مشاهدات الصفحة | |
| Conversion rate | معدل التحويل | |
| Iteration | التحسين التكراري | |

**Adding a term:** add it here *before* using it in content, then use it everywhere. A term used differently in two lessons is a content bug.

---

## 5. Explaining a technical concept (the 5-step pattern)

Used for every concept in every lesson:

1. **Anchor** — an everyday situation: «أنت تكتب كلمة المرور في موقع…»
2. **Problem** — what goes wrong without the concept: «…ولو كانت الشبكة مفتوحة، يقرأها أي شخص.»
3. **Name it** — the term in Arabic with English: «هذا ما يحلّه التشفير (Encryption).»
4. **One mechanism** — the smallest true model: «يحوّل الرسالة إلى رموز بمفتاح؛ ومن لا يملك المفتاح يرى رموزًا.»
5. **Limit** — honesty: «هذا تبسيط؛ التطبيق الحقيقي يستخدم خوارزميات معقدة.»

**Simplification rules for TLS (`SIM-TLS-01`)**
- Say: the browser and server agree on a session key; the certificate proves the server's identity.
- Do not say: exact key-derivation functions, cipher suites, certificate chains beyond "من أصدرها".
- Always include: «هذا شرح تعليمي مبسّط، وليس تطبيقًا حقيقيًا للتشفير.»

**Analogy budget:** one analogy per concept, and it must be repaired if it breaks. If the lock metaphor is used for public keys, do not then say the key «يفتح» encrypted data with the wrong key.

---

## 6. Question-writing standards

### 6.1 Item rules

1. **One correct answer**, unambiguous, defensible from the lesson text.
2. **Cover one objective** (`objectiveId` in the item).
3. **Stem** ≤ 25 words, self-contained, no "according to the above" references.
4. **Choices**: 4, similar length and grammar, one idea each.
5. **Distractors** are plausible misconceptions, not absurdities:
   - ✓ «المفتاح الخاص للخادم» (a real confusion)
   - ✗ «مفتاح السيارة»
6. **No "all of the above" / "none of the above"** in v1.
7. **No negative stems** unless the word «ليس» is bolded and the concept is commonly confused.
8. **No trick wording**, no double negatives, no English-only stems.
9. **Every item has an explanation** ≤ 35 words that teaches *why*, not just restates.
10. **No positional bias:** correct answers distributed roughly evenly across positions in the pool.
11. **Difficulty mix per 5-item attempt:** 2 recall, 2 application, 1 analysis.
12. **`needsReview: true`** for any item whose correctness depends on a CU-flagged detail.

### 6.2 Worked examples

**Recall (U2-L1)**
> ما وظيفة الشهادة الرقمية؟
> أ) تربط المفتاح العام بهوية الموقع وتصادق عليها جهة موثوقة ✓
> ب) تخزّن كلمة المرور بشكل آمن
> ج) تسرّع تحميل الصفحة
> د) تمنع الإعلانات المزعجة
> **الشرح:** الشهادة بطاقة هوية للخادم؛ مضمونها أن المفتاح العام يعود فعلًا لصاحب النطاق.

**Application (U3-L2)**
> طلب `DELETE /api/lessons/3` وصل من مستخدم مسجّل لكنه لا يملك صلاحية الحذف. ما رمز الحالة المتوقع؟
> أ) `200` · ب) `401` · ج) `403` ✓ · د) `404`
> **الشرح:** الهوية معروفة (ليست `401`)، لكن الصلاحية ممنوعة، فالمعنى هو `403`.

**Analysis (U2-L1)**
> لماذا يُنشأ مفتاح جلسة جديد لكل اتصال بدل استخدام المفتاح العام دائمًا؟
> أ) لأنه أسرع، وكشفه يؤثر في اتصال واحد فقط ✓ …
> **الشرح:** التشفير المتماثل أسرع، وقِصَر عمر المفتاح يحدّ من الضرر.

---

## 7. Feedback copy patterns

| Situation | Pattern | Example |
|---|---|---|
| Correct | Confirm + one-sentence why | «صحيح. الفحص الثالث يتحقق من مطابقة النطاق، وهو ما يمنع انتحال الموقع.» |
| Incorrect | Name the misconception + redirect | «هذا يعني "لم أعرف من أنت"، لكن الطلب جاء من مستخدم معروف. الفرق هنا في الصلاحية.» |
| Hint level 1 | Direction only | «تذكّر: المفتاح العام يُستخدم للتشفير.» |
| Hint level 2 | Narrow the field | «ابحث في الشهادة عن تاريخ الانتهاء.» |
| Hint level 3 | Near answer | «الفحص الثالث: هل اسم النطاق في الشهادة يطابق العنوان؟» |
| Simulation failure | What happened + why + what to try | «توقف الاتصال: الشهادة منتهية. جرّب شهادة صالحة لترى الفرق.» |
| Completion | Name the skill gained | «أصبحت تعرف كيف يتحول اتصال مفتوح إلى اتصال محمي — ومَن يحمي ماذا في كل خطوة.» |

Never: «خطأ»، «فشلت»، «حاول مرة أخرى» alone, sarcasm, or a grade without an explanation.

---

## 8. RTL text rules for authors

1. Wrap identifiers manually in the content model (`kind: 'code'` or the `term` block); never paste a URL into a paragraph as plain text.
2. Never start an Arabic sentence with an English word — it flips the paragraph's visual order. Restructure: «استخدم `GET` لجلب البيانات» ✓ / «`GET` تُستخدم لجلب البيانات» ✗.
3. Parentheses around English terms: `المصادقة (Authentication)`. Do not nest parentheses.
4. When quoting a path inside a sentence, keep the sentence RTL and the token LTR: the renderer handles isolation; the author supplies the token only.
5. Arabic comma between list items: «الطلب، والاستجابة، والترويسات» — the «و» before the last item is preferred over a bare comma list.
6. No spaces before punctuation: «الخادم.» not «الخادم .».
7. Use «» for quotations, not "" or ''.
8. Percent written `80%` (no space), after the number, in LTR isolation if adjacent to Latin text.
9. Table cells: Arabic headers, numeric columns aligned `end`; mixed cells kept short.
10. Do not break a Latin technical term across lines with a hyphen.

---

## 9. Content review process

```
draft (author) ─▶ self-check ─▶ validator ─▶ technical review ─▶ Arabic review ─▶ teacher review (CU items) ─▶ live
```

| Stage | Who | Checks | Blocking? |
|---|---|---|---|
| Draft | Author | Skeleton per §2, word budgets | — |
| Self-check | Author | §10 checklist | ✓ |
| Validator | CI | Schema, Arabic presence, objective coverage, hints, explanations | ✓ (build fails) |
| Technical review | Developer/author | Factual accuracy, simplification honesty, terminology lock | ✓ |
| Arabic review | Native reviewer | Tone, grammar, punctuation, awkward phrasing, RTL quirks | ✓ |
| Teacher review | Teacher | CU-01…CU-08 items, exam alignment, term choices | ✓ for flagged items |

**Turnaround target:** one lesson reviewed within 3 days. Batch reviews by unit to respect the teacher's time (one 45-minute session per unit, with a one-page summary of the TBC questions).

**Change control:** after `live`, a content change requires a one-line reason in the commit and re-running the validator. A change to a *locked term* requires updating §4 first, then all occurrences in one commit.

---

## 10. Author self-check (run before submitting any lesson)

- [ ] Title names the concept; summary is one sentence.
- [ ] 3–5 objectives, each starting with a verb, each covered by ≥ 1 quiz item.
- [ ] Sections: one idea each, ≤ 70 words per paragraph, ≤ 7 sections.
- [ ] Every term appears in §4 and is defined before use.
- [ ] English appears only in parentheses on first use, or as an LTR identifier.
- [ ] No Latin punctuation in Arabic prose; digits are Western.
- [ ] Every diagram has a caption and a text description; it shows a relationship.
- [ ] The activity comes after the concept it teaches.
- [ ] 5+ questions with explanations; difficulty mix 2/2/1; no absurd distractors.
- [ ] No invented statistics, dates, names, or textbook references.
- [ ] Simplification callout present for TLS/HTTP/AI simulations.
- [ ] Read aloud once on a phone at 360 px; nothing needs re-reading.
- [ ] `npm run validate:content` passes locally.

---

## 11. Copy deck conventions (UI strings)

- Buttons: imperative, 1–3 words: «ابدأ»، «تابع الدرس»، «أعد المحاولة».
- Titles: noun phrases: «تقدّمي»، «الوحدات الدراسية».
- Empty states: state + next action: «لا يوجد تقدّم بعد. ابدأ بالدرس الأول.»
- Errors: what happened + what to do, no blame, no codes: «تعذّر تحميل الدرس. تحقق من اتصالك ثم أعد المحاولة.»
- Loading: «جارٍ التحميل…» (never "Loading").
- Confirmations: verb + object: «حذف التقدّم؟» with «حذف» / «إلغاء».
- Never expose IDs, HTTP codes, or stack traces to students.

---

## 12. What we never write

- A curriculum claim we cannot verify from the brief (page numbers, chapter titles, "سؤال الامتحان").
- A promise about grades or exam outcomes.
- A claim that a simulation is real cryptography, a real server, or a real AI model.
- Comparisons to named commercial platforms.
- Anything that would embarrass a student for a wrong answer.
- English UI text "because it's shorter".
