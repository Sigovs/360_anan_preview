# Image direction

Sixteen frames, one grade. **All of them are generated art direction, not
photographs of this shop** — see [CONTENT-TODO.md](CONTENT-TODO.md#7-photography).
Everything needed to replace or regenerate a single frame is recorded here.

**Model:** `fal-ai/flux-pro/v1.1-ultra`, `raw: true` (less processed, more
documentary), `safety_tolerance: 3`.

---

## The grade, held across every frame

Every prompt carries the same closing clause, which is what makes sixteen
separate generations read as one shoot:

> Dark, slightly desaturated cinematic colour grade, deep crushed shadows, muted
> highlights, cool grey-green ambient light, one warm sodium-orange work lamp as
> the only warm accent. Shot on 35mm film, f/2.8, natural available light, candid
> documentary, unposed, nobody looking at the camera, no lens flare.

And the same exclusions:

> Absolutely no text, no signage, no letters, no numbers, no logos anywhere.

The warm lamp clause is doing double duty: it is the reason the accent colour
belongs to this page. `--color-accent` is the hue the workshop lighting already
contains, so orange never competes with the photography — it continues it.

**What the direction refuses**, and why: no exotic cars (the subject is the
vehicles people actually depend on), no sparks where the job would not create
them, no staged handshakes, no faces to camera, no empty showroom garages, no
floating vehicle cut-outs.

---

## The frames

| File | Ratio | Subject | Where it is used |
|---|---|---|---|
| `hero-lift.jpg` | 16:9 | grey crossover on a two-post lift, technician beneath with a work light | 01 hero |
| `service-01-diagnostics.jpg` | 4:5 | hands holding a scan tool, cable into the OBD port | 03 stage |
| `service-02-maintenance.jpg` | 4:5 | gloved hands removing an oil filter, drain pan below | 03 stage |
| `service-03-brakes.jpg` | 4:5 | exposed rotor and caliper, wheel off, new pad going in | 03 stage · 01 hero module |
| `service-04-tires.jpg` | 4:5 | tyre and alloy on a balancing machine | 03 stage |
| `service-05-climate.jpg` | 4:5 | A/C manifold gauges on a fender, hoses into the bay | 03 stage |
| `service-06-care.jpg` | 4:5 | dual-action polisher on a dark door panel | 03 stage |
| `shop-bays.jpg` | 3:4 | two bays at night — minivan on a lift, pickup with its hood open | 04 the shop |
| `shop-detail-tools.jpg` | 1:1 | open drawer of wrenches on worn foam | 04 fragment · 01 hero module |
| `shop-detail-hub.jpg` | 1:1 | gloved hands fitting a wheel bearing into a hub | 04 fragment |
| `moment-underbody.jpg` | 21:9 | from the floor, looking up past a raised car's underbody | 05 full-bleed moment |
| `detailing-polish.jpg` | 21:9 | sedan in the detailing bay, one strip light along the flank | 06 detailing |
| `warranty-workorder.jpg` | 1:1 | work order on a clipboard under a desk lamp, deliberately out of focus | 07 mosaic |
| `warranty-counter.jpg` | 1:1 | technician and customer at the counter, both in profile | 07 mosaic |
| `inspection-lift.jpg` | 16:9 | used sedan chest-high on a lift, flashlight into the front subframe | 08 inspections |
| `shop-exterior.jpg` | 16:9 | the shop from the street at dusk, two bays lit warm from inside | 11 contact |

`warranty-counter.jpg` carries a **flat tonal wash** (`.media--tone`,
`brightness(0.82) saturate(0.88)`) — its own exposure ran lighter than the set,
and one frame jumping out of the sequence breaks the page's tonal structure.

---

## Composition constraints written into the prompts

The frames were art-directed for the layout, not chosen after it:

- **hero** — *"the lifted vehicle and technician occupy the left and centre, the
  upper right of the frame falls away into dark empty shop space"*, so the type
  mass has a genuinely quiet field to sit in rather than a scrim doing all the
  work.
- **moment-underbody** — *"the technician left of centre and dark quiet space to
  the right"*, so the single overlaid line has somewhere to go.
- **inspection-lift** — *"vehicle mass to the right, quiet dark space to the
  left"*, mirroring the shop band so the alternation reads as rhythm.
- **detailing-polish** — *"the car filling the right two thirds, quiet dark floor
  space to the left"*, which is what lets the copy attach to the lower-left
  corner instead of covering the subject.

---

## Post-processing

Resized and re-encoded with Pillow — progressive JPEG, `optimize=True`, quality
80–82, sized to the largest box each frame occupies:

```
hero-lift            2400w   q80    190 KB
moment-underbody     2400w   q80    170 KB
detailing-polish     1800w   q82    238 KB
inspection-lift      1800w   q82     86 KB
shop-exterior        2000w   q82     73 KB
shop-bays            1200w   q82    112 KB
service-*            1100w   q82   93–139 KB
shop-detail-*         900w   q82    65–74 KB
warranty-*           1000w   q82     57–61 KB
                                   ─────────
                                   1.8 MB total, hero eager, everything else lazy
```

`warranty-counter.jpg` was additionally cropped to 86% width from the left, to
cut illegible generated signage at the right edge.

---

## Replacing a frame

1. Keep the ratio in the table above, or the layout's aspect boxes will crop
   somewhere you did not choose.
2. Keep the dark grade and the single warm light source, or the accent colour
   stops belonging to the photography.
3. **Re-measure the scrims.** The hero's three gradients are tuned to this
   photograph's actual luminance, at the pixel level — a lighter replacement will
   fail AA under the headline. The measured figures are in
   [CONTENT-TODO.md](CONTENT-TODO.md#measured-contrast).
