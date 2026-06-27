# Clara's Day Dive — Design System

A retro-playful brand system for **Clara's Day Dive**, a neighborhood coupe/dive bar in
Austin, TX. The feeling: Squarespace-level editorial polish (confident type, generous
whitespace, no clutter) crossed with Aperol-era Italian-poster warmth and Austin dive-bar
charm. The mascots are two penguins diving into a coupe glass; the rallying cry is
**"Dive in for a day drink."**

---

## Sources & provenance

- **Brand assets** were provided as packaged logo files (`CLR-230718-*`), copied into
  `assets/`: color + B&W combomark, logo symbol (penguins/coupe), wordmark, the "C"
  monogram icon, and the full scarf/bandana illustration.
- **Original `.ai` (Adobe Illustrator) vector files** were included in the upload set but are
  not web-renderable here; the high-res PNG/JPG exports were used instead. If you need crisp
  vector at any scale, ask the user for SVG exports of the `.ai` files.
- **Design brief** (from the site developer): single-page bar website — Hero (logo + AI
  search), Drinks menu, What's Here (food trucks / coffee / patio), Events calendar, Event
  coordinator contact form. Mobile-first (design starts at 390px), Squarespace-style
  alternating cream/white full-bleed sections, sticky nav, prominent AI search, the
  penguin/coupe illustration as a hero element (not a small stamp), local-business SEO.

---

## Font substitution — please confirm

The logo lettering is **custom hand-drawn type** (a bold retro brush script for "Clara's"
and a vintage shadowed gothic for "DAY DIVE"). Per the developer's spec the system uses:

- **Playfair Display** (italic) — editorial display headlines
- **DM Sans** — body & UI
- **Grand Hotel** — *substituted* Google Font approximating the "Clara's" script, for
  incidental script flourishes only.

> ⚠️ **Action needed:** Grand Hotel is only a rough stand-in for the custom wordmark script.
> For the actual "Clara's" lettering, always use the wordmark/logo PNGs in `assets/`. If you
> have the licensed display/script font files, send them and we'll wire up `@font-face`.

---

## Content fundamentals — how Clara's writes

- **Voice:** warm, witty, unpretentious — a friendly bartender, not a sommelier. Playful but
  never goofy; confident but never stuffy.
