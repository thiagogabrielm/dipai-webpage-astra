import { mountCarouselMarker } from './carousel-marker.js';
// Timed customer testimonial carousel.
const section = document.querySelector('#testimonials-focus');
if (section) {
  const viewport = section.querySelector('.focus-quote-viewport');
  const cards = [...section.querySelectorAll('.focus-quote-card')];
  const dots = [...section.querySelectorAll('[data-quote-dot]')];
  const marker = mountCarouselMarker(section.querySelector('.section-carousel-dots'), dots);
  const status = section.querySelector('.focus-quote-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let rendered = cards.map((card, index) => ({ card, index, cycle: 0, slot: index }));
  let selected = 0,
    position = 0,
    step = 0,
    cardWidth = 0,
    inset = 0,
    elapsed = 0,
    previousTime = null,
    frame = 0;
  let visible = false,
    hovered = false,
    focused = false;
  let dragging = null,
    suppressClick = false;
  const CYCLE = 5000;
  let paused = false;
  const pauseButton = section.querySelector('[data-quote-pause]');
  pauseButton.hidden = reduced.matches;
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.setAttribute('aria-pressed', String(paused));
    clock();
  });
  reduced.addEventListener('change', () => {
    pauseButton.hidden = reduced.matches;
  });
  function paint(manual = false) {
    const halfCycles = (rendered.length / cards.length - 1) / 2;
    const firstSlot = position - halfCycles * cards.length;
    rendered.forEach((entry) => {
      const { card, index } = entry;
      const oldSlot = entry.slot;
      // Recycle only far outside the viewport; visible copies retain their identity.
      entry.slot =
        firstSlot +
        ((((entry.slot - firstSlot) % rendered.length) + rendered.length) % rendered.length);
      const recycled = entry.slot !== oldSlot;
      if (recycled) card.classList.add('is-repositioning');
      const offset = entry.slot - position;
      const current = offset === 0;
      const gap = step - cardWidth;
      const shortStep = cardWidth * 0.8 + gap;
      const x = offset < 0 ? offset * shortStep : offset > 0 ? step + (offset - 1) * shortStep : 0;
      const away =
        inset + x + (current ? cardWidth : cardWidth * 0.8) < 0 || inset + x > viewport.clientWidth;
      card.style.setProperty('--focus-offset', `${x}px`);
      card.classList.toggle('is-current', current);
      card.toggleAttribute('data-away', away);
      card.inert = away;
      card.setAttribute('aria-hidden', String(away));
      card.querySelector('blockquote').setAttribute('aria-hidden', String(!current));
      card.querySelector('.focus-quote-select').hidden = current;
      if (recycled) {
        void card.offsetWidth;
        requestAnimationFrame(() => card.classList.remove('is-repositioning'));
      }
    });
    dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === selected)));
    section.dataset.quoteSelected = String(selected);
    marker.select(selected, !section.classList.contains('is-measuring'));
    if (manual)
      status.textContent = `Quote ${selected + 1} of ${cards.length}: ${cards[selected].querySelector('.focus-quote-person strong').textContent}`;
  }
  function select(index, manual = true, travel = null) {
    let delta = index - selected;
    if (delta > cards.length / 2) delta -= cards.length;
    if (delta < -cards.length / 2) delta += cards.length;
    position += travel ?? delta;
    selected = ((position % cards.length) + cards.length) % cards.length;
    elapsed = 0;
    paint(manual);
  }
  function measure() {
    section.classList.add('is-measuring');
    const heading = section.querySelector('.quote-showcase-heading');
    inset = heading.getBoundingClientRect().left - viewport.getBoundingClientRect().left;
    section.style.setProperty('--focus-inset', `${inset}px`);
    const width = viewport.querySelector('.is-current').offsetWidth;
    cardWidth = width;
    step = width + parseFloat(getComputedStyle(section).getPropertyValue('--focus-gap'));
    // Repeat neighboring entries as needed to fill both viewport edges, even on ultrawide screens.
    const cycles =
      Math.ceil(viewport.clientWidth / ((width * 0.8 + step - width) * cards.length)) + 1;
    if (rendered.length !== cards.length * (2 * cycles + 1)) {
      rendered.filter((entry) => entry.cycle !== 0).forEach((entry) => entry.card.remove());
      rendered = cards.map((card, index) => ({ card, index, cycle: 0, slot: index }));
      for (let cycle = -cycles; cycle <= cycles; cycle++) {
        if (!cycle) continue;
        cards.forEach((source, index) => {
          const card = source.cloneNode(true);
          viewport.append(card);
          rendered.push({ card, index, cycle, slot: index + cycle * cards.length });
        });
      }
    }
    // Reserve space for the longest quote without depending on the retired carousel.
    const padding = parseFloat(
      getComputedStyle(section).getPropertyValue('--focus-content-padding'),
    );
    const contentTop = innerWidth <= 600 ? 93 : 100;
    const height = Math.ceil(
      Math.max(
        innerWidth <= 600 ? 482 : 484,
        ...cards.map(
          (card) =>
            contentTop +
            card.querySelector('blockquote').scrollHeight +
            22 +
            card.querySelector('.focus-quote-person').offsetHeight +
            padding +
            2,
        ),
      ),
    );
    section.style.setProperty('--focus-height', `${height}px`);
    section.style.setProperty('--focus-short-height', `${Math.round(height * 0.75)}px`);
    rendered.forEach(({ card }) => {
      const personHeight = card.querySelector('.focus-quote-person').offsetHeight;
      card.style.setProperty('--focus-person-height', `${personHeight}px`);
    });
    paint();
    requestAnimationFrame(() => section.classList.remove('is-measuring'));
  }
  function canRun() {
    return (
      visible &&
      !paused &&
      !reduced.matches &&
      !hovered &&
      !focused &&
      !document.hidden &&
      !dragging
    );
  }
  function tick(now) {
    frame = 0;
    if (!canRun()) {
      previousTime = null;
      return;
    }
    if (previousTime !== null) elapsed += Math.min(now - previousTime, 100);
    previousTime = now;
    if (elapsed >= CYCLE) select(selected + 1, false);
    frame = requestAnimationFrame(tick);
  }
  function clock() {
    if (!canRun()) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
    } else if (!frame) frame = requestAnimationFrame(tick);
  }
  section.querySelector('[data-quote-prev]').addEventListener('click', () => select(selected - 1));
  section.querySelector('[data-quote-next]').addEventListener('click', () => select(selected + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => select(index)));
  viewport.addEventListener('click', (event) => {
    const button = event.target.closest('.focus-quote-select');
    if (button) {
      const entry = rendered.find((item) => item.card === button.closest('[data-quote-index]'));
      if (entry) select(entry.index, true, entry.slot - position);
    }
  });
  viewport.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    select(
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? cards.length - 1
          : selected + (event.key === 'ArrowRight' ? 1 : -1),
    );
    viewport.focus({ preventScroll: true });
  });
  viewport.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    clock();
  });
  // Background logos must not start the browser's native image drag operation.
  viewport.addEventListener('dragstart', (event) => event.preventDefault());
  function finishDrag(event) {
    if (!dragging || dragging.id !== event.pointerId) return;
    const dx = event.clientX - dragging.x,
      dy = event.clientY - dragging.y;
    dragging = null;
    if (event.type !== 'pointercancel' && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      suppressClick = true;
      select(selected + (dx < 0 ? 1 : -1));
      setTimeout(() => {
        suppressClick = false;
      }, 0);
    }
    clock();
  }
  addEventListener('pointerup', finishDrag);
  addEventListener('pointercancel', finishDrag);
  viewport.addEventListener(
    'click',
    (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );
  section.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') {
      hovered = true;
      clock();
    }
  });
  section.addEventListener('pointerleave', () => {
    hovered = false;
    clock();
  });
  section.addEventListener('focusin', () => {
    focused = true;
    clock();
  });
  section.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      focused = section.contains(document.activeElement);
      clock();
    });
  });
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      clock();
    },
    { threshold: 0.2 },
  ).observe(section);
  document.addEventListener('visibilitychange', clock);
  reduced.addEventListener('change', clock);
  const sizeObserver = new ResizeObserver(measure);
  sizeObserver.observe(viewport);
  document.fonts.ready.then(measure);
  measure();
  clock();
}
