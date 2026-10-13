// The node leads; its moving trail decays, then light spreads along the new edge.
// Vertical tab lists light their outer side edge; horizontal strips light the bottom edge.
let selectorCount = 0;
// `layer` holds the drawing; for a scrolling strip it is a non-scrolling parent, so the node
// travels across the screen while the strip re-centres, and the marker tracks the moving tab.
function createTabSelector(
  tablist,
  { tabs, selected, attribute, horizontal = false, layer = tablist },
) {
  const uid = selectorCount++;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const create = (tag, attrs = {}) => {
    const element = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    return element;
  };
  const svg = create('svg', {
    class: 'product-tab-selector',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  const defs = create('defs');
  const gradient = create('linearGradient', {
    id: `product-selector-light-${uid}`,
    gradientUnits: 'userSpaceOnUse',
  });
  for (const [offset, opacity] of [
    ['0%', 0],
    ['25%', 1],
    ['75%', 1],
    ['100%', 0],
  ]) {
    gradient.append(
      create('stop', { offset, style: 'stop-color: var(--yellow)', 'stop-opacity': opacity }),
    );
  }
  defs.append(gradient);
  const beamPath = create('path', {
    class: 'product-selector-beam',
    fill: 'none',
    stroke: `url(#product-selector-light-${uid})`,
    'stroke-width': 2,
  });
  // One stroke avoids the bright seams between overlapping round-capped pieces.
  const trailGradient = create('linearGradient', {
    id: `product-selector-trail-${uid}`,
    gradientUnits: 'userSpaceOnUse',
  });
  const trailStops = Array.from({ length: 17 }, (_, index) =>
    create('stop', {
      offset: index / 16,
      style: 'stop-color: var(--yellow)',
      'stop-opacity': 0,
    }),
  );
  trailGradient.append(...trailStops);
  defs.append(trailGradient);
  const trailPath = create('path', {
    class: 'product-selector-trail',
    fill: 'none',
    stroke: `url(#product-selector-trail-${uid})`,
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  const node = create('circle', {
    class: 'product-selector-node',
    r: 4,
    style: 'fill: var(--yellow)',
  });
  svg.append(defs, beamPath, trailPath, node);
  layer.append(svg);
  const setPhase = (phase) => {
    tablist.dataset.selectorPhase = phase;
    layer.dataset.selectorPhase = phase;
  };

  const trailLifetime = 320;
  const spreadDuration = 380;
  const ease = (value) => 1 - (1 - value) ** 3;
  let current = null,
    destination = null,
    motion = null,
    frame = 0;
  let history = [];
  let beam = { x: 0, y: 0, half: 0, opacity: 1 };

  // Follow the selected tab's outside outline, including its outer corners.
  // The growing beam reveals this curve from the node instead of drawing a
  // straight line through the rounded area outside the tab.
  function edgePath(light) {
    if (horizontal) return `M ${light.x - light.half} ${light.y} H ${light.x + light.half}`;
    const top = light.y - light.height / 2;
    const bottom = light.y + light.height / 2;
    const start = light.y - light.half;
    const end = light.y + light.half;
    const upper = light.topRadius || 0;
    const lower = light.bottomRadius || 0;
    const direction = light.direction || 1;
    const sweep = direction === 1 ? 0 : 1;
    const cornerX = (radius, delta) =>
      light.x + direction * (radius - Math.sqrt(Math.max(0, radius * radius - delta * delta)));
    const startX = upper && start < top + upper ? cornerX(upper, top + upper - start) : light.x;
    let path = `M ${startX} ${start}`;
    if (upper && start < top + upper)
      path += ` A ${upper} ${upper} 0 0 ${sweep} ${light.x} ${top + upper}`;
    path += ` V ${Math.min(end, bottom - lower)}`;
    if (lower && end > bottom - lower) {
      path += ` A ${lower} ${lower} 0 0 ${sweep} ${cornerX(lower, end - (bottom - lower))} ${end}`;
    }
    return path;
  }

  function paint(now) {
    node.setAttribute('cx', current.x);
    node.setAttribute('cy', current.y);
    beamPath.setAttribute('d', edgePath(beam));
    beamPath.setAttribute('opacity', beam.opacity);
    const along = horizontal
      ? [beam.x - beam.half, beam.y, beam.x + beam.half, beam.y]
      : [beam.x, beam.y - beam.half, beam.x, beam.y + beam.half];
    ['x1', 'y1', 'x2', 'y2'].forEach((key, index) => gradient.setAttribute(key, along[index]));
    const cutoff = now - trailLifetime;
    // Retain one sample before the cutoff and interpolate the tail, rather than
    // dropping a whole frame's distance at a time as the trail expires.
    while (history.length > 1 && history[1].time <= cutoff) history.shift();
    const points = history.map((point) => ({ ...point }));
    if (points.length > 1 && points[0].time < cutoff) {
      const [a, b] = points;
      const t = (cutoff - a.time) / (b.time - a.time);
      points[0] = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, time: cutoff };
    }
    const tail = points[0],
      head = points.at(-1);
    if (points.length < 2 || head.time <= cutoff) {
      trailPath.setAttribute('d', '');
      return;
    }
    trailPath.setAttribute(
      'd',
      points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' '),
    );
    trailGradient.setAttribute('x1', tail.x);
    trailGradient.setAttribute('y1', tail.y);
    trailGradient.setAttribute('x2', head.x);
    trailGradient.setAttribute('y2', head.y);
    trailStops.forEach((stop, index) => {
      const t = index / (trailStops.length - 1);
      const time = tail.time + (head.time - tail.time) * t;
      const remaining = Math.max(0, Math.min(1, 1 - (now - time) / trailLifetime));
      stop.setAttribute('stop-opacity', 0.85 * remaining ** 1.5);
    });
  }

  function tick(now) {
    frame = 0;
    if (!motion) return;
    // A strip may still be scrolling its new tab into place; aim at where it is now.
    if (layer !== tablist) destination = measure() || destination;
    const elapsed = now - motion.start;
    if (elapsed < motion.duration) {
      const t = ease(elapsed / motion.duration);
      current = {
        x: motion.from.x + (destination.x - motion.from.x) * t,
        y: motion.from.y + (destination.y - motion.from.y) * t,
      };
      // Old edge light fades in place; it never travels as a rigid bar.
      beam = {
        ...motion.oldBeam,
        opacity: motion.oldBeam.opacity * Math.max(0, 1 - elapsed / 120),
      };
      history.push({ ...current, time: now });
      setPhase('moving');
    } else {
      const arrival = motion.start + motion.duration;
      if (!motion.arrived) {
        history.push({ x: destination.x, y: destination.y, time: arrival });
        motion.arrived = true;
      }
      current = { x: destination.x, y: destination.y };
      const spread = Math.min(1, (now - arrival) / spreadDuration);
      beam = { ...destination, half: (destination.length / 2) * ease(spread), opacity: 1 };
      setPhase(spread < 1 ? 'spreading' : 'idle');
      if (spread === 1 && now - arrival >= trailLifetime) motion = null;
    }
    paint(now);
    if (motion) frame = requestAnimationFrame(tick);
  }

  function measure() {
    const active = tabs.find(selected);
    if (!active) return null;
    const parent = layer.getBoundingClientRect();
    const bounds = active.getBoundingClientRect();
    const left = bounds.left - parent.left + layer.scrollLeft;
    const top = bounds.top - parent.top + layer.scrollTop;
    if (horizontal)
      return { x: left + bounds.width / 2, y: top + bounds.height, length: bounds.width };
    const style = getComputedStyle(active);
    const radius = (value) => Math.min(parseFloat(value) || 0, bounds.height / 2, bounds.width / 2);
    const rightEdge = left > parent.width / 4;
    return {
      x: rightEdge ? left + bounds.width : left,
      y: top + bounds.height / 2,
      height: bounds.height,
      length: bounds.height,
      direction: rightEdge ? -1 : 1,
      topRadius: radius(rightEdge ? style.borderTopRightRadius : style.borderTopLeftRadius),
      bottomRadius: radius(
        rightEdge ? style.borderBottomRightRadius : style.borderBottomLeftRadius,
      ),
    };
  }

  function position(animate = true) {
    const next = measure();
    if (!next) return;
    const parent = layer.getBoundingClientRect();
    const width = Math.max(parent.width, layer.scrollWidth);
    const height = Math.max(parent.height, layer.scrollHeight);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    if (
      animate &&
      destination &&
      Object.keys(next).every((key) => Math.abs(next[key] - destination[key]) < 0.1)
    )
      return;
    cancelAnimationFrame(frame);
    frame = 0;
    destination = next;
    const now = performance.now();
    if (!animate || !current || reducedMotion.matches || document.hidden) {
      motion = null;
      history = [];
      current = { x: next.x, y: next.y };
      beam = { ...next, half: next.length / 2, opacity: 1 };
      setPhase('idle');
      paint(now);
      return;
    }
    const distance = Math.hypot(next.x - current.x, next.y - current.y);
    motion = {
      from: { ...current },
      oldBeam: { ...beam },
      start: now,
      duration: Math.min(460, Math.max(300, distance * 1.3)),
      arrived: false,
    };
    history.push({ ...current, time: now });
    setPhase('moving');
    frame = requestAnimationFrame(tick);
  }

  position(false);
  tablist.setAttribute('data-moving-selector', '');
  new MutationObserver(() => position()).observe(tablist, {
    subtree: true,
    attributes: true,
    attributeFilter: [attribute],
  });
  if (layer !== tablist)
    tablist.addEventListener('scroll', () => motion || position(false), { passive: true });
  const resize = new ResizeObserver(() => position(false));
  resize.observe(tablist);
  tabs.forEach((tab) => resize.observe(tab));
  reducedMotion.addEventListener('change', () => position(false));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) position(false);
  });
}

const productTabs = document.querySelector('#platform .product-tabs');
if (productTabs) {
  createTabSelector(productTabs, {
    tabs: [...productTabs.querySelectorAll('[role="tab"]')],
    selected: (tab) => tab.getAttribute('aria-selected') === 'true',
    attribute: 'aria-selected',
  });
}
const moduleStrip = document.querySelector('[data-module-strip]');
if (moduleStrip) {
  createTabSelector(moduleStrip, {
    tabs: [...moduleStrip.querySelectorAll('[data-module-link]')],
    selected: (tab) => tab.getAttribute('aria-current') === 'true',
    attribute: 'aria-current',
    horizontal: true,
  });
}
