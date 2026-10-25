// Runs after `vite build` and `vite build --ssr`. For every public route it writes
// a static HTML file with the rendered page and that page's own <head> tags, so
// search engines and link previews see real content without running JavaScript.
//
// Output (in dist/):
//   index.html, about.html, features.html, ...  prerendered public pages
//   404.html                                     served by Cloudflare Pages for unknown paths
//   app-shell.html                               empty shell for app routes (see public/_redirects)
//   sitemap.xml                                  generated from PRERENDER_ROUTES

import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

installBrowserStubs();

const { render, resolveMetadata, PRERENDER_ROUTES, SITE_URL, SHARE_IMAGE_URL } = await import(
  pathToFileURL(path.join(ssrDir, 'entry-server.js')).href
);

const template = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) {
  throw new Error('dist/index.html has no empty <div id="root"></div>; was prerender already run?');
}

// App routes (dashboard, login, ...) get the untouched shell with noindex.
await writeFile(
  path.join(dist, 'app-shell.html'),
  withHead(template, {
    title: 'PixelPear | AI Resume Optimization',
    description: resolveMetadata('/').description,
    robots: 'noindex, nofollow',
    canonicalUrl: null,
  }),
);

for (const route of PRERENDER_ROUTES) {
  const html = withBody(withHead(template, resolveMetadata(route)), render(route));
  const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
  await writeFile(path.join(dist, file), html);
  console.log(`prerendered ${route} -> dist/${file}`);
}

const notFound = withBody(
  withHead(template, { ...resolveMetadata('/404', true), canonicalUrl: null }),
  render('/__not-found__'),
);
await writeFile(path.join(dist, '404.html'), notFound);
console.log('prerendered 404 -> dist/404.html');

const today = new Date().toISOString().slice(0, 10);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...PRERENDER_ROUTES.map(
    (route) => `  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
  ),
  '</urlset>',
  '',
].join('\n');
await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
console.log(`wrote sitemap.xml with ${PRERENDER_ROUTES.length} URLs`);

await rm(ssrDir, { recursive: true, force: true });

// ---------------------------------------------------------------------------

function withBody(html, rendered) {
  return html.replace('<div id="root"></div>', `<div id="root">${rendered}</div>`);
}

function withHead(html, meta) {
  const e = escapeAttr;
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeText(meta.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${e(meta.description)}">`)
    .replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${e(meta.robots)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${e(meta.title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${e(meta.description)}" />`)
    .replace(/<meta property="og:image" [^>]*>/, `<meta property="og:image" content="${e(SHARE_IMAGE_URL)}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${e(meta.title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${e(meta.description)}" />`)
    .replace(/<meta name="twitter:image" [^>]*>/, `<meta name="twitter:image" content="${e(SHARE_IMAGE_URL)}" />`);

  if (meta.canonicalUrl) {
    out = out
      .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${e(meta.canonicalUrl)}" />`)
      .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${e(meta.canonicalUrl)}" />`);
  } else {
    out = out.replace(/\s*<link rel="canonical"[^>]*>/, '').replace(/\s*<meta property="og:url"[^>]*>/, '');
  }
  return out;
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

// api-client reads localStorage when it loads. Give it an in-memory stand-in.
// Deliberately no fake `window`: libraries such as react-hot-toast treat a
// defined window as a real browser and reach for document.
function installBrowserStubs() {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear(),
    key: (i) => [...storage.keys()][i] ?? null,
    get length() {
      return storage.size;
    },
  };
}
