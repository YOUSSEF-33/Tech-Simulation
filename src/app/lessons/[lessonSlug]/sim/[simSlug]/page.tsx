import { notFound } from 'next/navigation';
import { getLesson, lessons } from '@/content/curriculum';
import { TlsSimulation } from '@/simulations/tls/sim';

export function generateStaticParams() {
  return lessons.map((lesson) => ({ lessonSlug: lesson.slug, simSlug: lesson.sim.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lessonSlug: string; simSlug: string }> }) {
  const { lessonSlug } = await params;
  const lesson = getLesson(lessonSlug);
  return { title: lesson ? lesson.sim.title : 'المحاكاة' };
}

export default async function SimPage({
  params,
}: {
  params: Promise<{ lessonSlug: string; simSlug: string }>;
}) {
  const { lessonSlug, simSlug } = await params;
  const lesson = getLesson(lessonSlug);
  if (!lesson || lesson.sim.slug !== simSlug) notFound();

  return <TlsSimulation lessonSlug={lesson.slug} />;
}
