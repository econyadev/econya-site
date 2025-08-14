// =======================
// Configuration Backend
// =======================
window.ECONYA_API_BASE = "https://econya-backend.onrender.com"; // URL complète de ton backend

console.log("Econya Front prêt ✅");

// =======================
// Sélecteur rapide
// =======================
const $ = (sel) => document.querySelector(sel);

// =======================
// Fonction test Backend avec timeout
// =======================
const fetchWithTimeout = async (path, timeout = 5000) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);
    try {
        const res = await fetch(`${window.ECONYA_API_BASE}${path}`, {
            signal: ctrl.signal,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        });
        clearTimeout(id);
        return res;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
};

// =======================
// Vérification Santé Backend
// =======================
const checkBackend = async () => {
    const statusEl = $("#backend-status");
    try {
        const res = await fetchWithTimeout("/ping");
        if (res.ok) {
            statusEl.textContent = "Backend connecté ✅";
            statusEl.style.color = "green";
        } else {
            statusEl.textContent = "Backend non configuré ❌";
            statusEl.style.color = "red";
        }
    } catch (err) {
        statusEl.textContent = "Backend non configuré ❌";
        statusEl.style.color = "red";
    }
};

// Lancer la vérification au chargement
document.addEventListener("DOMContentLoaded", checkBackend);
