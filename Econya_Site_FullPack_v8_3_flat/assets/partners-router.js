// v7.6.2 Global partner router: routes partner links via /out with cid, logs /click, applies gating
(function(){
  function api(){ return (localStorage.getItem('econya_verify_api')||'').replace(/\/$/,''); }
  function country(){ return (localStorage.getItem('econya_country')||'FR').toUpperCase(); }
  function ab(){ return localStorage.getItem('econya_ab') || 'A'; }
  function cid(){ try{ return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c=>(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }catch(e){ return String(Date.now()) } }
  function isPartnerLink(a){
    if(!a || !a.href) return false;
    if(a.classList.contains('partner-link')) return true;
    if(a.dataset && a.dataset.partner==='true') return true;
    if(/utm_source=econya/i.test(a.href)) return true;
    return false;
  }
  async function logClick(payload){
    if(!api()) return;
    try{ await fetch(api()+'/click', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)}); }catch(e){}
  }
  async function handle(e){
    const a = e.target.closest('a'); if(!a) return;
    if(!isPartnerLink(a)) return;
    if(!api()) return; // let through if no API configured
    const cat = a.getAttribute('data-cat') || (a.dataset && a.dataset.cat) || 'other';
    const url = a.href;
    const ctry = country();
    const id = cid();
    e.preventDefault();
    try{
      // Optional resolve/gating
      const r = await fetch(api()+`/resolve/deal?country=${ctry}&url=${encodeURIComponent(url)}&cat=${cat}`);
      const j = await r.json();
      if(j && j.allowed===false){ return alert('Lien non disponible dans votre pays.'); }
    }catch(_){}
    await logClick({cid:id, url, cat, country: ctry, ab: ab(), source: location.pathname, t: Date.now()});
    const outUrl = api()+`/out?country=${ctry}&url=${encodeURIComponent(url)}&cat=${cat}&cid=${id}`;
    window.open(outUrl, '_blank', 'noopener');
  }
  document.addEventListener('click', handle, true);
})();