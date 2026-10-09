# Launch readiness

Production origin: **https://dipai.no**. This document covers the code audit on 9 October 2026. It is not a deployment confirmation.

## Cookies and analytics

The site currently loads **no analytics, advertising scripts or third-party embeds**. Fonts, maps and photographs are local. External company, LinkedIn and map links navigate to those services only when clicked.

The only application browser storage is `dipai-color-theme`, written when a visitor explicitly chooses light or dark mode. It holds `light` or `dark`, is not sent to the server, and remains until cleared. Footer **Cookie settings** explains it and provides **Use device theme**, which removes the value. The dialog supports keyboard focus, Escape, and returning focus to its trigger. Without JavaScript, the footer link opens the storage section of the privacy policy. There is no automatic consent banner or pretend analytics toggle while tracking is absent.

Hosting infrastructure and mail processors have their own data handling. Recheck the production network/storage inventory after enabling Netlify services, email delivery or any additional integration. The policy currently retains the supplied company legal text, plus an accurate section about this build’s browser storage.

### Choosing analytics later

No provider has been enabled, subscribed to, or added to the browser bundle.

| Option | Fit for Dipai | Tradeoff |
| --- | --- | --- |
| Netlify Web Analytics | Simplest first option for traffic, referrers, popular pages and missing resources on the planned host | Based on server requests; does not directly measure demo-button clicks or successful enquiries |
| Plausible | Useful if marketing needs a small dashboard and enquiry/conversion events | Adds a browser script and a separate subscription; review the selected configuration and privacy notices before enabling |
| GA4 | Consider if Google Ads attribution and complex marketing reporting become a requirement | More tracking configuration, consent management and ongoing administration |

Netlify documents its server-side collection and available metrics in [Web Analytics](https://docs.netlify.com/manage/monitoring/web-analytics/overview/). Plausible describes its cookie-free collection and EU processing in its [data policy](https://plausible.io/data-policy). For GA4 implementation, review [Google’s consent documentation](https://developers.google.com/tag-platform/security/guides/consent) when that option is selected. Check current plan pricing before subscribing.

For future browser analytics, define the exact data and purposes first. Never send names, emails, company names, enquiry text or form payloads as analytics events. If consent is required, block the script and network requests until opt-in, provide equally accessible accept/reject controls, and let visitors withdraw through Cookie settings. A saved theme choice is not analytics consent. Do not silently enable Netlify-injected snippets that bypass the site’s controls.

Norwegian guidance covers cookies **and similar browser-storage technologies**, with narrow exceptions and specific consent requirements. See [Datatilsynet’s guidance](https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/cookies/). Reassess the actual chosen provider/configuration before deployment; a vendor’s “cookieless” label is not itself a determination for every deployment.

## SEO and AI search

- Static HTML exposes article text, headings, evidence, source attribution, links and image descriptions without requiring client rendering.
- Every public page has a unique title, description, dipai.no canonical URL, Open Graph image, and Twitter sharing metadata.
- Shared JSON-LD identifies Dipai, the website, and each page. Article templates add article identity, publisher, image and breadcrumbs; news uses the supplied publication date. No invented ratings, reviews or modification dates.
- Production `robots.txt` allows crawling, excludes the form API and identifies the sitemap. The sitemap includes the 35 public routes, excludes the 404 page and legacy aliases.
- Netlify deploy previews and branch deploys receive `noindex, nofollow` metadata and an `X-Robots-Tag` header; their robots file disallows crawling. `SITE_INDEXING=disabled` provides the same build setting outside Netlify. Local development also uses noindex. These are indexing controls, not access restrictions.
- `/about-us/` and `/about-us.html` redirect to `/team/`; navigation links use the existing Team destination. Legacy `.html` routes also redirect.
- `scripts/validate-seo.mjs` checks generated canonical URLs, titles, social assets, structured data, sitemap coverage and production/preview indexing settings during the build.

AI-search work uses the same crawlability and factual-content foundation as SEO. Google explicitly says there are no special AI files or additional schema requirements for its AI search features. Inclusion is not guaranteed. See [Google’s AI search guidance](https://developers.google.com/search/docs/appearance/ai-features).

After deployment, set dipai.no as Netlify’s primary domain, redirect www/Netlify aliases to it, verify Google Search Console and Bing Webmaster Tools ownership, and submit `https://dipai.no/sitemap.xml`. Review old production URLs against the new routes before switching DNS; generated `.html` redirects do not constitute an inventory of every historic CMS URL. No search-engine accounts or DNS settings were changed during this audit.

## Images

News and team source images live in `src/assets/`, allowing Astro to generate responsive WebP files at build time. Cards and article images use the shared `ResponsiveImage` component, with accurate dimensions, explicit display sizes and lazy loading below the fold. The first hero image remains prioritised; later hero slides load on demand. Existing lossless UI screenshots and full-size case evidence remain readable. SVG brand logos remain vectors and now have intrinsic dimensions.

The build generates a 1200 × 630 PNG social card from Dipai’s existing logo. Article previews use article-specific images when available. The public page does not download social-preview files just because they appear in metadata.

## Accessibility verification

Automated checks use axe-core against WCAG 2 A/AA, 2.1 A/AA, 2.2 AA and best-practice rules, in both themes on desktop and mobile. Browser regression tests cover the settings dialog, keyboard navigation, skip link, FAQs, form success/failure states, reduced-motion behaviour, carousels and image loading. The initial scan found light-mode contrast issues on the globe, Products introduction and board introduction; these colours were corrected. Mobile carousel targets, article-figure semantics and mobile-menu focus handling were also corrected. Pause controls were added for moving client logos, customer quotes and journey particles. The error page now has a proper main heading.

Run:

```sh
npm run build
npm test
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome npm run test:browser
npm run format:check
```

Verification results: production and Netlify preview builds pass their link, asset and SEO checks. All 24 browser regression tests passed on desktop and mobile. After including the error page, all four accessibility sweeps passed: 36 pages × two themes × two viewport sizes, with no reported axe violations. The settings-dialog check also confirms an empty initial cookie/storage inventory and no third-party browser requests. Enquiry-handler tests pass without sending mail.

Automated results are not a WCAG conformance certification. Complete a real screen-reader and keyboard review on the target browsers, plus a live-site check after Netlify configuration. W3C explains the scope of automated tools in its [evaluation tools overview](https://www.w3.org/WAI/test-evaluate/tools/).

## Remaining deployment decisions

- Select/enable analytics only if needed; the website can launch with it disabled.
- Configure and verify the existing email delivery integration before relying on demo/contact submissions.
- Confirm the production privacy information reflects the selected hosting and mail services and actual retention practices.
- Finish primary-domain redirects, old-URL mapping, search verification and the production accessibility/network checks described above.
