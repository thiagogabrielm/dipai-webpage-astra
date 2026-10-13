import { renderPlatformVisual, armMotion } from './platform-visuals.js';
import { updateMotionControl } from './motion-control.js';
import products from '../data/platform.js';
// A duplicated, inaccessible logo set makes a seamless loop without duplicate announcements.
const logoSet = document.querySelector('.logo-set');
const logoClone = logoSet.cloneNode(true);
logoClone.setAttribute('aria-hidden', 'true');
logoClone.querySelectorAll('img').forEach((image) => {
  image.alt = '';
});
logoClone.querySelectorAll('a').forEach((link) => {
  link.tabIndex = -1;
});
document.querySelector('.logo-track').append(logoClone);
const logoWindow = document.querySelector('.logo-window');
const ribbonPause = document.querySelector('[data-ribbon-pause]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
ribbonPause.hidden = reducedMotion.matches;
reducedMotion.addEventListener('change', () => {
  ribbonPause.hidden = reducedMotion.matches;
});
ribbonPause.addEventListener('click', () => {
  const paused = ribbonPause.getAttribute('aria-pressed') !== 'true';
  updateMotionControl(ribbonPause, paused);
  document.querySelector('.logo-track').style.animationPlayState = paused ? 'paused' : '';
});
logoWindow.addEventListener('focusin', (event) => {
  const link = event.target.closest('a');
  if (!link?.matches(':focus-visible')) return;
  requestAnimationFrame(() => {
    if (document.activeElement !== link) return;
    const logo = link.getBoundingClientRect(),
      viewport = logoWindow.getBoundingClientRect();
    const shift =
      logo.right > viewport.right - 8
        ? logo.right - viewport.right + 8
        : logo.left < viewport.left + 8
          ? logo.left - viewport.left - 8
          : 0;
    logoWindow.scrollBy({ left: shift, behavior: 'instant' });
  });
});
logoWindow.addEventListener('focusout', (event) => {
  if (!logoWindow.contains(event.relatedTarget)) logoWindow.scrollLeft = 0;
});
document.querySelector('.brand img').addEventListener('error', (event) => {
  event.target.hidden = true;
  document.querySelector('.brand-fallback').style.display = 'inline';
});

/** Attach arrow-key, Home and End controls to a tab list. @returns {void} */
function keyboardTabs(selector, activate) {
  const buttons = [...document.querySelectorAll(selector)];
  buttons.forEach((button, index) =>
    button.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
        next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
        next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      activate(next);
      buttons[next].focus();
    }),
  );
}

/** Update the product overview in place, retaining the shared visual hierarchy. @returns {void} */
function selectProduct(index) {
  const product = products[index];
  document.querySelector('#product-category').textContent = product.category;
  document.querySelector('#product-title').textContent = product.title;
  document.querySelector('#product-description').textContent = product.description;
  document.querySelector('#product-chart-label').textContent = product.chart;
  document.querySelector('#product-panel').setAttribute('aria-labelledby', `product-tab-${index}`);
  document.querySelectorAll('[data-product]').forEach((button, i) => {
    button.setAttribute('aria-selected', String(i === index));
    button.tabIndex = i === index ? 0 : -1;
  });
  renderPlatformVisual(index);
}
document
  .querySelectorAll('[data-product]')
  .forEach((button) =>
    button.addEventListener('click', () => selectProduct(Number(button.dataset.product))),
  );
keyboardTabs('[data-product]', selectProduct);
selectProduct(0);

