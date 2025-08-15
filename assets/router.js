<script>
// === Router SPA ultra-léger + SEO dynamiques ====================

const ROUTER_BASE = document.querySelector('meta[name="router-base"]')?.content || "/";

// ROUTES: path -> section id
const ROUTES = {
  "/": "comparateur",
  "/comparateur": "comparateur",
  "/coach": "coach",
  "/deals": "deals",
  "/tarifs": "tarifs",
};

// META par route (title/description/og)
const META = {
  comparateur: {
    title: "Econya – Comparateur multi-critères",
    desc:  "Comparez les offres selon vos priorités (prix, satisfaction, empreinte carbone) et estimez vos économies.",
    url:   "/comparateur"
  },
  coach: {
    title: "Econya – Coach Éco autonome",
    desc:  "Analyse de vos dépenses, détection d’abonnements, objectifs d’épargne et recommandations personnalisées.",
    url:   "/coach"
  },
  deals: {
    title: "Econya – Bons plans personnalisés",
    desc:  "Offres sélectionnées selon vos habitudes, avec cashback et avantages Premium pour maximiser vos économies.",
    url:   "/deals"
  },
  tarifs: {
    title: "Econya – Tarifs & Premium",
    desc:  "Passez en Premium (5,99 €/mois) : analyses avancées, connexion bancaire sécurisée, bons plans exclusifs.",
    url:   "/tarifs"
  }
};

// ——— Helpers SEO
function setMetaFor(tab){
  const base = document.querySelector('meta[name="router-base"]')?.content || "/";
  const host = location.origin;
  const m = META[tab] || META.comparateur;
  const path = (base.endsWith("/") ? base.slice(0,-1) : base) + m.url;

  // title + meta description
  document.title = m.title;
  let md = document.querySelector('meta[name="description"]');
  if (!md) { md = document.createElement("meta"); md.setAttribute("name","description"); document.head.appendChild(md); }
  md.setAttribute("content", m.desc);

  // canonical
  let can = document.querySelector('link[rel="canonical"]');
  if (!can) { can = document.createElement("link"); can.setAttribute("rel","canonical"); document.head.appendChild(can); }
  can.setAttribute("href", host + path);

  // Open Graph
  setOG("og:title", m.title);
  setOG("og:description", m.desc);
  setOG("og:url", host + path);

  // Twitter
  setTW("twitter:title", m.title);
  setTW("twitter:description", m.desc);
  // image OG/Twitter: laisse l’image générale si tu veux la même partout

  function setOG(prop, val){
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
    el.setAttribute("content", val);
  }
  function setTW(name, val){
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", val);
  }
}

// ——— Activation section
function activateSection(tab){
  document.querySelectorAll(".tab").forEach(b=>{
    b.setAttribute("aria-selected", b.dataset.tab === tab);
  });
  document.querySelectorAll(".section").forEach(s=>{
    s.classList.toggle("active", s.id === tab);
  });
  document.querySelectorAll("nav a[data-route]").forEach(a=>{
    a.classList.toggle("active", a.getAttribute("data-route") === tab);
  });
  setMetaFor(tab); // <-- MAJ SEO ici
}

// ——— Utils route
function pathRelativeToBase(pathname){
  const base = ROUTER_BASE.endsWith("/") ? ROUTER_BASE : ROUTER_BASE + "/";
  return pathname.startsWith(base) ? pathname.slice(base.length-1) : pathname;
}
function resolve(pathname){
  const rel = pathRelativeToBase(pathname);
  return ROUTES[rel] || ROUTES["/"];
}

// ——— Navigation programmée
function navigateTo(tab){
  const entry = Object.entries(ROUTES).find(([,t])=>t===tab);
  const path = (entry ? entry[0] : "/");
  const url  = ROUTER_BASE.replace(/\/$/,"") + path;
  history.pushState({tab}, "", url);
  activateSection(tab);
}

// ——— Bind liens
function bindLinks(){
  document.querySelectorAll("a[data-route]").forEach(a=>{
    a.addEventListener("click", (e)=>{
      e.preventDefault();
      navigateTo(a.getAttribute("data-route"));
    });
  });
  document.querySelectorAll("[data-tab]").forEach(btn=>{
    if (btn.tagName === "A" && btn.hasAttribute("data-route")) return;
    btn.addEventListener("click", (e)=>{
      e.preventDefault();
      navigateTo(btn.getAttribute("data-tab"));
    });
  });
}

// ——— back/forward
window.addEventListener("popstate", ()=>{
  const tab = resolve(location.pathname);
  activateSection(tab);
});

// ——— Redirection GitHub Pages
(function handleGhPagesRedirect(){
  try{
    const redir = sessionStorage.getItem("gh:redirect");
    if (redir) {
      sessionStorage.removeItem("gh:redirect");
      const u = new URL(redir, location.origin);
      const tab = resolve(u.pathname);
      history.replaceState({tab}, "", u.pathname + u.search + u.hash);
      activateSection(tab);
      return;
    }
  }catch{}
})();

// ——— Init
document.addEventListener("DOMContentLoaded", ()=>{
  const tab = resolve(location.pathname);
  activateSection(tab);
  bindLinks();
});
</script>
