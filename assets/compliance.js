// v7.4.2 Country-aware compliance & feature gating
(function(){
  async function getReg(country){
    // fetch banners (API first) then regulations.json
    const api = (localStorage.getItem('econya_verify_api')||'').replace(/\/$/,'');
    if(api){
      try{
        const r = await fetch(api + '/legal/banners?country=' + country);
        if(r.ok){
          const j = await r.json();
          if(j && j.banner){
            // attach dynamic banner at top of .wrap
            const wrap = document.querySelector('.wrap');
            if(wrap){
              const n = document.createElement('div');
              n.className='card small';
              n.innerHTML = '<strong>Info locale</strong> — '+ (j.banner.top||'') ;
              wrap.prepend(n);
              if(j.banner.foot){
                const f = document.createElement('div');
                f.className='card small';
                f.textContent = j.banner.foot;
                wrap.appendChild(f);
              }
            }
          }
        }
      }catch(e){}
    }

    try{
      const j = await (await fetch('assets/regulations.json')).json();
      return j[country] || null;
    }catch{return null}
  }
  function country(){
    return (localStorage.getItem('econya_country')||'FR').toUpperCase();
  }
  function banner(notices, refs){
    const box = document.createElement('div');
    box.style.cssText='background:#0e1915;color:#d7efe4;border:1px solid rgba(255,255,255,.12);padding:10px;border-radius:12px;margin:10px 0';
    box.innerHTML = `<div style="display:flex;gap:8px;align-items:flex-start">
      <div style="font-weight:700">Conformité locale</div>
      <div style="font-size:.95rem">${notices.map(n=>`<div>• ${n}</div>`).join('')}
        ${refs && refs.length? `<div style="margin-top:6px" class="small">Réfs: ${refs.map(r=>`<a href="${r.url}" target="_blank" rel="noopener">${r.label}</a>`).join(' · ')}</div>`:''}
      </div>
    </div>`;
    return box;
  }
  async function apply(){
    const ctry = country();
    const reg = await getReg(ctry);
    if(!reg) return;
    // Insert banner on finance-related pages
    const container = document.querySelector('.wrap');
    if(container){ container.prepend(banner(reg.notices||[], reg.refs||[])); }
    // Feature gating on deals page
    if(location.pathname.endsWith('deals.html')){
      const f = reg.features || {};
      const show = (pane, ok)=>{
        const el = document.querySelector(`[data-pane="${pane}"]`);
        if(!el) return;
        el.style.opacity = ok? '1' : '0.5';
        el.querySelectorAll('a.btn').forEach(a=> a.style.pointerEvents = ok? 'auto':'none');
        const note = el.querySelector('.local-note') || document.createElement('div');
        note.className='local-note small';
        note.style.marginTop='6px';
        note.textContent = ok? '' : 'Indisponible ou restreint dans votre pays.';
        if(!el.querySelector('.local-note')) el.appendChild(note);
      };
      show('crypto', !!f.crypto);
      show('stocks', !!f.stocks);
      show('commod', !!f.commodities);
    }
  }
  window.addEventListener('DOMContentLoaded', apply);
})();