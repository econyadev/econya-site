/* Coach Éco – KPIs + bouton “Optimiser” (3 conseils rapides) */

const $ = (s) => document.querySelector(s);
const apiBase = (window.ECONYA_API_BASE || "").replace(/\/+$/,"");
const euro = (n) => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n||0);

/* Année + ping backend */
$("#year") && ($("#year").textContent = new Date().getFullYear());
(async () => {
  const el = $("#api-status");
  if (!el) return;
  if (!apiBase) { el.textContent="Backend non configuré"; el.classList.remove("ghost"); el.classList.add("ko"); return; }
  try {
    const r = await fetch(apiBase + "/sante");
    el.textContent = r.ok ? "Backend connecté ✅" : "Backend indisponible ❌";
    el.classList.remove("ghost");
    el.classList.toggle("ok", r.ok);
    el.classList.toggle("ko", !r.ok);
  } catch {
    el.textContent="Backend indisponible ❌"; el.classList.remove("ghost"); el.classList.add("ko");
  }
})();

/* 1) Récup / synthèse simple depuis ton backend mock */
async function loadMonth() {
  const ym = new Date().toISOString().slice(0,7); // AAAA-MM
  try {
    // essaie la route mois mock qu’on a ajoutée côté backend
    const url = `${apiBase}/transactions/month?ym=${ym}`;
    const tx = await fetch(url).then(r=>r.json()).catch(()=>null);
    if (!tx || !Array.isArray(tx)) throw new Error("no tx");

    const sums = tx.reduce((a,t)=>{
      a.total += t.amount;
      if (t.amount>0) a.income += t.amount; else a.expenses += Math.abs(t.amount);
      const c = (t.category||"Autres");
      a.cats[c] = (a.cats[c]||0) + Math.abs(t.amount);
      return a;
    },{total:0, income:0, expenses:0, cats:{}});
    const savings = Math.max(0, sums.income - sums.expenses);

    $("#k-expenses").textContent = euro(sums.expenses);
    $("#k-income").textContent   = euro(sums.income);
    $("#k-savings").textContent  = euro(savings);

    renderCats(sums.cats);
    // garde un snapshot des catégories pour d’autres pages
    try { localStorage.setItem("econya:cats", JSON.stringify(sums.cats)); } catch {}
  } catch {
    // fallback si backend non relié : on affiche des placeholders
    $("#k-expenses").textContent = euro(1200);
    $("#k-income").textContent   = euro(2200);
    $("#k-savings").textContent  = euro(1000);
    renderCats({"Énergie":120,"Télécom":45,"Courses":380,"Transport":95});
  }
}

function renderCats(map) {
  const cont = $("#cats");
  const entries = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8);
  cont.innerHTML = entries.map(([k,v])=>`<span class="chip">${k} · ${euro(v)}</span>`).join("") || `<span class="chip ghost">Aucune donnée</span>`;
}

/* 2) Optimiser : 3 conseils basés sur les catégories détectées */
function buildTips() {
  let cats = {};
  try { cats = JSON.parse(localStorage.getItem("econya:cats")||"{}"); } catch {}
  const top = Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k])=>k);

  const has = (name) => top.includes(name);
  const tips = [];

  if (has("Énergie")) {
    tips.push({
      title: "Énergie : change de contrat",
      desc: "Tarif fixe 12 mois ou indexé ? Compare et bascule : ~120–180€/an d’économies en moyenne.",
      action: "Comparer les offres énergie",
      href: "deals.html?cat=Énergie"
    });
  }
  if (has("Télécom")) {
    tips.push({
      title: "Télécom : renégocie ou bascule",
      desc: "Forfait mobile à < 10€ et box < 25€ suffisent souvent. Appelle ton opérateur ou migre.",
      action: "Voir forfaits télécom",
      href: "deals.html?cat=Télécom"
    });
  }
  if (has("Assurance") || has("Banque")) {
    tips.push({
      title: "Banque & assurances : packs",
      desc: "Cartes/assurances packagées → souvent redondantes. Détaille et supprime l’inutile.",
      action: "Découvrir les alternatives",
      href: "deals.html?cat=Banque"
    });
  }
  if (tips.length < 3) {
    tips.push({
      title: "Cashback & codes",
      desc: "Active le cashback (1–5%) et installe une extension coupons pour capter l’épargne facile.",
      action: "Activer le cashback",
      href: "deals.html?cat=Cashback"
    });
  }
  // complète jusqu’à 3 conseils
  while (tips.length < 3) {
    tips.push({
      title: "Optimisation générale",
      desc: "Repère les abonnements ‘fantômes’, mets des alertes de renouvellement et supprime le superflu.",
      action: "Voir tous les bons plans",
      href: "deals.html"
    });
  }
  return tips.slice(0,3);
}

function openOptimModal() {
  const tips = buildTips();
  const list = tips.map(t => `
    <article class="card" style="margin:0">
      <h4 style="margin:0 0 4px">${t.title}</h4>
      <p style="margin:0 0 8px">${t.desc}</p>
      <a class="btn" href="${t.href}">${t.action}</a>
    </article>`).join("");
  $("#optim-list").innerHTML = list;
  $("#optim-modal").showModal();
}

/* listeners modal */
$("#btn-optim").addEventListener("click", openOptimModal);
document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => $("#optim-modal").close()));

/* go */
loadMonth();
