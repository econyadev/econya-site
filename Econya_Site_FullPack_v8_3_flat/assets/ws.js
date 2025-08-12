// v6.4 WebSocket client (optional) + fallback to local AES store
(function(){
  const WS_URL = localStorage.getItem('econya_ws_url') || ''; // e.g. wss://econya-chat.onrender.com/ws
  let ws = null, wsReady = false;
  function connectWS(username){
    if(!WS_URL) return;
    try{
      ws = new WebSocket(`${WS_URL.replace(/\/$/,'')}/ws/${encodeURIComponent(username)}`);
      ws.onopen = ()=>{ wsReady = True; console.log('WS open'); };
      ws.onclose = ()=>{ wsReady = false; console.log('WS closed'); };
      ws.onerror = (e)=> console.warn('WS error', e);
      ws.onmessage = (evt)=>{
        // Expected "from|text|ts"
        const [from, text, ts] = (evt.data||'').split("|");
        window._econya_ws_incoming && window._econya_ws_incoming(from, text, Number(ts)||Date.now());
      };
    }catch(e){ console.warn('WS connect failed', e); }
  }
  window._econya_ws_send = (to, text)=>{
    if(ws && ws.readyState===1){
      ws.send(`${to}|${text}`);
      return true;
    }
    return false;
  };
  window._econya_ws_connect = connectWS;
})();