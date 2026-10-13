// Qualitative teaching diagrams: deliberately no invented customer metrics.
const legend = (items) =>
  `<div class="platform-example-legend">${items.map(([kind, label]) => `<span><i class="${kind}" aria-hidden="true"></i>${label}</span>`).join('')}</div>`;
/**
 * Single-series trend chart shared by the platform examples. Text, points and event strips are
 * HTML positioned in percent, so they keep their size while the plot stretches to any width.
 */
function trendChart({
  axis,
  key = '',
  xs,
  values,
  min,
  max,
  ticks,
  target,
  band,
  labels = [],
  latest,
  draw = [0.1, 1],
}) {
  const span = max - min;
  const last = xs.length - 1;
  const x = (index) => `${(index / last) * 100}%`;
  const y = (value) => `${((max - value) / span) * 100}%`;
  const sx = (index) => (index / last) * 1000;
  const sy = (value) => ((max - value) / span) * 400;
  // Motion timing: the line draws left to right at constant speed; each point and label lands as it passes.
  const [drawStart, drawLength] = draw;
  const at = (index) => `--d:${(drawStart + (drawLength * index) / last).toFixed(3)}s`;
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${sx(i)} ${sy(v)}`).join('');
  const grid = ticks
    .filter((v) => v !== target)
    .map((v) => `M0 ${sy(v)}H1000`)
    .join('');
  return `<div class="trend-chart">
      <div class="trend-head"><span>${axis}</span>${key}</div>
      <div class="trend-y">${ticks.map((v) => `<span style="top:${y(v)}">${String(v).replace('-', '−')}</span>`).join('')}</div>
      <div class="trend-plot">
        ${band ? `<i class="trend-band" style="left:${x(band[0])};width:calc(${x(band[1])} - ${x(band[0])})"></i>` : ''}
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true"><path class="trend-grid" d="${grid}"/>${target === undefined ? '' : `<path class="trend-target" d="M0 ${sy(target)}H1000"/>`}</svg>
        <svg class="trend-line-layer" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true" style="--draw:${drawLength}s;--d:${drawStart}s"><path class="trend-line" d="${line}"/></svg>
        ${target === undefined ? '' : `<span class="trend-target-label" style="top:${y(target)}">Target ${target}%</span>`}
        ${values.map((v, i) => `<i class="trend-point${latest && i === last ? ' is-latest' : ''}" style="left:${x(i)};top:${y(v)};${at(i)}"></i>`).join('')}
        ${labels.map(({ index, place, html }) => `<span class="trend-value" data-place="${place}" style="left:${x(index)};top:${y(values[index])};${at(index)}">${html}</span>`).join('')}
      </div>
      <div class="trend-x"${xs.length > 6 ? ' data-thin' : ''}>${xs.map((m, i) => `<span style="left:${x(i)}">${m}</span>`).join('')}</div>
    </div>`;
}
// Example SEEMP KPI (fuel efficiency improvement vs. January, %), adapted from a portal performance chart.
const seempChart = () =>
  trendChart({
    axis: 'Fuel efficiency improvement vs. January (%)',
    xs: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [0, 22, 26.5, 19.5, 17.5, 11, 27, 33, 31.5, 27.5, 25, 13],
    min: 0,
    max: 35,
    ticks: [0, 10, 20, 30],
    target: 10,
    latest: true,
    draw: [0.1, 1.2],
    labels: [{ index: 11, place: 'right', html: '<strong>13%</strong>' }],
  });
// Example hydrodynamic performance (propulsion power change at 11.4 kn), adapted from a portal trend.
const hullPoints = [
  [5463.3, 0],
  [4073.1, -25.4],
  [4262.5, -22.0],
  [3873.8, -29.1],
];
const hullPlaces = ['above-start', 'below', 'above', 'below-end'];
const hullChart = () =>
  trendChart({
    axis: 'Propulsion power change at 11.4 kn (%)',
    key: '<span class="trend-key"><i class="trend-band-key" aria-hidden="true"></i>Hull cleaning</span>',
    xs: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'],
    values: hullPoints.map(([, change]) => change),
    min: -45,
    max: 15,
    ticks: [0, -10, -20, -30, -40],
    band: [0.33, 0.47],
    draw: [0.1, 0.8],
    latest: true,
    labels: hullPoints.map(([kw, change], index) => ({
      index,
      place: hullPlaces[index],
      html: `<strong>${change ? `−${Math.abs(change).toFixed(1)}` : '0.0'}%</strong><small>${kw.toLocaleString('en-US', { minimumFractionDigits: 1 })} kW</small>`,
    })),
  });
// Example average fuel baseline deviation per operation mode (%), adapted from a portal overview.
const modeDeviations = [
  ['Transit other', 7.89],
  ['Transit eco', 2.91],
  ['Standby', 1.67],
  ['DP', 0.5],
  ['Transit service', 0.08],
  ['Transit max', -0.36],
];
function modeChart() {
  const [min, max] = [-1, 10];
  const x = (value) => `${((value - min) / (max - min)) * 100}%`;
  const worst = Math.max(...modeDeviations.map(([, v]) => v));
  const format = (v) => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(2)}%`;
  return `<div class="trend-chart mode-chart">
      <div class="trend-head"><span>Average fuel deviation from mode baseline (%)</span></div>
      <div class="mode-names">${modeDeviations.map(([name]) => `<span>${name}</span>`).join('')}</div>
      <div class="mode-plot">
        ${[2, 4, 6, 8, 10].map((v) => `<i class="mode-grid" style="left:${x(v)}"></i>`).join('')}
        <i class="mode-zero" style="left:${x(0)}"></i>
        ${modeDeviations
          .map(
            ([, v], i) =>
              `<div class="mode-row" style="--i:${i}"><i class="mode-bar${v === worst ? ' is-latest' : ''}${v < 0 ? ' is-negative' : ''}" style="left:${x(Math.min(v, 0))};width:calc(${x(Math.abs(v))} - ${x(0)})"></i><span class="mode-value${v === worst ? ' is-strong' : ''}" style="left:${x(Math.max(v, 0))};--from:${x(0)}">${format(v)}</span></div>`,
          )
          .join('')}
      </div>
      <div class="trend-x">${[0, 2, 4, 6, 8, 10].map((v) => `<span style="left:${x(v)}">${v}</span>`).join('')}</div>
    </div>`;
}
// Example anomaly score per monitoring period, simplified from a portal condition-monitoring chart.
const cbmPeriods = [
  {
    status: 'normal',
    label: 'Normal',
    start: '05 Jan',
    from: 0,
    to: 0.3,
    start: '05 Jan',
    values: [2.9, 6, 7.3, 5.2, 3.9, 5.4, 5.7, 5.9, 1.7, 0.9, 3.4, 2.8],
  },
  {
    status: 'warning',
    label: 'Warning',
    start: '03 Feb',
    from: 0.3,
    to: 0.52,
    start: '03 Feb',
    values: [78, 77.4, 73.3, 72.5, 85.6, 69.3, 64.2, 59.8, 63.8, 62.9],
  },
  {
    status: 'warning',
    label: 'Warning',
    start: '16 Feb',
    from: 0.52,
    to: 0.74,
    start: '16 Feb',
    values: [73, 77, 80.1, 82.3, 83.1, 76.2, 79, 72.6, 59.5, 64.3],
  },
  {
    status: 'critical',
    label: 'Critical',
    start: '07 Apr',
    from: 0.74,
    to: 1,
    start: '07 Apr',
    values: [85, 94.3, 91.7, 97.1, 96.5, 93.6, 108, 82.7, 85.5, 88.5, 83.7],
  },
];
function cbmChart() {
  const max = 120;
  const pct = (fraction) => `${fraction * 100}%`;
  const y = (value) => `${(1 - value / max) * 100}%`;
  const sy = (value) => (1 - value / max) * 400;
  // Smooth each period with a Catmull-Rom spline, inset slightly from its dividers.
  const curve = ({ from, to, values }) => {
    const pad = 0.012;
    const pts = values.map((v, i) => [
      (from + pad + ((to - from - 2 * pad) * i) / (values.length - 1)) * 1000,
      sy(v),
    ]);
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [p0, p1, p2, p3] = [pts[i - 1] || pts[i], pts[i], pts[i + 1], pts[i + 2] || pts[i + 1]];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1.map((n) => n.toFixed(1)).join(' ')} ${c2.map((n) => n.toFixed(1)).join(' ')} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return { line: d };
  };
  const average = (values) => Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
  const grid = [0, 20, 40, 60, 120].map((v) => `M0 ${sy(v)}H1000`).join('');
  // Motion: each period draws its line, then its tint and status label, before the next begins.
  const at = (index) => `--d:${(0.05 + index * 0.45).toFixed(2)}s`;
  return `<div class="trend-chart cbm-chart">
      <div class="trend-head"><span>Anomaly score</span></div>
      <div class="trend-x cbm-statuses">${cbmPeriods.map((p, i) => `<span class="cbm-status" data-status="${p.status}" style="left:${pct(p.from)};${at(i)}"><strong>${p.label}</strong>avg ${average(p.values)}</span>`).join('')}</div>
      <div class="trend-y">${[0, 20, 40, 60, 80, 100, 120].map((v) => `<span style="top:${y(v)}">${v}</span>`).join('')}</div>
      <div class="trend-plot">
        ${cbmPeriods.map((p, i) => `<i class="cbm-period" data-status="${p.status}" style="left:${pct(p.from)};width:${pct(p.to - p.from)};${at(i)}"></i>`).join('')}
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true"><path class="trend-grid" d="${grid}"/><path class="cbm-limit" data-status="warning" d="M0 ${sy(80)}H1000"/><path class="cbm-limit" data-status="critical" d="M0 ${sy(100)}H1000"/></svg>
        ${cbmPeriods
          .map(
            (p, i) =>
              `<svg class="cbm-line-layer" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true" style="--from:${pct(p.from)};--to:${pct(p.to)};${at(i)}"><path class="cbm-line" d="${curve(p).line}"/></svg>`,
          )
          .join('')}
        ${cbmPeriods
          .map((p, i) =>
            i ? `<i class="cbm-divider" style="left:${pct(p.from)};${at(i)}"></i>` : '',
          )
          .join('')}
      </div>
      <div class="trend-x cbm-dates">${cbmPeriods.map((p) => `<span style="left:${pct(p.from)}">${p.start}</span>`).join('')}</div>
    </div>`;
}
// MRV flowchart with standard symbols: terminator, process, decision and multi-document input.
// Two layouts: one row for wide panels, two rows for phones.
function mrvFlow(layout) {
  const lines = (cx, cy, rows, gap = 20) =>
    `<text x="${cx}" y="${cy - ((rows.length - 1) * gap) / 2}" text-anchor="middle" dominant-baseline="central">${rows
      .map(
        (row, i) =>
          `<tspan x="${cx}" dy="${i ? gap : 0}"${row.strong ? ' class="mrv-strong"' : ''}>${row.text ?? row}</tspan>`,
      )
      .join('')}</text>`;
  const terminator = (x, y, w, h, label, cls = '') =>
    `<g class="mrv-terminator ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/>${lines(x + w / 2, y + h / 2, [label])}</g>`;
  const process = (x, y, w, h, rows) =>
    `<g class="mrv-process"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>${lines(x + w / 2, y + h / 2, rows)}</g>`;
  const decision = (cx, cy, w, h, label) =>
    `<g class="mrv-decision"><path d="M${cx} ${cy - h / 2}L${cx + w / 2} ${cy}L${cx} ${cy + h / 2}L${cx - w / 2} ${cy}Z"/>${lines(cx, cy, [label])}</g>`;
  const doc = (x, y, w, h) =>
    `<path d="M${x} ${y}H${x + w}V${y + h - 5}C${x + w * 0.72} ${y + h - 13} ${x + w * 0.3} ${y + h + 5} ${x} ${y + h - 4}Z"/>`;
  // Inputs are listed as left-aligned bullets inside the front document.
  // Bulleted, left-aligned rows starting at (x, top).
  const bullets = (x, top, rows, gap) =>
    `<text dominant-baseline="central">${rows
      .map(
        (row, i) =>
          `<tspan x="${x}" y="${top + i * gap}"><tspan class="mrv-bullet">•</tspan> ${row}</tspan>`,
      )
      .join('')}</text>`;
  // The front sheet is at (x, y + 10); its wavy edge crosses the centre at about y + h + 6.
  const documents = (x, y, w, h, rows, gap = 19) =>
    `<g class="mrv-documents">${doc(x + 10, y, w, h)}${doc(x + 5, y + 5, w, h)}${doc(x, y + 10, w, h)}${bullets(x + 14, y + 10 + (h - 6) / 2 - ((rows.length - 1) * gap) / 2, rows, gap)}</g>`;
  // Process with a centred heading over bulleted entries: report name, then its specification.
  const listProcess = (x, y, w, h, heading, entries, gap = 34) => {
    const top = y + h / 2 - (20 + (entries.length - 1) * gap + 15) / 2;
    // Centre the list as a group (its widest line is about 96 units).
    const left = x + Math.max(14, (w - 96) / 2);
    const rows = entries
      .map(
        ([name, spec], i) =>
          `<tspan x="${left}" y="${top + 20 + i * gap}"><tspan class="mrv-bullet">•</tspan> ${name}</tspan><tspan class="mrv-spec" x="${left + 10}" y="${top + 35 + i * gap}">${spec}</tspan>`,
      )
      .join('');
    return `<g class="mrv-process"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>${lines(x + w / 2, top, [{ text: heading, strong: true }])}<text dominant-baseline="central">${rows}</text></g>`;
  };
  // Motion: shapes pop in along the flow; each arrow draws through a mask, then its head lands.
  const at = (html, start) => html.replace('<g class="', `<g style="--d:${start}s" class="`);
  let maskCount = 0;
  const arrow = (d, cls = '', start = 0, length = 0.2) => {
    const points = [];
    for (const [, cmd, a, b] of d.matchAll(/([MHV])([\d.]+)(?:\s([\d.]+))?/g)) {
      const last = points.at(-1);
      points.push(cmd === 'M' ? [+a, +b] : cmd === 'H' ? [+a, last[1]] : [last[0], +a]);
    }
    const [[x1, y1], [x2, y2]] = points.slice(-2);
    const [ux, uy] = [Math.sign(x2 - x1), Math.sign(y2 - y1)];
    const tip = `${x2} ${y2}`;
    const back = (k, side) => `${x2 - ux * k - uy * side} ${y2 - uy * k + ux * side}`;
    const id = `mrv-mask-${layout}-${maskCount++}`;
    // The line stops short of the tip so the head covers it.
    const line = d.replace(
      /([HV])([\d.]+)$/,
      (m, cmd, v) => `${cmd}${+v - (cmd === 'H' ? ux : uy) * 6}`,
    );
    return `<mask id="${id}" maskUnits="userSpaceOnUse" x="-20" y="-20" width="2000" height="2000"><path class="mrv-draw" d="${line}" pathLength="1" style="--d:${start}s;--t:${length}s"/></mask><path class="mrv-arrow ${cls}" d="${line}" mask="url(#${id})"/><path class="mrv-head" d="M${tip}L${back(9, 4.5)}L${back(9, -4.5)}Z" style="--d:${(start + length - 0.04).toFixed(2)}s"/>`;
  };
  const label = (x, y, text, anchor = 'middle', start = 0) =>
    `<text class="mrv-label" x="${x}" y="${y}" text-anchor="${anchor}" style="--d:${start}s">${text}</text>`;
  const inputs = ['Sensors & AIS', 'Fuel & bunkers', 'Cargo & crew'];
  const outputs = [
    ['EU/UK MRV', 'Log abstract'],
    ['IMO DCS', 'Annual report'],
    ['EU ETS', 'Allowances'],
  ];
  if (layout === 'wide') {
    return `<svg class="mrv-flow" data-layout="wide" viewBox="0 0 900 214" aria-hidden="true">
      ${at(documents(145, 0, 150, 84, inputs), 0)}
      ${at(terminator(0, 121, 90, 38, 'Start'), 0.05)}
      ${at(process(130, 112, 180, 56, ['Generate voyages']), 0.42)}
      ${at(decision(420, 140, 120, 72, 'Audit'), 0.74)}
      ${at(listProcess(565, 72, 165, 136, 'Generate', outputs), 1.18)}
      ${at(terminator(810, 121, 90, 38, 'Submit', 'is-end'), 1.56)}
      ${arrow('M220 90V110', '', 0.28, 0.14)}
      ${arrow('M90 140H128', '', 0.24, 0.18)}
      ${arrow('M310 140H358', '', 0.58, 0.18)}
      ${arrow('M480 140H563', '', 0.96, 0.22)}
      ${arrow('M730 140H808', '', 1.38, 0.18)}
      ${arrow('M420 176V206H220V170', 'is-fail', 0.96, 0.34)}
      ${label(521, 131, 'Approve', 'middle', 1.02)}
      ${label(428, 198, 'Fail', 'start', 1.02)}
    </svg>`;
  }
  return `<svg class="mrv-flow" data-layout="narrow" viewBox="0 0 340 362" aria-hidden="true">
      ${at(documents(78, 0, 140, 80, inputs), 0)}
      ${at(terminator(0, 116, 60, 34, 'Start'), 0.05)}
      ${at(process(82, 106, 132, 54, ['Generate voyages']), 0.42)}
      ${at(decision(280, 133, 92, 62, 'Audit'), 0.74)}
      ${at(listProcess(150, 222, 150, 136, 'Generate', outputs), 1.22)}
      ${at(terminator(0, 273, 84, 34, 'Submit', 'is-end'), 1.56)}
      ${arrow('M148 86V104', '', 0.28, 0.14)}
      ${arrow('M60 133H80', '', 0.24, 0.18)}
      ${arrow('M214 133H232', '', 0.58, 0.16)}
      ${arrow('M326 133H337V290H302', '', 0.96, 0.3)}
      ${arrow('M150 290H86', '', 1.4, 0.16)}
      ${arrow('M280 164V200H148V162', 'is-fail', 0.96, 0.34)}
      ${label(331, 196, 'Approve', 'end', 1.06)}
      ${label(214, 194, 'Fail', 'middle', 1.06)}
    </svg>`;
}
export const platformVisuals = [
  `<div class="platform-example" data-example="operations" data-motion role="img" aria-label="Example average fuel deviation from baseline per operation mode. Transit other is 7.89 percent above its baseline, the clear outlier. Transit eco is 2.91 percent above, standby 1.67, DP 0.50 and transit service 0.08 percent above, while transit max is 0.36 percent below its baseline.">
    ${modeChart()}
    <p class="platform-example-caption">Find excess fuel use by comparing like-for-like operations.</p>
  </div>`,
  `<div class="platform-example" data-example="fuel" data-motion role="img" aria-label="Example hydrodynamic performance trend: propulsion power change at 11.4 knots by quarter in 2025. After a hull cleaning early in the year, power at the same speed falls from 5,463 kW to 4,073 kW in Q2, a 25.4 percent reduction, and ends the year 29.1 percent lower at 3,874 kW.">
    ${hullChart()}
    <p class="platform-example-caption">Measure the power reduction at the same speed after hull cleaning.</p>
  </div>`,
  `<div class="platform-example" data-example="maintenance" data-motion role="img" aria-label="Example anomaly score for one piece of equipment over four periods, with warning at 80 and critical at 100. The first period is normal with scores near zero. The next two are warnings, averaging 71 and 75. The last is critical, averaging 91 with a spike to 108.">
    ${cbmChart()}
    <p class="platform-example-caption">Recognise a developing issue before it becomes a failure.</p>
  </div>`,
  `<div class="platform-example" data-example="seemp" data-motion role="img" aria-label="Example SEEMP KPI: fuel efficiency improvement relative to January, by month. It rises to about 33 percent in August, then falls to 13 percent in December, still above the 10 percent target.">
    ${seempChart()}
    <p class="platform-example-caption">Measure progress against your SEEMP target every month, not once a year.</p>
  </div>`,
  `<div class="platform-example" data-example="reporting" data-motion role="img" aria-label="MRV flowchart. Start, then generate voyages from sensor and AIS data, fuel and bunker reports, and cargo and crew reports. An audit follows: if it fails, voyages are generated again; if approved, Dipai generates the EU and UK MRV log abstract, the IMO DCS annual report and EU ETS allowances, and the result is submitted.">
    ${mrvFlow('wide')}${mrvFlow('narrow')}
    <p class="platform-example-caption">Correct the data once. Report to every scheme with a full audit trail.</p>
  </div>`,
];
export function renderPlatformVisual(index) {
  // The first chart is server-rendered into this host by Platform.astro.
  const host = document.querySelector('#product-panel .platform-example-host');
  disarmMotion(host.firstElementChild);
  host.innerHTML = platformVisuals[index];
  armMotion(host.firstElementChild);
}

// Charts marked data-motion animate once each time they are armed, starting when they are on screen.
const motionObservers = new WeakMap();
function disarmMotion(example) {
  motionObservers.get(example)?.disconnect();
  motionObservers.delete(example);
}
export function armMotion(example) {
  if (!example?.hasAttribute('data-motion') || !('IntersectionObserver' in window)) return;
  disarmMotion(example);
  example.classList.remove('is-playing');
  example.classList.add('is-waiting');
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      disarmMotion(example);
      // A frame in the waiting state lets a replay restart its animations.
      requestAnimationFrame(() => example.classList.replace('is-waiting', 'is-playing'));
    },
    { threshold: 0.35 },
  );
  motionObservers.set(example, observer);
  observer.observe(example);
}
