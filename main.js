// Configuration du backend
window.ECONYA_API_BASE = window.ECONYA_API_BASE || "https://econya-backend.onrender.com";
console.log("Econya Front prêt ✅");

// Sélecteur rapide
const $ = (sel) => document.querySelector(sel);

// Fonction pour tester le backend avec un timeout
const fetchWithTimeout = async (path, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(`${window.ECONYA_API_BASE}${path}`, {
            signal: controller.signal,
            headers: { "Accept": "application/json" }
        });
        clearTimeout(id);
        return res;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
};

// Vérification du backend
(async () => {
    const statusEl = $("#api-status");
    try {
        const res = await fetchWithTimeout("/sante");
        if (res.ok) {
            statusEl.innerHTML = "Backend connecté ✅";
            statusEl.style.color = "lightgreen";
        } else {
            throw new Error();
        }
    } catch (err) {
        statusEl.innerHTML = "Backend non configuré ❌";
        statusEl.style.color = "red";
    }
})();


