import G from '../data/dashboard-animation.json';
import { updateMotionControl } from './motion-control.js';

/*
 * Product dashboard animation: an empty Consumption view, a cursor selects Vessel A, and the dashboard
 * builds itself (cards spring in, numbers count up, sparklines, bars and the trend line draw).
 * It is composited from screenshot pieces on a fixed 1331 × 1017 stage that is scaled to fit.
 * Geometry comes from src/data/dashboard-animation.json; the images are the clean plates in
 * /assets/products/dashboard-animation/.
 */
const IMAGE_SETS = {
  full: {
    final: '/assets/products/dashboard-animation/final.webp',
    plateA: '/assets/products/dashboard-animation/plate-a.webp',
    plateB: '/assets/products/dashboard-animation/plate-b.webp',
    empty: '/assets/products/dashboard-animation/empty.webp',
  },
  // Half resolution (~115 KB instead of ~330 KB) for phones and other small displays.
  small: {
    final: '/assets/products/dashboard-animation/final-small.webp',
    plateA: '/assets/products/dashboard-animation/plate-a-small.webp',
    plateB: '/assets/products/dashboard-animation/plate-b-small.webp',
    empty: '/assets/products/dashboard-animation/empty-small.webp',
  },
};
let IMG = IMAGE_SETS.full;
const W = 1331,
  H = 1017;
const CLICK = 1.08,
  FADE_BACK = 8.5,
  LOOP = 9.2;
const NS = 'http://www.w3.org/2000/svg';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
/** Damped spring from 0 to 1 with a slight overshoot. */
function spring(t, zeta = 0.5, freq = 1.9) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq,
    wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
}
/** Time fraction at which the eased line has drawn fraction f of its length. */
function easeInverse(f) {
  let lo = 0,
    hi = 1;
  for (let k = 0; k < 30; k++) {
    const m = (lo + hi) / 2;
    if (easeInOut(m) < f) lo = m;
    else hi = m;
  }
  return lo;
}

