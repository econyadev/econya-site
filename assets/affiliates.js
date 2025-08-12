// v7.6.1 Affiliates: click tracking + redirect via /out
(function(){
  function apiBase(){ return (localStorage.getItem('econya_verify_api')||'').replace(/\/$/,''); }
  function country(){ return (localStorage.getItem('econya_country')||'FR').toUpperCase(); }
  function ab(){ return localStorage.getItem('econya_ab') || 'A'; }
  function cid(){ return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c=>(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)); }
  async function logClick(payload){
    const api = apiBase(); if(!api) return;
    try{ await fetch(api+'/click', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)}); }catch(e){}
  }
  async function handlePartnerClick(e){
    const a = e.target.closest('a.partner-link'); if(!a) return;
    const api = apiBase(); if(!api) return; // let native link if no API
    e.preventDefault();
    const c = country(); const category = a.getAttribute('data-cat')||'stocks'; const url = a.getAttribute('href');
    const clickId = cid();
    // Optional resolve check (defense-in-depth)
    try{
      const r = await fetch(api+`/resolve/deal?country=${c}&url=${encodeURIComponent(url)}&cat=${category}`);
      const j = await r.json(); if(j && j.allowed===false){ return alert('Lien non autorisé dans votre pays.'); }
    }catch(e){}
    // Log click
    await logClick({cid: clickId, url, cat: category, country: c, ab: ab(), source: location.pathname, t: Date.now()});
    // Redirect via /out (server) to preserve tracking
    const outUrl = api+`/out?country=${c}&url=${encodeURIComponent(url)}&cat=${category}&cid=${clickId}`;
    window.open(outUrl, '_blank', 'noopener');
  }
  document.addEventListener('click', handlePartnerClick, true);
})();