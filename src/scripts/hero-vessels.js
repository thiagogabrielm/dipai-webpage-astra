// One clock keeps the five-second tabs and 3.5-second reveal in sync.
const hero = document.querySelector('[data-vessel-hero]');
if (hero) mountVesselHero(hero);

function mountVesselHero(root) {
  const CYCLE = 5000;
  const REVEAL_END = 3500;
  const IMAGE_FADE = 700;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 900px)');
  let image = root.querySelector('.hero-background');
  const ribbon = root.querySelector('.vessel-ribbon');
  const tablist = root.querySelector('.vessel-tabs');
  const tabs = [...root.querySelectorAll('.vessel-tab')];
  const panels = [...root.querySelectorAll('[data-vessel-panel]')];
  const slot = root.querySelector('.vessel-callout-slot');
  const signal = root.querySelector('.vessel-signal');
  const svg = root.querySelector('.vessel-connector');
  const path = svg.querySelector('path');
  const playback = root.querySelector('.vessel-playback');
  const slides = panels.map((panel) => ({
    panel,
    // Anchors are normalized image coordinates, independent of the responsive crop.
    image: panel.dataset.image || image.getAttribute('src'),
    imageSet: panel.dataset.imageSet,
    imageAlt: panel.dataset.imageAlt || image.alt,
    anchor: [Number(panel.dataset.anchorX || 0.77), Number(panel.dataset.anchorY || 0.51)],
    lines: [...panel.querySelectorAll('[data-type]')].map((element) => ({
      element,
      text: [...element.textContent.trim()],
      shown: -1,
    })),
  }));
  let active = 0;
  let elapsed = 0;
  let lastTime = null;
  let frame = 0;
  let ready = false;
  let onScreen = true;
  let paused = reducedMotion.matches;
  let instantReveal = reducedMotion.matches;
  let imageRequest = 0;
  // Decode on demand, then warm the next image after the current slide is visible.
  const pictures = new Map();
  function loadPicture(slide) {
    if (!pictures.has(slide.image)) {
      const picture = new Image();
      picture.decoding = 'async';
      picture.fetchPriority = 'low';
      picture.sizes = '100vw';
      picture.srcset = slide.imageSet || '';
      picture.src = slide.image;
      pictures.set(
        slide.image,
        picture.decode().then(
          () => true,
          () => false,
        ),
      );
    }
    return pictures.get(slide.image);
  }
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const phase = (time, start, end) => clamp((time - start) / (end - start));
  const ease = (value) => 1 - (1 - value) ** 3;

  function positionSignal() {
    const bounds = root.getBoundingClientRect();
    const picture = image.getBoundingClientRect();
    const box = slot.getBoundingClientRect();
    const [objectX, objectY] = getComputedStyle(image)
      .objectPosition.split(' ')
      .map((value) => parseFloat(value) / 100);
    const scale = Math.max(
      picture.width / image.naturalWidth,
      picture.height / image.naturalHeight,
    );
    if (!Number.isFinite(scale)) return;
    const [anchorX, anchorY] = slides[active].anchor;
    const x =
      picture.left -
      bounds.left +
      (picture.width - image.naturalWidth * scale) * objectX +
      image.naturalWidth * scale * anchorX;
    const y =
      picture.top -
      bounds.top +
      (picture.height - image.naturalHeight * scale) * objectY +
      image.naturalHeight * scale * anchorY;
    root.style.setProperty('--vessel-x', `${x}px`);
    root.style.setProperty('--vessel-y', `${y}px`);
    const endX = (narrow.matches ? box.right - 0.5 : box.left + 0.5) - bounds.left;
    const endY = (narrow.matches ? box.top + 0.5 : box.bottom - 0.5) - bounds.top;
    const bendY = (y + endY) / 2;
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    path.setAttribute('d', `M ${x} ${y} V ${bendY} H ${endX} V ${endY}`);
  }

  // Text with the rating arrow lifted into its own span.
  function typedNodes(chars) {
    const nodes = [];
    chars
      .join('')
      .split('→')
      .forEach((part, index) => {
        if (index) {
          const arrow = document.createElement('span');
          arrow.className = 'vessel-rating-arrow';
          arrow.textContent = '→';
          nodes.push(arrow);
        }
        if (part) nodes.push(part);
      });
    return nodes;
  }
  // A zero-width marker; its caret is drawn outside the text flow so it cannot move line breaks.
  function caret() {
    const marker = document.createElement('span');
    marker.className = 'vessel-caret';
    marker.setAttribute('aria-hidden', 'true');
    return marker;
  }

  function render() {
    const time = instantReveal ? REVEAL_END : elapsed;
    const dot = ease(phase(time, 0, 250));
    signal.style.opacity = dot;
    signal.style.transform = `scale(${dot})`;
    path.style.strokeDashoffset = 1 - phase(time, 250, 1000);
    const box = ease(phase(time, 1000, 1600));
    slides[active].panel.style.transform = `scale(${box})`;
    slides[active].panel.style.pointerEvents = 'none';
    slides[active].panel.style.opacity = box > 0 ? 1 : 0;
    const lines = slides[active].lines;
    const total = lines.reduce((sum, line) => sum + line.text.length, 0);
    const typingDone = time >= 3400;
    const lastLine = lines.filter((line) => line.text.length).at(-1);
    let letters = Math.floor(phase(time, 1700, 3400) * total);
    for (const line of lines) {
      const count = Math.min(line.text.length, Math.max(0, letters));
      if (line.shown !== count) {
        // The whole line is always laid out; untyped letters are only invisible. Line breaks
        // are therefore fixed from the first letter and a word never jumps mid-typing.
        line.shown = count;
        const untyped = document.createElement('span');
        untyped.className = 'vessel-untyped';
        untyped.append(...typedNodes(line.text.slice(count)));
        line.element.replaceChildren(...typedNodes(line.text.slice(0, count)), caret(), untyped);
      }
      line.element.classList.toggle(
        'is-typing',
        time >= 1700 && !typingDone && letters >= 0 && letters < line.text.length,
      );
      line.element.classList.toggle('is-awaiting-input', typingDone && line === lastLine);
      letters -= line.text.length;
    }
    tabs[active].style.setProperty(
      '--vessel-progress',
      reducedMotion.matches && paused ? 1 : clamp(elapsed / CYCLE),
    );
  }

  function updatePlayback() {
    const label = paused ? 'Play vessel rotation' : 'Pause vessel rotation';
    playback.setAttribute('aria-label', label);
    playback.title = label;
    playback.querySelector('[data-play-icon]').toggleAttribute('hidden', !paused);
    playback.querySelector('[data-pause-icon]').toggleAttribute('hidden', paused);
  }

  function showImage(slide) {
    const request = ++imageRequest;
    ready = false;
    loadPicture(slide).then(async (loaded) => {
      // A slow image must never overwrite a more recent tab selection.
      if (request !== imageRequest) return;
      if (loaded) {
        if (image.getAttribute('src') !== slide.image) {
          const next = image.cloneNode(false);
          next.srcset = slide.imageSet || '';
          next.src = slide.image;
          next.alt = slide.imageAlt;
          next.removeAttribute('aria-hidden');
          // Decode the actual display layer before revealing it. The old ocean stays
          // fully opaque underneath, avoiding a dark flash halfway through the fade.
          try {
            await next.decode();
          } catch {
            if (request === imageRequest) {
              ready = true;
              if (!paused) loadPicture(slides[(active + 1) % slides.length]);
              lastTime = null;
              schedule();
            }
            return;
          }
          if (request !== imageRequest) return;
          image.setAttribute('aria-hidden', 'true');
          image.after(next);
          image = next;
          const clearPrevious = () => {
            if (image !== next) return;
            root.querySelectorAll('.hero-background').forEach((layer) => {
              if (layer !== next) layer.remove();
            });
          };
          if (reducedMotion.matches) clearPrevious();
          else {
            // Rapid tab changes retain the current blend until the newest layer is
            // opaque, then discard all superseded layers.
            next
              .animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: IMAGE_FADE,
                easing: 'ease-in-out',
              })
              .finished.then(clearPrevious, () => {});
          }
        } else if (reducedMotion.matches) {
          root.querySelectorAll('.hero-background').forEach((layer) => {
            layer.getAnimations().forEach((animation) => animation.cancel());
            if (layer !== image) layer.remove();
          });
        }
        image.alt = slide.imageAlt;
      }
      ready = true;
      if (!paused) loadPicture(slides[(active + 1) % slides.length]);
      lastTime = null;
      positionSignal();
      schedule();
    });
  }

  function revealSelectedTab() {
    const selected = tabs[active].getBoundingClientRect();
    const track = tablist.getBoundingClientRect();
    if (selected.left < track.left || selected.right > track.right) {
      tablist.scrollTo({
        left: tablist.scrollLeft + selected.left - track.left - (track.width - selected.width) / 2,
        behavior: 'instant',
      });
    }
  }

  function select(index, keyboard = false) {
    active = (index + slides.length) % slides.length;
    elapsed = 0;
    lastTime = null;
    instantReveal = reducedMotion.matches || paused;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === active));
      tab.tabIndex = i === active ? 0 : -1;
      tab.style.setProperty('--vessel-progress', 0);
      panels[i].hidden = i !== active;
    });
    showImage(slides[active]);
    positionSignal();
    render();
    const selected = tabs[active];
    revealSelectedTab();
    if (keyboard) selected.focus({ preventScroll: true });
    schedule();
  }

  function tick(now) {
    frame = 0;
    if (!ready || paused || !onScreen || document.hidden) {
      lastTime = null;
      return;
    }
    const delta = lastTime === null ? 0 : now - lastTime;
    lastTime = now;
    elapsed = Math.min(CYCLE, elapsed + delta);
    if (elapsed >= CYCLE) select(active + 1);
    else render();
    schedule();
  }

  function schedule() {
    if (!frame && ready && !paused && onScreen && !document.hidden)
      frame = requestAnimationFrame(tick);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', (event) => {
      const target = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[
        event.key
      ];
      if (target === undefined) return;
      event.preventDefault();
      select(target, true);
    });
  });
  playback.addEventListener('click', () => {
    paused = !paused;
    lastTime = null;
    updatePlayback();
    schedule();
  });
  reducedMotion.addEventListener('change', () => {
    paused = reducedMotion.matches;
    updatePlayback();
    select(active);
  });
  document.addEventListener('visibilitychange', () => {
    lastTime = null;
    schedule();
  });
  new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      lastTime = null;
      schedule();
    },
    { threshold: 0 },
  ).observe(root);
  new ResizeObserver(() => {
    positionSignal();
    revealSelectedTab();
  }).observe(root);
  ribbon.hidden = false;
  updatePlayback();
  select(0);
}
