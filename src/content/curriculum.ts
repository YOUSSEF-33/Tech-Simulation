import { lessonU21 } from './lesson-u2-1';
import { questionsU21 } from './questions-u2-1';
import type { LessonContent, Question, Unit } from './types';

export const units: Unit[] = [
  {
    id: 'U1',
    slug: 'u1-it-society',
    order: 1,
    title: 'تكنولوجيا المعلومات والمجتمع',
    description: 'كيف يعمل الذكاء الاصطناعي، وما علاقة البيانات بما نراه من نتائج.',
    plannedLessons: 1,
    status: 'soon',
  },
  {
    id: 'U2',
    slug: 'u2-cybersecurity',
    order: 2,
    title: 'الأمن السيبراني',
    description: 'حماية البيانات أثناء انتقالها، تصميم شبكة أكثر أمانًا، والاستجابة للحوادث.',
    plannedLessons: 3,
    status: 'live',
  },
  {
    id: 'U3',
    slug: 'u3-web-apps',
    order: 3,
    title: 'تطبيقات الويب',
    description: 'من يطلب ومَن يجيب داخل تطبيق الويب، وكيف يتحدث المتصفح مع الخادم.',
    plannedLessons: 3,
    status: 'soon',
  },
  {
    id: 'U4',
    slug: 'u4-web-design',
    order: 4,
    title: 'تصميم الويب والوسائط',
    description: 'أنواع الوسائط، تجربة المستخدم، تقييم المواقع، والتحسين التكراري.',
    plannedLessons: 4,
    status: 'soon',
  },
];

export const lessons: LessonContent[] = [lessonU21];

export const questions: Question[] = [...questionsU21];

export function getUnit(slug: string): Unit | undefined {
  return units.find((u) => u.slug === slug);
}

export function unitLessons(unitId: Unit['id']): LessonContent[] {
  return lessons.filter((lesson) => lesson.unitId === unitId);
}

export function getLesson(slug: string): LessonContent | undefined {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getQuestionsFor(lesson: LessonContent): Question[] {
  return lesson.questionIds
    .map((id) => questions.find((q) => q.id === id))
    .filter((q): q is Question => Boolean(q));
}

export const contentVersion = '0.1.0';
