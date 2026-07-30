#!/usr/bin/env python3
"""Adopt freshly dropped photographs into the project's image slots.

Drop a file into assets/img/ with any name that mentions what it is —
"Diagnostics & Major Repair 1.jpg", "hero2.jpg", "brakes final.jpg" — then run:

    python3 tools/adopt-images.py

Each file is matched to a slot by keyword, re-encoded to the width that slot
actually renders at, and the original is removed. Anything it cannot match is
left alone and reported, so a mystery file is never silently discarded.

Why this exists: the slots have fixed aspect boxes in the layout, and a 1.2 MB
original in a 640px frame is three quarters of a megabyte of nothing. This keeps
the swap to one step and keeps the page's weight honest.
"""

import os
import re
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
IMG = os.path.join(ROOT, "assets", "img")

# Ordered: the first pattern that matches wins, so the specific rules sit above
# the general ones. "inspection" alone is ambiguous — it appears in both the NYS
# maintenance slot and the pre-purchase slot — so both are qualified.
RULES = [
    # Section-heading names first. Files often arrive titled after the band they
    # belong to, and several of those headings contain words the generic rules
    # below would grab — "Service for the Vehicles You Depend On" and "Built
    # around the vehicles people rely on" both say "vehicles" but want different
    # slots, so they are matched explicitly and early.
    (r"complete care for the road|road ahead",  "hero-lift.jpg",              2400, 82),
    (r"vehicles you depend|the shop",           "shop-bays.jpg",              1200, 82),
    (r"built around|people rely on",            "moment-underbody.jpg",       2400, 80),
    (r"bring it to the shop|finding the shop",  "shop-exterior.jpg",          2000, 82),
    (r"auto detailing",                         "detailing-polish.jpg",       2400, 80),

    (r"pre.?purchase|ppi|before you buy",      "inspection-lift.jpg",        1800, 80),
    (r"nys|maintenance|oil|filter",            "service-02-maintenance.jpg", 1100, 82),
    (r"diagnost|major repair|scan",            "service-01-diagnostics.jpg", 1100, 82),
    (r"brake|suspension|steering|rotor",       "service-03-brakes.jpg",      1100, 82),
    (r"tire|tyre|wheel|alignment",             "service-04-tires.jpg",       1100, 82),
    (r"heat|air.?condition|hvac|climate|a/?c", "service-05-climate.jpg",     1100, 82),
    (r"vehicle care|buyer|care & |care and",   "service-06-care.jpg",        1100, 82),
    (r"detail|polish|wax",                     "detailing-polish.jpg",       2400, 80),
    (r"warrant|work.?order|claim|paperwork",   "warranty-workorder.jpg",     1000, 82),
    (r"counter|customer|desk|reception",       "warranty-counter.jpg",       1000, 82),
    (r"underbody|beneath|from below|moment",   "moment-underbody.jpg",       2400, 80),
    (r"exterior|street|outside|facade|front",  "shop-exterior.jpg",          2000, 82),
    (r"tool|wrench|drawer|chest",              "shop-detail-tools.jpg",       900, 82),
    (r"hub|bearing|bench|parts",               "shop-detail-hub.jpg",         900, 82),
    (r"bay|interior|shop|garage|floor",        "shop-bays.jpg",              1200, 82),
    (r"hero",                                  "hero-lift.jpg",              2400, 82),
]

# Files the project owns. Anything matching these is already adopted.
SLOTS = {r[1] for r in RULES} | {"favicon.svg"}


def adopt(path):
    name = os.path.basename(path)
    key = name.lower()
    for pattern, target, width, quality in RULES:
        if re.search(pattern, key):
            im = Image.open(path).convert("RGB")
            w, h = im.size
            if w > width:
                im = im.resize((width, round(h * width / w)), Image.LANCZOS)
            out = os.path.join(IMG, target)
            im.save(out, "JPEG", quality=quality, optimize=True, progressive=True)
            os.remove(path)
            kb = os.path.getsize(out) // 1024
            print(f"  {name}\n    -> {target}  {im.size[0]}x{im.size[1]}  {kb} KB")
            return target
    print(f"  {name}\n    -> NO MATCH. Rename it to mention the service, or add a rule.")
    return None


def main():
    incoming = [
        os.path.join(IMG, f)
        for f in sorted(os.listdir(IMG))
        if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")) and f not in SLOTS
    ]
    if not incoming:
        print("Nothing to adopt — every file in assets/img is already a project slot.")
        return 0
    print(f"Adopting {len(incoming)} file(s):")
    adopted = [adopt(p) for p in incoming]
    done = [a for a in adopted if a]
    print(f"\n{len(done)} adopted, {len(adopted) - len(done)} unmatched.")
    if done:
        print("\nRemember: the hero's scrims are tuned to the hero photograph's own\n"
              "luminance. If hero-lift.jpg changed, re-measure before shipping —\n"
              "docs/CONTENT-TODO.md § measured contrast.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
