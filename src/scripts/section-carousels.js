import { mountCarouselMarker } from './carousel-marker.js';
// Shared responsive carousels for editorial cards and the people directory.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
for (const [selector, label, itemName, breakpoint] of [
  ['#stories.use-case-home .use-case-grid', 'Use cases', 'use case'],
  ['#news[data-news-border-trial] .news-grid', 'News', 'news article'],
]) {
  const track = document.querySelector(selector);
  if (!track) continue;
  const originalRole = track.getAttribute('role');
  const narrow = breakpoint ? matchMedia(`(max-width: ${breakpoint}px)`) : null;
  const cards = [...track.children];
  const gridCardCount = cards.filter((card) => !card.hasAttribute('data-carousel-only')).length;
  if (cards.length < 2) continue;
  track.classList.add('section-carousel-track');
  const controls = document.createElement('div');
  controls.className = 'section-carousel-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', `${label} carousel controls`);
  controls.hidden = true;
  const arrow = (direction, text) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'section-carousel-arrow';
    button.setAttribute('aria-label', text);
    button.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="${direction === -1 ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'}"/></svg>`;
    return button;
  };
  const previous = arrow(-1, `Previous ${itemName}`);
  const next = arrow(1, `Next ${itemName}`);
  const positions = document.createElement('div');
  positions.className = 'section-carousel-positions';
  const dots = document.createElement('div');
  dots.className = 'section-carousel-dots';
  const dotButtons = cards.map((card, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'section-carousel-dot';
    const title = card.querySelector('h2, h3')?.textContent.trim() || `${index + 1}`;
    button.setAttribute('aria-label', `Show ${itemName} ${index + 1}: ${title}`);
    button.addEventListener('click', () => go(index));
    dots.append(button);
    return button;
  });
  const counter = document.createElement('span');
  counter.className = 'section-carousel-status';
  counter.setAttribute('role', 'status');
  counter.setAttribute('aria-live', 'polite');
  counter.setAttribute('aria-atomic', 'true');
  positions.append(dots, counter);
  controls.append(previous, positions, next);
  track.after(controls);
  const marker = mountCarouselMarker(dots, dotButtons);

  let active = false,
    current = 0,
    requested = null,
    lastLayout = '',
    scrollFrame = 0,
    settleTimer = 0;
  function paint(index, animate = true) {
    current = index;
    cards.forEach((card, i) => card.toggleAttribute('data-carousel-current', i === index));
    // A disabled button drops keyboard focus to the page, so hand it to the other arrow first.
    const atStart = index === 0;
    const atEnd = index === cards.length - 1;
    if (atStart && document.activeElement === previous) (atEnd ? track : next).focus();
    if (atEnd && document.activeElement === next) (atStart ? track : previous).focus();
    previous.disabled = atStart;
    next.disabled = atEnd;
    dotButtons.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    marker.select(index, animate);
    const text = `${itemName} ${index + 1} of ${cards.length}`;
    if (counter.textContent !== text) counter.textContent = text;
    counter.setAttribute('aria-label', `${itemName} ${index + 1} of ${cards.length}`);
  }
  function offset(index) {
    // Layout coordinates remain stable while neighbouring cards scale down.
    return cards[index].offsetLeft - parseFloat(track.style.getPropertyValue('--carousel-gutter'));
  }
  function nearest() {
    return cards.reduce(
      (best, _, i) =>
        Math.abs(offset(i) - track.scrollLeft) < Math.abs(offset(best) - track.scrollLeft)
          ? i
          : best,
      0,
    );
  }
  function go(index, instant = false) {
    if (!active) return;
    index = Math.max(0, Math.min(cards.length - 1, index));
    requested = index;
    paint(index, !instant);
    track.scrollTo({
      left: offset(index),
      behavior: instant || reducedMotion.matches ? 'instant' : 'smooth',
    });
  }
  function settled() {
    clearTimeout(settleTimer);
    requested = null;
    if (active) paint(nearest());
  }
  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  track.addEventListener(
    'scroll',
    () => {
      if (!scrollFrame)
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = 0;
          if (active && requested === null) paint(nearest());
        });
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settled, 160);
    },
    { passive: true },
  );
  track.addEventListener('scrollend', settled);
  track.addEventListener('pointerdown', () => {
    requested = null;
  });
  track.addEventListener(
    'wheel',
    () => {
      requested = null;
    },
    { passive: true },
  );
  let drag = null,
    suppressClickUntil = 0;
  track.addEventListener('pointerdown', (event) => {
    if (!active || event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, start: track.scrollLeft, moved: false };
    suppressClickUntil = 0;
  });
  track.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!active || !(event.buttons & 1)) {
      endDrag();
      return;
    }
    const delta = event.clientX - drag.x;
    if (!drag.moved && Math.abs(delta) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      track.setAttribute('data-dragging', '');
      track.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    track.scrollLeft = drag.start - delta;
  });
  function endDrag() {
    if (!drag) return;
    const { id, moved } = drag;
    const index = nearest();
    drag = null;
    track.removeAttribute('data-dragging');
    if (track.hasPointerCapture(id)) track.releasePointerCapture(id);
    if (moved) {
      suppressClickUntil = performance.now() + 400;
      go(index);
    }
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('lostpointercapture', endDrag);
  track.addEventListener('dragstart', (event) => {
    if (active) event.preventDefault();
  });
  track.addEventListener(
    'click',
    (event) => {
      if (event.detail > 0 && performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true,
  );
  track.addEventListener('focusin', (event) => {
    const index = cards.findIndex((card) => card.contains(event.target));
    if (index >= 0) go(index);
  });
  function keyboard(event) {
    if (!active || event.altKey || event.ctrlKey || event.metaKey) return;
    const destinations = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: cards.length - 1,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    go(destinations[event.key]);
  }
  track.addEventListener('keydown', keyboard);
  controls.addEventListener('keydown', keyboard);

  function layout() {
    // Decide whether the grid fits using its original content column, not the
    // expanded track. This avoids cycling between grid and carousel layouts.
    const parent = track.parentElement;
    const parentStyle = getComputedStyle(parent);
    const paddingLeft = parseFloat(parentStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(parentStyle.paddingRight) || 0;
    const width = parent.clientWidth - paddingLeft - paddingRight;
    const contentLeft = parent.getBoundingClientRect().left + parent.clientLeft + paddingLeft;
    const pageFrame = track.closest('.page-frame');
    const edgeLeft = pageFrame ? pageFrame.getBoundingClientRect().left + pageFrame.clientLeft : 0;
    const fullWidth = pageFrame ? pageFrame.clientWidth : document.documentElement.clientWidth;
    const signature = [width, fullWidth, contentLeft, edgeLeft, narrow?.matches].join(':');
    if (!width || signature === lastLayout) return;
    lastLayout = signature;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
    active = narrow ? narrow.matches : width < gridCardCount * 320 + (gridCardCount - 1) * gap;
    cards.forEach((card) => {
      if (card.hasAttribute('data-carousel-only')) card.hidden = !active;
    });
    track.toggleAttribute('data-carousel-active', active);
    controls.hidden = !active;
    if (active) {
      const cardWidth = Math.min(420, width - 32);
      track.style.setProperty('--carousel-track-width', `${fullWidth}px`);
      track.style.setProperty('--carousel-track-offset', `${edgeLeft - contentLeft}px`);
      track.style.setProperty('--carousel-card-width', `${cardWidth}px`);
      const gutter = contentLeft - edgeLeft;
      track.style.setProperty('--carousel-gutter', `${gutter}px`);
      track.style.setProperty('--carousel-end-gutter', `${fullWidth - gutter - cardWidth}px`);
      track.setAttribute('role', originalRole || 'region');
      track.setAttribute('aria-roledescription', 'carousel');
      track.setAttribute('aria-label', label);
      track.tabIndex = 0;
      go(current, true);
    } else {
      for (const property of ['--carousel-track-width', '--carousel-track-offset'])
        track.style.removeProperty(property);
      requested = null;
      track.scrollLeft = 0;
      for (const attribute of ['aria-roledescription', 'aria-label', 'tabindex'])
        track.removeAttribute(attribute);
      if (originalRole) track.setAttribute('role', originalRole);
      else track.removeAttribute('role');
    }
  }
  narrow?.addEventListener('change', () => {
    lastLayout = '';
    layout();
  });
  paint(0);
  new ResizeObserver(layout).observe(track.parentElement);
  window.addEventListener('resize', layout, { passive: true });
  layout();
}
