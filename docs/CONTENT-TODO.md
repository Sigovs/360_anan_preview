# Content to confirm before launch

Everything below is a placeholder I could not verify. Append **`?todo`** to the
URL to outline all of them on the page.

**Resolved 2026-07-29:** the phone `(516) 820-0360` and the address
`10 N Prospect Ave, Lynbrook, NY 11563` are the shop's real details and are now
live everywhere on the page, in the `tel:` links, in the directions link and in
the JSON-LD.

Still outstanding: the opening hours (§3), the Google reviews and rating (§4 —
the most important item here), the form endpoint (§5) and the noindex (§6).

---

## 1 · Phone number — DONE

`(516) 820-0360` / `tel:+15168200360`, live in the masthead, the mobile menu, the
hero anchor, the contact section, the footer, the form's notice text and the
JSON-LD.

The display form is non-breaking-spaced in the masthead and hero so it never
splits across lines.

## 2 · Street address — DONE

`10 N Prospect Ave, Lynbrook, NY 11563`, live in the hero anchor, the contact
plate and the JSON-LD. The **Get directions** link and the reviews profile link
both search Google Maps for the full name and address; swapping them for the
shop's own Google Business Profile place URL is a small improvement worth making
when that URL is to hand.

## 3 · Opening hours — 2 places

Currently *Mon–Fri 8:00–18:00 · Sat 8:00–15:00 · Sun closed*, which is a typical
independent-shop schedule and **not** confirmed for this business.

- contact section hours plate
- footer hours plate

Consider adding `openingHoursSpecification` to the JSON-LD at the same time.

## 4 · Google reviews — section 10  ⚠ PLACEHOLDER CONTENT ON THE PAGE

**Section 10 currently displays placeholder reviews and a placeholder 4.8 / 126
rating.** They are in-brand stand-ins so the section could be designed and
presented — they are not live Google data and they are not real customers.

What protects this while it is a preview:

- No `Review` or `AggregateRating` structured data is emitted anywhere on the
  page, so no crawler is told this is a verified rating.
- The section prints a visible line: *"Example wording shown. Real reviews from
  the shop's Google profile replace these before launch."*
- The block carries `data-placeholder="true"`, so `?todo` outlines it.
- Reviewers are first name + initial, with no photographs and no permalinks.

**To go live**, in `src/js/reviews.data.js`:

1. Replace `summary` with the real rating and review count.
2. Replace `items` with real reviews, copied word for word — trim with an
   ellipsis if needed, but do not rewrite, tidy or translate them.
3. Point `profileUrl` at the shop's own Google reviews link.
4. Set `placeholder: false`. That drops the example-wording line and the outline.
5. `npm run js`.

Only the first three items render; the rest live behind the Google link.

> Do not paraphrase, compose, or move reviews from another business. A
> fabricated review is a false statement about a real customer, and a fabricated
> rating is a false claim about the business.

**If the real rating is materially lower than the placeholder, remove the rating
summary rather than shipping a flattering number** — the excerpts alone still
work as a trust layer.

## 5 · The request form has no endpoint

`src/js/main.js` intercepts the submit and shows a notice pointing at the phone.
Before launch, point the form at a real handler — Formspree, Netlify Forms, or
the shop's own script — and delete the preview branch. Search for
`TODO before launch` in that file.

## 6 · Remove the noindex

`index.html` line ~11:

```html
<meta name="robots" content="noindex, nofollow">
```

Delete it when the placeholders above are resolved. It is there so a preview
carrying an unverified phone number and address cannot be indexed.

## 7 · Photography

Every image is generated art direction, not photography of this shop. See
[IMAGE-DIRECTION.md](IMAGE-DIRECTION.md) — it records the model, the prompt and
the seed for each frame, so any single image can be replaced or regenerated. Real
photographs of the actual bays would be better than all of them; the direction
notes describe what to shoot.

Three frames carry small artefacts worth knowing about:

- `shop-exterior.jpg` — a generic *AUTO REPAIR SHOP* sign is legible above the
  bay doors. Fine as a stand-in, wrong once the shop's own signage exists.
- `service-03-brakes.jpg` — an illegible few characters on the rotor hub. Small
  and dark; visible if you look for it.
- `warranty-workorder.jpg` — the form on the clipboard reads as a generic
  service work order. Deliberately shallow-focused, but legible enough to notice.

---

## Measured contrast

Every pair below was measured on the **composited page** — for type over
photography, that means the rendered pixels including the scrim, at the single
worst pixel in the text's own area, not the image average.

### Flat surfaces

| Ink | Ground | Ratio | Needs |
|---|---|---|---|
| `--color-text` `#f1f0eb` | `--color-bg` `#090c0d` | 17.20:1 | 4.5 |
| `--color-text` | `--color-surface-raised` `#1b2528` | 13.72:1 | 4.5 |
| `--color-text-body` `#b4bfc1` | `--color-bg` | 10.43:1 | 4.5 |
| `--color-text-body` | `--color-surface-raised` | 8.32:1 | 4.5 |
| `--color-text-muted` `#929d9f` | `--color-bg` | 7.05:1 | 4.5 |
| `--color-text-muted` | `--color-surface-raised` | 5.62:1 | 4.5 |
| `--color-accent` `#f47a17` | `--color-bg` | 7.14:1 | 4.5 |
| `--color-accent-ink` `#090c0d` | `--color-accent` fill | 7.14:1 | 4.5 |
| ~~`--color-text` on accent fill~~ | | **2.41:1** | never used |
| `--color-cold-detail` `#60777b` | `--color-bg` | 4.13:1 | 3.0 — boundaries and markers only, never body text |
| `--color-line` `#2b3537` | `--color-bg` | 1.56:1 | decorative hairlines only, never a control boundary |

