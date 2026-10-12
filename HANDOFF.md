# Dipai website agent handoff

Prepared on 9 October 2026 for the next agent working with Thiago. The site is an Astro static build, with a temporary Netlify deployment under review. Continue from the current code and accepted design. The next work is guided by the user's requests; do not restart the migration or revisit settled design choices without a reason.

## User instructions to preserve

**Only push to GitHub when the user explicitly asks.** The latest instruction was: “only push to git hub when i ask you to do it.” This supersedes earlier push requests and the previous agent's practice of pushing completed changes. Keep new work local by default. A passing build, a request to implement something, or the existence of a connected Netlify project is not a request to push.

- Use the temporary Netlify URL for testing. Do not connect `dipai.no`, change its DNS, or perform the public launch until the user asks.
- Keep both forms' notification recipients at **thiago.g.monteiro@dipai.no** during testing. Recipient rules live in Netlify, not in public page code.
- **Netlify Web Analytics** is the chosen analytics service for now. Do not introduce Plausible, Google Analytics, browser conversion tracking, or Real User Monitoring without a new request.
- Preserve the current page content and styling when working on infrastructure. Use shared components and data rather than duplicating page implementations.
- Keep progress updates concise. Complete routine local work without repeated permission questions; distinguish local code changes from dashboard configuration and live verification.

This handoff is a local, uncommitted addition. No commit or push was requested for it.

## Current state

| Area | State at handoff |
| --- | --- |
| Workspace | `/home/thiagogm/DipaiWebPageAstra` |
| GitHub repository | `git@github.com:thiagogabrielm/dipai-webpage-astra.git` |
| Branch | `main` |
| Latest commit | `3d61c37` — Describe Netlify Web Analytics and document activation |
| Git state before this document | Clean; local `main` matched the `origin/main` tracking ref |
| Local site | Astro development server at `http://127.0.0.1:48767/`; browser was on `/products/` |
| Hosting | Netlify, temporary project URL used by the user; exact URL/project ID has not been supplied in this conversation |
| Contact and demo forms | Native Netlify Forms implemented; the user confirmed notifications are working |
| Analytics | Netlify Web Analytics selected; disclosure changes pushed previously, dashboard activation and traffic not yet confirmed |
| Final domain | `dipai.no` planned, domain cutover intentionally deferred |

No authenticated Netlify tool connection was available in this session. Do not assume access to project settings, deployment status, billing or notification rules. Ask for the temporary site URL when needed for a live check; do not ask the user to paste account passwords or private API keys.

Recent commits already pushed before the no-push instruction:

| Commit | Change |
| --- | --- |
| `3d61c37` | Netlify analytics wording in Cookie settings and privacy policy; activation documentation |
| `4aa88c4` | Native Netlify contact/demo forms; removed unused Resend endpoint and adapters |
| `ab69476` | Compact accessibility pause controls, launch-readiness work and landing-page border correction |
| `4a0fca0` | Initial repository commit |

## Run and verify locally

Use Node **22.22.0** from `.nvmrc`; `package.json` requires at least 22.12. The project currently uses Astro 7.3.8, vanilla browser JavaScript and `d3-geo`. There is no React app or Astro server adapter to configure.

```sh
cd /home/thiagogm/DipaiWebPageAstra
npm ci
npm run dev
```

Use the existing server if port 48767 is occupied. Do not accidentally start a second server on another port and leave the in-app browser showing stale output. After changing the local server integration, a full dev-server restart may be necessary; this was required during the forms migration.

```sh
npm run build
npm test
npm run format:check
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome npm run test:browser
```

The build runs media preparation, Astro/TypeScript checks, static generation, legacy redirect generation, link/asset validation and SEO validation. The current output is **35 HTML pages**, including the 404 page, with **38 legacy redirects**. These counts change when content is added.

Playwright serves the built `dist/` on port **48768**. Build before running browser tests. Its projects cover desktop at 1440 × 1000 and mobile at 390 × 844. Use installed Chrome at the path above, or install Playwright Chromium with `npx playwright install chromium` if needed. Chrome required an execution approval outside the sandbox in this environment.

For a manual production preview alongside the dev server:

