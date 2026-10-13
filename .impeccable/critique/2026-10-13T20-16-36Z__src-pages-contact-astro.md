---
target: the contact page
total_score: 34
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:/sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro"
target_fingerprint: "sha256:8f451900252a03af10252dd18ec89cb4321cc5f34e72121f63e5a22ebf87ac82"
target_path: /sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro
timestamp: 2026-10-13T20-16-36Z
slug: src-pages-contact-astro
---
Method: dual-agent (A: a5ad269cbeb93d9eb · B: a4f8ed884e5376a45)

# Critique: Contact page (`src/pages/contact.astro`), seventh run

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Sending, success focus, the draft bar, counter stages and the summary countdown all work. On phones the summary appears off-screen |
| 2 | Match System / Real World | 4 | Plain British copy; errors name the fix |
| 3 | User Control and Freedom | 3 | "Start over" wipes every field and the draft in one tap, with no undo |
| 4 | Consistency and Standards | 3 | Focus offsets differ (5px vs 4px); "Send another message" is a one-off outlined button |
| 5 | Error Prevention | 3 | Strong limits, but "Start over" isn't protected |
| 6 | Recognition Rather Than Recall | 4 | Labels, the hint and the required cue stay visible |
| 7 | Flexibility and Efficiency | 3 | Nothing adapts the form for existing customers |
| 8 | Aesthetic and Minimalist Design | 3 | The email is repeated 3 times on phones and the demo link 3 times after success; the draft bar wraps badly at 390 |
| 9 | Error Recovery | 4 | A bold "wasn't sent", details kept, a pre-filled mailto, the phone number, focus returned, an exact over-limit count |
| 10 | Help and Documentation | 3 | The message hint only speaks to prospects |
| **Total** | | **34/40** | **Good** |

## Design Specificity Verdict

**Design review:** partly specific. The layout is a standard contact composition. What makes it Dipai's is the sensors-versus-noon-reports hint, the "team that runs the platform" reply promise, and the signal-path line that lights up on success. The missed chance: the form is identical for prospects, customers and regulatory questions.

**Automated scan:** no findings on the page itself, the same as runs 1–6.
- **Source and dark rendered page:** 0 findings.
- **Light theme:** 4 shared footer advisories.
- **Built file:** the same 8 shared advisories.
- **Homepage sanity check:** 23 findings, so the scanner is working.

Every run-6 fix verified:
- The textarea's accessible name stays exactly "Message" through paste and trim.
- Invalid fields keep the #8ab9de focus ring.
- The counter reads only "4,120 / 4,000", and the live region repeats the single error, then clears.
- The draft bar is first in the form, has `role=status`, and its Start over button is 81×44.
- An email error is set aside while typing and restored on blur.

**Visual overlays:** URL scans only.

## Overall Impression

34/40 again. All run-6 fixes are confirmed. This run's reviewer gives three 4s for state, wording and recovery, and finds a new set of smaller issues, mostly introduced by the new draft feature. There is no P0 or P1. The page is in diminishing-returns territory: what's left is protection against accidents, guidance for existing customers, and phone polish.

## What's Working

1. **Failure recovery:** the best in this series. Nothing a visitor writes is ever lost.
2. **Over-limit handling:** honest and quiet. The paste is kept, the counter only counts, there's one instruction, and the screen-reader name stays clean.
3. **The success moment:** heading focus, the email echoed back, the yellow node drawing on, and "Send another" keeps the visitor's details.

## Priority Issues

**[P2] "Start over" deletes the draft with one tap**
- **Why it matters:** the button sits right above Name. One stray tap erases up to 4,000 characters, with no undo and no announcement.
- **Fix:** after clearing, show "Cleared. Undo" for about 10 seconds (keeping the old values in memory) and announce it.
- **Suggested command:** `/impeccable harden`

**[P2] The message hint only speaks to prospects**
- **Why it matters:** account questions are invited into the form, but the hint (fleet size, sensors, noon reports) doesn't fit them.
- **Fix:** widen the hint to cover both, e.g. "For your account: the vessel or module it's about."
- **Suggested command:** `/impeccable clarify`

**[P3] The error summary is off-screen on phones and drifts**
- **Why it matters:** at 390 the summary is about 230px below the viewport when focus lands on Name. After it hides at 1 remaining, a returning error doesn't bring it back.
- **Fix:** recount whenever any error appears, and place the summary above the first field or make it screen-reader-only.
- **Suggested command:** `/impeccable harden`

**[P3] The draft bar wraps badly on phones**
- **Why it matters:** at 390 the text and "Start over" stack in a 77px bar that looks like a broken alert.
- **Fix:** keep it to one line, or left-align the wrapped button.
- **Suggested command:** `/impeccable polish`

## Persona Red Flags

- **Jordan (first-timer):**
  - After success, three "Book a demo" links are on screen, and "Send another" is the only bordered button.
  - "Online sending is not enabled yet" reads like a developer note.
- **Sam (screen reader / keyboard):** mostly clean now. "Start over" doesn't announce that the fields were cleared.
- **Casey (mobile):**
  - The summary is off-screen.
  - "Start over" is the first button under the thumb.
- **Ingrid (existing customer):** nothing prompts her to name the vessel or module she's asking about.

## Minor Observations

- Focus offsets differ: inputs use 5px, the textarea 4px.
- On phones the email appears three times. The direct block could show only the phone number there.
- After success, the card shrinks well short of the sidebar.
- A 4,250-character paste leaves the error below a scrolled box.

## Questions to Consider

- Should "Start over" be reversible, or moved somewhere less exposed?
- Should the "Already using Dipai?" route change the form itself (a different hint, or a pre-filled subject)?
- After success, what's the single next action? If it's a demo, make it the visible primary.
