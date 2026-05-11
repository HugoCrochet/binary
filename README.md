# Finance Aggregator

Application personnelle pour agréger vos comptes bancaires et investissements en un seul endroit.

## Fonctionnalités (MVP)

- **Tableau de bord** : Vue d'ensemble de votre patrimoine, performance, allocation par classe d'actif
- **Comptes bancaires** : Synchronisation automatique avec Banque Populaire, Revolut, et autres via Open Banking PSD2
- **Investissements** : Portfolio PEA, CTO, Assurance Vie
- **Historique** : Snapshots quotidiens pour suivre l'évolution de votre patrimoine
- **Synchronisation** : Toutes les 6 heures automatiquement

## Stack Technique

- **Frontend** : Next.js (App Router), TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes
- **Database** : PostgreSQL avec Prisma ORM
- **Auth** : JWT-based authentication (single user mode)
- **Sync** : Enable Banking (Open Banking PSD2), Bourse Direct scraper (Playwright)

## Développement Local

```bash
# Installation
npm install

# Configuration
cp .env.example .env.local
# Éditer .env.local avec vos paramètres

# Base de données (Docker)
docker-compose up -d

# Migrations Prisma
npx prisma generate
npx prisma migrate dev

# Lancement
npm run dev
```

## Architecture

```
Sources financières
        ↓
Connecteurs (Enable Banking + Bourse Direct)
        ↓
Normalisation
        ↓
PostgreSQL
        ↓
API backend (Next.js API routes)
        ↓
Dashboard Next.js
```

## Structure du Projet

```
finance-aggregator/
├── prisma/
│   ├── schema.prisma      # Modèle Prisma
│   └── migrations/        # Migrations DB
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   └── (pages)/       # Pages frontend
│   ├── lib/
│   │   ├── db/            # Prisma client
│   │   ├── integrations/  # Connecteurs externes
│   │   ├── normalizer/    # Normalisation des données
│   │   └── utils/         # Utilitaires
│   └── scripts/           # Jobs de sync
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.local             # Variables d'environnement
└── package.json
```

## Configuration Enable Banking

1. Créez un compte sur [Enable Banking](https://www.enablebanking.com/)
2. Obtenez vos API credentials
3. Configurez `ENABLE_BANKING_API_KEY` et `ENABLE_BANKING_API_SECRET` dans `.env.local`
4. Définissez votre redirect URI : `http://localhost:3000/api/auth/enable-banking/callback`

## Configuration Bourse Direct

1. Ajoutez vos identifiants dans `.env.local` :
   ```
   BOURSE_DIRECT_USERNAME=votre-utilisateur
   BOURSE_DIRECT_PASSWORD=votre-mot-de-passe
   ```

## Déploiement

```bash
# Build
docker-compose build

# Lancement
docker-compose up -d
```

## License

MIT
