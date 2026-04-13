# Tinda Cash

**Application de transfert d'argent Afrique/LatAm/Asie → Europe**
Transferts instantanés avec taux transparents, frais réduits.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS (dark theme custom) |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (jose) + cookies httpOnly |
| Paiements Africa | Flutterwave (NGN, KES, XOF, GHS, MAD) |
| Disbursement EU | Wise Platform (SEPA EUR, FPS GBP) |
| Wallet multi-devise | Airwallex (EUR + USD + CHF) |
| KYC | Onfido (document + liveness) |
| SMS OTP | Twilio |
| Hébergement | Vercel (serverless) |
| Base de données | Neon.tech (PostgreSQL serverless) |

---

## Prérequis

- Node.js 18+
- npm ou pnpm
- Compte Neon.tech (gratuit)
- Compte Vercel (gratuit)

---

## Installation locale

### 1. Cloner et installer

```bash
git clone <repo-url>
cd tinda-cash
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplir les variables obligatoires dans `.env.local` :

```env
# Base de données (Neon.tech)
DATABASE_URL="postgresql://..."

# JWT Secret (générer avec: openssl rand -base64 32)
JWT_SECRET="votre-secret-32-chars-minimum"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Les autres variables (Flutterwave, Wise, Onfido, Twilio) sont **optionnelles** en développement — l'app fonctionne avec des données mock.

### 3. Base de données

```bash
# Pousser le schéma Prisma vers Neon
npx prisma db push

# (Optionnel) Seeder avec données de test
npx prisma db seed

# Voir les données dans Prisma Studio
npx prisma studio
```

### 4. Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Déploiement sur Vercel

### Étape 1 — Base de données Neon.tech

