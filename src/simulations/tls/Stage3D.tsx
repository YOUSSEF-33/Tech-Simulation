'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LockIcon } from './LockIcon';
import type { SceneAnchor, SceneState, TlsSceneApi } from './scene3d';

type Tone = 'plain' | 'cert' | 'enc';

const TONE_STYLES: Record<Tone, string> = {
  plain: 'border-[#ff9d90]/45 bg-[#2b1512]/90 text-[#ffd9d2]',
  cert: 'border-[#f6c57c]/45 bg-[#2b2415]/90 text-[#f8e0b4]',
  enc: 'border-[#74e6d2]/45 bg-[#0d2a27]/90 text-[#c3f6ec]',
};

const BADGE_STYLES: Record<Tone, string> = {
  plain: 'border-[#f0b5ae] bg-redtint text-red',
  cert: 'border-[#f0dcb8] bg-[#fdf6e9] text-amber',
  enc: 'border-[#bfe4da] bg-[#e7f5f1] text-teal',
};

const LABEL_BASE =
  'pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-lg border px-2 py-1 text-[10px] font-bold leading-tight shadow-[0_6px_18px_rgb(0_0_0/0.45)] transition-opacity duration-200';

function packetLabel(
  step: number,
  insecure: boolean,
  keyReady: boolean,
  secretSent: boolean,
): { text: string; payload: string; tone: Tone; locked: boolean } | null {
  if (step === 1) {
    return { text: 'ClientHello', payload: 'TLS 1.3', tone: 'plain', locked: false };
  }
  if (step === 4 && keyReady) {
    return { text: 'مفتاح الجلسة', payload: 'مشفّر بالمفتاح العام', tone: 'enc', locked: true };
  }
  if (step === 5) {
    return { text: 'Finished ✓', payload: 'الطرفان فكّا الرسالة', tone: 'enc', locked: true };
  }
  if (step === 6 && secretSent) {
    return insecure
      ? { text: 'كلمة المرور', payload: '123456', tone: 'plain', locked: false }
      : { text: 'كلمة المرور', payload: 'f3a9 1c7b e2d4 8b60', tone: 'enc', locked: true };
  }
  return null;
}

