import type { Block } from '@/content/types';
import { Diagram } from './lesson-diagrams';

const CALLOUT_STYLES = {
  info: { box: 'border-[#cfe0f7] bg-tint/70', title: 'text-primary', icon: 'ℹ' },
  tip: { box: 'border-[#bfe4da] bg-[#e9f7f3]', title: 'text-teal', icon: '◆' },
  warning: { box: 'border-[#f0dcb8] bg-[#fdf6e9]', title: 'text-amber', icon: '!' },
} as const;

export function LessonBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-ar max-w-[62ch] text-[1.02rem]">
      {blocks.map((block, i) => {
        const key = `${block.kind}-${i}`;

        if (block.kind === 'paragraph') {
          return <p key={key}>{block.text}</p>;
        }

        if (block.kind === 'heading') {
          return (
            <h2 key={key} id={block.id}>
              {block.text}
            </h2>
          );
        }

        if (block.kind === 'list') {
          const List = block.ordered ? 'ol' : 'ul';
          return (
            <List key={key}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </List>
          );
        }

        if (block.kind === 'callout') {
          const style = CALLOUT_STYLES[block.tone];
          return (
            <aside key={key} className={`my-5 rounded-2xl border p-4 ${style.box}`}>
              <p className={`mb-1 flex items-center gap-2 text-sm font-extrabold ${style.title}`}>
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-white/70 text-[11px]"
                >
                  {style.icon}
                </span>
                {block.title}
              </p>
              <p className="my-0 text-[0.97rem] leading-relaxed text-ink2">{block.text}</p>
            </aside>
          );
        }

        if (block.kind === 'diagram') {
          return <Diagram key={key} id={block.id} caption={block.caption} />;
        }

        if (block.kind === 'code') {
          return (
            <figure key={key} className="my-5">
              <pre
                dir="ltr"
                className="ltr overflow-x-auto rounded-xl border border-line bg-surface2 p-3 text-[13px] leading-6"
              >
                <code>{block.code}</code>
              </pre>
              {block.caption ? <figcaption className="mt-2 text-xs text-ink3">{block.caption}</figcaption> : null}
            </figure>
          );
        }

        return (
          <details
            key={key}
            className="group my-5 rounded-2xl border border-line bg-surface p-4 open:bg-surface2/50"
          >
            <summary className="cursor-pointer list-none text-sm font-bold text-primary marker:content-none">
              <span className="me-2 inline-block text-ink3" aria-hidden="true">
                ؟
              </span>
              سؤال سريع: {block.question}
              <span className="ms-2 text-xs font-normal text-ink3">(اضغط للكشف)</span>
            </summary>
            <p className="mt-2 mb-0 text-[0.97rem] text-ink2">{block.answer}</p>
          </details>
        );
      })}
    </div>
  );
}
