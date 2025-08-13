# Econya – Brand Patch (assets only)

Ce pack remplace **uniquement** les visuels afin que ton site prenne le nouveau look **sans toucher au code**.

## Fichiers inclus
- `assets/logo.svg` → remplace l'ancien `assets/logo.svg` (wordmark + feuille).
- `assets/favicon.svg` → remplace l'ancien favicon référencé par `assets/favicon.svg`.
- `assets/img/logo-dark.png` → utilisé comme fallback favicon ou logo raster.
- `assets/img/social-card.png` → image Open Graph (1200×630) pour les partages.

## Installation (GitHub)
1. Ouvre le dépôt `econya-site` → **Code**.
2. Clique **Add files → Upload files** et *glisse* le dossier `assets/` de ce pack à la racine du repo (accepte l'écrasement des fichiers existants).
3. Commit → attends le ✅ *Pages build and deployment*.
4. Teste les URLs directes (avec un cache-buster) :
   - https://econya.fr/assets/img/logo-dark.png?v=1001
   - https://econya.fr/assets/img/social-card.png?v=1001

## (Option) Activer l'aperçu enrichi sur les réseaux
Si ton `index.html` (et `404.html`) n'inclut pas déjà les meta Open Graph/Twitter, ouvre le fichier et colle le contenu de `patch_head_snippet.html` **à l'intérieur de `<head>`**.

## Remarques
- Les fichiers sont optimisés et sans dépendance.
- Si tu utilises un thème clair plus tard, garde ce pack pour le thème sombre et ajoute `logo-light.svg` + règles CSS de bascule.
