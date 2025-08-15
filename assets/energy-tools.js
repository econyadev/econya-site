// assets/energy-tools.js – simulateurs simples énergie/carburant
(function(){
  window.EnergyTools = {
    // Estime une facture mensuelle élec: kWh/mois * prix (€/kWh)
    estimateElectric(kwhPerMonth=200, pricePerKwh=0.22){
      const total = kwhPerMonth * pricePerKwh;
      return { kwhPerMonth, pricePerKwh, total, tips: [
        "Baisser éco thermostat (-1°C ≈ -7%)",
        "LED et multiprises coupe-veille",
        "Temps douche < 5 min"
      ]};
    },
    // Carburant: litres/mois * prix
    estimateFuel(litersPerMonth=60, pricePerL=1.85){
      const total = litersPerMonth * pricePerL;
      return { litersPerMonth, pricePerL, total, tips: [
        "Vérifier pression pneus",
        "Regrouper trajets + covoiturage",
        "Conduite souple (anticipation)"
      ]};
    }
  };
})();
