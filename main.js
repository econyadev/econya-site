fetch((window.ECONYA_API_BASE || "") + "/health")
  .then(r => r.json())
  .then(d => console.log("Backend OK:", d))
  .catch(e => console.error("Backend KO:", e));

(()=>{ console.log("Econya ready"); })();
