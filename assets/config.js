/* Econya config bootstrap (drop into /assets/config.js)
   Usage:
   - Option A: set your backend URL here (API_BASE).
   - Option B: pass ?api=https://your-api in the URL to override once, it will be saved.
   - Optionally set VAPID_PUBLIC if you enabled Web Push on the server.
*/
(function(){
  const DEF_API = "https://YOUR-RENDER-URL.onrender.com"; // <-- change after deploy
  const DEF_VAPID = ""; // optional: your VAPID public key (base64url)

  // Allow ?api= override (first run) and persist
  const params = new URLSearchParams(location.search);
  const apiParam = params.get("api");
  if(apiParam){
    try { localStorage.setItem("econya_verify_api", apiParam.replace(/\/$/,"")); } catch(_){}
  }
  const vapidParam = params.get("vapid");
  if(vapidParam){
    try { localStorage.setItem("econya_vapid_public", vapidParam); } catch(_){}
  }

  // Fallbacks if not set
  if(!localStorage.getItem("econya_verify_api")){
    try { localStorage.setItem("econya_verify_api", DEF_API); } catch(_){}
  }
  if(DEF_VAPID && !localStorage.getItem("econya_vapid_public")){
    try { localStorage.setItem("econya_vapid_public", DEF_VAPID); } catch(_){}
  }

  // Country default (can be changed by user/geo later)
  if(!localStorage.getItem("econya_country")){
    try { localStorage.setItem("econya_country", "FR"); } catch(_){}
  }
  // AB default
  if(!localStorage.getItem("econya_ab")){
    try { localStorage.setItem("econya_ab", "A"); } catch(_){}
  }
  console.log("[Econya] API:", localStorage.getItem("econya_verify_api"));
})();