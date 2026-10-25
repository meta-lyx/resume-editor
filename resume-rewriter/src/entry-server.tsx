// Build-time entry: renders a route to HTML for scripts/prerender.mjs.
// Never shipped to the browser.
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

export { resolveMetadata, PRERENDER_ROUTES, SITE_URL, SHARE_IMAGE_URL } from './lib/seo-metadata';

export function render(url: string): string {
  const Router = ({ children }: { children: ReactNode }) => (
    <StaticRouter location={url}>{children}</StaticRouter>
  );
  return renderToString(<App Router={Router} />);
}
