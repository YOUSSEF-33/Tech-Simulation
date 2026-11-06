export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <p className="text-sm font-bold text-ink">مَنهَج</p>
          <p className="text-xs text-ink3">
            النسخة التجريبية 0.1 — درس ومنصة محاكاة واحدة. المحتوى تعليمي مبسّط وليس تطبيقًا حقيقيًا.
          </p>
        </div>
        <p className="text-xs text-ink3">تقدّمك محفوظ على هذا الجهاز فقط.</p>
      </div>
    </footer>
  );
}
