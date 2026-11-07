import { marked } from 'marked';

// Blog posts live in src/content/blog/<slug>.md. Each file starts with a header:
//
// ---
// title: How to Tailor Your Resume to a Job Description
// description: One or two sentences for search results and link previews (under ~160 characters).
// date: 2026-11-07
// updated: 2026-11-20        (optional)
// ---
//
// The file name is the URL: src/content/blog/tailor-resume.md -> /blog/tailor-resume.
// Posts are prerendered at build time (scripts/prerender.mjs) and listed in the sitemap.

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  html: string;
  readingMinutes: number;
};

const files = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parse(path: string, source: string): BlogPost {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  const match = source.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Blog post ${slug} is missing its --- header block`);

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':');
    // Values may be wrapped in quotes (needed when they contain a colon).
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1');
  }
  for (const key of ['title', 'description', 'date']) {
    if (!meta[key]) throw new Error(`Blog post ${slug} is missing "${key}" in its header`);
  }

  const body = match[2];
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: meta.title,
    description: meta.description,
    date: meta.date,
    updated: meta.updated || undefined,
    html: marked.parse(body, { async: false, gfm: true }) as string,
    readingMinutes: Math.max(1, Math.round(words / 230)),
  };
}

export const BLOG_POSTS: BlogPost[] = Object.entries(files)
  .map(([path, source]) => parse(path, source))
  .sort((a, b) => b.date.localeCompare(a.date));

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function formatPostDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
