// Sidebar Econya
(function(){
  const LS_KEY = "econya:sidebar:pinned"; // futur usage (pin/unpin)
  const $ = s=>document.querySelector(s);

  // Création backdrop si absent
  let backdrop = $(".sb-backdrop");
  if(!backdrop){
    backdrop = document.createElement("div");
    backdrop.className = "sb-backdrop";
    document.body.appendChild(backdrop);
  }

  function open(){ document.body.classList.add("sb-open"); $(".sidebar")?.classList.add("open"); backdrop.classList.add("show"); }
  function close(){ document.body.classList.remove("sb-open"); $(".sidebar")?.classList.remove("open"); backdrop.classList.remove("show"); }

  // Toggle bouton
  document.addEventListener("click", (e)=>{
    if(e.target.closest("#sb-toggle")) { e.preventDefault(); const isOpen=$(".sidebar")?.classList.contains("open"); isOpen?close():open(); }
    if(e.target === backdrop) close();
    if(e.target.closest(".sidebar .item")) close(); // ferme au clic d’un lien (mobile)
  });

  // Active link (en fonction de l’URL)
  function activate(){
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".sidebar .item").forEach(a=>{
      const href = a.getAttribute("href") || "";
      const last = href.split("/").pop() || href;
      a.classList.toggle("active", last === path || (last==="/" && path==="index.html"));
    });
  }
  document.addEventListener("DOMContentLoaded", activate);
  window.addEventListener("popstate", activate);
})();
