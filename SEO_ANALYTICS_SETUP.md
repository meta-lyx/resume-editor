# PixelPear SEO and Analytics rollout

## What is implemented

- Route-specific titles, descriptions, canonical URLs, robots directives, and social metadata
- `robots.txt` with a sitemap declaration and private/app routes excluded
- XML sitemap for the public marketing pages
- Organization, website, and software application structured data
- GA4 loading and single-page-app page-view tracking through `VITE_GA_MEASUREMENT_ID`
- Automatic scroll-to-top behavior on every route change

## One-time Google setup

### 1. Google Search Console

1. Open https://search.google.com/search-console/
2. Add a **Domain** property for `pixelpear.io`.
3. Add Google's TXT verification record to the domain's Cloudflare DNS.
4. Submit `https://pixelpear.io/sitemap.xml` under **Sitemaps**.
5. Use **URL inspection** to request indexing for:
   - `https://pixelpear.io/`
   - `https://pixelpear.io/features`
   - `https://pixelpear.io/pricing`
   - `https://pixelpear.io/templates`

Domain verification is preferable to an HTML tag because it covers every protocol and subdomain.

### 2. Google Analytics 4

1. Open https://analytics.google.com/.
2. Create a GA4 property named **PixelPear**.
3. Create a Web data stream for `https://pixelpear.io`.
4. Copy its measurement ID (`G-XXXXXXXXXX`).
5. In GitHub, open **Settings → Secrets and variables → Actions → Variables**.
6. Create `VITE_GA_MEASUREMENT_ID` with that measurement ID.
7. Redeploy the site. Then confirm visits in **Reports → Realtime**.

Analytics dashboard: https://analytics.google.com/

## Ongoing SEO strategy

1. **Technical health:** monitor Search Console indexing, Core Web Vitals, mobile usability, broken links, and sitemap errors monthly.
2. **Search-focused content:** publish useful pages around high-intent topics such as ATS resume optimization, tailoring a resume to a job description, resume keyword matching, and role-specific resume examples.
3. **Page quality:** give each topic a unique URL, title, H1, examples, FAQs, and internal links to Features, Templates, Pricing, and the resume optimizer.
4. **Authority:** earn relevant links through career coaches, university career centers, recruiting communities, HR publications, and useful free tools or original research.
5. **Measurement:** track organic landing pages, optimizer starts, registrations, and purchases. Review queries with impressions but low click-through rates and improve their titles and descriptions.

Avoid mass-producing thin AI articles or buying links; both can reduce search visibility rather than improve it.
