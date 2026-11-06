'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Question } from '@/content/types';
import { recordAttempt } from '@/lib/progress';
import { ar } from '@/i18n/ar';

const LETTERS = ['أ', 'ب', 'ج', 'د'];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const a = copy[i];
    const b = copy[j];
    if (a !== undefined && b !== undefined) {
      copy[i] = b;
      copy[j] = a;
    }
  }
  return copy;
}

interface Answered {
  questionId: string;
  choiceId: string;
  correct: boolean;
}

export function QuizRunner({ questions, lessonSlug, quizId }: { questions: Question[]; lessonSlug: string; quizId: string }) {
  const [runId, setRunId] = useState(0);
  const items = useMemo(() => shuffle(questions, 17 + runId * 31).slice(0, 5), [questions, runId]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [finished, setFinished] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const current = items[index];

  const restart = () => {
    setRunId((n) => n + 1);
    setIndex(0);
    setSelected(null);
    setConfirmed(false);
    setAnswers([]);
    setFinished(false);
    setStartedAt(Date.now());
  };

  const confirm = () => {
    if (!current || !selected) return;
    const correct = selected === current.correctChoiceId;
    setAnswers((prev) => [...prev, { questionId: current.id, choiceId: selected, correct }]);
    setConfirmed(true);
  };

  const advance = () => {
    if (index + 1 < items.length) {
      setIndex(index + 1);
      setSelected(null);
      setConfirmed(false);
      return;
    }
    const score = answers.filter((a) => a.correct).length;
    const choices: Record<string, string> = {};
    for (const a of answers) choices[a.questionId] = a.choiceId;
    recordAttempt(quizId, {
      id: `${Date.now()}`,
      at: new Date().toISOString(),
      score,
      total: items.length,
      choices,
      durationSec: Math.round((Date.now() - startedAt) / 1000),
    });
    setFinished(true);
  };

  if (items.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="font-semibold text-ink">{ar.quiz.empty}</p>
        <Link href={`/lessons/${lessonSlug}`} className="btn btn-primary mt-4">
          {ar.quiz.review}
        </Link>
      </div>
    );
  }

  if (finished) {
    const score = answers.filter((a) => a.correct).length;
    const total = items.length;
    const passed = score >= 3;
    const percent = Math.round((score / total) * 100);

    return (
      <div className="space-y-5">
        <div className="card overflow-hidden">
          <div className={`px-5 py-6 ${passed ? 'bg-[#e9f7f3]' : 'bg-[#fdf6e9]'}`}>
            <p className="text-sm font-semibold text-ink2">{ar.quiz.score}</p>
            <p className="mt-1 text-3xl font-extrabold text-ink">
              {score} <span className="text-base font-semibold text-ink2">{ar.quiz.of} {total}</span>
              <span className="ms-2 text-base font-bold text-ink2">({percent}%)</span>
            </p>
            <p className={`mt-2 text-sm font-bold ${passed ? 'text-teal' : 'text-amber'}`}>
              {passed ? `✓ ${ar.quiz.passed} — فهمك جيد` : `${ar.quiz.notYet} — راجع الشرح ثم أعد المحاولة`}
            </p>
          </div>
          <div className="flex flex-col gap-2 p-4 sm:flex-row">
            <button type="button" onClick={restart} className="btn btn-primary flex-1">
              {ar.common.retry}
            </button>
            <Link href={`/lessons/${lessonSlug}`} className="btn btn-outline flex-1">
              {ar.quiz.review}
            </Link>
          </div>
        </div>

        <section aria-label="مراجعة الإجابات" className="space-y-3">
          <h2 className="text-lg font-bold">مراجعة الإجابات</h2>
          {items.map((q, i) => {
            const answered = answers[i];
            const myChoice = q.choices.find((c) => c.id === answered?.choiceId);
            const correctChoice = q.choices.find((c) => c.id === q.correctChoiceId);
            return (
              <article key={q.id} className="card p-4">
                <div className="mb-2 flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      answered?.correct ? 'bg-[#e7f5f1] text-teal' : 'bg-redtint text-red'
                    }`}
                  >
                    {answered?.correct ? '✓' : '✕'}
                  </span>
                  <h3 className="text-sm font-bold leading-relaxed text-ink">
                    {i + 1}. {q.stem}
                  </h3>
                </div>
                <div className="space-y-1.5 ps-8 text-sm">
                  <p className="text-ink2">
                    <span className="font-semibold text-red">{ar.quiz.yourAnswer}: </span>
                    {myChoice?.text ?? '—'}
                  </p>
                  {!answered?.correct ? (
                    <p className="text-ink2">
                      <span className="font-semibold text-teal">{ar.quiz.correctAnswer}: </span>
                      {correctChoice?.text}
                    </p>
                  ) : null}
                  <p className="rounded-lg bg-surface2 p-2.5 text-[13px] leading-relaxed text-ink2">
                    <span className="font-semibold text-ink">{ar.quiz.why} </span>
                    {q.explanation}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  if (!current) return null;

  const isCorrect = selected === current.correctChoiceId;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-ink2">{ar.quiz.questionOf(index + 1, items.length)}</span>
          <span className="text-ink3">{ar.quiz.chooseOne}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={index + 1} aria-label="تقدّم الاختبار">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-bold leading-relaxed text-ink">{current.stem}</h2>

        <div role="radiogroup" aria-label={ar.quiz.chooseOne} className="mt-4 space-y-2">
          {current.choices.map((choice, i) => {
            const isSelected = selected === choice.id;
            const showCorrect = confirmed && choice.id === current.correctChoiceId;
            const showWrong = confirmed && isSelected && !isCorrect;
            return (
              <button
                key={choice.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={confirmed}
                onClick={() => setSelected(choice.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-start text-sm leading-relaxed transition-colors ${
                  showCorrect
                    ? 'border-[#8fd0bf] bg-[#e9f7f3] text-ink'
                    : showWrong
                      ? 'border-[#f0b5ae] bg-redtint text-ink'
                      : isSelected
                        ? 'border-primary bg-tint text-ink'
                        : 'border-line bg-white text-ink2 hover:border-[#b9c9dd] hover:bg-[#fbfcfe]'
                } ${confirmed ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                    isSelected || showCorrect ? 'border-transparent bg-white/80 text-primary' : 'border-line text-ink3'
                  }`}
                >
                  {LETTERS[i] ?? i + 1}
                </span>
                <span className="pt-0.5">{choice.text}</span>
              </button>
            );
          })}
        </div>

        {confirmed ? (
          <div
            role="status"
            className={`mt-4 rounded-xl border p-3 text-sm leading-relaxed ${
              isCorrect ? 'border-[#bfe4da] bg-[#e9f7f3]' : 'border-[#f0b5ae] bg-redtint'
            }`}
          >
            <p className={`font-bold ${isCorrect ? 'text-teal' : 'text-red'}`}>
              {isCorrect ? `✓ ${ar.quiz.correct}` : `✕ ${ar.quiz.wrong}`}
            </p>
            <p className="mt-1 text-ink2">{current.explanation}</p>
            {current.needsReview ? (
              <p className="mt-2 text-[11px] text-ink3">هذا السؤال قيد مراجعة المعلم للتأكد من مطابقته للمنهج.</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {!confirmed ? (
            <button type="button" onClick={confirm} disabled={!selected} className="btn btn-primary flex-1">
              {ar.quiz.confirm}
            </button>
          ) : (
            <button type="button" onClick={advance} className="btn btn-primary flex-1">
              {index + 1 === items.length ? ar.quiz.finish : ar.quiz.nextQuestion}
            </button>
          )}
          <Link href={`/lessons/${lessonSlug}`} className="btn btn-ghost">
            {ar.quiz.exit}
          </Link>
        </div>
      </div>
    </div>
  );
}