function build(stage) {
  const el = (tag, cls, style = {}, parent = stage) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    Object.assign(e.style, style);
    parent.appendChild(e);
    return e;
  };
  const slice = (img, x0, y0, x1, y1, extra = {}) =>
    el('div', 'da-slice', {
      left: `${x0}px`,
      top: `${y0}px`,
      width: `${x1 - x0}px`,
      height: `${y1 - y0}px`,
      backgroundImage: `url(${IMG[img]})`,
      backgroundPosition: `${-x0}px ${-y0}px`,
      backgroundSize: `${W}px ${H}px`,
      ...extra,
    });

  el('div', 'da-layer', {
    inset: 0,
    backgroundImage: `url(${IMG.final})`,
    backgroundSize: `${W}px ${H}px`,
  });
  el('div', 'da-layer', {
    left: '283px',
    top: '54px',
    width: `${W - 283}px`,
    height: `${H - 54}px`,
    background: 'rgb(214 227 237)',
  });

  const items = [];
  const add = (node, start, kind, opts = {}) => (items.push({ node, start, kind, ...opts }), node);

  add(slice('final', 272, 54, W, 112), 1.3, 'spring', { dy: -14 });
  add(slice('final', 278, 116, 1330, 186), 1.42, 'spring', { dy: 18 });
  add(slice('plateA', 284, 184, 1323, 434, { transformOrigin: '50% 0' }), 1.55, 'spring', {
    dy: 26,
    s0: 0.97,
  });
  G.tiles.forEach(([a, b], i) => {
    add(
      slice('plateB', a - 3, 268, b + 4, 414, { transformOrigin: '50% 100%' }),
      1.78 + i * 0.07,
      'spring',
      { dy: 12, s0: 0.9 },
    );
  });
  G.tiles.forEach(([a, b], i) => {
    add(slice('final', a + 3, G.sparkY[0], b - 2, G.sparkY[1] + 1), 2.05 + i * 0.07, 'wipe', {
      dur: 0.75,
    });
  });
  add(slice('plateA', 284, 434, 1323, 868, { transformOrigin: '50% 0' }), 2.2, 'spring', {
    dy: 30,
    s0: 0.97,
  });
  G.summary.forEach(([x0, y0, x1, y1], i) => {
    add(slice('final', x0 - 3, y0 - 3, x1 + 4, y1 + 4), 2.42 + i * 0.045, 'spring', {
      dy: 10,
      s0: 0.92,
    });
  });

  // Numbers count up over a patch, then dissolve into the screenshot's own text.
  G.numbers.forEach((n) => {
    const box = el('div', 'da-num', {
      left: `${n.x - 3}px`,
      top: `${n.y - 4}px`,
      width: `${n.w + (n.align === 'center' ? 8 : 4)}px`,
      height: `${n.h + 8}px`,
      background: n.bg,
    });
    const size = n.h / 0.716;
    const span = el(
      'span',
      '',
      {
        fontSize: `${size.toFixed(2)}px`,
        color: n.color,
        top: `${(n.h + 4 - 0.8465 * size).toFixed(2)}px`,
      },
      box,
    );
    if (n.align === 'center')
      Object.assign(span.style, { left: '50%', transform: 'translateX(-50%)' });
    else span.style.left = '3px';
    add(box, n.start, 'count', { span, value: n.value, decimals: n.decimals, dur: 0.95 });
  });

  // Chart: stacked bars grow from the baseline, then the trend line draws itself.
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'da-chart');
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('shape-rendering', 'crispEdges');
  stage.appendChild(svg);
  G.bars.forEach(([a, b], i) => {
    const g = document.createElementNS(NS, 'g');
    g.style.transformOrigin = `0 ${G.baseY + 1}px`;
    g.style.transform = 'scaleY(0)';
    for (const s of G.segments[i]) {
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', a);
      r.setAttribute('width', b - a + 1);
      r.setAttribute('y', s.y0);
      r.setAttribute('height', s.y1 - s.y0);
      r.setAttribute('fill', s.color);
      g.appendChild(r);
    }
    svg.appendChild(g);
    add(g, 2.62 + i * 0.12, 'grow');
  });
  const poly = document.createElementNS(NS, 'polyline');
  poly.setAttribute('points', G.points.map(([x, y]) => `${x},${y}`).join(' '));
  poly.setAttribute('fill', 'none');
  poly.setAttribute('stroke', G.lineColor);
  poly.setAttribute('stroke-width', '2.2');
  poly.setAttribute('stroke-linejoin', 'round');
  poly.setAttribute('shape-rendering', 'geometricPrecision');
  svg.appendChild(poly);
  let lineLen = 0;
  for (let i = 1; i < G.points.length; i++)
    lineLen += Math.hypot(G.points[i][0] - G.points[i - 1][0], G.points[i][1] - G.points[i - 1][1]);
  poly.style.strokeDasharray = lineLen;
  poly.style.strokeDashoffset = lineLen;
  add(poly, 3.3, 'draw', { dur: 0.75, len: lineLen });
  let along = 0;
  G.points.forEach(([x, y], i) => {
    if (i) along += Math.hypot(x - G.points[i - 1][0], y - G.points[i - 1][1]);
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x);
    c.setAttribute('cy', y);
    c.setAttribute('r', 4.2);
    c.setAttribute('fill', G.lineColor);
    c.setAttribute('shape-rendering', 'geometricPrecision');
    c.style.transformOrigin = `${x}px ${y}px`;
    c.style.transform = 'scale(0)';
    svg.appendChild(c);
    add(c, 3.3 + 0.75 * easeInverse(along / lineLen), 'dot');
  });
  // Hand over from the redrawn chart to the real screenshot pixels once drawing has finished.
  add(slice('final', 642, 528, 1293, 754), 4.25, 'fade', { dur: 0.35 });

  add(slice('final', 284, 868, 804, H, { transformOrigin: '50% 0' }), 3.65, 'spring', {
    dy: 40,
    s0: 0.97,
  });
  add(slice('final', 804, 868, W, H, { transformOrigin: '50% 0' }), 3.8, 'spring', {
    dy: 40,
    s0: 0.97,
  });
  add(
    slice('final', 1150, 942, 1314, 996, { borderRadius: '27px', transformOrigin: '50% 50%' }),
    4.35,
    'pulse',
  );

  // Empty state on top: sidebar and header vanish on click; the placeholder shrinks away.
  const chrome = el('div', 'da-layer', {
    inset: 0,
    clipPath: 'polygon(0 0,100% 0,100% 54px,272px 54px,272px 100%,0 100%)',
  });
  el(
    'div',
    'da-layer',
    {
      left: '2px',
      top: '2px',
      width: `${W}px`,
      height: `${H - 10}px`,
      backgroundImage: `url(${IMG.empty})`,
      backgroundSize: `${W}px ${H - 10}px`,
    },
    chrome,
  );
  const main = el('div', 'da-layer', {
    left: '272px',
    top: '54px',
    width: `${W - 272}px`,
    height: `${H - 54}px`,
    background: 'rgb(215 228 238)',
    overflow: 'hidden',
  });
  const art = el(
    'div',
    'da-layer',
    {
      left: '-270px',
      top: '-52px',
      width: `${W}px`,
      height: `${H - 10}px`,
      backgroundImage: `url(${IMG.empty})`,
      backgroundSize: `${W}px ${H - 10}px`,
      transformOrigin: '530px 470px',
    },
    main,
  );

  const ripple = el('div', 'da-ripple');
  const cursor = el('div', 'da-cursor');
  cursor.innerHTML =
    '<svg viewBox="0 0 26 26" width="26" height="26"><path d="M3 2 L3 21 L8.2 16.4 L11.6 24 L15 22.5 L11.7 15 L18.6 15 Z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  const P0 = [770, 760],
    P1 = [112, 124],
    P2 = [150, 168],
    CTRL = [520, 260];

  return function render(t) {
    let cx,
      cy,
      cOp,
      cScale = 1;
    if (t < 1.02) {
      const k = easeInOut(clamp((t - 0.3) / 0.72));
      cx = (1 - k) ** 2 * P0[0] + 2 * (1 - k) * k * CTRL[0] + k * k * P1[0];
      cy = (1 - k) ** 2 * P0[1] + 2 * (1 - k) * k * CTRL[1] + k * k * P1[1];
      cOp = clamp((t - 0.05) / 0.2);
    } else {
      const k = easeInOut(clamp((t - 1.35) / 0.6));
      cx = P1[0] + (P2[0] - P1[0]) * k;
      cy = P1[1] + (P2[1] - P1[1]) * k;
      cOp = 1 - clamp((t - 1.6) / 0.4);
      cScale = 1 - 0.18 * clamp(1 - Math.abs(t - CLICK - 0.05) / 0.1);
    }
    if (t > FADE_BACK) cOp = 0;
    cursor.style.opacity = cOp;
    cursor.style.transform = `translate(${cx - 3}px, ${cy - 2}px) scale(${cScale})`;
    const rt = (t - CLICK) / 0.55;
    ripple.style.opacity = rt > 0 && rt < 1 ? (1 - rt) * 0.9 : 0;
    ripple.style.left = `${P1[0]}px`;
    ripple.style.top = `${P1[1]}px`;
    ripple.style.transform = `scale(${0.2 + 0.9 * easeOut(clamp(rt))})`;

    const back = easeInOut(clamp((t - FADE_BACK) / 0.6));
    chrome.style.opacity = Math.max(1 - clamp((t - CLICK - 0.02) / 0.16), back);
    const artOut = easeInOut(clamp((t - CLICK - 0.02) / 0.3));
    main.style.opacity = Math.max(1 - artOut, back);
    art.style.transform = `scale(${1 - 0.06 * artOut * (1 - back)})`;

    for (const it of items) {
      const lt = t - it.start,
        n = it.node;
      if (it.kind === 'spring') {
        const p = spring(lt);
        const s = it.s0 ? it.s0 + (1 - it.s0) * p : 1;
        n.style.opacity = clamp(lt / 0.22);
        n.style.transform = `translateY(${((it.dy || 0) * (1 - p)).toFixed(2)}px) scale(${s.toFixed(4)})`;
      } else if (it.kind === 'fade') {
        n.style.opacity = clamp(lt / it.dur);
      } else if (it.kind === 'wipe') {
        n.style.opacity = lt > 0 ? 1 : 0;
        n.style.clipPath = `inset(0 ${(100 - easeInOut(clamp(lt / it.dur)) * 100).toFixed(2)}% 0 0)`;
      } else if (it.kind === 'count') {
        n.style.opacity = lt < 0 ? 0 : 1 - clamp((lt - it.dur - 0.05) / 0.2);
        it.span.textContent = (it.value * easeOut(clamp(lt / it.dur))).toFixed(it.decimals);
      } else if (it.kind === 'grow') {
        n.style.transform = `scaleY(${Math.max(0, spring(lt, 0.55, 1.7)).toFixed(4)})`;
      } else if (it.kind === 'draw') {
        n.style.strokeDashoffset = (it.len * (1 - easeInOut(clamp(lt / it.dur)))).toFixed(2);
      } else if (it.kind === 'dot') {
        n.style.transform = `scale(${Math.max(0, spring(lt, 0.4, 2.6)).toFixed(3)})`;
      } else if (it.kind === 'pulse') {
        const p = lt > 0 ? Math.sin(Math.PI * clamp(lt / 0.5)) * Math.exp(-lt * 2) : 0;
        n.style.opacity = lt > 0 && lt < 0.9 ? 1 : 0;
        n.style.transform = `scale(${(1 + 0.12 * p).toFixed(4)})`;
      }
    }
  };
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    // Decoding can be postponed while the tab is hidden, so never wait on it for long.
    img.onload = () =>
      Promise.race([img.decode(), new Promise((r) => setTimeout(r, 300))]).then(resolve, resolve);
    img.onerror = reject;
    img.src = src;
  });

