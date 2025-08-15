/* Gamification Econya – progression + badges + intégration succès bons plans */
const $ = s => document.querySelector(s);
const apiBase = (window.ECONYA_API_BASE || "").replace(/\/+$/,"");
const euro = n => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n||0);
const KEY = "econya:gamif";
const AKEY = "econya:achievements";

$("#year").textContent = new Date().getFullYear();

/* Backend badge */
(async () => {
  const el = $("#api-status");
  if (!apiBase) { el.textContent = "Backend non configuré"; el.classList.remove("ghost"); el.classList.add("ko"); return; }
  try {
    const r = await fetch(apiBase + "/sante");
    el.textContent = r.ok ? "Backend connecté ✅" : "Backend indisponible ❌";
    el.classList.remove("ghost"); el.classList.toggle("ok", r.ok); el.classList.toggle("ko", !r.ok);
  } catch { el.textContent = "Backend indisponible ❌"; el.classList.remove("ghost"); el.classList.add("ko"); }
})();

/* State helpers */
function load(){ try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch{return{}} }
function save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
function aLoad(){ try{return JSON.parse(localStorage.getItem(AKEY)||"{}");}catch{return{}} }

$("#save-goal").addEventListener("click", ()=>{ const v = $("#goal").value; const s = load(); s.goal = Math.max(0, Number(v)||0); save(s); alert("Objectif enregistré ✅"); refresh(); });
$("#reset").addEventListener("click", ()=>{ if(confirm("Réinitialiser la gamification ?")){ localStorage.removeItem(KEY); refresh(true); }});

/* Données du mois courant – routes compatibles */
async function getMonthSummary(){
  const ym = new Date().toISOString().slice(0,7);
  const tries = [
    `${apiBase}/transactions/month/${ym}`,
    `${apiBase}/transactions/month?ym=${ym}`,
    `${apiBase}/transactions`
  ];
  for (const url of tries){
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const data = await r.json();
      const tx = data.transactions || data || [];
      if (!Array.isArray(tx)) continue;
      const sums = tx.reduce((a,t)=>{ const amt=Number(t.amount)||0; if(amt>0)a.income+=amt; else a.expenses+=Math.abs(amt); return a; },{income:0,expenses:0});
      return sums;
    } catch {}
  }
  return { income: 2200, expenses: 1200 };
}

/* Badges */
function computeBadges(saved, goal){
  const b = [];
  const rate = goal>0 ? (saved/goal) : 0;

  // progression
  b.push({id:"first10", name:"Premier palier", desc:"Tu démarres ton épargne", ok: saved>=10});
  b.push({id:"rate25", name:"25% de l’objectif", desc:"Un quart du chemin !", ok: rate>=.25});
  b.push({id:"rate50", name:"50% de l’objectif", desc:"À mi-parcours", ok: rate>=.5});
  b.push({id:"rate100", name:"Objectif atteint", desc:"Bravo ! 🌟", ok: rate>=1});
  b.push({id:"big100", name:"+100 € économisés", desc:"Impact concret", ok: saved>=100});
  b.push({id:"premium", name:"Premium", desc:"Accès aux boosts", ok: (window.ECONYA_PLAN||"") === "pro"});

  // succès bons plans
  const ach = aLoad();
  const opt = ach.optim || {};
  const totalOpt = Object.values(opt).reduce((a,n)=>a+(n||0),0);
  b.push({id:"bp1", name:"1 bon plan", desc:"Tu as enclenché une optimisation", ok: totalOpt>=1});
  b.push({id:"bp3", name:"3 bons plans", desc:"Tu multiplies les gains", ok: totalOpt>=3});
  if ((opt["Énergie"]||0) >= 1)  b.push({id:"opt-energy", name:"Énergie optimisée", desc:"Contrat comparé ou basculé", ok:true});
  if ((opt["Télécom"]||0) >= 1) b.push({id:"opt-tel", name:"Télécom optimisé", desc:"Forfait/box ajustés", ok:true});

  return b;
}

function renderBadges(list){
  $("#badges").innerHTML = list.map(x=>`
    <span class="badge ${x.ok?"":"lock"}">🌟 <strong>${x.name}</strong> <span class="muted">— ${x.desc}</span></span>
  `).join("");
}

function renderPlant(progressPct){
  const scale = Math.max(0.6, Math.min(1.25, 0.6 + (progressPct/100)*0.65));
  $("#plant svg").style.transform = `scale(${scale})`;
  $("#bar").style.width = Math.max(0, Math.min(progressPct, 150)) + "%";
}

async function refresh(fresh=false){
  const s = fresh ? {} : load();
  const goal = Number(s.goal||0) || Number($("#goal").value||0) || 200;
  $("#goal").value = goal;

  const sums = await getMonthSummary();
  const saved = Math.max(0, sums.income - sums.expenses);
  const progress = goal>0 ? Math.round((saved/goal)*100) : 0;

  $("#k-income").textContent = euro(sums.income);
  $("#k-expenses").textContent = euro(sums.expenses);
  $("#k-saved").textContent = euro(saved);
  $("#k-progress").textContent = `${Math.max(0, Math.min(progress,150))}%`;

  renderPlant(progress);
  renderBadges(computeBadges(saved, goal));

  save({ goal, last:{saved, progress} });
}

(function init(){ const s = load(); if (s.goal) $("#goal").value = s.goal; refresh(); })();
