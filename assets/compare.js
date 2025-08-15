import { $, euro } from "./common.js";

const DEMO_OFFERS = [
  { id:'a', name:'Offre A', price:19.99, rating:4.3, eco:0.7 },
  { id:'b', name:'Offre B', price:14.50, rating:4.0, eco:0.5 },
  { id:'c', name:'Offre C', price:24.90, rating:4.8, eco:0.9 },
  { id:'d', name:'Offre D', price: 9.99, rating:3.7, eco:0.4 },
];

function computeScores(offers, w){
  const maxPrice = Math.max(...offers.map(o=>o.price));
  return offers.map(o=>{
    const sPrice  = 1 - (o.price / maxPrice);
    const sRating = o.rating / 5;
    const sEco    = o.eco;
    const totalW  = (w.price||0)+(w.rating||0)+(w.eco||0) || 1;
    const score   = (sPrice*w.price + sRating*w.rating + sEco*w.eco)/totalW;
    return {...o, score};
  }).sort((a,b)=>b.score-a.score);
}

function renderCompare(){
  const w = {
    price: +$("#w-price").value,
    rating:+$("#w-rating").value,
    eco:   +$("#w-eco").value
  };
  const ranked = computeScores(DEMO_OFFERS, w);
  $("#compare-results").innerHTML = ranked.map(o=>`
    <div class="item">
      <div><strong>${o.name}</strong></div>
      <div>Prix: ${euro(o.price)} • Note: ${o.rating}/5 • CO₂: ${(1-o.eco).toFixed(2)} kg</div>
      <div>Score: <span class="score">${(o.score*100|0)}/100</span></div>
    </div>`).join('');
  // KPIs démo
  $("#kpi-save").textContent = euro(Math.max(0, 120 - ranked[0].price) * 12);
  $("#kpi-co2").textContent  = (ranked[0].eco*120).toFixed(0)+' kg';
  $("#kpi-time").textContent = (ranked[0].rating*3).toFixed(1)+' h';
}

$("#btn-compare").addEventListener('click', renderCompare);
renderCompare();
