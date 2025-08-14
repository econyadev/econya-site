(() => {
  console.log("Econya front prêt ✅");

  const $ = (sel) => document.querySelector(sel);

  // Utilitaire fetch avec timeout
  const f = async (path, { timeout = 5000 } = {}) => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(`${window.ECONYA_API_BASE}${path}`, {
        signal: ctrl.signal,
        headers: { Accept: "application/json, text/plain; */*" },
      });
      clearTimeout(id);
      return res;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  // Essaye /sante -> /health -> /ping
  const checkBackend = async () => {
    const statusEl = $("#status");
    if (!statusEl) return;

    statusEl.textContent = "Vérification du backend…";

    try {
      // 1) /sante (JSON attendu)
      let res = await f("/sante");
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        statusEl.textContent = `Backend OK ✅  (${data.status || "ok"})`;
        return;
      }

      // 2) /health (JSON attendu)
      res = await f("/health");
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        statusEl.textContent = `Backend OK ✅  (${data.status || "ok"})`;
        return;
      }

      // 3) /ping (texte "pong" attendu)
      res = await f("/ping");
      if (res.ok) {
        const txt = await res.text();
        statusEl.textContent = `Backend OK ✅  (${txt.trim()})`;
        return;
      }

      // Si aucune route ne répond ok
      statusEl.textContent = `Backend indisponible ❌ (code ${res.status})`;
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Erreur de connexion au backend ❌";
    }
  };

  // Lancer la vérification dès que la page est prête
  document.addEventListener("DOMContentLoaded", checkBackend);
})();
