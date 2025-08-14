// ===== Econya - Front boot =====

// 1) Sélecteur rapide
const $ = (sel) => document.querySelector(sel);

// 2) Utilitaire: fetch avec timeout
async function fetchWithTimeout(path, { timeout = 5000, asJson = true } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const base = (window.ECONYA_API_BASE || "").replace(/\/+$/,"");
    if (!base) throw new Error("ECONYA_API_BASE manquant");
    const res = await fetch(base + path, {
      signal: ctrl.signal,
      headers: { "Accept": "application/json", "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return asJson ? await res.json().catch(() => ({})) : await res.text();
  } finally {
    clearTimeout(id);
  }
}

// 3) Test de santé du backend (+ fallback)
async function checkBackend() {
  const badge = $("#api-status");
  if (!badge) return;

  // Style helper
  const setOK = (txt) => {
    badge.textContent = txt || "Backend connecté ✅";
    badge.style.background = "#d7f5dd";
    badge.style.color = "#115c2d";
  };
  const setKO = (txt) => {
    badge.textContent = txt || "Backend non configuré ❌";
    badge.style.background = "#ffd9d9";
    badge.style.color = "#a00";
  };

  const base = window.ECONYA_API_BASE;
  if (!base) { setKO(); return; }

  try {
    // 1er essai: /sante (JSON attendu)
    const sante = await fetchWithTimeout("/sante", { timeout: 5000, asJson: true });
    if (sante && (sante.status === "ok" || sante.status === "OK")) {
      setOK(`Backend connecté ✅${sante.version ? " (" + sante.version + ")" : ""}`);
      return;
    }
    // 2e essai: /health (JSON)
    const health = await fetchWithTimeout("/health", { timeout: 5000, asJson: true });
    if (health && (health.status === "ok" || health.status === "OK")) {
      setOK(`Backend connecté ✅${health.version ? " (" + health.version + ")" : ""}`);
      return;
    }
    // 3e essai: /ping (texte "pong")
    const ping = await fetchWithTimeout("/ping", { timeout: 4000, asJson: false });
    if (typeof ping === "string" && ping.toLowerCase().includes("pong")) {
      setOK("Backend connecté ✅");
      return;
    }
    throw new Error("Endpoints /sante, /health et /ping non concluants");
  } catch (e) {
    console.error("[Econya] Backend KO:", e);
    setKO("Backend indisponible ❌");
  }
}

// 4) Démarrage quand le DOM est prêt
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Econya] Front prêt ✅");
  // Année dynamique (si présent)
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  // Lancer le test backend
  checkBackend();
});

