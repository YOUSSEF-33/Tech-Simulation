'use client';

import Link from 'next/link';
import { useEffect, useMemo, useReducer } from 'react';
import { ar } from '@/i18n/ar';
import { recordSim } from '@/lib/progress';
import { tlsSteps } from './content';
import { Stage2D } from './Stage2D';
import { Stage3D } from './Stage3D';
import type { SceneState } from './scene3d';
import {
  CHECK_IDS,
  TOTAL_STEPS,
  canAdvance,
  initialTlsState,
  reduce,
  type CheckId,
  type TlsData,
} from './machine';

const CHECKS: { id: CheckId; label: string; detail: string }[] = [
  { id: 'issuer', label: 'مَن أصدر الشهادة؟', detail: 'جهة إصدار شهادات موثوقة' },
  { id: 'expiry', label: 'هل ما زالت صالحة؟', detail: 'تنتهي في 2027-08-14' },
  { id: 'domain', label: 'هل النطاق مطابق؟', detail: 'store.example' },
];

export function TlsSimulation({ lessonSlug }: { lessonSlug: string }) {
  const [state, dispatch] = useReducer(reduce, initialTlsState);
  const { step, data, status } = state;
  const content = step > 0 ? tlsSteps[step - 1] : undefined;
  const won = status === 'won';

  useEffect(() => {
    if (won) recordSim('SIM-TLS-01', data.hint);
  }, [won, data.hint]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch({ type: 'closeCert' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const scene = useMemo<SceneState>(
    () => ({
      step,
      status,
      insecure: data.insecure,
      certSeen: data.certSeen,
      checks: CHECK_IDS.filter((id) => data.checks[id]).length,
      keyReady: data.keyReady,
      secretSent: data.secretSent,
    }),
    [step, status, data.insecure, data.certSeen, data.checks, data.keyReady, data.secretSent],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href={`/lessons/${lessonSlug}`} className="text-xs font-semibold text-ink3 hover:text-ink">
          ← رجوع إلى الدرس
        </Link>
        <span className="chip ms-auto chip-primary">محاكاة تعليمية مبسّطة</span>
      </div>

      <header className="mb-4">
        <h1 className="text-xl font-extrabold text-ink sm:text-2xl">رحلة اتصال HTTPS</h1>
        <p className="mt-1 text-[13px] text-ink2">من رسالة الترحيب إلى بيانات مشفّرة — ست خطوات تتحكم فيها.</p>
      </header>

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${i + 1 <= step ? 'bg-primary' : 'bg-line'}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'toggleInsecure' })}
          className={`chip ${data.insecure ? 'chip-amber' : ''}`}
        >
          {data.insecure ? 'عُد إلى HTTPS' : 'شاهد الفرق: اتصال غير آمن'}
        </button>
      </div>

      {/* STAGE */}
      <Stage3D
        scene={scene}
        onCertClick={() => dispatch({ type: 'openCert' })}
        fallback={<Stage2D step={step} data={data} onOpenCert={() => dispatch({ type: 'openCert' })} />}
      />

      {/* STEP ACTIONS */}
      {step === 3 ? (
        <div className="mt-3 rounded-2xl border border-line bg-surface p-3">
          <p className="mb-2 text-xs font-extrabold text-ink">تحقّق من الشهادة بنفسك</p>
          <ul className="space-y-1.5">
            {CHECKS.map((check) => {
              const done = data.checks[check.id];
              return (
                <li key={check.id} className="flex items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5">
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      done ? 'bg-[#e7f5f1] text-teal' : 'bg-surface2 text-ink3'
                    }`}
                  >
                    {done ? '✓' : '·'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-ink">{check.label}</p>
                    <p className="text-[10px] text-ink3">{check.detail}</p>
                  </div>
                  <button
                    type="button"
                    disabled={done}
                    onClick={() => dispatch({ type: 'check', id: check.id })}
                    className="btn btn-outline btn-sm min-h-8 px-2 text-[11px]"
                  >
                    {done ? 'تم' : 'تحقّق'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {step === 4 && !data.keyReady ? (
        <div className="mt-3 rounded-2xl border border-line bg-surface p-3 text-center">
          <button type="button" onClick={() => dispatch({ type: 'createKey' })} className="btn btn-primary">
            أنشئ مفتاح الجلسة
          </button>
        </div>
      ) : null}

      {step === 6 ? (
        <div className="mt-3 space-y-2 rounded-2xl border border-line bg-surface p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'sendSecret' })}
              disabled={data.secretSent}
              className="btn btn-primary btn-sm"
            >
              {data.secretSent ? 'تم الإرسال ✓' : 'أرسل كلمة المرور'}
            </button>
            <span className="text-[11px] text-ink3">جرّب الإرسال، ثم قارن ما يراه كل طرف.</span>
          </div>

          {data.secretSent ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-surface2 p-2.5">
                <p className="text-[10px] font-bold text-ink3">ما يراه المراقب على الشبكة</p>
                <p className="ltr mt-1 truncate text-[11px] font-bold text-ink">
                  {data.insecure ? '123456' : 'f3a91c7be2d4…'}
                </p>
              </div>
              <div className="rounded-xl border border-[#bfe4da] bg-[#e9f7f3] p-2.5">
                <p className="text-[10px] font-bold text-teal">ما يراه الخادم</p>
                <p className="ltr mt-1 text-[11px] font-bold text-ink">123456</p>
              </div>
            </div>
          ) : null}

          {data.insecure ? (
            <p className="rounded-lg border border-[#f0b5ae] bg-redtint p-2 text-[11px] leading-relaxed text-ink2">
              في اتصال HTTP عادي تنتقل كلمة المرور كما هي، وأي شخص على نفس الشبكة يستطيع قراءتها.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* NARRATION + RESULT */}
      {won ? (
        <div className="mt-3 rounded-2xl border border-[#bfe4da] bg-[#e9f7f3] p-4">
          <p className="text-sm font-extrabold text-teal">أحسنت! أنت الآن تعرف كيف يتحوّل اتصال مفتوح إلى محمي.</p>
          <ul className="mt-2 space-y-1 text-[13px] leading-relaxed text-ink2">
            <li>• الشهادة أثبتت هوية الخادم قبل أن تثق به.</li>
            <li>• مفتاح الجلسة حُفظ عند الطرفين فقط، وليس على الشبكة.</li>
            <li>• البيانات الآن تمرّ مشفّرة، ومن يعترضها يرى رموزًا فقط.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/lessons/${lessonSlug}/quiz`} className="btn btn-primary btn-sm">
              اختبر فهمك
            </Link>
            <Link href={`/lessons/${lessonSlug}`} className="btn btn-outline btn-sm">
              رجوع إلى الدرس
            </Link>
          </div>
        </div>
      ) : (
        <div aria-live="polite" className="mt-3 rounded-2xl border border-line bg-surface p-4">
          {content ? (
            <>
              <p className="text-[10px] font-bold text-ink3">{ar.sim.stepOf(step, TOTAL_STEPS)}</p>
              <h2 className="mt-0.5 text-sm font-extrabold text-ink">{content.title}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink2">{content.narration}</p>
              {content.instruction ? (
                <p className="mt-2 rounded-lg bg-surface2 px-2.5 py-1.5 text-[12px] font-semibold text-ink2">
                  {content.instruction}
                </p>
              ) : null}
              {data.hint > 0 && step > 0 ? (
                <p className="mt-2 rounded-lg border border-[#f0dcb8] bg-[#fdf6e9] px-2.5 py-1.5 text-[12px] text-amber">
                  {content.hints[data.hint - 1]}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <h2 className="text-sm font-extrabold text-ink">قبل أن تبدأ</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink2">
                في الأسفل كلمة مرور مكتوبة بوضوح. تابع الخطوات لترى كيف تُحمى قبل أن تخرج من جهازك.
              </p>
            </>
          )}
        </div>
      )}

      {/* CONTROLS */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: 'hint' })}
          disabled={step === 0 || won || data.hint >= 3}
          className="btn btn-ghost btn-sm"
        >
          {data.hint === 0 ? 'تلميح' : data.hint === 1 ? 'تلميح أعمق' : 'أظهر الإرشاد'}
        </button>

        <button
          type="button"
          onClick={() => dispatch({ type: 'prev' })}
          disabled={step === 0 || won}
          className="btn btn-outline btn-sm"
        >
          السابق
        </button>

        <div className="ms-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'reset' })}
            className="btn btn-ghost btn-sm"
          >
            إعادة
          </button>

          {step === 0 ? (
            <button type="button" onClick={() => dispatch({ type: 'start' })} className="btn btn-primary">
              ابدأ المحاكاة
            </button>
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: 'next' })}
              disabled={!won && !canAdvance(state)}
              className="btn btn-primary btn-sm"
            >
              {step >= TOTAL_STEPS ? (won ? 'تمّ' : 'أنهِ المحاكاة') : 'التالي'}
            </button>
          )}
        </div>
      </div>

      {step === 2 && !data.certOpen ? (
        <p className="mt-2 text-[11px] font-semibold text-amber">افتح الشهادة أولًا لتتمكن من المتابعة.</p>
      ) : null}
      {step === 3 && !canAdvance(state) ? (
        <p className="mt-2 text-[11px] font-semibold text-amber">أكمل الفحوص الثلاثة للمتابعة.</p>
      ) : null}

      {/* CERT DIALOG */}
      {data.certOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-title"
            className="fade-up max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-surface p-4 shadow-2xl sm:rounded-2xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 id="cert-title" className="text-sm font-extrabold text-ink">
                شهادة الخادم
              </h2>
              <button
                type="button"
                onClick={() => dispatch({ type: 'closeCert' })}
                autoFocus
                className="btn btn-ghost min-h-8 px-2 text-xs"
              >
                إغلاق
              </button>
            </div>
            <dl className="space-y-1.5 rounded-xl border border-line bg-canvas p-3 text-[12px]">
              <div className="flex justify-between gap-2">
                <dt className="text-ink3">اسم النطاق</dt>
                <dd className="ltr font-semibold text-ink">store.example</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink3">الجهة المُصدِرة</dt>
                <dd className="font-semibold text-ink">جهة إصدار موثوقة</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink3">المفتاح العام</dt>
                <dd className="ltr font-semibold text-ink">a91f…3c</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink3">تاريخ الانتهاء</dt>
                <dd className="ltr font-semibold text-ink">2027-08-14</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink3">التوقيع</dt>
                <dd className="ltr font-semibold text-teal">صالح ✓</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] leading-relaxed text-ink3">
              الشهادة تربط النطاق بالمفتاح العام. لاحظ اسم النطاق وتاريخ الانتهاء، فهما أول ما يتحقق منه المتصفح.
            </p>
            <button
              type="button"
              onClick={() => dispatch({ type: 'closeCert' })}
              className="btn btn-primary mt-3 w-full btn-sm"
            >
              فهمت، تابع
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
