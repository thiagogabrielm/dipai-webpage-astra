// A still illustration in fixed world coordinates: fine intersecting surfaces,
// an irregular foreground network, and a soft pool of light at their crossing.
// Resizing crops the scene. Only layout and theme changes repaint the canvas.
const cta = document.querySelector('.neural-cta');
const closingSection = cta || document.querySelector('[data-footer-network-section]');
const footer = document.querySelector('.network-footer-page .site-footer');

if (footer) {
  // Crop the same fixed-scale mesh into the footer when there is no CTA above it.
  let sceneOffset = closingSection ? 0 : 400;
  const canvas = document.createElement('canvas');
  canvas.className = 'footer-network';
  canvas.setAttribute('aria-hidden', 'true');
  footer.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const mask = document.createElement('canvas');
  const maskContext = mask.getContext('2d');
  const TAU = Math.PI * 2;
  let width = 0,
    height = 0;

  const smooth = (value) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  const random = (row, col, salt = 0) => {
    let n =
      Math.imul(row + 113, 374761393) ^
      Math.imul(col + 137, 668265263) ^
      Math.imul(salt + 7194, 1274126177);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
  const depth = (x) => 1.55 - 0.9 * smooth((x + 1100) / 2200);
  const focus = (x, y) => Math.exp(-(((x - 60) / 470) ** 2 + ((y - 488) / 115) ** 2));

  // Deliberately uneven anchors give the crest its silhouette. The larger gaps
  // and taller triangles at the left read as a closer plane, receding rightward.
  const crest = [
    [-1210, 210],
    [-995, 260],
    [-842, 329],
    [-690, 368],
    [-522, 407],
    [-321, 447],
    [-156, 411],
    [-67, 456],
    [20, 501],
    [96, 471],
    [192, 430],
    [304, 456],
    [453, 472],
    [551, 381],
    [635, 445],
    [718, 414],
    [804, 433],
    [866, 314],
    [951, 411],
    [1030, 334],
    [1210, 235],
    [-1210, 490],
    [-1010, 418],
    [-850, 516],
    [-620, 566],
    [-400, 532],
    [-237, 471],
    [-115, 484],
    [30, 540],
    [129, 504],
    [219, 506],
    [313, 535],
    [444, 552],
    [530, 488],
    [621, 487],
    [700, 537],
    [801, 472],
    [897, 450],
    [992, 482],
    [1140, 435],
    [1290, 420],
    [-1240, 770],
    [-930, 740],
    [-671, 704],
    [-422, 649],
    [-286, 620],
    [-107, 675],
    [91, 636],
    [204, 670],
    [359, 584],
    [437, 632],
    [534, 579],
    [643, 648],
    [775, 619],
    [868, 571],
    [969, 622],
    [1120, 575],
    [1280, 600],
  ];

  // Delaunay triangles connect nearby anchors without the repeated diamonds
  // of a regular grid. A second, finer layer supplies the more distant detail.
  function triangulate(points) {
    const vertices = [
      ...points,
      { x: -20000, y: -10000 },
      { x: 20000, y: -10000 },
      { x: 0, y: 30000 },
    ];
    function triangle(a, b, c) {
      const p = vertices[a],
        q = vertices[b],
        r = vertices[c];
      const d = 2 * (p.x * (q.y - r.y) + q.x * (r.y - p.y) + r.x * (p.y - q.y));
      if (Math.abs(d) < 0.001) return null;
      const pp = p.x * p.x + p.y * p.y,
        qq = q.x * q.x + q.y * q.y,
        rr = r.x * r.x + r.y * r.y;
      const x = (pp * (q.y - r.y) + qq * (r.y - p.y) + rr * (p.y - q.y)) / d;
      const y = (pp * (r.x - q.x) + qq * (p.x - r.x) + rr * (q.x - p.x)) / d;
      return { a, b, c, x, y, radius: (p.x - x) ** 2 + (p.y - y) ** 2 };
    }
    let triangles = [triangle(points.length, points.length + 1, points.length + 2)];
    points.forEach((p, index) => {
      const boundary = new Map();
      triangles = triangles.filter((t) => {
        if ((p.x - t.x) ** 2 + (p.y - t.y) ** 2 > t.radius) return true;
        [
          [t.a, t.b],
          [t.b, t.c],
          [t.c, t.a],
        ].forEach(([a, b]) => {
          const key = `${Math.min(a, b)}:${Math.max(a, b)}`;
          if (boundary.has(key)) boundary.delete(key);
          else boundary.set(key, [a, b]);
        });
        return false;
      });
      boundary.forEach(([a, b]) => {
        const t = triangle(a, b, index);
        if (t) triangles.push(t);
      });
    });
    return triangles.filter((t) => Math.max(t.a, t.b, t.c) < points.length);
  }

  function makeScene() {
    const points = crest.map(([x, y], i) => ({ x, y, seed: random(0, i, 7) }));
    const extent = Math.max(1400, width / 2 + 220);
    // The fixed minimum depth keeps topology identical in desktop/mobile crops.
    const rows = Math.ceil(Math.max(1800, height + sceneOffset + 240) / 135);
    for (let row = 0; row < rows; row++) {
      for (let col = -14; col <= 25; col++) {
        const u = (col + (row % 2) * 0.45 + (random(row, col) - 0.5) * 0.75) / 18;
        const x =
          u < 0
            ? -1120 + u * 3500
            : u > 1
              ? 1120 + (u - 1) * 1100
              : -1120 + (2240 * (1 - Math.exp(-1.15 * u))) / (1 - Math.exp(-1.15));
        if (Math.abs(x) > extent) continue;
        const y = 810 + row * 135 + (random(row, col, 1) - 0.5) * 110;
        points.push({ x, y, seed: random(row, col, 2) });
        // Extend the composition on unusually wide displays, without scaling it.
        if (Math.abs(x) > 1260 && row < 4)
          points.push({ x, y: y - 600, seed: random(row, col, 3) });
      }
    }
    return { points, triangles: triangulate(points) };
  }

  function glow(x, y, radius, aspect, rgb, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, aspect);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(${rgb},${alpha})`);
    gradient.addColorStop(0.28, `rgba(${rgb},${alpha * 0.5})`);
    gradient.addColorStop(0.65, `rgba(${rgb},${alpha * 0.13})`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.restore();
  }

  function drawStrands(dark) {
    const extent = Math.max(1460, width / 2 + 40);
    // Sheets twist through each other. Signed strand spacing lets the surfaces
    // turn edge-on, producing luminous crossings instead of parallel stripes.
    for (let sheet = 0; sheet < 3; sheet++) {
      const count = [58, 46, 30][sheet];
      for (let line = 0; line < count; line++) {
        const offset = line - (count - 1) / 2;
        const alpha =
          (0.06 + 0.055 * Math.cos((offset / count) * Math.PI)) *
          (sheet === 2 ? 0.45 : 1) *
          (dark ? 1 : 0.55);
        ctx.strokeStyle = `rgba(${sheet === 1 ? '136,205,231' : '81,149,205'},${alpha})`;
        ctx.lineWidth = sheet === 2 ? 0.5 : 0.65;
        ctx.beginPath();
        for (let x = -extent; x <= extent; x += 12) {
          const u = x / 960;
          const y =
            sheet === 0
              ? 477 - 125 * u * u + 36 * u + 16 * Math.sin(u * 2) + offset * (1.1 + 3.4 * u)
              : sheet === 1
                ? 472 - 56 * u + 15 * u * u - 14 * Math.sin(u * 2) + offset * (0.25 - 2.25 * u)
                : 455 + 50 * u - 100 * u * u + offset * (0.9 + 2.1 * u);
          if (x === -extent) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }

  function drawNetwork(scene, dark) {
    const { points, triangles } = scene;
    const edges = new Set();
    triangles.forEach((t, i) => {
      const a = points[t.a],
        b = points[t.b],
        c = points[t.c];
      if (Math.min(a.y, b.y, c.y) > height + sceneOffset + 20) return;
      if (i % 7 === 0) {
        ctx.fillStyle = `rgba(119,185,218,${dark ? 0.018 : 0.012})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fill();
      }
      [
        [t.a, t.b],
        [t.b, t.c],
        [t.c, t.a],
      ].forEach(([ai, bi]) => {
        const key = `${Math.min(ai, bi)}:${Math.max(ai, bi)}`;
        if (edges.has(key)) return;
        edges.add(key);
        const p = points[ai],
          q = points[bi];
        const distance = Math.hypot(p.x - q.x, p.y - q.y);
        const near = (depth(p.x) + depth(q.x)) / 2;
        if (
          distance > 420 * near ||
          Math.max(p.x, q.x) < -width / 2 - 30 ||
          Math.min(p.x, q.x) > width / 2 + 30
        )
          return;
        const light = Math.max(focus(p.x, p.y), focus(q.x, q.y));
        const alpha = (0.1 + 0.075 * near + light * 0.25) * (dark ? 1 : 0.58);
        ctx.strokeStyle = `rgba(${dark ? '98,167,211' : '60,114,151'},${alpha})`;
        ctx.lineWidth = 0.45 + near * 0.35;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      });
    });
    // Small distant connections underneath the main web break up large cells.
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.y > height + sceneOffset + 80 || p.seed < 0.62) continue;
      const q = points[(i + 9) % points.length];
      if (Math.hypot(q.x - p.x, q.y - p.y) > 700 || Math.abs(q.y - p.y) > 330) continue;
      ctx.strokeStyle = `rgba(102,168,210,${dark ? 0.08 : 0.045})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }
    points.forEach((p) => {
      if (p.x < -width / 2 - 20 || p.x > width / 2 + 20 || p.y > height + sceneOffset + 20) return;
      const near = depth(p.x),
        light = focus(p.x, p.y);
      const radius = (0.85 + p.seed * 1.7) * near + light * 1.7;
      const alpha = (0.34 + p.seed * 0.29 + light * 0.35) * (dark ? 1 : 0.7);
      if (light > 0.18 || p.seed > 0.76) {
        glow(p.x, p.y, radius * 7, 0.85, dark ? '88,183,227' : '83,148,180', alpha * 0.35);
        glow(p.x, p.y, radius * 2.5, 0.85, '142,225,247', alpha * 0.24);
      }
      ctx.fillStyle = `rgba(${dark ? '155,216,237' : '61,126,158'},${alpha})`;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, radius, radius * 0.84, -0.13, 0, TAU);
      ctx.fill();
      if (light > 0.6) {
        ctx.fillStyle = `rgba(${dark ? '214,247,251' : '49,111,149'},${alpha * 0.75})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 0.43, 0, TAU);
        ctx.fill();
      }
    });
  }

  function draw() {
    if (!width) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    // Soften the mobile illustration without fading its shared base colour.
    ctx.globalAlpha =
      parseFloat(getComputedStyle(canvas).getPropertyValue('--network-opacity')) || 1;
    ctx.translate(width / 2, -sceneOffset);
    // The brightest crossing remains above the footer panel, in the clear space
    // below the buttons; the wider illumination continues behind the footer.
    glow(50, 496, 640, 0.48, dark ? '50,121,196' : '98,157,190', dark ? 0.23 : 0.1);
    glow(55, 483, 250, 0.32, dark ? '104,204,230' : '91,159,184', dark ? 0.14 : 0.065);
    drawStrands(dark);
    drawNetwork(makeScene(), dark);
    ctx.restore();

    // Fade only the top edge of the shared illustration, without cutting out
    // a separate patch behind the CTA content.
    maskContext.clearRect(0, 0, width, height);
    const start = closingSection ? 90 : 0;
    const fade = maskContext.createLinearGradient(0, start, 0, start + 75);
    fade.addColorStop(0, 'rgba(255,255,255,0)');
    fade.addColorStop(1, '#fff');
    maskContext.fillStyle = fade;
    maskContext.fillRect(0, 0, width, height);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0, width, height);
    ctx.restore();
  }

  function resize() {
    width = footer.clientWidth;
    height = footer.offsetHeight + (closingSection?.offsetHeight || 0);
    // Keep the mesh crest near the footer when the preceding content is taller
    // than a CTA, without scaling or packing the nodes closer together.
    sceneOffset = cta ? 0 : closingSection ? 540 - closingSection.offsetHeight : 400;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = `${height}px`;
    mask.width = canvas.width;
    mask.height = canvas.height;
    maskContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  const layout = new ResizeObserver(resize);
  if (closingSection) layout.observe(closingSection);
  layout.observe(footer);
  const theme = new MutationObserver(draw);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.fonts.ready.then(resize);
  resize();
}
