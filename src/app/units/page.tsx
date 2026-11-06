import Link from 'next/link';
import { unitLessons, units } from '@/content/curriculum';

export const metadata = { title: 'الوحدات الدراسية' };

export default function UnitsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <nav aria-label="مسار التنقل" className="mb-4 text-xs text-ink3">
        <Link href="/" className="hover:text-ink">
          الرئيسية
        </Link>
        <span className="mx-1.5" aria-hidden="true">
          ‹
        </span>
        <span className="text-ink2">الوحدات</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-ink">الوحدات الدراسية</h1>
      <p className="mt-1 text-sm text-ink2">
        {units.length} وحدات في المنهج · درس واحد متاح الآن في الإصدار التجريبي.
      </p>

      <ul className="mt-6 space-y-3">
        {units.map((unit) => {
          const available = unitLessons(unit.id);
          const isLive = unit.status === 'live' && available.length > 0;

          return (
            <li key={unit.id}>
              <div className={`card p-4 sm:p-5 ${isLive ? '' : 'opacity-80'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tint text-sm font-extrabold text-primary"
                  >
                    {unit.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-extrabold text-ink">{unit.title}</h2>
                      {isLive ? (
                        <span className="chip chip-teal">متاح الآن</span>
                      ) : (
                        <span className="chip">قادم قريبًا</span>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink2">{unit.description}</p>
                    <p className="mt-1.5 text-[11px] text-ink3">
                      {isLive
                        ? `${available.length} درس متاح من ${unit.plannedLessons}`
                        : `${unit.plannedLessons} دروس في المنهج`}
                    </p>
                  </div>
                  {isLive ? (
                    <Link href={`/units/${unit.slug}`} className="btn btn-outline btn-sm shrink-0">
                      افتح الوحدة
                    </Link>
                  ) : (
                    <span className="chip shrink-0">ليس بعد</span>
                  )}
                </div>

                {isLive ? (
                  <ul className="mt-3 divide-y divide-line border-t border-line pt-1">
                    {available.map((lesson) => (
                      <li key={lesson.id} className="flex items-center gap-2 py-2.5">
                        <span className="text-[11px] text-ink3">{lesson.displayNumber}</span>
                        <Link
                          href={`/lessons/${lesson.slug}`}
                          className="flex-1 text-sm font-semibold text-ink hover:text-primary"
                        >
                          {lesson.title}
                        </Link>
                        <span className="text-[11px] text-ink3">{lesson.readMin} د</span>
                        <Link href={`/lessons/${lesson.slug}`} className="text-xs font-bold text-primary">
                          ابدأ ›
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 rounded-xl border border-line bg-surface p-3 text-xs leading-relaxed text-ink3">
        المحتوى المتاح الآن هو درس «التشفير والمصادقة» مع محاكاته واختباره. نضيف بقية الدروس بعد مراجعة هذا الدرس من
        معلّم، حتى لا نُقحم تفاصيل غير مؤكدة في المنهج.
      </p>
    </div>
  );
}
