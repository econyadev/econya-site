(()=>{
  // Apply saved theme (default dark)
  const saved = localStorage.getItem('econya_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  const burger = document.querySelector('.burger');
  const drawer = document.querySelector('.drawer');
  const backdrop = document.querySelector('.backdrop');
  burger?.addEventListener('click', ()=>{ drawer.classList.add('open'); backdrop.classList.add('show'); });
  backdrop?.addEventListener('click', ()=>{ drawer.classList.remove('open'); backdrop.classList.remove('show'); });

  const l = document.querySelector('.logo3d');
  if(l){ l.classList.add('pop'); setTimeout(()=>l.classList.remove('pop'), 1300); }

  // Theme toggles
  function updateThemeButtons(theme){
    document.querySelectorAll('#themeToggle, #themeToggleDrawer').forEach(btn=>{
      if(!btn) return;
      btn.textContent = theme==='dark' ? '🌙' : '☀️';
      btn.title = theme==='dark' ? 'Passer en clair' : 'Passer en sombre';
    });
  }
  updateThemeButtons(saved);
  function toggleTheme(){
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current==='dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('econya_theme', next);
    updateThemeButtons(next);
  }
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('themeToggleDrawer')?.addEventListener('click', toggleTheme);

  // A/B CTA
  const variant = localStorage.getItem('econya_ab') || (Math.random() < 0.5 ? 'A':'B');
  localStorage.setItem('econya_ab', variant);
  document.querySelectorAll('[data-cta]').forEach(btn => { if(variant==='B'){ btn.classList.add('ghost'); } });

  // Bank link indicator (demo state)
  const linked = !!localStorage.getItem('econya_bank_linked');
  document.querySelectorAll('[data-bank-state]').forEach(el=> el.textContent = linked ? 'Banque connectée ✓' : 'Connecter ma banque');

  // API helpers
  const API_BASE = localStorage.getItem('econya_api_base') || 'http://localhost:3000';
  window.EconyaAPI = {
    base: API_BASE,
    token: () => localStorage.getItem('econya_jwt') || '',
    setBase: (u) => { localStorage.setItem('econya_api_base', u); location.reload(); },
    login: async () => {
      try{
        const r = await fetch(`${API_BASE}/auth/mock-login`, {method:'POST', headers:{'Content-Type':'application/json'}});
        if(!r.ok) throw new Error('login failed');
        const {token} = await r.json();
        localStorage.setItem('econya_jwt', token);
        return token;
      }catch(e){
        console.error(e);
        alert('Login API échoué. Vérifie que le backend tourne sur '+API_BASE);
      }
    },
    authHeader: () => ({ 'Authorization': 'Bearer ' + (localStorage.getItem('econya_jwt')||'') })
  };

  // Simple chart
  window.drawIncomeSpend = (canvas, income, spend)=>{
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    const max = Math.max(...income, ...spend, 1);
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; if((document.documentElement.getAttribute('data-theme')||'dark')==='dark'){ ctx.strokeStyle='rgba(255,255,255,.2)'; }
    ctx.beginPath(); ctx.moveTo(40,10); ctx.lineTo(40,H-30); ctx.lineTo(W-10,H-30); ctx.stroke();
    const step = (W-60)/Math.max(1, income.length-1);
    function plot(arr, color){
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2;
      arr.forEach((v,i)=>{
        const x = 40 + i*step;
        const y = (H-30) - (v/max)*(H-40);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.stroke();
    }
    plot(spend, '#ef4444');
    plot(income, '#22c55e');
  };
})();