```sh
PORT=48768 npm run preview
```

The local dev and preview servers intentionally reject form POSTs and send no email. This is expected behavior, not a broken Netlify integration.

## Source map

| What to change | Source |
| --- | --- |
| Page shell, common metadata and JSON-LD | `src/layouts/BaseLayout.astro`, `src/lib/seo.ts` |
| Landing page composition | `src/pages/index.astro`, `src/components/home/` |
| Header, footer and closing CTA | `src/components/Header.astro`, `Footer.astro`, `CTA.astro` |
| Shared footer mesh | `src/scripts/footer-network.js`, relevant rules in `src/styles/theme.css` |
| News posts and article template | `src/data/news.json`, `src/pages/news/[slug].astro` |
| Use cases and article template | `src/data/use-cases.json`, `src/pages/use-cases/[slug].astro` |
| Content validation | `src/content.config.ts`, `src/lib/content.ts` |
| Archive filtering | `src/scripts/filters.js`, news/use-case archive pages |
| Hero slides and KPI copy | `src/data/hero-slides.json`, `src/scripts/hero-vessels.js` |
| Landing product overview | `src/data/platform.js`, `src/components/home/Platform.astro`, `src/scripts/home.js` |
| Products page modules | `src/data/modules.json`, `src/pages/products.astro`, `src/components/ProductExplorer.astro` |
| Client logos and website links | `src/data/clients.json`, `src/components/ClientLogo.astro`, `Clients.astro` |
| Team, testimonials and FAQs | Corresponding JSON files in `src/data/` and shared components |
| Globe and continent controls | `src/components/home/Fleet.astro`, `src/scripts/globe.js`, lazy import in `src/scripts/home.js` |
| Pause controls | `src/components/MotionControl.astro`, `src/scripts/motion-control.js` |
| Contact and demo forms | `src/pages/contact.astro`, `src/pages/book-demo.astro`, `src/scripts/enquiry-form.js` |
| Cookie settings and theme storage | `src/components/CookieSettings.astro`, `src/scripts/cookie-settings.js`, `theme.js` |
| Privacy policy | `src/data/privacy-policy.json`, `src/pages/privacy-policy.astro` |
| Styling | `src/styles/site.css` imports foundation, cards, interactions, pages, theme, fonts and cookie-settings styles |
| Build and hosting configuration | `astro.config.mjs`, `netlify.toml`, `scripts/` |
| Local servers | `server/dev-integration.mjs`, `server/serve.mjs` |

News and use-case articles use shared templates, not individually maintained HTML files. There are currently 19 news posts and six use cases. Add an entry to the appropriate JSON file and its media; the build creates the article route, archive entries, redirects and sitemap entries. Follow [content editing](docs/CONTENT.md) for the schema and image conventions.

News and team source images belong in `src/assets/`, rendered through `ResponsiveImage.astro`. Hero variants, vector logos and lossless product/use-case screenshots are under `public/assets/`. The build rejects unreferenced public media. Keep screenshots readable and remove obsolete media when replacing it.

Do not edit generated files in `dist/`, `.astro/` or `src/generated/`. Dependencies, generated output, `.netlify/`, environment files and browser reports are ignored by Git. `.env.example` is tracked.

## Design and behavior to preserve

