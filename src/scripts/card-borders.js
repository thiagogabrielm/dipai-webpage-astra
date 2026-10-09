// Shared hover border: top-center node, with both tails ending bottom-right.
// data-border-anchor="pointer" retains the earlier proximity experiment.
const ns = 'http://www.w3.org/2000/svg';
const segmentsPerSide = 48;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const svgElement = (tag, attributes) => {
  const element = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
};

const selector =
  '.case-card, .news-card, .news-featured, .quote-card, .team-frame, .vessel-kpi, .node-frame';
const initialized = new WeakSet();
let nextMaskId = 0;
const seamOverlap = 0.75;
function initializeProximity(card) {
  // Platform content panels retain their resting frame, without hover lighting.
  if (card.matches('.product-panel, .module-panel')) return;
  if (initialized.has(card)) return;
  initialized.add(card);
  const fixedAnchor = card.matches('.vessel-kpi');
  const followsPointer = !fixedAnchor && card.dataset.borderAnchor === 'pointer';
  const totalTrailFraction = fixedAnchor ? 0.9 : 1;
  const narrowHero = fixedAnchor ? matchMedia('(max-width: 900px)') : null;
  if (fixedAnchor) card.setAttribute('data-border-static', '');
  // Carousel copies need their own event handlers, not an inherited static SVG.
  card
    .querySelectorAll('.use-case-border-light, .news-border-orbit, .quote-corner-highlight')
    .forEach((element) => element.remove());
  card.removeAttribute('data-border-active');
  card.removeAttribute('data-orbit-active');
  card.removeAttribute('data-corner');
  card.setAttribute('data-proximity-card', '');
  const svg = svgElement('svg', {
    class: 'use-case-border-light',
    'aria-hidden': 'true',
    focusable: 'false',
    preserveAspectRatio: 'none',
  });
  // Paint the yellow outline once. Overlapping opaque luminance-mask pieces
  // avoid both hairline gaps and doubled alpha at the joins of a long border.
  const maskId = `proximity-trail-${++nextMaskId}`;
  const defs = svgElement('defs', {});
  const mask = svgElement('mask', {
    id: maskId,
    maskUnits: 'userSpaceOnUse',
    maskContentUnits: 'userSpaceOnUse',
    x: -4,
    y: -4,
    'mask-type': 'luminance',
    'color-interpolation': 'sRGB',
  });
  defs.append(mask);
  svg.append(defs);
  const outline = svgElement('path', {
    fill: 'none',
    style: 'stroke: var(--yellow)',
    'stroke-width': 2.5,
    mask: `url(#${maskId})`,
  });
  svg.append(outline);
  const trails = [-1, 1].flatMap((direction) =>
    Array.from({ length: segmentsPerSide }, (_, index) => {
      const distance =
        !fixedAnchor && !followsPointer
          ? index / (segmentsPerSide - 1)
          : (index + 0.5) / segmentsPerSide;
      // Hold the first half of each tail, then fade to zero at its endpoint.
      // Preserve the independent hero and optional pointer-following treatments.
      const fade = fixedAnchor ? distance : Math.max(0, (distance - 0.5) / 0.5);
      const luminance = Math.round(255 * Math.pow(1 - fade, 1.3));
      const path = svgElement('path', {
        fill: 'none',
        stroke: `rgb(${luminance}, ${luminance}, ${luminance})`,
        'stroke-width': 6,
        'stroke-linecap': 'butt',
      });
      mask.append(path);
      return { path, direction, index };
    }),
  );
  const node = svgElement('circle', { r: 4, style: 'fill: var(--yellow)' });
  svg.append(node);
  card.append(svg);

  let parts = [];
  let perimeter = 0;
  let bottomRightPosition = 0;
  let pointer = null;
  let frame = 0;
  let width = 0,
    height = 0;

  function geometry() {
    const style = getComputedStyle(card);
    // Use layout dimensions so the border follows the card throughout reveals.
    width = parseFloat(style.width) || card.offsetWidth;
    height = parseFloat(style.height) || card.offsetHeight;
    // Filtered and inactive cards can have no layout box until they are shown.
    if (!card.getClientRects().length || width <= 0 || height <= 0) {
      parts = [];
      clear();
      return;
    }
    const border = parseFloat(style.borderLeftWidth) || 0;
    const inset = border / 2;
    const left = inset,
      top = inset;
    const right = width - inset,
      bottom = height - inset;
    const radius = (value) =>
      Math.min(
        Math.max(0, (parseFloat(value) || 0) - inset),
        (right - left) / 2,
        (bottom - top) / 2,
      );
    const tl = radius(style.borderTopLeftRadius),
      tr = radius(style.borderTopRightRadius);
    const br = radius(style.borderBottomRightRadius),
      bl = radius(style.borderBottomLeftRadius);
    Object.assign(svg.style, {
      left: `${-border}px`,
      top: `${-(parseFloat(style.borderTopWidth) || 0)}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const d = `M ${left + tl} ${top} H ${right - tr} A ${tr} ${tr} 0 0 1 ${right} ${top + tr} V ${bottom - br} A ${br} ${br} 0 0 1 ${right - br} ${bottom} H ${left + bl} A ${bl} ${bl} 0 0 1 ${left} ${bottom - bl} V ${top + tl} A ${tl} ${tl} 0 0 1 ${left + tl} ${top} Z`;
    outline.setAttribute('d', d);
    mask.setAttribute('width', width + 8);
    mask.setAttribute('height', height + 8);
    parts = [];
    perimeter = 0;
    const add = (part) => {
      part.start = perimeter;
      perimeter += part.length;
      parts.push(part);
    };
    const line = (x, y, dx, dy) => add({ x, y, dx, dy, length: Math.hypot(dx, dy) });
    const arc = (x, y, angle, radius) => {
      if (radius > 0) add({ x, y, angle, radius, length: (Math.PI * radius) / 2 });
    };
    line(left + tl, top, right - left - tl - tr, 0);
    arc(right - tr, top + tr, -Math.PI / 2, tr);
    line(right, top + tr, 0, bottom - top - tr - br);
    bottomRightPosition = perimeter + (Math.PI * br) / 4;
    arc(right - br, bottom - br, 0, br);
    line(right - br, bottom, -(right - left - br - bl), 0);
    arc(left + bl, bottom - bl, Math.PI / 2, bl);
    line(left, bottom - bl, 0, -(bottom - top - bl - tl));
    arc(left + tl, top + tl, Math.PI, tl);
    trails.forEach(({ path }) => {
      path.setAttribute('d', d);
    });
    render();
  }

  function point(part, t) {
    if ('radius' in part) {
      const angle = part.angle + (t * Math.PI) / 2;
      return {
        x: part.x + part.radius * Math.cos(angle),
        y: part.y + part.radius * Math.sin(angle),
      };
    }
    return { x: part.x + part.dx * t, y: part.y + part.dy * t };
  }

  function render() {
    frame = 0;
    if (!parts.length) return;
    const matrix = followsPointer && svg.getScreenCTM();
    const local =
      followsPointer && pointer && matrix
        ? new DOMPoint(pointer.x, pointer.y).matrixTransform(matrix.inverse())
        : fixedAnchor
          ? narrowHero.matches
            ? { x: width, y: 0 }
            : { x: 0, y: height }
          : { x: width / 2, y: 0 };
    const { x, y } = local;
    let nearest = { distance: Infinity };
    for (const part of parts) {
      let t;
      if ('radius' in part) {
        let angle = Math.atan2(y - part.y, x - part.x);
        if (angle < -Math.PI / 2) angle += 2 * Math.PI;
        t = clamp((angle - part.angle) / (Math.PI / 2), 0, 1);
      } else {
        t = part.length
          ? clamp(((x - part.x) * part.dx + (y - part.y) * part.dy) / part.length ** 2, 0, 1)
          : 0;
      }
      // Check endpoints too, since angular projection crosses the -pi/pi seam.
      for (const candidate of [0, t, 1]) {
        const p = point(part, candidate);
        const distance = (x - p.x) ** 2 + (y - p.y) ** 2;
        if (distance < nearest.distance)
          nearest = { ...p, distance, position: part.start + candidate * part.length };
      }
    }
    node.setAttribute('cx', nearest.x);
    node.setAttribute('cy', nearest.y);
    const clockwiseLength = (bottomRightPosition - nearest.position + perimeter) % perimeter;
    trails.forEach(({ path, direction, index }) => {
      const length =
        !fixedAnchor && !followsPointer
          ? direction === 1
            ? clockwiseLength
            : perimeter - clockwiseLength
          : (perimeter * totalTrailFraction) / 2;
      const slice = length / segmentsPerSide;
      // Each direction has its own length; both meet at the bottom-right bend.
      // Keep the dash period equal to the perimeter across the path seam.
      path.setAttribute(
        'stroke-dasharray',
        `${slice + seamOverlap} ${perimeter - slice - seamOverlap}`,
      );
      const start =
        nearest.position + (direction === 1 ? index : -index - 1) * slice - seamOverlap / 2;
      const wrapped = ((start % perimeter) + perimeter) % perimeter;
      path.setAttribute('stroke-dashoffset', -wrapped);
    });
  }

  function follow(event) {
    if (event.pointerType === 'touch' || event.buttons) {
      clear();
      return;
    }
    pointer = { x: event.clientX, y: event.clientY };
    card.setAttribute('data-border-active', '');
    if (followsPointer && !frame) frame = requestAnimationFrame(render);
  }
  function clear() {
    pointer = null;
    if (card.matches(':focus-visible')) {
      render();
    } else {
      card.removeAttribute('data-border-active');
    }
  }
  if (!fixedAnchor) {
    card.addEventListener('pointerdown', clear);
    card.addEventListener('pointerenter', follow);
    card.addEventListener('pointermove', follow);
    card.addEventListener('pointerleave', clear);
    card.addEventListener('pointercancel', clear);
    card.addEventListener('focus', () => {
      if (card.matches(':focus-visible')) {
        card.setAttribute('data-border-active', '');
        render();
      }
    });
    card.addEventListener('blur', () => {
      if (!pointer) clear();
    });
  }
  narrowHero?.addEventListener('change', geometry);
  new ResizeObserver(geometry).observe(card, { box: 'border-box' });
  geometry();
}
document.querySelectorAll(selector).forEach(initializeProximity);
const quoteTrack = document.querySelector('[data-quote-border-orbit] .quote-track');
if (quoteTrack && document.body.dataset.cardBorderMode === 'proximity') {
  new MutationObserver((records) => {
    for (const record of records)
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches('.quote-card')) initializeProximity(node);
        node.querySelectorAll('.quote-card').forEach(initializeProximity);
      }
  }).observe(quoteTrack, { childList: true, subtree: true });
}
