// v6.5 Econya AI (on-device heuristics + hooks to backend verification)
(function(){
  const enc = new TextEncoder(); const dec = new TextDecoder();
  // Simple profile gathered from localStorage (or defaults)
  const locale = navigator.language || 'fr-FR';
  const country = (localStorage.getItem('econya_country') || 'FR').toUpperCase();
  const income = Number(localStorage.getItem('econya_income')||'1800');  // monthly €
  const rent = Number(localStorage.getItem('econya_rent')||'650');
  const commute = Number(localStorage.getItem('econya_commute')||'80');
  const subscriptions = JSON.parse(localStorage.getItem('econya_subs')||'[{"name":"Streaming+","price":13.99},{"name":"Music Pro","price":9.99}]');

  function euro(n){ try{ return new Intl.NumberFormat(locale,{style:'currency',currency: country==='MA'?'MAD':country==='US'?'USD':country==='GB'?'GBP':country==='CA'?'CAD':'EUR'}).format(n);}catch{ return (n.toFixed(2)+' €'); } }

  async function loadPartners(){
    try{
      const r = await fetch('assets/partners/partners.json');
      return await r.json();
    }catch(e){ return {partners:[]}; }
  }

  function estimateSavings(){
    // Heuristics: subscriptions trim, insurance switch, energy green, bank fees
    const saveSubs = Math.max(0, subscriptions.reduce((a,s)=>a+s.price,0) * 0.25); // suggest trimming 25%
    const saveInsurance = 120 * 0.12; // -12% on 1200€/an typique
    const saveEnergy = 800 * 0.08;    // -8% sur 800€/an
    const bankFees = 60;              // baseline fees per year
    return {
      monthly: (saveSubs/1) + (saveInsurance/12) + (saveEnergy/12) + (bankFees/12),
      details: {saveSubs, saveInsurance, saveEnergy, bankFees}
    };
  }

  function rankPartners(data){
    // Rank by category relevance + country match
    const cats = ['bank','insurance','energy','travel','leisure'];
    const list = data.partners
      .filter(p=>!p.countries || p.countries.includes(country))
      .sort((a,b)=> cats.indexOf(a.category)-cats.indexOf(b.category));
    return list.slice(0,8);
  }

  async function suggestActions(){
    const data = await loadPartners();
    const savings = estimateSavings();
    const ranked = rankPartners(data);
    const shortTerm = [
      {title:"Réduire abonnements", est: savings.details.saveSubs/1, how:"Annulez/planifiez des pauses pour 1-2 services peu utilisés."},
      {title:"Comparer assurance auto", est: savings.details.saveInsurance/12, how:"Simulez chez 2 assureurs partenaires."},
      {title:"Vérifier offres énergie verte", est: savings.details.saveEnergy/12, how:"Comparez le kWh et l’abonnement."}
    ];
    const midTerm = [
      {title:"Comparer votre banque", est: 60/12, how:"Frais de tenue + CB : cherchez 0€/mois."},
      {title:"Optimiser transport", est: 15, how:"Carte/plafond adapté, covoiturage occasionnel."}
    ];
    const longTerm = [
      {title:"Objectif épargne 3–6 mois", est: income*0.15, how:"Virez 15% en début de mois vers un compte rémunéré."}
    ];
    return {country, savings, ranked, shortTerm, midTerm, longTerm};
  }

  async function renderAssistant(){
    const root = document.getElementById('ai-root');
    if(!root) return;
    const s = await suggestActions();
    root.innerHTML = `
      <div class="card"><strong>Pays</strong> : ${s.country} — <strong>Économies estimées</strong> (mensuelles) : <span class="badge">${euro(s.savings.monthly)}</span></div>

      <div class="card">
        <h3>Actions immédiates (30 jours)</h3>
        <ul>${s.shortTerm.map(a=>`<li><strong>${a.title}</strong> — potentiel ${euro(a.est)} / mois<br/><small>${a.how}</small></li>`).join('')}</ul>
      </div>

      <div class="card">
        <h3>3–6 mois</h3>
        <ul>${s.midTerm.map(a=>`<li><strong>${a.title}</strong> — environ ${euro(a.est)} / mois<br/><small>${a.how}</small></li>`).join('')}</ul>
      </div>

      <div class="card">
        <h3>6–12 mois</h3>
        <ul>${s.longTerm.map(a=>`<li><strong>${a.title}</strong> — objectif ${euro(a.est)}<br/><small>${a.how}</small></li>`).join('')}</ul>
      </div>

      <div class="card">
        <h3>Offres partenaires pertinentes</h3>
        <div class="grid">
          ${s.ranked.map(p=>`
            <div class="card">
              <div><strong>${p.name}</strong> <small>(${p.category})</small></div>
              <div>${p.tagline||''}</div>
              <div><em>${p.perk||''}</em></div>
              <div style="margin-top:6px"><a class="btn" href="${p.url}" target="_blank" rel="noopener">Voir l’offre</a></div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <h3>Vérifier une info sur Internet</h3>
        <p class="small">L’Assistant peut interroger l’API Econya pour récupérer des sources fiables (whitelist) et t’afficher des extraits.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input id="ai-q" placeholder="Ex: taux livret A actuel" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#0b1a16;color:inherit"/>
          <button id="ai-verify" class="btn">Vérifier</button>
        </div>
        <div id="ai-sources" style="margin-top:10px"></div>
      </div>
    `;
    // Wire verification
    document.getElementById('ai-verify')?.addEventListener('click', async ()=>{
      const q = (document.getElementById('ai-q').value||'').trim();
      if(!q) return;
      const base = localStorage.getItem('econya_verify_api') || 'https://econya-chat.onrender.com';
      const url = `${base.replace(/\/$/,'')}/ai/verify?q=${encodeURIComponent(q)}&country=${encodeURIComponent(country)}`;
      const box = document.getElementById('ai-sources');
      box.innerHTML = '<em>Recherche de sources fiables…</em>';
      try{
        const r = await fetch(url);
        if(!r.ok) throw new Error('verify failed');
        const j = await r.json();
        box.innerHTML = (j.results||[]).map(it=>`
          <div class="card">
            <div><strong>${it.title||it.url}</strong></div>
            <div class="small">${it.snippet||''}</div>
            <div><a class="btn" href="${it.url}" target="_blank" rel="noopener">Source</a></div>
          </div>
        `).join('') || '<p>Aucune source trouvée.</p>';
      }catch(e){
        box.innerHTML = '<p>API indisponible (démo). Configurez `econya_verify_api` dans LocalStorage.</p>';
      }
    });
  }

  window.addEventListener('DOMContentLoaded', renderAssistant);
})();
// --- v6.6 Budget form + persistence ---
(function(){
  function q(sel){return document.querySelector(sel)}
  function euroFmt(country){
    return country==='US'?'USD':country==='GB'?'GBP':country==='CA'?'CAD':country==='MA'?'MAD':'EUR';
  }
  function saveBudget(){
    const country = (q('#b-country').value||'FR').toUpperCase();
    const income = parseFloat(q('#b-income').value||'0')||0;
    const rent = parseFloat(q('#b-rent').value||'0')||0;
    const commute = parseFloat(q('#b-commute').value||'0')||0;
    const subs = (q('#b-subs').value||'').split(',').map(s=>s.trim()).filter(Boolean).map(x=>{
      const m = x.match(/(.+):\s*(\d+(\.\d+)?)/); return m?{name:m[1].trim(), price:parseFloat(m[2])}:null;
    }).filter(Boolean);
    localStorage.setItem('econya_country', country);
    localStorage.setItem('econya_income', String(income));
    localStorage.setItem('econya_rent', String(rent));
    localStorage.setItem('econya_commute', String(commute));
    localStorage.setItem('econya_subs', JSON.stringify(subs));
    alert('Budget enregistré ✅'); location.reload();
  }
  window.addEventListener('DOMContentLoaded', ()=>{
    if(!document.getElementById('budget-form')) return;
    q('#b-country').value = (localStorage.getItem('econya_country')||'FR').toUpperCase();
    q('#b-income').value = localStorage.getItem('econya_income')||'1800';
    q('#b-rent').value = localStorage.getItem('econya_rent')||'650';
    q('#b-commute').value = localStorage.getItem('econya_commute')||'80';
    try{
      const subs = JSON.parse(localStorage.getItem('econya_subs')||'[]');
      q('#b-subs').value = subs.map(s=>`${s.name}:${s.price}`).join(', ');
    }catch{}
    q('#b-save')?.addEventListener('click', saveBudget);
  });
})();