- The CTA and footer share a continuous background with a static node/mesh illustration. CTA backgrounds must not cover the mesh. Footer content sits inside a translucent bordered panel.
- The mesh stays stationary. Narrow screens crop the same scene instead of squeezing nodes together. Its left side appears closer and the right side recedes; both bottom edges have visible detail. Retain the current accepted rendering after the earlier design experiments and revert request.
- The shared closing treatment applies across the landing page, products, archives, contact, team, FAQ, demo and article pages. News article related content uses `data-footer-network-section`; privacy uses the footer-only version.
- Section dividers should span the viewport where established. Preserve the CTA divider when archive filtering changes height, and avoid reintroducing an extra inset border between landing-page news and FAQ.
- Globe continent selection eases between positions. Keep the lazy loading and `vite.optimizeDeps.include: ['d3-geo']` configuration; the latter fixed a dev-time dependency-loading failure.
- Pause controls are compact neutral icon buttons inspired by the hero control. Do not restore large text buttons or use the yellow CTA treatment for them. Preserve accessible names, pressed state, keyboard behavior and reduced-motion handling.
- Innovation Norway is excluded from the landing ribbon using `ribbon: false`, but remains in the demo logo grid. Both logo displays use the client website links from the shared JSON.
- Partners and Awards were removed from the header Company dropdown. This request did not remove the Partners link from the footer.
- Products uses `/assets/products/vesselgpt-current-v2.webp` for VesselGPT. Preserve the current screenshot and sensor-pill sizing. An earlier standalone emission section was removed; on 9 October 2026 the user added an Emissions module (after Consumption) to the product explorer instead.
- Preserve the current editorial copy. Hero KPIs are offshore **40%**, cruise **7%**, wellboat **78%**, and bulk carrier **4%**; their exact titles and explanatory text are in `hero-slides.json`.

Old browser comments reference `navy-variant.html`, `products.html` and other `.html` URLs. They are legacy aliases. Edit Astro sources and use the current clean routes such as `/` and `/products/`; do not recreate the old standalone pages.

## Netlify deployment and indexing

`netlify.toml` specifies `npm run build`, publish directory `dist`, Node 22, security headers and asset caching. The site is static; native Forms does not require a custom Function.

Keep the testing configuration as follows in the Netlify build environment:

```dotenv
SITE_URL=https://ACTUAL-PROJECT.netlify.app
SITE_INDEXING=disabled
```

The hostname above is a placeholder; use the actual project origin. The exact live environment values have not been inspected. `astro.config.mjs` falls back to `https://dipai.no`, so verify `SITE_URL` rather than assuming the temporary hostname is configured. `SITE_INDEXING=disabled` generates noindex metadata, disallowing robots rules and an `X-Robots-Tag` build output. Netlify non-production contexts also receive noindex. Indexing controls do not restrict access to the site.

Netlify calls the main-branch deployment the production context even when it only uses a temporary `netlify.app` address. Do not confuse that term with authorization to launch `dipai.no`.

Legacy redirects are generated by `scripts/finalize-build.mjs`; `/about-us/` and `/about-us.html` point to `/team/`. Canonical URLs, social images, structured data and the sitemap are generated centrally. Keep dates, claims and evidence accurate; no special AI-search files were added or promised.

At the eventual authorized launch, configure the custom domain and aliases, set `SITE_URL=https://dipai.no`, remove `SITE_INDEXING=disabled`, verify historical public URLs and search ownership, and deploy. None of those launch actions is authorized by this handoff.

## Forms and analytics

### Native Netlify Forms

Both forms are in the generated static HTML with unique names, `data-netlify="true"`, hidden `form-name` fields and the `website` honeypot. JavaScript posts URL-encoded data to `/`, retains input on errors and shows/focuses the existing confirmation only after a successful response. Native submission also works without JavaScript.

The helper captures `FormData` before disabling inputs; preserve that order. Netlify responses are HTML, so do not reintroduce the old API's JSON-success expectation. Resend, `/api/enquiries`, custom email Functions and their credentials were removed in `4aa88c4`.

The user reported that notification delivery works. The requested testing recipient for both forms is **thiago.g.monteiro@dipai.no**. Manage recipients under Netlify Forms submission notifications, never in browser code. Recheck form detection after introducing new forms: Netlify detects them during a deploy with detection enabled. Do not send additional live test emails unless the user requests that test.

Before launch, confirm the desired final destinations with the user; deployment notes currently suggest `support@dipai.no` for contact and `contact@dipai.no` for demo. Do not replace the test inbox prematurely.

### Netlify Web Analytics

The user chose server-side Netlify Web Analytics. The latest commit updated Cookie settings and privacy wording, plus activation instructions. It did **not** enable the service in the dashboard, and activation has not been confirmed.

The remaining account step is **Analytics & metrics → Analytics → Enable Analytics**. Validate traffic on the temporary hosted URL after an hourly dashboard update. No browser script, API key, environment variable or custom event code is needed. Page traffic appears in Analytics; recorded enquiries remain in Forms. Do not claim click-to-enquiry attribution exists.

