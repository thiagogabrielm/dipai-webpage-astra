---
target: the team page
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/team.astro"
target_fingerprint: "sha256:3c08cf6b5a2953eb5028eb24a5c6b0075d9d7df56dcda5a40f8ea0c9cce5c2f8"
target_path: /sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/team.astro
timestamp: 2026-10-14T06-31-08Z
slug: src-pages-team-astro
---
Method: dual-agent (A: ae526045fc2b02037 · B: af3b60e2ec5217335)

# Critique: Team page (`src/pages/team.astro`), first run

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Carousel state is clear (dots, live "team member 4 of 9", disabled ends), but hovering a card that does nothing lights a yellow border |
| 2 | Match System / Real World | 3 | Plain British copy; "Dr." on 4 names with no field; the tab title reads "Company / Team" |
| 3 | User Control and Freedom | 3 | Keyboard, dots, drag and swipe all work; LinkedIn opens a new tab unannounced |
| 4 | Consistency and Standards | 2 | The closing CTA is a `mailto:` styled as a secondary button, unlike the rest of the site; LinkedIn links sit at uneven heights; team photos are colour squares, board photos greyscale circles |
| 5 | Error Prevention | 2 | The `mailto:` CTA fails for webmail and locked-down work laptops, with no fallback to the site's form |
| 6 | Recognition Rather Than Recall | 3 | All 13 people are visible on desktop; at 1100px and below, 8 of 9 sit behind a carousel |
| 7 | Flexibility and Efficiency | 3 | Jump links, keyboard paging and direct contact links work |
| 8 | Aesthetic and Minimalist Design | 3 | Calm, but there's an orphaned 9th card, about 140px of dead space in engineer cards, and one glaring white-studio photo |
| 9 | Error Recovery | 3 | contact@dipai.no is printed elsewhere if the mailto fails |
| 10 | Help and Documentation | 2 | Nothing says who to contact for what; only 3 of 9 members show contact details, unexplained |
| **Total** | | **27/40** | **Acceptable** |

## Design Specificity Verdict

**Design review:** mostly interchangeable. The house style is applied well: navy bands, hairlines, the type, Focus Blue. But underneath it's the standard startup team page (headline, 4-column photo grid, board, "let's talk"), and any SaaS company could use it. Nothing ties the people to Dipai's positioning: NTNU research roots in Ålesund, AI plus maritime domain knowledge, independence from vendors. The "Dr." titles are the raw material for that story, and the page never tells it. Greyscale circular board portraits read as memorial rather than "instrument".

**Automated scan:** clean on the page itself.
- **Source files** (team page, member card, image and CTA components, carousel scripts, layout): 0 findings.
- **Rendered page:** 0 findings in dark at 1280 and 390. In light, the same 4 shared footer advisories as the contact page.
- **Built file:** 9 findings. 8 are the shared stylesheet advisories seen on every page. The 1 page-specific one is `cramped-padding` on the board section, which is likely a false positive because the inner `.wrap` provides the inset.
- **Homepage sanity check:** 23 findings, so the scanner is working.

Objective checks:
- No text contrast failures. The lowest is 5.96:1 in dark and 4.75:1 in light.
- Every focus ring is #8ab9de in dark (lowest 4.46:1, on the board band). None is yellow.
- No console errors, no overflow; layout shift is at most 0.03.

**Visual overlays:** URL scans only.

## Overall Impression

A well-built, accessible page that undersells the team. The carousel engineering is careful, and every person is real, with direct lines for leadership. But the page doesn't answer the question its visitors bring: "why should we trust these people with our fleet's data?" Its one call to action hands executives to a mail client instead of the demo flow. The biggest opportunity is to structure and contextualise the people, then route the close to the form or demo.

## What's Working

1. **The carousel is accessible.** It has a carousel role description, a polite live status, dots labelled with names, and Home/End/arrow keys. Tabbing into a card scrolls it into view, there's no autoplay, and reduced motion is respected.
2. **Focus and order:** the blue 2px ring on every control, and a logical order from header → jump links → cards → board → CTA. LinkedIn links are named "<Name> on LinkedIn".
3. **Honest proof:** real people, real direct lines for leadership, and specific board bios with industry weight (Rolls-Royce, Kongsberg, Klaveness Digital).

## Priority Issues

