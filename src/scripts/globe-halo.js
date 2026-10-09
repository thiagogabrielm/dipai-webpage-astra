const section = document.querySelector('#fleet');
const canvas = section?.querySelector('#fleet-globe');
if (canvas) {
  const stars = document.createElement('canvas');
  stars.className = 'fleet-stars';
  stars.setAttribute('aria-hidden', 'true');
  section.prepend(stars);
  const context = stars.getContext('2d');
  function drawStars(bounds, x, y, radius) {
    if (!context) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    stars.width = Math.round(bounds.width * ratio);
    stars.height = Math.round(bounds.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    // Stable positions prevent the background from flickering during resize or font loading.
    let seed = 419;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const copy = section.querySelector('.fleet-copy').getBoundingClientRect();
    const count = Math.min(110, Math.max(28, Math.round((bounds.width * bounds.height) / 11000)));
    for (let i = 0; i < count; i++) {
      const sx = random() * bounds.width,
        sy = random() * bounds.height;
      const distance = Math.hypot(sx - x, sy - y);
      if (distance < radius * 1.06) continue;
      const edge = Math.min(
        1,
        sx / 35,
        (bounds.width - sx) / 35,
        sy / 35,
        (bounds.height - sy) / 35,
      );
      const nearGlobe = Math.exp(-Math.pow((distance - radius * 1.45) / (radius * 1.2), 2));
      const behindCopy =
        sx > copy.left - bounds.left - 12 &&
        sx < copy.right - bounds.left + 12 &&
        sy > copy.top - bounds.top - 12 &&
        sy < copy.bottom - bounds.top + 12;
      const opacity = (0.12 + random() * 0.18 + nearGlobe * 0.13) * edge * (behindCopy ? 0.28 : 1);
      const size = 0.35 + random() * 0.55;
      context.fillStyle = `rgba(205, 221, 234, ${opacity})`;
      context.beginPath();
      context.arc(sx, sy, size, 0, Math.PI * 2);
      context.fill();
      if (i % 11 === 0 && !behindCopy) {
        const glow = context.createRadialGradient(sx, sy, 0, sx, sy, 3);
        glow.addColorStop(0, `rgba(205, 221, 234, ${opacity * 0.3})`);
        glow.addColorStop(1, 'rgba(205, 221, 234, 0)');
        context.fillStyle = glow;
        context.fillRect(sx - 3, sy - 3, 6, 6);
      }
    }
  }
  function positionHalo() {
    const bounds = section.getBoundingClientRect();
    const globe = canvas.getBoundingClientRect();
    // Match the projection's center and radius in globe.js, including its vertical offset.
    const x = globe.left - bounds.left + globe.width / 2;
    const y = globe.top - bounds.top + globe.height / 2 - 10;
    const radius = Math.min(globe.width, globe.height) * 0.43;
    const stops = {
      // A slight upper-left bias avoids an even, hard-edged ring.
      x: x - radius * 0.035,
      y: y - radius * 0.05,
      inner: radius * 0.55,
      rise: radius * 0.78,
      blue: radius * 0.93,
      shoulder: radius * 1.08,
      fade: radius * 1.32,
      outer: radius * 1.75,
      end: Math.max(radius * 2.8, (bounds.width - x) * 0.94),
    };
    drawStars(bounds, x, y, radius);
    for (const [name, value] of Object.entries(stops)) {
      section.style.setProperty(`--globe-halo-${name}`, `${value}px`);
    }
  }
  const observer = new ResizeObserver(positionHalo);
  observer.observe(section);
  observer.observe(canvas);
  positionHalo();
  document.fonts.ready.then(positionHalo);
  addEventListener('pagehide', () => observer.disconnect(), { once: true });
}
