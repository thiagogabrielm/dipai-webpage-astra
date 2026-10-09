// Qualitative teaching diagrams: deliberately no invented customer metrics.
const legend = (items) =>
  `<div class="platform-example-legend">${items.map(([kind, label]) => `<span><i class="${kind}" aria-hidden="true"></i>${label}</span>`).join('')}</div>`;
export const platformVisuals = [
  `<div class="platform-example" data-example="operations" role="img" aria-label="Conceptual comparison of fuel use against a separate baseline for transit, dynamic positioning and standby. Standby fuel extends beyond its baseline, highlighting an operation to investigate.">
    <div class="operation-comparison">
      ${[
        ['Transit', 72, 75],
        ['DP', 57, 60],
        ['Standby', 77, 44],
      ]
        .map(
          ([name, actual, baseline]) =>
            `<div class="operation-row"><span>${name}</span><div class="operation-track" style="--actual:${actual}%;--baseline:${baseline}%"><div class="operation-fuel"></div>${actual > baseline ? '<div class="operation-excess"></div>' : ''}<i class="operation-baseline"></i></div></div>`,
        )
        .join('')}
      ${legend([
        ['fuel', 'Fuel use'],
        ['baseline', 'Mode baseline'],
        ['signal', 'Excess fuel'],
      ])}
    </div>
    <p class="platform-example-caption">Find excess fuel use by comparing like-for-like operations.</p>
  </div>`,
  `<div class="platform-example" data-example="fuel" role="img" aria-label="Conceptual speed-power comparison before and after hull cleaning. The after-cleaning curve needs less propulsion power at the same vessel speed, with the difference highlighted between the curves.">
    <div class="platform-plot"><span class="platform-axis-label">Propulsion power</span>
      <svg viewBox="0 0 480 158" aria-hidden="true"><path class="example-grid" d="M12 30H468M12 78H468M12 126H468"/><path class="example-benefit" d="M16 138C140 130 250 87 450 10L450 53C250 113 140 143 16 144Z"/>
      <path class="example-reference" d="M16 138C140 130 250 87 450 10"/>
      <path class="example-measured" d="M16 144C140 143 250 113 450 53"/>
      <path class="example-gap" d="M315 59V94M310 64L315 59L320 64M310 89L315 94L320 89"/>
      <circle class="example-node" cx="315" cy="94" r="5"/>
      </svg><span class="platform-axis-end">Vessel speed →</span>
      ${legend([
        ['reference', 'Before cleaning'],
        ['fuel', 'After cleaning'],
      ])}
    </div>
    <p class="platform-example-caption">Reveal the power reduction at the same speed and conditions.</p>
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
  `<div class="platform-example" data-example="reporting" role="img" aria-label="Operational modes, fuel and emissions, and voyage reports connect to one shared evidence base. That same evidence supports SEEMP planning and MRV or DCS reporting, reducing repeated data collection.">
    <div class="reporting-flow"><div class="reporting-inputs"><span>Operational<br>modes</span><span>Fuel &<br>emissions</span><span>Voyage<br>reports</span></div><div class="reporting-hub"><i class="dot" aria-hidden="true"></i><strong>Shared<br>evidence</strong></div><div class="reporting-outputs"><span><strong>SEEMP</strong>Plan & review</span><span><strong>MRV / DCS</strong>Reporting</span></div></div>
    <p class="platform-example-caption">Collect once. Reuse the evidence across planning and reporting.</p>
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
}