### Type over the hero photograph, worst pixel

| Element | Desktop | Mobile 390 | Needs |
|---|---|---|---|
| accent eyebrow, 12px | 7.10:1 | 5.99:1 | 4.5 |
| H1 | 15.15:1 | 15.72:1 | 3.0 |
| lead, 17–21px | 5.06:1 | 5.77:1 | 4.5 |
| anchor label, 12px | 5.53:1 | 6.05:1 | 4.5 |
| phone | 12.76:1 | 14.43:1 | 3.0 |
| address, 12px | 5.79:1 | 6.45:1 | 4.5 |

### Type over the detailing photograph (section 06), worst pixel

| Element | Ratio | Needs |
|---|---|---|
| chapter numeral 06, 34px accent | 7.10:1 | 3.0 |
| label VEHICLE CARE, 12px muted | 6.67:1 | 4.5 |
| H2 AUTO DETAILING | 16.07:1 | 3.0 |
| panel copy, 17px | 16.37:1 | 4.5 |

Two of those needed the scrim moved, not the text changed: the anchor label came
out at 4.34:1 on desktop and the mobile headline at 1.87:1 where it crossed a
taillight. Both were fixed at the background layer.

### `index2.html` — type over the full-screen hero photograph, worst pixel

Separate page, separate palette and separate scrims. Measured after the hero
became a full-viewport photographic ground at every format, on the composited
render with the type layer hidden, over the glyph runs themselves rather than
the stretched flex boxes.

| Element | 390×844 | 1440×900 | 1920×1080 | 2560×1440 | Needs |
|---|---|---|---|---|---|
| eyebrow, 12px `--ink-body` | 6.27:1 | 8.86:1 | 8.86:1 | 7.54:1 | 4.5 |
| H1 | 9.31:1 | 9.91:1 | 4.23:1 | 5.60:1 | 3.0 |
| lead, 15–20px `--ink-body` | 6.73:1 | 7.93:1 | 7.62:1 | 6.84:1 | 4.5 |
| secondary action label, 13px | 16.96:1 | 16.10:1 | 14.84:1 | 17.39:1 | 4.5 |

**Hero frame replaced 2026-07-30 (hero-lift-3.jpg) and re-measured at 1440x900:** the
figures in that column are the new photograph. It runs brighter overall, but its
empty left field — where the type sits — is DEEPER than the frame before it, so
every pair improved rather than degrading. The 1920 and 2560 columns still carry
the previous photograph and are due a re-measure.

The H1 figures fell when the display rank was raised to a 5rem ceiling — a larger
headline reaches further into the lit part of the vehicle. 4.23:1 at 1920 is the
tightest number on this page and the one to watch: it is comfortably over the 3.0
large text owes, but it has no room left for another size increase without the
left scrim being deepened to match.

**Measure with the webfonts actually loaded.** `document.fonts.size` must be 43
before a figure is taken. A failed Google Fonts request falls back to whatever
Chakra Petch is installed locally, which on at least one machine here is an
oblique cut — the metrics happen to match, so the wrap and the geometry survive,
but nothing about that is guaranteed.

The eyebrow is the one element that changed rather than the scrim. At
`--ink-muted` it measured **3.76:1** on the 390 render — the scrim deep enough to
carry it there also flattened the vehicle's lower body, which is the subject. It
now runs one rank up, at `--ink-body`; the rank is still unambiguous because a
12px mono label tracked .16em cannot be mistaken for the lead at any tone.

**If any image is replaced, re-measure.** The scrims are tuned to these
photographs.

---

## `index2.html` footer social links — NOT CONFIRMED

Three marks were added to the footer (Facebook, Instagram, Google Business
Profile). **Their `href`s are dead on purpose.** Nobody has confirmed that this
shop has these accounts, let alone their addresses, and a plausible-looking
guess at a social URL is exactly the kind of invented business fact this file
exists to prevent. They carry `data-placeholder="true"`, so `?todo` outlines
them with everything else unconfirmed.

Before launch: replace each `href` with the real profile, or delete the block.
Do not ship dead links.

## `index2.html` contact — removed copy

The label row above the request form ("Service request" / "Replies same working
day") was removed at the client's request and replaced with a rule. The second
of those was an unverified service promise, so nothing was lost that was known
to be true. The form keeps `aria-label="Service request"`, so its accessible
name survived the visible label.

## `index2.html` map band — to confirm

The band under the contact section embeds OpenStreetMap tiles, which need no API
key and carry their own attribution inside the frame. Three things are open:

1. **No pin is dropped.** The street address is confirmed; its coordinates are
   not, and a pin in the wrong place is worse than no pin. The frame is centred
   on Lynbrook. Add a marker once the coordinates are verified.
2. **The directions link routes on the address string**, not on coordinates, so
   it is exact regardless of what the tiles are centred on. It goes to Google
   Maps; nothing about that choice is load-bearing.
3. **Tiles vs. a styled map.** OSM's public tiles have a usage policy and no
   styling API — the dark treatment is a CSS filter over a light map, and the
   attribution is inverted along with everything else. If this ships to real
   traffic, move to a keyed provider (Google Embed, Mapbox, MapTiler) with a
   real dark style and re-check that the attribution stays legible.