function wireInfo(scene: SceneState): {
  label: string;
  from: string;
  to: string;
  payload: string;
  note: string;
  tone: Tone;
  ltr: boolean;
} {
  const { step, insecure, secretSent, keyReady, checks } = scene;

  if (insecure && step === 6 && secretSent) {
    return {
      label: 'نص صريح',
      from: 'المتصفح',
      to: 'الخادم',
      payload: '123456',
      note: 'في HTTP لا يوجد تشفير: كلمة المرور تعبر الشبكة كما هي، ويقرأها أي شخص عليها.',
      tone: 'plain',
      ltr: true,
    };
  }

  switch (step) {
    case 1:
      return {
        label: 'نص واضح',
        from: 'المتصفح',
        to: 'الخادم',
        payload: 'ClientHello · TLS 1.3',
        note: 'أول رسالة يعلن فيها المتصفح إصدارات التشفير التي يفهمها. معلنة عن قصد، ولا تحتوي سرًّا.',
        tone: 'plain',
        ltr: true,
      };
    case 2:
      return {
        label: 'بيانات عامة',
        from: 'الخادم',
        to: 'المتصفح',
        payload: 'store.example · a91f…3c · تنتهي 2027-08-14',
        note: 'الشهادة تحمل اسم النطاق والمفتاح العام. كلها بيانات منشورة، وحمايتها في توقيع الجهة المُصدِرة.',
        tone: 'cert',
        ltr: false,
      };
    case 3:
      return {
        label: 'فحص محلي',
        from: 'المتصفح',
        to: 'نفسه',
        payload: `${checks} من 3: الجهة · الصلاحية · النطاق`,
        note: 'المتصفح لا يثق بالشهادة لأنها وصلت، بل لأنه تحقق من ثلاث نقاط بنفسه.',
        tone: 'cert',
        ltr: false,
      };
    case 4:
      return keyReady
        ? {
            label: 'مشفّر',
            from: 'المتصفح',
            to: 'الخادم',
            payload: 'مفتاح الجلسة 7f2c… مشفّرًا بالمفتاح العام',
            note: 'المفتاح العام شفّر، والمفتاح الخاص وحده يفكّ. من يعترض الطريق يرى رموزًا لا يفكّها.',
            tone: 'enc',
            ltr: false,
          }
        : {
            label: 'قبل الإرسال',
            from: 'المتصفح',
            to: 'الخادم',
            payload: 'لم يُنشأ مفتاح الجلسة بعد',
            note: 'سيُنشئه المتصفح محليًا، ثم يرسل نسخة مشفّرة فقط — المفتاح نفسه لا يعبر الشبكة مكشوفًا.',
            tone: 'cert',
            ltr: false,
          };
    case 5:
      return {
        label: 'مشفّر',
        from: 'الطرفان',
        to: 'بعضهما',
        payload: 'Finished ✓ ← → Finished ✓',
        note: 'كل طرف فكّ رسالة الآخر بمفتاح الجلسة نفسه، فصار الاتصال آمنًا فعليًا لا نظريًا.',
        tone: 'enc',
        ltr: false,
      };
    case 6:
      return secretSent
        ? {
            label: 'مشفّر',
            from: 'المتصفح',
            to: 'الخادم',
            payload: 'f3a9 1c7b e2d4 8b60',
            note: 'هذا ما يخرج من جهازك فعليًا. الخادم يفكّه بمفتاح الجلسة، والمراقب يرى رموزًا فقط.',
            tone: 'enc',
            ltr: true,
          }
        : {
            label: 'قبل الإرسال',
            from: 'المتصفح',
            to: 'الخادم',
            payload: 'كلمة المرور: 123456',
            note: 'ستُشفّر بمفتاح الجلسة قبل أن تخرج من جهازك. اضغط «أرسل كلمة المرور» لترى الفرق.',
            tone: 'cert',
            ltr: false,
          };
    default:
      return {
        label: 'غير متصل',
        from: 'المتصفح',
        to: 'الخادم',
        payload: 'http://store.example',
        note: 'لم يبدأ الاتصال بعد. اضغط «ابدأ المحاكاة» لترى ما يحدث في كل خطوة.',
        tone: 'plain',
        ltr: true,
      };
  }
}

