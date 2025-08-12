// v7.6 Markets widget (read-only, local JSON)
(function(){
  async function load(){ try{ return await (await fetch('assets/markets.json')).json(); }catch{return null} }
  function el(tag, attrs={}, html=''){ const e=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=> e.setAttribute(k,v)); e.innerHTML=html; return e; }
  function card(title){ const d=el('div', {class:'card'}); d.appendChild(el('h3',{}, title)); return d; }
  function table(rows){ const t=el('table',{class:'table small'}); t.innerHTML='<thead><tr><th>Instrument</th><th>Prix</th></tr></thead><tbody>'+rows.map(r=>`<tr><td>${r.name}</td><td>${r.price}</td></tr>`).join('')+'</tbody>'; return t; }
  async function init(){
    const root = document.getElementById('markets-widget'); if(!root) return;
    const data = await load(); if(!data) return;
    const g = el('div', {style:'display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px'});
    const fmt = (n)=> { try{ return new Intl.NumberFormat(navigator.language,{maximumFractionDigits:2}).format(n);}catch{return n} };
    const a = card('Indices'); a.appendChild(table(data.indices.map(x=> ({name:x.name, price:fmt(x.price)}))));
    const b = card('Matières premières'); b.appendChild(table(data.commodities.map(x=> ({name:x.name, price:fmt(x.price)}))));
    const c = card('Crypto'); c.appendChild(table(data.crypto.map(x=> ({name:x.name, price:fmt(x.price)}))));
    g.appendChild(a); g.appendChild(b); g.appendChild(c);
    root.innerHTML=''; root.appendChild(g);
  }
  window.addEventListener('DOMContentLoaded', init);
})();