1. Créer un compte sur [neon.tech](https://neon.tech) (gratuit)
2. Créer un nouveau projet "tinda-cash"
3. Copier la connection string (format: `postgresql://user:pass@host/db?sslmode=require`)

### Étape 2 — Déployer sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Ou lier au repo GitHub pour auto-deploy
```

### Étape 3 — Variables d'environnement Vercel

Dans le dashboard Vercel → Settings → Environment Variables, ajouter :

| Variable | Valeur | Requis |
|----------|--------|--------|
| `DATABASE_URL` | PostgreSQL URL (Neon) | ✅ Obligatoire |
| `JWT_SECRET` | Secret 32+ chars | ✅ Obligatoire |
| `NEXT_PUBLIC_APP_URL` | `https://votredomaine.vercel.app` | ✅ Obligatoire |
| `EXCHANGE_RATE_API_KEY` | ExchangeRate-API key | Recommandé |
| `FLUTTERWAVE_SECRET_KEY` | Clé secrète Flutterwave | Prod uniquement |
| `FLUTTERWAVE_PUBLIC_KEY` | Clé publique Flutterwave | Prod uniquement |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Secret webhook | Prod uniquement |
| `WISE_API_KEY` | Wise Platform API key | Prod uniquement |
| `WISE_PROFILE_ID` | Wise Business profile ID | Prod uniquement |
| `WISE_API_ENV` | `production` ou `sandbox` | Prod uniquement |
| `AIRWALLEX_CLIENT_ID` | Client ID Airwallex | Prod uniquement |
| `AIRWALLEX_API_KEY` | API Key Airwallex | Prod uniquement |
| `AIRWALLEX_ENV` | `production` ou `demo` | Prod uniquement |
| `ONFIDO_API_TOKEN` | Token API Onfido | Prod uniquement |
| `ONFIDO_WEBHOOK_TOKEN` | Token webhook Onfido | Prod uniquement |
| `TWILIO_ACCOUNT_SID` | Account SID Twilio | Prod uniquement |
| `TWILIO_AUTH_TOKEN` | Auth token Twilio | Prod uniquement |
| `TWILIO_PHONE_NUMBER` | Numéro expéditeur SMS | Prod uniquement |

### Étape 4 — Pousser le schéma DB

```bash
# Depuis le projet local avec la DATABASE_URL de Neon
npx prisma migrate deploy
```

### Étape 5 — Configurer les webhooks

**Flutterwave :**
- URL : `https://votredomaine.vercel.app/api/webhook`
- Events : `charge.completed`

**Onfido :**
- URL : `https://votredomaine.vercel.app/api/webhook`
- Events : `check.completed`

---

## Architecture du projet

```
tinda-cash/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Pages auth (register, login)
│   │   ├── (dashboard)/     # App principale (dashboard, send, history, profile)
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # register, login, otp, logout
│   │   │   ├── rates/       # Taux de change live
│   │   │   ├── transfers/   # Création/liste des transferts
│   │   │   ├── kyc/         # Vérification identité Onfido
│   │   │   └── webhook/     # Callbacks Flutterwave + Onfido
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   ├── lib/
│   │   ├── db.ts            # Prisma client singleton
│   │   ├── auth.ts          # JWT + session + password
│   │   ├── utils.ts         # Utilitaires (format, validation)
│   │   ├── corridors.ts     # Définition des corridors de transfert
│   │   └── integrations/
│   │       ├── flutterwave.ts  # M-Pesa, MTN, Orange, Wave
│   │       ├── wise.ts         # SEPA EUR, FPS GBP
│   │       ├── airwallex.ts    # Wallet EUR/USD/CHF
│   │       └── onfido.ts       # KYC identité
│   └── middleware.ts        # Auth middleware (route protection)
├── prisma/
│   └── schema.prisma        # Schéma base de données
└── public/
```

---

## Modèle économique (asset-light)

```
Client (Afrique) → Tinda Cash → Flutterwave → Wise/Airwallex → Bénéficiaire (Europe)

Revenus:
- Spread FX : 0.9% à 1.5% du montant
- Frais fixes : 1.50€ à 3.00€ minimum
- Pas de licence financière requise au départ

Partenaires réglementés:
- Flutterwave : collecte Africa (agréé dans 30+ pays)
- Wise Platform : distribution EU (agréé UE + UK)
- Airwallex : wallet multi-devise (agréé UK, UE, HK)
- Onfido : KYC/AML délégué (FCA, ACPR agréé)
```

---

## Corridors actifs (MVP)

| Source | Destination | Méthode | Délai |
|--------|-------------|---------|-------|
| 🇳🇬 NGN → | 🇬🇧 GBP | M-Pesa / Bank | ~2 min |
| 🇸🇳 XOF → | 🇫🇷 EUR | Orange Money / Wave | < 5 min |
| 🇲🇦 MAD → | 🇫🇷 EUR | Virement bancaire | ~5 min |
| 🇰🇪 KES → | 🇬🇧 GBP | M-Pesa | ~2 min |
| 🇬🇭 GHS → | 🇬🇧 GBP | MTN Money | < 5 min |
| 🇨🇮 XOF → | 🇫🇷 EUR | MTN / Orange / Wave | < 5 min |

---

## Commandes utiles

```bash
# Dev
npm run dev

# Build
npm run build

# Type check
npx tsc --noEmit

# Linter
npm run lint

# Prisma
npx prisma studio          # GUI base de données
npx prisma db push         # Sync schéma (dev)
npx prisma migrate deploy  # Appliquer migrations (prod)
npx prisma generate        # Regénérer client Prisma

# Tester les API localement
curl http://localhost:3000/api/rates?from=NGN&to=EUR&amount=50000
```

---

## Comptes de test (développement)

En mode développement, l'app utilise des **données mock** et **n'appelle pas les vraies APIs** si les clés ne sont pas configurées.

OTP de test : tout code à 6 chiffres est accepté (la vérification est bypassed en dev).

---

## Prochaines étapes (Phase 2)

- [ ] Licence PI Lituanie (Electronic Money Institution)
- [ ] Corridor MX → ES et BR → PT (LatAm)
- [ ] Application mobile (React Native / Flutter)
- [ ] 2FA application (TOTP)
- [ ] Programme de parrainage complet
- [ ] Dashboard analytique (revenus, volumes)
- [ ] Support chat in-app

---

## Licence

Propriétaire — Tinda Cash © 2024
