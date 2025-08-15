// Gamification Econya – badges, défis, progression plante
// Stockage local simple (clé/val) – no backend requis

const LS = {
  savings: "econya:savings:year",     // nombre (euros économisés estimés)
  badges:  "econya:badges",           // { seeds, sapling, tree, master }
  challenge: "econya:challenge:week", // { weekId, targetPct, done }
};

function getYearKey(){ return new Date().getFullYear(); }

// --- Progression & plante
export function setPlant(pct){
  pct = Math.max(0, Math.min(100, pct|0));
  const bar = document.getElementById("plant-bar");
  const txt = document.getElementById("plant-txt");
  if (bar) bar.style.width = pct + "%";
  if (txt) txt.textContent = pct + "% de votre objectif annuel atteint";
}

export function syncProgressFromCoach(potentialEUR=0){
  // Exemple : objectif par défaut 2000 €/an (personnalisable plus tard)
  const GOAL = Number(localStorage.getItem("econya:goal") || 2000);
  const saved = Math.max(0, Number(localStorage.getItem(LS.savings)) || 0);

  // On ajoute l’épargne potentielle (donnée Coach) en “estimation cumulée démo”
  const updated = Math.min(GOAL, saved + Math.round(potentialEUR));
  localStorage.setItem(LS.savings, String(updated));

  const pct = Math.min(100, Math.round((updated/GOAL)*100));
  setPlant(pct);
  awardBadges(pct);
  return { pct, saved: updated, goal: GOAL };
}

// --- Badges
const BADGE_LEVELS = [
  { key:"seeds",   label:"Graine",    minPct:  1 },
  { key:"sapling", label:"Jeune pousse", minPct: 25 },
  { key:"tree",    label:"Arbre",     minPct: 60 },
  { key:"master",  label:"Forêt",     minPct: 90 },
];

function awardBadges(pct){
  const badges = JSON.parse(localStorage.getItem(LS.badges) || "{}");
  let changed = false;
  for (const b of BADGE_LEVELS) {
    if (!badges[b.key] && pct >= b.minPct) { badges[b.key] = { at: Date.now() }; changed = true; toast("🎉 Badge débloqué : " + b.label); }
  }
  if (changed) localStorage.setItem(LS.badges, JSON.stringify(badges));
  renderBadges(badges);
}

function renderBadges(badges){
  const wrap = document.getElementById("badges-wrap");
  if (!wrap) return;
  const items = BADGE_LEVELS.map(b=>{
    const got = !!badges[b.key];
    return `<span class="badge" style="${got?'':'opacity:.45'}">${b.label}${got?' ✅':''}</span>`;
  }).join(" ");
  wrap.innerHTML = items;
}

// --- Défi hebdo
export function getWeeklyChallenge(){
  // Id de semaine ISO (YYYY-WW)
  const d = new Date(); 
  const week = getWeekId(d);
  let stored = JSON.parse(localStorage.getItem(LS.challenge) || "null");
  if (!stored || stored.weekId !== week) {
    stored = { weekId: week, targetPct: randomInt(3,7), done:false }; // ex: réduire une catégorie de 3–7%
    localStorage.setItem(LS.challenge, JSON.stringify(stored));
  }
  return stored;
}

export function completeWeeklyChallenge(){
  const c = getWeeklyChallenge();
  if (!c.done) {
    c.done = true;
    localStorage.setItem(LS.challenge, JSON.stringify(c));
    toast("💪 Défi de la semaine validé !");
    addSavingsBoost(25); // petit bonus virtuel pour la progression (25€)
  }
  renderChallenge();
}

function addSavingsBoost(eur){
  const cur = Number(localStorage.getItem(LS.savings) || 0);
  localStorage.setItem(LS.savings, String(cur + eur));
  const GOAL = Number(localStorage.getItem("econya:goal") || 2000);
  setPlant(Math.min(100, Math.round(((cur+eur)/GOAL)*100)));
}

function renderChallenge(){
  const el = document.getElementById("challenge-box");
  if (!el) return;
  const c = getWeeklyChallenge();
  el.innerHTML = `
    <div class="badge">Défi</div>
    <div style="margin-top:6px">Réduisez une catégorie de <strong>${c.targetPct}%</strong> cette semaine.</div>
    <div style="margin-top:8px">
      <button id="btn-challenge-done" class="btn ${c.done?'ghost':''}" ${c.done?'disabled':''}>${c.done?'Défi validé ✅':'Marquer comme fait'}</button>
    </div>
  `;
  document.getElementById("btn-challenge-done")?.addEventListener("click", completeWeeklyChallenge);
}

// --- Utils & toasts
function toast(msg){
  let t = document.getElementById("toast");
  if(!t){
    t = document.createElement("div");
    t.id="toast";
    t.style.position="fixed"; t.style.right="12px"; t.style.bottom="12px";
    t.style.background="rgba(0,0,0,.7)"; t.style.color="#fff";
    t.style.padding="10px 14px"; t.style.borderRadius="10px"; t.style.zIndex=9999;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  setTimeout(()=>{ t.style.transition="opacity .5s"; t.style.opacity="0"; }, 1800);
}

function getWeekId(d){
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(),0,4));
  const week = 1 + Math.round(((date - firstThursday)/86400000 - 3 + (firstThursday.getUTCDay()+6)%7) / 7);
  return date.getUTCFullYear() + "-W" + String(week).padStart(2,"0");
}
function randomInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

// --- Rendu initial
document.addEventListener("DOMContentLoaded", ()=>{
  // zone badges + défi si présentes dans le HTML
  renderBadges(JSON.parse(localStorage.getItem(LS.badges) || "{}"));
  renderChallenge();
  // mode sombre auto (bonus)
  if (matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.classList.add("dark");
});
