// Configuration du backend
window.ECONYA_API_BASE = "https://econya-backend.onrender.com"; // URL complète de ton backend

console.log("Econya Front prêt ✅");

// Sélecteur rapide
const $ = (sel) => document.querySelector(sel);

// Fonction pour tester le backend avec un timeout
const fetchAvecTimeout = async (path, timeout = 5000) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);

    try {
        const res = await fetch(`${window.ECONYA_API_BASE}${path}`, {
            signal: ctrl.signal,
            headers: { "Accept": "application/json", "Content-Type": "application/json" }
        });
        clearTimeout(id);
        return res;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
};

// Vérifie la santé du backend
const checkBackend = async () => {
    const badge = $("#api-status");
    try {
        const res = await fetchAvecTimeout("/sante");
        if (res.ok) {
            badge.textContent = "Backend connecté ✅";
            badge.style.color = "green";
        } else {
            badge.textContent = "Backend non configuré ❌";
            badge.style.color = "red";
        }
    } catch (e) {
        badge.textContent = "Backend non configuré ❌";
        badge.style.color = "red";
    }
};

// Met l'année automatiquement dans le footer
const updateYear = () => {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
};

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    updateYear();
    checkBackend();
});
