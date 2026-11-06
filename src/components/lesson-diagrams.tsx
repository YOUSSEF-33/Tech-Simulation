type DiagramId = 'symmetric-vs-public' | 'certificate' | 'tls-flow';

function KeyIcon({ tone = 'primary' }: { tone?: 'primary' | 'amber' }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none">
      <circle cx="8" cy="8" r="3.2" stroke={tone === 'amber' ? '#A65B00' : '#1258A6'} strokeWidth="1.8" />
      <path
        d="M10.4 10.4 19 19m-3 0v-2.4m-2.2-.8h2"
        stroke={tone === 'amber' ? '#A65B00' : '#1258A6'}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Node({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-center">
      <p className="text-sm font-bold text-ink">{title}</p>
      {sub ? <p className="text-[11px] text-ink3">{sub}</p> : null}
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-1">
      {label ? <span className="text-[10px] leading-tight text-ink3">{label}</span> : null}
      <svg viewBox="0 0 40 12" className="h-3 w-full min-w-6" aria-hidden="true">
        <path d="M38 6H4m0 0 5-4M4 6l5 4" stroke="#8FA3BA" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

function SymmetricPanel() {
  return (
    <div className="rounded-xl border border-line bg-canvas/60 p-3">
      <p className="mb-2 text-xs font-bold text-ink2">تشفير متماثل</p>
      <div className="flex items-center justify-between gap-1">
        <Node title="المرسل" />
        <Arrow label="نفس المفتاح" />
        <div className="flex flex-col items-center gap-1 rounded-lg bg-tint px-2 py-1.5">
          <KeyIcon />
          <span className="text-[10px] font-bold text-primary">مفتاح واحد</span>
        </div>
        <Arrow />
        <Node title="المستقبل" />
      </div>
    </div>
  );
}

function PublicPanel() {
  return (
    <div className="rounded-xl border border-line bg-canvas/60 p-3">
      <p className="mb-2 text-xs font-bold text-ink2">تشفير بالمفتاح العام</p>
      <div className="flex items-center justify-between gap-1">
        <Node title="المرسل" />
        <Arrow label="يشفّر بالعام" />
        <div className="flex flex-col items-center gap-1 rounded-lg bg-[#fdf3e3] px-2 py-1.5">
          <KeyIcon tone="amber" />
          <span className="text-[10px] font-bold text-amber">مفتاحان</span>
        </div>
        <Arrow label="يفكّ بالخاص" />
        <Node title="المستقبل" sub="يملك الخاص" />
      </div>
    </div>
  );
}

function CertificateDiagram() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-canvas/60 p-4 sm:flex-row sm:justify-center sm:gap-5">
      <div className="w-full max-w-64 rounded-xl border border-line bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold text-ink">شهادة رقمية</p>
          <span className="chip chip-teal text-[10px]">صالحة</span>
        </div>
        <dl className="space-y-1 text-[11px]">
          <div className="flex justify-between gap-2">
            <dt className="text-ink3">النطاق</dt>
            <dd className="ltr text-ink">store.example</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-ink3">المفتاح العام</dt>
            <dd className="ltr text-ink">a91f…3c</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-ink3">الجهة المُصدِرة</dt>
            <dd className="text-ink">جهة موثوقة</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-ink3">تنتهي في</dt>
            <dd className="ltr text-ink">2027-08-14</dd>
          </div>
        </dl>
      </div>
      <div className="flex flex-col items-center gap-1 text-[11px] text-ink3">
        <svg viewBox="0 0 40 12" className="h-3 w-10 rotate-90 sm:rotate-0" aria-hidden="true">
          <path d="M38 6H4m0 0 5-4M4 6l5 4" stroke="#8FA3BA" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
        <span>يتحقق المتصفح</span>
      </div>
      <Node title="المتصفح" sub="يثق أو يتوقف" />
    </div>
  );
}

const FLOW = [
  { n: '1', title: 'ترحيب', sub: 'المتصفح يطلب اتصالًا آمنًا' },
  { n: '2', title: 'شهادة', sub: 'الخادم يرسل شهادته' },
  { n: '3', title: 'تحقّق', sub: 'الجهة والصلاحية والنطاق' },
  { n: '4', title: 'مفتاح جلسة', sub: 'يُشفّر بالعام ويُفكّ بالخاص' },
  { n: '5', title: 'تأكيد', sub: 'رسالة مشفّرة بالطرفين' },
  { n: '6', title: 'بيانات', sub: 'كل شيء بعدها مشفّر' },
];

function FlowDiagram() {
  return (
    <div className="rounded-xl border border-line bg-canvas/60 p-3">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {FLOW.map((step) => (
          <li key={step.n} className="rounded-lg border border-line bg-white p-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tint text-[11px] font-extrabold text-primary">
                {step.n}
              </span>
              <p className="text-xs font-bold text-ink">{step.title}</p>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-ink3">{step.sub}</p>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-[11px] text-ink3">الاتجاه من اليمين إلى اليسار: المتصفح يبدأ، والخادم يجيب.</p>
    </div>
  );
}

export function Diagram({ id, caption }: { id: DiagramId; caption: string }) {
  return (
    <figure className="my-5">
      <div className="rounded-2xl border border-line bg-surface2/60 p-3">
        {id === 'symmetric-vs-public' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <SymmetricPanel />
            <PublicPanel />
          </div>
        ) : null}
        {id === 'certificate' ? <CertificateDiagram /> : null}
        {id === 'tls-flow' ? <FlowDiagram /> : null}
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-ink3">{caption}</figcaption>
    </figure>
  );
}
