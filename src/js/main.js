/* ═══════════════════════════════════════════════════════════════════════════
   360 AUTO CARE INC — page behaviour

   Rules this file follows:
   · Nothing is hidden in the markup. Every hidden-then-revealed state is applied
     by this file, only under `.js-motion`, and only when motion is allowed — so
     no script, a thrown error, a dead observer or a reduced-motion preference
     all end with the finished page. A watchdog clears any pending state after
     three seconds regardless.
   · Only opacity, transform, clip-path and colour are animated. Never layout.
   · Every hover behaviour has a focus equivalent.
   · The service directory works with no script at all: it is a list of <details>,
     and opening one is what <summary> does. Script adds hover-to-open, the shared
     `name` that makes the accordion exclusive, and the image stage.
   · Scroll work is rAF-coalesced and writes one custom property.
   ═══════════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const root = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionOK = !motionQuery.matches;

  root.classList.add('js');
  if (motionOK) root.classList.add('js-motion');

  /* A visitor can switch the OS setting mid-session. Drop straight to the static
     page rather than leaving half-played transitions behind. */
  motionQuery.addEventListener('change', (event) => {
    motionOK = !event.matches;
    root.classList.toggle('js-motion', motionOK);
    if (!motionOK) revealAll();
  });

  /* ── Reveal ───────────────────────────────────────────────────────────────
     Marks every registered element as arrived. Called by the observer, by the
     watchdog, and if the motion preference changes. Safe to call repeatedly. */
  const revealTargets = [];

  /* The reveal vocabulary. `reveal`, `revealGroup` and `revealMedia` are the
     original three, used by both pages. `revealMask`, `revealRule` and
     `revealSeq` are index2's, where the page is dark end to end and a fade
     cannot separate one band from the next: the character of each has to be
     carried by masks, drawn rules and internal sequence instead. All six ride
     the same observer and the same watchdog — only the CSS differs, so nothing
     here changes what index.html does. */
  const REVEAL_ATTRS = ['reveal', 'revealGroup', 'revealMedia',
                        'revealMask', 'revealRule', 'revealSeq'];

  function revealAll() {
    revealTargets.forEach((el) => {
      REVEAL_ATTRS.forEach((key) => {
        if (el.dataset[key] !== undefined) el.dataset[key] = 'in';
      });
    });
  }

  /* ── Content-to-confirm mode ─────────────────────────────────────────────
     ?todo outlines every placeholder value before the preview is handed over. */
  if (new URLSearchParams(location.search).has('todo')) {
    document.body.classList.add('show-todo');
  }

  /* ── Scroll work ──────────────────────────────────────────────────────────
     ONE scroll listener for the whole page, coalesced into one rAF frame, doing
     three jobs: firm the masthead, drift the hero photograph, and shift whichever
     parallax images are currently on screen.

     Two rules keep this cheap. Reads happen together and writes happen together,
     so a scroll never interleaves layout reads with style writes. And the
     parallax set is maintained by an IntersectionObserver rather than measured
     every frame — an image off screen costs nothing at all. */
  const masthead = document.querySelector('[data-masthead]');
  const hero = document.querySelector('[data-hero]');
  const heroMedia = hero ? hero.querySelector('.hero__media') : null;

  /* Parallax targets, measured directly.
     
     An earlier version gated this on an IntersectionObserver so off-screen images
     cost nothing. It was the wrong trade twice over: an observer is kept alive
     only while something references it, so it was collected and silently stopped
     reporting, and its callback resolves a frame after the scroll that caused it,
     so an image entering during a pause never got positioned. For five elements
     the optimisation was saving microseconds and costing correctness.
     
     This reads five rects per frame and writes only the ones that changed. Reads
     all happen before writes, so no frame interleaves layout reads with style
     writes. */
  const parallaxTargets = [...document.querySelectorAll('[data-parallax]')].map((el) => ({
    el,
    travel: parseFloat(el.dataset.parallax) || 1,
    last: null,
  }));

  let scrollQueued = false;

  const onScrollFrame = () => {
    scrollQueued = false;
    const y = window.scrollY;
    const vh = window.innerHeight || 1;

    if (masthead) {
      masthead.dataset.scrolled = y > 32 ? 'true' : 'false';
    }

    /* The hero photograph lags the page by up to 6% of its own height as the hero
       leaves the viewport — a depth cue, not a parallax effect. Written on the
       section so the wordmark inherits it too and drifts at a third of the rate,
       which is what puts the two layers at different depths. Clamped at 1, so
       nothing is recomputed once the hero has gone. */
    if (heroMedia && motionOK) {
      const height = hero.offsetHeight || 1;
      const progress = Math.min(Math.max(y / height, 0), 1);
      hero.style.setProperty('--hero-shift', `${(-6 * progress).toFixed(2)}%`);
    }

    if (!motionOK || !parallaxTargets.length) return;

    /* Read everything first. */
    const frames = parallaxTargets.map((t) => {
      const box = t.el.getBoundingClientRect();
      return { t, top: box.top, height: box.height };
    });

    /* Then write. Every other image drifts against its own frame as it crosses
       the viewport: one travel-unit down at the bottom of the screen, one up at
       the top. The amplitude is a couple of dozen pixels across a whole screen of
       scrolling, and each image carries that much headroom on both sides, so the
       drift can never expose an edge. */
    frames.forEach(({ t, top, height }) => {
      if (top > vh || top + height < 0) return;          // off screen: leave as-is
      const centre = top + height / 2;
      const progress = Math.max(-1, Math.min(1, (centre - vh / 2) / vh));
      const shift = (progress * -26 * t.travel).toFixed(1);
      if (shift === t.last) return;                      // no redundant writes
      t.last = shift;
      t.el.style.setProperty('--shift', `${shift}px`);
    });
  };

  /* Coalesce to one frame per burst of scroll events — but never let a dropped
     frame strand the handler. requestAnimationFrame is suspended while a tab is
     hidden, so a flag that is only cleared inside the callback can stay raised
     forever: the tab goes to the background mid-scroll, the frame never arrives,
     and scroll handling is dead for the rest of the session. The timeout is the
     guarantee of forward progress. */
  const queueScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(onScrollFrame);
    window.setTimeout(() => { if (scrollQueued) onScrollFrame(); }, 120);
  };

  onScrollFrame();
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });

  /* ── Hero entrance ────────────────────────────────────────────────────────
     One choreographed arrival, ~1.05s, started on the next frame so the first
     paint already has the composition laid out. */
  if (hero && motionOK) {
    hero.dataset.entered = 'pending';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { hero.dataset.entered = 'in'; });
    });
  }

  /* ── Mobile navigation ──────────────────────────────────────────────────── */
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navPanel = document.getElementById('nav-panel');

  if (navToggle && navPanel && window.bootstrap) {
    const panel = new window.bootstrap.Collapse(navPanel, { toggle: false });
    const label = navToggle.querySelector('[data-nav-label]');

    navToggle.addEventListener('click', () => {
      navToggle.getAttribute('aria-expanded') === 'true' ? panel.hide() : panel.show();
    });

    navPanel.addEventListener('show.bs.collapse', () => {
      navToggle.setAttribute('aria-expanded', 'true');
      if (label) label.textContent = 'Close';
    });

    navPanel.addEventListener('hide.bs.collapse', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      if (label) label.textContent = 'Menu';
    });

    navPanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => panel.hide());
    });
  }

  /* ── Section 03 · service directory ─────────────────────────────────────── */
  const list = document.querySelector('[data-services]');

  if (list) {
    const items = [...list.querySelectorAll('.svc')];
    const frame = document.querySelector('[data-stage-frame]');
    const stageLabel = document.querySelector('[data-stage-label]');
    const stageIndex = document.querySelector('[data-stage-index]');

    const services = items.map((item) => {
      const img = item.querySelector('.svc__img img');
      return {
        item,
        id: item.dataset.serviceId,
        src: img ? img.getAttribute('src') : '',
        title: item.querySelector('.svc__title').textContent.trim(),
      };
    });

    /* Two stacked layers, crossfaded. Content changing in place fades; it never
       slides in from off-screen. */
    let layers = [];
    let front = 0;

    if (frame) {
      layers = [0, 1].map(() => {
        const el = document.createElement('img');
        el.alt = '';
        el.decoding = 'async';
        frame.appendChild(el);
        return el;
      });
      layers[0].src = services[0].src;
      layers[0].dataset.current = 'true';
    }

    /* Six segments under the frame, the active one filled — the stage says where
       you are in the list, not just what the current service looks like.
       Decorative: the list itself carries the state for assistive technology. */
    const progress = document.querySelector('[data-stage-progress]');
    let segments = [];

    if (progress) {
      segments = services.map(() => {
        const span = document.createElement('span');
        progress.appendChild(span);
        return span;
      });
      if (segments[0]) segments[0].dataset.on = 'true';
    }

    let activeIndex = 0;

    const setActive = (index) => {
      if (index === activeIndex || !services[index]) return;
      activeIndex = index;

      services.forEach((s, i) => {
        s.item.dataset.active = i === index ? 'true' : 'false';
      });

      if (layers.length) {
        const next = 1 - front;
        layers[next].src = services[index].src;
        layers[next].dataset.current = 'true';
        layers[front].dataset.current = 'false';
        front = next;
      }

      segments.forEach((seg, i) => {
        seg.dataset.on = i === index ? 'true' : 'false';
      });

      if (stageLabel) stageLabel.textContent = services[index].title;
      if (stageIndex) stageIndex.textContent = `${services[index].id} / 06`;
    };

    /* One shared `name` makes the list an exclusive accordion natively: opening any
       row closes whichever was open, with no bookkeeping here that could desync
       from what is on screen. Set at every width — the desktop and mobile
       behaviours are the same behaviour now. */
    const discs = items.map((item) => item.querySelector('details'));
    discs.forEach((d) => { d.name = 'services-360'; });

    /* Opening a row is the only way a row becomes active, whatever triggered it —
       hover, click, tap or a keyboard reaching <summary>. Listening to `toggle`
       rather than to each input means every route lands in the same place. */
    discs.forEach((details, index) => {
      details.addEventListener('toggle', () => {
        if (details.open) setActive(index);
      });
    });

    /* Hover opens, on pointers that actually hover. Nothing closes on leave: moving
       down the list opens the next row and the platform closes the last one, and
       leaving the list entirely keeps the row you stopped on — a section that
       collapsed itself the moment the pointer left would flicker on the way past
       and lose what you were reading on the way out.

       The coordinate check is not a nicety, it is what makes hover-to-open work in a
       list at all. Opening a row closes another, which changes the height of the
       list above the pointer, which slides a *different* row under a pointer that
       never moved — and the browser correctly reports that as pointerenter. That row
       opens, reflowing again: hovering row four used to settle on row two after a
       visible oscillation, and the section was unusable.

       The discriminator is the pointer's own position. A physical movement always
       changes clientX/clientY; a row arriving under a stationary pointer never does.
       Measured on the real page, one hover produced four pointerenter events all
       reporting the identical x=331 y=494 — so acting only when the coordinates
       differ from the last event acted on separates intent from artefact exactly.

       Gating on pointermove instead does NOT work, and the reason is worth keeping:
       Chromium dispatches the boundary events BEFORE the pointermove that caused
       them, so "ignore an enter with no preceding move" throws away the real hover
       and keeps nothing. */
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    let lastX = null;
    let lastY = null;

    services.forEach((service, index) => {
      service.item.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'touch' || !canHover.matches) return;
        if (event.clientX === lastX && event.clientY === lastY) return;
        lastX = event.clientX;
        lastY = event.clientY;
        discs[index].open = true;
      });

      /* Keyboard: reaching any control inside the row opens it, so tabbing through
         the section reveals the same content hovering does. */
      service.item.addEventListener('focusin', () => {
        discs[index].open = true;
      });
    });
  }

  /* ── Service request links prime the form ───────────────────────────────── */
  const serviceSelect = document.getElementById('rf-service');

  document.querySelectorAll('[data-request]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!serviceSelect) return;
      const wanted = link.dataset.request;
      const match = [...serviceSelect.options].find((o) => o.text === wanted);
      if (match) serviceSelect.value = match.value || match.text;
    });
  });

  /* ── Request form ───────────────────────────────────────────────────────────
     TODO before launch: point this at a real endpoint (Formspree, Netlify Forms,
     or the shop's own handler) and remove the preview branch below.
     See docs/CONTENT-TODO.md. */
  const form = document.querySelector('[data-request-form]');
  const notice = document.querySelector('[data-form-notice]');

  if (form && notice) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const missing = [...form.querySelectorAll('[required]')].find((field) =>
        field.type === 'checkbox' ? !field.checked : !field.value.trim());

      if (missing) {
        notice.textContent = 'Add your name, a phone number and the consent tick, and the request is ready to send.';
        missing.focus();
        return;
      }

      notice.textContent =
        'This preview form is not connected to the shop yet. Call (516) 820-0360 and the same details get taken straight over the phone.';
    });
  }

  /* ── Section reveals ──────────────────────────────────────────────────────
     Bands settle in as they arrive: 14px of travel in the reading direction and
     a fade, with a small stagger between siblings inside a group. The hidden
     state is written here, element by element, and removed the moment the
     element intersects.

     Everything registered here is also registered with the watchdog below, so a
     browser without IntersectionObserver, a layout that never triggers it, or an
     error anywhere after this point still ends with the page visible. */
  const revealSelectors = '[data-reveal], [data-reveal-group], [data-reveal-media],' +
                          '[data-reveal-mask], [data-reveal-rule], [data-reveal-seq]';
  const REVEAL_KEYS = REVEAL_ATTRS;

  const markIn = (el) => {
    REVEAL_KEYS.forEach((key) => {
      if (el.dataset[key] !== undefined) el.dataset[key] = 'in';
    });
  };

  /* Exposed so sections built after this point — the reviews list — can join the
     same observer instead of appearing without their reveal. */
  let registerReveal = (el) => { markIn(el); };

  document.querySelectorAll(revealSelectors).forEach((el) => revealTargets.push(el));

  if (motionOK && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        markIn(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    registerReveal = (el) => {
      revealTargets.push(el);
      /* Already on screen? Skip the hidden state entirely — content in view must
         never animate in after the first paint. */
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        markIn(el);
        return;
      }
      REVEAL_KEYS.forEach((key) => {
        if (el.dataset[key] !== undefined) el.dataset[key] = 'pending';
      });
      io.observe(el);
    };

    revealTargets.splice(0).forEach(registerReveal);

    /* Watchdog: whatever happened, the page is readable three seconds in. */
    window.setTimeout(revealAll, 3000);
  } else {
    revealAll();
  }

  /* ── Current section in the masthead nav ────────────────────────────────── */
  const navLinks = [...document.querySelectorAll('.nav-set__link')];

  if (navLinks.length && 'IntersectionObserver' in window) {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === id) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => io.observe(section));
  }

  /* ── Section 10 · verified reviews ────────────────────────────────────────
     Renders only what is in assets/js/reviews.data.js. With nothing there, the
     awaiting-data state written in the markup stays exactly as it is.

     No `Review` or `AggregateRating` structured data is emitted anywhere on this
     page, so nothing here can be read by a crawler as a verified rating. While
     `placeholder` is true the section states in plain words that the wording is
     an example. */
  const REVIEWS_SHOWN = 3;

  const starSvg = (filled) =>
    `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">` +
    `<path class="${filled ? 'stars__on' : 'stars__off'}" ` +
    `d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"/></svg>`;

  /* Marks plus the figure in words. A rating is never carried by shape or hue
     alone, and a screen reader gets a sentence rather than five graphics. */
  const starRow = (rating, size) => {
    const rounded = Math.round(rating);
    const marks = Array.from({ length: 5 }, (_, i) => starSvg(i < rounded)).join('');
    return `<span class="stars stars--${size}" role="img" ` +
           `aria-label="${rating} out of 5 stars">${marks}</span>`;
  };

  const reviewsRoot = document.querySelector('[data-reviews-root]');
  const summaryRoot = document.querySelector('[data-reviews-summary]');
  const data = window.REVIEWS_360 || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const summary = data.summary || null;

  if (summaryRoot && summary) {
    const profile = data.profileUrl || '#';
    summaryRoot.innerHTML =
      `<div class="reviews__score">
         <span class="reviews__score-figure">${summary.rating}</span>
         <span class="reviews__score-of">out of 5</span>
       </div>
       ${starRow(summary.rating, 'lg')}
       <p class="reviews__source">
         <span class="reviews__count">Across ${summary.count} reviews on</span>
         <span class="reviews__source-name">${summary.source || 'Google'}</span>
       </p>
       <a class="action action--secondary" href="${profile}" target="_blank" rel="noopener">
         View on ${summary.source || 'Google'}
         <span class="action__mark" aria-hidden="true">→</span>
       </a>`;
  }

  if (reviewsRoot && items.length) {
    const set = document.createElement('ul');
    set.className = 'reviews__set';

    items.slice(0, REVIEWS_SHOWN).forEach((review) => {
      const li = document.createElement('li');
      li.className = 'review';
      li.innerHTML =
        `${starRow(review.rating || 5, 'sm')}
         <blockquote class="review__quote">${review.text}</blockquote>
         <div class="review__meta">
           <span class="review__author">${review.author}</span>
           <span class="review__where">${[review.source, review.date].filter(Boolean).join(' · ')}</span>
         </div>`;
      set.appendChild(li);
    });

    const foot = document.createElement('div');
    foot.className = 'reviews__foot';
    foot.innerHTML = data.placeholder
      ? `<p class="reviews__disclosure">Example wording shown. Real reviews from the
           shop's Google profile replace these before launch.</p>`
      : '';

    reviewsRoot.replaceChildren(set, foot);

    /* Built after the reveal observer was wired, so it joins explicitly. Without
       this the excerpts appeared fully formed while every other band settled in. */
    set.dataset.revealGroup = 'pending';
    registerReveal(set);

    if (data.placeholder) {
      reviewsRoot.setAttribute('data-placeholder', 'true');
      if (summaryRoot) summaryRoot.setAttribute('data-placeholder', 'true');
    }
  }
})();
