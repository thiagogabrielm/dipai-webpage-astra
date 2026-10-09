// Reveal the globe between the two foreground sections without scaling its content.
const fleet = document.querySelector('#fleet');
const quotes = document.querySelector('#testimonials-focus');
const stories = document.querySelector('#stories');
if (fleet && quotes && stories && fleet.nextElementSibling === stories) {
  const main = fleet.parentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const counters = [...fleet.querySelectorAll('.fleet-numbers strong')].map((element) => ({
    number: [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE),
    target: parseInt(element.textContent, 10),
    suffix: element.querySelector('span'),
  }));
  function updateCounters(progress) {
    for (const { number, target, suffix } of counters) {
      if (!number || !Number.isFinite(target)) continue;
      const value = String(Math.floor(target * progress));
      if (number.textContent !== value) number.textContent = value;
      // Preserve the suffix's space so the neighbouring count does not jump.
      if (suffix) suffix.style.visibility = progress === 1 ? 'visible' : 'hidden';
    }
  }
  let frame = 0;
  let lastHidden = -1;
  let height = 0;
  let overlap = 0;

  function render() {
    frame = 0;
    if (reducedMotion.matches) {
      updateCounters(1);
      main.classList.remove('fleet-scroll-reveal');
      fleet.inert = false;
      lastHidden = -1;
      return;
    }
    // The quotes edge is upstream of the reveal: its document position never
    // depends on our changing overlap, avoiding scroll/layout feedback loops.
    const edge = quotes.getBoundingClientRect().bottom;
    const start = innerHeight * 0.84;
    const end = Math.max(100, innerHeight * 0.14);
    const progress = Math.max(0, Math.min(1, (start - edge) / (start - end)));
    updateCounters(progress);
    const eased = progress * progress * (3 - 2 * progress);
    const hidden = Math.max(0, height - overlap * 2) * (1 - eased);
    main.classList.add('fleet-scroll-reveal');
    if (Math.abs(hidden - lastHidden) > 0.05) {
      main.style.setProperty('--fleet-hidden', `${hidden.toFixed(3)}px`);
      lastHidden = hidden;
    }
    // Only disable the fully closed section. The clip-path and foreground
    // sections already prevent pointer interaction with concealed content.
    fleet.inert = progress === 0;
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  function measure() {
    height = fleet.offsetHeight;
    overlap = -parseFloat(getComputedStyle(fleet).marginTop) || 0;
    schedule();
  }
  function alignGlobeAnchor() {
    if (location.hash !== '#fleet' || reducedMotion.matches) return;
    // Native anchor scrolling can happen before fonts/carousels settle. Use the
    // stable quotes edge to land past the reveal, rather than at a clipped globe.
    requestAnimationFrame(() => {
      const end = Math.max(100, innerHeight * 0.14);
      scrollTo({
        top: quotes.getBoundingClientRect().bottom + scrollY - end + 1,
        behavior: 'instant',
      });
      schedule();
    });
  }
  const observer = new ResizeObserver(measure);
  observer.observe(fleet);
  observer.observe(quotes);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  addEventListener('hashchange', alignGlobeAnchor);
  reducedMotion.addEventListener('change', measure);
  document.fonts.ready.then(measure);
  const loaded =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => addEventListener('load', resolve, { once: true }));
  Promise.all([document.fonts.ready, loaded]).then(alignGlobeAnchor);
  measure();
}
