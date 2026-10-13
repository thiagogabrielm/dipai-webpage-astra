---
target: the contact page
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro"
target_fingerprint: "sha256:0439b323bc50b6e20303180aef4d18d286d221b22a11b784b377f6d4493d016f"
target_path: /sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro
timestamp: 2026-10-13T13-37-33Z
slug: src-pages-contact-astro
---
Method: dual-agent (A: a3f0ff6b59f5dd4d3 · B: ae6f4b20237b64b90)

# Critique: Contact page (`src/pages/contact.astro`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Clear sending and error states. After a failed send, though, focus drops to the page body (`enquiry-form.js` lines 43–63). |
| 2 | Match System / Real World | 2 | Generic wording. No maritime language and no reply-time promise. |
| 3 | User Control and Freedom | 2 | The success state is a dead end: no next step, and no way to send another message. |
| 4 | Consistency and Standards | 1 | The page lists `support@dipai.no`, while the footer on the same screen lists `contact@dipai.no`. Error messages mix the browser's own wording with the site's. |
| 5 | Error Prevention | 3 | Required fields, email type, autocomplete, length limits and trimming are all in place. No character counter for the 4,000-character limit. |
| 6 | Recognition Rather Than Recall | 3 | Labels sit visibly above the fields, and the form is minimal. |
| 7 | Flexibility and Efficiency | 2 | Email is offered as an alternative. Phone, office and a "book a demo instead" route are only in the footer. |
| 8 | Aesthetic and Minimalist Design | 2 | Three headings say the same thing. Next to the form, the left column is about 450px of empty navy. The closing FAQ heading is as large as the page title. |
| 9 | Error Recovery | 2 | Server errors are well written ("your details are still here"). Field errors rely on short-lived browser bubbles, with no inline error message or invalid-field marking. |
| 10 | Help and Documentation | 2 | The FAQ link only appears after the form, and the form gives no hint of what to include. |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

**Design review:** the page is competent but has no identity. "Let's talk." followed by "How can we help?", a three-field card and a closing "Looking for a quick answer?" block is the most common B2B contact-page template. It could be pasted into almost any SaaS site unchanged. Only the navy palette, the yellow button and the footer mesh say Dipai. Nothing reflects the maritime context:
- no Ålesund office
- no people
- no prompt about fleet size, vessel type, or whether the vessels have sensors or only noon reports, which is what shapes every real enquiry
- no routing between "book a demo" (the main action) and "contact"
- none of the site's signature elements (signal node, drawn line, KPI callout)

**Automated scan:** the detector agrees the page is clean but generic. `contact.astro` and all five components it uses scanned with no findings. Rendered scans of `/contact/` were clean at 1280×800 and 390×844, in both light and dark. As a check that the scanner works, the homepage returned 23 findings. Scanning the built HTML file did report 8 findings, all coming from shared site styles rather than the contact page:
- **`marquee`:** comes from the homepage logo strip and is not present on this page, so it's a false positive here.
- **`low-contrast`:** a 4.47:1 light-theme-only issue on the 11px footer headings.
- **Design-system drift:** advisories for one stray text colour on the intro paragraph and two radii (14px and 6px).

The detector can't judge identity, so the main problem here comes from the design review alone. The two reviews agree on what's present: clean accessibility basics, on-system colour use, and no anti-patterns.

**Visual overlays:** the overlay was injected only into a headless browser in the cloud, where it logged "No anti-patterns found". No overlay is visible in your browser.

## Overall Impression

Accessible, robust and on-palette, and also anonymous. The biggest opportunity is to turn the empty left column into routing and reassurance: who you're writing to, which channel suits which need, and what to include. The page would then become part of Dipai rather than a generic form.

## What's Working

1. **Robust form handling.** It works without JavaScript through Netlify's native form handling. It has a spam trap, trims input, has an 18s timeout and maps errors to plain language. It also keeps the visitor's text when sending fails.
2. **Accessibility basics.**
   - Every field has its own label, and inputs use 16px text so iPhones don't zoom in.
   - The tab order is logical, with visible focus on every element.
   - Status messages are announced to screen readers, and focus moves to the success heading after sending.
   - Measured contrast is strong: labels 10.95:1, typed text 13.3:1, button 10.23:1.
3. **On-system restraint.** The card is lifted by tone and a hairline rather than a shadow, and yellow appears only on the primary action, following DESIGN.md.

## Priority Issues

**[P1] Two different public email addresses**
- **Why it matters:** the page says `support@dipai.no` and the footer on the same screen says `contact@dipai.no`. Executives and evaluators wonder which one reaches sales, which undermines trust and splits your inbox.
- **Fix:** use one address for general enquiries. If both are intentional, label them, for example "Product support: support@ · Sales and partnerships: contact@".
- **Suggested command:** `/impeccable clarify`

