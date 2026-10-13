---
target: the contact page
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro"
target_fingerprint: "sha256:7dab887316ebfc0b75d63870d43413f47c3d465a87a2bd67a138d6bd13fb4888"
target_path: /sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro
timestamp: 2026-10-13T14-08-04Z
slug: src-pages-contact-astro
---
Method: dual-agent (A: abd0e811630120fc4 · B: a6de0c7bc30474bb4)

# Critique: Contact page (`src/pages/contact.astro`), second run

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Sending, failure and success states are all present and announced. "Sending…" appears twice (in the status box and on the button), and the disabled button dims to a muddy olive at 60% opacity. |
| 2 | Match System / Real World | 3 | The field hint speaks the operator's language (sensors, noon reports). "The right specialist" is vague. |
| 3 | User Control and Freedom | 3 | Entries survive a failed send. After a successful send, the form is gone for good, with no "send another". |
| 4 | Consistency and Standards | 2 | Errors are Signal Yellow, the same colour as the calls to action. Focus rings are blue on fields and yellow elsewhere. "Book a demo" appears four times. |
| 5 | Error Prevention | 3 | Email field type, autocomplete, length limits and inline checks are all in place. Nothing marks fields as required until you submit. |
| 6 | Recognition Rather Than Recall | 3 | Labels stay visible, and the hint sits above the message box. |
| 7 | Flexibility and Efficiency | 3 | Form, email, phone, demo and FAQ routes are all available, and autocomplete works. |
| 8 | Aesthetic and Minimalist Design | 3 | Clean overall. Repeated demo links and an equally weighted routes column pull attention from the form. |
| 9 | Error Recovery | 2 | A failed send only says "try again", with no email or phone fallback. Name and message share the generic "Please fill in this field.", and the message error appears below the character counter. |
| 10 | Help and Documentation | 3 | The FAQ route and the field hint cover it. Nothing says what happens after you send. |
| **Total** | | **28/40** | **Good** |

## Design Specificity Verdict

**Design review:** the wording is now specific to Dipai, the visual design isn't yet. "Let's talk about your fleet.", the sensors/noon-reports hint and the NMCC Ålesund address belong to this company. The structure doesn't: a big heading, a form card and a routes column. Swap the copy and it would suit any B2B company. Nothing in the visuals says maritime or platform, and no person is named. At 1440px, the space to the right of the intro sits empty.

**Automated scan:** no findings, a real improvement on the previous run.
- **Source files:** `contact.astro` and every component it uses come back clean.
- **Rendered page:** `/contact/` is clean at 1280×800 and 390×844, in both light and dark. The same scanner still finds 23–68 issues on the homepage, so it is working.
- **Built HTML file:** the scan repeats the same 8 shared-stylesheet advisories as the first run. None is a fault in this page:
  - **Marquee:** a false positive, since the logo strip isn't on this page.
  - **Low contrast:** light theme only, on the 11px footer headings (4.47:1).
  - **Design-system drift:** one intro text colour and two radii (14px footer, 6px link).

The detector can't see the main remaining issue, yellow used for errors, because it checks contrast and patterns, not meaning. That finding comes from the design review.

**Visual overlays:** the overlay was injected only in a headless cloud browser, where it reported "No anti-patterns found". No overlay is visible in your browser.

## Overall Impression

A big step up, from 22/40 to 28/40. The page is now well engineered and accessible:
- **Contrast:** field borders 4.0:1 against the card, and every text element 7.6:1 or better.
- **Errors:** linked to their fields, with focus managed properly.
- **Touch targets:** 44px everywhere except inline links in sentences.

The biggest remaining opportunity is to stop using the brand's one signal colour for "you made a mistake", and to make the failure moment safe.

## What's Working

1. **Careful accessibility work.**
   - Errors are linked to their fields, and focus moves to the first problem.
   - After a failed send, focus returns to the button; after success it lands on the thank-you heading.
   - All three fields are labelled.
   - There's no horizontal overflow, and no console errors on load.
2. **Honest failure handling.** The form distinguishes "not enabled yet", rate limiting, timeouts and server errors, and keeps everything the visitor typed.
3. **The field hint.** "Whether vessels have sensors or only noon reports" asks for exactly what a specialist needs without adding fields, and it reinforces the "works without sensors" message.

