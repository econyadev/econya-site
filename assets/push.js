// Notifications locales simples (pas de push serveur)
const KEY = "econya:notif:perm";
const lastKey = "econya:notif:last";

async function ensurePermission(){
  if (!("Notification" in window)) return false;
  let perm = Notification.permission;
  if (perm === "default") {
    try { perm = await Notification.requestPermission(); }
    catch { perm = "denied"; }
  }
  localStorage.setItem(KEY, perm);
  return perm === "granted";
}

function notify(title, body){
  try{ new Notification(title, { body, icon: "/assets/pwa/icon-192.png" }); }catch{}
}

function maybeDailyReminder(){
  const last = Number(localStorage.getItem(lastKey) || 0);
  const nowDay = Math.floor(Date.now()/86400000);
  if (last >= nowDay) return; // 1 fois / jour max
  notify("🌱 Econya", "Astuce du jour & défi hebdo prêts pour vous !");
  localStorage.setItem(lastKey, String(nowDay));
}

document.addEventListener("DOMContentLoaded", async ()=>{
  const ok = await ensurePermission();
  if (ok) {
    // petit rappel 12s après l’ouverture
    setTimeout(maybeDailyReminder, 12000);
  }
});
