/* assets/deals.js – Bons plans + tracking succès */
const $ = (sel) => document.querySelector(sel);
const apiBase = (window.ECONYA_API_BASE || "").replace(/\/+$/,"");
const euro = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n || 0);
const AKEY = "econya:achievements";

function aLoad(){ try{ return JSON.parse(localStorage.getItem(AKEY)||"{}"); }catch{ return {}; } }
function aSave(v){ localStorage.setItem(AKEY, JSON.stringify(v)); }

/* Année + backend */
$("#year") && ($("#year").textContent = new Date().getFullYear());
(async () => {
  const el = $("#api-status");
  if (!el) return;
  if (!apiBase) { el.textContent = "Backend non configuré"; el.classList.remove("ghost"); el.classList.add("ko"); return; }
  try {
    const res = await fetch(apiBase + "/sante");
    el.textContent = res.ok ? "Backend connecté ✅" : "Backend indisponible ❌";
    el.classList.remove("ghost");
    el.classList.toggle("ok", res.ok);
    el.classList.toggle("ko", !res.ok);
  } catch {
    el.textContent = "Backend indisponible ❌"; el.classList.remove("ghost"); el.classList.add("ko");
  }
})();

let ALL_DEALS = [];

function cardTpl(d) {
  const cat = d.category || "Divers";
  const saving = d.saving ? `<span class="saving">${euro(d.saving)}/an estimés</span>` : "";
  const partner = d.partner ? `<span class="partner">${d.partner}</span>` : "";
  const country = d.country || "";
  const goUrl = `${apiBase}/go?id=${encodeURIComponent(d.id)}&src=econya&md=bons-plans&cmp=${encodeURIComponent(d.id)}`;

  return `
  <article class="card deal" data-cat="${cat}" data-country="${country}">
    <div class="deal-head">
      <h3 class="deal-title">${d.label}</h3>
      ${saving}
    </div>
    <div class="deal-meta">
      <span class="chip">${cat}</span>
      ${country ? `<span class="chip ghost">${country}</span>` : ""}
      ${partner ? `<span class="chip ghost">${partner}</span>` : ""}
    </div>
    <div class="deal-actions">
      <a href="${goUrl}" target="_blank" rel="nofollow noopener" class="btn"
         data-go data-id="${d.id}" data-cat="${cat}" data-saving="${Number(d.saving||0)}">Voir l’offre</a>
      <button class="btn ghost" data-compare="${d.id}">Comparer</button>
    </div>
  </article>`;
}

function renderGrid(list) {
  $("#deals-grid").innerHTML = list.map(cardTpl).join("") || `
    <div class="card ghost" style="grid-column:1/-1;text-align:center">
      Aucun résultat pour vos filtres.
    </div>`;
  wireClicks();
}

function applyFilters() {
  const cat = $("#f-cat").value.trim();
  const ctry = $("#f-country").value.trim();
  const q = $("#f-q").value.trim().toLowerCase();
  const filtered = ALL_DEALS.filter(d => {
    if (cat && (d.category || "") !== cat) return false;
    if (ctry && (d.country || "") !== ctry) return false;
    if (q) {
      const hay = `${d.label} ${d.partner||""} ${d.category||""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  renderGrid(filtered);
}

$("#f-clear").addEventListener("click", () => { $("#f-cat").value=""; $("#f-country").value=""; $("#f-q").value=""; applyFilters(); });
["#f-cat","#f-country","#f-q"].forEach(id => $(id).addEventListener("input", applyFilters));

/* branchement des clics / succès */
function wireClicks(){
  document.querySelectorAll("a[data-go]").forEach(a=>{
    a.addEventListener("click", ()=>{
      const cat = a.getAttribute("data-cat") || "Divers";
      const savingY = Number(a.getAttribute("data-saving")||0); // €/an estimés
      const incWeek = savingY/12/4; // ~€/semaine

      const st = aLoad();
      st.optim = st.optim || {};
      st.optim[cat] = (st.optim[cat]||0) + 1;

      // cumule hebdo pour le défi
      const week = st.week || {};
      week.since = week.since || Date.now();
      week.saved = Number(week.saved||0) + incWeek;
      st.week = week;

      st.last = { cat, id: a.getAttribute("data-id"), ts: Date.now(), incWeek };
      aSave(st);
    });
  });
}

/* init */
(async function init() {
  try {
    const st = await fetch(apiBase + "/deals/stats").then(r=>r.json());
    $("#k-saved").textContent = euro(st?.stats?.saved_estimate_eur || 0);
  } catch { $("#k-saved").textContent = "—"; }

  try {
    const data = await fetch(apiBase + "/deals").then(r=>r.json());
    ALL_DEALS = (data && data.deals) || [];
    renderGrid(ALL_DEALS);
  } catch {
    $("#deals-grid").innerHTML = `<div class="card ko">Impossible de charger les offres.</div>`;
  }
})();
