# Editing content

## A news post

Add an entry to `src/data/news.json`. Copy a neighboring post as the starting point, give it a unique URL-safe `slug`, and update these fields:

```json
{
  "slug": "new-partnership",
  "title": "A new partnership",
  "category": "Partnerships",
  "date": "2026-10-09",
  "summary": "The short introduction used on cards and the article page.",
  "paragraphs": ["First paragraph.", "Second paragraph."],
  "source_url": "https://www.linkedin.com/company/dipai-as/",
  "images": [
    {"src": "assets/news/new-partnership.webp", "alt": "Describe the image", "caption": "Optional caption"}
  ],
  "contain": false
}
```

Place the referenced image in `src/assets/news/` (the JSON path remains `assets/news/filename.webp`). Astro imports the source and generates responsive WebP variants automatically. JPG, PNG, WebP and AVIF sources are supported. Use `images: []` for a text-only story. `contain: true` fits a poster or event graphic inside a card without cropping it.

Run `npm run build`. Astro automatically creates `/news/new-partnership/`, its old-style `.html` redirect, archive card, category filter, related-story entry and sitemap entry. The latest four posts populate the landing-page carousel. No new page implementation is needed.

## A use-case article

Add an entry to `src/data/use-cases.json`, using the nearest existing article as a starting point. Required rendering fields are:

- `slug`, `title`, `category`, `summary`, `intro`.
- `sections`: headings and arrays of paragraph strings.
- `figures`: `src` filenames inside `public/assets/use-cases/`, alternative text and captions.
- `outcome` and `evidence_note`.
- `card_visual`: the card's `metric`, `context` or `cycle` presentation. Keep the fields from the matching existing card.
- Optional `metrics`: label/value pairs above the article body.

The schema in `src/content.config.ts` checks these fields during every build. The JSON order controls the use-case library and its category order. The landing page's four selected slugs are in `src/pages/index.astro`.

Source-slide and evidence metadata may remain beside the editorial fields; it is not shipped to the browser. Use-case figures open at their full stored resolution. Keep screenshots legible; the existing screenshots use lossless WebP.

## Images and other shared content

The build calculates image dimensions automatically. Team photographs belong in `src/assets/team/`; news photographs belong in `src/assets/news/`. The shared `ResponsiveImage` component generates sizes at build time and supplies `srcset`, `sizes`, intrinsic dimensions, and lazy loading. The current hero uses 1280, 1920 and 2560-pixel variants with the first image prioritised. Changing a hero image requires the same three file sizes using the existing naming pattern. SVG logos stay vector-based. Product and use-case screenshots remain lossless to keep labels readable.

Canonical URLs, article structured data, social previews and sitemap entries come from the shared template. News uses the first article image as its social preview; text-only posts use the generated Dipai card. Keep dates, captions, alternative text and evidence accurate; do not invent publication or modification dates for search engines.

`clients.json` is shared by the landing ribbon and demo grid. Each entry contains its label, image, dimensions and website. `ribbon: false` excludes a client from the ribbon while retaining it in the grid.

Testimonials, team members, FAQs and module cards also use shared data and render loops. The privacy document's HTML is trusted editorial content rendered at build time; other text is escaped by Astro.

The build fails on broken local links, missing images, duplicate IDs or unreferenced files in `public/assets/`. Remove old media when it is no longer referenced. Run the browser tests for changes to layouts or interactive behavior.
