import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { applyMetadata } from '@/components/site/site-router-effects';
import { resolveMetadata } from '@/lib/seo-metadata';

export function NotFoundPage() {
  const location = useLocation();

  // Runs after SiteRouterEffects, so the 404 title and noindex win.
  useEffect(() => {
    applyMetadata(resolveMetadata(location.pathname, true));
  }, [location.pathname]);

  return (
    <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link to="/">Optimize my resume</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/features">See features</Link>
        </Button>
      </div>
    </div>
  );
}