/** Start the animation inside a [data-dashboard-animation] element. Without motion it stays a still image. */
export async function initDashboardAnimation(root) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stage = root.querySelector('[data-dashboard-stage]');
  // Use the same resolution the browser picked for the still image, so nothing is downloaded twice.
  const still = root.querySelector('.dashboard-animation-still');
  if (!still.complete)
    await new Promise((r) => {
      still.addEventListener('load', r, { once: true });
      still.addEventListener('error', r, { once: true });
    });
  IMG = still.currentSrc.includes('-small.') ? IMAGE_SETS.small : IMAGE_SETS.full;
  const button = root.querySelector('[data-dashboard-pause]');
  try {
    await Promise.all(Object.values(IMG).map(loadImage));
  } catch {
    return; // Keep the still image if any piece fails to load.
  }
  const render = build(stage);
  const fit = () => {
    stage.style.transform = `scale(${stage.parentElement.clientWidth / W})`;
  };
  new ResizeObserver(fit).observe(stage.parentElement);
  fit();
  let clock = 0,
    paused = false,
    visible = true,
    last = performance.now();
  render(0);
  root.classList.add('is-animating');
  button.hidden = false;
  button.addEventListener('click', () => {
    paused = !paused;
    updateMotionControl(button, paused);
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(root);
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused && visible && !document.hidden) {
      clock = (clock + dt) % LOOP;
      render(clock);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
