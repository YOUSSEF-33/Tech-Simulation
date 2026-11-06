'use client';

import { useEffect, useState } from 'react';

export interface LessonProgress {
  readAt?: string;
  completedAt?: string;
}

export interface SimProgress {
  completedAt: string;
  hintsUsed: number;
}

export interface AttemptRecord {
  id: string;
  at: string;
  score: number;
  total: number;
  choices: Record<string, string>;
  durationSec: number;
}

export interface ProgressDoc {
  schemaVersion: 1;
  lessons: Record<string, LessonProgress>;
  sims: Record<string, SimProgress>;
  attempts: Record<string, AttemptRecord[]>;
  lastLessonId?: string;
}

const KEY = 'manhag.progress.v1';
const EVENT = 'manhag:progress';

const empty = (): ProgressDoc => ({ schemaVersion: 1, lessons: {}, sims: {}, attempts: {} });

function safeParse(raw: string | null): ProgressDoc {
  if (!raw) return empty();
  try {
    const parsed = JSON.parse(raw) as Partial<ProgressDoc> | null;
    if (!parsed || parsed.schemaVersion !== 1) return empty();
    return {
      schemaVersion: 1,
      lessons: typeof parsed.lessons === 'object' && parsed.lessons ? parsed.lessons : {},
      sims: typeof parsed.sims === 'object' && parsed.sims ? parsed.sims : {},
      attempts: typeof parsed.attempts === 'object' && parsed.attempts ? parsed.attempts : {},
      lastLessonId: typeof parsed.lastLessonId === 'string' ? parsed.lastLessonId : undefined,
    };
  } catch {
    return empty();
  }
}

export function readProgress(): ProgressDoc {
  if (typeof window === 'undefined') return empty();
  try {
    return safeParse(window.localStorage.getItem(KEY));
  } catch {
    return empty();
  }
}

function writeProgress(doc: ProgressDoc): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(doc));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Storage may be full or blocked; the app stays usable without persistence.
  }
}

export function recordLessonRead(lessonId: string): void {
  const doc = readProgress();
  const existing = doc.lessons[lessonId] ?? {};
  doc.lessons[lessonId] = { ...existing, readAt: existing.readAt ?? new Date().toISOString() };
  doc.lastLessonId = lessonId;
  writeProgress(doc);
}

export function recordVisit(lessonId: string): void {
  const doc = readProgress();
  if (doc.lastLessonId === lessonId) return;
  doc.lastLessonId = lessonId;
  writeProgress(doc);
}

export function recordSim(simId: string, hintsUsed: number): void {
  const doc = readProgress();
  if (doc.sims[simId]) return;
  doc.sims[simId] = { completedAt: new Date().toISOString(), hintsUsed };
  writeProgress(doc);
}

export function recordAttempt(quizId: string, attempt: AttemptRecord): void {
  const doc = readProgress();
  const list = doc.attempts[quizId] ?? [];
  doc.attempts[quizId] = [attempt, ...list].slice(0, 20);
  writeProgress(doc);
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // ignore
  }
}

export function bestScore(doc: ProgressDoc, quizId: string): number | null {
  const list = doc.attempts[quizId];
  if (!list || list.length === 0) return null;
  return list.reduce((max, a) => Math.max(max, a.score), 0);
}

export function isLessonComplete(doc: ProgressDoc, lessonId: string, quizId: string): boolean {
  const read = Boolean(doc.lessons[lessonId]?.readAt);
  const best = bestScore(doc, quizId);
  return read && best !== null && best >= 3;
}

export function useProgress(): ProgressDoc {
  const [doc, setDoc] = useState<ProgressDoc>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setDoc(readProgress());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return ready ? doc : empty();
}
