import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function BibleReference({ refText }) {
  if (!refText) return null;
  return (
    <div className="bible-ref my-4 text-sm">
      <div className="uppercase tracking-wide text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
        Bible Reference
      </div>
      <div>{refText}</div>
    </div>
  );
}

export default function NoteRenderer({ title, body, bibleReference, imageUrl }) {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1 className="mb-2">{title}</h1>
      <BibleReference refText={bibleReference} />
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="rounded border max-h-96 object-contain my-4"
          loading="lazy"
        />
      )}
      <div className="markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </div>
    </article>
  );
}