The only application browser storage is the explicitly selected colour preference, `dipai-color-theme`. “Use default theme” removes it, and the site then falls back to dark mode (the default regardless of device setting). No advertising scripts, browser analytics scripts or third-party embeds are included. This does not mean hosting logs contain no visitor data: the privacy page explicitly describes IP-based visitor counts.

See [deployment instructions](docs/DEPLOYMENT.md) and [launch readiness](docs/READINESS.md) for detailed setup and official sources.

## Verification record

The following checks passed during the previous implementation turns, before this documentation-only handoff:

| Scope | Result and limits |
| --- | --- |
| Latest analytics disclosure change | Build, format checks and cookie-dialog browser tests passed on desktop/mobile; dialog accessibility, keyboard behavior and absence of browser tracker requests were checked |
| Netlify Forms migration | `npm test`, build and format checks passed; six desktop/mobile browser cases covered mocked success/failure, native submission and local rejection. Native cases were rerun after fixing their viewport configuration |
| Local development form guard | After restarting Astro, a root POST returned 503 instead of falsely serving the homepage as a successful submission |
| Earlier launch-readiness audit | The recorded audit passed 24 browser regression cases and accessibility sweeps across 36 pages, two themes and two viewport sizes with no reported axe violations |
| Live email notifications | User confirmed working; automated tests do not send email |

The earlier full accessibility sweep was not rerun after every later wording change. Do not describe it as a fresh certification. Run checks appropriate to the next change. Browser tests live in `tests/browser/site.spec.ts` and `readiness.spec.ts`; form transport checks are in `tests/netlify-forms.test.mjs`.

The in-app browser tool previously failed with “Browser security unavailable outside node repl”; standalone local Playwright/Chrome was used for verification. Treat this as an environment issue if it recurs, not a reason to alter site code.

## Next work and unresolved account details

There is no unfinished local implementation assigned beyond this handoff. If the user resumes launch preparation, prioritize these items:

1. Obtain the temporary Netlify URL when a live check is needed. Confirm the deployed commit, canonical origin and noindex configuration.
2. Confirm whether the user enabled Netlify Web Analytics and whether traffic appears. Do not assume the disclosure commit activated it.
3. Keep the working test forms and current recipient rules. Confirm final recipients and actual retention/privacy arrangements before the public launch.
4. Complete final manual keyboard/screen-reader and hosted-site checks, then domain/search setup only when requested.

Start a new session by reading this file and `README.md`, checking `git status`, and following the user's next task. **Do not push automatically.**

## Supporting documents

- [README](README.md): commands and main source locations.
- [Content editing](docs/CONTENT.md): news/use-case schemas and image workflow.
- [Netlify deployment](docs/DEPLOYMENT.md): temporary-domain setup, Forms and Analytics.
- [Launch readiness](docs/READINESS.md): cookies, SEO, images and accessibility.
- [Migration history](docs/MIGRATION.md): earlier Astro conversion and cleanup. Its original “not deployed” wording describes that migration stage; the subsequent user-confirmed hosted forms are newer evidence.

The migration notes mention `/tmp/dipai-before-astro-20261009.tar.gz` as an old source backup. It is outside the repository and temporary storage is not durable; verify its existence before relying on it. Old clipboard reference images under `/tmp` are not canonical production assets.

## Colour tokens (9 October 2026, uncommitted)

