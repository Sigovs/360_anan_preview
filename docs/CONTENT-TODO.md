# Content to confirm before launch

Everything below is a placeholder I could not verify. Append **`?todo`** to the
URL to outline all of them on the page.

The phone number is from the reserved 555-01xx fictitious range, so it cannot
ring a real person. The address and hours say on the page that they are
unconfirmed. **Section 10's reviews and rating are visible placeholders** — see
§4, which is the most important item on this list.

---

## 1 · Phone number — 5 places

Currently `(516) 555-0100`, `tel:+15165550100`.

| File | Where |
|---|---|
| `index.html` | masthead link |
| `index.html` | mobile menu panel |
| `index.html` | hero anchor row |
| `index.html` | contact section — the large typographic phone |
| `index.html` | footer |
| `src/js/main.js` | the form's preview notice text |
| `index.html` | JSON-LD `telephone` (currently `TO CONFIRM`) |

Find and replace both the display form and the `tel:` href. The display form is
non-breaking-spaced (`(516)&nbsp;555-0100`) in the masthead and hero so it never
splits across lines.

## 2 · Street address — 3 places

Currently *"Street address to confirm · Lynbrook, NY 11563"*.

- hero anchor row
- contact section address plate
- JSON-LD `streetAddress` (currently `TO CONFIRM`)

The **Get directions** link in the contact section currently searches Google Maps
for `360 Auto Care Inc Lynbrook NY`. Once the address is confirmed, point it at
the shop's own Google Business Profile place URL instead.

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

**If any image is replaced, re-measure.** The scrims are tuned to these
photographs.
