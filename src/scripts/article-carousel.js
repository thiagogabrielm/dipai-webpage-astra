import { mountCarouselMarker } from './carousel-marker.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
for (const gallery of document.querySelectorAll('[data-article-carousel]')) {
  const slides = [...gallery.querySelectorAll('.article-image')];
  if (slides.length < 2) continue;
  const track = document.createElement('div');
  track.className = 'article-carousel-track';
  track.tabIndex = 0;
  track.setAttribute('aria-label', 'Post pictures. Use left and right arrow keys to browse.');
  slides.forEach((slide, i) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Picture ${i + 1} of ${slides.length}`);
    slide.querySelector('img').draggable = false;
    track.append(slide);
  });
  gallery.setAttribute('role', 'region');
  gallery.setAttribute('aria-roledescription', 'carousel');
  gallery.setAttribute('aria-label', 'Pictures from the original LinkedIn post');
  const controls = document.createElement('div');
  controls.className = 'section-carousel-controls';
  const arrow = (direction, label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'section-carousel-arrow';
    button.setAttribute('aria-label', label);
    button.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="${direction < 0 ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'}"/></svg>`;
    return button;
  };
  const previous = arrow(-1, 'Previous picture');
  const next = arrow(1, 'Next picture');
  const dots = document.createElement('div');
  dots.className = 'section-carousel-dots';
  const buttons = slides.map((slide, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'section-carousel-dot';
    button.setAttribute('aria-label', `Show picture ${i + 1} of ${slides.length}`);
    button.addEventListener('click', () => go(i));
    dots.append(button);
    return button;
  });
  const status = document.createElement('span');
  status.className = 'section-carousel-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  controls.append(previous, dots, next, status);
  gallery.append(track, controls);
  gallery.classList.add('article-carousel');
  const marker = mountCarouselMarker(dots, buttons);
  let current = 0,
    drag = null,
    frame = 0;
  function paint(index, animate = true) {
    current = index;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
    status.textContent = `Picture ${index + 1} of ${slides.length}`;
    marker.select(index, animate);
  }
  function go(index, instant = false) {
    index = Math.max(0, Math.min(slides.length - 1, index));
    paint(index, !instant);
    track.scrollTo({
      left: index * track.clientWidth,
      behavior: instant || reducedMotion.matches ? 'instant' : 'smooth',
    });
  }
  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  track.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    go(
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? slides.length - 1
          : current + (event.key === 'ArrowRight' ? 1 : -1),
    );
  });
  track.addEventListener(
    'scroll',
    () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          const nearest = Math.max(
            0,
            Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)),
          );
          if (nearest !== current) paint(nearest);
        });
    },
    { passive: true },
  );
  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, scroll: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
    track.classList.add('is-dragging');
  });
  track.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    track.scrollLeft = drag.scroll + drag.x - event.clientX;
  });
  function endDrag() {
    if (!drag) return;
    const id = drag.id;
    drag = null;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(id)) track.releasePointerCapture(id);
    go(Math.round(track.scrollLeft / track.clientWidth));
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('lostpointercapture', endDrag);
  new ResizeObserver(() => go(current, true)).observe(track);
  paint(0, false);
}
