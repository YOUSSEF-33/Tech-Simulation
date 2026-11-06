'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { LessonContent } from '@/content/types';
import { bestScore, isLessonComplete, recordLessonRead, recordVisit, useProgress } from '@/lib/progress';
import { ar } from '@/i18n/ar';

export function LessonActions({ lesson }: { lesson: LessonContent }) {
  const doc = useProgress();
  const [justMarked, setJustMarked] = useState(false);

  useEffect(() => {
    recordVisit(lesson.id);
  }, [lesson.id]);

  const complete = isLessonComplete(doc, lesson.id, lesson.quizId);
  const read = Boolean(doc.lessons[lesson.id]?.readAt);
  const best = bestScore(doc, lesson.quizId);
  const simDone = Boolean(doc.sims[lesson.sim.id]);

  const markRead = () => {
    recordLessonRead(lesson.id);
    setJustMarked(true);
  };

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-ink">{ar.lesson.progressLabel}</p>
          <span className={`chip ${complete ? 'chip-teal' : read ? 'chip-primary' : ''}`}>
            {complete ? ar.common.completed : read ? ar.common.inProgress : ar.common.notStarted}
          </span>
        </div>

        <ul className="space-y-2 text-sm text-ink2">
          <li className="flex items-center gap-2">
            <StatusDot done={read} />
            <span>قراءة الدرس</span>
          </li>
          <li className="flex items-center gap-2">
            <StatusDot done={simDone} />
            <span>{simDone ? 'المحاكاة مكتملة' : 'المحاكاة (اختيارية)'}</span>
          </li>
          <li className="flex items-center gap-2">
            <StatusDot done={complete} />
            <span>{best === null ? 'لم تجرّب الاختبار بعد' : `أفضل نتيجة: ${best} من 5`}</span>
          </li>
        </ul>

        <div className="mt-4 space-y-2">
          <Link href={`/lessons/${lesson.slug}/quiz`} className="btn btn-primary w-full">
            {ar.lesson.quizCta}
          </Link>
          {!read ? (
            <button type="button" onClick={markRead} className="btn btn-outline w-full">
              {justMarked ? 'تمّ ✓' : ar.lesson.markRead}
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-ink3">{ar.progress.deviceNote}</p>
      </div>
    </div>
  );
}

function StatusDot({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] ${
        done ? 'border-[#bfe4da] bg-[#e7f5f1] text-teal' : 'border-line bg-surface2 text-ink3'
      }`}
    >
      {done ? '✓' : '·'}
    </span>
  );
}
