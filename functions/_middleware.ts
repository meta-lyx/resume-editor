// Send visitors on secondary hostnames to the one public address, pixelpear.io.
//
// Cloudflare Pages also serves the production site at <project>.pages.dev.
// Having the same branded login and payment pages live on a free pages.dev
// address makes reputation scanners (ScamAdviser, IPQS) flag it as possible
// phishing, and it splits search signals between two domains.
//
// Only exact hostnames below are redirected. Preview deployments such as
// abc123.pixel-pear.pages.dev and local dev (localhost / 127.0.0.1) are untouched.

const CANONICAL_HOST = 'pixelpear.io';
const REDIRECT_HOSTS = new Set(['pixel-pear.pages.dev', 'www.pixelpear.io']);

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  if (REDIRECT_HOSTS.has(url.hostname)) {
    url.protocol = 'https:';
    url.hostname = CANONICAL_HOST;
    url.port = '';
    return Response.redirect(url.toString(), 301);
  }

  return next();
};
