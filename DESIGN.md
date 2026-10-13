---
name: Dipai
description: Vessel data turned into clear signals — a calm, ocean-dark interface where one yellow marks what matters.
colors:
  signal-yellow: "#ffd600"
  signal-yellow-pressed: "#e6c100"
  deep-sea-navy: "#1c2b39"
  raised-hull: "#25394b"
  abyss-navy: "#142431"
  night-shadow: "#080f18"
  harbour-slate: "#2c4a61"
  mist-blue: "#cdddea"
  foam-white: "#f2f6fa"
  paper-white: "#f8fafb"
  pure-white: "#ffffff"
  haze-grey: "#c2d1dd"
  steel-grey: "#8699a7"
  deep-steel: "#435b71"
  focus-blue: "#538bb7"
  alert-coral: "#ff6b57"
typography:
  display:
    fontFamily: "Manrope Variable, Arial, sans-serif"
    fontSize: "clamp(48px, 4.5vw, 72px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Manrope Variable, Arial, sans-serif"
    fontSize: "clamp(34px, 3.5vw, 53px)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.055em"
  title:
    fontFamily: "Manrope Variable, Arial, sans-serif"
    fontSize: "27px"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.055em"
  body:
    fontFamily: "DM Sans Variable, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  body-small:
    fontFamily: "DM Sans Variable, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "DM Sans Variable, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 550
    lineHeight: 1.4
    letterSpacing: "0.14em"
  button:
    fontFamily: "DM Sans Variable, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 650
    lineHeight: 1.2
  category-mono:
    fontFamily: "monospace"
    fontSize: "9px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.08em"
rounded:
  input: "5px"
  control: "8px"
  card: "10px"
  panel: "18px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  section: "110px"
  section-phone: "65px"
  container: "1240px"
components:
  button-primary:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.deep-sea-navy}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.signal-yellow-pressed}"
    textColor: "{colors.deep-sea-navy}"
  button-secondary:
    backgroundColor: "{colors.raised-hull}"
    textColor: "{colors.foam-white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.deep-steel}"
    textColor: "{colors.pure-white}"
  input:
    backgroundColor: "{colors.deep-sea-navy}"
    textColor: "{colors.foam-white}"
    rounded: "{rounded.input}"
    padding: "11px 13px"
  card:
    backgroundColor: "{colors.raised-hull}"
    textColor: "{colors.foam-white}"
    rounded: "{rounded.card}"
    padding: "32px"
  category-chip:
    backgroundColor: "{colors.harbour-slate}"
    textColor: "{colors.mist-blue}"
    typography: "{typography.category-mono}"
    rounded: "{rounded.pill}"
    padding: "6px 10px"
  kpi-callout:
    backgroundColor: "{colors.deep-sea-navy}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.card}"
    padding: "21px 23px"
---

# Design System: Dipai

## Overview

**Creative North Star: "The Signal at Sea"**

Dipai's interface is a quiet, ocean-dark surface where vessel data comes up as clear signals: a yellow node travelling to the tab you chose, a line drawing itself across a chart, a single number typed into a callout beside a ship. Everything else stays calm and deep. The navy layers are the sea; the information is what breaks the surface. The site serves technical evaluators and executives alike, so it reads like a well-run instrument panel — precise and legible — without becoming a dense engineering tool.

Dark is the shipped theme and the reference for every decision. A light theme exists in code (`:root` in `src/styles/foundation.css`) but is hidden behind `themeSwitching` in `src/data/site-config.js` until it reaches the same quality; design dark first and keep light tokens in step.

Motion is part of the voice. It is precise and purposeful — nodes travel, lines draw, values write in, panels spring open once — and always respects reduced motion. Nothing loops for attention except the ribbons and hero rotation, which carry pause controls.

**Key Characteristics:**
- Deep navy tonal layers; hairline blue-grey borders; depth from tone, not shadow.
- One accent, Signal Yellow, reserved for what to act on or notice.
- Manrope headlines with tight negative tracking over a DM Sans body.
- Data shown as real charts and diagrams, drawn in the same quiet palette.
- Motion that traces cause and effect, plays once, and replays on request.

## Colors

A narrow, cool navy-and-mist palette with a single warm signal.

