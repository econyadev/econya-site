// assets/bank-charts.js
// Rend les graphes si le plan est "pro", sinon affiche un CTA d'upgrade.

(function () {
  const $ = (sel) => document.querySelector(sel);
  const apiBase = (window.ECONYA_API_BASE || "").replace(/\/+$/, "");
  const plan = (window.ECONYA_PLAN || "free").toLowerCase();

  const elCharts = $("#charts-pro");
  const elCTA = $("#upgrade-cta");
  const elPlan = $("#plan-badge");
  const elMonthLabel = $("#chart-month-label");

  // Si page non concernée, on sort poliment
  if (!elCharts && !elCTA) return;

  // Affichage selon plan
  if (plan !== "pro") {
    if (elCharts) elCharts.style.display = "none";
    if (elCTA) elCTA.style.display = "";
    if (elPlan) { elPlan.textContent = "Gratuit"; elPlan.classList.remove("premium"); }
    return;
  } else {
    if (elCharts) elCharts.style.display = "";
    if (elCTA) elCTA.style.display = "none";
    if (elPlan) { elPlan.textContent = "Premium"; elPlan.classList.add("premium"); }
  }

  // Helpers
  const euro = (n) =>
    (n < 0 ? "-" : "") +
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Math.abs(n));

  function monthKey(d) { // "YYYY-MM"
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  function groupByCategory(transactions) {
    const out = {};
    for (const tx of transactions) {
      const cat = tx.category || "Autre";
      const amt = Number(tx.amount) || 0;
      if (amt < 0) { // dépenses uniquement
        out[cat] = (out[cat] || 0) + Math.abs(amt);
      }
    }
    return out;
  }

  function buildMonthlySeries(allTx) {
    // 12 derniers mois
    const labels = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(monthKey(d));
    }
    const seriesIncome = labels.map(() => 0);
    const seriesExpense = labels.map(() => 0);

    for (const tx of allTx) {
      const k = monthKey(tx.date);
      const i = labels.indexOf(k);
      if (i === -1) continue;
      const amt = Number(tx.amount) || 0;
      if (amt >= 0) seriesIncome[i] += amt;
      else seriesExpense[i] += Math.abs(amt);
    }
    return { labels, seriesIncome, seriesExpense };
  }

  async function getAllTransactions() {
    // Essaie l’API, sinon retombe sur données démo (si exposées globalement par bank.js)
    try {
      const r = await fetch(`${apiBase}/transactions`, { headers: { Accept: "application/json" }});
      if (r.ok) {
        const js = await r.json();
        // Format attendu: { transactions: [{date, label, category, amount}, ...] }
        if (Array.isArray(js.transactions)) return js.transactions;
      }
    } catch (e) { /* ignore */ }
    // Fallback
    if (Array.isArray(window.DEMO_TX)) return window.DEMO_TX;
    return []; // à défaut
  }

  function getMonthFromUI() {
    // Prend le mois de ton sélecteur existant s’il est là (#tx-month), sinon le mois courant
    const input = $("#tx-month");
    if (input && input.value) return input.value; // "YYYY-MM"
    return monthKey(new Date());
  }

  function filterByMonth(all, ym) {
    return all.filter((t) => monthKey(t.date) === ym);
  }

  // --- Charts
  let pie, line;

  function renderPie(ctx, catTotals) {
    const labels = Object.keys(catTotals);
    const values = labels.map((k) => catTotals[k]);
    if (pie) pie.destroy();
    pie = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data: values }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (tt) => `${tt.label}: ${euro(tt.raw)}`
            }
          }
        }
      }
    });
  }

  function renderLine(ctx, labels, income, expense) {
    if (line) line.destroy();
    line = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Revenus", data: income },
          { label: "Dépenses", data: expense }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        stacked: false,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (tt) => `${tt.dataset.label}: ${euro(tt.raw)}`
            }
          }
        },
        scales: {
          y: {
            ticks: { callback: (v) => euro(v) }
          }
        }
      }
    });
  }

  // --- Init
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const allTx = await getAllTransactions();
      const ym = getMonthFromUI();
      const monthTx = filterByMonth(allTx, ym);
      if (elMonthLabel) elMonthLabel.textContent = ym;

      // Camembert du mois
      const catTotals = groupByCategory(monthTx);
      const pieCtx = document.getElementById("chart-pie");
      if (pieCtx) renderPie(pieCtx, catTotals);

      // Courbes 12 mois
      const { labels, seriesIncome, seriesExpense } = buildMonthlySeries(allTx);
      const lineCtx = document.getElementById("chart-line");
      if (lineCtx) renderLine(lineCtx, labels, seriesIncome, seriesExpense);

      // Si l’utilisateur change de mois (#tx-month existant), maj auto
      const monthInput = $("#tx-month");
      const btnLoad = $("#tx-load");
      const reload = () => {
        const ym2 = getMonthFromUI();
        const monthTx2 = filterByMonth(allTx, ym2);
        if (elMonthLabel) elMonthLabel.textContent = ym2;
        const catTotals2 = groupByCategory(monthTx2);
        const pieCtx2 = document.getElementById("chart-pie");
        if (pieCtx2) renderPie(pieCtx2, catTotals2);
      };
      if (monthInput) monthInput.addEventListener("change", reload);
      if (btnLoad) btnLoad.addEventListener("click", reload);
    } catch (e) {
      console.error("Charts init error:", e);
    }
  });
})();
