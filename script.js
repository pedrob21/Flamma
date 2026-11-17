/* ==========================================================
   CONFIGURAÇÃO
   Cole aqui a URL do App da Web do Google Apps Script
   (veja o passo a passo em README.md).
   ========================================================== */
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyjBqksaLZGhYm61ItExzWB7LJikk_7O1GoFOn_DMnVa6RveMzoA823a_K8IZ4rOV34/exec';

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

/* ---------- Formulário do sorteio ---------- */
const form = document.getElementById('raffle-form');
const whats = document.getElementById('f-whats');
const insta = document.getElementById('f-insta');
const statusEl = form.querySelector('.form__status');

// Máscara (11) 91234-5678
whats.addEventListener('input', () => {
  const d = whats.value.replace(/\D/g, '').slice(0, 11);
  let out = d;
  if (d.length > 0) out = '(' + d.slice(0, 2);
  if (d.length >= 3) out += ') ' + d.slice(2, d.length === 11 ? 7 : 6);
  if (d.length >= 7) out += '-' + d.slice(d.length === 11 ? 7 : 6);
  whats.value = out;
});

// Instagram sem @ duplicado nem espaços
insta.addEventListener('input', () => {
  insta.value = insta.value.replace(/^@+/, '').replace(/\s/g, '').toLowerCase();
});

const rules = {
  nome: (v) => v.trim().split(/\s+/).length >= 2 || 'Informe nome e sobrenome.',
  whatsapp: (v) => {
    const n = v.replace(/\D/g, '').length;
    return n === 10 || n === 11 || 'Informe um WhatsApp válido com DDD.';
  },
  instagram: (v) => /^[a-z0-9._]{1,30}$/.test(v) || 'Informe um @ válido (letras, números, ponto ou _).',
  aceite: (_, el) => el.checked || 'É preciso aceitar para participar.',
};

function validateField(el) {
  const rule = rules[el.name];
  if (!rule) return true;
  const field = el.closest('.field');
  const errorEl = field.querySelector('.field__error');
  let result = (el.type !== 'checkbox' && !el.value.trim()) ? 'Campo obrigatório.' : rule(el.value, el);
  const ok = result === true;
  field.classList.toggle('is-invalid', !ok);
  el.setAttribute('aria-invalid', String(!ok));
  errorEl.textContent = ok ? '' : result;
  return ok;
}

form.querySelectorAll('input').forEach((el) => {
  el.addEventListener('blur', () => { if (el.value || el.type === 'checkbox') validateField(el); });
  el.addEventListener('change', () => { if (el.closest('.field').classList.contains('is-invalid')) validateField(el); });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = '';
  statusEl.classList.remove('is-error');

  const inputs = [...form.querySelectorAll('input[name]')];
  const firstInvalid = inputs.find((el) => !validateField(el));
  // valida todos para mostrar todos os erros
  inputs.forEach(validateField);
  if (firstInvalid) { firstInvalid.focus(); return; }

  if (!SHEETS_URL) {
    statusEl.textContent = 'O formulário ainda não está conectado à planilha. Configure SHEETS_URL em script.js.';
    statusEl.classList.add('is-error');
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  const label = btn.querySelector('.btn__label');
  btn.disabled = true;
  label.textContent = 'Enviando…';
  btn.insertAdjacentHTML('afterbegin', '<span class="spinner" aria-hidden="true"></span>');

  const data = new URLSearchParams({
    nome: form.nome.value.trim(),
    whatsapp: form.whatsapp.value.trim(),
    instagram: '@' + form.instagram.value.trim(),
    aceite: form.aceite.checked ? 'sim' : 'nao',
  });

  try {
    const res = await fetch(SHEETS_URL, { method: 'POST', body: data });
    const json = await res.json().catch(() => ({ ok: res.ok }));
    if (!json.ok) throw new Error(json.error || 'Erro ao enviar');
    showSuccess(json.duplicate);
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente de novo.';
    statusEl.classList.add('is-error');
    btn.disabled = false;
    label.textContent = 'Participar';
    btn.querySelector('.spinner')?.remove();
  }
});

function showSuccess(duplicate) {
  const first = form.nome.value.trim().split(/\s+/)[0];
  form.innerHTML = `
    <div class="form-success">
      <div class="form-success__icon"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <h3>${duplicate ? 'Você já está participando!' : 'Inscrição confirmada!'}</h3>
      <p>${duplicate
        ? 'Esse WhatsApp já estava cadastrado — sua participação continua valendo.'
        : `Boa sorte, ${escapeHtml(first)}! O resultado será divulgado após as apresentações.`}</p>
    </div>`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
