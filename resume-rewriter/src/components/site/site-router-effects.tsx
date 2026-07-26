import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://pixelpear.io';
const DEFAULT_DESCRIPTION =
  'Tailor your resume to every job with AI-powered ATS keyword optimization and professional resume templates.';

type PageMetadata = {
  title: string;
  description: string;
  index?: boolean;
  canonicalPath?: string;
};

const PAGE_METADATA: Record<string, PageMetadata> = {
  '/': {
    title: 'AI Resume Optimizer & ATS Resume Builder | PixelPear',
    description:
      'Create a job-specific, ATS-friendly resume with AI. Match keywords, strengthen achievements, and export a professional resume with PixelPear.',
  },
  '/home': {
    title: 'About PixelPear | AI Resume Optimization',
    description:
      'Learn how PixelPear helps job seekers tailor resumes to job descriptions, improve ATS compatibility, and present stronger achievements.',
  },
  '/features': {
    title: 'AI Resume Optimization Features | PixelPear',
    description:
      'Explore ATS optimization, job matching, achievement rewriting, language polishing, LinkedIn guidance, and professional resume templates.',
  },
  '/pricing': {
    title: 'AI Resume Optimizer Pricing | PixelPear',
    description:
      'Compare PixelPear one-time pricing plans for AI resume tailoring, ATS optimization, job matching, and professional resume templates.',
  },
  '/templates': {
    title: 'Professional ATS Resume Templates | PixelPear',
    description:
      'Choose a professional, ATS-friendly resume template designed to present your skills and experience clearly.',
  },
  '/login': {
    title: 'Log In | PixelPear',
    description: 'Log in to PixelPear to access your AI-optimized resumes.',
    index: false,
  },
  '/register': {
    title: 'Create an Account | PixelPear',
    description: 'Create your PixelPear account and start optimizing your resume.',
    index: false,
  },
  '/history': {
    title: 'Resume History | PixelPear',
    description: 'Review the resume optimizations saved on your device.',
    index: false,
  },
};

const PRIVATE_PATH_PREFIXES = [
  '/auth/',
  '/dashboard',
  '/profile',
  '/subscription',
  '/optimize/',
  '/my-resumes',
];

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => element!.setAttribute(name, value));
}

function updateMetadata(pathname: string) {
  const metadata = PAGE_METADATA[pathname] ?? {
    title: 'PixelPear | AI Resume Optimization',
    description: DEFAULT_DESCRIPTION,
    index: false,
  };
  const shouldIndex =
    metadata.index !== false &&
    !PRIVATE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const canonicalPath = metadata.canonicalPath ?? (pathname === '/' ? '/' : pathname);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  document.title = metadata.title;
  upsertMeta('meta[name="description"]', { name: 'description', content: metadata.description });
  upsertMeta('meta[name="robots"]', {
    name: 'robots',
    content: shouldIndex
      ? 'index, follow, max-image-preview:large'
      : 'noindex, nofollow',
  });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: metadata.title });
  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: metadata.description,
  });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
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
  canonical.href = canonicalUrl;
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
    updateMetadata(location.pathname);
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
}
