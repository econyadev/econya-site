// v6.3 Private Messaging with AES-GCM at-rest using PIN-derived key (PBKDF2).
(function(){
  const threadsKey = 'econya_chat_threads_sec'; // ciphertext store
  const metaKey = 'econya_chat_meta'; // stores salt & iterations
  const contactsKey = 'econya_contacts';
  const enc = new TextEncoder(); const dec = new TextDecoder();

  // --- PIN & key derivation ---
  async function ensureKey(){
    let meta = JSON.parse(localStorage.getItem(metaKey) || 'null');
    if(!meta){
      const pin = await askPIN("Créez un code PIN (6 chiffres) pour verrouiller vos messages:");
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await deriveKey(pin, salt, 120000);
      localStorage.setItem(metaKey, JSON.stringify({salt: Array.from(salt), iter:120000}));
      return key;
    }else{
      const pin = await askPIN("Entrez votre code PIN (6 chiffres) pour déverrouiller la messagerie:");
      const salt = new Uint8Array(meta.salt);
      return deriveKey(pin, salt, meta.iter||120000);
    }
  }
  function askPIN(promptText){
    return new Promise((resolve)=>{
      let pin = '';
      while(!/^\d{6}$/.test(pin||'')){
        pin = window.prompt(promptText, '');
        if(pin===null){ alert('La messagerie nécessite un code PIN.'); }
      }
      resolve(pin);
    });
  }
  async function deriveKey(pin, salt, iter){
    const baseKey = await crypto.subtle.importKey('raw', enc.encode(pin), {name:'PBKDF2'}, false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      {name:'PBKDF2', salt, iterations: iter, hash: 'SHA-256'},
      baseKey,
      {name:'AES-GCM', length:256},
      false,
      ['encrypt','decrypt']
    );
  }

  async function encryptJSON(key, obj){
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = enc.encode(JSON.stringify(obj));
    const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, data);
    const out = {iv: Array.from(iv), ct: Array.from(new Uint8Array(ct))};
    return btoa(JSON.stringify(out));
  }
  async function decryptJSON(key, b64){
    try{
      const raw = JSON.parse(atob(b64));
      const iv = new Uint8Array(raw.iv);
      const ct = new Uint8Array(raw.ct);
      const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
      return JSON.parse(dec.decode(new Uint8Array(pt)));
    }catch(e){ console.warn('decrypt failed', e); return {}; }
  }

  function esc(s){ return s.replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',\"'\":'&#39;'}[m])); }

  // Contacts bootstrap
  if(!localStorage.getItem(contactsKey)){
    const demo = [
      {id:'jeanne', name:'Jeanne', note:'Voyages & bons plans', avatar:'J'},
      {id:'marc', name:'Marc', note:'Banques & crédits', avatar:'M'},
      {id:'sara', name:'Sara', note:'Assurances & énergie', avatar:'S'}
    ];
    localStorage.setItem(contactsKey, JSON.stringify(demo));
  }

  let aesKey = null, cacheThreads = {};

  async function loadThreads(){
    const b64 = localStorage.getItem(threadsKey);
    if(!b64){ return {}; }
    if(!aesKey) aesKey = await ensureKey();
    return decryptJSON(aesKey, b64);
  }
  async function saveThreads(obj){
    if(!aesKey) aesKey = await ensureKey();
    const b64 = await encryptJSON(aesKey, obj);
    localStorage.setItem(threadsKey, b64);
  }

  async function renderContacts(){
    const list = document.getElementById('contact-list');
    const cs = JSON.parse(localStorage.getItem(contactsKey)||'[]');
    list.innerHTML = cs.map(c=>`
      <div class="contact" data-id="${c.id}">
        <div class="avatar">${(c.avatar||c.name[0]||'?').toUpperCase()}</div>
        <div><div><strong>${c.name}</strong></div><div class="small">${c.note||''}</div></div>
      </div>`).join('');
    list.querySelectorAll('.contact').forEach(el=> el.addEventListener('click', ()=>openThread(el.dataset.id)));
  }

  async function openThread(id){
    if(!aesKey) aesKey = await ensureKey();
    cacheThreads = await loadThreads();
    const pane = document.getElementById('thread');
    const seed = [
      {from:id, text:"Tu as vu l’offre vol -20% ? ", ts: Date.now()-3600_000},
      {from:'me', text:"Oui, et ÉcoPlus rend la CB gratuite !", ts: Date.now()-1800_000}
    ];
    const msgs = cacheThreads[id] || seed;
    cacheThreads[id] = msgs; await saveThreads(cacheThreads);
    pane.innerHTML = msgs.map(m=>`<div class="msg ${m.from==='me'?'me':'them'}"><div>${esc(m.text)}</div><div class="meta">${new Date(m.ts).toLocaleString()}</div></div>`).join('');
    pane.dataset.active=id;
    document.querySelectorAll('.contact').forEach(c=> c.classList.toggle('active', c.dataset.id===id));
    pane.scrollTop = pane.scrollHeight;
  }

  async function sendCurrent(){
    const input = document.getElementById('composer-input');
    const text = input.value.trim(); if(!text) return;
    const pane = document.getElementById('thread'); const id = pane.dataset.active; if(!id) return alert('Choisissez un contact.');
    if(!aesKey) aesKey = await ensureKey();
    cacheThreads = await loadThreads();
    const msg = {from:'me', text, ts: Date.now()};
    cacheThreads[id] = (cacheThreads[id]||[]).concat([msg]); await saveThreads(cacheThreads);
    const el = document.createElement('div'); el.className='msg me'; el.innerHTML = `<div>${esc(text)}</div><div class="meta">${new Date(msg.ts).toLocaleString()}</div>`;
    pane.appendChild(el); pane.scrollTop = pane.scrollHeight; input.value='';
    setTimeout(async ()=>{
      const reply = {from:id, text:"Top ! Envoie le lien 👍", ts: Date.now()};
      cacheThreads = await loadThreads();
      cacheThreads[id] = (cacheThreads[id]||[]).concat([reply]); await saveThreads(cacheThreads);
      const el2 = document.createElement('div'); el2.className='msg them'; el2.innerHTML = `<div>${esc(reply.text)}</div><div class="meta">${new Date(reply.ts).toLocaleString()}</div>`;
      pane.appendChild(el2); pane.scrollTop = pane.scrollHeight;
    },800);
  }

  // Wire UI
  document.getElementById('composer-send')?.addEventListener('click', sendCurrent);
  document.getElementById('composer-input')?.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendCurrent(); }});
  renderContacts();
  // Auto-open first
  setTimeout(()=>{ document.querySelector('#contact-list .contact')?.click(); }, 100);
})();