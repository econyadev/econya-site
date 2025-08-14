import React from 'react'
import Dashboard from './Dashboard.jsx'
import Comparator from './Comparator.jsx'
import Coach from './Coach.jsx'
export default function App() {
  const [tab, setTab] = React.useState('dashboard')
  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="badge">Econya v10.3.2 — Site</div>
          <h1 className="title">Pilotage budgétaire & Coach IA</h1>
          <div className="muted">Connecté à votre banque (APIs gratuites) — comparateur d'offres intégré</div>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={()=>setTab('dashboard')}>Tableau de bord</button>
          <button className="btn ghost" onClick={()=>setTab('comparator')}>Comparateur</button>
          <button className="btn ghost" onClick={()=>setTab('coach')}>Coach IA</button>
        </div>
      </div>
      {tab === 'dashboard' && <Dashboard/>}
      {tab === 'comparator' && <Comparator/>}
      {tab === 'coach' && <Coach/>}
    </div>
  )
}