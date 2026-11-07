import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BLOG_POSTS, formatPostDate, getBlogPost } from '@/lib/blog';
import { SHARE_IMAGE_URL, SITE_URL } from '@/lib/seo-metadata';
import { NotFoundPage } from '@/pages/not-found-page';

export function BlogPostPage() {
  const { slug = '' } = useParams();
  const post = getBlogPost(slug);
  if (!post) return <NotFoundPage />;

  const url = `${SITE_URL}/blog/${post.slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: url,
    url,
    image: SHARE_IMAGE_URL,
    author: { '@type': 'Organization', name: 'PixelPear', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'PixelPear',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/pixelpear-logo.svg` },
    },
  };
  const morePosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped so post text can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <article className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All guides
        </Link>
        <header className="mt-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{post.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            {post.updated && (
              <>
                {' '}· Updated <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
              </>
            )}{' '}
            · {post.readingMinutes} min read
          </p>
        </header>

        <div
          className="prose prose-neutral dark:prose-invert mt-10 max-w-none prose-headings:scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        <aside className="mt-14 rounded-2xl border border-border bg-muted/40 p-6 md:p-8">
          <h2 className="text-xl font-semibold">Tailor your resume to a job in minutes</h2>
          <p className="mt-2 text-muted-foreground">
            Upload your resume and paste the job description. PixelPear matches keywords, rewrites bullets around
            the role, and exports an ATS-friendly PDF.
          </p>
          <Button asChild className="mt-5">
            <Link to="/">Optimize my resume</Link>
          </Button>
        </aside>

        {morePosts.length > 0 && (
          <nav className="mt-14" aria-label="More guides">
            <h2 className="text-lg font-semibold">More guides</h2>
            <ul className="mt-4 space-y-3">
              {morePosts.map((p) => (
                <li key={p.slug}>
                  <Link to={`/blog/${p.slug}`} className="text-primary hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </article>
    </div>
  );
}
