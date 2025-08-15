/* assets/premium.js
   - Active le plan 'premium' si l'URL contient ?premium=ok
   - Affiche un toast de confirmation
*/
(function(){
  function qs(key){ return new URLSearchParams(location.search).get(key); }
  function toast(msg){
    let t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = "position:fixed;right:16px;bottom:16px;background:#0f3e2f;color:#d1fae5;border:1px solid #10b981;padding:10px 12px;border-radius:10px;font-weight:800;z-index:9999";
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 4000);
  }
  document.addEventListener("DOMContentLoaded", ()=>{
    if (qs("premium")==="ok" && typeof window.econyaSetPlan === "function") {
      window.econyaSetPlan("premium");
      toast("Merci ! Votre Premium est activé ✅");
    }
  });
})();
