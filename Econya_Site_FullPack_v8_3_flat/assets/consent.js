// v7.2 Cookie consent (RGPD) — essential|perf|marketing
(function(){
  const KEY='econya_cookie_consent';
  function read(){ try{ return JSON.parse(localStorage.getItem(KEY)||'{}'); }catch{return {}} }
  function write(v){ localStorage.setItem(KEY, JSON.stringify(v)); }
  function has(){ return !!read().level; }
  function apply(){
    const c = read();
    // Perf (placeholder): load analytics if level >= perf
    if(c.level==='perf' || c.level==='marketing'){
      // placeholder hook: window.loadAnalytics && window.loadAnalytics();
    }
    // Marketing: allow social embeds
    if(!(c.level==='marketing')){
      // Remove social embeds if not consented
      document.querySelectorAll('script[src*="platform.twitter.com"]').forEach(s=> s.remove());
      document.querySelectorAll('.twitter-tweet').forEach(e=> e.remove());
    }
  }
  function banner(){
    if(has()) { apply(); return; }
    const b = document.createElement('div');
    b.style.cssText='position:fixed;left:0;right:0;bottom:0;background:#0b1a16;color:#d7efe4;border-top:1px solid rgba(255,255,255,.12);padding:14px;z-index:9999';
    b.innerHTML = `<div style="max-width:1024px;margin:auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <div><strong>Cookies</strong> — Nous utilisons des cookies pour personnaliser votre expérience et mesurer l’usage.</div>
      <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn" id="cc-essential">Essentiels</button>
        <button class="btn" id="cc-perf">Performance</button>
        <button class="btn" id="cc-mkt">Marketing</button>
      </div>
    </div>`;
    document.body.appendChild(b);
    document.getElementById('cc-essential').onclick=()=>{ write({level:'essential', ts:Date.now()}); b.remove(); apply(); };
    document.getElementById('cc-perf').onclick=()=>{ write({level:'perf', ts:Date.now()}); b.remove(); apply(); };
    document.getElementById('cc-mkt').onclick=()=>{ write({level:'marketing', ts:Date.now()}); b.remove(); apply(); };
  }
  window.addEventListener('DOMContentLoaded', banner);
})();