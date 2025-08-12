
// v6.9 Personalization by first name
(function(){
  function getName(){ return (localStorage.getItem('econya_firstname')||'').trim(); }
  function setName(n){ localStorage.setItem('econya_firstname', (n||'').trim()); }
  function greet(){ 
    const n = getName();
    const el = document.getElementById('greet-name');
    if(el){ el.textContent = n ? ('Bonjour, '+n) : 'Bonjour'; }
    const meKey = 'econya_me';
    try{
      const me = JSON.parse(localStorage.getItem(meKey)||'{}');
      if(n && (!me.name || me.name==='Moi')){
        localStorage.setItem(meKey, JSON.stringify({id:'me', name:n}));
      }
    }catch{}
  }
  function banner(){
    if(getName()) return;
    const wrap = document.querySelector('.wrap') || document.body;
    const box = document.createElement('div');
    box.className='card';
    box.innerHTML = `<strong>Bienvenue !</strong> Comment dois-je vous appeler ? 
      <input id="name-input" placeholder="Prénom" style="margin-left:8px;padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#0b1a16;color:inherit"/>
      <button id="name-save" class="btn" style="margin-left:6px">Enregistrer</button>`;
    wrap.prepend(box);
    const save = ()=>{
      const v = (document.getElementById('name-input').value||'').trim();
      if(!v) return;
      setName(v);
      box.remove();
      greet();
    };
    document.getElementById('name-save').addEventListener('click', save);
    document.getElementById('name-input').addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); save(); }});
  }
  window.addEventListener('DOMContentLoaded', ()=>{ greet(); banner(); });
})();