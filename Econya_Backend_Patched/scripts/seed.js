// scripts/seed.js
import fetch from 'node-fetch';

const API = process.env.API_BASE || 'http://localhost:3000';
const ADMIN_KEY = process.env.ADMIN_KEY || 'dev';

const extraTx = [
  {date:'2025-07-28', label:'Café', amount:-2.8},
  {date:'2025-07-29', label:'Courses', amount:-43.2},
  {date:'2025-07-30', label:'Prime', amount:120},
];

async function main(){
  const r = await fetch(`${API}/admin/seed`, {
    method:'POST',
    headers:{'Content-Type':'application/json','x-admin-key':ADMIN_KEY},
    body: JSON.stringify({userId:1, transactions: extraTx})
  });
  const j = await r.json();
  console.log('Seed result:', j);
}
main().catch(console.error);
