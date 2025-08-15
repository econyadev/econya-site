// Gamification – page dashboard (branche la logique gamify.js à l’UI de la route /gamification)
import { euro } from "./common.js";
import { syncProgressFromCoach, setPlant, getWeeklyChallenge, completeWeeklyChallenge } from "./gamify.js";

const LS = {
  savings: "econya:savings:year",
};

function loadState(){
  const goal  = Number(localStorage.getItem("econya:goal") || 2000);
  const saved = Math.max(0, Number(localStorage.getItem(LS.savings) || 0));
  const pct   = Math.min(100, Math.round((saved/goal)*100));
  return { goal, saved, pct };
}

function renderHeader(){
  const { goal, saved, pct } = loadState();
  const gp = document.getElementById("g-pct");
  const gs = document.getElementById("g-saved");
  const gg = document.getElementById("g-goal");
  if (gp) gp.textContent = pct + "%";
  if (gs) gs.textContent = euro(saved);
  if (gg) gg.textContent = euro(goal);
  const inGoal = document.getElementById("g-input-goal");
  if (inGoal) inGoal.value = goal;
  setPlant(pct);
}

function bindActions(){
  document.getElementById("g-btn-save-goal")?.addEventListener("click", ()=>{
    const val = Number(document.getElementById("g-input-goal").value || 0);
    if (!Number.isFinite(val) || val < 100) return alert("Objectif invalide");
    localStorage.setItem("econya:goal", String(val));
    renderHeader();
  });

  document.getElementById("g-btn-reset")?.addEventListener("click", ()=>{
    if (!confirm("Réinitialiser la progression locale ?")) return;
    localStorage.removeItem(LS.savings);
    renderHeader();
  });

  document.getElementById("g-export-json")?.addEventListener("click", ()=>{
    const dump = {};
    Object.keys(localStorage).forEach(k=>{
      if (k.startsWith("econya:")) dump[k] = localStorage.getItem(k);
    });
    const out = document.getElementById("g-export-out");
    if (out) out.textContent = JSON.stringify(dump, null, 2);
  });
}

function renderRank(){
  // Démo : génère des lignes factices et insère votre profil
  const mine = Math.max(0, Number(localStorage.getItem(LS.savings) || 0));
  const peers = Array.from({length: 9}).map((_,i)=>({
    name: "Profil-"+(i+1),
    saved: Math.round(300 + Math.random()*2500)
  }));
  peers.push({ name:"Vous", saved: mine });
  peers.sort((a,b)=> b.saved - a.saved);
  const tbody = document.getElementById("g-rank-body");
  if (!tbody) return;
  tbody.innerHTML = peers.map((p,idx)=>`
    <tr>
      <td>${idx+1}</td>
      <td>${p.name}</td>
      <td class="right">${euro(p.saved)}</td>
    </tr>
  `).join("");
}

// Ré-expose le défi avec bouton (au cas où la page se charge avant gamify.js)
function wireChallengeBox(){
  const c = getWeeklyChallenge();
  const el = document.getElementById("challenge-box");
  if (!el) return;
  el.innerHTML = `
    <div class="badge">Défi</div>
    <div style="margin-top:6px">Réduisez une catégorie de <strong>${c.targetPct}%</strong> cette semaine.</div>
    <div style="margin-top:8px">
      <button id="btn-challenge-done" class="btn ${c.done?'ghost':''}" ${c.done?'disabled':''}>${c.done?'Défi validé ✅':'Marquer comme fait'}</button>
    </div>
  `;
  document.getElementById("btn-challenge-done")?.addEventListener("click", ()=>{
    completeWeeklyChallenge();
    renderHeader(); // met à jour progression si bonus appliqué
  });
}

function init(){
  renderHeader();
  bindActions();
  renderRank();
  wireChallengeBox();
}

document.addEventListener("DOMContentLoaded", init);

// (Option) petite intégration : si Coach Eco vient d’estimer une économie, forcer un refresh visuel
window.addEventListener("econya:coach:update", (e)=>{
  const potential = Number(e.detail?.potential || 0);
  syncProgressFromCoach(potential);
  renderHeader();
});
