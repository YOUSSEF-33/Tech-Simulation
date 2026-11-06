export type UnitId = 'U1' | 'U2' | 'U3' | 'U4';

export type Block =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string; id: string }
  | { kind: 'callout'; tone: 'info' | 'tip' | 'warning'; title: string; text: string }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | { kind: 'diagram'; id: 'symmetric-vs-public' | 'certificate' | 'tls-flow'; caption: string }
  | { kind: 'code'; code: string; caption?: string }
  | { kind: 'checkpoint'; question: string; answer: string };

export interface Objective {
  id: string;
  text: string;
}

export interface GlossaryEntry {
  ar: string;
  en: string;
  definition: string;
}

export interface SimRef {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  minutes: number;
}

export interface LessonMeta {
  id: string;
  slug: string;
  unitId: UnitId;
  displayNumber: string;
  title: string;
  summary: string;
  readMin: number;
  durationMin: number;
  objectives: Objective[];
  sim: SimRef;
  quizId: string;
  questionIds: string[];
}

export interface LessonContent extends LessonMeta {
  blocks: Block[];
  glossary: GlossaryEntry[];
}

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  objectiveId: string;
  stem: string;
  choices: Choice[];
  correctChoiceId: string;
  explanation: string;
  needsReview?: boolean;
}

export interface Unit {
  id: UnitId;
  slug: string;
  order: number;
  title: string;
  description: string;
  plannedLessons: number;
  status: 'live' | 'soon';
}
