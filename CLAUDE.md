# CLAUDE.md — 360 Auto Care Inc

Before any visual work, invoke the `design-dna` skill. It routes to the live
system at `/Users/alex/Desktop/WORK/design_dna` — the real clone, which the
globally-installed skills symlink into. Do not use a copy inside this project:
there was one, it went stale, and it overrode the live system for a day before
anyone noticed. It has been deleted; do not recreate it.

The Design Read this project was built under — repeat it, do not re-derive it:

```
Reading this as a one-page service site for local Lynbrook drivers choosing where to take a car they depend on, leaning industrial-editorial documentary.
Mandate: REDESIGN — the name, the service taxonomy, the Lynbrook locality and the brief's own palette, type direction and copy carry through; composition, structure and surface craft are in scope.
Dialect: partial — auction-editorial PRINCIPLES + brief-derived register (dark green-charcoal ground, saturated safety-orange accent, documentary workshop photography, grotesque display). The display rank is expressive by WEIGHT, not by style: Archivo 900 against Inter 400, with one word per headline dropped to 400 as the stress accent. Two serifs were tried and rejected — see the project record.
Dimensionality: ABSENT — no constructed scene; depth is carried by photographic space, tonal layering and one committed image overlap.
```

The full record — decisions, environment knowledge, and what went wrong — is in
`/Users/alex/Desktop/WORK/design_dna/projects/360-auto-care-2026.md`.

## Project-specific rules

**The accent has named roles and no others.** `#f47a17` is used on the wordmark
numeral, the primary action, active state, index numerals, small technical
markers and the focus ring. Not on headings, not on borders generally, not on
body text. Near-black ink on every orange fill — white on this orange is 2.41:1.

**Type over photography is measured on the composited render, never on the source
image.** Hide the text layer, screenshot, sample the worst pixel in the text's
own box. The hero's three gradients are tuned to the current photograph; replacing
it means re-measuring. Figures are in `docs/CONTENT-TODO.md`.

**Compile order in `src/scss/main.scss` is load-bearing.** Bootstrap functions →
project overrides → Bootstrap variables. A token override only reaches what is
compiled after it.

**Overriding a Bootstrap component needs matching specificity, not later source
order.** `.form-check .form-check-input` beats `.form-check-input`;
`.field:nth-child(even)` beats `.field--full`. Both bit this project.

**Never invent business facts.** The phone, address, hours and reviews are
unconfirmed and marked as such in `docs/CONTENT-TODO.md`. The reviews array ships
empty on purpose — do not populate it with samples, and do not replace the
placeholder phone with anything outside the reserved 555-01xx range.

**The taste system is a separate repo, and edits to it get committed there.**
Learnings from this project — a new invariant, an anti-pattern, an update to the
project record — belong in `/Users/alex/Desktop/WORK/design_dna` and are pushed
from that repo, never carried in this one.
