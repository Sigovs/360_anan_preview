# Adding a page

`about.html` is the template. A new page should cost **markup and copy** — not a
stylesheet, and not a line of JavaScript. If you find yourself writing either,
something is missing from this document and it is worth fixing here rather than
working around it.

This applies to the **index2 family** (`index2.html`, `about.html`, anything
new). `index.html` and `index3.html` are separate directions with their own
stylesheets and are not built from these partials.

---

## 1 · Create the source page

Pages are authored in `src/pages/` and written to the repo root by
`npm run pages`. Start by copying `src/pages/about.html`.

The file opens with a front-matter comment. Four dashes, so it can never collide
with an ordinary comment, and it stays a comment so an unbuilt source page still
opens in a browser:

```html
<!---
TITLE:        Vehicle Care — 360 Auto Care Inc · Lynbrook, NY
DESCRIPTION:  One sentence. It is the meta description, so write it for a search result.
HOME:         index2.html
HOME_LABEL:   to the home page
SOLID_AFTER:  .phead
--->
```

| Key | What it does |
|---|---|
| `TITLE` · `DESCRIPTION` | `<title>` and the meta description |
| `HOME` | Prefix for the homepage's section anchors. **Empty on `index2.html`, `index2.html` everywhere else** — this is what makes the shared nav point at the right place from an interior page |
| `HOME_LABEL` | The tail of the wordmark's accessible name |
| `SOLID_AFTER` | The selector the masthead goes opaque *after*. `.phead` for an interior page. It must name a real element on the page, or the header turns solid over live content |
| `ON_ABOUT` | Only `about.html` sets this. Marks About with `aria-current="page"` |
| `NEEDS_REVIEWS` | Only the homepage sets this. Loads `reviews.data.js` |
| `OUT` | Optional. Output filename, if it should differ from the source filename |

Then the shell, which is the same on every page:

```html
<!doctype html>
<html lang="en" data-motion2>
<head>
{{> head }}
</head>
<body>
<a class="sr-only" href="#main">Skip to content</a>
{{> masthead }}
<main id="main">
  … the page …
</main>
{{> footer }}
{{> scripts }}
</body>
</html>
```

**`data-motion2` on `<html>` is required on any page without a `.hero2`.** It is
how the motion system knows this page belongs to the family. Without it the page
is silently static.

Run `npm run pages` (or `npm run build`, which includes it). An unknown `{{ KEY }}`
is a build error rather than an empty string, so a page cannot ship with a blank
title or a literal `{{ PHONE_HREF }}` in the markup.

**Add the page to the nav by hand** — `src/partials/masthead.html` and
`src/partials/footer.html`. Note the comment in the masthead before adding a
fifth desktop label: four is a measured limit, not a preference. New pages
belong in the mobile menu and the footer.

---

## 2 · Use the blocks that exist

Every one of these is already styled and already animated.

| Block | Markup | For |
|---|---|---|
| **Page head** | `.phead` + `.phead__media` + `.phead__panel` | The opening. A photograph, an eyebrow, an H1 and a lead — at about a third of the homepage hero's height |
| **Split** | `.band` + a Bootstrap row + `.split2__media--fill` | Photograph one side, copy the other. **Alternate the sides** down the page |
| **Text band** | `.band--panel` + `.sec-head` + two columns | A statement with supporting columns and no photograph |
| **Rail** | `.rail2` + `.rail2__set` + `.rail2__item` | Four short hairline facts |
| **Moment** | `.moment2` + `.moment2__media` + `.moment2__line` | One full-bleed photograph carrying one line. **At most one per page** |
| **Record** | `.plate2` as a `<dl>` | Facts as a record — label left, value right |
| **Close** | `.band--deep` + `.sec-head--center` | The page's resolution. Two actions, never three |

Grounds alternate: `.band` (base) · `.band--panel` (one step up) ·
`.band--deep` (one step down) · `.band--light` (the inverted band, used **once**
on the whole site — do not reach for it).

---

## 3 · Turn the motion on

Add `data-scene` to a section and it inherits the homepage's entrance — label,
then masked heading lines, then the rule, then the copy, and a curtain over the
frame if the section has one:

```html
<section class="band" id="care" data-scene="right">
```

**The value names the side the TEXT is on**, not the picture. It is not
alternated for variety: the type should arrive from its own column rather than
travelling across the photograph. A split with copy on the right is `"right"`.

`.phead`, `.moment2` and `.rail2__item` bind on their own and need no attribute.

Nothing is ever hidden in the markup or the stylesheet — every hidden state is
written by script after GSAP is confirmed present. No JavaScript, a thrown
error, or `prefers-reduced-motion` all end on the finished page. Do not add a
hidden starting state in CSS; it breaks that guarantee.

---

## 4 · Before it is done

- **Type over a photograph is measured on the composited render.** Not on the
  source image, not on the token table, and over the glyph runs rather than the
  block box. Wide and narrow formats are separate measurements: the head's scrim
  is horizontal above 62rem and vertical below it, and getting that wrong cost a
  lead 3.22:1 against the 4.5 it owed. Figures go in
  [CONTENT-TODO.md](CONTENT-TODO.md#measured-contrast).
- **Replacing an image means re-measuring.** The scrims are tuned to the
  photographs currently in place.
- **Never invent a business fact.** Hours, founding year, staff, certifications
  and reviews are unconfirmed. Mark the slot with `data-placeholder="true"` and
  add it to CONTENT-TODO; `?todo` outlines every marked value on the site.
- **Every image is generated art direction.** On a page about the business
  itself a building reads as *this building* and a face reads as *this person* —
  neither is true. Alt text describes the frame and claims nothing.
- Check the page at 390, 768, 1440 and 1920, and confirm nothing is left hidden
  after a full scroll.
