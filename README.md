# 🌱 Econya — Vos économies grandissent avec vous

[![Version](https://img.shields.io/badge/version-v9.7.7-green)](#)
[![Status](https://img.shields.io/badge/status-live-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](#)
[![Languages](https://img.shields.io/badge/i18n-FR%20EN%20ES%20PT%20AR-blue)](#)
[![Performance](https://img.shields.io/badge/score-Lighthouse%2090%2B-success)](#)

**Econya** est un comparateur intelligent et un **coach d’économies**. Connectez vos dépenses, comparez (banque, énergie, mobile, voyages…), recevez des **alertes prix**, et suivez votre **arbre d’économies** qui pousse à chaque gain. Multilingue, PWA offline, SEO-ready.

## ✨ Fonctionnalités
- **Comparateur Pro** (filtres, historique 30/90j, alertes e‑mail/in‑app, export CSV)
- **Coach Eco** (playbooks court/moyen/long terme, conseils par pays & profil)
- **Fidélisation** (arbre qui pousse, badges, défis)
- **Cartes cadeaux / Bons plans** (affiliation prête)
- **Marchés** (actions/ETF/crypto/commodities — hooks API prêts)
- **Voyages & Loisirs** (recherche + alertes)
- **Multilingue** (FR/EN/ES/PT/AR avec RTL) & **PWA offline**
- **Monétisation** (Premium, affiliation Amazon/Rakuten/Awin, parrainage)

## 🚀 Déploiement rapide
**GitHub Pages (front)** : Settings → Pages → Branch `main` → root → URL publique.  
**Render Static Site** : Build *(vide)*, Publish `.` → Live.  
**Backend (optionnel)** : Render Web Service (Express). Définir l’URL dans `assets/env.js` :
```html
<script>window.ECONYA_API_BASE="https://ton-api.onrender.com";</script>
```

## 🧩 Arborescence
```
/index.html  /404.html  /assets/{style.css, main.js, i18n.js, i18n.json, env.js, logo.svg}
/sw.js  /robots.txt  /sitemap.xml  /manifest.webmanifest
/comparator-pro.html  /coach-eco.html  /deals.html  /giftcards.html
/markets.html  /travel.html  /tarifs.html  /partners.html  /faq.html  /contact.html
```

## 🤝 Contribution
PR bienvenues. Voir `CHANGELOG.md`. Pas de secrets dans le repo.

© 2025 Econya — *Vos économies grandissent avec vous*
