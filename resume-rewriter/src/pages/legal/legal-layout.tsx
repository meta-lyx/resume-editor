import type { ReactNode } from 'react';

type LegalLayoutProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl">
        <h1>{title}</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
        {children}
      </article>
    </div>
  );
}
