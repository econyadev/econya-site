import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import etag from 'etag';

dotenv.config();
const app = express();

// Raw body for webhook
app.use('/bank/webhook/bridge', express.raw({type: '*/*'}));
// JSON for others
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

// Memory store for demo
const mem = { txByUserId: new Map() };
const defaultTx = [
  {date:'2025-07-02', label:'Salaire', amount:1800},
  {date:'2025-07-03', label:'Loyer', amount:-650},
  {date:'2025-07-05', label:'Courses', amount:-62.3},
  {date:'2025-07-08', label:'Transport', amount:-28.9},
  {date:'2025-07-12', label:'Abonnement streaming', amount:-9.99},
  {date:'2025-07-15', label:'Remboursement ami', amount:50},
  {date:'2025-07-19', label:'Restaurant', amount:-34.6},
  {date:'2025-07-22', label:'Énergie', amount:-98.1},
  {date:'2025-07-25', label:'Salaire', amount:320},
  {date:'2025-07-26', label:'Loisirs', amount:-22.0}
];
function getUserTx(userId){
  if(!mem.txByUserId.has(userId)) mem.txByUserId.set(userId, [...defaultTx]);
  return mem.txByUserId.get(userId);
}

// Auth middleware
function auth(req,res,next){
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if(!token) return res.status(401).json({error:'No token'});
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  }catch(e){
    return res.status(401).json({error:'Invalid token'});
  }
}

// Admin middleware
function requireAdmin(req,res,next){
  if((req.headers['x-admin-key']||'') !== (process.env.ADMIN_KEY||'dev')) return res.status(403).json({error:'forbidden'});
  next();
}

// Routes
app.post('/auth/mock-login', (req,res)=>{
  const user = {id:1, name:'Demo User'};
  const token = jwt.sign(user, process.env.JWT_SECRET || 'secret', {expiresIn:'1h'});
  res.json({token});
});

app.post('/bank/link/start', auth, (req,res)=>{
  const link_token = 'demo_linktoken_' + Math.random().toString(36).slice(2);
  res.json({link_token, provider:'bridge'});
});

app.post('/bank/webhook/bridge', (req,res)=>{
  const sig = req.headers['bridgeapi-signature'];
  console.log('Webhook received, signature:', sig);
  res.status(200).send('ok');
});

app.get('/me/transactions', auth, (req,res)=>{
  const {from,to} = req.query;
  const userId = req.user.id || 1;
  let data = getUserTx(userId);
  if(from){ data = data.filter(t=> new Date(t.date) >= new Date(from)); }
  if(to){ data = data.filter(t=> new Date(t.date) <= new Date(to)); }
  const body = JSON.stringify(data);
  const tag = etag(body);
  res.set('ETag', tag);
  if(req.headers['if-none-match'] === tag) return res.status(304).end();
  res.json(data);
});

app.post('/admin/seed', requireAdmin, (req,res)=>{
  const {userId=1, transactions=[]} = req.body||{};
  const tx = getUserTx(userId);
  tx.push(...transactions);
  mem.txByUserId.set(userId, tx);
  res.json({ok:true, count: tx.length});
});

app.post('/admin/reset', requireAdmin, (req,res)=>{
  const {userId=1} = req.body||{};
  mem.txByUserId.set(userId, [...defaultTx]);
  res.json({ok:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Econya backend running on port', PORT));
