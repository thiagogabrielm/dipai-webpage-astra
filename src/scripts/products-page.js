const explorer = document.querySelector('.products-explorer');
const pin = explorer.querySelector('.products-pin');
const panels = [...explorer.querySelectorAll('.module-panel')];
const links = [...explorer.querySelectorAll('.module-nav-link')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 900px)');
let current = -1,
  step = 600,
  top = 82,
  pinned = false,
  frame = 0;

function select(index) {
  if (index === current) return;
  current = index;
  panels.forEach((panel, i) => {
    const selected = i === index;
    panel.classList.toggle('is-active', selected);
    panel.inert = pinned && !selected;
    if (pinned) panel.setAttribute('aria-hidden', String(!selected));
    else panel.removeAttribute('aria-hidden');
    if (selected) links[i].setAttribute('aria-current', 'true');
    else links[i].removeAttribute('aria-current');
  });
  // Keep the current entry visible inside a short sidebar without scrolling the page.
  const nav = links[index].parentElement;
  if (pinned && nav.clientHeight) {
    const link = links[index];
    if (link.offsetTop < nav.scrollTop) nav.scrollTop = link.offsetTop;
    else if (link.offsetTop + link.offsetHeight > nav.scrollTop + nav.clientHeight)
      nav.scrollTop = link.offsetTop + link.offsetHeight - nav.clientHeight;
  }
}
function update() {
  frame = 0;
  if (pinned) {
    const distance = top - explorer.getBoundingClientRect().top;
    select(Math.max(0, Math.min(panels.length - 1, Math.floor((distance + 1) / step))));
  } else {
    let next = 0;
    panels.forEach((panel, i) => {
      if (panel.getBoundingClientRect().top <= top + innerHeight * 0.3) next = i;
    });
    select(next);
  }
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
}
function measure() {
  const wasPinned = pinned;
  const canPin = !compact.matches && !reduced.matches;
  explorer.classList.toggle('products-scroll-ready', canPin);
  top = parseFloat(getComputedStyle(explorer).getPropertyValue('--explorer-top'));
  const padding = parseFloat(getComputedStyle(pin).paddingTop) * 2;
  const panelGroup = explorer.querySelector('.module-panels');
  const contentHeight = panelGroup.getBoundingClientRect().height;
  const flowGap = parseFloat(getComputedStyle(panelGroup).getPropertyValue('--module-flow-gap'));
  const availableHeight = innerHeight - top;
  // Use the tallest module at this width so two complete modules, their gap
  // and the section padding fit before choosing continuous desktop scrolling.
  const fitsTwoModules = canPin && contentHeight * 2 + flowGap + padding <= availableHeight;
  // Compact, short and spacious desktop layouts all use normal document flow.
  pinned = canPin && !fitsTwoModules && contentHeight + padding <= availableHeight;
  explorer.classList.toggle('products-scroll-ready', pinned);
  step = Math.round(Math.max(440, Math.min(760, innerHeight * 0.78)));
  explorer.style.height = pinned ? `${innerHeight - top + step * (panels.length - 1)}px` : '';
  if (wasPinned !== pinned) current = -1;
  update();
}
function goTo(index, changeHash = false) {
  if (changeHash) history.pushState(null, '', `#${panels[index].id}`);
  const y = pinned
    ? scrollY + explorer.getBoundingClientRect().top - top + index * step + 2
    : scrollY + panels[index].getBoundingClientRect().top - top - 24;
  const smooth = changeHash && !pinned && !reduced.matches;
  window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'instant' });
  // During animated navigation, the scroll handler highlights the module in view.
  if (!smooth) select(index);
}
function followHash() {
  const index = panels.findIndex((panel) => `#${panel.id}` === location.hash);
  if (index >= 0) goTo(index);
}
links.forEach((link, index) =>
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    goTo(index, true);
  }),
);
explorer.querySelector('.module-sidebar').addEventListener('keydown', (event) => {
  const index = links.indexOf(document.activeElement);
  if (index < 0) return;
  let next;
  if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = links.length - 1;
  else if (event.key === 'ArrowDown') next = (index + 1) % links.length;
  else if (event.key === 'ArrowUp') next = (index - 1 + links.length) % links.length;
  else return;
  event.preventDefault();
  links[next].focus({ preventScroll: true });
  goTo(next, true);
});
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', measure);
window.addEventListener('hashchange', followHash);
// Native fragment restoration can run after scripts; resolve it against the
// final pinned layout once the page and its images have finished loading.
window.addEventListener('load', () =>
  requestAnimationFrame(() => {
    measure();
    followHash();
  }),
);
reduced.addEventListener('change', measure);
measure();
followHash();
document.fonts.ready.then(() => {
  measure();
  followHash();
});
