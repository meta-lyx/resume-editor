import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BLOG_POSTS, formatPostDate } from '@/lib/blog';

export function BlogIndexPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <header className="mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Resume &amp; Job Search Guides</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Practical guides to tailoring your resume, getting through applicant tracking systems, and presenting
          your experience so recruiters notice it.
        </p>
      </header>

      <ul className="mx-auto mt-12 max-w-3xl divide-y divide-border">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug} className="py-8 first:pt-0">
            <article>
              <p className="text-sm text-muted-foreground">
                <time dateTime={post.date}>{formatPostDate(post.date)}</time> · {post.readingMinutes} min read
              </p>
              <h2 className="mt-2 text-xl md:text-2xl font-semibold">
                <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-muted-foreground">{post.description}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                aria-label={`Read: ${post.title}`}
              >
                Read the guide <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
