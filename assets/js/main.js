/* ═══════════════════════════════════════════════════════════════════════════
   360 AUTO CARE INC — page behaviour

   Rules this file follows:
   · Nothing on the page is hidden by default and revealed by script. There are
     no scroll reveals: a paragraph fading in communicates nothing, and the
     page's motion budget is spent where it has a job — the hero settling once,
     the service image crossfading, the masthead firming on scroll.
   · Only opacity and transform are animated.
   · Every hover behaviour has a focus equivalent.
   · The service directory works with no script at all: every <details> ships
     open, so all copy, related services and request links are readable. Script
     adds the desktop image stage and the mobile accordion.
   ═══════════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const root = document.documentElement;
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = window.matchMedia('(min-width: 62rem)');

  root.classList.add('js');
  if (motionOK) root.classList.add('js-motion');

  /* ── Content-to-confirm mode ─────────────────────────────────────────────
     ?todo outlines every placeholder value before the preview is handed over. */
  if (new URLSearchParams(location.search).has('todo')) {
    document.body.classList.add('show-todo');
  }

  /* ── Masthead: transparent over the hero, solid once scrolled ───────────── */
  const masthead = document.querySelector('[data-masthead]');
  if (masthead) {
    const setState = () => {
      masthead.dataset.scrolled = window.scrollY > 32 ? 'true' : 'false';
    };
    setState();
    window.addEventListener('scroll', setState, { passive: true });
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
     honest awaiting-data state written in the markup stays exactly as it is. */
  const reviewsRoot = document.querySelector('[data-reviews-root]');
  const reviews = Array.isArray(window.REVIEWS_360) ? window.REVIEWS_360 : [];

  if (reviewsRoot && reviews.length) {
    const set = document.createElement('ul');
    set.className = 'reviews__set';

    reviews.slice(0, 3).forEach((review) => {
      const li = document.createElement('li');
      li.className = 'review';

      const quote = document.createElement('blockquote');
      quote.className = 'review__quote';
      quote.textContent = `“${review.text}”`;

      const meta = document.createElement('div');
      meta.className = 'review__meta';

      const source = document.createElement('p');
      source.className = 'review__source';
      source.textContent = [review.author, review.source, review.date]
        .filter(Boolean)
        .join(' · ');

      meta.appendChild(source);

      if (review.rating) {
        const rating = document.createElement('p');
        rating.className = 'review__rating';
        /* Stated in figures as well as marks — never carried by shape alone. */
        rating.textContent = `${review.rating}/5 ★`;
        meta.appendChild(rating);
      }

      li.append(quote, meta);
      set.appendChild(li);
    });

    reviewsRoot.replaceChildren(set);
  }
})();
