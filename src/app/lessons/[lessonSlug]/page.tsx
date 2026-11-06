import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLesson, lessons, units } from '@/content/curriculum';
import { LessonBlocks } from '@/components/lesson-blocks';
import { LessonActions } from '@/components/lesson-actions';

export function generateStaticParams() {
  return lessons.map((lesson) => ({ lessonSlug: lesson.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params;
  const lesson = getLesson(lessonSlug);
  return {
    title: lesson ? lesson.title : 'الدرس',
    description: lesson?.summary,
  };
}

export default async function LessonPage({ params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params;
  const lesson = getLesson(lessonSlug);
  if (!lesson) notFound();

  const unit = units.find((u) => u.id === lesson.unitId);
  const headings = lesson.blocks.filter(
    (b): b is Extract<(typeof lesson.blocks)[number], { kind: 'heading' }> => b.kind === 'heading',
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <nav aria-label="مسار التنقل" className="mb-4 text-xs text-ink3">
        <Link href="/" className="hover:text-ink">
          الرئيسية
        </Link>
        <span className="mx-1.5" aria-hidden="true">
          ‹
        </span>
        <Link href="/units" className="hover:text-ink">
          الوحدات
        </Link>
        <span className="mx-1.5" aria-hidden="true">
          ‹
        </span>
        {unit ? (
          <>
            <Link href={`/units/${unit.slug}`} className="hover:text-ink">
              {unit.title}
            </Link>
            <span className="mx-1.5" aria-hidden="true">
              ‹
            </span>
          </>
        ) : null}
        <span className="text-ink2">الدرس {lesson.displayNumber}</span>
      </nav>

      <header className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-teal">{unit?.title ?? 'الأمن السيبراني'}</span>
          <span className="chip">الدرس {lesson.displayNumber}</span>
          <span className="chip">{lesson.readMin} دقائق قراءة</span>
          <span className="chip">{lesson.questionIds.length} أسئلة</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold leading-snug text-ink sm:text-3xl">{lesson.title}</h1>
        <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-ink2">{lesson.summary}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_270px]">
        <article className="min-w-0">
          <section className="card mb-5 p-4">
            <h2 className="text-sm font-extrabold text-ink">أهداف الدرس</h2>
            <p className="mt-1 text-xs text-ink3">في نهاية هذا الدرس ستكون قادرًا على…</p>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {lesson.objectives.map((o) => (
                <li key={o.id} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink2">
                  <span aria-hidden="true" className="mt-1 text-[10px] font-bold text-teal">
                    ✓
                  </span>
                  {o.text}
                </li>
              ))}
            </ul>
          </section>

          <LessonBlocks blocks={lesson.blocks} />

          <section className="card my-6 overflow-hidden border-[#cfe0f7]">
            <div className="bg-tint/70 px-4 py-2">
              <p className="text-xs font-extrabold text-primary">جرّب بنفسك</p>
            </div>
            <div className="p-4">
              <h2 className="text-lg font-extrabold text-ink">{lesson.sim.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink2">{lesson.sim.blurb}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={`/lessons/${lesson.slug}/sim/${lesson.sim.slug}`}
                  className="btn btn-primary"
                >
                  ابدأ المحاكاة
                </Link>
                <span className="text-xs text-ink3">{lesson.sim.minutes} دقائق · 6 خطوات</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-ink3">
                المحاكاة غير مطلوبة لإكمال الدرس، لكنها أفضل طريقة لتثبيت الفكرة.
              </p>
            </div>
          </section>

          <section aria-labelledby="glossary" className="mt-8">
            <h2 id="glossary" className="text-lg font-extrabold text-ink">
              مصطلحات الدرس
            </h2>
            <dl className="mt-2 space-y-2">
              {lesson.glossary.map((entry) => (
                <div key={entry.ar} className="card p-3">
                  <dt className="text-sm font-bold text-ink">
                    {entry.ar} <span className="text-xs font-normal text-ink3">({entry.en})</span>
                  </dt>
                  <dd className="mt-0.5 text-[13px] leading-relaxed text-ink2">{entry.definition}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
            <div>
              <p className="text-sm font-bold text-ink">أنهيت الدرس؟</p>
              <p className="text-xs text-ink3">اختبر فهمك في 5 أسئلة قصيرة، ثم راجع شرح كل إجابة.</p>
            </div>
            <Link href={`/lessons/${lesson.slug}/quiz`} className="btn btn-primary btn-sm">
              اختبر فهمك
            </Link>
          </div>
        </article>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="space-y-4">
            <div className="card p-4">
              <p className="text-xs font-extrabold text-ink2">محتويات الدرس</p>
              <ol className="mt-2 space-y-1.5">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="block rounded-md px-1.5 py-1 text-[13px] text-ink2 hover:bg-surface2 hover:text-ink"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            <LessonActions lesson={lesson} />

            <div className="rounded-xl border border-line bg-surface2/60 p-3">
              <p className="text-[11px] leading-relaxed text-ink3">
                شرح تعليمي مبسّط. التطبيق الحقيقي لـTLS أكثر تعقيدًا، والغرض هنا فهم الفكرة لا تنفيذها.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
