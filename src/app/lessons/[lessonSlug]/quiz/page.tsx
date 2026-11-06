import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLesson, getQuestionsFor, lessons } from '@/content/curriculum';
import { QuizRunner } from '@/components/quiz-runner';

export function generateStaticParams() {
  return lessons.map((lesson) => ({ lessonSlug: lesson.slug }));
}

export const metadata = { title: 'اختبار قصير' };

export default async function QuizPage({ params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params;
  const lesson = getLesson(lessonSlug);
  if (!lesson) notFound();

  const questions = getQuestionsFor(lesson);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <nav aria-label="مسار التنقل" className="mb-4 text-xs text-ink3">
        <Link href={`/lessons/${lesson.slug}`} className="hover:text-ink">
          ← رجوع إلى الدرس
        </Link>
      </nav>

      <header className="mb-5">
        <span className="chip chip-primary">اختبار قصير</span>
        <h1 className="mt-2 text-2xl font-extrabold text-ink">{lesson.title}</h1>
        <p className="mt-1 text-sm text-ink2">
          خمسة أسئلة من {questions.length} أسئلة. لكل إجابة شرح، ويمكنك إعادة المحاولة كما تريد.
        </p>
      </header>

      <QuizRunner questions={questions} lessonSlug={lesson.slug} quizId={lesson.quizId} />

      <p className="mt-6 text-[11px] leading-relaxed text-ink3">
        هذا اختبار للتأكد من فهمك، وليس امتحانًا رسميًا. نتيجتك محفوظة على هذا الجهاز فقط.
      </p>
    </div>
  );
}
