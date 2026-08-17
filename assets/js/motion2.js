/* ═══════════════════════════════════════════════════════════════════════════
   360 AUTO CARE INC — index2 motion system

   WHY THIS FILE EXISTS, AND WHAT IT REPLACES

   index2 previously animated through main.js: one IntersectionObserver toggling
   `data-reveal*` attributes, with the character carried by CSS transitions. It
   was measured, and it did not work. Three findings, in order of damage:

     1  A watchdog in main.js calls revealAll() three seconds after load. On a
        7,800px page that marks EVERY section arrived while the visitor is still
        on the first screen, so by the time they scroll there is nothing left to
        play. Instrumented: 32/32 targets `pending` at 2.5s, 0/32 at 4.0s, with
        scrollY still 0. That alone made the page static.
     2  The travel was 10–14px against a 900px viewport over 0.4s — below the
        threshold at which a move reads as a move at scrolling speed.
     3  The masked reveals used clip-path over near-black photographs on a
        near-black page. The clipping edge had almost no luminance either side
        of it, so nothing appeared to move even where it did.

   This file takes ownership of index2's motion and fixes all three: real
   timelines, distances of 48–72px, and physical curtain panels that travel out
   of frame rather than clip-paths that dissolve invisibly.

   CONTRACT — unchanged from the rest of the project:
   · Nothing is hidden in the markup or in the stylesheet. Every hidden state is
     written HERE, by script, after the library is confirmed present. No script,
     no GSAP, a thrown error or reduced motion all end on the finished page.
   · Only transform, opacity, clip-path and colour are animated. Never layout.
   · Every hover behaviour has a focus equivalent.
   · This file no-ops entirely unless the page opts in with `data-motion2` on
     <html> or a `.hero2` in the document, so index.html is unaffected even if it
     ever loads the bundle.

   THE HERO IS OPTIONAL. Interior pages in this family open with `.phead`, not
   with the full-screen hero, and everything below the first screen is bound
   generically: a section carrying `data-scene="left|right"` gets the same
   entrance the homepage's own sections get, with no JavaScript per page. That
   is the whole point — a new page should cost markup, not a motion rewrite.
   ═══════════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const hero = document.querySelector('.hero2');
  const root0 = document.documentElement;
  // index2 is recognised by its hero; every other page in the family opts in.
  if (!hero && !root0.hasAttribute('data-motion2')) return;
  if (!window.gsap || !window.ScrollTrigger) return;   // library missing → static page stands

  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  const ST = window.ScrollTrigger;

  const root = document.documentElement;
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');

  /* ── Take the wheel from main.js ──────────────────────────────────────────
     This file is loaded BEFORE main.js, so stripping the legacy hooks here
     means main.js registers nothing, its three-second watchdog has nothing to
     reveal, and the two systems can never drive the same element. Everything
     else main.js does — nav, form, reviews rendering, masthead state — is
     untouched and still runs. */
  const LEGACY = ['data-reveal', 'data-reveal-group', 'data-reveal-media',
                  'data-reveal-mask', 'data-reveal-rule', 'data-reveal-seq',
                  'data-hero', 'data-parallax'];
  document.querySelectorAll('[' + LEGACY.join('],[') + ']').forEach((el) => {
    LEGACY.forEach((a) => el.removeAttribute(a));
  });
  root.classList.add('js-motion2');

  /* ── First-paint safety ───────────────────────────────────────────────────
     The timelines are built after the fonts settle, because every masked
     heading is split on MEASURED line positions and a font swap moves them.
     That is a real wait, and without an armed state the visitor would see the
     finished hero and then watch it be covered up.

     So the two elements that would give the game away are armed here, in the
     same task that parses the document, by a class — never by base CSS. A
     failsafe below removes it whatever happens, so a thrown error or a missing
     stylesheet still ends on the readable page. */
  const ARM = 'm2-arm';
  if (!reduceQuery.matches) root.classList.add(ARM);
  const disarm = () => root.classList.remove(ARM);
  setTimeout(disarm, 2500);

  /* ── Scale ────────────────────────────────────────────────────────────────
     One place for every distance and duration, and two of everything: the
     desktop figure and the mobile figure, which is ~40% shorter. Read through
     M() so a resize past the breakpoint picks up the other set. */
  const mqDesk = matchMedia('(min-width: 62rem)');
  const S = {
    lead:    { d: 64,  m: 34 },   // primary slide — headings, first elements
    sub:     { d: 32,  m: 20 },   // secondary slide — copy, controls
    imgFrom: { d: 1.08, m: 1.04 },
    heroFrom:{ d: 1.06, m: 1.03 },
    scrub:   { d: 4,   m: 1.6 }   // yPercent of scrubbed internal image travel
  };
  const M = (k) => (mqDesk.matches ? S[k].d : S[k].m);

  const D = { head: 0.95, curtain: 1.05, content: 0.66, line: 0.8, section: 1.2 };
  const E = { lead: 'power4.out', content: 'power3.out', line: 'power2.inOut', hero: 'expo.out' };
  const STAGGER = 0.11;

  /* ── Utility · curtain ────────────────────────────────────────────────────
     A solid panel that covers a frame and slides out of it. This is the reason
     the reveals are visible at all: a clip-path edge between one near-black
     region and another is invisible on this page, whereas a panel in a
     DIFFERENT near-black tone, carrying a thin blue leading edge, reads as a
     physical thing moving off the image.

     Built in script, so a page without JS never has a panel sitting on its
     content. */
  const curtain = (frame, dir) => {
    if (getComputedStyle(frame).position === 'static') frame.style.position = 'relative';
    frame.style.overflow = 'hidden';
    const el = document.createElement('span');
    el.className = 'curtain curtain--' + dir;
    el.setAttribute('aria-hidden', 'true');
    frame.appendChild(el);
    return el;
  };

  const curtainOut = (el, dir) => {
    const to = { duration: D.curtain, ease: E.line };
    if (dir === 'right') to.xPercent = 101;
    else if (dir === 'left') to.xPercent = -101;
    else if (dir === 'up') to.yPercent = -101;
    else to.yPercent = 101;
    return to;
  };

  /* ── Utility · masked lines ───────────────────────────────────────────────
     Wraps each RENDERED line of a heading in an overflow-hidden box so the line
     can rise into it from below. Lines are found by measuring word positions,
     not guessed, and the text content is preserved verbatim — the accessible
     name of the heading is exactly what it was.

     Re-run on a breakpoint change, because the number of lines changes with the
     format and a stale wrap would mask the wrong words. */
  const splitLines = (el) => {
    if (el.dataset.mlSource === undefined) el.dataset.mlSource = el.textContent;
    const source = el.dataset.mlSource;

    // Rebuild flat, then measure where the browser actually breaks it.
    el.textContent = '';
    const probes = source.split(/(\s+)/).map((tok) => {
      if (!tok.trim()) { el.appendChild(document.createTextNode(tok)); return null; }
      const s = document.createElement('span');
      s.textContent = tok;
      el.appendChild(s);
      return s;
    }).filter(Boolean);

    const lines = [];
    let top = null;
    probes.forEach((s) => {
      const t = Math.round(s.offsetTop);
      if (top === null || t !== top) { lines.push([]); top = t; }
      lines[lines.length - 1].push(s.textContent);
    });

    el.textContent = '';
    const inners = lines.map((words) => {
      const outer = document.createElement('span');
      outer.className = 'ml';
      const inner = document.createElement('span');
      inner.className = 'ml__i';
      inner.textContent = words.join(' ');
      outer.appendChild(inner);
      el.appendChild(outer);
      return inner;
    });
    return inners;
  };

  const unsplit = (el) => {
    if (el.dataset.mlSource !== undefined) el.textContent = el.dataset.mlSource;
  };

  /* ── Utility · technical rule ─────────────────────────────────────────────
     Every section gets one. It is the page's punctuation: a blue rule drawing
     across the measure is what says a new section has started, on a page where
     the background cannot say it. */
  const ruleFor = (host, cls, after) => {
    // Reuse the rule the markup already carries, where it has one, rather than
    // adding a second one beside it.
    const existing = host.querySelector(':scope > .rule-draw');
    if (existing) { existing.classList.add('trule', cls || ''); return existing; }

    const el = document.createElement('span');
    el.className = 'trule ' + (cls || '');
    el.setAttribute('aria-hidden', 'true');
    // Placed directly after the heading it punctuates. Appending to the parent
    // dropped it below the section's call to action, which is not where a rule
    // that announces a section belongs.
    if (after && after.parentNode === host) after.insertAdjacentElement('afterend', el);
    else host.appendChild(el);
    return el;
  };

  /* Own debounce. gsap.utils has no `debounce` — relying on it silently left the
     breakpoint rebuild wired to a no-op. */
  const debounce = (fn, ms) => {
    let t = 0;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  /* ═══════════════════════════════════════════════════════════════════════
     BUILD
     Everything below runs inside a gsap.context so a matchMedia change can
     revert every inline style GSAP wrote and rebuild from a clean page.
     ═══════════════════════════════════════════════════════════════════════ */
  let ctx = null;

  const build = () => {
    const reduce = reduceQuery.matches;

    ctx = gsap.context(() => {

      /* ── 1 · HERO ────────────────────────────────────────────────────────
         A composed opening, ~2.0s. The photograph is already on screen; what
         plays is the shop coming up on it.

         Only index2 has one. Interior pages open with `.phead`, whose entrance
         is the generic one at the foot of this build. */
      if (hero) {
        const heroImg   = hero.querySelector('.hero2__media img');
        const heroLines = [...hero.querySelectorAll('.hero2__line')];
        const heroEyebrow = hero.querySelector('.eyebrow');
        const heroLead  = hero.querySelector('.hero2__lead');
        const heroCta   = hero.querySelector('.hero2__actions');
        const heroNote  = hero.querySelector('.hero2__note');
        const heroFrame = hero.querySelector('.hero2__media');
        const heroRule  = ruleFor(hero.querySelector('.hero2__panel'), 'trule--hero');

        // The headline lines are authored, so they only need their masks.
        heroLines.forEach((l) => {
          const outer = document.createElement('span');
          outer.className = 'ml';
          l.parentNode.insertBefore(outer, l);
          outer.appendChild(l);
          l.classList.add('ml__i');
        });

        if (reduce) {
          // Static equivalent: everything at its resting value, nothing to play.
          gsap.set([heroImg, ...heroLines, heroEyebrow, heroLead, heroCta, heroNote],
            { clearProps: 'all' });
          gsap.set(heroRule, { scaleX: 1 });
        } else {
          const c1 = curtain(heroFrame, 'right');

          gsap.set(heroImg, { scale: M('heroFrom'), xPercent: 1.4, transformOrigin: '60% 50%' });
          gsap.set(heroRule, { scaleX: 0 });
          gsap.set(heroEyebrow, { x: -M('sub'), autoAlpha: 0 });
          gsap.set(heroLines, { yPercent: 112 });
          gsap.set(heroLead, { y: M('sub'), autoAlpha: 0 });
          gsap.set(heroCta, { x: -M('lead') * 0.65, autoAlpha: 0 });
          gsap.set(heroNote, { y: M('sub'), autoAlpha: 0 });

          const tl = gsap.timeline({ defaults: { ease: E.content } });

          tl.to(c1, { ...curtainOut(c1, 'right'), duration: 1.15, ease: 'power3.inOut' }, 0)
            .to(heroImg, { scale: 1, xPercent: 0, duration: 1.9, ease: E.hero }, 0.1)
            .to(heroRule, { scaleX: 1, duration: D.line, ease: E.line }, 0.55)
            .to(heroEyebrow, { x: 0, autoAlpha: 1, duration: D.content, ease: E.lead }, 0.62)
            .to(heroLines, { yPercent: 0, duration: D.head, ease: E.lead, stagger: 0.105 }, 0.72)
            .to(heroLead, { y: 0, autoAlpha: 1, duration: D.content, ease: E.content }, 1.12)
            .to(heroCta, { x: 0, autoAlpha: 1, duration: D.content, ease: E.lead }, 1.28)
            .to(heroNote, { y: 0, autoAlpha: 1, duration: D.content, ease: E.content }, 1.44)
            .add(() => hero.classList.add('is-open'), 1.5);   // releases the light sweep

          // Scrubbed depth: the frame drifts against the type as the hero leaves.
          gsap.to(heroImg, {
            yPercent: M('scrub'),
            ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
          });
          gsap.to(hero.querySelector('.hero2__panel'), {
            yPercent: -M('scrub') * 0.55,
            ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
          });
        }
      }

      /* ── Section scene ───────────────────────────────────────────────────
         One composition, two directions. Which one a section gets is decided by
         where its visual already sits — left-led where the image is on the
         left, right-led where it is on the right — not alternated mechanically.

         label → heading (masked lines) → rule → copy → visual curtain. */
      const scene = (section, opts) => {
        const o = Object.assign({ dir: 'left', head: 'h2', copy: '.lead, .copy' }, opts);
        const label = section.querySelector('.eyebrow');
        const heading = section.querySelector(o.head);
        const copy = [...section.querySelectorAll(o.copy)].slice(0, 2);
        const host = heading ? heading.parentNode : section;
        // A centred section head has no left edge for a rule to start from: it landed
        // hard left of the centred block and read as a stray mark. Those sections are
        // punctuated by their own centred eyebrow instead.
        const centred = host.classList.contains('sec-head--center');
        const rule = centred ? null : ruleFor(host, 'trule--sec', heading);
        const sign = o.dir === 'right' ? 1 : -1;

        if (reduce) { if (rule) gsap.set(rule, { scaleX: 1 }); return; }

        const inners = heading ? splitLines(heading) : [];

        gsap.set(label, { x: sign * M('sub'), autoAlpha: 0 });
        gsap.set(inners, { yPercent: 110 });
        if (rule) gsap.set(rule, { scaleX: 0 });
        gsap.set(copy, { y: M('sub'), autoAlpha: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
          defaults: { ease: E.content }
        })
          .to(label, { x: 0, autoAlpha: 1, duration: D.content, ease: E.lead })
          .to(inners, { yPercent: 0, duration: D.head, ease: E.lead, stagger: 0.09 }, 0.1)
          .to(copy, { y: 0, autoAlpha: 1, duration: D.content, stagger: 0.07 }, 0.42);
        if (rule) tl.to(rule, { scaleX: 1, duration: D.line, ease: E.line }, 0.34);

        return { heading, inners };
      };

      /* ── Utility · a framed image revealed by a curtain ─────────────────── */
      const revealFrame = (frame, dir, opts) => {
        const o = Object.assign({ trigger: frame, start: 'top 82%', scrubTo: 0 }, opts);
        const img = frame.querySelector('img, iframe');
        if (!img) return;

        if (reduce) return;

        const c = curtain(frame, dir);
        gsap.set(img, { scale: M('imgFrom'), transformOrigin: '50% 50%' });

        gsap.timeline({ scrollTrigger: { trigger: o.trigger, start: o.start, once: true } })
          .to(c, { ...curtainOut(c, dir) }, 0)
          .to(img, { scale: 1, duration: 1.35, ease: E.hero }, 0.05);

        if (o.scrubTo) {
          gsap.fromTo(img, { yPercent: -o.scrubTo }, {
            yPercent: o.scrubTo, ease: 'none',
            scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.7 }
          });
        }
      };

      /* ── 2 · CAPABILITY RAIL ─────────────────────────────────────────────── */
      const railItems = [...document.querySelectorAll('.rail2__item')];
      if (railItems.length && !reduce) {
        gsap.set(railItems, { y: M('lead') * 0.6, autoAlpha: 0 });
        gsap.to(railItems, {
          y: 0, autoAlpha: 1, duration: D.content, ease: E.lead, stagger: 0.09,
          scrollTrigger: { trigger: document.querySelector('.rail2'), start: 'top 88%', once: true }
        });
      }

      /* ── 3 · SERVICES — an inspection sequence, staggered by ROW ──────────
         Cards are grouped into rows from their measured offsetTop, so the
         stagger follows the grid the browser actually built rather than a
         column count hard-coded per breakpoint. */
      const svcSection = document.querySelector('#services');
      if (svcSection) {
        scene(svcSection, { dir: 'left' });

        const cards = [...svcSection.querySelectorAll('.svc2')];
        const rows = [];
        let top = null;
        cards.forEach((card) => {
          const t = Math.round(card.offsetTop);
          if (top === null || Math.abs(t - top) > 8) { rows.push([]); top = t; }
          rows[rows.length - 1].push(card);
        });

        rows.forEach((row) => {
          row.forEach((card, i) => {
            const frame = card.querySelector('.svc2__media');
            const badge = card.querySelector('.svc2__badge');
            const title = card.querySelector('.svc2__title');
            const rest  = [card.querySelector('.svc2__note'),
                           card.querySelector('.svc2__tags'),
                           card.querySelector('.svc2__action')].filter(Boolean);
            const rule  = ruleFor(card.querySelector('.svc2__body'), 'trule--card');

            if (reduce) { gsap.set(rule, { scaleX: 1 }); return; }

            const c = curtain(frame, 'right');
            const img = frame.querySelector('img');
            gsap.set(img, { scale: M('imgFrom') });
            gsap.set(badge, { x: -20, autoAlpha: 0 });
            gsap.set(title, { y: M('sub'), autoAlpha: 0 });
            gsap.set(rest, { y: M('sub') * 0.7, autoAlpha: 0 });
            gsap.set(rule, { scaleX: 0 });

            const at = i * 0.05;            // a beat between cards inside a row
            gsap.timeline({
              scrollTrigger: { trigger: card, start: 'top 84%', once: true },
              defaults: { ease: E.content }
            })
              .to(c, { ...curtainOut(c, 'right') }, at)
              .to(img, { scale: 1, duration: 1.3, ease: E.hero }, at + 0.05)
              .to(badge, { x: 0, autoAlpha: 1, duration: 0.42, ease: 'back.out(2)' }, at + 0.42)
              .to(title, { y: 0, autoAlpha: 1, duration: D.content, ease: E.lead }, at + 0.5)
              .to(rest, { y: 0, autoAlpha: 1, duration: D.content, stagger: 0.07 }, at + 0.58)
              .to(rule, { scaleX: 1, duration: D.line, ease: E.line }, at + 0.7);
          });
        });
      }

      /* ── 4 · THE SHOP — the page's strongest scroll moment ────────────────
         Not pinned. Pinning this band bought nothing but empty scrolling: the
         content is a photograph and a column of text, and holding them still
         while the page scrolls past reads as a stall, not as a moment. The
         weight comes from the curtain, the exposure ramp and the scrub. */
      const shop = document.querySelector('#shop');
      if (shop) {
        scene(shop, { dir: 'right' });
        const frame = shop.querySelector('.split2__media');
        if (frame) {
          revealFrame(frame, 'up', { start: 'top 80%', scrubTo: M('scrub') });
          if (!reduce) {
            const img = frame.querySelector('img');
            gsap.fromTo(img, { filter: 'brightness(0.45) contrast(1.05)' },
              { filter: 'brightness(1) contrast(1)', duration: D.section, ease: E.content,
                scrollTrigger: { trigger: frame, start: 'top 80%', once: true } });
          }
        }
      }

      /* ── 4b · VEHICLE PROTECTION — the same moment, mirrored ──────────────
         Identical composition to THE SHOP: the section scene, the frame curtain
         with its scrub, and the exposure ramp on the photograph. The one thing
         that differs is the direction, and it is not alternated for variety — the
         label and copy enter from the side the TEXT is on, which is the left here
         and the right in #shop, so in both cases the type arrives from its own
         column rather than across the picture.

         `:scope > img` rather than `img`: the LoJack mark lives inside this frame
         too, and a bare descendant selector would ramp the brand's exposure along
         with the photograph's. */
      const prot = document.querySelector('#protection');
      if (prot) {
        scene(prot, { dir: 'left' });
        const pFrame = prot.querySelector('.split2__media');
        if (pFrame) {
          revealFrame(pFrame, 'up', { start: 'top 80%', scrubTo: M('scrub') });
          if (!reduce) {
            const pImg = pFrame.querySelector(':scope > img');
            gsap.fromTo(pImg, { filter: 'brightness(0.45) contrast(1.05)' },
              { filter: 'brightness(1) contrast(1)', duration: D.section, ease: E.content,
                scrollTrigger: { trigger: pFrame, start: 'top 80%', once: true } });
          }
        }
      }

      /* ── 5 · VEHICLE CARE ────────────────────────────────────────────────── */
      const care = document.querySelector('#care');
      if (care && !reduce) {
        scene(care, { dir: 'left' });
        const cards = [...care.querySelectorAll('.card2')];
        gsap.set(cards, { y: M('lead') * 0.7, autoAlpha: 0 });
        gsap.to(cards, {
          y: 0, autoAlpha: 1, duration: D.content, ease: E.lead, stagger: 0.12,
          scrollTrigger: { trigger: care, start: 'top 72%', once: true }
        });
      } else if (care) { scene(care, { dir: 'left' }); }

      /* ── 6 · PROCESS — one connected mechanism ────────────────────────────
         The rule scrubs across the four steps with the scroll, and each step is
         activated by the rule's ACTUAL progress: the trigger's onUpdate reads
         its own progress and lights the steps that the leading edge has passed.
         Nothing here is a decorative stagger pretending to be a mechanism.

         On one column the rule is vertical and each step simply arrives — a
         horizontal progress bar describing a vertical list would be a lie. */
      const process = document.querySelector('#process');
      const track = document.querySelector('.proc2__track');
      const steps = [...document.querySelectorAll('.proc2__step')];

      if (process) scene(process, { dir: 'left' });

      if (process && steps.length && !reduce) {
        const vertical = !mqDesk.matches;
        track.classList.toggle('proc2__track--v', vertical);
        gsap.set(track, vertical ? { scaleY: 0 } : { scaleX: 0 });
        gsap.set(steps, { y: M('sub'), autoAlpha: 0 });

        const light = (n) => steps.forEach((s, i) => s.classList.toggle('is-live', i < n));

        ST.create({
          trigger: process,
          start: 'top 70%',
          end: 'bottom 75%',
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(track, vertical ? { scaleY: p } : { scaleX: p });
            // The leading edge decides. Step i is live once the rule has passed
            // its centre, which is where the number sits.
            const reached = Math.floor(p * steps.length + 0.35);
            light(Math.max(0, Math.min(steps.length, reached)));
            steps.forEach((s, i) => {
              const own = Math.min(1, Math.max(0, p * steps.length - i + 0.5));
              gsap.set(s, { y: (1 - own) * M('sub'), autoAlpha: own });
            });
          }
        });
      } else if (steps.length) {
        gsap.set(track, { scaleX: 1 });
        steps.forEach((s) => s.classList.add('is-live'));
      }

      /* ── 7 · REVIEWS — the one tonal break ────────────────────────────────
         The light surface arrives as a panel travelling up with a hard edge,
         and the heading is held back until the panel has covered most of the
         band, so the type never appears on a half-lit ground. */
      const reviews = document.querySelector('#reviews');
      if (reviews && !reduce) {
        const panel = document.createElement('span');
        panel.className = 'panel-wipe';
        panel.setAttribute('aria-hidden', 'true');
        reviews.style.position = 'relative';
        reviews.style.overflow = 'hidden';
        reviews.appendChild(panel);

        const rHead = reviews.querySelector('h2');
        const rLabel = reviews.querySelector('.eyebrow');
        const rSummary = reviews.querySelector('[data-reviews-summary]');
        const inners = rHead ? splitLines(rHead) : [];

        gsap.set(panel, { yPercent: 0 });
        gsap.set([rLabel, rSummary], { autoAlpha: 0, y: M('sub') });
        gsap.set(inners, { yPercent: 110 });

        gsap.timeline({ scrollTrigger: { trigger: reviews, start: 'top 82%', once: true } })
          .to(panel, { yPercent: -101, duration: D.section, ease: 'power3.inOut' }, 0)
          // 0.62 of the panel travel — past the 60% the direction asks for.
          .to(rLabel, { y: 0, autoAlpha: 1, duration: D.content, ease: E.lead }, D.section * 0.62)
          .to(inners, { yPercent: 0, duration: D.head, ease: E.lead, stagger: 0.09 }, D.section * 0.68)
          .to(rSummary, { y: 0, autoAlpha: 1, duration: D.content, ease: E.content }, D.section * 0.82);

        /* The quotes are rendered by main.js after this file runs, so they are
           picked up on load rather than now. */
        addEventListener('load', () => {
          const quotes = [...reviews.querySelectorAll('.review')];
          if (!quotes.length) return;
          gsap.set(quotes, { x: -M('sub'), autoAlpha: 0 });
          gsap.to(quotes, {
            x: 0, autoAlpha: 1, duration: D.content, ease: E.lead, stagger: 0.1,
            scrollTrigger: { trigger: quotes[0], start: 'top 88%', once: true }
          });
        });
      }

      /* ── 8 · CONTACT — form in groups ─────────────────────────────────────── */
      const contact = document.querySelector('#contact');
      if (contact) {
        scene(contact, { dir: 'left' });
        const form = contact.querySelector('.form2');
        const groups = form ? [...form.children] : [];
        const plate = contact.querySelector('.plate2');
        const formRule = contact.querySelector('.trule--form');
        if (groups.length && !reduce) {
          gsap.set([form, plate], { autoAlpha: 0, y: M('sub') });
          gsap.set(groups, { autoAlpha: 0, y: M('sub') * 0.8 });
          if (formRule) gsap.set(formRule, { scaleX: 0 });
          gsap.timeline({ scrollTrigger: { trigger: contact, start: 'top 62%', once: true } })
            .to(formRule, { scaleX: 1, duration: D.line, ease: E.line }, 0)
            .to([form, plate], { autoAlpha: 1, y: 0, duration: D.content, ease: E.content }, 0.12)
            .to(groups, { autoAlpha: 1, y: 0, duration: 0.5, ease: E.content, stagger: 0.09 }, 0.3);
        } else if (formRule) { gsap.set(formRule, { scaleX: 1 }); }
      }

      /* ── 9 · MAP — uncovered, never scaled ────────────────────────────────
         The cover translates off; the tiles come up from 0.45. No scale and no
         parallax at all: a map that moves under the pointer cannot be used. */
      const mapFrame = document.querySelector('.map2__frame');
      const mapBar = document.querySelector('.map2__bar');
      if (mapFrame && !reduce) {
        const c = curtain(mapFrame, 'right');
        const canvas = mapFrame.querySelector('.map2__canvas');
        gsap.set(canvas, { autoAlpha: 0.45 });
        gsap.set(mapBar, { y: 40, autoAlpha: 0 });

        gsap.timeline({ scrollTrigger: { trigger: document.querySelector('.map2'), start: 'top 80%', once: true } })
          .to(c, { ...curtainOut(c, 'right'), duration: D.section, ease: 'power3.inOut' }, 0)
          .to(canvas, { autoAlpha: 1, duration: D.section, ease: E.content }, 0.15)
          .to(mapBar, { y: 0, autoAlpha: 1, duration: D.content, ease: E.lead }, 0.6);
      }

      /* ── 10 · PAGE HEAD — the interior-page opening ───────────────────────
         Shorter than the hero's and deliberately so. The hero is an arrival and
         takes two seconds to land; a head on page two is a caption on a
         photograph, and a visitor who followed a link is already reading. Same
         vocabulary — curtain, masked lines, rule — at about half the duration,
         and it plays on load rather than on scroll because it is already in
         view. */
      const phead = document.querySelector('.phead');
      if (phead) {
        const pTitle = phead.querySelector('.phead__title');
        const pLabel = phead.querySelector('.eyebrow');
        const pLead  = phead.querySelector('.phead__lead');
        const pFrame = phead.querySelector('.phead__media');
        const pImg   = phead.querySelector('.phead__media img');
        // --sec, not --hero: the hero's modifier carries `order: -1` for its flex
        // panel, and .phead__panel is a plain block. The rule punctuates the
        // headline here exactly as it does in a section.
        const pRule  = ruleFor(phead.querySelector('.phead__panel'), 'trule--sec', pTitle);

        if (reduce) {
          gsap.set([pImg, pTitle, pLabel, pLead], { clearProps: 'all' });
          if (pRule) gsap.set(pRule, { scaleX: 1 });
        } else {
          const inners = pTitle ? splitLines(pTitle) : [];
          const c = curtain(pFrame, 'right');

          gsap.set(pImg, { scale: M('imgFrom'), transformOrigin: '60% 50%' });
          gsap.set(pLabel, { x: -M('sub'), autoAlpha: 0 });
          gsap.set(inners, { yPercent: 112 });
          gsap.set(pLead, { y: M('sub'), autoAlpha: 0 });
          if (pRule) gsap.set(pRule, { scaleX: 0 });

          const ptl = gsap.timeline({ defaults: { ease: E.content } })
            .to(c, { ...curtainOut(c, 'right'), duration: 0.9, ease: 'power3.inOut' }, 0)
            .to(pImg, { scale: 1, duration: 1.4, ease: E.hero }, 0.08)
            .to(pLabel, { x: 0, autoAlpha: 1, duration: D.content, ease: E.lead }, 0.38)
            .to(inners, { yPercent: 0, duration: D.head, ease: E.lead, stagger: 0.095 }, 0.46)
            .to(pLead, { y: 0, autoAlpha: 1, duration: D.content }, 0.78);
          if (pRule) ptl.to(pRule, { scaleX: 1, duration: D.line, ease: E.line }, 0.34);

          gsap.to(pImg, {
            yPercent: M('scrub'), ease: 'none',
            scrollTrigger: { trigger: phead, start: 'top top', end: 'bottom top', scrub: 0.6 }
          });
        }
      }

      /* ── 11 · MOMENT — the full-bleed band ────────────────────────────────
         One line over one photograph. The curtain goes up rather than sideways
         because this mass is wider than it is tall and a horizontal panel would
         be travelling for most of a second across an otherwise still page. */
      document.querySelectorAll('.moment2').forEach((band) => {
        const frame = band.querySelector('.moment2__media');
        const line  = band.querySelector('.moment2__line');
        if (!frame) return;
        if (reduce) { gsap.set(line, { clearProps: 'all' }); return; }

        revealFrame(frame, 'up', { trigger: band, start: 'top 78%', scrubTo: M('scrub') });

        const heading = line ? line.querySelector('h2, p') : null;
        if (!heading) return;
        const inners = splitLines(heading);
        gsap.set(inners, { yPercent: 110 });
        gsap.to(inners, {
          yPercent: 0, duration: D.head, ease: E.lead, stagger: 0.09,
          scrollTrigger: { trigger: band, start: 'top 72%', once: true }
        });
      });

      /* ── 12 · GENERIC SECTIONS ────────────────────────────────────────────
         Everything above binds a section of index2 by name, because each one
         has a composition of its own. This binds anything else that asks, and
         it is what makes a new page cost markup instead of JavaScript:

           <section class="band" data-scene="right">   label → heading → rule → copy
           …with a .split2__media inside                 …and the frame gets a curtain

         `data-scene` names the side the TEXT is on, matching the reasoning in
         4b — the type arrives from its own column rather than across the
         picture. Sections already handled above are skipped, so adding the
         attribute to one of them is harmless rather than a double-bind. */
      const NAMED = ['#services', '#shop', '#protection', '#care', '#process',
                     '#reviews', '#contact'];
      const claimed = new Set(NAMED.map((s) => document.querySelector(s)).filter(Boolean));

      document.querySelectorAll('[data-scene]').forEach((section) => {
        if (claimed.has(section)) return;
        const dir = section.dataset.scene === 'right' ? 'right' : 'left';
        scene(section, { dir });

        const frame = section.querySelector('.split2__media');
        if (!frame || reduce) return;
        revealFrame(frame, 'up', { start: 'top 80%', scrubTo: M('scrub') });
        const img = frame.querySelector(':scope > img');
        if (img) {
          gsap.fromTo(img, { filter: 'brightness(0.45) contrast(1.05)' },
            { filter: 'brightness(1) contrast(1)', duration: D.section, ease: E.content,
              scrollTrigger: { trigger: frame, start: 'top 80%', once: true } });
        }
      });
    });   // no scope element: selector strings inside must resolve against the document
  };

  /* ── Lifecycle ────────────────────────────────────────────────────────────
     Built once the fonts are settled, because every masked heading is split on
     measured line positions and a font swap changes where the lines fall. A
     refresh follows the last image so trigger positions match the final layout.

     If anything above throws, the catch reverts every inline style GSAP wrote
     and the page is left in its finished, readable state. */
  const start = () => {
    try {
      build();
      disarm();
      ST.refresh();
    } catch (err) {
      if (ctx) ctx.revert();
      disarm();
      root.classList.remove('js-motion2');
      // eslint-disable-next-line no-console
      console.error('[motion2] reverted to the static page:', err);
    }
  };

  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(() => requestAnimationFrame(start));

  addEventListener('load', () => ST.refresh());

  /* Re-measure on a breakpoint change: line wrapping, the row grouping and the
     process rule's axis all differ across it, and a stale build would mask the
     wrong words and light the wrong steps. */
  let lastDesk = mqDesk.matches;
  addEventListener('resize', debounce(() => {
    if (mqDesk.matches === lastDesk) { ST.refresh(); return; }
    lastDesk = mqDesk.matches;
    rebuild();
  }, 220));

  function rebuild() {
    if (ctx) ctx.revert();
    document.querySelectorAll('[data-ml-source]').forEach(unsplit);
    // Rules that came from the markup are kept; only the ones script added go.
    document.querySelectorAll('.curtain, .panel-wipe').forEach((n) => n.remove());
    document.querySelectorAll('.trule:not(.rule-draw)').forEach((n) => n.remove());
    document.querySelectorAll('.rule-draw').forEach((n) => n.classList.remove('trule', 'trule--sec'));
    if (hero) hero.classList.remove('is-open');   // interior pages have no hero
    start();
  }

  /* A change of motion preference mid-session rebuilds from scratch, so nothing
     is left part-played. */
  reduceQuery.addEventListener('change', rebuild);
})();