- **Person:** addresses the guest as **you**; the bar speaks as **we**. ("Sun's out, penguins
  in." / "Tell us about your event.")
- **Casing:** Sentence case for body and most headlines. **UPPERCASE** is reserved for
  eyebrows/labels (the "DAY DIVE" energy) with wide tracking. Avoid Title Case.
- **Length:** short. Headlines are a few words; body sentences are tight and breezy.
- **Local flavor:** light Austin/Texas color is welcome ("y'all", "east side", "patio till
  midnight"). Don't overdo the accent.
- **Puns:** dive / day-drink / penguin wordplay is on-brand in moderation ("Dive in for a day
  drink", "Cheers, y'all"). One per surface, not every line.
- **Emoji:** **not used** in the brand voice. Personality comes from the illustrations and
  type, not emoji.
- **Examples:** eyebrow → `WHAT'S POURING TODAY`; headline → *"Dive in for a day drink"*;
  CTA → `Reserve the patio`, `Dive in`, `RSVP`; form prompt → "Tell us about your event."

---

## Visual foundations

- **Palette:** warm **cream** `#EDE5CF` paper base; **deep rose** `#C2556A` primary accent;
  near-black **penguin ink** `#1C1C1A` for type; **sage** `#7A9B7C` secondary labels; **teal**
  `#2CAAA0` callouts. Supporting tints pulled from the artwork: drink **pink** `#E0A6AC`,
  butter **sun** `#EBE2A6`, antique **gold** `#B08D3F`. Never pure `#fff`/`#000` — use paper
  white `#FBF8F0` and penguin ink.
- **Type:** Playfair Display *italic* for big poster headlines (tracking −0.02em, line-height
  ~1.04); DM Sans for everything functional (17px default body, 1.55 line-height). Eyebrows
  are uppercase DM Sans 700, tracking 0.16em, in sage or teal.
- **Layout:** mobile-first from 390px. Squarespace-style full-bleed sections that **alternate
  cream and paper-white** backgrounds; occasional rose or ink feature blocks. Content max
  ~1180px, prose measure ~720px, generous side gutters and tall section rhythm — *let the logo
  breathe.*
- **Backgrounds:** flat warm color fields, no gradients. The hero leans on the **penguin/coupe
  illustration** as a large element. The scarf's engraving-style filigree and butter-sun halo
  are available as decorative motifs (use sparingly, as accents).
- **Imagery vibe:** hand-drawn, ink-line, cross-hatched vintage illustration; warm, slightly
  faded poster palette. Photography (if any) should feel warm and sunlit, never cool/clinical.
- **Corners & cards:** soft, friendly radii (cards 22px, inputs/buttons 14px, pills 999px).
  Cards are paper-white on cream with **warm-tinted soft shadows** (never gray/blue), a subtle
  hover-lift (translateY −3px) on clickable cards. Optional poster-style hard ink outlines for
  high-emphasis moments.
- **Buttons:** pill-shaped. Primary = rose fill with a rose-tinted shadow; secondary = ink
  outline that inverts on hover; callout = teal; ghost = transparent.
- **Borders:** default hairline is ink @15%; "poster" borders are solid 2px ink; antique gold
  is reserved for fine decorative rules.
- **Motion:** smooth and gentle. Settle easing `cubic-bezier(0.22,1,0.36,1)`; a soft playful
  overshoot `cubic-bezier(0.34,1.56,0.64,1)` for delight moments. Durations 140/240/480ms.
  Fades + small rises on scroll; no harsh bounces, no infinite loops on content.
- **Hover/press:** hover darkens fills (rose→`#A8455A`, teal→`#1E8980`) or warms outlines;
  press scales to ~0.96 (buttons) / 0.92 (icon buttons).
- **Focus:** teal ring — 4–5px `rgba(44,170,160,0.15)` halo plus a teal border.
- **Transparency/blur:** used lightly — a translucent cream sticky nav on scroll is the main
  case. No heavy glassmorphism.

---

## Iconography

- **No bundled icon font.** Clara's personality comes from the **hand-drawn illustrations**
  (penguins, coupe, scarf filigree), not a UI icon set.
- For functional UI glyphs (search, chevron, calendar, social, menu), use a **thin, rounded
  stroke** set — **Lucide** (`stroke-width` 2–2.2, round caps) is the recommended CDN match
  and pairs well with the soft radii. Load from CDN: `https://unpkg.com/lucide@latest`.
  The components here inline a few simple Lucide-style SVGs (search, chevron, sparkle).
- The **sparkle** glyph marks the AI search affordance.
- **Emoji:** not used. **Unicode** symbols are avoided as icons.
- The brand illustrations live in `assets/` — prefer them over inventing new iconography. Do
  not hand-roll new penguin/coupe art; reuse the provided files.

---

## Index / manifest

**Root**
- `styles.css` — global entry (consumers link this). `@import`s the token files only.
- `tokens/` — `fonts.css` (Google webfonts), `colors.css`, `typography.css`, `spacing.css`.
- `assets/` — logos (combomark, symbol, wordmark, icon) in color + B&W, and `scarf.jpg`.
- `SKILL.md` — Agent-Skills wrapper so this system works as a downloadable Claude skill.

**Components** (`window.ClaraSDayDiveDesignSystem_09d2bb.*`)
- `components/forms/` — `Button`, `IconButton`, `Input`, `Textarea`, `Select`
- `components/display/` — `Eyebrow`, `Badge`, `Tag`, `Card`
- `components/search/` — `SearchBar` (the hero AI "ask Clara" pill)
- `components/navigation/` — `NavBar` (sticky site nav) *(see file)*
- `components/patterns/` — `MenuRow`, `EventCard` *(see files)*

**UI kit**
- `ui_kits/website/` — single-page bar website recreation (hero + AI search, drinks menu,
  what's here, events, contact). `index.html` is the interactive entry.

**Design System tab cards** — foundation specimens live in `guidelines/*.card.html`
(Colors, Type, Spacing, Brand) and each component directory ships one `*.card.html`.

To use components in a card or kit: link `styles.css`, load `_ds_bundle.js`, then
`const { Button } = window.ClaraSDayDiveDesignSystem_09d2bb`.
