(function(){
  // theme
  const btn = document.getElementById('themeBtn');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('econya_theme');
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme==='dark'?'dark':'light');
  function setBtn(){ btn && (btn.textContent = (document.documentElement.getAttribute('data-theme')==='light'?'☀️ Clair':'🌙 Sombre')); }
  setBtn();
  if(btn){ btn.onclick = ()=>{
    const current = document.documentElement.getAttribute('data-theme');
    const next = current==='light'?'dark':'light';
    document.documentElement.setAttribute('data-theme', next==='dark'?'dark':'light');
    localStorage.setItem('econya_theme', next);
    setBtn();
  };}

  // currency demo
  const currencyByRegion = { FR:'EUR', BE:'EUR', LU:'EUR', DE:'EUR', ES:'EUR', IT:'EUR', PT:'EUR', NL:'EUR', IE:'EUR', AT:'EUR', FI:'EUR', GR:'EUR', US:'USD', GB:'GBP', CA:'CAD', CH:'CHF', JP:'JPY', MA:'MAD', AE:'AED' };
  const locale = navigator.language || 'fr-FR';
  const regionMatch = locale.match(/[-_](\w{2})$/);
  const region = regionMatch ? regionMatch[1].toUpperCase() : 'FR';
  const currency = currencyByRegion[region] || 'EUR';
  const el = document.getElementById('kpiAmount');
  if(el){
    const amount = 125.5;
    el.textContent = new Intl.NumberFormat(locale, { style:'currency', currency }).format(amount);
  }

  // leaves confetti on home only
  const stage = document.getElementById('stage');
  if(stage){
    function spawnLeaf(){
      const leaf=document.createElement('div');
      leaf.className='leaf';
      leaf.style.left=(120+(Math.random()*60-30))+'px';
      leaf.style.top=(90+(Math.random()*30-10))+'px';
      leaf.style.setProperty('--dx',(Math.random()*60-30)+'px');
      stage.appendChild(leaf);
      setTimeout(()=>leaf.remove(),1700);
    }
    let bursts=0; const timer=setInterval(()=>{bursts++; for(let i=0;i<3;i++)spawnLeaf(); if(bursts>6)clearInterval(timer);},400);
  }

  // year footer
  const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();

  // Play link storage
  const playLink = localStorage.getItem('econya_play_link') || '#';
  document.querySelectorAll('a[data-play]').forEach(a=>a.setAttribute('href', playLink));
})();