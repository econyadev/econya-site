// v7.1 Social follow popup
(function(){
  const KEY='econya_visits'; const THRESH=2;
  function visits(){ return parseInt(localStorage.getItem(KEY)||'0')||0; }
  function inc(){ localStorage.setItem(KEY, String(visits()+1)); }
  function show(){
    const n = visits(); if(n<THRESH) return;
    if(localStorage.getItem('econya_follow_dismiss')) return;
    const box = document.createElement('div');
    box.style.cssText='position:fixed;right:16px;bottom:16px;background:#0b1a16;color:#d7efe4;border:1px solid rgba(255,255,255,.12);padding:14px;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.35);z-index:9999;max-width:360px';
    box.innerHTML = `<div style="display:flex;gap:10px;align-items:center">
      <div style="font-weight:700">Rejoignez-nous pour des bons plans & actus</div>
      <button id="sf-close" class="btn" style="margin-left:auto">×</button>
    </div>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
      <a class="btn" href="https://facebook.com/econya?utm_source=site&utm_medium=popup&utm_campaign=social" target="_blank" rel="noopener">Facebook</a>
      <a class="btn" href="https://instagram.com/econya?utm_source=site&utm_medium=popup&utm_campaign=social" target="_blank" rel="noopener">Instagram</a>
      <a class="btn" href="https://twitter.com/econya?utm_source=site&utm_medium=popup&utm_campaign=social" target="_blank" rel="noopener">X/Twitter</a>
    </div>`;
    document.body.appendChild(box);
    document.getElementById('sf-close').onclick=()=>{ localStorage.setItem('econya_follow_dismiss','1'); box.remove(); };
  }
  window.addEventListener('DOMContentLoaded', ()=>{ inc(); setTimeout(show, 1000); });
})();