`--slate` is now `#2c4a61`. New tokens: `--yellow-hover: #e6c100` (convention: hover on yellow is darker) and `--focus: #538bb7`. Hard-coded repeats of `--yellow`, `--navy`, `--slate` (old and new values), `--blue`, `--paper` and `--focus` were replaced with variables (alpha variants via `color-mix`); JS/markup SVG colours use `style` so `var()` works. Dead `#quote-status` rules were removed. A computed-style diff of all pages, both themes and both viewports showed only the intended slate change; all 28 browser tests passed. On 12 October the navy family was consolidated into `--navy-raised: #25394b` (raised dark surfaces), `--navy-deep: #142431` (hero overlays, backdrops, globe section) and `--navy-shadow: #080f18` (shadows); 15 near-duplicate navies were merged into the nearest of these, and `globe.js` now reads `--navy`, `--slate`, `--blue` and `--yellow` from CSS at start-up. Greys and tints were then consolidated into a blue-grey scale in `foundation.css` (`--tint-100/200/300`, `--grey-200` … `--grey-700`; 60 shades merged, ΔE ≤ 6.5, axe contrast checks pass); `globe.js` and `data-journey.js` use it too. Intentionally left literal: footer mesh `--network-ink` (#476e88 / #8cacc1), the journey accent #80b9df, the form-error orange #9c5b1c and the Products bullet mustard #9c8500. Still open: the `theme-color` meta (must stay a literal), dark mode as per-selector overrides, and the remaining dark-mode override rules. Focus outlines (12 October): card/tab outlines that used `--slate` and the article carousel's yellow outline now use `--focus`, and `[tabindex]:focus-visible` joined the global focus rule; a keyboard scan of all pages in both themes measured every outline at 3.15:1 or better. Yellow outlines on dark surfaces (e.g. the Products tab list) were kept. `--white: #ffffff` was added on 12 October.

## Theme structure (12 October 2026, uncommitted)

- Global palette and the semantic surfaces (`--surface-base/raised/section/input`, plus `--ink`, `--muted`, `--line`) have light values in `:root` in `foundation.css`. Their dark values are in a single `html[data-theme='dark'] body` block at the top of `theme.css`. The old `--dark-surface` / `--dark-raised` were folded into `--surface-base` / `--surface-section`.
- Component colours that differ by theme are declared once at the top of `theme.css`: a `:root` block with light values and the same names in the dark block (for example `--product-panel-bg`, `--footer-panel-bg`, `--module-bullet-bg`). Component rules use these variables in both themes.
- 24 redundant dark declarations were removed, and 26 dark overrides were converted into variables, with zero computed-style change on all pages, in both themes, at both viewports. All browser tests pass.
- About 85 dark-only declarations remain in `theme.css` (and a few in other files). They stay because they: (a) unify elements whose light styling comes from several different rules; (b) style states (hover, focus, open FAQ); (c) override browser defaults that have no light rule; (d) depend on section-scoped variables (`--muted`, `--line`); or (e) are genuinely dark-only (logo invert filters, globe halo, background gradients). New sections should use the semantic variables instead of adding dark rules.
- The verification tools used (`snap.mjs` computed-style diff, `focus.mjs` outline-contrast scan) were run from a cloud copy and are not in the repository.

## Products hero animation (12 October 2026, uncommitted)

- The Products hero image and its two labels were replaced by `src/components/DashboardAnimation.astro`: a looping (9.2 s) animation of the Consumption dashboard building itself after Vessel A is selected. Logic: `src/scripts/dashboard-animation.js`; geometry: `src/data/dashboard-animation.json`; images: `public/assets/products/dashboard-animation/` (final screenshot, two clean plates, empty state). `vessel-status.webp` was removed as unused.
- The final screenshot is also the static fallback (no JavaScript, reduced motion, or an image failing to load). Playback pauses off-screen and in background tabs; the pause button reuses `MotionControl` (`control="dashboard"`).
- Images come in two sets: full resolution (~330 KB lossless WebP) and `*-small.webp` at half resolution (~115 KB, WebP quality 90). A `<picture>` source serves the small still on screens up to 700px wide, and the script loads the same set the browser chose (`currentSrc`), so nothing is downloaded twice. Still possible: lossy full-size images and a lazy start.

## Vessel data-source illustrations (12 October 2026, uncommitted)

- The Products page "A shared data foundation" section shows an illustration for each vessel type via `src/components/VesselDataIllustration.astro` (`variant="connected" | "report"`): inline SVGs built on a vector trace of the vessel silhouette from the platform's empty state, using site colour variables. On wide screens each type is its own row, with illustration and text alternating sides; at 900px and below it is a single column with the illustration first. Labels use `.vessel-label` and are enlarged to 16px (SVG units) on phones.
- The component markup is generated (silhouette trace and layout scripts lived in a cloud working copy, not in the repository). For small wording changes, edit the `<text>` labels in the component directly.
