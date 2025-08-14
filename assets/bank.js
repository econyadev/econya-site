// assets/bank.js – banque démo (comptes + transactions + OB mock + Premium)

// Helpers
const $ = (sel) => document.querySelector(sel);
const apiBase = (window.ECONYA_API_BASE || "").replace(/\/+$/, "");

// Démo offline si backend KO
const DEMO_TX = [
  { id: 1, date: "2025-08-03", label: "Supermarché", amount: -54.2, category: "Courses" },
  { id: 2, date: "2025-08-05", label: "Salaire",      amount: 2200,  category: "Revenus" },
  { id: 3, date: "2025-08-12", label: "Essence",      amount: -52.9, category: "Transport" },
  { id: 4, date: "2025-08-18", label: "Internet",     amount: -29.9, category: "Abonnements" },
  { id: 5, date: "2025-08-28", label: "Resto",        amount: -32.5, category: "Sorties" }
];

const euro = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
const fmtDate = (s) => new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });

// Badges
const apiBadge = $("#api-status");
const obBadge  = $("#ob-status");
const planBadge = $("#plan-badge");

// “Plan” (simple démo côté front)
const PLAN = localStorage.getItem("econya_plan") || "free";
function setPlan(plan) {
  localStorage.setItem("econya_plan", plan);
  planBadge.textContent = (plan === "pro") ? "Premium" : "Gratuit";
  planBadge.classList.toggle("ghost", false);
  planBadge.classList.toggle("ok", plan === "pro");
}
setPlan(PLAN);

// Utilities
async function fetchWithTimeout(path, { timeout = 7000, method = "GET" } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  const url = `${apiBase}${path}`;
  const res = await fetch(url, { method, signal: ctrl.signal, headers: { Accept: "application/json" } });
  clearTimeout(id);
  return res;
}
function setBadge(el, text, ok = null) {
  el.textContent = text;
  el.classList.remove("ok", "ko", "ghost");
  if (ok === true)  el.classList.add("ok");
  if (ok === false) el.classList.add("ko");
}

// Vérif backend + OpenBanking (mock)
async function checkBackend() {
  if (!apiBase) {
    setBadge(apiBadge, "Backend non configuré", false);
    return false;
  }
  try {
    const res = await fetchWithTimeout("/sante");
    setBadge(apiBadge, res.ok ? "API OK" : `API ${res.status}`, res.ok);
    return res.ok;
  } catch {
    setBadge(apiBadge, "API KO", false);
    return false;
  }
}

// Comptes
async function loadAccounts() {
  const wrap = $("#accounts");
  wrap.textContent = "Chargement…";
  try {
    const res = await fetchWithTimeout("/mescomptes");
    const data = await res.json();
    wrap.innerHTML = data.accounts.map(acc => `
      <div class="account">
        <div class="acc-name">${acc.name}</div>
        <div class="acc-iban">${acc.iban}</div>
        <div class="acc-balance">${euro(acc.balance)}</div>
      </div>
    `).join("");
  } catch {
    wrap.innerHTML = `<div class="hint">Impossible de charger les comptes (démo hors ligne).<br/>Solde courant : <strong>${euro(980)}</strong></div>`;
  }
}

// Filtres & rendu transactions
function parseMonthValue(v) {
  if (!v) return null;
  const [y, m] = v.split("-").map(Number);
  return { y, m };
}
function filterByMonth(items, ym) {
  if (!ym) return items;
  return items.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === ym.y && (d.getMonth() + 1) === ym.m;
  });
}
function renderKPIs(items) {
  const el = $("#kpis");
  const revenus = items.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const depenses = items.filter(t => t.amount < 0).reduce((s,t) => s + t.amount, 0);
  const epargne = revenus + depenses; // depenses négatives
  el.innerHTML = `
    <div class="kpi"><div class="kpi-label">Revenus</div><div class="kpi-value">${euro(revenus)}</div></div>
    <div class="kpi"><div class="kpi-label">Dépenses</div><div class="kpi-value">${euro(Math.abs(depenses))}</div></div>
    <div class="kpi"><div class="kpi-label">Épargne nette</div><div class="kpi-value">${euro(epargne)}</div></div>
  `;
}
function renderCategories(items) {
  const list = $("#cat-split");
  const byCat = new Map();
  items.forEach(t => {
    if (t.amount < 0) {
      byCat.set(t.category, (byCat.get(t.category) || 0) + Math.abs(t.amount));
    }
  });
  const rows = [...byCat.entries()].sort((a,b) => b[1]-a[1]).slice(0, 8);
  list.innerHTML = rows.map(([c, sum]) => `<li><span>${c}</span><strong>${euro(sum)}</strong></li>`).join("") || "<li>—</li>";
}
function renderTransactions(items) {
  const tbody = $("#tx-tbody");
  const totalEl = $("#tx-total");
  tbody.innerHTML = items.map(tx => `
    <tr>
      <td>${fmtDate(tx.date)}</td>
      <td>${tx.label}</td>
      <td>${tx.category}</td>
      <td style="text-align:right; color:${tx.amount>=0 ? '#0d7a2f' : '#c0392b'}">${euro(Math.abs(tx.amount))}</td>
    </tr>
  `).join("");
  const total = items.reduce((s,t)=> s + t.amount, 0);
  totalEl.textContent = euro(total);
  renderKPIs(items);
  renderCategories(items);
}

