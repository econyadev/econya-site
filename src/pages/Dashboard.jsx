import React from 'react'
import LineChart from '../shared/LineChart.jsx'
export default function Dashboard(){
  const [kpis, setKpis] = React.useState({ income: 3200, expense: 2500, savings: 700, rate: 21.9 })
  const [series, setSeries] = React.useState([
    { month: 'Jan', income: 3000, expense: 2400 },
    { month: 'Feb', income: 3200, expense: 2450 },
    { month: 'Mar', income: 3150, expense: 2500 },
    { month: 'Apr', income: 3400, expense: 2600 },
    { month: 'May', income: 3300, expense: 2550 },
    { month: 'Jun', income: 3500, expense: 2800 },
  ])
  return (
    <div className="grid">
      <div className="card" style={{gridColumn: 'span 4'}}>
        <div className="kpi">{kpis.income.toLocaleString('fr-FR', {style:'currency', currency:'EUR'})}</div>
        <div className="kpi-label">Revenus mensuels</div>
      </div>
      <div className="card" style={{gridColumn: 'span 4'}}>
        <div className="kpi">{kpis.expense.toLocaleString('fr-FR', {style:'currency', currency:'EUR'})}</div>
        <div className="kpi-label">Dépenses mensuelles</div>
      </div>
      <div className="card" style={{gridColumn: 'span 4'}}>
        <div className="kpi">{kpis.savings.toLocaleString('fr-FR', {style:'currency', currency:'EUR'})}</div>
        <div className="kpi-label">Épargne nette</div>
      </div>
      <div className="card" style={{gridColumn: 'span 12'}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div className="muted">Comparatif revenus vs dépenses (6 derniers mois)</div>
        </div>
        <LineChart data={series} xKey="month" yKeys={['income','expense']} height={220}/>
      </div>
      <div className="card" style={{gridColumn: 'span 12'}}>
        <div className="muted">Exports (préparés pour v10.3.3)</div>
        <div className="row">
          <button className="btn">Exporter CSV</button>
          <button className="btn ghost">Exporter PDF</button>
        </div>
      </div>
    </div>
  )
}