/* assets/weekly.js – Défi hebdo */
const WKEY = "econya:achievements";
const WGKEY = "econya:weeklyGoal";
const $w = s => document.querySelector(s);

function wLoad(){ try{return JSON.parse(localStorage.getItem(WKEY)||"{}");}catch{return{}} }
function wSave(v){ localStorage.setItem(WKEY, JSON.stringify(v)); }

function weekNumber(d=new Date()){
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(),0,1));
  return Math.ceil((((t - yearStart) / 86400000) + 1)/7);
}

function renderWeekly(){
  const ach = wLoad();
  const wk  = ach.week || {};
  const nowWeek = weekNumber(new Date());
  if (!wk.week || wk.week !== nowWeek) { ach.week = { week: nowWeek, saved: 0, since: Date.now() }; wSave(ach); }

  const goal = Number(localStorage.getItem(WGKEY)||25);
  const saved = Number((ach.week||{}).saved||0);
  const pct = Math.max(0, Math.min(100, Math.round(saved/goal*100)));

  $w("#w-goal").textContent = new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(goal);
  $w("#w-saved").textContent = new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(saved);
  $w("#w-bar").style.width = pct + "%";
  $w("#w-pct").textContent = pct + "%";
}

$w("#w-set")?.addEventListener("click", ()=>{
  const v = Number(prompt("Objectif hebdo (€) :", localStorage.getItem(WGKEY)||25) || 25);
  localStorage.setItem(WGKEY, String(Math.max(0, v)));
  renderWeekly();
});

$w("#w-add5")?.addEventListener("click", ()=>{
  const ach = wLoad(); ach.week = ach.week || { week: weekNumber(new Date()), saved:0, since: Date.now() };
  ach.week.saved = Number(ach.week.saved||0) + 5; wSave(ach); renderWeekly();
});

$w("#w-reset")?.addEventListener("click", ()=>{
  if(!confirm("Réinitialiser le défi de cette semaine ?")) return;
  const ach = wLoad(); ach.week = { week: weekNumber(new Date()), saved: 0, since: Date.now() }; wSave(ach); renderWeekly();
});

renderWeekly();
