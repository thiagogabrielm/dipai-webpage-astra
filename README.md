# Dipai website

Astro static website prepared for Netlify. Shared Astro layouts render the header, footer, CTA, article cards, clients and page components. News and use-case articles are built from validated JSON content, with no client-side content fetch or framework hydration.

## Work locally

Use Node 22.12 or newer (the checked version is pinned in `.nvmrc`).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:48767/. The dev server supports the enquiry endpoint and redirects the previous `.html` URLs. Optional local environment values can be supplied with `node --env-file=.env node_modules/astro/bin/astro.mjs dev --port 48767` after `npm run predev`.

```sh
npm run build       # Responsive images, type/content checks, static build, link/asset/SEO audit
npm run preview     # Serve dist/ plus redirects and the enquiry API on port 48767
npm test            # Isolated enquiry-handler tests; never sends email
npm run test:browser # Desktop/mobile site checks against the production build
npm run format:check
```

Before the browser suite, run `npx playwright install chromium` once. To use an existing Chrome installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its path. The browser suite mocks every form submission.

## Where to edit

| Content or behavior | Source |
| --- | --- |
| News posts | `src/data/news.json` |
| Use-case articles | `src/data/use-cases.json` |
| Hero slides and KPIs | `src/data/hero-slides.json` |
| Product overview tabs / product modules | `src/data/platform.js`, `src/data/modules.json` |
| Client logos and website links | `src/data/clients.json` |
| Testimonials / team / FAQs | `src/data/testimonials.json`, `team.json`, `faqs.json` |
| Legal copy / browser storage disclosure | `src/data/privacy-policy.json`, `src/pages/privacy-policy.astro` |
| Header, footer, CTA and shared components | `src/components/` |
| Article templates | `src/pages/news/[slug].astro`, `src/pages/use-cases/[slug].astro` |
| Shared page shell and metadata | `src/layouts/BaseLayout.astro` |
| Styles / progressive enhancements | `src/styles/`, `src/scripts/` |
| Responsive news and team images | `src/assets/news/`, `src/assets/team/` |
| Hero variants, lossless screenshots and SVGs | `public/assets/` |
| Email delivery | `netlify/functions/enquiries.mjs`, `server/enquiries.mjs` |

Generated files belong in `dist/`, `.astro/` and `src/generated/`; do not edit them. There is no separate HTML-page generator or duplicated legacy site to maintain.

See [content editing](docs/CONTENT.md), [Netlify deployment](docs/DEPLOYMENT.md), [launch readiness](docs/READINESS.md) and [migration notes](docs/MIGRATION.md).