## Priority Issues

**[P1] A failed send leaves no fallback**
- **Why it matters:** someone who has just written a careful paragraph about 12 PSVs sees only "Please try again…". The email and phone are far away in the right column, and roughly 1,000px further down on a phone. This is the moment an enquiry is most likely to be lost.
- **Fix:** add a fallback to the error message: "…or email it to contact@dipai.no" (a mail link that pre-fills their message) and the phone number.
- **Suggested command:** `/impeccable harden`

**[P1] Signal Yellow is used for errors**
- **Why it matters:** DESIGN.md's One Signal Rule reserves yellow for the one thing to act on. Invalid-field borders, error dots and the status-box stripe all use it, so an error reads like a call to action. "Send message" and the header's "Book a demo" are yellow in the same view as well.
- **Fix:**
  - Give errors their own token. Alert Coral (#ff6b57) on the border and dot is already in DESIGN.md as a status colour, and error text stays Foam White.
  - Remove the 3px yellow stripe on the status box.
- **Suggested commands:** `/impeccable colorize`, then `/impeccable polish`

**[P2] Too many routes compete with the form**
- **Why it matters:** "Book a demo" appears four times (header, intro, route 1, success state), and the page offers seven ways to reach Dipai. On desktop, "Send message" falls below the fold, and the first thing visible there is "Find the fastest route".
- **Fix:**
  - Drop the demo link from either the intro or the routes.
  - Move email and phone to the top of the sidebar, and on phones place them under the intro.
  - Make the sidebar narrower so the form clearly leads.
  - Reduce the 70px heading so "Send message" sits above the fold.
- **Suggested commands:** `/impeccable distill`, then `/impeccable layout`

**[P2] Visually generic**
- **Why it matters:** technical superintendents and executives get nothing to trust. There are no names, no proof and no sense of what happens next.
- **Fix:** add a short "what happens next" (reply within 24h, a conversation about your data, a demo on your vessel types). Put one proof line by the form, for example "Trusted on 250+ vessels". You asked for no named person, so this replaces a named contact as the trust signal.
- **Suggested command:** `/impeccable onboard`

**[P3] Error and success details**
- **Message error:** place it before the "0 / 4000" counter.
- **Specific error text:** e.g. "Add your name." / "Tell us a little about your fleet."
- **Counter:** stop announcing "0 / 4000" every time a screen reader enters the field.
- **Success state:** echo the visitor's email ("We'll reply to …") and offer "Send another message".
- **Suggested commands:** `/impeccable clarify`, `/impeccable delight`

## Persona Red Flags

**Jordan (first-timer):**
- Unsure whether the form is for sales or support: the intro speaks only to sales, while the routes say "use the form for account questions".
- Passes four "Book a demo" links before reaching "Send message".

**Sam (screen reader or keyboard):**
- Hears "0 / 4000" on every visit to the message field.
- When several fields fail there's no error summary; only the first invalid field gets focus.
- Invalid fields show a double ring (blue focus outline plus yellow border).
- Nothing marks fields as required before submitting.

**Casey (mobile, one-handed):**
- Phone and email sit about 1,300px down, below the form and routes.
- On a timeout, the only option is "try again".
- Touch targets are fine apart from the two inline sentence links.

**Superintendent (onshore technical evaluator, from PRODUCT.md):**
- Wants to know whether Dipai can take data from their existing vendor's API before booking a call. "Data integration" only links to the FAQ.

**Executive:**
- No proof (250+ vessels, customer logos) and no firm commitment beyond "usually within 24 hours".

## Minor Observations

- "Within 24 hours" appears three times: in the intro, the form note and the success state.
- The empty 7px route markers look like unchecked radio buttons when nothing is hovered.
- On tablet, there's a dead area beside the contact details under the routes.
- The field hint is hidden from the label's name and read through the field's description instead. That works but is fragile.
- Checking a field when you leave it only happens once it has a value, which is good: no nagging on the first pass.

## Questions to Consider

- If "Book a demo" is the main goal, should the contact page link to it once, clearly, rather than four times?
- Should the hint become optional structured choices (fleet size, sensors vs noon reports), so enquiries arrive already sorted?
- Why is the brand's single signal colour used for "you made a mistake"?