// Charge backend ou fallback démo
async function loadTransactions() {
  const ym = parseMonthValue($("#tx-month").value);
  try {
    const path = ym ? `/transactions?month=${ym.y}-${String(ym.m).padStart(2,"0")}` : "/transactions";
    const res = await fetchWithTimeout(path);
    const data = await res.json();
    renderTransactions(data.transactions || []);
  } catch {
    renderTransactions(filterByMonth(DEMO_TX, ym));
  }
}

// Export CSV (gratuit : transactions ; premium : +cat split)
function toCSV(rows, headers) {
  const esc = s => `"${String(s).replace(/"/g,'""')}"`;
  const head = headers.map(esc).join(",");
  const body = rows.map(r => headers.map(h => esc(r[h])).join(",")).join("\n");
  return head + "\n" + body;
}
function download(name, content, type="text/csv") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
function exportCSV(items) {
  const rows = items.map(t => ({
    date: t.date, label: t.label, category: t.category, amount: t.amount
  }));
  let csv = toCSV(rows, ["date","label","category","amount"]);
  if ((localStorage.getItem("econya_plan") || "free") === "pro") {
    // Bonus premium : ajouter un sommaire par catégorie à la fin
    const byCat = new Map();
    items.forEach(t => { if (t.amount<0) byCat.set(t.category,(byCat.get(t.category)||0)+Math.abs(t.amount)); });
    const add = "\n\nRésumé par catégorie\n" + toCSV(
      [...byCat.entries()].map(([category, total])=>({category,total})),
      ["category","total"]
    );
    csv += add;
  }
  download("transactions.csv", csv);
}

// Open Banking (mock)
async function startOB() {
  try {
    const res = await fetchWithTimeout("/ob/start");
    const data = await res.json();
    // redirection vers la page “fournisseur” (mock) fournie par le backend
    window.location.href = data.url;
  } catch {
    setBadge(obBadge, "Impossible de démarrer", false);
    alert("Démo OB indisponible pour le moment.");
  }
}

// “Premium” upsell simple
function openPremiumModal() {
  const ok = confirm(
    "Passer en Premium ?\n\nAvantages :\n• Catégorisation avancée & multi-comptes\n• Graphiques & budgets\n• Export enrichi & historique illimité\n\nAppuyez sur OK pour activer (démo locale)."
  );
  if (ok) { setPlan("pro"); alert("Premium activé (démo locale). Rechargez la page."); }
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
  // année footer
  $("#year").textContent = new Date().getFullYear();

  // par défaut : mois en cours
  const now = new Date();
  $("#tx-month").value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

  // boutons
  $("#tx-load").addEventListener("click", loadTransactions);
  $("#tx-export").addEventListener("click", async () => {
    // on réutilise ce qui est rendu à l’écran
    const ym = parseMonthValue($("#tx-month").value);
    try {
      const path = ym ? `/transactions?month=${ym.y}-${String(ym.m).padStart(2,"0")}` : "/transactions";
      const res = await fetchWithTimeout(path);
      const data = await res.json();
      exportCSV(data.transactions || []);
    } catch {
      exportCSV(filterByMonth(DEMO_TX, ym));
    }
  });
  $("#ob-start").addEventListener("click", startOB);
  $("#open-premium").addEventListener("click", (e)=>{ e.preventDefault(); openPremiumModal(); });

  // checks + premières données
  const ok = await checkBackend();
  if (ok) { await loadAccounts(); setBadge(obBadge, "Prêt (démo)", true); }
  await loadTransactions();
});

