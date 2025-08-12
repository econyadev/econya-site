
async function loadI18n(){
  const res = await fetch('assets/i18n.json'); const all = await res.json();
  const navLang = (navigator.language||'fr').slice(0,2);
  let current = localStorage.getItem('econya_lang') || (all[navLang]? navLang : 'fr');
  applyI18n(all, current);
  buildLangSel(Object.keys(all), current, (next)=>{ localStorage.setItem('econya_lang', next); applyI18n(all, next); });
}
function applyI18n(all, lang){
  const dict = all[lang] || all['fr'];
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent = dict[ el.getAttribute('data-i18n') ] || el.textContent; });
  if(dict.dir==='rtl'){ document.documentElement.setAttribute('dir','rtl'); } else { document.documentElement.removeAttribute('dir'); }
}
function buildLangSel(langs, current, onChange){
  const sel = document.getElementById('langSel'); if(!sel) return;
  sel.innerHTML=''; langs.forEach(k=>{ const o=document.createElement('option'); o.value=k; o.textContent=k.toUpperCase(); if(k===current) o.selected=true; sel.appendChild(o); });
  sel.addEventListener('change', (e)=> onChange(e.target.value));
}
document.addEventListener('DOMContentLoaded', loadI18n);
