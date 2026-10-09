let sequence = 0;
export function mountCarouselMarker(container, buttons) {
  const ns = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const create = (tag, attributes = {}) => {
    const element = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    return element;
  };
  const id = `carousel-node-light-${++sequence}`;
  const svg = create('svg', {
    class: 'carousel-marker',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  const defs = create('defs');
  const gradient = create('linearGradient', { id, gradientUnits: 'userSpaceOnUse' });
  const peak = create('stop', { offset: 0.5, 'stop-color': '#ffd600' });
  gradient.append(
    create('stop', { offset: 0, 'stop-color': '#ffd600', 'stop-opacity': 0 }),
    peak,
    create('stop', { offset: 1, 'stop-color': '#ffd600', 'stop-opacity': 0 }),
  );
  defs.append(gradient);
  // Cut the dot interiors out of every connecting stroke, but not the moving node.
  const mask = create('mask', {
    id: `${id}-gaps`,
    maskUnits: 'userSpaceOnUse',
    'mask-type': 'luminance',
  });
  const maskArea = create('rect', { fill: 'white' });
  const holes = buttons.map(() => create('circle', { r: 4, fill: 'black' }));
  mask.append(maskArea, ...holes);
  defs.append(mask);
  const baseline = create('path', {
    fill: 'none',
    stroke: '#34475e',
    'stroke-opacity': 0.19,
    'stroke-width': 1,
  });
  const light = create('path', {
    class: 'carousel-marker-light',
    fill: 'none',
    stroke: `url(#${id})`,
    'stroke-width': 2,
  });
  const trace = create('g', {
    class: 'carousel-marker-trail',
    fill: 'none',
    stroke: '#ffd600',
    'stroke-width': 2,
    'stroke-linecap': 'round',
  });
  const paths = Array.from({ length: 64 }, () => create('path', { opacity: 0 }));
  trace.append(...paths);
  const node = create('circle', { class: 'carousel-marker-node', r: 5, fill: '#ffd600' });
  const lines = create('g', { mask: `url(#${id}-gaps)` });
  lines.append(baseline, light, trace);
  svg.append(defs, lines, node);
  container.append(svg);
  container.classList.add('has-energy-marker');
  let selected = 0,
    target = null,
    current = null,
    beam = null,
    motion = null,
    frame = 0,
    history = [];
  const ease = (value) => 1 - (1 - value) ** 3;

  function draw(now) {
    node.setAttribute('cx', current.x);
    node.setAttribute('cy', current.y);
    const left = beam.x + (beam.left - beam.x) * beam.spread;
    const right = beam.x + (beam.right - beam.x) * beam.spread;
    light.setAttribute('d', `M ${left} ${beam.y} H ${right}`);
    light.setAttribute('opacity', beam.opacity);
    gradient.setAttribute('x1', left);
    gradient.setAttribute('x2', right);
    gradient.setAttribute('y1', beam.y);
    gradient.setAttribute('y2', beam.y);
    peak.setAttribute('offset', right > left ? (beam.x - left) / (right - left) : 0.5);
    history = history.filter((point) => now - point.time < 320);
    paths.forEach((path, i) => {
      const a = history[i],
        b = history[i + 1];
      if (!a || !b) {
        path.setAttribute('opacity', 0);
        return;
      }
      path.setAttribute('d', `M ${a.x} ${a.y} L ${b.x} ${b.y}`);
      path.setAttribute('opacity', 0.85 * (1 - Math.min(1, (now - a.time) / 320)) ** 1.5);
    });
  }
  function tick(now) {
    frame = 0;
    if (!motion) return;
    const elapsed = now - motion.start;
    if (elapsed < 340) {
      const t = ease(elapsed / 340);
      current = { x: motion.from.x + (target.x - motion.from.x) * t, y: target.y };
      beam = {
        ...motion.oldBeam,
        opacity: motion.oldBeam.opacity * Math.max(0, 1 - elapsed / 120),
      };
      history.push({ ...current, time: now });
      if (history.length > paths.length + 1) history.shift();
      container.dataset.markerPhase = 'moving';
    } else {
      if (!motion.arrived) {
        current = { x: target.x, y: target.y };
        history.push({ ...current, time: motion.start + 340 });
        motion.arrived = true;
      }
      const spread = Math.min(1, (elapsed - 340) / 380);
      beam = { ...target, spread: ease(spread), opacity: 1 };
      container.dataset.markerPhase = spread < 1 ? 'spreading' : 'idle';
      if (spread === 1) motion = null;
    }
    draw(now);
    if (motion) frame = requestAnimationFrame(tick);
  }
  function position(animate) {
    const bounds = container.getBoundingClientRect();
    cancelAnimationFrame(frame);
    frame = 0;
    if (!bounds.width) {
      motion = null;
      target = null;
      return;
    }
    const centers = buttons.map((button) => {
      const r = button.getBoundingClientRect();
      return { x: r.left - bounds.left + r.width / 2, y: r.top - bounds.top + r.height / 2 };
    });
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    for (const element of [mask, maskArea]) {
      element.setAttribute('x', 0);
      element.setAttribute('y', 0);
      element.setAttribute('width', bounds.width);
      element.setAttribute('height', bounds.height);
    }
    holes.forEach((hole, i) => {
      hole.setAttribute('cx', centers[i].x);
      hole.setAttribute('cy', centers[i].y);
    });
    baseline.setAttribute('d', `M ${centers[0].x} ${centers[0].y} H ${centers.at(-1).x}`);
    const next = { ...centers[selected], left: centers[0].x, right: centers.at(-1).x };
    target = next;
    const now = performance.now();
    if (!animate || !current || reduced.matches || document.hidden) {
      motion = null;
      history = [];
      current = { x: next.x, y: next.y };
      beam = { ...next, spread: 1, opacity: 1 };
      container.dataset.markerPhase = 'idle';
      draw(now);
    } else {
      motion = { from: { ...current }, oldBeam: { ...beam }, start: now, arrived: false };
      history.push({ ...current, time: now });
      container.dataset.markerPhase = 'moving';
      frame = requestAnimationFrame(tick);
    }
  }
  new ResizeObserver(() => position(false)).observe(container);
  reduced.addEventListener('change', () => position(false));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) position(false);
  });
  return {
    select(index, animate = true) {
      if (index === selected && target) return;
      selected = index;
      position(animate);
    },
  };
}
