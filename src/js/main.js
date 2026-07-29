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
   · The service directory works with no script at all: every <details> ships
     open, so all copy, related services and request links are readable. Script
     adds the desktop image stage and the mobile accordion.
   · Scroll work is rAF-coalesced and writes one custom property.
   ═══════════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const root = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 62rem)');
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

  function revealAll() {
    revealTargets.forEach((el) => {
      ['reveal', 'revealGroup', 'revealMedia'].forEach((key) => {
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
     One listener, one rAF frame, two jobs: firm the masthead, and drift the hero
     photograph. Reads happen together and writes happen together, so a scroll
     never interleaves layout reads with style writes. */
  const masthead = document.querySelector('[data-masthead]');
  const hero = document.querySelector('[data-hero]');
  const heroMedia = hero ? hero.querySelector('.hero__media') : null;

  let scrollQueued = false;

  const onScrollFrame = () => {
    scrollQueued = false;
    const y = window.scrollY;

    if (masthead) {
      masthead.dataset.scrolled = y > 32 ? 'true' : 'false';
    }

    /* The photograph lags the page by up to 6% of its own height as the hero
       leaves the viewport — a depth cue, not a parallax effect. Written on the
       section so the wordmark inherits it too and drifts at a third of the rate,
       which is what puts the two layers at different depths. Clamped at 1, so
       nothing is recomputed once the hero has gone. */
    if (heroMedia && motionOK) {
      const height = hero.offsetHeight || 1;
      const progress = Math.min(Math.max(y / height, 0), 1);
      hero.style.setProperty('--hero-shift', `${(-6 * progress).toFixed(2)}%`);
    }
  };

  const queueScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(onScrollFrame);
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

    services.forEach((service, index) => {
      const details = service.item.querySelector('details');
      const summary = service.item.querySelector('summary');

      /* Pointer and keyboard drive the same state. */
      service.item.addEventListener('pointerenter', () => {
        if (wide.matches) setActive(index);
      });
      service.item.addEventListener('focusin', () => setActive(index));

      summary.addEventListener('click', (event) => {
        if (wide.matches) {
          /* On wide formats every row stays open — the row's own copy is always
             readable and the click only moves the image stage. */
          event.preventDefault();
          setActive(index);
        }
      });

      details.addEventListener('toggle', () => {
        if (details.open) setActive(index);
      });
    });

    /* Below 62rem the same markup becomes a native exclusive accordion; above
       it, every row is open. */
    const applyFormat = () => {
      const details = items.map((item) => item.querySelector('details'));

      if (wide.matches) {
        details.forEach((d) => {
          d.removeAttribute('name');
          d.open = true;
        });
      } else {
        details.forEach((d) => { d.open = false; });
        details.forEach((d) => { d.name = 'services-360'; });
        details[activeIndex].open = true;
      }
    };

    applyFormat();
    wide.addEventListener('change', applyFormat);
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
        'This preview form is not connected to the shop yet. Call (516) 555-0100 and the same details get taken straight over the phone.';
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
  const revealSelectors = '[data-reveal], [data-reveal-group], [data-reveal-media]';

  document.querySelectorAll(revealSelectors).forEach((el) => revealTargets.push(el));

  if (motionOK && 'IntersectionObserver' in window && revealTargets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        ['reveal', 'revealGroup', 'revealMedia'].forEach((key) => {
          if (el.dataset[key] !== undefined) el.dataset[key] = 'in';
        });
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealTargets.forEach((el) => {
      /* Anything already on screen at load skips the hidden state entirely —
         above-the-fold content must never animate in after the first paint. */
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.92) {
        ['reveal', 'revealGroup', 'revealMedia'].forEach((key) => {
          if (el.dataset[key] !== undefined) el.dataset[key] = 'in';
        });
        return;
      }
      ['reveal', 'revealGroup', 'revealMedia'].forEach((key) => {
        if (el.dataset[key] !== undefined) el.dataset[key] = 'pending';
      });
      io.observe(el);
    });

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
       <a class="link-action" href="${profile}" target="_blank" rel="noopener">
         View on ${summary.source || 'Google'}
         <span class="link-action__mark" aria-hidden="true">→</span>
       </a>`;
  }

  if (reviewsRoot && items.length) {
    const set = document.createElement('ul');
    set.className = 'reviews__set';
    set.dataset.revealGroup = 'in';

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

    if (data.placeholder) {
      reviewsRoot.setAttribute('data-placeholder', 'true');
      if (summaryRoot) summaryRoot.setAttribute('data-placeholder', 'true');
    }
  }
})();
