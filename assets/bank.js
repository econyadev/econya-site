// actifs/banque.js — logiques front banque (OB mock + transactions démo)

/* Helpers */
const $ = (sel) => document.querySelector(sel);
const apiBase = (window.ECONYA_API_BASE || "").replace(/\/+$/, "");

/* Badge année */
$("#year") && ($("#year").textContent = new Date().getFullYear());

/* Badges statut */
const apiBadge = $("#api-status");
const obBadge  = $("#ob-status");

function setBadge(el, text, ok) {
  el.textContent = text;
  el.classList.remove("ok","ko","ghost");
  if (ok === true) el.classList.add("ok");
  else if (ok === false) el.classList.add("ko");
  else el.classList.add("ghost");
}

/* Vérif backend */
(async () => {
  if (!apiBase) {
    setBadge(apiBadge, "Backend non configuré", false);
    return;
  }
  try {
    const r = await fetch(apiBase + "/sante", { mode: "cors" });
    setBadge(apiBadge, r.ok ? "Backend connecté ✅" : "Backend indisponible ❌", r.ok);
  } catch {
    setBadge(apiBadge, "Backend indisponible ❌", false);
  }
})();

/* =======================
   Parcours Open Banking (mock)
   ======================= */

let pollTimer = null;

async function getOBStatus() {
  const r = await fetch(apiBase + "/ob/status", { mode: "cors" });
  if (!r.ok) throw new Error("status http " + r.status);
  return r.json();
}

async function startPolling() {
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    try {
      const s = await getOBStatus();
      if (s.linked) {
        setBadge(obBadge, "Banque reliée ✅", true);
        clearInterval(pollTimer);
        // une fois relié → (re)charger synthèse & transactions
        renderKpis();
        renderTransactions();
      } else {
        setBadge(obBadge, "Banque non reliée", null);
      }
    } catch {
      setBadge(obBadge, "Banque non reliée", null);
    }
  }, 1500);
}

$("#ob-connect-btn")?.addEventListener("click", async () => {
  if (!apiBase) return alert("Backend non configuré.");
  try {
    const r = await fetch(apiBase + "/ob/start", { mode: "cors" });
    const data = await r.json();
    if (!data.url) throw new Error("URL manquante");
    // Ouvre le “fournisseur” (mock). Tu peux mettre _blank si tu veux nouvel onglet.
    window.location.href = data.url;
  } catch (e) {
    alert("Impossible de démarrer la liaison.");
    console.error(e);
  }
});

$("#ob-reset-btn")?.addEventListener("click", async () => {
  if (!apiBase) return;
  try {
    await fetch(apiBase + "/ob/reset", { method: "POST", mode: "cors" });
  } catch {}
  setBadge(obBadge, "Banque non reliée", null);
  renderKpis(true);
  renderTransactions(true);
});

// Au chargement : on vérifie si déjà relié
startPolling();

/* =======================
   Données démo + KPIs
   ======================= */

// Transactions démo (revenus = positif, dépenses = négatif)
const DEMO_TX = [
  { date: "2025-08-01", label: "Salaire", category: "Revenus", amount: 2200.00 },
  { date: "2025-08-02", label: "Loyer", category: "Logement", amount: -850.00 },
  { date: "2025-08-03", label: "Supermarché", category: "Courses", amount: -126.45 },
  { date: "2025-08-05", label: "Abonnement mobile", category: "Télécom", amount: -19.99 },
  { date: "2025-08-09", label: "Restaurant", category: "Sorties", amount: -42.30 },
  { date: "2025-08-12", label: "Transport", category: "Mobilité", amount: -24.80 },
  { date: "2025-08-15", label: "Freelance", category: "Revenus", amount: 350.00 },
  { date: "2025-08-16", label: "Énergie", category: "Logement", amount: -68.10 },
  { date: "2025-08-21", label: "Pharmacie", category: "Santé", amount: -14.20 },
  { date: "2025-08-24", label: "Café", category: "Sorties", amount: -6.30 },
  { date: "2025-08-27", label: "Cinéma", category: "Loisirs", amount: -11.50 }
];

// Valeur par défaut de l’input month = mois courant
(function setDefaultMonth(){
  const m = $("#tx-month");
  if (!m) return;
  const d = new Date();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  m.value = `${d.getFullYear()}-${mm}`;
})();

function parseMonthValue(v) {
  // "YYYY-MM" → { y, m } (m = 1..12)
  const [yy, mm] = (v || "").split("-");
  return { y: Number(yy), m: Number(mm) };
}

function filterByMonth(list, ym) {
  return list.filter(tx => {
    const d = new Date(tx.date);
    return (d.getFullYear() === ym.y) && (d.getMonth()+1 === ym.m);
  });
}

function euro(n) {
  return (n||0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* KPIs */
function renderKpis(reset=false) {
  const incEl = $("#kpi-inc");
  const expEl = $("#kpi-exp");
  const savEl = $("#kpi-sav");
  if (reset) {
    incEl.textContent = expEl.textContent = savEl.textContent = "—";
    return;
  }
  const ym = parseMonthValue($("#tx-month").value);
  const monthTx = filterByMonth(DEMO_TX, ym);
  const inc = monthTx.filter(t => t.amount > 0).reduce((a,t)=>a+t.amount, 0);
  const exp = monthTx.filter(t => t.amount < 0).reduce((a,t)=>a+t.amount, 0);
  const sav = inc + exp; // exp est négatif
  incEl.textContent = euro(inc);
  expEl.textContent = euro(Math.abs(exp));
  savEl.textContent = euro(sav);
}

/* Transactions table */
function renderTransactions(reset=false) {
  const tbody = $("#tx-tbody");
  const totalEl = $("#tx-total");
  if (reset) {
    tbody.innerHTML = "";
    totalEl.textContent = "0,00";
    return;
  }
  const ym = parseMonthValue($("#tx-month").value);
  const monthTx = filterByMonth(DEMO_TX, ym);

  tbody.innerHTML = monthTx.map(tx => `
    <tr>
      <td>${tx.date}</td>
      <td>${tx.label}</td>
      <td>${tx.category}</td>
      <td style="text-align:right;${tx.amount<0?'color:#c0392b':'color:#115c2d'}">
        ${tx.amount<0?'-':''}${euro(Math.abs(tx.amount))}
      </td>
    </tr>
  `).join("");

  const total = monthTx.reduce((a,t)=>a+t.amount, 0);
  totalEl.textContent = euro(total);
}

$("#tx-load")?.addEventListener("click", () => {
  renderKpis();
  renderTransactions();
});
