// Astuce du jour – contenu frais local (aucun service externe)
const TIPS = [
  "Comparez les assurances habitation tous les 12 mois.",
  "Préférez les ETF à faible TER pour vos investissements.",
  "Vérifiez les frais cachés des offres bancaires (tenue de compte, carte).",
  "Remplacez vos abonnements peu utilisés par des offres à la demande.",
  "Renégociez énergie & internet après la première année.",
  "Utilisez le virement automatique vers un compte épargne dès le salaire.",
  "Vérifiez le cashback disponible avant un achat en ligne.",
  "Évitez le découvert : il coûte très cher à la longue.",
  "Cuisinez en batch pour réduire le budget alimentation.",
  "Regroupez assurances pour profiter d’une remise multi-contrats."
];

function tipOfTheDay(){
  const day = Math.floor(Date.now()/86400000); // change chaque jour
  return TIPS[day % TIPS.length];
}

function renderTip(){
  const el = document.getElementById("tip-box");
  if (!el) return;
  el.innerHTML = `
    <div class="badge">Astuce</div>
    <div style="margin-top:6px">${tipOfTheDay()}</div>
  `;
}

document.addEventListener("DOMContentLoaded", renderTip);
