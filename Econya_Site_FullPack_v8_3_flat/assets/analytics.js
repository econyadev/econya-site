// v7.3 Analytics léger (opt-in 'perf')
(function(){
  function consentPerf(){
    try{ const c = JSON.parse(localStorage.getItem('econya_cookie_consent')||'{}'); return c.level==='perf' || c.level==='marketing'; }catch{return false}
  }
  if(!consentPerf()) return;
  const API = (localStorage.getItem('econya_verify_api')||'').replace(/\/$/,'');
  const ab = localStorage.getItem('econya_ab') || (Math.random()<0.5?'A':'B');
  localStorage.setItem('econya_ab', ab);
  function payload(evt, extra){
    const p = { evt, ab, t: Date.now(), href: location.href, country: (localStorage.getItem('econya_country')||'FR') };
    for(const k in extra){ p[k]=extra[k]; } return p;
  }
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a'); if(!a) return;
    if(/affiliate|utm_/i.test(a.href)){
      navigator.sendBeacon && API && navigator.sendBeacon(API+'/track', new Blob([JSON.stringify(payload('click_partner',{url:a.href}))], {type:'application/json'}));
    }
  }, true);
})();