
function econyaNotify(msg){
  let t=document.getElementById('toast'); 
  if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent=msg; t.style.display='block'; setTimeout(()=> t.style.display='none', 4200);
}
document.addEventListener('DOMContentLoaded', ()=>{
  drawTree(); bestDealWidget(); setTimeout(()=>econyaNotify('💡 Économie trouvée : -8€/mois sur votre forfait mobile (démo).'), 1600);
});

// Tree animation (5s, minimal)
function drawTree(){
  const c=document.getElementById('treeCanvas'); if(!c) return; const ctx=c.getContext('2d');
  let t=0; const id=setInterval(()=>{
    t+=0.03; ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle='#0b241c'; ctx.fillRect(0,260,c.width,40);
    ctx.fillStyle='#734c28'; ctx.fillRect(205,200-(t*30),10,80+(t*15));
    ctx.beginPath(); ctx.fillStyle='#19c37d'; const r=20+Math.min(60, t*60);
    ctx.arc(210,190-(t*25), r, 0, Math.PI*2); ctx.fill();
    if(t>=2.5){ ctx.fillStyle='#e6fff4'; for(let i=0;i<8;i++){ ctx.beginPath(); ctx.arc(210+Math.cos(i)*r*0.6, 190-(t*25)+Math.sin(i)*r*0.6, 3, 0, Math.PI*2); ctx.fill(); } }
    if(t>=5){ clearInterval(id); }
  }, 50);
}

// "Best deal" widget (backend if defined, otherwise demo)
async function bestDealWidget(){
  const el = document.getElementById('nowDeal'); if(!el) return;
  try{
    if(window.ECONYA_API_BASE){
      const r = await fetch(`${window.ECONYA_API_BASE}/api/deals/top`);
      if(r.ok){ const j=await r.json(); el.innerHTML = `🔥 ${j.title} — <b>${j.discount}%</b> <span class="badge">live</span>`; return; }
    }
  }catch(e){ /* fallback */}
  el.innerHTML = "🔥 Forfait 80 Go — <b>-35%</b> <span class='badge'>démo</span>";
}
