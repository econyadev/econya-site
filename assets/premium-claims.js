/* assets/premium-claim.js
   Permet à un client de réactiver son Premium en saisissant l'e-mail du paiement LS.
*/
(function(){
  const apiBase = (window.ECONYA_API_BASE || "").replace(/\/+$/,"");

  function el(html){
    const d=document.createElement("div"); d.innerHTML=html.trim(); return d.firstChild;
  }
  function modal(){
    const m = el(`<div style="position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999">
      <div style="background:#0c1a13;border:1px solid #124234;border-radius:16px;padding:16px;max-width:380px;width:92%;color:#d1fae5">
        <h3 style="margin:0 0 8px">Retrouver mon Premium</h3>
        <p class="sub">Entrez l’e-mail utilisé lors du paiement.</p>
        <input id="claim-email" type="email" placeholder="email@exemple.com" style="width:100%;padding:10px;border-radius:10px;border:1px solid #17493b;background:#0e241c;color:#e8f7ef;margin:8px 0"/>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
          <button id="claim-cancel" class="btn ghost">Annuler</button>
          <button id="claim-ok" class="btn primary">Valider</button>
        </div>
        <div id="claim-msg" class="sub" style="margin-top:8px;min-height:20px"></div>
      </div>
    </div>`);
    document.body.appendChild(m);
    return m;
  }

  function attach(){
    document.querySelectorAll('[data-premium-claim]').forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const m = modal();
        m.querySelector("#claim-cancel").onclick = ()=> m.remove();
        m.querySelector("#claim-ok").onclick = async ()=>{
          const email = m.querySelector("#claim-email").value.trim();
          const msg = m.querySelector("#claim-msg");
          if(!email){ msg.textContent="Saisissez un e-mail."; return; }
          msg.textContent = "Vérification…";
          try{
            const r = await fetch(apiBase + "/premium/status?email=" + encodeURIComponent(email));
            const js = await r.json();
            if(js.ok && js.premium){
              if (typeof window.econyaSetPlan === "function") window.econyaSetPlan("premium");
              msg.textContent = "Premium activé ✅";
              setTimeout(()=>{ m.remove(); location.reload(); }, 700);
            } else {
              msg.textContent = "Aucun abonnement actif trouvé pour cet e-mail.";
            }
          }catch{
            msg.textContent = "Erreur de vérification.";
          }
        };
      });
    });
  }

  document.addEventListener("DOMContentLoaded", attach);
})();
