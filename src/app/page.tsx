import Link from 'next/link';
import { lessons, units } from '@/content/curriculum';

export default function HomePage() {
  const lesson = lessons[0];
  const liveUnit = units.find((u) => u.status === 'live');

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-8 py-10 md:grid-cols-[1.05fr_1fr] md:py-16">
        <div className="fade-up">
          <span className="chip chip-primary">الإصدار الأول · درس تجريبي كامل</span>
          <h1 className="mt-4 text-[1.9rem] font-extrabold leading-[1.35] tracking-tight text-ink sm:text-4xl">
            تعلّم البرمجة والذكاء الاصطناعي
            <span className="text-primary"> بالفهم، لا بالحفظ.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-ink2">
            دروس عربية قصيرة، ومحاكاة تفاعلية تجعلك ترى ما يحدث داخل الشبكة والمتصفح. اقرأ الفكرة، ثم جرّبها بنفسك،
            ثم اختبر فهمك في خمسة أسئلة.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/lessons/u2-1-encryption-auth" className="btn btn-primary">
              ابدأ الدرس الأول
            </Link>
            <Link href="/units" className="btn btn-outline">
              تصفّح الوحدات
            </Link>
          </div>

          <p className="mt-4 text-xs text-ink3">بدون تسجيل · يعمل على الهاتف · محتوى عربي بالكامل</p>
        </div>

        <div className="fade-up card overflow-hidden">
          <div className="border-b border-line bg-surface2/60 px-4 py-2.5">
            <p className="text-xs font-bold text-ink2">داخل المحاكاة: رحلة اتصال HTTPS</p>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tint text-primary" aria-hidden="true">
                ◫
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink">المتصفح</p>
                <p className="ltr truncate text-[11px] text-ink3">https://store.example</p>
              </div>
              <span className="chip chip-teal ms-auto">محمي</span>
            </div>

            <div className="flex items-center gap-2 px-2 text-[11px] text-ink3">
              <span className="h-px flex-1 bg-[repeating-linear-gradient(to_left,#c3d3e5_0_6px,transparent_6px_12px)]" />
              <span>الشهادة ← مفتاح الجلسة ← البيانات</span>
              <span className="h-px flex-1 bg-[repeating-linear-gradient(to_left,#c3d3e5_0_6px,transparent_6px_12px)]" />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fdf3e3] text-amber" aria-hidden="true">
                ▤
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink">الخادم</p>
                <p className="text-[11px] text-ink3">يتحقق، ثم يرسل الاستجابة</p>
              </div>
              <span className="chip ms-auto">TLS</span>
            </div>

            <p className="rounded-lg bg-surface2 p-2.5 text-[11px] leading-relaxed text-ink2">
              ستتحقق من الشهادة بنفسك، وترى اللحظة التي يتحوّل فيها الاتصال من مفتوح إلى محمي.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="what-now" className="pb-4">
        <h2 id="what-now" className="text-lg font-extrabold text-ink">
          ماذا يوجد في هذا الإصدار؟
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { t: 'درس واحد كامل', d: 'التشفير والمصادقة — 8 أهداف، شرح، رسوم، ومصطلحات.', icon: '▤' },
            { t: 'محاكاة تفاعلية', d: 'ست خطوات تتحكم فيها: الشهادة، ثم مفتاح الجلسة، ثم البيانات.', icon: '▶' },
            { t: 'اختبار قصير', d: '5 أسئلة مع شرح لكل إجابة ومراجعة كاملة بعد النتيجة.', icon: '؟' },
          ].map((item) => (
            <div key={item.t} className="card p-4">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-tint text-primary">
                {item.icon}
              </span>
              <p className="mt-3 text-sm font-bold text-ink">{item.t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink2">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {lesson && liveUnit ? (
        <section aria-labelledby="topic" className="py-8">
          <h2 id="topic" className="text-lg font-extrabold text-ink">
            الدرس المتاح الآن
          </h2>
          <div className="card mt-3 overflow-hidden">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip chip-teal">الوحدة 2 · {liveUnit.title}</span>
                  <span className="chip">الدرس {lesson.displayNumber}</span>
                </div>
                <h3 className="mt-2 text-xl font-extrabold text-ink">{lesson.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink2">{lesson.summary}</p>
                <p className="mt-2 text-xs text-ink3">
                  {lesson.objectives.length} أهداف · {lesson.readMin} دقائق قراءة · محاكاة · اختبار 5 أسئلة
                </p>
              </div>
              <Link href={`/lessons/${lesson.slug}`} className="btn btn-primary shrink-0">
                افتح الدرس
              </Link>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink3">
            بقية الدروس (تصميم الشبكات، تطبيقات الويب، الوسائط وتجربة المستخدم) ستُضاف بعد مراجعة هذا الدرس.
          </p>
        </section>
      ) : null}

      <section aria-labelledby="how" className="py-6">
        <h2 id="how" className="text-lg font-extrabold text-ink">
          كيف تعمل المنصة؟
        </h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { n: '1', t: 'اقرأ', d: 'مقاطع قصيرة، فكرة واحدة في كل مقطع، مع رسم يوضّح العلاقة.' },
            { n: '2', t: 'جرّب', d: 'محاكاة تتحكم في خطواتها بدل أن تشاهدها فقط.' },
            { n: '3', t: 'اختبر', d: 'خمسة أسئلة مع تفسير لكل إجابة، ومراجعة تحدّد ما يحتاج قراءة أخرى.' },
          ].map((step) => (
            <li key={step.n} className="card p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-tint text-xs font-extrabold text-primary">
                {step.n}
              </span>
              <p className="mt-2 text-sm font-bold text-ink">{step.t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink2">{step.d}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