**[P1] Field borders are too faint**
- **Why it matters:** the input border measures 2.3:1 against the card, below the 3:1 required for non-text elements under WCAG. The fields read as faint holes, especially in glare or for low-vision users (`theme.css` lines 313–316).
- **Fix:** give inputs their own border token at about 55–60% Mist Blue, or step the input fill to Abyss Navy (#142431). The Hairline Rule's 15–40% stays for dividers only.
- **Suggested command:** `/impeccable harden`

**[P1] Generic composition: empty left column and no routing**
- **Why it matters:** visitors who want a demo, existing customers needing support, and partners all land on the same blank form. Demo leads arrive as vague messages, and nothing invites the details that make a useful first reply.
- **Fix:**
  - Fill the left column with three routed options, each with a link:
    - Exploring Dipai for your fleet → Book a demo
    - Existing customer → Log in or support
    - Partnerships and press → contact
  - Add the Ålesund/NMCC office, the phone number and one named person from `team.json`.
  - Add a helper line on Message, for example "e.g. 12 offshore vessels, noon reports only, interested in MRV/ETS".
- **Suggested command:** `/impeccable layout`, then `/impeccable clarify`

**[P2] Thin validation and error states**
- **Why it matters:** empty fields show browser-language bubbles that vanish quickly. Fields are not marked invalid with linked inline messages, and focus is lost after a failed send. Screen-reader and keyboard users lose their place.
- **Fix:**
  - Turn off the browser's built-in bubbles (`novalidate`) and run the site's own check instead.
  - Mark invalid fields (`aria-invalid`), show an inline message linked to each field, and focus the first invalid field.
  - After an error, return focus to the submit button or the status box.
- **Suggested command:** `/impeccable harden`

**[P2] Weak ending and misplaced FAQ**
- **Why it matters:** the last thing visitors see is a flat grey "thanks" with no reply time, no named person and no next step. Separately, the FAQ appears only after they've already written, and its heading is as large as the page title.
- **Fix:**
  - **Success message:** "We usually reply within one working day", the team or a person's name, and links to a use case and "Book a demo".
  - **FAQ:** move it above or beside the form as a small text link, and shrink or remove the closing call-to-action block.
- **Suggested commands:** `/impeccable delight` for the ending, `/impeccable distill` for the call-to-action

## Persona Red Flags

**Jordan (first-timer):**
- Can't tell which channel to use: the form, `support@`, `contact@`, the phone or "Book a demo".
- The prompt "Give us a little context" with an empty text box gives no example of what to write.
- Finds the FAQ only after scrolling past the form.

**Sam (screen reader or keyboard):**
- Focus is lost after a failed send.
- No field is marked invalid, so the only cue is a short-lived browser bubble.
- The success heading hides its focus outline (`pages.css` line 935).
- Field borders are at 2.3:1.

**Casey (mobile, one-handed):**
- At 390px wide, several tap targets are under 44px tall: "Send message" (125×38), "Explore our FAQs" (141×38) and the email link (158×25).
- The submit button is left-aligned rather than full-width.
- On a phone the form card starts below the first screen (y≈491).

**Kari (onshore technical superintendent, 20 vessels with mixed equipment; based on PRODUCT.md):**
- Nothing invites the vessel type, fleet size, sensor setup or MRV/ETS needs that would get her a useful reply.
- She can't tell who will answer, or whether Dipai works without sensors.
- The executive variant of her sees no proof next to the form (250+ vessels, DNV Veracity, customer logos).

## Minor Observations

- **Mismatched CTA:** the closing block is passed an empty description and `secondary={false}`, yet renders in the secondary style.
- **Awkward wrap:** the intro wraps with "Get / in touch." on desktop.
- **Footer year:** it reads "© DIPAI AS 2022", which is out of date.
- **Unlabelled email link:** the 23px underlined address outweighs the heading above it and has no label such as "Email us directly".
- **Message box:** at 150px tall it looks large and empty, and has no character counter.
- **Privacy link:** there's none next to the form, even though it collects personal data.
- **Tablet layout:** the 1fr / 1.3fr layout at 600–900px narrows the form column; this wasn't captured.
- **Detector advisory:** one intro paragraph uses an off-token text colour, `rgb(89,107,122)`.

## Questions to Consider

- If booking a demo is the main conversion, why doesn't the contact page send demo-minded visitors there? How many demo leads currently arrive as vague contact messages?
- Would Kari write a more useful first message if the reply clearly came from a named person in Ålesund?
- Could the empty left column become a small "signal" moment from the design system, for example a yellow node travelling to the chosen enquiry type?
- Is the closing "Looking for a quick answer?" block there because the page needs it, or because every template ends with a call-to-action?
