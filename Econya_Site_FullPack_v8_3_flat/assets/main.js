(()=>{
  const linked = !!localStorage.getItem('econya_bank_linked');
  document.querySelectorAll('[data-bank-state]').forEach(el=> el.textContent = linked ? 'Banque connectée ✓' : 'Connecter ma banque');

  async function loadPartners(){
    try{
      const r = await fetch('assets/partners/partners.json');
      const data = await r.json();
      return data;
    }catch(e){ console.warn('partners load failed', e); return {partners:[]}; }
  }
  async function renderPartners(container){
    const data = await loadPartners();
    const country = (localStorage.getItem('econya_country') || '').toUpperCase();
    const category = (new URLSearchParams(location.search).get('cat') || '').toLowerCase();
    const partners = data.partners
      .filter(p => !country || !p.countries || p.countries.includes(country))
      .filter(p => !category || p.category===category);
    container.innerHTML = partners.map(p => `
      <div class="card part-card">
        <img src="${p.logo}" alt="${p.name}"/>
        <div><strong>${p.name}</strong><br/><small>${p.tagline||''}</small></div>
        <div>${p.perk||''}</div>
        <div><a class="btn" href="${p.url}" target="_blank" rel="noopener">Voir l’offre</a></div>
      </div>
    `).join('') || '<p>Aucune offre pour ce filtre pour le moment.</p>';
  }
  const grid = document.getElementById('partners-grid');
  if(grid){ renderPartners(grid); }

  const form = document.getElementById('filters');
  if(form){
    form.addEventListener('change', ()=>{
      const country = form.country.value.toUpperCase();
      const category = form.category.value;
      if(country) localStorage.setItem('econya_country', country);
      const url = new URL(location.href);
      if(category) url.searchParams.set('cat', category); else url.searchParams.delete('cat');
      history.replaceState({}, '', url);
      renderPartners(document.getElementById('partners-grid'));
    });
  }
})();
// v6.7 Economy Score
(function(){
  function getNum(k, d){ return parseFloat(localStorage.getItem(k)||d) || 0 }
  function computeScore(){
    const income = getNum('econya_income', 1800);
    const rent   = getNum('econya_rent', 650);
    const commute= getNum('econya_commute', 80);
    let subs = 0; try{ subs = (JSON.parse(localStorage.getItem('econya_subs')||'[]')||[]).reduce((a,s)=>a+(s.price||0),0);}catch{}
    const pot = subs*0.25 + 120*0.12/12 + 800*0.08/12 + 60/12;
    const discr = Math.max(0, income - rent - commute - subs);
    const ratio = discr>0 ? Math.min(1, pot/Math.max(1,discr)) : 0;
    const score = Math.round(ratio*100);
    localStorage.setItem('econya_score', String(score));
    return score;
  }
  function renderScore(){
    const s = computeScore();
    const badge = document.getElementById('econya-score');
    if(badge){ badge.textContent = s + '/100'; }
  }
  window.addEventListener('DOMContentLoaded', renderScore);
})();