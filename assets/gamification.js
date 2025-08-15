/* Gamification Econya – progression d’épargne => plante + badges */
const $ = s => document.querySelector(s);
const apiBase = (window.ECONYA_API_BASE || "").replace(/\/+$/,"");
const euro = n => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n||0);
const KEY = "econya:gamif";

$("#year").textContent = new Date().getFullYear();

/* Badge backend */
(async () => {
  const el = $("#api-status");
  if (!apiBase) { el.textContent = "Backend non configuré"; el.classList.remove("ghost"); el.classList.add("ko"); return; }
  try {
    const r = await fetch(apiBase + "/sante");
    el.textContent = r.ok ? "Backend connecté ✅" : "Backend indisponible ❌";
    el.classList.remove("ghost");
    el.classList.toggle("ok", r.ok);
    el.classList.toggle("ko", !r.ok);
  } catch {
    el.textContent = "Backend indisponible ❌"; el.classList.remove("ghost"); el.classList.add("ko");
  }
})();

/* State helpers */
function load(){ try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch{return{}} }
function save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }

function setGoal(val){
  const s = load(); s.goal = Math.max(0, Number(val)||0); save(s);
}

$("#save-goal").addEventListener("click", ()=>{
  const v = $("#goal").value;
  setGoal(v);
  alert("Objectif enregistré ✅");
  refresh();
});
$("#reset").addEventListener("click", ()=>{ if(confirm("Réinitialiser la gamification ?")) { localStorage.removeItem(KEY); refresh(true); }});

/* Données du mois courant – essaie plusieurs routes pour compatibilité */
async function getMonthSummary(){
  const ym = new Date().toISOString().slice(0,7);
  const tryUrls = [
    `${apiBase}/transactions/month/${ym}`, // version :ym
    `${apiBase}/transactions/month?ym=${ym}`, // version ?ym
    `${apiBase}/transactions` // fallback
  ];
  for (const url of tryUrls) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const data = await r.json();
      const tx = data.transactions || data || [];
      if (!Array.isArray(tx)) continue;

      const sums = tx.reduce((a,t)=>{
        const amt = Number(t.amount)||0;
        if (amt>0) a.income += amt; else a.expenses += Math.abs(amt);
        return a;
      },{income:0, expenses:0});
      return sums;
    } catch {}
  }
  // fallback démo
  return { income: 2200, expenses: 1200 };
}

/* Badges – règles simples et lisibles */
function computeBadges(saved, goal, plan){
  const b = [];
  const rate = goal>0 ? (saved/goal) : 0;

  b.push({id:"first10", name:"Premier palier", desc:"Tu démarres ton épargne", ok: saved>=10});
  b.push({id:"rate25", name:"25% de l’objectif", desc:"Un quart du chemin !", ok: rate>=.25});
  b.push({id:"rate50", name:"50% de l’objectif", desc:"À mi-parcours", ok: rate>=.5});
  b.push({id:"rate100", name:"Objectif atteint", desc:"Bravo ! 🌟", ok: rate>=1});
  b.push({id:"big100", name:"+100 € économisés", desc:"Impact concret", ok: saved>=100});
  b.push({id:"premium", name:"Premium", desc:"Accès aux boosts", ok: (window.ECONYA_PLAN||"") === "pro"});

  return b;
}

function renderBadges(list){
  $("#badges").innerHTML = list.map(x=>`
    <span class="badge ${x.ok?"":"lock"}">
      🌟 <strong>${x.name}</strong> <span class="muted">— ${x.desc}</span>
    </span>
  `).join("");
}

function renderPlant(progressPct){
  // map 0–150% vers 0.6–1.25 d’échelle
  const scale = Math.max(0.6, Math.min(1.25, 0.6 + (progressPct/100)*0.65));
  const plant = $("#plant svg");
  plant.style.transform = `scale(${scale})`;

  const bar = $("#bar");
  bar.style.width = Math.max(0, Math.min(progressPct, 150)) + "%";
}

async function refresh(fresh=false){
  const s = fresh ? {} : load();

  // objectif
  const goal = Number(s.goal||0) || Number($("#goal").value||0) || 200;
  $("#goal").value = goal;

  // données mois
  const sums = await getMonthSummary();
  const saved = Math.max(0, sums.income - sums.expenses);
  const progress = goal>0 ? Math.round((saved/goal)*100) : 0;

  // kpis
  $("#k-income").textContent = euro(sums.income);
  $("#k-expenses").textContent = euro(sums.expenses);
  $("#k-saved").textContent = euro(saved);
  $("#k-progress").textContent = `${Math.max(0, Math.min(progress,150))}%`;

  // plante & barre
  renderPlant(progress);

  // badges
  const badges = computeBadges(saved, goal, window.ECONYA_PLAN||"gratuit");
  renderBadges(badges);

  // persistance légère
  save({ goal, last:{saved, progress} });
}

// init
(function init(){
  const s = load();
  if (s.goal) $("#goal").value = s.goal;
  refresh();
})();
