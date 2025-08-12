// v7.6 Partners table + resolve/deal gating
(function(){
  async function loadPartners(){
    try{ return await (await fetch('assets/partners.json')).json(); }catch{return null}
  }
  function getCountry(){ return (localStorage.getItem('econya_country')||'FR').toUpperCase(); }
  function renderPartners(data){
    const country = getCountry();
    const root = document.getElementById('partners-stocks'); if(!root || !data) return;
    const rows = (data[country] && data[country].stocks_etf) || [];
    const notes = (data[country] && data[country].tax_notes) || [];
    if(rows.length===0){ root.innerHTML = '<div class="small">Pas de partenaires listés pour votre pays.</div>'; return; }
    const tbl = document.createElement('table'); tbl.className='table';
    tbl.innerHTML = '<thead><tr><th>Plateforme</th><th>PEA</th><th>ISA</th><th>Frais</th><th></th></tr></thead>';
    const tb = document.createElement('tbody');
    rows.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.name}</td><td>${r.pea?'✅':'—'}</td><td>${r.isa?'✅':'—'}</td><td>${r.fees||''}</td><td><a class="btn partner-link" data-cat="stocks" href="${r.url}" target="_blank" rel="noopener">Ouvrir</a></td>`;
      tb.appendChild(tr);
    });
    tbl.appendChild(tb); root.innerHTML=''; root.appendChild(tbl);
    if(notes.length){ const note = document.createElement('div'); note.className='small'; note.style.marginTop='6px'; note.innerHTML='Fiscalité : '+notes.join(' · '); root.appendChild(note); }
  }
  async function gate(e){
    const a = e.target.closest('a.partner-link'); if(!a) return;
    const api = (localStorage.getItem('econya_verify_api')||'').replace(/\\/$/,'');
    if(!api) return; // let it pass
    e.preventDefault();
    const c = (localStorage.getItem('econya_country')||'FR').toUpperCase();
    const url = a.getAttribute('href'); const cat = a.getAttribute('data-cat')||'stocks';
    try{
      const r = await fetch(api+`/resolve/deal?country=${c}&url=${encodeURIComponent(url)}&cat=${cat}`);
      const j = await r.json();
      if(j.allowed){ window.open(url, '_blank','noopener'); }
      else{ alert('Ce lien n’est pas disponible dans votre pays selon nos règles de conformité.'); }
    }catch(err){ window.open(url, '_blank','noopener'); }
  }
  document.addEventListener('DOMContentLoaded', async ()=>{
    const data = await loadPartners(); renderPartners(data);
    document.addEventListener('click', gate, true);
  });
})();