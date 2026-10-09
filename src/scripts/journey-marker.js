// Scroll progress positions the node within a chapter. Chapter clicks animate travel.
export function mountJourneyMarker(nav, buttons) {
  const ns = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const el = (tag, attrs = {}) => {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  };
  const svg = el('svg', { class: 'journey-marker', 'aria-hidden': 'true', focusable: 'false' });
  const defs = el('defs');
  const gradient = el('linearGradient', {
    id: 'journey-marker-light',
    gradientUnits: 'userSpaceOnUse',
  });
  const stops = [
    el('stop', { offset: 0, style: 'stop-color: var(--yellow)', 'stop-opacity': 1 }),
    el('stop', { offset: 1, style: 'stop-color: var(--yellow)', 'stop-opacity': 0 }),
  ];
  gradient.append(...stops);
  const clip = el('clipPath', { id: 'journey-marker-bounds', clipPathUnits: 'userSpaceOnUse' });
  const bounds = el('rect');
  clip.append(bounds);
  defs.append(gradient, clip);
  const completed = el('path', {
    class: 'journey-marker-completed',
    fill: 'none',
    style: 'stroke: var(--yellow)',
    'stroke-width': 2,
    opacity: 1,
  });
  const light = el('path', {
    class: 'journey-marker-light',
    fill: 'none',
    stroke: 'url(#journey-marker-light)',
    'stroke-width': 2,
    'clip-path': 'url(#journey-marker-bounds)',
  });
  const trailGroup = el('g', {
    class: 'journey-marker-trail',
    fill: 'none',
    style: 'stroke: var(--yellow)',
    'stroke-width': 2,
    'stroke-linecap': 'round',
  });
  const trails = Array.from({ length: 64 }, () => el('path', { opacity: 0 }));
  trailGroup.append(...trails);
  const dot = el('circle', { class: 'journey-marker-node', r: 4, style: 'fill: var(--yellow)' });
  svg.append(defs, completed, light, trailGroup, dot);
  nav.append(svg);
  nav.setAttribute('data-progress-marker', '');

  const ease = (t) => 1 - (1 - t) ** 3;
  const lifetime = 320,
    spreadDuration = 380;
  const forwardLightFraction = 0.3;
  let index = 0,
    progress = 0,
    current = null,
    destination = null;
  let beam = null,
    motion = null,
    history = [],
    frame = 0;
  let edges = [];

  function geometry() {
    const parent = nav.getBoundingClientRect(),
      tab = buttons[index].getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${parent.width || 1} ${parent.height || 1}`);
    svg.style.width = `${parent.width}px`;
    svg.style.height = `${parent.height}px`;
    edges = buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return {
        left: rect.left - parent.left,
        right: rect.right - parent.left,
        y: rect.top - parent.top + 0.5,
      };
    });
    const left = tab.left - parent.left,
      right = tab.right - parent.left;
    const margin = Math.min(4, tab.width / 2);
    return {
      x: left + margin + progress * Math.max(0, tab.width - margin * 2),
      y: tab.top - parent.top + 0.5,
      left,
      right,
    };
  }
  function paint(now) {
    dot.setAttribute('cx', current.x);
    dot.setAttribute('cy', current.y);
    // Completed portions stay fully lit, with gaps preserved between chapters.
    // Following the moving node also makes backwards navigation erase progress.
    completed.setAttribute(
      'd',
      edges
        .filter((edge) => current.x > edge.left)
        .map((edge) => `M ${edge.left} ${edge.y} H ${Math.min(current.x, edge.right)}`)
        .join(' '),
    );
    const left = beam.x;
    // Fade over 30% of this chapter's width, independent of scroll position.
    // Clip at the boundary without compressing the gradient near the end.
    const right = beam.x + (beam.right - beam.left) * forwardLightFraction * beam.spread;
    light.setAttribute('d', `M ${left} ${beam.y} H ${right}`);
    light.setAttribute('opacity', beam.opacity);
    gradient.setAttribute('x1', left);
    gradient.setAttribute('x2', right);
    gradient.setAttribute('y1', beam.y);
    gradient.setAttribute('y2', beam.y);
    // Keep steady/spreading light inside this chapter even at 0% and 100%.
    bounds.setAttribute('x', beam.left);
    bounds.setAttribute('y', beam.y - 2);
    bounds.setAttribute('width', Math.max(0, beam.right - beam.left));
    bounds.setAttribute('height', 4);
    history = history.filter((point) => now - point.time < lifetime);
    trails.forEach((path, i) => {
      const a = history[i],
        b = history[i + 1];
      if (!a || !b) {
        path.setAttribute('opacity', 0);
        return;
      }
      path.setAttribute('d', `M ${a.x} ${a.y} L ${b.x} ${b.y}`);
      path.setAttribute('opacity', 0.85 * (1 - Math.min(1, (now - a.time) / lifetime)) ** 1.5);
    });
  }
  function tick(now) {
    frame = 0;
    if (!motion) return;
    const elapsed = now - motion.start;
    if (elapsed < motion.duration) {
      const t = ease(elapsed / motion.duration);
      current = {
        x: motion.from.x + (destination.x - motion.from.x) * t,
        y: motion.from.y + (destination.y - motion.from.y) * t,
      };
      beam = {
        ...motion.oldBeam,
        opacity: motion.oldBeam.opacity * Math.max(0, 1 - elapsed / 120),
      };
      history.push({ ...current, time: now });
      if (history.length > trails.length + 1) history.shift();
      nav.dataset.markerPhase = 'moving';
    } else {
      const arrival = motion.start + motion.duration;
      if (!motion.arrived) {
        current = { x: destination.x, y: destination.y };
        history.push({ ...current, time: arrival });
        motion.arrived = true;
      }
      const spread = Math.min(1, (now - arrival) / spreadDuration);
      beam = { ...destination, spread: ease(spread), opacity: 1 };
      nav.dataset.markerPhase = spread < 1 ? 'spreading' : 'idle';
      if (spread === 1 && now - arrival >= lifetime) motion = null;
    }
    paint(now);
    if (motion) frame = requestAnimationFrame(tick);
  }
  function place(animate = false) {
    const next = geometry();
    if (
      destination &&
      Object.keys(next).every((key) => Math.abs(next[key] - destination[key]) < 0.1)
    )
      return;
    cancelAnimationFrame(frame);
    frame = 0;
    destination = next;
    const now = performance.now();
    if (!animate || !current || reduced.matches || document.hidden) {
      motion = null;
      history = [];
      current = { x: next.x, y: next.y };
      beam = { ...next, spread: 1, opacity: 1 };
      nav.dataset.markerPhase = 'idle';
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
    nav.dataset.markerPhase = 'moving';
    frame = requestAnimationFrame(tick);
  }
  function realign() {
    destination = null;
    place(false);
  }
  const resize = new ResizeObserver(realign);
  resize.observe(nav);
  buttons.forEach((button) => resize.observe(button));
  reduced.addEventListener('change', realign);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) realign();
  });
  place(false);
  return {
    update(nextIndex, localProgress, animate = false) {
      index = nextIndex;
      progress = Math.max(0, Math.min(1, localProgress));
      place(animate);
    },
  };
}
