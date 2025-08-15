// assets/ab-test.js – routing simple A/B + Plausible custom events
(function(){
  const EXP_ID = "hero-cta-variant";
  const urlVar = new URLSearchParams(location.search).get("v"); // force A/B via ?v=A|B
  let bucket = urlVar || localStorage.getItem(EXP_ID);
  if (!bucket) {
    bucket = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(EXP_ID, bucket);
  }
  document.documentElement.dataset.exp = `${EXP_ID}-${bucket}`;

  function send(event, props){
    try { window.plausible && window.plausible(event, { props }); } catch {}
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    // Variante texte du CTA héros
    const cta = document.getElementById("hero-cta");
    if (cta){
      if (bucket === "A") cta.textContent = "Essayer le comparateur";
      else cta.textContent = "Démarrer mes économies";
      cta.addEventListener("click", ()=> send("CTA Hero Click", { bucket }));
    }
  });
})();
