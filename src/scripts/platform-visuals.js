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
}) {
  const span = max - min;
  const last = xs.length - 1;
  const x = (index) => `${(index / last) * 100}%`;
  const y = (value) => `${((max - value) / span) * 100}%`;
  const sx = (index) => (index / last) * 1000;
  const sy = (value) => ((max - value) / span) * 400;
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
        <svg viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true"><path class="trend-grid" d="${grid}"/>${target === undefined ? '' : `<path class="trend-target" d="M0 ${sy(target)}H1000"/>`}<path class="trend-line" d="${line}"/></svg>
        ${target === undefined ? '' : `<span class="trend-target-label" style="top:${y(target)}">Target ${target}%</span>`}
        ${values.map((v, i) => `<i class="trend-point${latest && i === last ? ' is-latest' : ''}" style="left:${x(i)};top:${y(v)}"></i>`).join('')}
        ${labels.map(({ index, place, html }) => `<span class="trend-value" data-place="${place}" style="left:${x(index)};top:${y(values[index])}">${html}</span>`).join('')}
      </div>
      <div class="trend-x"${xs.length > 6 ? ' data-thin' : ''}>${xs.map((m, i) => `<span style="left:${x(i)}">${m}</span>`).join('')}</div>
    </div>`;
}
// Example SEEMP KPI (fuel efficiency degradation vs. January, %), adapted from a portal performance chart.
const seempChart = () =>
  trendChart({
    axis: 'Fuel efficiency degradation vs. January (%)',
    xs: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [0, 22, 26.5, 19.5, 17.5, 11, 27, 33, 31.5, 27.5, 25, 13],
    min: 0,
    max: 35,
    ticks: [0, 10, 20, 30],
    target: 10,
    latest: true,
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
export const platformVisuals = [
  `<div class="platform-example" data-example="operations" data-motion role="img" aria-label="Example average fuel deviation from baseline per operation mode. Transit other is 7.89 percent above its baseline, the clear outlier. Transit eco is 2.91 percent above, standby 1.67, DP 0.50 and transit service 0.08 percent above, while transit max is 0.36 percent below its baseline.">
    ${modeChart()}
    <p class="platform-example-caption">Find excess fuel use by comparing like-for-like operations.</p>
  </div>`,
  `<div class="platform-example" data-example="fuel" role="img" aria-label="Example hydrodynamic performance trend: propulsion power change at 11.4 knots by quarter in 2025. After a hull cleaning early in the year, power at the same speed falls from 5,463 kW to 4,073 kW in Q2, a 25.4 percent reduction, and ends the year 29.1 percent lower at 3,874 kW.">
    ${hullChart()}
    <p class="platform-example-caption">Measure the power reduction at the same speed after hull cleaning.</p>
  </div>`,
  `<div class="platform-example" data-example="maintenance" role="img" aria-label="Conceptual equipment-condition trend. Measurements drift away from their normal range and an early deviation is highlighted before the trend reaches the upper limit.">
    <div class="platform-plot"><span class="platform-axis-label">Equipment condition</span>
      <svg viewBox="0 0 480 158" aria-hidden="true"><rect class="example-benefit" x="12" y="103" width="456" height="34" rx="3"/><path class="example-grid" d="M12 78H468M12 142H468"/>
      <path class="example-limit" d="M12 25H468"/><text class="example-annotation" x="15" y="18">Limit</text>
      <path class="example-measured" d="M12 122L43 117L72 124L99 113L125 120L155 115L186 120L215 108L244 110L274 92L305 82L337 66L368 59L401 52L437 42L465 37"/>
      <path class="example-leader" d="M274 92V54H224"/><circle class="example-node" cx="274" cy="92" r="5"/><text class="example-annotation" x="215" y="57" text-anchor="end">Early deviation</text>
      </svg><span class="platform-axis-end">Time →</span>
      ${legend([
        ['range', 'Normal range'],
        ['fuel', 'Condition trend'],
      ])}
    </div>
    <p class="platform-example-caption">Recognise a developing issue before a limit is reached.</p>
  </div>`,
  `<div class="platform-example" data-example="seemp" role="img" aria-label="Example SEEMP KPI: fuel efficiency degradation relative to January, by month. It rises to about 33 percent in August, then falls to 13 percent in December, still above the 10 percent target.">
    ${seempChart()}
    <p class="platform-example-caption">Measure progress against your SEEMP target every month, not once a year.</p>
  </div>`,
  `<div class="platform-example" data-example="reporting" role="img" aria-label="Sensor and AIS data, fuel and bunker reports, and cargo and crew reports flow into one automated pipeline with automatic corrections and an audit trail. The pipeline delivers EU and UK MRV log abstracts, IMO DCS reports and EU ETS allowance estimates.">
    <div class="reporting-flow"><div class="reporting-inputs"><span>Sensors<br>& AIS</span><span>Fuel &<br>bunkers</span><span>Cargo<br>& crew</span></div><div class="reporting-hub"><i class="dot" aria-hidden="true"></i><strong>Corrected<br>& audited</strong></div><div class="reporting-outputs"><span><strong>EU / UK MRV</strong>Log abstract</span><span><strong>IMO DCS</strong>Annual report</span><span><strong>EU ETS</strong>Allowances</span></div></div>
    <p class="platform-example-caption">Correct the data once. Report to every scheme with a full audit trail.</p>
  </div>`,
];
export function renderPlatformVisual(index) {
  const graphic = document.querySelector('#product-panel .product-graphic');
  let host = graphic.querySelector('.platform-example-host');
  if (!host) {
    // Keep the label used by the shared height measurement; replace the old plot.
    [...graphic.children]
      .filter((child) => !child.classList.contains('product-chart-label'))
      .forEach((child) => child.remove());
    host = document.createElement('div');
    host.className = 'platform-example-host';
    graphic.append(host);
  }
  host.innerHTML = platformVisuals[index];
  playMotion(host.firstElementChild);
}

// Charts marked data-motion animate once each time they render, starting when they are on screen.
let motionObserver;
function playMotion(example) {
  motionObserver?.disconnect();
  if (!example?.hasAttribute('data-motion') || !('IntersectionObserver' in window)) return;
  example.classList.add('is-waiting');
  motionObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      motionObserver.disconnect();
      example.classList.replace('is-waiting', 'is-playing');
    },
    { threshold: 0.35 },
  );
  motionObserver.observe(example);
}
