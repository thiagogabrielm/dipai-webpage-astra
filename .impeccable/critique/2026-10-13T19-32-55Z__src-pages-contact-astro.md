---
target: the contact page
total_score: 32
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro"
target_fingerprint: "sha256:84f0bdfcbd5efbdf650543b6a0a7f9bee4e9c13e08f41c993e313514add64714"
target_path: /sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro
timestamp: 2026-10-13T19-32-55Z
slug: src-pages-contact-astro
---
Method: dual-agent (A: a7d084842f3790f08 · B: ae949501bd4861612)

# Critique: Contact page (`src/pages/contact.astro`), fifth run

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | The "N fields need attention." summary stays visible after every field is fixed |
| 2 | Match System / Real World | 4 | Plain, domain-specific copy throughout |
| 3 | User Control and Freedom | 3 | Drafts survive a reload and "Send another" keeps name and email; a hanging send can't be cancelled, and a restored draft says nothing |
| 4 | Consistency and Standards | 3 | Two failure leads ("wasn't sent" vs "could not confirm"); the counter formats numbers two ways; the desktop tab order doesn't follow the layout |
| 5 | Error Prevention | 3 | Strong limits and warnings, but a paste is cut first and explained afterwards |
| 6 | Recognition Rather Than Recall | 4 | Labels, the hint, the echoed email and "What happens next" stay in view |
| 7 | Flexibility and Efficiency | 3 | Autofill, direct contact and the mailto fallback |
| 8 | Aesthetic and Minimalist Design | 3 | Calm; "Book a demo" appears three times; the hint line is too long on desktop |
| 9 | Error Recovery | 3 | Excellent on a 500; undermined by the stale summary and the dropped-connection wording |
| 10 | Help and Documentation | 3 | Enough help; nothing explains whether a retry could send twice |
| **Total** | | **32/40** | **Good** |

## Design Specificity Verdict

**Design review:** mostly authored, structurally generic. The copy, the signal-path line that lights up on send, the single focus colour and coral reserved for errors are specific to Dipai. The two-column contact skeleton is not. Without a named person or a proof line, that is acceptable.

**Automated scan:** no findings on the page itself, the same results as runs 1–4.
- **Source and dark rendered page:** 0 findings.
- **Light theme:** 4 shared footer-label advisories (4.47:1).
- **Built file:** the same 8 shared-stylesheet advisories.
- **Homepage sanity check:** 23 findings, so the scanner is working.

Verified by measurement:
- **Focus rings:** all 35 tab stops show #8ab9de in dark (5.71–6.93:1). None is yellow.
- **Landmarks and order:** source order is direct contact → form → routes, with two separate complementary landmarks.
- **Draft saving:** the form still works when sessionStorage throws.

**Visual overlays:** URL scans only.

## Overall Impression

32/40, one point below run 4. That isn't a regression: every run-4 fix is confirmed. This reviewer found a bug that has existed since the error summary was added. The summary isn't cleared when fields are corrected, which no earlier run caught. The page is close to excellent; the remaining issues are about state accuracy and one layout seam.

## What's Working

1. **Failure path:** a bold "Your message wasn't sent." directly above Send, focus returned to the button, a pre-filled mailto with a clear shortening marker, and the phone number.
2. **State continuity:** drafts survive a reload and are cleared on send. "Send another message" keeps name and email and focuses Message. The steps switch correctly in both directions.
3. **Accessibility:** one focus colour everywhere, errors linked to their fields, a coral ring on invalid fields, live announcements only at thresholds, and 44px targets.

## Priority Issues

**[P1] The error summary goes stale**
- **Why it matters:** after fixing every field, a coral box still says "2 fields need attention." It's the only red element on screen, and it's false.
- **Fix:** recount the invalid required fields on input. Update the count, or hide the summary at 0 (unless a send failure with fallback is showing).
- **Suggested command:** `/impeccable harden`

**[P2] A dropped connection says "could not confirm"**
- **Why it matters:** a network error before any response means the message wasn't sent. Only a timeout is genuinely uncertain.
- **Fix:** for a network error, say "Your message wasn't sent." For a timeout, keep "could not confirm" and add that retrying may send it twice, which is fine.
- **Suggested command:** `/impeccable clarify`

**[P2] The desktop tab order doesn't follow the layout**
- **Why it matters:** at 1440, focus goes to email and phone at the top right, then jumps to Name on the left. Fixing the phone order created this seam on desktop.
- **Fix:** put email and phone above the form in the left column on desktop, so source, tab and visual order are one sequence at every width.
- **Suggested command:** `/impeccable layout`

**[P3] The counter formats numbers two ways**
- **Why it matters:** it shows "1850 / 4000" but also "limit 4,000".
- **Fix:** format both numbers the same way.
- **Suggested command:** `/impeccable polish`

**[P3] A restored draft is silent**
- **Why it matters:** after a reload, the fields come back with no explanation, so the visitor can't tell whether the message was sent.
- **Fix:** show "Restored your unsent message." above the button.
- **Suggested command:** `/impeccable clarify`

## Persona Red Flags

- **Riley (edge cases):** the stale summary. A pasted overflow is lost from the field. Retrying after a timeout could send a duplicate, and nothing says so.
- **Sam (keyboard):** on desktop, focus starts at the top right before the form. The summary has no links to fields (focus does move to the first one).
- **Ingrid (superintendent):** a long brief pasted from Word loses its end, and she's only told afterwards.
- **Executive:** "Book a demo" is repeated, which is harmless.

## Minor Observations

- At 1440 there are two yellow buttons: the header CTA (owner's choice) and Send.
- The success card is shorter than the sidebar, leaving empty space in the left column.
- The message hint runs about 115 characters per line on desktop; cap it near 60ch.
- "Other routes" reads like an internal label.
- The light-theme focus ring has the smallest contrast margin, 3.49:1. Light mode is hidden.

## Questions to Consider

- Should text pasted past the limit be kept and flagged ("150 over"), blocking Send until it's trimmed, so nothing written is lost?
- Should email and phone sit above the form at every width?
- Does the sidebar need demo and portal routes that repeat the header?
