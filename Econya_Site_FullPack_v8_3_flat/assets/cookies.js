// v7.1 Cookies de personnalisation
(function(){
  function setCookie(name, value, days){
    const d = new Date(); d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = name+"="+encodeURIComponent(value)+";expires="+d.toUTCString()+";path=/;SameSite=Lax";
  }
  function getCookie(name){
    const v = ("; "+document.cookie).split("; "+name+"="); if(v.length===2) return decodeURIComponent(v.pop().split(";").shift()); return "";
  }
  function readProfile(){
    try{ return JSON.parse(getCookie('econya_profile')||'{}'); }catch{return {}}
  }
  function writeProfile(p){
    setCookie('econya_profile', JSON.stringify(p), 365);
  }
  // bootstrap from localStorage if cookie empty
  document.addEventListener('DOMContentLoaded', ()=>{
    let p = readProfile();
    if(!p.firstName){
      const n = (localStorage.getItem('econya_firstname')||'').trim();
      if(n){ p.firstName = n; writeProfile(p); }
    }
    if(!p.country){
      const c = (localStorage.getItem('econya_country')||'').trim();
      if(c){ p.country = c; writeProfile(p); }
    }
    if(!p.theme){
      const t = (localStorage.getItem('econya_theme')||'').trim();
      if(t){ p.theme = t; writeProfile(p); }
    }
    // reflect greeting if available
    const el = document.getElementById('greet-name');
    if(el && p.firstName){ el.textContent = 'Bonjour, ' + p.firstName; }
    window._econya_profile = p;
  });
  // expose small API
  window.EconyaCookies = {read: ()=> readProfile(), write: writeProfile};
})();