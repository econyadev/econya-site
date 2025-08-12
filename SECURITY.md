# Sécurité — Econya (v6.3)

## Front (site/app)
- Content Security Policy (CSP) stricte pour bloquer XSS
- Referrer-Policy: strict-origin-when-cross-origin
- X-Content-Type-Options: nosniff
- Permissions-Policy: accès désactivés par défaut
- Messagerie: chiffrement **AES-GCM** au repos avec clé dérivée d’un **PIN** (PBKDF2)

## Backend (à activer côté API)
- TLS 1.2+ obligatoire, HSTS sur domaine
- Auth JWT courte durée + refresh rotatif (jti)
- Rate limiting + bruteforce protection sur /auth
- Helmet (headers), CORS strict (origins autorisées)
- Webhooks Bridge/Tink avec signature vérifiée & anti-replay
- Journaux sans données bancaires ni tokens

## Gestion des secrets
- Variables d’environnement uniquement (GitHub Secrets)
- Rotation des clés trimestrielle
- Scan de secrets (Gitleaks) en CI

## Signalement
Ouvrez une issue “Security” ou écrivez à security@econya.app
