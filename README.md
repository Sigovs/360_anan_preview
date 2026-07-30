# 360 Auto Care Inc — one-page site

Dark industrial-editorial one-pager for a foreign & domestic repair shop in
Lynbrook, New York. Built on **Bootstrap 5.3** (SCSS source, twelve-column grid,
forms, collapse) with a project token layer on top.

**Preview build.** The phone and address are the shop's real details. What is
still placeholder: the opening hours, the Google reviews and rating, and the
form's endpoint. The page carries `<meta name="robots" content="noindex">` until
those are resolved — see [docs/CONTENT-TODO.md](docs/CONTENT-TODO.md).

---

## Run it

```bash
npm install          # bootstrap 5.3 + sass
npm run build        # css + css:min + js + vendor
npm run serve        # http://localhost:5188
```

`index.html` also opens straight from disk — the compiled CSS and JS are
committed, so no build step is needed just to look at it.

| Script | What it does |
|---|---|
| `npm run css` | `src/scss/main.scss` → `assets/css/main.css` (expanded) |
| `npm run css:min` | → `assets/css/main.min.css` (compressed) |
| `npm run watch` | recompile on save |
| `npm run js` | copy `src/js/*.js` → `assets/js/` |
| `npm run vendor` | copy Bootstrap's JS bundle → `assets/js/vendor/` |
| `npm run build` | all of the above |
| `npm run serve` | local static server on port 5188 |

`?todo` appended to the URL outlines every placeholder value on the page.

---

## Tree

```
.
├── index.html                  the whole site — twelve blocks, in page order
├── package.json
├── assets/                     everything the browser loads
│   ├── css/main.css            compiled · main.min.css for production
│   ├── js/main.js              page behaviour (copied from src/js)
│   ├── js/reviews.data.js      reviews + rating — PLACEHOLDER content, see docs
│   ├── js/vendor/              bootstrap.bundle.min.js
│   └── img/                     the art direction (see docs/IMAGE-DIRECTION.md)
├── src/
│   ├── scss/
│   │   ├── main.scss           the only entry point; compile order documented in it
│   │   ├── config/             Bootstrap variable overrides + utility trim
│   │   ├── tokens/             colour · space · type · motion · layers
│   │   ├── base/               ground, typography, a11y primitives
│   │   ├── components/         actions · media · forms
│   │   └── sections/           one partial per block, in page order
│   └── js/                     authored source for assets/js
├── docs/
│   ├── CONTENT-TODO.md         every placeholder, and where it lives
│   └── IMAGE-DIRECTION.md      how each photograph was made, with prompts
└── design_dna/                 the taste system this was built against
```

**Compile order is not cosmetic.** `main.scss` imports Bootstrap's functions,
then the project's variable overrides, then Bootstrap's own variables. A token
override only reaches what is compiled after it — anything already resolved
inside a shipped stylesheet is past the point a variable can change it.

---

## The design in short

- **Dark, layered ground** — four dark steps (`#090c0d` → `#1b2528`), never flat
  black, so depth comes from moving between tones rather than from shadows.
- **One accent, few roles** — safety-orange `#f47a17` on the wordmark numeral,
  the primary action, active state, index numerals, technical markers and the
  focus ring. Nothing else. Near-black ink on orange fills, never white
  (white on this orange measures 2.41:1).
- **Three type voices, one of them expressive** — Newsreader for display, Inter
  for reading, IBM Plex Mono for indices and labels. Only the display voice has
  character; the other two are deliberately quiet, and one italic word per
  headline is the page's only typographic flourish. The optical-size axis is left
  to `font-optical-sizing: auto` at every rank, so a fluid size gets the drawing
  its size was designed for; only tracking is pinned per rank, because tracking is
  a compositional decision and no font can make it.

  Two earlier stacks failed, and both failures were the same shape. Archivo
  condensed + Inter + Plex Mono were three neutral technical grotesques, so every
  rank was built from size alone. Bodoni Moda fixed the register and broke the
  rendering: its hairlines fall below one device pixel at 26px, which made the
  review score read as "1.8" and dropped the hyphen out of the phone number.
- **Three ink ranks, three mono steps** — ink is ranked `text` → `body` → `muted`
  so paragraphs are never set in the metadata grey; mono runs 11 / 12 / 13px
  depending on whether a label is glanced at or read. The one exception is the
  hero lead, which takes the full `text` ink because it is the only body-size copy
  set over a photograph.
- **One numbering system** — a small mono index opens an ordinary band, a large
  numeral opens a chapter; both carry the same section number.
- **Twelve-column editorial grid** — intervals between masses are grid columns
  (`offset-lg-1`), not padding, so every edge lands on the same axis.
- **Squares used three times** — hero → rail transition, the shop's offset
  fragments, the warranty mosaic. Not as page-wide decoration.
- **One motion language, no dependencies** — CSS transitions plus one
  IntersectionObserver and one rAF scroll frame. No GSAP, no scroll library: the
  whole system is ~4 kB of the stylesheet and one file of behaviour.
  · *Entrance* — the hero arrives in reading order over ≈1.05s, ending with the
    disc opening and the hung modules masking in.
  · *Scroll* — the header settles from 24px to 14px padding and its descriptor
    retires; the hero photograph lags 6% of its height with the wordmark at a
    third of that rate; five images drift ±26px against their own frames.
  · *Arrival* — bands fade and settle 14px, with variants (lateral drift, mask
    from left/right, scale) so no two chapters open the same way; structural
    hairlines draw themselves from their start edge.
  · *Interaction* — one hover idea at three scales (a rule growing from the start
    edge) on nav, text actions and footer links; the active service row takes an
    accent bar, a ground lift and a brighter numeral; fields take a focus rule and
    a label that warms with them.
  Every hidden-then-revealed state is applied by script under `.js-motion`, and a
  watchdog clears it after three seconds, so no-JS and reduced-motion both open on
  the finished page. Only opacity, transform and clip-path animate — the single
  exception is the masthead's padding, which is documented in place.
- **A reviews band in the page's own language** — hairline columns, a display
  rating figure, mono metadata, no plugin chrome. Content comes from one data
  file; see below on placeholders.

Every text/background pair was measured against the composited page, including
type over photography at its worst pixel. Ratios are in
[docs/CONTENT-TODO.md](docs/CONTENT-TODO.md#measured-contrast).

---

## Accessibility notes

- Skip link, visible 2px focus ring at ≥3:1 on every interactive element.
- The service directory works with no JavaScript: every `<details>` ships open,
  so all copy, related services and request links are readable. Script adds the
  desktop image stage, the progress rail and a native exclusive accordion below
  62rem.
- Reviews render from `assets/js/reviews.data.js`. **They are placeholders** —
  the section says so on the page, and no `Review`/`AggregateRating` structured
  data is emitted. See `docs/CONTENT-TODO.md` §4.
- Every focusable element clears a 24px minimum target and shows a 2px accent
  focus ring; every hover state has a focus equivalent (audited, no exceptions).
- Hover and keyboard focus drive identical state — tabbing through the service
  list changes the image exactly as a pointer does.
- No horizontal page scroll at 320px.
- `prefers-reduced-motion` neutralises every reveal, the hero entrance, the
  crossfades and the scroll drift explicitly — not just via the blanket reset —
  and the preference is re-checked if it changes mid-session.
- Star ratings are `role="img"` with an "N out of 5 stars" name, and the figure is
  printed in words beside the marks, so a rating never depends on counting shapes
  or on seeing the accent hue.