**[P1] The only call to action is a `mailto:` link, with no demo route**
- **Why it matters:** the page's close is a 170×38 secondary "Contact the team" button that opens a mail client. Executives reassured by the board bios hit a dead end, and below 900px the yellow "Book a demo" is hidden in the menu.
- **Fix:** point the close at the site's own flow: one primary "Book a demo" (or "Contact us" → /contact/), with "or email contact@dipai.no" as text. Keep the direct links on leadership cards.
- **Suggested command:** `/impeccable clarify`

**[P1] The team is a flat list, so expertise is invisible**
- **Why it matters:** "Senior Software Engineer" appears four times, and four "Dr." titles have no field. The meta description promises a leadership group the page never shows, and the NTNU and maritime-research origin is absent.
- **Fix:** split into Leadership (the 3 with contacts) and Engineering and data science (6). Add a confirmed focus area or PhD field per person (owner-supplied only). Open with the confirmed origin story.
- **Suggested commands:** `/impeccable shape`, then `/impeccable layout`

**[P2] Carousels replace grids that would fit**
- **Why it matters:** below 1100px, one 420×685 card fills an 800px screen, and browsing the team takes 8 taps. Scanning people is the page's whole job.
- **Fix:** keep a 2-column grid from 600 to 1100px, use a compact photo-and-name list on phones, and keep a carousel at most for the board.
- **Suggested command:** `/impeccable adapt`

**[P2] Ragged grid and an orphaned card**
- **Why it matters:** at 1440 the 9th card sits alone on its row. LinkedIn links sit at different heights (y 646 vs 732), and engineer cards carry about 140px of dead space.
- **Fix:** pin LinkedIn to the bottom of each card. Splitting out leadership leaves 6 engineers, two clean rows of 3.
- **Suggested command:** `/impeccable layout`

**[P2] Inconsistent photos, and yellow hover on cards that do nothing**
- **Why it matters:** the photo backdrops vary: wood, office, a yellow wall, a white studio. The white one is the brightest thing on the page. Hovering a card that isn't a link turns its border yellow, a second signal next to "Book a demo".
- **Fix:** grade the photos to a common treatment, at least taming the white one. Use a non-yellow hover, or none, on cards that aren't links.
- **Suggested commands:** `/impeccable polish`, then `/impeccable quieter`

**[P2] The carousel loses keyboard focus at the ends**
- **Why it matters:** pressing Next with the keyboard until the last slide disables the focused button, and focus drops to the page body. This is in the shared `section-carousels.js`, so homepage carousels are affected too.
- **Fix:** before disabling a focused arrow, move focus to the opposite arrow or the track.
- **Suggested command:** `/impeccable harden`

**[P3] Images**
- The above-fold photos are lazy-loaded; load the first row eagerly.
- Two sources are too small for retina screens (Dagenborg 400px, Stensby 300px).
- Alt text repeats the name in the h3 that follows, so names are read twice.
- **Suggested command:** `/impeccable optimize`

## Persona Red Flags

- **Technical evaluator:** identical titles, "Dr." with no field, no visible domain roles, no link from people to product, and a `mailto:`-only next step.
- **Executive:**
  - The strongest signals (the board bios) sit below the fold of a 4,063px page in grey 14px text.
  - There's no founding year or location framing.
  - The close is quieter than the header button and opens a mail client.
- **Jordan (first-timer):** the jump links duplicate content already on screen at 1440. Nothing says who to contact for what.
- **Casey (mobile):** email and phone links are 22px tall, the CTA is 38px, and reaching person 9 takes 8 swipes through 582px cards.
- **Sam (screen reader):** every name is announced twice, and focus is lost at the carousel ends.

## Minor Observations

- The tab title "Company / Team — Dipai" reads like a menu path.
- Card names use −0.035em letter-spacing, not the −0.055em Tight Headline rule.
- The page has dead `.team-intro .eyebrow` CSS.
- At 800 the intro's bottom alignment leaves a tall empty block above the h1.
- The board portraits' grey ring and luminosity blend turn busy backgrounds into noise.
- The light-theme focus ring on the board band is 3.15:1, which passes narrowly.

## Questions to Consider

- If the page exists to answer "why trust this team with our emissions data?", why does it open with headshots rather than the NTNU and maritime-research origin?
- Could the four board bios become a dense "governance and industry experience" strip right under the hero, where executives would see them?
- What would be lost if every breakpoint showed all 13 people at once, with no carousel?
