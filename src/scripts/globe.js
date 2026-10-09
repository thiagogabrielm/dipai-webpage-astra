import { geoOrthographic, geoPath, geoGraticule, geoDistance } from 'd3-geo';

/**
 * Draw a rotatable orthographic globe using the supplied vessel-position snapshot.
 * Coordinates are a static snapshot supplied on 7 October 2026, not a live feed.
 * @param {HTMLCanvasElement} canvas Globe drawing surface.
 * @returns {Promise<() => void>} Cleanup for animation, resize and pointer listeners.
 */
export async function mountGlobe(canvas) {
  const context = canvas.getContext('2d');

  if (!context) return () => {};
  const response = await fetch('/assets/land.geojson');
  if (!response.ok) throw new Error('Unable to load the local globe map');
  const land = await response.json();
  const projection = geoOrthographic().rotate([20, -25]).clipAngle(90);
  const path = geoPath(projection, context);
  const graticule = geoGraticule().step([20, 20])();
  const regions = {
    europe: { rotation: [-5, -58], label: 'Europe' },
    africa: { rotation: [-10, 5], label: 'Africa' },
    oceania: { rotation: [-143, 28], label: 'Oceania' },
    'north-america': { rotation: [95, -35], label: 'North America' },
    'south-america': { rotation: [55, 20], label: 'South America' },
    atlantic: { rotation: [20, -25], label: 'North Atlantic · fleet concentration' },
    asia: { rotation: [-114, -15], label: 'Asia' },
    americas: { rotation: [75, -5], label: 'Americas · connected operations' },
  };
  // 240 valid vessel positions from the supplied snapshot; seven entries had no position.
  // D3 expects [longitude, latitude]. Preserve one marker per vessel, including shared positions.
  const vessels = [
    [-40.33771896, -20.32265282],
    [-39.8324585, -21.48430443],
    [4.45561838, 51.89094543],
    [-42.77500153, -25.55333328],
    [-41.15999985, -22.82166672],
    [1.84000003, 58.48166656],
    [-67.72024536, -52.94416809],
    [-40.48833466, -22.51833344],
    [-43.13000107, -22.87333298],
    [-39.96968079, -22.21765518],
    [2.29333329, 57.15999985],
    [1.73617995, 60.80926132],
    [-35.09869003, -13.25697994],
    [113.60559845, 4.95419502],
    [-0.20833333, 59.14166641],
    [-68.40499878, -50.11666489],
    [148.277435302734, -38.4075012207031],
    [147.26499939, -38.70833206],
    [3.39507, 56.612605],
    [4.600717, 59.079833],
    [116.74982452, -20.63141632],
    [6.548765, 64.84604166666666],
    [-11.443, 38.989535],
    [-42.35333252, -24.79000092],
    [3.20253, 56.55917666666667],
    [3.216825, 56.5476],
    [-1.743691666666667, 58.304885],
    [-43.13053894, -22.86304092],
    [146.3837766666667, -38.71017833333333],
    [10.98894283333333, -6.130397],
    [-41.604135, -23.63988],
    [-43.13000107, -22.86499977],
    [2.508848, 60.622535],
    [-56.99681473, 8.01391983],
    [-42.48666763, -24.54833412],
    [-43.13177872, -22.86232758],
    [-43.14093781, -22.92398453],
    [-39.98833466, -21.27000046],
    [-42.4907, -24.59643333333333],
    [-40.38782883, -22.45261574],
    [-39.94198608, -22.05109406],
    [103.67500305, 1.29333329],
    [-42.50500107, -24.60055],
    [-48.026065, 46.75611666666666],
    [118.90632, 11.642205],
    [-42.45166779, -24.74500084],
    [-42.85518833333333, -25.66015833333333],
    [114.89146423, -20.42479134],
    [5.58464003, 58.91911316],
    [5.3094883, 60.38782501],
    [-15.411420800000002, 28.150720600000003],
    [30.7137394, 43.86500168],
    [-2.38281822, 56.73155212],
    [-56.88499832, 8.00500011],
    [-48.73016357, 46.70580673],
    [-52.69975662, 47.56865692],
    [-48.06448746, 46.8013649],
    [-42.70066833, -24.31195831],
    [126.16833496, 35.32833481],
    [-48.49666595, 46.45999908],
    [-48.52000046, 46.48166656],
    [-48.91603088, 46.95449448],
    [-43.12221146, -22.87010384],
    [-56.6566658, 7.86833334],
    [-39.9683342, -22.13999939],
    [-43.13922119, -22.86617851],
    [-58.17333221, 6.78666687],
    [117.57165527, -35.23023224],
    [-42.89333344, -25.14666748],
    [-42.47166824, -24.65500069],
    [-90.21759033, 29.12976265],
    [-39.81808472, -21.9709549],
    [5.31127167, 60.40110779],
    [-56.81999969, 8.10666656],
    [6.917678, 62.583142],
    [3.557236666666666, 54.85689833333333],
    [-1.00728166, 54.65159988],
    [3.57402658, 61.0389328],
    [148.277404785156, -38.4074974060059],
    [-61.65784073, 10.64241505],
    [-77.054745, -12.04703833333333],
    [5.25445652, 60.39338684],
    [5.29771996, 59.33877182],
    [-42.6986351, -24.30866623],
    [120.50160217, 24.2414608],
    [120.501091, 24.24029922],
    [-43.18328476, -22.85876465],
    [11.85058498, -5.25574684],
    [-42.34810257, -24.78669739],
    [-39.97000122, -22.12833405],
    [-40.40884781, -20.98440361],
    [-56.75666809, 7.88000011],
    [31.90597343, 41.69167328],
    [33.64774704, 44.71781158],
    [5.29662657, 59.33834839],
    [-2.46282172, 43.42220688],
    [-43.12917709, -22.86473274],
    [-42.82333374, -25.5466671],
    [2.37791324, 59.89001846],
    [116.57833099, -20.60666656],
    [-41.78551865, -22.98858261],
    [-56.80666733, 7.98999977],
    [-2.07999992, 4.63166666],
    [116.58000183, -20.6016674],
    [113.90833282, -20.92499924],
    [-42.14873886, -24.54649544],
    [-39.96333313, -22.13999939],
    [5.01754856, 60.4115181],
    [10.96713352, -6.11770678],
    [103.72783661, 1.22033334],
    [-40.25, -22.47833252],
    [-41.88985443, -24.11432457],
    [-40.13999939, -22.60666656],
    [-43.12833405, -22.86000061],
    [-23.5985508, 65.68421936],
    [-10.79362297, 51.97259903],
    [-1.10196662, 60.33491516],
    [5.59056664, 59.68521881],
    [5.91386175, 59.19712067],
    [-5.288, 56.0803],
    [11.40462017, 64.75041199],
    [5.538137, 59.54643],
    [11.29804993, 64.88326],
    [8.562907, 63.710508],
    [-5.36010504, 55.96366119],
    [22.9285965, 70.13955688],
    [11.62024021, 65.01605988],
    [5.38418, 61.07704544],
    [20.54829025, 70.01245117],
    [21.85453987, 69.887146],
    [12.368943, 65.090745],
    [146.97570801, -43.1595192],
    [23.653998, 70.628102],
    [-5.31516314, 55.81809235],
    [146.97627258, -43.16076279],
    [15.366318, 67.527905],
    [17.93299103, 69.28146362],
    [-5.08012486, 58.39903259],
    [6.09487343, 62.37369156],
    [12.54554, 65.521933],
    [15.8404, 67.6956],
    [6.65613317, 62.63176727],
    [8.14118671, 53.51685333],
    [23.64059067, 70.62729645],
    [6.44719982, 62.59127426],
    [1.82333338, 58.83333206],
    [4.8833065, 52.40562057],
    [-79.56908417, 8.83349705],
    [6.26516819, 62.5529213],
    [141.00166321, 13.34500027],
    [103.6843338, 1.29878831],
    [-2.44021511, 50.57178497],
    [107.10333252, 10.39999962],
    [83.38048553, -17.44775963],
    [2.90244675, 52.68037415],
    [107.10333252, 10.39999962],
    [7.19789982, 53.33586121],
    [6.20050001, 54.35644531],
    [-0.27125335, 53.74496841],
    [107.10333252, 10.39999962],
    [-1.51240504, 55.13301468],
    [4.58460855, 52.46359253],
    [7.72768831, 54.52531815],
    [9.835627, 64.786677],
    [3.73623323, 52.6084938],
    [133.75822449, 34.47086716],
    [120.52027893, 24.26738739],
    [0.71045834, 53.46617126],
    [-38.97499847, -2.97166657],
    [-0.67000002, -12.75166702],
    [6.9026351, 62.8170929],
    [120.52648163, 24.28696823],
    [2.25666666, 61.52000046],
    [2.44666672, 58.19166565],
    [0.40166667, 54.57833481],
    [-2.08368492, 57.13988113],
    [5.67071342, 62.32134628],
    [-3.6833334, 61.0316658],
    [1.75778663, 52.47409821],
    [7.20387506, 53.33844376],
    [4.29107857, 51.88771439],
    [2.57497835, 60.12860107],
    [2.10480332, 61.14720535],
    [3.36565495, 56.25008774],
    [2.2349999, 58.67166519],
    [-43.1034317, -23.01190567],
    [7.016666666666667, 65.55],
    [5.07208824, 61.61298752],
    [2.55500007, 59.22999954],
    [12.68109131, 33.9230957],
    [5.25128651, 59.42208099],
    [-3.70333338, 61.0616684],
    [6.79166651, 65.14333344],
    [32.08377457, 41.59017944],
    [6.20051479, 54.35644531],
    [7.19789982, 53.33586121],
    [-38.97499847, -2.97166657],
    [2.5169042222222227, 58.86911683333334],
    [5.30879831, 60.40142059],
    [5.66398811, 58.99990845],
    [2.41195989, 59.89565277],
    [4.69858837, 61.90262604],
    [32.06639481, 41.58636093],
    [3.89308167, 56.28240585],
    [1.12896168, 50.15045929],
    [5.31694317, 60.3988533],
    [1.10028338, 60.18155289],
    [-97.89315033, 22.22019577],
    [7.97034168, 58.11518097],
    [-0.52499998, 58.16833496],
    [5.58662176, 58.92871857],
    [-94.1784668, 27.02440262],
    [-4.52166653, 4.93833351],
    [-92.80500031, 27.98500061],
    [-1.86984336, 59.77883911],
    [-8.97917366, -2.49479842],
    [-2.17062497, 56.50770569],
    [29.67342758, 34.52108002],
    [14.88345623, -35.92629623],
    [10.76788521, 54.71413422],
    [10.58725834, 59.30863953],
    [7.98667145, 58.14250183],
    [10.09543991, 58.85368729],
    [10.22727013, 59.12606049],
    [147.34133911, -42.88128662],
    [-5.82720518, 57.00843811],
    [174.05332947, -41.2266655],
    [-13.92068958, 65.01145172],
    [-24.01254082, 65.65514374],
    [6.07099152, 60.15306091],
    [-14.27999973, 64.65666962],
    [6.12036324, 59.22072601],
    [-126.32499695, 49.63833237],
    [6.05133009, 60.15501404],
    [-3.86942339, 58.85443497],
    [6.09196329, 62.30680084],
    [-20.22942543, 63.44224167],
    [-127.48781586, 50.72262955],
    [7.73305511, 63.11230087],
    [147.38839722, -42.93365479],
  ];
  let width = 0,
    height = 0,
    frame = 0,
    visible = false,
    destroyed = false;
  let drag = null,
    regionTransition = null,
    lastTime = 0,
    userUntil = 0;
  const initialRegion = document.querySelector("[data-region][aria-pressed='true']")?.dataset
    .region;
  let rotation = [...(regions[initialRegion]?.rotation || [20, -25])];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const label = document.querySelector('#globe-location');

  /** Match the physical backing pixels to the displayed canvas. @returns {void} */
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    projection.translate([width / 2, height / 2 - 10]).scale(Math.min(width, height) * 0.43);
    draw();
  }

  /** Paint the sphere, geographic land, graticule and visible fleet markers. @returns {void} */
  function draw() {
    const cx = width / 2,
      cy = height / 2 - 10,
      radius = projection.scale();
    projection.rotate(rotation);
    context.clearRect(0, 0, width, height);
    context.save();
    context.shadowBlur = 28;
    context.shadowColor = '#1c2b3922';
    context.shadowOffsetY = 18;
    const ocean = context.createRadialGradient(
      cx - radius * 0.5,
      cy - radius * 0.5,
      0,
      cx,
      cy,
      radius * 1.15,
    );
    ocean.addColorStop(0, '#435f76');
    ocean.addColorStop(1, '#182a39');
    context.beginPath();
    path({ type: 'Sphere' });
    context.fillStyle = ocean;
    context.fill();
    context.restore();
    context.beginPath();
    path(land);
    context.fillStyle = '#6b879b';
    context.fill();
    context.strokeStyle = '#a1b6c333';
    context.lineWidth = 0.5;
    context.stroke();
    context.beginPath();
    path(graticule);
    context.strokeStyle = '#cdddea17';
    context.lineWidth = 0.6;
    context.stroke();
    const center = [-rotation[0], -rotation[1]];
    for (const location of vessels) {
      if (geoDistance(location, center) >= Math.PI / 2) continue;
      const [x, y] = projection(location);
      context.beginPath();
      context.arc(x, y, 1.9, 0, Math.PI * 2);
      context.fillStyle = '#ffd600';
      context.fill();
    }
    // A thin ring reinforces the same fine-line framing used throughout the page.
    context.beginPath();
    context.arc(cx, cy, radius + 12, 0, Math.PI * 2);
    context.strokeStyle = '#34475e15';
    context.lineWidth = 1;
    context.stroke();
  }

  /** Ease continent changes before resuming the gentle ambient rotation. @returns {void} */
  function tick(time) {
    frame = 0;
    if (destroyed || !visible || document.hidden) return;
    if (regionTransition) {
      const { from, to, start, duration } = regionTransition;
      const progress = reducedMotion.matches
        ? 1
        : Math.max(0, Math.min(1, (time - start) / duration));
      const eased = progress * progress * (3 - 2 * progress);
      rotation = from.map((angle, index) => angle + (to[index] - angle) * eased);
      if (progress === 1) regionTransition = null;
      draw();
    } else if (
      !drag &&
      time > userUntil &&
      !reducedMotion.matches &&
      !document.body.classList.contains('motion-paused')
    ) {
      rotation[0] += Math.min(time - lastTime, 40) * 0.0008;
      draw();
    }
    lastTime = time;
    frame = requestAnimationFrame(tick);
  }

  /** Start a drag without hijacking vertical page scrolling on touch screens. @returns {void} */
  function pointerDown(event) {
    regionTransition = null;
    drag = { x: event.clientX, y: event.clientY, rotation: [...rotation] };
    canvas.setPointerCapture(event.pointerId);
  }
  /** Rotate relative to the drag origin so motion remains stable at all screen sizes. @returns {void} */
  function pointerMove(event) {
    if (!drag) return;
    rotation = [
      drag.rotation[0] + (event.clientX - drag.x) * 0.35,
      Math.max(-70, Math.min(70, drag.rotation[1] - (event.clientY - drag.y) * 0.25)),
    ];
    userUntil = performance.now() + 12000;
    if (label) label.textContent = 'Your fleet · a connected global view';
    draw();
  }
  /** Finish or cancel pointer interaction. @returns {void} */
  function pointerUp() {
    drag = null;
  }
  /** Region buttons provide keyboard and mobile alternatives to dragging. @returns {void} */
  function chooseRegion(event) {
    const region = regions[event.currentTarget.dataset.region];
    if (!region) return;
    const now = performance.now();
    const duration = 1200;
    // Keep north upright and cross the date line by the shortest route.
    const longitudeDelta = ((((region.rotation[0] - rotation[0]) % 360) + 540) % 360) - 180;
    const target = [rotation[0] + longitudeDelta, region.rotation[1]];
    drag = null;
    regionTransition = reducedMotion.matches
      ? null
      : { from: [...rotation], to: target, start: now, duration };
    if (reducedMotion.matches) rotation = target;
    if (label) label.textContent = region.label;
    userUntil = now + (regionTransition ? duration : 0) + 12000;
    document
      .querySelectorAll('[data-region]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button === event.currentTarget)),
      );
    draw();
  }
  /** Restart after the browser tab becomes visible. @returns {void} */
  function resume() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  });
  const resizeObserver = new ResizeObserver(resize);
  observer.observe(canvas);
  resizeObserver.observe(canvas);
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointercancel', pointerUp);
  document.addEventListener('visibilitychange', resume);
  document
    .querySelectorAll('[data-region]')
    .forEach((button) => button.addEventListener('click', chooseRegion));
  resize();
  return () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    canvas.removeEventListener('pointerdown', pointerDown);
    canvas.removeEventListener('pointermove', pointerMove);
    canvas.removeEventListener('pointerup', pointerUp);
    canvas.removeEventListener('pointercancel', pointerUp);
    document.removeEventListener('visibilitychange', resume);
    document
      .querySelectorAll('[data-region]')
      .forEach((button) => button.removeEventListener('click', chooseRegion));
  };
}
