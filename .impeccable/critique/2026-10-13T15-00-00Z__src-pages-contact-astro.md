---
target: the contact page
total_score: 33
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:/sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro"
target_fingerprint: "sha256:27481bac6c567271c5df042c15f741571a9baf528c703959ffdc68878fbcf52a"
target_path: /sessions/rcw-01f3hhtmpjnd1fmetgiwnfsq/mnt/DipaiWebPageAstra/src/pages/contact.astro
timestamp: 2026-10-13T15-00-00Z
slug: src-pages-contact-astro
---
Method: dual-agent (A: a22d6eb629c91d304 · B: a414d4659385414e0)

# Critique: Contact page (`src/pages/contact.astro`), fourth run

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Every action gets feedback, but the 24-hour promise disappears after sending |
| 2 | Match System / Real World | 3 | The success step says "Message received" above a caption ("By email, from the team…") that no longer follows from it |
| 3 | User Control and Freedom | 3 | Failure and "Send another" keep the visitor's work; a refresh loses the draft |
| 4 | Consistency and Standards | 3 | The heading says "on its way" but the step says "received"; on phones the visual and keyboard orders differ |
| 5 | Error Prevention | 3 | Limits, the counter and the paste warning work; the paste warning doesn't say how much was cut |
| 6 | Recognition Rather Than Recall | 4 | Labels, the hint and the required cue are all visible |
| 7 | Flexibility and Efficiency | 3 | Autofill, direct email and phone, and a pre-filled fallback email |
| 8 | Aesthetic and Minimalist Design | 3 | Calm; the sidebar and "What happens next" make the area a little busy |
| 9 | Error Recovery | 4 | Clear "wasn't sent", work kept, focus returned, pre-filled fallback that explains the 1,500-character cut |
| 10 | Help and Documentation | 3 | The hint, the FAQ route and the next steps cover it |
| **Total** | | **33/40** | **Good** |

## Design Specificity Verdict

**Design review:** the copy is now Dipai's own. The layout is still the standard two-column B2B contact pattern. The one design-system move is the step line, which turns into the yellow signal once the message is sent. Visitors only see what it means after they send, so at rest it's a quiet grey timeline.

**Automated scan:** no findings again.
- **Source markup:** 0 findings.
- **Rendered page (dark):** 0 findings at 1280 and 390.
- **Light theme:** 4 shared footer-heading advisories (4.47:1).
- **Built file:** the same 8 shared-stylesheet advisories as before. One is the marquee false positive.
- **Homepage sanity check:** 23 findings, so the scanner is working.

Verified by the scan:
- The "Contact" nav item is white and underlined, no longer yellow.
- Yellow elements at the fold: 2 at 1440×900 (header CTA and Send), 1 at 1280, none at 800 or 390.
- Errors use coral: 4.24:1 dark, 5.14:1 light.
- No main-content text below 7.62:1 in dark.
- Reduced motion turns off the line animation.

**Visual overlays:** URL scans only; no overlay was injected.

## Overall Impression

31 → 33. The failure path now scores 4. What's left is mostly words in the success state, plus one structural issue: the content order on phones. Beyond that, reaching "excellent" means letting the signal line work before sending, not only after.

## What's Working

1. **Failure handling.** The message plainly says it wasn't sent, the visitor's text is kept and focus returns to Send. The fallback email is pre-filled and explains the 1,500-character cut. A dropped connection is worded separately.
2. **Validation and limits.** Specific coral errors under each field, a summary for several errors, "N characters left" announced once, and a warning when pasted text is cut.
3. **The success moment.** A yellow node and a drawn line give it a peak. Name and email are kept for a follow-up message.

## Priority Issues

**[P2] The success step doesn't read coherently, and it drops the reply promise**
- **Why it matters:** "Message received" sits above a caption written for "We reply within 24 hours". The heading says "on its way" while the step says "received". The only reply-time promise disappears just when the visitor wants it.
- **Fix:** give the sent state its own caption: "We'll reply by email within 24 hours, from the team that runs the platform." Change the heading to "Thank you. We've received your message."
- **Suggested command:** `/impeccable clarify`

**[P2] On phones, the visual order and the keyboard order differ**
- **Why it matters:** below 900px, CSS moves "Prefer to email or call?" above the form, but in the page code it still comes after the form. Keyboard users reach those links after Send. That falls short of WCAG 2.4.3 in spirit.
- **Fix:** put the direct-contact block before the form card in the page code, and use grid areas to place it in the right column on desktop.
- **Suggested command:** `/impeccable adapt`

**[P3] The success actions are in the wrong order**
- **Why it matters:** "While you wait:" is followed first by the bordered "Send another message", which is the strongest action and the least "while you wait".
- **Fix:** drop "While you wait:", lead with the two links and put "Send another" last.
- **Suggested command:** `/impeccable clarify`

**[P3] Focus rings break the design system's colour rule**
- **Why it matters:** in dark mode, links and buttons get yellow focus rings while inputs get Focus Blue. DESIGN.md reserves Focus Blue for keyboard focus, so the yellow rings add signals while tabbing. This may be a sitewide decision.
- **Suggested command:** `/impeccable polish`

**[P3] The paste warning is vague, and long drafts can be lost**
- **Why it matters:** the warning is 11px muted text that doesn't say how much was cut. A refresh or a reloaded phone tab loses a long enquiry.
- **Fix:** "The last 400 characters didn't fit." in ink. Keep a per-visitor draft in sessionStorage (wrapped in try/catch) and clear it on success.
- **Suggested command:** `/impeccable harden`

## Persona Red Flags

- **Jordan (first-time visitor):** after sending, can't tell when the reply will come.
- **Sam (keyboard or screen reader):** on phones, reaches email and phone after the form. Focus rings change colour between inputs and buttons.
- **Casey (mobile):** the form starts at y 537, so only the Name field is visible on the first screen. A reload loses the draft.
- **Ingrid (superintendent):** the success state doesn't say whether a technical person will reply.
- **Erik (executive):** the time commitment disappears after sending.

## Minor Observations

- The meta description says "usually" within 24 hours; the page says "within 24 hours".
- The CSS comment still says "three steps".
- "Your message wasn't sent." should be bolder than the rest of the error box.
- The Email and Call rows in the sidebar are spaced loosely.
- `showFallback` reads a `company` field that this form doesn't have. It's harmless, since the demo form uses it.

## Questions to Consider

- What if the signal line were active at rest, with the node sitting on "Send message" as step one?
- Should the success state say who replies ("a platform specialist, not a sales queue")?
- Should DESIGN.md settle the yellow-versus-blue focus ring sitewide?
