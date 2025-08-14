import React from 'react'
export default function Coach(){
  const [advice, setAdvice] = React.useState([
    'Négocier votre forfait mobile : -8€/mois potentiels',
    'Optimiser l'assurance habitation : -12€/mois',
    'Automatiser un virement épargne de 50€/mois en début de mois'
  ])
  const [csvExample] = React.useState('date,libelle,montant\n2025-07-01,Carburant,-60\n2025-07-02,Salaire,2200')
  return (
    <div className="grid">
      <div className="card" style={{gridColumn:'span 7'}}>
        <h3 style={{marginTop:0}}>Conseils personnalisés (démo)</h3>
        <ul>
          {advice.map((a,i)=>(<li key={i} style={{marginBottom:8}}>{a}</li>))}
        </ul>
      </div>
      <div className="card" style={{gridColumn:'span 5'}}>
        <h3 style={{marginTop:0}}>Import CSV bancaire (bientôt)</h3>
        <div className="muted">Format attendu (UTF-8, séparateur virgule)</div>
        <pre style={{whiteSpace:'pre-wrap', background:'rgba(0,0,0,0.3)', padding:12, borderRadius:8}}>{csvExample}</pre>
        <button className="btn">Choisir un fichier</button>
      </div>
    </div>
  )
}