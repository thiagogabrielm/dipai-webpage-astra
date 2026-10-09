import { renderPlatformVisual } from './platform-visuals.js';
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

// Reserve each text row's largest height across all modules at the current width.
// This keeps the panel, chart, CTA and adjacent tab selector still during selection.
const productPanel = document.querySelector('#platform[data-product-border-orbit] .product-panel');
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
