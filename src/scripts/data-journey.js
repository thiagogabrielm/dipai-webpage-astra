import { mountJourneyMarker } from './journey-marker.js';
// A moving viewport follows one stream; analysis lives inside the context intersection.
const section = document.querySelector('#how-it-works-journey');
const clamp = (n) => Math.max(0, Math.min(1, n));
const ease = (n) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;
if (section) {
  const svg = section.querySelector('.journey-svg');
  const ns = 'http://www.w3.org/2000/svg';
  const make = (tag, attrs = {}, parent = svg) => {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    parent.append(el);
    return el;
  };
  const text = (x, y, content, parent, cls = '') => {
    const el = make('text', { x, y, class: cls }, parent);
    el.textContent = content;
    return el;
  };
  const paths = [];
  const wire = (d, parent, count = 7) => {
    const path = make('path', { d, class: 'journey-wire' }, parent);
    const dots = Array.from({ length: count }, (_, i) =>
      make('circle', { r: i % 3 === 0 ? 3 : 2, class: 'journey-particle' }, parent),
    );
    paths.push({ path, dots, length: path.getTotalLength() });
    return path;
  };
  const box = (x, y, w, h, title, subtitle, parent, cls = '') => {
    const g = make('g', { class: `journey-box ${cls}` }, parent);
    make('rect', { x, y, width: w, height: h, rx: 8 }, g);
    text(x + 20, y + 32, title, g, 'journey-box-title');
    text(x + 20, y + 56, subtitle, g, 'journey-box-subtitle');
    return g;
  };
  const sources = make('g');
  const sourceNames = ['Sensor data', 'Manual reports', 'Weather data', 'Metadata'];
  sourceNames.forEach((label, i) => {
    const y = 85 + i * 95;
    wire(`M240 ${y}H520C680 ${y} 730 225 900 225`, sources, 12);
    make('circle', { cx: 220, cy: y, r: 20, class: 'journey-emitter' }, sources);
    make('circle', { cx: 220, cy: y, r: 5, fill: '#a9bfd0' }, sources);
    text(184, y + 5, label, sources, 'journey-source');
  });
  wire('M900 225H1350', sources, 15);
  const context = make('g');
  const defs = make('defs', {}, context);
  // Nested clips show only the region common to all three circles.
  const circles = [
    [1300, 185],
    [1400, 185],
    [1350, 285],
  ];
  circles.forEach(([cx, cy], i) => {
    const clip = make('clipPath', { id: `journey-context-${i}` }, defs);
    make('circle', { cx, cy, r: 125 }, clip);
    make(
      'circle',
      { cx, cy, r: 125, class: `journey-context-circle journey-context-circle-${i}` },
      context,
    );
  });
  let common = context;
  circles.forEach((_, i) => {
    common = make('g', { 'clip-path': `url(#journey-context-${i})` }, common);
  });
  make('rect', { x: 1150, y: 40, width: 400, height: 390, fill: '#ffd600', opacity: 0.14 }, common);
  text(1180, 68, 'Operation', context, 'journey-context-label');
  text(1450, 68, 'Location', context, 'journey-context-label');
  text(1310, 435, 'Weather', context, 'journey-context-label');
  const target = make(
    'circle',
    { cx: 1350, cy: 225, r: 10, class: 'journey-emitter journey-context-focus' },
    context,
  );
  // The next world is physically nested within the overlapping region.
  const inside = make('g', { transform: 'translate(1350 225) scale(.36)' });
  const analysis = make('g', {}, inside);
  wire('M-520 0H-320', analysis);
  const analysisNames = ['Regression', 'AI models', 'Custom algorithms', 'Comparisons'];
  analysisNames.forEach((label, i) => {
    const y = -165 + i * 110;
    wire(`M-320 0C-250 0 -265 ${y} -170 ${y}`, analysis);
    wire(`M90 ${y}C205 ${y} 190 0 290 0`, analysis);
    box(
      -170,
      y - 39,
      260,
      78,
      label,
      [
        'Measure the trend',
        'Detect unusual patterns',
        'Apply operational logic',
        'Compare with baseline',
      ][i],
      analysis,
    );
  });
  wire('M290 0H670', inside, 12);
  text(310, -22, 'Combined results', inside, 'journey-muted');
  const insight = make('g', {}, inside);
  box(
    670,
    -62,
    350,
    124,
    'DG1 vibration trending up',
    'Ahead of scheduled service',
    insight,
    'journey-insight',
  );
  make(
    'path',
    { d: 'M695 34L735 27L775 29L815 13L855 17L895 -1L935 -8L995 -22', class: 'journey-trend' },
    insight,
  );
  wire('M1020 0H1300', insight);
  box(955, 125, 285, 84, 'Crew report', 'Unusual vibration reported', insight);
  wire('M1240 167C1300 167 1250 0 1300 0', insight);
  make('circle', { cx: 1300, cy: 0, r: 10, class: 'journey-emitter' }, insight);
  wire('M1310 0H1650', inside, 12);
  const actions = make('g', {}, inside);
  wire('M1650 0C1730 0 1720 -85 1800 -85', actions);
  wire('M1650 0C1730 0 1720 85 1800 85', actions);
  box(
    1800,
    -128,
    320,
    86,
    'Inspect DG1',
    'Crew · check vibration on board',
    actions,
    'journey-action',
  );
  box(
    1800,
    42,
    320,
    86,
    'Plan service',
    'Shore · coordinate maintenance',
    actions,
    'journey-action',
  );
  text(1800, -160, 'SUGGESTED ACTIONS', actions, 'journey-context-label');
  // A separate vertical layout keeps text upright and branches readable on narrow screens.
  const mobileSvg = make(
    'svg',
    { class: 'journey-svg journey-svg-vertical', 'aria-hidden': 'true' },
    section.querySelector('.journey-experience'),
  );
  svg.after(mobileSvg);
  const mobileSources = make('g', {}, mobileSvg);
  sourceNames.forEach((label, i) => {
    const x = 50 + i * 100;
    label
      .split(' ')
      .forEach((word, line) =>
        text(x, 34 + line * 17, word, mobileSources, 'journey-mobile-source'),
      );
    make('circle', { cx: x, cy: 90, r: 15, class: 'journey-emitter' }, mobileSources);
    make('circle', { cx: x, cy: 90, r: 4, fill: '#a9bfd0' }, mobileSources);
    wire(`M${x} 105V230C${x} 320 200 320 200 390`, mobileSources, 8);
  });
  wire('M200 390V650', mobileSources, 9);
  const mobileContext = make('g', {}, mobileSvg);
  const mobileDefs = make('defs', {}, mobileContext);
  const mobileCircles = [
    [163, 625],
    [237, 625],
    [200, 690],
  ];
  mobileCircles.forEach(([cx, cy], i) => {
    const clip = make('clipPath', { id: `journey-vertical-context-${i}` }, mobileDefs);
    make('circle', { cx, cy, r: 87 }, clip);
    make(
      'circle',
      { cx, cy, r: 87, class: `journey-context-circle journey-context-circle-${i}` },
      mobileContext,
    );
  });
  let mobileCommon = mobileContext;
  mobileCircles.forEach((_, i) => {
    mobileCommon = make('g', { 'clip-path': `url(#journey-vertical-context-${i})` }, mobileCommon);
  });
  make(
    'rect',
    { x: 65, y: 530, width: 270, height: 260, fill: '#ffd600', opacity: 0.14 },
    mobileCommon,
  );
  text(83, 523, 'Operation', mobileContext, 'journey-context-label');
  text(250, 523, 'Location', mobileContext, 'journey-context-label');
  text(170, 802, 'Weather', mobileContext, 'journey-context-label');
  make(
    'circle',
    { cx: 200, cy: 650, r: 10, class: 'journey-emitter journey-context-focus' },
    mobileContext,
  );
  const mobileInside = make('g', { transform: 'translate(200 650) scale(.36)' }, mobileSvg);
  const mobileAnalysis = make('g', {}, mobileInside);
  wire('M0 -280V-190', mobileAnalysis, 5);
  analysisNames.forEach((label, i) => {
    const x = i % 2 ? 115 : -115,
      y = i < 2 ? -130 : 20;
    // Outer distribution rails feed the lower boxes without passing through upper boxes.
    const rail = x < 0 ? -225 : 225;
    wire(`M0 -190H${rail}V${y - 18}Q${rail} ${y} ${x} ${y}`, mobileAnalysis, 6);
    wire(`M${x} ${y + 80}V${y + 98}H0V200`, mobileAnalysis, 5);
    box(
      x - 100,
      y,
      200,
      80,
      label,
      ['Measure the trend', 'Detect anomalies', 'Operational logic', 'Against baseline'][i],
      mobileAnalysis,
    );
  });
  wire('M0 200V470', mobileInside, 8);
  text(18, 260, 'Combined results', mobileInside, 'journey-muted');
  const mobileInsight = make('g', {}, mobileInside);
  box(
    -175,
    470,
    350,
    120,
    'DG1 vibration trending up',
    'Ahead of scheduled service',
    mobileInsight,
    'journey-insight',
  );
  make(
    'path',
    { d: 'M-150 566L-100 556L-50 559L0 541L50 547L100 527L150 516', class: 'journey-trend' },
    mobileInsight,
  );
  wire('M0 590V850', mobileInsight, 6);
  box(25, 665, 195, 84, 'Crew report', 'Unusual vibration', mobileInsight);
  wire('M125 749V800Q125 850 0 850', mobileInsight, 5);
  make('circle', { cx: 0, cy: 850, r: 9, class: 'journey-emitter' }, mobileInsight);
  wire('M0 860V1030', mobileInside, 6);
  const mobileActions = make('g', {}, mobileInside);
  text(-160, 1080, 'SUGGESTED ACTIONS', mobileActions, 'journey-context-label');
  wire('M0 1030V1110', mobileActions, 4);
  wire('M0 1030H-205V1335H-170', mobileActions, 8);
  box(
    -170,
    1110,
    340,
    90,
    'Inspect DG1',
    'Crew · check vibration on board',
    mobileActions,
    'journey-action',
  );
  box(
    -170,
    1290,
    340,
    90,
    'Plan service',
    'Shore · coordinate maintenance',
    mobileActions,
    'journey-action',
  );
  const mobileCameras = [
    [200, 235, 420],
    [200, 650, 420],
    [200, 650, 180],
    [200, 888, 180],
    [200, 1095, 180],
  ];
  const narrow = matchMedia('(max-width: 900px)');
  const stages = [
    {
      camera: [510, 225, 1080],
      title: 'Every source starts a signal.',
      description:
        'Sensor data, manual reports, weather data and metadata emit individual data points into one stream.',
      chapter: 0,
    },
    {
      camera: [1270, 225, 1050],
      title: 'Context brings the streams together.',
      description:
        'Operation, location and weather overlap. The combined stream enters the region they share.',
      chapter: 1,
    },
    {
      camera: [1350, 225, 390],
      title: 'One stream. Four ways to find the pattern.',
      description:
        'Regression, AI models, custom algorithms and comparisons run in parallel. Their results merge into one result stream.',
      chapter: 2,
    },
    {
      camera: [1720, 245, 405],
      title: 'A pattern becomes an insight.',
      description:
        'DG1 vibration is trending up ahead of scheduled service. A crew report adds the operational evidence.',
      chapter: 3,
    },
    {
      camera: [1990, 225, 350],
      title: 'An insight becomes a next step.',
      description:
        'The finding and crew report lead to two suggested actions: inspect DG1 on board and plan service with shore.',
      chapter: 4,
    },
  ];
  const title = section.querySelector('.journey-title');
  const description = section.querySelector('.journey-description');
  const buttons = [...section.querySelectorAll('[data-journey-stage]')];
  const chapterMarker = mountJourneyMarker(section.querySelector('.journey-chapters'), buttons);
  let animateMarkerJump = false;
  const compact = matchMedia(
    '(min-width: 901px) and (max-height: 650px), (prefers-reduced-motion: reduce)',
  );
  let lastStage = -1,
    queued = false;
  const headerHeight = () => document.querySelector('.site-header').offsetHeight;
  function render(progress) {
    const timeline = clamp(progress) * stages.length;
    const index = Math.min(stages.length - 1, Math.floor(timeline));
    const local = timeline - index;
    chapterMarker.update(index, local, animateMarkerJump);
    animateMarkerJump = false;
    const stage = stages[index],
      previous = stages[Math.max(0, index - 1)];
    const t = ease(local / 0.58);
    const [cx, cy, width] = stage.camera.map((value, i) => lerp(previous.camera[i], value, t));
    svg.setAttribute('viewBox', `${cx - width / 2} ${cy - width * 0.225} ${width} ${width * 0.45}`);
    const mobileCamera = mobileCameras[index].map((value, i) =>
      lerp(mobileCameras[Math.max(0, index - 1)][i], value, t),
    );
    const [mx, my, mw] = mobileCamera;
    mobileSvg.setAttribute('viewBox', `${mx - mw / 2} ${my - mw * 0.57} ${mw} ${mw * 1.14}`);
    context.style.opacity = String(
      index === 0 ? 0 : index === 1 ? ease(local / 0.4) : index === 2 ? 1 - ease(local / 0.6) : 0,
    );
    insight.style.opacity = String(
      index < 3 ? 0 : index === 3 ? ease(local / 0.5) : 1 - ease(local / 0.5),
    );
    actions.style.opacity = String(index < 4 ? 0 : ease(local / 0.5));
    sources.style.opacity = String(index < 2 ? 1 : index === 2 ? 1 - ease(local / 0.6) : 0);
    inside.style.opacity = String(index < 2 ? 0 : index === 2 ? ease(local / 0.7) : 1);
    for (const [mobile, desktop] of [
      [mobileContext, context],
      [mobileSources, sources],
      [mobileInside, inside],
      [mobileInsight, insight],
      [mobileActions, actions],
    ])
      mobile.style.opacity = desktop.style.opacity;
    target.setAttribute('r', 10 + (index === 1 ? ease(local) * 8 : 0));
    circles.forEach((_, i) => {
      context.querySelector(`.journey-context-circle-${i}`).style.opacity = String(
        index === 1 ? 0.25 + 0.75 * ease((local - i * 0.08) / 0.35) : 1,
      );
    });
    if (lastStage !== index) {
      title.textContent = stage.title;
      description.textContent = stage.description;
      buttons.forEach((button, i) =>
        button.setAttribute('aria-current', i === stage.chapter ? 'step' : 'false'),
      );
      section.dataset.journeyStage = String(index);
      lastStage = index;
    }
  }
  // Particle motion uses elapsed time; scrolling only positions the camera.
  let motionFrame = 0,
    lastTime = null,
    distance = 0;
  let particlesPaused = false;
  const pauseButton = section.querySelector('[data-journey-pause]');
  pauseButton.hidden = compact.matches;
  compact.addEventListener('change', () => {
    pauseButton.hidden = compact.matches;
  });
  pauseButton.addEventListener('click', () => {
    particlesPaused = !particlesPaused;
    pauseButton.setAttribute('aria-pressed', String(particlesPaused));
    update();
  });
  function positionParticles() {
    paths.forEach(({ path, dots, length }, row) => {
      if ((path.ownerSVGElement === mobileSvg) !== narrow.matches) return;
      dots.forEach((dot, i) => {
        const at = ((i / dots.length + row * 0.073) * length + distance) % length;
        const point = path.getPointAtLength(at);
        dot.setAttribute('cx', point.x);
        dot.setAttribute('cy', point.y);
      });
    });
  }
  function animate(time) {
    if (lastTime !== null) distance += Math.min(time - lastTime, 64) * 0.075;
    lastTime = time;
    positionParticles();
    motionFrame = requestAnimationFrame(animate);
  }
  function setMotion(active) {
    if (active && !motionFrame) motionFrame = requestAnimationFrame(animate);
    if (!active && motionFrame) {
      cancelAnimationFrame(motionFrame);
      motionFrame = 0;
      lastTime = null;
    }
  }
  function update() {
    queued = false;
    const rect = section.getBoundingClientRect(),
      header = headerHeight();
    section.style.setProperty('--journey-header', `${header}px`);
    const visible =
      !compact.matches && !document.hidden && rect.top < innerHeight && rect.bottom > header;
    setMotion(visible && !particlesPaused);
    if (!visible) return;
    render((header - rect.top) / Math.max(1, section.offsetHeight - innerHeight + header));
  }
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      animateMarkerJump = true;
      const top = section.getBoundingClientRect().top + scrollY - headerHeight();
      const travel = section.offsetHeight - innerHeight + headerHeight();
      scrollTo({
        top: top + ((Number(button.dataset.journeyStage) + 0.8) / stages.length) * travel,
        behavior: 'instant',
      });
      update();
    }),
  );
  section.classList.add('journey-ready');
  render(0);
  positionParticles();
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', schedule);
  compact.addEventListener('change', schedule);
  update();
}