### Primary
- **Signal Yellow** (#ffd600): the only accent. Primary CTAs ("Book a demo"), the active-tab selector node and edge light, the hero headline's emphasised words, the latest or outlier data point, and the bullet markers in dark lists.
- **Signal Yellow Pressed** (#e6c100): hover and pressed state of yellow controls only.

### Neutral
- **Deep Sea Navy** (#1c2b39): page background (`--surface-base`) and input fill; also the text colour on yellow.
- **Raised Hull** (#25394b): cards, panels, tabs and secondary buttons sitting one step above the page.
- **Abyss Navy** (#142431): deep overlays and backdrops.
- **Night Shadow** (#080f18): the only shadow tint, used at low alpha.
- **Harbour Slate** (#2c4a61): alternate section bands (`--surface-section`) and category chips.
- **Mist Blue** (#cdddea): the source of every hairline. Borders, dividers and grid lines are Mist Blue at 15–40% alpha.
- **Foam White** (#f2f6fa): primary text on dark.
- **Haze Grey** (#c2d1dd): secondary and supporting text (`--muted`).
- **Steel Grey** (#8699a7): reference lines in charts, and quiet text in the footer.
- **Deep Steel** (#435b71): hover fill for secondary buttons.
- **Paper White** (#f8fafb) / **Pure White** (#ffffff): navigation text, hero text, and light-theme surfaces.

### Functional
- **Focus Blue** (#538bb7): keyboard focus outlines only.
- **Alert Coral** (#ff6b57): the critical state in condition charts (the critical limit line and its tint). It is a status colour, not a brand colour.

### Named Rules
**The One Signal Rule.** Signal Yellow marks only the single thing to act on or notice in a view: the primary action, the active selection, the latest or outlier value. It is never decoration, never a large fill, and never two competing things on one screen.

**The Hairline Rule.** Borders and dividers are always Mist Blue at partial alpha (15–40%), never solid greys. Lines should be felt, not seen.

## Typography

**Display Font:** Manrope Variable (with Arial, sans-serif)
**Body Font:** DM Sans Variable (with Arial, sans-serif)
**Label/Mono Font:** system monospace, for category chips only

**Character:** Manrope at weight 500 with tight negative tracking gives headlines a compact, engineered confidence; DM Sans keeps body copy open and readable at small sizes. Weight carries hierarchy far more than colour.

### Hierarchy
- **Display** (500, clamp(48px, 4.5vw, 72px), 1.12): page heroes. The home hero is slightly smaller (clamp(44px, 4vw, 62px)) and colours its key phrase Signal Yellow.
- **Headline** (500, clamp(34px, 3.5vw, 53px), 1.12): section headings.
- **Title** (500, 27px, 1.12): card and panel titles.
- **Body** (400, 15px, 1.6): running text; panel descriptions drop to 12px with 1.8 leading and stay under ~445px wide.
- **Label** (550, 11px, 0.14em, uppercase): eyebrows and small section labels.
- **Category chip** (monospace, 9px, 0.08em, uppercase): the module category pill on panels.
- **Chart text** (DM Sans, 10–11px): axis titles and ticks in Haze or Steel Grey; data labels in Foam White at 650 weight.

### Named Rules
**The Tight Headline Rule.** Every Manrope heading uses −0.055em tracking and 1.12 leading. Don't loosen them for emphasis; use size and the yellow highlight instead.

## Layout

A centred container (max 1240px) with generous gutters: 56px each side on desktop, 40px below 1100px, 32px below 900px, 21px below 600px. Sections breathe at 110px vertical padding on desktop and 65px on phones, alternating Deep Sea Navy and Harbour Slate bands.

Content is mostly two-column on desktop — copy and controls on the left, a visual or panel on the right — collapsing to a single column at 900px. The platform section shows tabs beside one panel on desktop; below 900px it becomes a sticky, swipeable tab strip over one card per module, with the selection following the scroll. Charts are built as HTML/SVG hybrids: plot geometry stretches, while text, points and labels keep their real size at every width, with phone-specific simplifications (every other month label, dropped secondary values, a two-row flowchart).

## Elevation & Depth

The system is flat and tonal. Depth comes from stepping navy layers (Deep Sea Navy → Raised Hull) and from hairline borders, not from shadows. The few shadows that exist are wide, soft and very low in alpha, tinted Night Shadow, and they sit under floating panels such as the footer. Translucency is used sparingly: the KPI callouts over the hero photograph and the footer panel over the network mesh (91% and 88% navy).

### Shadow Vocabulary
- **Footer float** (`box-shadow: 0 12px 40px color-mix(in srgb, #080f18 14.9%, transparent)`): the floating footer panel only.

### Named Rules
**The Tone-Not-Shadow Rule.** To lift a surface, step it to Raised Hull and give it a Mist Blue hairline. Reach for a shadow only for a panel that genuinely floats over imagery or mesh.

## Shapes

Gently rounded, instrument-like forms. Inputs use a tight 5px radius, buttons and tabs 8px, cards and panels 10px, and the large floating footer 18px. Chips and the vessel-type selector are full pills. The hero KPI callout keeps three rounded corners and one square corner (10px 10px 10px 0) where its connector line meets it, so it reads as a label attached to a point on the vessel.

## Components

### Buttons
Confident but compact.
- **Shape:** gently rounded (8px).
- **Primary:** Signal Yellow with Deep Sea Navy text, 13px at 650 weight, 10px 16px padding. This is the "Book a demo" action.
- **Hover / Focus:** hover darkens to Signal Yellow Pressed; focus shows a 2px Focus Blue outline.
- **Secondary:** Raised Hull fill with Foam White text, hovering to Deep Steel with white text. Used for "Log in" and quieter actions.
- **Text button:** no fill, 13px at 550 weight, followed by a chevron (›). It hovers to Signal Yellow on dark imagery.

### Chips
- **Category chip:** Harbour Slate fill, Mist Blue monospace text, a Mist Blue hairline and pill shape. It labels a module ("SEEMP", "MRV & EU ETS").

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** Raised Hull, or a horizontal gradient from Raised Hull fading to 25% for product panels.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** Mist Blue hairline at ~25%. Hovering draws a yellow "border orbit" — a short light trail travelling around the card edge.
- **Internal Padding:** 32px desktop, 23px on phones.

### Inputs / Fields
- **Style:** Deep Sea Navy fill, Mist Blue hairline at ~33%, 5px radius, 16px text, 11px 13px padding.
- **Focus:** Focus Blue outline.

### Navigation
A sticky Deep Sea Navy header with the white Dipai logo, 12px Paper White links, a secondary "Log in ›" and a primary "Book a demo". Below 900px the links fold into a Menu panel.

### Platform Tabs (signature)
Stacked tabs filled with a fading Raised Hull gradient, separated by 2px base-colour gaps. The selected tab gets a lighter fill and a soft yellow glow from its outer edge. Changing tabs sends a yellow node with a fading trail along the edge to the new tab, then spreads light along that tab's edge. The narrow-screen strip uses the same treatment along the bottom edge.

### Vessel KPI Callout (signature)
A translucent navy label (91%) with a Mist Blue hairline, connected to a point on the hero vessel by a drawn yellow line. Its label, value and qualifier type out letter by letter with a caret, and line breaks are fixed before typing starts.

### Platform Charts (signature)
Single-series, single-axis charts drawn in Foam White (dark) or Harbour Slate (light) on hairline grids. Signal Yellow marks the latest or outlier value. Reference and target lines are dashed Steel Grey; warning and critical limits are dashed yellow and Alert Coral. Each chart animates once per view in about 2s — lines draw, points pop on a spring, values write in — and replays when its tab is selected again.

## Do's and Don'ts

### Do:
- **Do** design in the dark theme first; it is the only theme visitors see.
- **Do** keep Signal Yellow (#ffd600) to one focal element per view: the primary CTA, the active selection, or the key data point.
- **Do** build depth with Raised Hull (#25394b) and Mist Blue hairlines at 15–40% alpha.
- **Do** set every Manrope heading at weight 500 with −0.055em tracking and 1.12 leading.
- **Do** give every animation a reduced-motion fallback that shows the final state, and a pause control for anything that repeats.
- **Do** keep chart text at real size across widths, and simplify charts for phones rather than scaling them down.

### Don't:
- **Don't** use Signal Yellow as a background fill, a decorative stroke, or on two competing elements in one view.
- **Don't** introduce new accent hues; status colours (Alert Coral) belong only to data states.
- **Don't** add heavy or dark drop shadows; the footer float is the ceiling.
- **Don't** use solid grey borders; borders are Mist Blue at partial alpha.
- **Don't** let animated text reflow while it animates; reserve its final layout first.
- **Don't** present illustrative chart values as customer results.
