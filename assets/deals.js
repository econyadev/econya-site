import { $, PLAN } from "./common.js";

// Remplace ces éléments par tes liens d’affiliation réels
const AFFILIATES = [
  { id:'d1', title:'Électricité - -15% la 1ère année', price:'–15%', url:'#', premium:false, cat:'energie' },
  { id:'d2', title:'Banque en ligne – 150€ offerts',   price:'150€', url:'#', premium:true,  cat:'banque' },
  { id:'d3', title:'Forfait mobile 80 Go à 8,99€',     price:'8,99€',url:'#', premium:false, cat:'telecom' },
  { id:'d4', title:'Cashback e-commerce jusqu’à 8%',   price:'8%',   url:'#', premium:true,  cat:'cashback' },
];

function renderDeals(){
  const wrap = $("#deals-wrap");
  const data = AFFILIATES.filter(d => PLAN==='premium' ? true : !d.premium);
  wrap.innerHTML = data.map(d=>`
    <article class="deal">
      <div class="tag">${d.cat}${d.premium?' • Premium':''}</div>
      <h3 style="margin:.2rem 0 .4rem">${d.title}</h3>
      <div class="price">Avantage: ${d.price}</div>
      <div class="cta" style="margin-top:8px">
        <a class="btn" href="${d.url}">J’en profite</a>
      </div>
    </article>`).join('');
}
renderDeals();

// Passage Premium (branche ton Payment Link Stripe ici)
document.getElementById('btn-go-premium')?.addEventListener('click', (e)=>{
  e.preventDefault();
  // location.href = 'https://buy.stripe.com/...'; // <-- TON lien Stripe
  location.href = location.pathname + '?plan=premium#tarifs'; // démo
});
