// Profil éco – analyse locale + exports
import { $, apiBase, euro } from "./common.js";

function monthValue(){
  return $("#pe-month").value || new Date().toISOString().slice(0,7);
}

async function fetchJSON(url, opts={}){
  const r = await fetch(url, opts);
  if(!r.ok) throw new Error("HTTP "+r.status);
  return r.json();
}

function sum(arr){ return arr.reduce((a,n)=>a+n,0); }
function groupBy(arr, keyFn){
  const m = new Map();
  for(const it of arr){
    const k = keyFn(it);
    if(!m.has(k)) m.set(k, []);
    m.get(k).push(it);
  }
  return m;
}

// Heuristique "abonnements" : même libellé récurrent, montants proches
function detectSubscriptions(allTx){
  // On regroupe par libellé simplifié
  const norm = s => String(s||"").toLowerCase().replace(/\s+/g," ").trim();
  const groups = groupBy(allTx, t => norm(t.label));
  const subs = [];
  for(const [lib, txs] of groups.entries()){
    if(!lib || txs.length < 3) continue;
    // montants (valeur absolue) proches : écart-type relatif faible
    const amounts = txs.map(t => Math.abs(Number(t.amount||0))).filter(n=>n>0);
    if(amounts.length < 3) continue;
    const avg = sum(amounts)/amounts.length;
    const variance = sum(amounts.map(a=>(a-avg)*(a-avg)))/amounts.length;
    const stdev = Math.sqrt(variance);
    if (avg===0) continue;
    const rel = stdev/avg;
    if (rel < 0.25) { // ~montants similaires
      // Estimation périodicité "mensuelle" si présence sur >= 2 mois différents
      const months = new Set(txs.map(t => String(t.date||"").slice(0,7)));
      if (months.size >= 2) {
        const sample = txs[0];
        subs.push({
          label: sample.label || lib,
          amount: Math.round(avg*100)/100,
          period: "Mensuelle (estim.)"
        });
      }
    }
  }
  // tri par montant décroissant
  subs.sort((a,b)=> b.amount - a.amount);
  // limite 10
  return subs.slice(0,10);
}

function renderCategories(txMonth){
  // On agrège par catégorie (pour dépenses négatives)
  const neg = txMonth.filter(t => Number(t.amount) < 0);
  const byCat = groupBy(neg, t => t.category || "Autres");
  const rows = [];
  for(const [cat, items] of byCat.entries()){
    const total = sum(items.map(t=>Math.abs(Number(t.amount))));
    rows.push({ cat, total });
  }
  rows.sort((a,b)=> b.total - a.total);
  const top = rows.slice(0,5);

  // rendu "barres" CSS
  const max = Math.max(1, ...top.map(r=>r.total));
  const html = top.map(r=>`
    <div style="margin:8px 0">
      <div style="display:flex;justify-content:space-between;gap:8px">
        <strong>${r.cat}</strong>
        <span>${euro(r.total)}</span>
      </div>
      <div style="height:10px;border-radius:8px;background:rgba(255,255,255,.08);overflow:hidden">
        <div style="width:${(r.total/max*100).toFixed(0)}%;height:100%;background:linear-gradient(90deg,#2fd36a,#8cf1b2)"></div>
      </div>
    </div>
  `).join("");
  $("#pe-cats").innerHTML = html || `<div class="muted">Pas encore de transactions pour ce mois.</div>`;
}

async function loadProfile(){
  const ym = monthValue();
  const tx = await fetchJSON(apiBase + "/transactions");
  const txMonth = tx.filter(t => (t.date||"").startsWith(ym));

  const spend  = sum(txMonth.filter(t=>t.amount<0).map(t=>Math.abs(t.amount)));
  const income = sum(txMonth.filter(t=>t.amount>0).map(t=>t.amount));
  const saving = Math.max(0, (income*0.15) - (spend*0.05)); // démo simple

  $("#pe-spend").textContent  = euro(spend);
  $("#pe-income").textContent = euro(income);
  $("#pe-saving").textContent = euro(saving);

  renderCategories(txMonth);

  // abonnements : on détecte sur tout l'historique (pas que le mois)
  const subs = detectSubscriptions(tx);
  $("#pe-subs").innerHTML = subs.length ? subs.map(s=>`
    <tr><td>${s.label}</td><td class="right">${euro(s.amount)}</td><td>${s.period}</td></tr>
  `).join("") : `<tr><td colspan="3" class="muted">Aucun abonnement récurrent détecté (démo).</td></tr>`;
}

function exportFile(kind){
  // Essaie d'ajouter le token si disponible
  const token = window.ECONYA_TOKEN || localStorage.getItem("econya_token") || "";
  const search = new URLSearchParams();
  // (option) bornes from/to basées sur le mois sélectionné
  const ym = monthValue(); // YYYY-MM
  if (ym) {
    const [y,m] = ym.split("-");
    const from = `${y}-${m}-01`;
    search.set("from", from);
    // to = fin de mois (approx 31)
    search.set("to",   `${y}-${m}-31`);
  }
  if (token) search.set("token", token);

  const url = apiBase + (kind==="csv" ? "/export/csv" : "/export/pdf") + (search.toString()?`?${search.toString()}`:"");
  // Ouvre dans un nouvel onglet (téléchargement)
  window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", ()=>{
  // Valeur par défaut : mois courant
  $("#pe-month").value = new Date().toISOString().slice(0,7);
  $("#pe-refresh").addEventListener("click", loadProfile);
  $("#pe-export-csv").addEventListener("click", ()=>exportFile("csv"));
  $("#pe-export-pdf").addEventListener("click", ()=>exportFile("pdf"));
});
