/* actifs/coach-engine.js – moteur de conseils Coach Éco (v1) */

const Coach = (() => {
  // ----- helpers -----
  const euro = (n) =>
    (n < 0 ? '-' : '') + (Math.abs(n) / 1).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

  // mapping simplifié MCC / catégories via mots-clés
  const KEYWORDS = {
    Transport: ['uber', 'bolt', 'sncf', 'essence', 'total', 'avia', 'esco', 'station', 'parking', 'autoroute'],
    Courses: ['auchan', 'carrefour', 'leclerc', 'intermarché', 'monoprix', 'super', 'drive', 'lidl', 'aldi'],
    Resto: ['ubereats', 'deliveroo', 'just eat', 'mcdo', 'burger', 'pizza', 'kfc', 'sushi', 'restaurant', 'café'],
    Abonnements: ['netflix', 'spotify', 'deezer', 'canal', 'canal+', 'prime', 'apple tv', 'dropbox', 'adobe'],
    Télécoms: ['orange', 'sfr', 'bouygues', 'free', 'red', 'sosh', 'b&you'],
    Énergie: ['edf', 'engie', 'totalenergies', 'eni', 'ohm', 'mint', 'ilek', 'bulb'],
    Banque: ['frais', 'agios', 'overdraft', 'tenue de compte', 'visa fee', 'mastercard fee'],
    Logement: ['loyer', 'caution', 'syndic', 'foncière', 'airbnb'],
    Santé: ['pharmacie', 'mutuelle', 'doctolib', 'dent', 'optique']
  };

  function categorize(label) {
    const s = (label || '').toLowerCase();
    for (const [cat, words] of Object.entries(KEYWORDS)) {
      if (words.some((w) => s.includes(w))) return cat;
    }
    return 'Autres';
  }

  // détecte les récurrences (abonnements)
  function detectRecurring(tx, horizonMs = 4 * MONTH_MS) {
    const map = new Map(); // label base -> dates + montants
    const now = Date.now();
    for (const t of tx) {
      const base = (t.merchant || t.label || '').toLowerCase().replace(/\s+/g, ' ').slice(0, 40);
      if (!base) continue;
      if (now - new Date(t.date).getTime() > horizonMs) continue;
      const a = map.get(base) || [];
      a.push(Number(t.amount));
      map.set(base, a);
    }
    const rec = [];
    for (const [base, amounts] of map) {
      if (amounts.length >= 3) {
        const avg = amounts.reduce((s, v) => s + Math.abs(v), 0) / amounts.length;
        rec.push({ base, avg: Math.round(avg * 100) / 100 });
      }
    }
    return rec.sort((a, b) => b.avg - a.avg);
  }

  // Benchmarks très simples (à raffiner par pays/profil)
  const BENCH = {
    Télécoms: { mobile: 15, box: 25 }, // €/mois
    Banque: { fraisMax: 3 },
    Énergie: { kwh: 0.22 }, // estimation moyenne
    Courses: { cible: 8 }, // % revenus mensuels, indicateur grossier
    Transport: { cible: 6 }
  };

  // ----- règles de conseils -----
  async function advise({ transactions, monthlyIncome = 2000, user = {} }) {
    const tips = [];

    // enrichissement catégories
    const tx = transactions.map((t) => ({ ...t, category: t.category || categorize(t.label) }));

    // 1) Abonnements récurrents : consolidation
    const recurring = detectRecurring(tx);
    for (const r of recurring.slice(0, 6)) {
      tips.push({
        area: 'Abonnements',
        title: `Abonnement détecté : « ${r.base} »`,
        impactMonthly: -r.avg,
        action: `Vérifie si tu utilises encore « ${r.base} ». Résilier = **${euro(r.avg)} / mois**.`,
        score: Math.min(100, Math.round(r.avg * 2))
      });
    }

    // 2) Frais bancaires
    const bankFees = tx
      .filter((t) => t.category === 'Banque' && t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    if (bankFees > BENCH.Banque.fraisMax) {
      tips.push({
        area: 'Banque',
        title: 'Frais bancaires élevés',
        impactMonthly: -bankFees,
        action:
          "Compare les offres **banques en ligne** (frais ~0 €). Évite les découverts (alertes solde + virement auto).",
        score: Math.min(100, Math.round(bankFees * 15))
      });
    }

    // 3) Télécoms
    const telco = tx
      .filter((t) => t.category === 'Télécoms' && t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    if (telco > BENCH.Télécoms.mobile + BENCH.Télécoms.box) {
      tips.push({
        area: 'Télécoms',
        title: 'Contrat mobile/box optimisable',
        impactMonthly: Math.min(-15, -(telco - (BENCH.Télécoms.mobile + BENCH.Télécoms.box))),
        action:
          "Regarde les offres **sans engagement** (RED, B&You, Sosh…). Vise ~**15 €** mobile + **25 €** box.",
        score: Math.min(100, Math.round((telco - 40) * 3))
      });
    }

    // 4) Courses & Transport (parts du revenu)
    const byCat = {};
    for (const t of tx) {
      if (t.amount < 0) byCat[t.category] = (byCat[t.category] || 0) + Math.abs(t.amount);
    }
    const monthSpan =
      (new Date(Math.max(...tx.map((t) => +new Date(t.date)))) -
        new Date(Math.min(...tx.map((t) => +new Date(t.date))))) /
      MONTH_MS;
    const months = Math.max(1, Math.min(6, Math.round(monthSpan)));
    const monthSpend = Object.fromEntries(
      Object.entries(byCat).map(([k, v]) => [k, v / months])
    );

    const coursesPct = ((monthSpend.Courses || 0) / monthlyIncome) * 100;
    if (coursesPct > BENCH.Courses.cible) {
      tips.push({
        area: 'Courses',
        title: 'Courses : piste d’optimisation',
        impactMonthly: Math.round(-Math.min(50, (coursesPct - BENCH.Courses.cible) * (monthlyIncome / 100))),
        action:
          "Utilise **marques distributeur**, compare les prix (Drive), liste stricte, et évite les livraisons payantes.",
        score: Math.min(100, Math.round(coursesPct - BENCH.Courses.cible) * 2)
      });
    }

    const transportPct = ((monthSpend.Transport || 0) / monthlyIncome) * 100;
    if (transportPct > BENCH.Transport.cible) {
      tips.push({
        area: 'Transport',
        title: 'Dépenses transport élevées',
        impactMonthly: Math.round(
          -Math.min(60, (transportPct - BENCH.Transport.cible) * (monthlyIncome / 100))
        ),
        action:
          "Optimise trajets (covoiturage, vélo, transport en commun), carte carburant remisée, pneus bien gonflés.",
        score: Math.min(100, Math.round(transportPct - BENCH.Transport.cible) * 2)
      });
    }

    // 5) Idées : Poche d’épargne automatique
    const leftover = Math.max(0, monthlyIncome - (monthSpend.Autres || 0) - (monthSpend.Courses || 0) - (monthSpend.Transport || 0) - (monthSpend.Télécoms || 0) - (monthSpend.Énergie || 0) - (monthSpend.Resto || 0));
    if (leftover >= 50) {
      tips.push({
        area: 'Épargne',
        title: 'Automatise une poche d’épargne',
        impactMonthly: -Math.min(150, Math.round(leftover * 0.4)),
        action:
          "Vire **chaque mois** 30–40 % du surplus sur un Livret (ou ETF monde si horizon > 5 ans et profil OK).",
        score: 50
      });
    }

    // 6) Bonus info temps-réel (devises & crypto) pour conseils contextuels
    try {
      const fx = await API.getFx('EUR', 'USD,GBP,CHF');
      tips.push({
        area: 'Info',
        title: 'Devises (EUR)',
        impactMonthly: 0,
        action: `USD : ${fx.rates.USD.toFixed(3)} · GBP : ${fx.rates.GBP.toFixed(3)} · CHF : ${fx.rates.CHF.toFixed(3)}`,
        score: 10
      });
    } catch {}

    try {
      const cg = await API.getCryptoPrices(['bitcoin', 'ethereum'], 'eur');
      const btc = cg.bitcoin?.eur, ch = cg.bitcoin?.eur_24h_change;
      if (btc) {
        tips.push({
          area: 'Crypto',
          title: 'BTC (info marché)',
          impactMonthly: 0,
          action: `≈ ${euro(btc)} (${(ch || 0).toFixed(2)} %/24h). Rappel : n’investis que ce que tu peux perdre.`,
          score: 8
        });
      }
    } catch {}

    // classement par score (desc) puis par impact (abs)
    tips.sort((a, b) => (b.score - a.score) || Math.abs(b.impactMonthly) - Math.abs(a.impactMonthly));
    return tips;
  }

  return { advise };
})();
