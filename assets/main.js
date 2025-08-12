
function demoCompare(){
  const cat=document.getElementById('cat').value;
  const budget=+document.getElementById('budget').value||100;
  const country=(document.getElementById('country').value||'FR').toUpperCase();
  const results=document.getElementById('results');
  const items=[
    {name:`Offre 1 ${cat}`, price:Math.max(5, budget*0.12), tag:`${country}`},
    {name:`Offre 2 ${cat}`, price:Math.max(3, budget*0.10), tag:`${country}`},
    {name:`Offre 3 ${cat}`, price:Math.max(8, budget*0.14), tag:`${country}`},
  ].sort((a,b)=>a.price-b.price);
  results.innerHTML=items.map(x=>`<div class="cards"><article><h4>${x.name}</h4><p>Dès ${x.price.toFixed(2)} € / mois</p><a class="btn primary" href="#">Voir</a></article></div>`).join('');
}

function saveInterests(){
  alert('Intérêts enregistrés (démo).');
}

function askAI(){
  const box=document.getElementById('chatInput');
  const log=document.getElementById('chatLog');
  const q=box.value.trim(); if(!q) return;
  log.innerHTML += `<div><strong>Vous:</strong> ${q}</div>`;
  log.innerHTML += `<div><strong>Econya:</strong> Voici une piste d'économie sur "${q}": comparez 3 offres et ciblez la moins chère à qualité égale.</div>`;
  box.value='';
}

// simple tree animation
(function(){
  const c=document.getElementById('econyaTree');
  if(!c) return;
  const ctx=c.getContext('2d');
  let t=0;
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    // trunk
    ctx.fillStyle='#b46b2a';
    ctx.fillRect(c.width/2-10, c.height-100, 20, 80);
    // crown pulsating
    const r=60 + Math.sin(t)*6;
    const y=c.height-120;
    ctx.beginPath();
    ctx.fillStyle='#2ecc71';
    ctx.arc(c.width/2, y, r, 0, Math.PI*2);
    ctx.fill();
    t+=0.06;
    requestAnimationFrame(draw);
  }
  draw();
})();
