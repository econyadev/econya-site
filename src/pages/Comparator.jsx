import React from 'react'
export default function Comparator(){
  const [offers, setOffers] = React.useState([
    { bank: 'Bank A', apy: 3.2, fees: 2.0, perks: 'CB gratuite' },
    { bank: 'Bank B', apy: 4.1, fees: 3.5, perks: 'Assurance incluse' },
    { bank: 'Bank C', apy: 2.8, fees: 0.0, perks: 'Cashback 1%' },
  ])
  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h3 style={{margin:0}}>Comparateur d'offres bancaires</h3>
        <button className="btn ghost" onClick={()=>alert('Connecté aux offres (mock)')}>Actualiser</button>
      </div>
      <table>
        <thead><tr><th>Banque</th><th>APY %</th><th>Frais €/mois</th><th>Avantages</th></tr></thead>
        <tbody>
          {offers.map((o,i)=>(
            <tr key={i}><td>{o.bank}</td><td>{o.apy}</td><td>{o.fees}</td><td>{o.perks}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}