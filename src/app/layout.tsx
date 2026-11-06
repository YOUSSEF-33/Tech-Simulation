import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/cairo';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: {
    default: 'مَنهَج — تعلّم البرمجة والذكاء الاصطناعي بالفهم',
    template: '%s · مَنهَج',
  },
  description:
    'دروس عربية قصيرة ومحاكاة تفاعلية تساعد طلاب الصف الثاني الثانوي على فهم التشفير والشبكات وتطبيقات الويب.',
  other: { 'content-language': 'ar' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1258a6',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-primary focus:shadow-lg"
        >
          تخطَّ إلى المحتوى
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