function KeyPill({
  on,
  label,
  tone,
}: {
  on: boolean;
  label: string;
  tone: 'public' | 'private' | 'session';
}) {
  const active = {
    public: 'border-[#cfe0f7] bg-tint text-primary',
    private: 'border-[#f0dcb8] bg-[#fdf6e9] text-amber',
    session: 'border-[#bfe4da] bg-[#e7f5f1] text-teal',
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${
        on ? active : 'border-line bg-surface2 text-ink3/70'
      }`}
    >
      <span aria-hidden="true">⚿</span>
      {label}
      <span aria-hidden="true">{on ? '✓' : '—'}</span>
    </span>
  );
}

export function Stage3D({
  scene,
  onCertClick,
  fallback,
}: {
  scene: SceneState;
  onCertClick: () => void;
  fallback: ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const apiRef = useRef<TlsSceneApi | null>(null);
  const sceneRef = useRef<SceneState>(scene);
  const clickRef = useRef(onCertClick);
  const labelsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const anchorHandlerRef = useRef<(anchors: SceneAnchor[]) => void>(() => {});
  const [unsupported, setUnsupported] = useState(false);

  sceneRef.current = scene;
  clickRef.current = onCertClick;

  anchorHandlerRef.current = (anchors) => {
    for (const anchor of anchors) {
      const element = labelsRef.current[anchor.id];
      if (!element) continue;
      if (!anchor.visible) {
        element.style.opacity = '0';
        continue;
      }
      const placement = element.dataset.placement ?? '-100%';
      element.style.opacity = '1';
      element.style.transform = `translate3d(${Math.round(anchor.x)}px, ${Math.round(
        anchor.y,
      )}px, 0) translate(-50%, ${placement})`;
    }
  };

  useEffect(() => {
    let cancelled = false;
    let api: TlsSceneApi | null = null;

    const boot = async () => {
      const probe = document.createElement('canvas');
      const hasWebGL =
        typeof WebGLRenderingContext !== 'undefined' &&
        Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'));
      if (!hasWebGL) {
        setUnsupported(true);
        return;
      }

      try {
        const module = await import('./scene3d');
        if (cancelled || !canvasRef.current) return;
        api = module.createTlsScene(canvasRef.current, {
          onCertClick: () => clickRef.current(),
          onAnchors: (list) => anchorHandlerRef.current(list),
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        });
        api.update(sceneRef.current);
        apiRef.current = api;
      } catch (error) {
        console.warn('3D stage unavailable, falling back to 2D.', error);
        if (!cancelled) setUnsupported(true);
      }
    };

    void boot();

    return () => {
      cancelled = true;
      apiRef.current = null;
      api?.dispose();
    };
  }, []);

  const primitives = `${scene.step}|${scene.status}|${scene.insecure}|${scene.certSeen}|${scene.checks}|${scene.keyReady}|${scene.secretSent}`;

  useEffect(() => {
    apiRef.current?.update(sceneRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primitives]);

  if (unsupported) return <>{fallback}</>;

  const safe = scene.step >= 5 && !scene.insecure;
  const scheme = safe ? 'https' : 'http';
  const packet = packetLabel(scene.step, scene.insecure, scene.keyReady, scene.secretSent);
  const wire = wireInfo(scene);
  const showEye = scene.insecure || scene.step === 6;
  const ticks = [
    scene.checks >= 1 ? '✓' : '·',
    scene.checks >= 2 ? '✓' : '·',
    scene.checks >= 3 ? '✓' : '·',
  ];

  return (
    <div>
      <div className="stage-3d relative h-[300px] overflow-hidden rounded-2xl border border-[#16283f] sm:h-[350px] lg:h-[380px]">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {packet ? (
            <div
              ref={(element) => {
                labelsRef.current.packet0 = element;
              }}
              data-placement="-135%"
              className={`${LABEL_BASE} ${TONE_STYLES[packet.tone]} text-center`}
            >
              <p className="flex items-center justify-center gap-1">
                {packet.locked ? <LockIcon safe className="h-3 w-3" /> : null}
                {packet.text}
              </p>
              <p className="ltr mt-0.5 text-[9px] font-semibold opacity-80">{packet.payload}</p>
            </div>
          ) : null}

          {packet && scene.step === 5 ? (
            <div
              ref={(element) => {
                labelsRef.current.packet1 = element;
              }}
              data-placement="-135%"
              className={`${LABEL_BASE} ${TONE_STYLES.enc} flex items-center gap-1`}
            >
              <LockIcon safe className="h-3 w-3" />
              <span>Finished ✓</span>
            </div>
          ) : null}

          {scene.step >= 2 && scene.step <= 3 ? (
            <div
              ref={(element) => {
                labelsRef.current.cert = element;
              }}
              data-placement="-100%"
              className={`${LABEL_BASE} ${TONE_STYLES.cert} text-center`}
            >
              <p>شهادة الخادم · store.example</p>
              <p className="mt-0.5 hidden text-[9px] font-semibold opacity-85 sm:block">
                الجهة {ticks[0]} · الصلاحية {ticks[1]} · النطاق {ticks[2]}
              </p>
            </div>
          ) : null}

          {showEye ? (
            <div
              ref={(element) => {
                labelsRef.current.eye = element;
              }}
              data-placement="0%"
              className={`${LABEL_BASE} ${
                scene.insecure ? TONE_STYLES.plain : 'border-white/15 bg-[#0b1622]/85 text-white/70'
              }`}
            >
              المراقب يرى:{' '}
              <span className="ltr font-bold">{scene.insecure ? '123456' : 'f3a9 1c7b…'}</span>
            </div>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="stage-chip">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-[#7fa8d6]" />
            TLS · ست خطوات
          </span>
          <span
            className={`stage-chip ${
              scene.insecure ? 'text-[#ff9d90]' : safe ? 'text-[#7fe6d2]' : 'text-[#c8d8ea]'
            }`}
          >
            <LockIcon safe={safe && !scene.insecure} />
            <span className="ltr">{scheme}</span>
            <span className="text-white/40">·</span>
            {scene.insecure ? 'غير آمن' : safe ? 'محمي' : 'غير مؤمّن بعد'}
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <div className="text-start">
            <p className="text-[11px] font-extrabold text-white/90">المتصفح</p>
            <p className="ltr text-[10px] text-white/45">{scheme}://store.example</p>
            <p className="text-[10px] text-white/55">مفتاح الجلسة {scene.keyReady ? '✓' : '—'}</p>
          </div>
          {scene.step === 2 && !scene.certSeen ? (
            <button
              type="button"
              onClick={onCertClick}
              className="pointer-events-auto rounded-full border border-[#f6c57c]/60 bg-[#2b2415]/95 px-3 py-1 text-[10px] font-bold text-[#f8e0b4] shadow-[0_6px_18px_rgb(0_0_0/0.45)] transition hover:bg-[#3a3018]"
            >
              افتح شهادة الخادم
            </button>
          ) : (
            <p className="stage-hint text-[10px] font-semibold text-white/40">
              اسحب لتدوير المشهد
            </p>
          )}
          <div className="text-end">
            <p className="text-[11px] font-extrabold text-white/90">الخادم</p>
            <p className="ltr text-[10px] text-white/45">store.example</p>
            <p className="text-[10px] text-white/55">
              الشهادة {scene.checks >= 3 ? 'متحقَّق منها ✓' : scene.step >= 2 ? 'بانتظار الفحص' : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-xl border border-line bg-surface px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[10px] font-bold text-ink3">الرسالة الحالية</span>
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${BADGE_STYLES[wire.tone]}`}
          >
            {wire.tone === 'enc' ? <LockIcon safe className="h-3 w-3" /> : null}
            {wire.label}
          </span>
          <span className="text-[10px] font-semibold text-ink3">
            {wire.from} ← {wire.to}
          </span>
          <span className="ms-auto text-[10px] font-bold text-ink3">
            {scene.step > 0 ? `الخطوة ${scene.step} من 6` : 'لم تبدأ'}
          </span>
        </div>

        <p className={`mt-1 truncate text-[12px] font-bold text-ink ${wire.ltr ? 'ltr' : ''}`}>
          {wire.payload}
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink3">{wire.note}</p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-1.5 text-[10px]">
          <span className="font-bold text-ink3">المفاتيح</span>
          <span className="font-bold text-ink">المتصفح:</span>
          <KeyPill on={scene.step >= 2} label="المفتاح العام" tone="public" />
          <KeyPill on={scene.keyReady} label="مفتاح الجلسة" tone="session" />
          <span className="mx-0.5 text-line">|</span>
          <span className="font-bold text-ink">الخادم:</span>
          <KeyPill on label="المفتاح الخاص" tone="private" />
          <KeyPill on={scene.keyReady} label="مفتاح الجلسة" tone="session" />
        </div>

        <p className="mt-1 hidden text-[10px] leading-relaxed text-ink3 sm:block">
          المفتاح العام يشفّر فقط · المفتاح الخاص يفكّ ولا يغادر الخادم · مفتاح الجلسة واحد عند
          الطرفين ومؤقت.
        </p>
      </div>
    </div>
  );
}
