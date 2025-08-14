(() => {
  console.log("Econya front prêt ✅");

  // Sélecteur rapide
  const $ = (sel) => document.querySelector(sel);

  // Fonction pour tester le backend avec un timeout
  const fetchWithTimeout = async (path, timeout = 5000) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(`${window.ECONYA_API_BASE}${path}`, {
        signal: ctrl.signal,
        headers: { Accept: "application/json", "Content-Type": "application/json" }
      });
      clearTimeout(id);
      return res;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  // Vérifie la santé du backend
  const checkBackend = async () => {
    const statusEl = $("#api-status");
    if (!window.ECONYA_API_BASE) {
      statusEl.textContent = "Backend non configuré ❌";
      statusEl.style.background = "#ffd9d9";
      statusEl.style.color = "#a00";
      return;
    }
    try {
      const res = await fetchWithTimeout("/sante");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      statusEl.textContent = `Backend connecté ✅ ${data.version ? "(" + data.version + ")" : ""}`;
      statusEl.style.background = "#d7f5dd";
      statusEl.style.color = "#115c2d";
    } catch (err) {
      statusEl.textContent = "Backend indisponible ❌";
      statusEl.style.background = "#ffd9d9";
      statusEl.style.color = "#a00";
      console.error("Erreur backend :", err);
    }
  };

  // Exécution au chargement de la page
  document.addEventListener("DOMContentLoaded", checkBackend);
})();
