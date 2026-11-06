import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <p className="text-4xl font-extrabold text-primary">404</p>
      <h1 className="mt-2 text-xl font-extrabold text-ink">لم نجد هذه الصفحة</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink2">
        قد يكون الرابط قديمًا أو مكتوبًا بشكل مختلف. يمكنك العودة إلى الوحدات أو البدء بالدرس المتاح.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/units" className="btn btn-primary">
          الوحدات
        </Link>
        <Link href="/lessons/u2-1-encryption-auth" className="btn btn-outline">
          الدرس المتاح
        </Link>
      </div>
    </div>
  );
}
