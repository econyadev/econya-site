// fichiers : /actifs/main-pages.js

// 1) année auto dans le footer
(() => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// 2) badge backend (si présent)
(async () => {
  const el = document.getElementById('api-status');
  const base = (window.ECONYA_API_BASE || '').replace(/\/+$/,'');
  if (!el) return;
  if (!base) { el.textContent = 'Backend non configuré ❌'; el.style.background = '#ffd9d9'; el.style.color = '#a00'; return; }
  try {
    const r = await fetch(base + '/sante', {mode:'cors'});
    if (!r.ok) throw new Error('http '+r.status);
    el.textContent = 'Backend connecté ✅';
    el.style.background = '#d7f5dd';
    el.style.color = '#115c2d';
  } catch(e) {
    el.textContent = 'Backend indisponible ❌';
    el.style.background = '#ffd9d9';
    el.style.color = '#a00';
    console.error(e);
  }
})();

// 3) nav active
(() => {
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('?')[0];
    if (href === here) a.setAttribute('aria-current','page');
  });
})();
