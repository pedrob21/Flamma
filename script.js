/* ---------- Topbar aparece depois da primeira dobra ---------- */
const topbar = document.querySelector('.topbar');
const hero = document.querySelector('.hero');
new IntersectionObserver(([entry]) => {
  topbar.classList.toggle('is-visible', !entry.isIntersecting);
}, { threshold: 0.15 }).observe(hero);

/* ---------- Revelar ao rolar ---------- */
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      revealer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
  revealer.observe(el);
});

/* ---------- Faíscas subindo na primeira dobra ---------- */
(function embers() {
  const canvas = document.querySelector('.hero__embers');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas || reduce) return;
  const ctx = canvas.getContext('2d');
  const colors = ['250,104,0', '252,6,216', '255,239,253'];
  let w, h, dpr, particles = [], running = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(70, w / 18));
    particles = Array.from({ length: count }, () => spawn(true));
  }
  function spawn(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: Math.random() * 2.2 + 0.6,
      vy: Math.random() * 0.6 + 0.25,
      drift: Math.random() * Math.PI * 2,
      life: Math.random() * 0.6 + 0.4,
      c: colors[Math.random() < 0.45 ? 0 : Math.random() < 0.8 ? 1 : 2],
    };
  }
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particles) {
      p.y -= p.vy;
      p.drift += 0.02;
      p.x += Math.sin(p.drift) * 0.35;
      const a = Math.max(0, Math.min(1, p.y / h)) * p.life;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(${p.c},${a})`);
      g.addColorStop(1, `rgba(${p.c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
      if (p.y < -10) Object.assign(p, spawn(false));
    }
    requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => {
    const was = running; running = e.isIntersecting;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(canvas);
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
