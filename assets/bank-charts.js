/* assets/bank-charts.js
   Rendu de 2 graphiques (pie catégories / line 12 mois) si window.Chart dispo
   Appelé par bank.js via window.renderBankCharts(...)
*/
(function(){
  function euro(n){ return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n); }

  window.renderBankCharts = function(items, monthLabel){
    if (!window.Chart) return;
    const ctxPie  = document.getElementById("chart-pie")?.getContext("2d");
    const ctxLine = document.getElementById("chart-line")?.getContext("2d");
    const labelEl = document.getElementById("chart-month-label");
    if (labelEl && monthLabel) labelEl.textContent = monthLabel;

    // PIE : dépenses par catégorie (mois courant)
    const byCat = new Map();
    items.forEach(t => { if(t.amount<0){ const k=t.category||"Autre"; byCat.set(k,(byCat.get(k)||0)+Math.abs(t.amount)); }});
    const pieLabels = [...byCat.keys()];
    const pieData   = [...byCat.values()];
    if (ctxPie){
      if (window.__pie) window.__pie.destroy();
      window.__pie = new Chart(ctxPie, {
        type: "pie",
        data: { labels: pieLabels, datasets: [{ data: pieData }] },
        options: { plugins:{ legend:{ position:"bottom" }, tooltip:{ callbacks:{ label:(c)=> `${c.label}: ${euro(c.parsed)}` } } } }
      });
    }

    // LINE : simple fake 12 mois (si tu as l'historique, remplace par de vrais données)
    const months = Array.from({length:12}, (_,i)=> {
      const d = new Date(); d.setMonth(d.getMonth()- (11-i));
      return d.toISOString().slice(0,7);
    });
    const mapMonthSpend = new Map(months.map(m=>[m,0]));
    items.forEach(t => { if(t.amount<0){ const m = String(t.date).slice(0,7); if(mapMonthSpend.has(m)) mapMonthSpend.set(m, mapMonthSpend.get(m)+Math.abs(t.amount)); }});
    const lineData = months.map(m => mapMonthSpend.get(m)||0);

    if (ctxLine){
      if (window.__line) window.__line.destroy();
      window.__line = new Chart(ctxLine, {
        type: "line",
        data: { labels: months, datasets: [{ data: lineData, tension:.3, fill:false }] },
        options: { scales:{ y:{ ticks:{ callback:(v)=>euro(v) } } } }
      });
    }
  };
})();
