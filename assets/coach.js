import { $, apiBase, euro, setPlantProgress } from "./common.js";

async function fetchJSON(path){
  const r = await fetch(apiBase + path);
  if(!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}

async function refreshCoach(){
  try{
    const tx = await fetchJSON("/transactions"); // démo backend
    const month = (new Date()).toISOString().slice(0,7);
    const monthTx = tx.filter(t => (t.date||'').startsWith(month));
    const spend  = monthTx.filter(t=>t.amount<0).reduce((a,t)=>a+Math.abs(t.amount),0);
    const income = monthTx.filter(t=>t.amount>0).reduce((a,t)=>a+t.amount,0);
    const potential = Math.max(0, (income*0.15) - (spend*0.05)); // démo simple

    $("#coach-spend").textContent   = euro(spend);
    $("#coach-income").textContent  = euro(income);
    $("#coach-savings").textContent = euro(potential);

    setPlantProgress(Math.min(100, (potential/2000*100)|0));
  }catch(e){
    $("#coach-spend").textContent   = '—';
    $("#coach-income").textContent  = '—';
    $("#coach-savings").textContent = '—';
  }
}
$("#btn-refresh").addEventListener('click', refreshCoach);
refreshCoach();

// open banking mock
$("#btn-ob-start").addEventListener('click', async ()=>{
  try{ const j = await fetchJSON('/ob/start'); $("#ob-status").textContent = 'Flux lancé (démo) → ' + (j.url||'mock'); }
  catch(e){ $("#ob-status").textContent = 'Erreur démarrage OB'; }
});
$("#btn-ob-accounts").addEventListener('click', async ()=>{
  try{ const j = await fetchJSON('/mescomptes'); $("#ob-status").textContent = 'Comptes: ' + (j.accounts? j.accounts.length : 0); }
  catch(e){ $("#ob-status").textContent = 'Erreur comptes'; }
});
$("#btn-ob-transactions").addEventListener('click', async ()=>{
  try{ const j = await fetchJSON('/transactions'); $("#ob-status").textContent = 'Tx: ' + j.length; }
  catch(e){ $("#ob-status").textContent = 'Erreur transactions'; }
});

// transactions table
function parseMonthValue(v){ return v || new Date().toISOString().slice(0,7); }
async function renderTransactions(reset=false){
  const tbody = $("#tx-tbody"); const totalEl = $("#tx-total");
  if(reset){ tbody.innerHTML=''; totalEl.textContent='0,00 €'; return; }
  const ym = parseMonthValue($("#tx-month").value);
  const tx = await fetchJSON('/transactions');
  const monthTx = tx.filter(t => (t.date||'').startsWith(ym));
  tbody.innerHTML = monthTx.map(t=>`
    <tr>
      <td>${t.date}</td>
      <td>${t.label||''}</td>
      <td>${t.category||''}</td>
      <td class="right" style="${t.amount<0?'color:#e66':'color:#67e39b'}">${euro(Math.abs(t.amount))}</td>
    </tr>`).join('');
  const total = monthTx.reduce((a,t)=>a+t.amount,0);
  totalEl.textContent = euro(total);
}
$("#tx-month").value = new Date().toISOString().slice(0,7);
$("#tx-load").addEventListener('click', ()=>renderTransactions());
