---
target: the contact page
total_score: 34
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro"
target_fingerprint: "sha256:d0cc734d60f86dedb38a621b2b06ff3e9f82d11d20b70e300d75a8a5a003c9c7"
target_path: /sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro
timestamp: 2026-10-13T20-00-24Z
slug: src-pages-contact-astro
---
Method: dual-agent (A: a00038242cc3e8b40 · B: abdaf102fb85b4106)

# Critique: Contact page (`src/pages/contact.astro`), sixth run

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | The counter's screen-reader announcement stays in the Message label, so after a trim the field is still named "…over the limit" |
| 2 | Match System / Real World | 4 | Plain maritime wording; errors say what to do |
| 3 | User Control and Freedom | 3 | No way to discard a restored draft; a stuck send can't be cancelled for up to 18s |
| 4 | Consistency and Standards | 3 | Invalid fields take a coral focus ring, against the "Focus Blue only" rule |
| 5 | Error Prevention | 4 | Typing stops at 4,000; a paste is kept, flagged and blocked (0 requests sent) |
| 6 | Recognition Rather Than Recall | 4 | Labels, the hint and direct contact always visible |
| 7 | Flexibility and Efficiency | 3 | Autocomplete, mailto fallback, tel link, phone intro link |
| 8 | Aesthetic and Minimalist Design | 3 | Over-limit says the same thing twice; demo links repeat on the success view |
| 9 | Error Recovery | 4 | Correct wording for each failure type, focus returned, fallback with the 1,500-character cut explained |
| 10 | Help and Documentation | 3 | No guidance for account or portal-access questions |
| **Total** | | **34/40** | **Good** |

## Design Specificity Verdict

**Design review:** mostly authored, with a generic skeleton. The copy and the "What happens next" signal line are Dipai's own. The form-plus-route-sidebar structure is a standard SaaS template, and the sidebar is the weakest part.

**Automated scan:** no findings on the page itself, unchanged from runs 1–5.
- **Source and dark rendered page:** 0 findings.
- **Light theme:** 4 shared footer advisories.
- **Built file:** the same 8 shared advisories, one of them the marquee false positive.
- **Homepage sanity check:** 23 findings, so the scanner is working.

Every behaviour was verified, including a real clipboard paste past the limit, the summary countdown, the timeout wording (with the timeout shortened for the test), draft restore, and the fallback when storage is blocked. B also noticed the stale live-region text that A raised as P1.

**Visual overlays:** URL scans only.

## Overall Impression

34/40, the highest so far. Nothing the visitor writes can be lost, and every failure is described honestly. What's left is precision: one screen-reader naming bug, one focus-colour inconsistency, and a few duplicated messages.

## What's Working

1. **Nothing written is lost.** Typing caps at the limit, pastes are kept and blocked until trimmed, drafts survive a reload, and failures carry a pre-filled email.
2. **Honest failure wording:** "wasn't sent" for a server error or a dropped connection, and "could not confirm…trying again is safe" for a timeout.
3. **The order agrees at every width.** Tab order follows the layout, every focus ring is 2px #8ab9de at 5.7:1 or better, and nothing overflows horizontally.

## Priority Issues

**[P1] The textarea's accessible name goes stale**
- **Why it matters:** the counter's live-region span sits inside the Message label. After a paste and trim, screen readers name the field "Message 20 over the limit: shorten to send" even though it isn't.
- **Fix:** move the live span outside the label, and clear it when the counter drops back below a threshold.
- **Suggested command:** `/impeccable harden`

**[P2] Invalid fields take a coral focus ring**
- **Why it matters:** this breaks the Focus Blue rule, and coral is weaker as a ring: 4.24:1 against 5.71:1 for Focus Blue.
- **Fix:** keep the outline blue, and let the coral border and inset show the error.
- **Suggested command:** `/impeccable polish`

**[P2] The over-limit warning appears twice**
- **Why it matters:** the field error and the counter both instruct ("Shorten your message by 120…" and "120 over the limit: shorten to send").
- **Fix:** over the limit, the counter shows only "4,120 / 4,000" in ink; the error carries the instruction.
- **Suggested command:** `/impeccable distill`

**[P2] The restored-draft note is passive and can't be dismissed**
- **Why it matters:** the 12px muted note sits by Send and isn't announced. It has no "Start over", stays when all fields are emptied, and says "unsent" after a timeout that "may still arrive".
- **Fix:** move it to the top of the form, add "Start over", hide it when the fields are empty, and reword it so it doesn't claim the message wasn't sent.
- **Suggested command:** `/impeccable clarify`

**[P3] The email field complains mid-typing**
- **Why it matters:** once flagged, a partial "ola@" shows the format error with every keystroke.
- **Fix:** on input, only clear errors; re-check the format on blur or submit.
- **Suggested command:** `/impeccable harden`

## Persona Red Flags

- **Sam (screen reader):**
  - Hears the stale "over the limit" name.
  - The coral focus ring is weaker than Focus Blue.
  - The draft note isn't announced.
  - Focus drops to the page body while sending.
- **Jordan (first-timer):**
  - Sees three "Book a demo" links on the success view.
  - "Already using Dipai?" points to both the portal and the form.
- **Riley (stress tester):** after a timeout and a reload, "unsent" contradicts "may still arrive".
- **Superintendent on a weak connection:** an 18-second hang shows only "Sending…", with no way to cancel.

## Minor Observations

- At 1440, the empty-submit summary renders below the fold. Focus moves to Name, so that's fine.
- The email address appears three times on phones (intro, direct block, footer). That follows from the form-first choice.
- The light-theme focus ring has the smallest contrast margin, 3.49:1; light mode is hidden.
- Both asides sit inside the section labelled by the form heading.

## Questions to Consider

- Could the sidebar answer a Dipai-specific question ("Which data do you have today?") instead of showing three generic routes?
- Should "Book a demo" appear only once on the success view?
- Should a restored draft be an offer ("Continue where you left off? / Start over") rather than a silent refill?
