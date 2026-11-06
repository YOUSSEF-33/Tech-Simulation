import { LockIcon } from './LockIcon';
import type { TlsData } from './machine';

function Packet({
  direction,
  label,
  tone,
  delay = 0,
}: {
  direction: 'toServer' | 'toClient';
  label: string;
  tone: 'plain' | 'encrypted' | 'cert';
  delay?: number;
}) {
  const toneClass =
    tone === 'encrypted'
      ? 'border-[#b9c9dd] bg-ink text-white'
      : tone === 'cert'
        ? 'border-[#f0dcb8] bg-[#fdf6e9] text-amber'
        : 'border-[#f0b5ae] bg-redtint text-red';

  return (
    <span
      style={{ animationDelay: `${delay}ms` }}
      className={`packet ${direction === 'toServer' ? 'packet-to-server' : 'packet-to-client'} inline-flex max-w-[7.5rem] items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold leading-tight shadow-sm ${toneClass}`}
    >
      {tone === 'encrypted' ? <LockIcon safe /> : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

function BrowserCard({ data, step }: { data: TlsData; step: number }) {
  const safe = step >= 5 && !data.insecure;

  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-white p-2.5 shadow-[0_1px_2px_rgb(15_27_45/0.06)] sm:p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <span aria-hidden="true" className="flex gap-1">
          <i className="block h-1.5 w-1.5 rounded-full bg-[#e5a3a3]" />
          <i className="block h-1.5 w-1.5 rounded-full bg-[#e8cd9a]" />
          <i className="block h-1.5 w-1.5 rounded-full bg-[#a9cdb4]" />
        </span>
        <p className="text-[11px] font-extrabold text-ink">المتصفح</p>
        <span className={`chip ms-auto px-1.5 text-[9px] ${safe ? 'chip-teal' : 'chip-amber'}`}>
          <LockIcon safe={safe} />
          {safe ? 'محمي' : 'غير آمن'}
        </span>
      </div>

      <div className="flex items-center gap-1 rounded-md border border-line bg-surface2 px-1.5 py-1">
        <span className={`text-[9px] font-bold ${safe ? 'text-teal' : 'text-red'}`}>
          {safe ? 'https' : 'http'}
        </span>
        <span className="ltr truncate text-[9px] text-ink2">://store.example</span>
      </div>

      <div className="mt-2 rounded-lg border border-line p-1.5">
        <p className="text-[9px] font-bold text-ink3">تسجيل الدخول</p>
        <p className="ltr mt-1 truncate rounded border border-line bg-white px-1 py-0.5 text-[9px] text-ink">
          {data.insecure || step >= 6 ? '123456' : '••••••'}
        </p>
        <p className="mt-1 text-[9px] text-ink3">كلمة المرور</p>
      </div>

      <p className="mt-2 text-[9px] leading-snug text-ink3">
        {step >= 4 && data.keyReady ? 'يملك مفتاح الجلسة' : 'لم يتفق على مفتاح بعد'}
      </p>
    </div>
  );
}

function ServerCard({ data, step }: { data: TlsData; step: number }) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-white p-2.5 shadow-[0_1px_2px_rgb(15_27_45/0.06)] sm:p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded bg-[#fdf3e3] text-[9px] text-amber">
          ▤
        </span>
        <p className="text-[11px] font-extrabold text-ink">الخادم</p>
        <span className="chip ms-auto px-1.5 text-[9px]">TLS</span>
      </div>

      <p className="ltr truncate rounded-md border border-line bg-surface2 px-1.5 py-1 text-[9px] text-ink2">
        store.example
      </p>

      <div className="mt-2 space-y-1">
        <div
          className={`flex items-center gap-1 rounded-lg border px-1.5 py-1 text-[9px] font-bold ${
            step >= 2 ? 'border-[#f0dcb8] bg-[#fdf6e9] text-amber' : 'border-line bg-surface2 text-ink3'
          }`}
        >
          <span aria-hidden="true">⚿</span>
          المفتاح الخاص
        </div>
        <div
          className={`flex items-center gap-1 rounded-lg border px-1.5 py-1 text-[9px] font-bold ${
            data.keyReady ? 'border-[#bfe4da] bg-[#e9f7f3] text-teal' : 'border-line bg-surface2 text-ink3'
          }`}
        >
          <span aria-hidden="true">⚿</span>
          مفتاح الجلسة
        </div>
      </div>

      <p className="mt-2 text-[9px] leading-snug text-ink3">
        {data.keyReady ? 'يملك مفتاح الجلسة نفسه' : 'بانتظار مفتاح الجلسة'}
      </p>
    </div>
  );
}

export function Stage2D({
  step,
  data,
  onOpenCert,
}: {
  step: number;
  data: TlsData;
  onOpenCert: () => void;
}) {
  const showPacketToServer = step === 1 || (step === 4 && data.keyReady) || step === 5 || (step === 6 && data.secretSent);

  return (
    <div className="rounded-2xl border border-line bg-[linear-gradient(180deg,#fbfdff,#f4f8fd)] p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_7rem_1fr] md:items-stretch">
        <BrowserCard data={data} step={step} />

        <div className="track relative flex min-h-24 items-center justify-center rounded-xl border border-dashed border-[#c3d3e5] bg-white/50 md:min-h-0">
          {data.insecure ? (
            <span className="inline-flex max-w-[7.5rem] items-center gap-1 rounded-lg border border-[#f0b5ae] bg-redtint px-2 py-1 text-[10px] font-bold text-red">
              <LockIcon safe={false} />
              123456
            </span>
          ) : (
            <>
              {step === 2 ? (
                <button
                  type="button"
                  onClick={onOpenCert}
                  className="absolute inset-x-0 mx-auto w-fit rounded-lg border border-[#f0dcb8] bg-[#fdf6e9] px-2 py-1 text-[10px] font-bold text-amber shadow-sm"
                >
                  شهادة رقمية
                </button>
              ) : null}

              {showPacketToServer && step !== 5 ? (
                <Packet
                  direction="toServer"
                  label={
                    step === 1 ? 'ClientHello' : step === 4 ? 'مفتاح الجلسة مشفّر' : 'كلمة المرور'
                  }
                  tone={step === 6 && data.secretSent ? 'encrypted' : step === 1 ? 'plain' : 'encrypted'}
                />
              ) : null}

              {step === 5 ? (
                <>
                  <Packet direction="toServer" label="Finished ✓" tone="encrypted" />
                  <Packet direction="toClient" label="Finished ✓" tone="encrypted" delay={260} />
                </>
              ) : null}

              {step === 6 && data.secretSent ? (
                <Packet direction="toClient" label="200 OK" tone="encrypted" delay={260} />
              ) : null}

              {step === 0 ? <span className="text-[10px] text-ink3">المسار جاهز</span> : null}
            </>
          )}
        </div>

        <ServerCard data={data} step={step} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-ink3">
        <span className="inline-flex items-center gap-1">
          <i className="block h-2 w-3 rounded-sm border border-[#f0b5ae] bg-redtint" aria-hidden="true" /> نص واضح
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="block h-2 w-3 rounded-sm border border-[#b9c9dd] bg-ink" aria-hidden="true" /> مشفّر
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="block h-2 w-3 rounded-sm border border-[#f0dcb8] bg-[#fdf6e9]" aria-hidden="true" /> شهادة
        </span>
        <span className="ms-auto">الاتجاه: المتصفح ← الخادم (من اليمين إلى اليسار)</span>
      </div>
    </div>
  );
}
