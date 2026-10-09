# Astro migration — 9 October 2026

The active site is now an Astro static build targeting Netlify. Its 35 existing public pages are preserved, with a new 404 page. The 20 news articles and six use cases are produced from content collections and two dynamic route templates. Shared headers, footers, CTAs, cards, FAQ entries, clients, team members, hero slides, testimonials and product modules have one implementation each.

## Cleanup and performance

- Removed the old `landing-page/` output, variant/review pages, Python page generators, exported previews, checkpoint copies, reference screenshots and image-generation experiments from the active project.
- Removed unused legacy landing-page interactions and 397 unused CSS selectors. Consolidated the retained styles into foundation, card, interaction, page and theme files.
- Production media reduced from 343.5 MB in the former assets directory to 13.2 MB, including responsive hero variants. Retained raster images alone dropped from 76.6 MB to about 13 MB after conversion. Screenshot conversions are lossless; photographs use WebP compression.
- Self-hosted the two variable fonts. Bundled only the globe's required geometry functions and load its code/coastline as the section approaches view.
- Kept the static footer mesh and accepted responsive cropping, theme behavior, header links, client destinations and page copy.
- Added canonical URLs, a sitemap, robots.txt, 37 legacy URL redirects and Netlify cache/header configuration.

The original workspace was archived before removal at `/tmp/dipai-before-astro-20261009.tar.gz` (842 MiB). Its gzip integrity and required source files were checked. This backup is outside the deployable project and may be removed by temporary-directory cleanup; copy it elsewhere if long-term retention is needed.

## Verification

`npm run build` validates Astro/TypeScript, the content schemas and every generated local link, anchor, image asset, shared page shell and duplicate HTML ID. It also rejects unused public media. The clean build contains 36 pages and is about 14 MB.

The automated browser suite covers every public page at desktop and mobile widths, missing images and JavaScript failures, horizontal overflow, archive filters and dividers, hero/product tabs, testimonial controls, FAQ anchors, product navigation, client links, theme persistence, smooth continent changes and the stationary footer mesh. The initial migration used a custom mail adapter; it has since been replaced with native Netlify Forms and form transport tests. Browser submission checks use mocks or local rejection and never send email.

Desktop before/after comparisons preserved the page heights and section layouts of the landing page, products, demo, team, contact, FAQ, privacy, both archives and representative articles. The migration was verified locally, not deployed to Netlify. Native form detection and email notifications need to be enabled in Netlify; see [deployment instructions](DEPLOYMENT.md).