// Narrow screens: one card per module under a sticky, swipeable strip that follows the scroll.
const moduleStack = document.querySelector('[data-module-stack]');
if (moduleStack) {
  const strip = moduleStack.querySelector('[data-module-strip]');
  const links = [...moduleStack.querySelectorAll('[data-module-link]')];
  const modules = [...moduleStack.querySelectorAll('[data-module]')];
  const examples = modules.map((module) => module.querySelector('.platform-example'));
  examples.forEach(armMotion);
  let active = 0;
  let centreTimer = 0;
  // Tweened by hand: a native smooth scroll here would cancel the page's own smooth scroll.
  let centreFrame = 0;
  const centreStrip = (target, smooth) => {
    cancelAnimationFrame(centreFrame);
    const from = strip.scrollLeft;
    const to = Math.max(0, Math.min(target, strip.scrollWidth - strip.clientWidth));
    if (!smooth || reducedMotion.matches || Math.abs(to - from) < 1) {
      strip.scrollLeft = to;
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 320);
      strip.scrollLeft = from + (to - from) * (1 - (1 - t) ** 3);
      if (t < 1) centreFrame = requestAnimationFrame(step);
    };
    centreFrame = requestAnimationFrame(step);
  };
  const setActive = (index, smooth = true) => {
    if (index === active && links[index].hasAttribute('aria-current')) return;
    active = index;
    links.forEach((link, i) =>
      i === index
        ? link.setAttribute('aria-current', 'true')
        : link.removeAttribute('aria-current'),
    );
    // Let the selector node travel across the strip first, then bring the tab to the centre.
    clearTimeout(centreTimer);
    centreTimer = setTimeout(
      () => {
        const link = links[index];
        centreStrip(link.offsetLeft - (strip.clientWidth - link.offsetWidth) / 2, smooth);
      },
      smooth && !reducedMotion.matches ? 520 : 0,
    );
  };
  // The active card is the one with the largest share of its own height visible below the strip.
  let frame = 0;
  let held = false;
  let quietTimer = 0;
  let fallbackTimer = 0;
  const release = () => {
    held = false;
    clearTimeout(quietTimer);
    clearTimeout(fallbackTimer);
    spy();
  };
  const holdSpy = () => {
    held = true;
    clearTimeout(quietTimer);
    clearTimeout(fallbackTimer);
    quietTimer = setTimeout(release, 250);
    fallbackTimer = setTimeout(release, 2500);
  };
  const spy = () => {
    frame = 0;
    if (held || !moduleStack.offsetParent) return;
    const top = strip.getBoundingClientRect().bottom;
    let current = active;
    let best = 0;
    modules.forEach((module, i) => {
      const box = module.getBoundingClientRect();
      const visible = Math.min(box.bottom, innerHeight) - Math.max(box.top, top);
      const share = Math.max(0, visible) / box.height;
      if (share > best + 0.001) [best, current] = [share, i];
    });
    setActive(current);
  };
  addEventListener(
    'scroll',
    () => {
      if (held) {
        clearTimeout(quietTimer);
        quietTimer = setTimeout(release, 160);
      }
      frame ||= requestAnimationFrame(spy);
    },
    { passive: true },
  );
  addEventListener('resize', () => (frame ||= requestAnimationFrame(spy)), { passive: true });

  // Mouse users can drag the strip like a touch screen; a drag does not count as a click.
  let drag = null;
  strip.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') return;
    // Focusing a tab would make the browser jump the strip before the node can travel.
    event.preventDefault();
    cancelAnimationFrame(centreFrame);
    drag = { x: event.clientX, left: strip.scrollLeft, moved: false };
  });
  addEventListener('pointermove', (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    if (drag.moved) strip.scrollLeft = drag.left - dx;
  });
  addEventListener('pointerup', () => {
    if (drag?.moved) setTimeout(() => (drag = null));
    else drag = null;
  });

  links.forEach((link, index) =>
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (drag?.moved) return;
      setActive(index);
      // Hold the spy while the page scrolls past the cards in between; release once scrolling
      // has been quiet for a moment (or after a fallback), so it cannot pick a card on the way.
      holdSpy();
      modules[index].scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      armMotion(examples[index]);
    }),
  );
}

// Reserve each text row's largest height across all modules at the current width.
// This keeps the panel, chart, CTA and adjacent tab selector still during selection.
const productPanel = document.querySelector('#platform[data-product-border-orbit] #product-panel');
if (productPanel) {
  const fields = [
    ['#product-category', 'category'],
    ['#product-title', 'title'],
    ['#product-description', 'description'],
    ['#product-chart-label', 'chart'],
  ];
  let measuredWidth = 0;
  function sizeProductContent() {
    const width = productPanel.getBoundingClientRect().width;
    if (!width) return;
    measuredWidth = width;
    const sample = productPanel.cloneNode(true);
    const copies = fields.map(([selector]) => sample.querySelector(selector));
    sample.removeAttribute('id');
    sample.removeAttribute('tabindex');
    sample.removeAttribute('aria-labelledby');
    sample.removeAttribute('data-orbit-active');
    sample.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
    sample
      .querySelectorAll('.news-border-orbit, .use-case-border-light')
      .forEach((element) => element.remove());
    sample.setAttribute('aria-hidden', 'true');
    sample.inert = true;
    Object.assign(sample.style, {
      position: 'fixed',
      visibility: 'hidden',
      pointerEvents: 'none',
      left: '0',
      top: '0',
      width: `${width}px`,
    });
    copies.forEach((element) => {
      element.style.minHeight = '0';
    });
    productPanel.parentElement.append(sample);
    const heights = fields.map(() => 0);
    products.forEach((product) => {
      copies.forEach((element, index) => {
        element.textContent = product[fields[index][1]];
      });
      copies.forEach((element, index) => {
        heights[index] = Math.max(heights[index], element.getBoundingClientRect().height);
      });
    });
    sample.remove();
    fields.forEach(([selector], index) => {
      productPanel.querySelector(selector).style.minHeight = `${Math.ceil(heights[index])}px`;
    });
  }
  sizeProductContent();
  new ResizeObserver(() => {
    if (Math.abs(productPanel.getBoundingClientRect().width - measuredWidth) > 0.1)
      sizeProductContent();
  }).observe(productPanel, { box: 'border-box' });
  document.fonts.ready.then(sizeProductContent);
  document.fonts.addEventListener('loadingdone', sizeProductContent);
}

// Load the map library and coastline only as the fleet section approaches the viewport.
const fleet = document.querySelector('#fleet-globe');
const observer = new IntersectionObserver(
  async ([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    try {
      const { mountGlobe } = await import('./globe.js');
      const cleanup = await mountGlobe(fleet);
      window.addEventListener('pagehide', cleanup, { once: true });
    } catch (error) {
      console.error(error);
      const label = document.querySelector('#globe-location');
      if (label) label.textContent = 'Fleet map unavailable · contact us to explore the fleet';
    }
  },
  { rootMargin: '500px' },
);
if (fleet) observer.observe(fleet);
