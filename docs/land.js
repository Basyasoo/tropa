// Draws the app's dotted globe: earth.bin holds unit-sphere points as little-endian Int16 x, y, z.
(async () => {
  const canvas = document.getElementById('globe');
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buffer = await (await fetch('earth.bin')).arrayBuffer();
  const raw = new Int16Array(buffer);
  const count = raw.length / 3;
  const pts = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i++) pts[i] = raw[i] / 32767;

  let width = 0, height = 0, angle = 0.9, tilt = 0.55, dragging = false, lastX = 0, speed = 0.0012, visible = true;
  const size = () => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const radius = Math.min(width * 0.47, height * 0.98);
    const cx = width / 2, cy = radius * 1.02;
    const sinA = Math.sin(angle), cosA = Math.cos(angle), sinT = Math.sin(tilt), cosT = Math.cos(tilt);
    for (let i = 0; i < count; i++) {
      const x = pts[i * 3], y = pts[i * 3 + 1], z = pts[i * 3 + 2];
      const rx = x * cosA + z * sinA;
      const rz = z * cosA - x * sinA;
      const ry = y * cosT - rz * sinT;
      const depth = y * sinT + rz * cosT;
      if (depth < 0) continue;
      const px = cx + rx * radius, py = cy - ry * radius;
      if (py > height + 2) continue;
      ctx.fillStyle = `rgba(${176 - depth * 40}, ${232 - depth * 20}, ${120 - depth * 40}, ${0.28 + depth * 0.72})`;
      const dot = 1.1 + depth * 1.1;
      ctx.fillRect(px, py, dot, dot);
    }
  };
  const frame = () => {
    if (visible && !dragging) {
      angle += speed;
      draw();
    }
    if (!still) requestAnimationFrame(frame);
  };
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    angle += (e.clientX - lastX) * 0.006;
    lastX = e.clientX;
    draw();
  });
  const release = () => { dragging = false; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  addEventListener('resize', () => { size(); draw(); });
  size();
  draw();
  frame();
})();

fetch('https://github.com/Basyasoo/tropa/releases/latest/download/version.json')
  .then(r => r.json())
  .then(d => { document.getElementById('ver').textContent = d.version; })
  .catch(() => {});
