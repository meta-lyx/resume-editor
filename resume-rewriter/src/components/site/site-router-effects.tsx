import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { resolveMetadata, type ResolvedMetadata, SHARE_IMAGE_URL } from '@/lib/seo-metadata';

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element!.setAttribute(name, value));
}

export function applyMetadata(metadata: ResolvedMetadata) {
  document.title = metadata.title;
  upsertMeta('meta[name="description"]', { name: 'description', content: metadata.description });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: metadata.robots });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: metadata.title });
  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: metadata.description,
  });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: metadata.canonicalUrl });
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: SHARE_IMAGE_URL });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: metadata.title });
  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: metadata.description,
  });

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = metadata.canonicalUrl;
}

const GA_MEASUREMENT_ID = 'G-GRHXEYN0RR';

function trackPageView(path: string) {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || GA_MEASUREMENT_ID;
  if (!measurementId) return;

  if (typeof window.gtag !== 'function') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: unknown[]) => window.dataLayer.push(args);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false,
      anonymize_ip: true,
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
  });
}

export function SiteRouterEffects() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    applyMetadata(resolveMetadata(location.pathname));
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
}
