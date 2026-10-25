// Single source of truth for page titles, descriptions and indexing rules.
// Used in the browser by SiteRouterEffects and at build time by scripts/prerender.mjs.

export const SITE_URL = 'https://pixelpear.io';
export const SHARE_IMAGE_URL = `${SITE_URL}/images/og-image.png`;

const DEFAULT_DESCRIPTION =
  'Tailor your resume to every job with AI-powered ATS keyword optimization and professional resume templates.';

export type PageMetadata = {
  title: string;
  description: string;
  index?: boolean;
  canonicalPath?: string;
};

export const PAGE_METADATA: Record<string, PageMetadata> = {
  '/': {
    title: 'AI Resume Optimizer & ATS Resume Builder | PixelPear',
    description:
      'Create a job-specific, ATS-friendly resume with AI. Match keywords, strengthen achievements, and export a professional resume with PixelPear.',
  },
  '/about': {
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
  '/privacy': {
    title: 'Privacy Policy | PixelPear',
    description:
      'How PixelPear collects, uses, stores and shares your account details and resume content, and how to request deletion.',
  },
  '/terms': {
    title: 'Terms of Use | PixelPear',
    description:
      'The terms that apply when you use PixelPear to optimize your resume, including accounts, payments and acceptable use.',
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

// Shown for any path that has no route.
export const NOT_FOUND_METADATA: PageMetadata = {
  title: 'Page Not Found | PixelPear',
  description: DEFAULT_DESCRIPTION,
  index: false,
};

// App routes: real pages, but not for search engines.
export const PRIVATE_PATH_PREFIXES = [
  '/auth/',
  '/dashboard',
  '/profile',
  '/subscription',
  '/optimize/',
  '/my-resumes',
];

const FALLBACK_METADATA: PageMetadata = {
  title: 'PixelPear | AI Resume Optimization',
  description: DEFAULT_DESCRIPTION,
  index: false,
};

export type ResolvedMetadata = {
  title: string;
  description: string;
  robots: string;
  canonicalUrl: string;
};

export function resolveMetadata(pathname: string, notFound = false): ResolvedMetadata {
  const metadata = notFound ? NOT_FOUND_METADATA : PAGE_METADATA[pathname] ?? FALLBACK_METADATA;
  const shouldIndex =
    metadata.index !== false &&
    !PRIVATE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const canonicalPath = metadata.canonicalPath ?? pathname;

  return {
    title: metadata.title,
    description: metadata.description,
    robots: shouldIndex ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
    canonicalUrl: `${SITE_URL}${canonicalPath}`,
  };
}

// Public pages that get static HTML at build time and belong in the sitemap.
export const PRERENDER_ROUTES = Object.entries(PAGE_METADATA)
  .filter(([, meta]) => meta.index !== false)
  .map(([path]) => path);
