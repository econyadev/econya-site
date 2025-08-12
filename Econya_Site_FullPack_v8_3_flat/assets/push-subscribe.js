// v8.1 Web Push (VAPID) subscribe helper
(async function(){
  const api = (localStorage.getItem('econya_verify_api')||'').replace(/\/$/,'');
  const pubkey = localStorage.getItem('econya_vapid_public')||''; // set via config page/admin
  if(!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  if(!api || !pubkey) return;
  try{
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(pubkey) });
    const meta = { country: (localStorage.getItem('econya_country')||'FR').toUpperCase(), ab: (localStorage.getItem('econya_ab')||'A'), interests: JSON.parse(localStorage.getItem('econya_interests')||'[]') };
    await fetch(api+'/push/subscribe', { method:'POST', headers:{'Content-Type':'application/json' }, body: JSON.stringify({sub, meta}) });
    console.log('Push subscription stored.');
  }catch(e){ console.warn('Push subscribe failed', e); }
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }
})();