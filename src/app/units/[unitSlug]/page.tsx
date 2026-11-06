import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUnit, unitLessons, units } from '@/content/curriculum';

export function generateStaticParams() {
  return units.map((u) => ({ unitSlug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ unitSlug: string }> }) {
  const { unitSlug } = await params;
  const unit = getUnit(unitSlug);
  return { title: unit ? unit.title : 'الوحدة' };
}

export default async function UnitPage({ params }: { params: Promise<{ unitSlug: string }> }) {
  const { unitSlug } = await params;
  const unit = getUnit(unitSlug);
  if (!unit) notFound();

  const lessons = unitLessons(unit.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
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
        <span className="text-ink2">{unit.title}</span>
      </nav>

      <header className="card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-primary">الوحدة {unit.order}</span>
          {unit.status === 'live' ? (
            <span className="chip chip-teal">متاح الآن</span>
          ) : (
            <span className="chip">قادم قريبًا</span>
          )}
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-ink">{unit.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink2">{unit.description}</p>
        <p className="mt-2 text-xs text-ink3">
          {lessons.length > 0 ? `${lessons.length} درس متاح` : 'لا توجد دروس متاحة بعد'} · {unit.plannedLessons} دروس في
          المنهج
        </p>
      </header>

      {lessons.length === 0 ? (
        <div className="card mt-4 p-8 text-center">
          <p className="text-3xl" aria-hidden="true">
            ◷
          </p>
          <p className="mt-2 font-bold text-ink">هذه الوحدة قادمة قريبًا</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink2">
            نكتب محتواها بنفس مستوى الدرس المتاح الآن. حتى ذلك الحين، ابدأ بدرس التشفير والمصادقة.
          </p>
          <Link href="/lessons/u2-1-encryption-auth" className="btn btn-primary mt-4">
            اذهب إلى الدرس المتاح
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="card p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="chip w-fit">الدرس {lesson.displayNumber}</span>
                <h2 className="flex-1 text-base font-extrabold text-ink">{lesson.title}</h2>
                <Link href={`/lessons/${lesson.slug}`} className="btn btn-primary btn-sm shrink-0">
                  ابدأ الدرس
                </Link>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink2">{lesson.summary}</p>
              <p className="mt-2 text-[11px] text-ink3">
                {lesson.readMin} دقائق قراءة · محاكاة «{lesson.sim.title}» · {lesson.questionIds.length} أسئلة
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
