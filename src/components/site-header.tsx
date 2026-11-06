import Link from 'next/link';

function LogoMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-8 w-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="9" fill="#1258A6" />
      <path
        d="M9 22V12.5c0-.6.7-.9 1.1-.5l3.4 3.4c.3.3.7.3 1 0l3.4-3.4c.4-.4 1.1-.1 1.1.5V22"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="21.5" r="2.2" fill="#8FD8C9" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="مَنهَج — الصفحة الرئيسية">
          <LogoMark />
          <span className="text-xl font-extrabold tracking-tight text-ink">مَنهَج</span>
        </Link>

        <nav aria-label="التنقل الرئيسي" className="ms-4 hidden items-center gap-1 sm:flex">
          <Link
            href="/units"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-ink2 hover:bg-surface2 hover:text-ink"
          >
            الوحدات
          </Link>
          <Link
            href="/lessons/u2-1-encryption-auth"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-ink2 hover:bg-surface2 hover:text-ink"
          >
            الدرس
          </Link>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <Link href="/units" className="btn btn-primary btn-sm">
            ابدأ التعلّم
          </Link>
        </div>
      </div>
    </header>
  );
}
