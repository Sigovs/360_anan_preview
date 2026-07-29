/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 10 — VERIFIED REVIEWS · CONTENT FILE

   ┌───────────────────────────────────────────────────────────────────────┐
   │  EVERYTHING BELOW IS PLACEHOLDER CONTENT.                             │
   │  It is NOT live Google data and must be replaced before launch.       │
   │  See docs/CONTENT-TODO.md § 4.                                        │
   └───────────────────────────────────────────────────────────────────────┘

   The reviews and the rating summary are written in-brand stand-ins so the
   section can be designed, reviewed and presented. They are deliberately not
   attributed to real customers: first names with an initial, no photographs, no
   review IDs, no permalinks.

   Because of that, the page emits NO `Review` or `AggregateRating` structured
   data. Search engines are never told this is a verified rating. The visible
   block is also marked `data-placeholder="true"`, so appending `?todo` to the
   URL outlines it along with the other unconfirmed values.

   ── TO GO LIVE ──────────────────────────────────────────────────────────────
   1. Open the shop's Google Business Profile.
   2. Replace `summary` with the real rating and review count.
   3. Replace `items` with real reviews, copied word for word. Trim with an
      ellipsis if needed; do not rewrite, tidy or translate them.
   4. Set `placeholder: false` below. That removes the "example wording" line
      from the section and drops the ?todo outline.
   5. Point `profileUrl` at the shop's own Google reviews link.
   6. `npm run js`, then re-read docs/CONTENT-TODO.md.

   Only the first three items are shown; the rest live behind the Google link.
   Do not invent reviews, paraphrase them, or move them from another business —
   a fabricated review is a false statement about a real customer, and a
   fabricated rating is a false claim about the business.
   ═══════════════════════════════════════════════════════════════════════════ */

window.REVIEWS_360 = {
  /* Flip to false once every field below is real. */
  placeholder: true,

  /* Where "View on Google" points. Replace with the shop's own profile URL. */
  profileUrl: 'https://www.google.com/maps/search/?api=1&query=360+Auto+Care+Inc%2C+10+N+Prospect+Ave%2C+Lynbrook%2C+NY+11563',

  summary: {
    rating: 4.8,     // out of 5
    count: 126,      // total reviews on the profile
    source: 'Google',
  },

  items: [
    {
      rating: 5,
      text: 'Brought my Odyssey in with a check-engine light two other places had guessed at. They put it on the machine, found the actual fault, called me with the price before touching anything. No surprises on the bill.',
      author: 'Michael R.',
      date: 'March 2026',
      source: 'Google',
    },
    {
      rating: 5,
      text: 'Needed an inspection and ended up needing brakes too. They showed me the measurements on the pads instead of just telling me. That is why I keep coming back with both our cars.',
      author: 'Denise K.',
      date: 'February 2026',
      source: 'Google',
    },
    {
      rating: 5,
      text: 'Had them look over a used Civic before I bought it. They found a rear suspension issue the seller had not mentioned and it saved me a few thousand dollars. Straight answers, no upsell.',
      author: 'Anthony P.',
      date: 'January 2026',
      source: 'Google',
    },
    {
      rating: 4,
      text: 'Work van needed a compressor and they handled the extended warranty claim end to end. Took an extra day waiting on the approval, but they kept me updated the whole time.',
      author: 'Sal V.',
      date: 'December 2025',
      source: 'Google',
    },
  ],
};
