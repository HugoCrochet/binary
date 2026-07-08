# Stockage local

## Décision actuelle

Le stockage principal du MVP sera une base **SQLite locale**, pilotée par
**Prisma**.

Chaque utilisateur aura sa propre base locale, non commitée dans Git. L'app
reste lancée localement via Next.js pour avancer rapidement sur les
fonctionnalités, tout en gardant une architecture plus proche d'un vrai produit
qu'une simple page web.

Emplacements retenus :

- base SQLite : `data/binary.sqlite` ;
- backups : `backups/` ;
- configuration locale : `.env` avec
  `DATABASE_URL="file:../data/binary.sqlite"`.

Le chemin `../data/binary.sqlite` est relatif au dossier `prisma/`, ce qui
pointe vers `data/binary.sqlite` à la racine du projet.

## Raisons du choix

- SQLite est simple à installer et robuste pour un usage local.
- Prisma fournit un schéma central lisible, des migrations versionnées et un
  client TypeScript typé.
- Prisma 7 utilise un driver adapter pour SQLite ; le projet utilise
  `@prisma/adapter-better-sqlite3`.
- Le modèle relationnel convient bien aux comptes, imports, transactions,
  catégories, portefeuilles, prêts et modules optionnels.
- Une base SQL facilite les filtres, agrégations mensuelles, historiques et
  contrôles de doublons.
- Le schéma peut être pensé pour une migration future vers PostgreSQL si le
  projet devient une plateforme hébergée.
- Les fichiers JSON / CSV restent utiles comme format de backup ou d'export,
  mais pas comme source de vérité principale.

## Principes retenus

- La base locale est personnelle à chaque utilisateur.
- La base ne doit jamais être commitée.
- `data/`, `backups/`, `*.sqlite`, `*.sqlite-*` et `.env*` sont ignorés par Git.
- `prisma/schema.prisma` devient la source de vérité du modèle SQL.
- `prisma.config.ts` charge `.env` et donne l'URL de connexion à Prisma.
- Les changements de schéma passent par des migrations Prisma.
- Le modèle doit prévoir une migration douce vers une plateforme multi-user,
  sans rendre le prototype inutilement complexe.
- Les données brutes importées doivent rester séparées des données validées.
- Les imports doivent être traçables via un identifiant d'import.
- Les fonctionnalités doivent pouvoir être activées ou désactivées par profil :
  comptes courants, budget, investissements, livrets, prêts, immobilier.

## Schéma v1

Le schéma initial reste volontairement minimal :

- `Profile` : profil local, même s'il n'y en a qu'un au départ ;
- `EnabledModule` : modules activables par profil ;
- `Account` : comptes courants, livrets, PEA, CTO, prêts ou enveloppes ;
- `Category` : catégories de revenus, dépenses ou investissements ;
- `ImportBatch` : un fichier CSV importé pour un compte et une période ;
- `RawTransaction` : ligne brute issue du CSV avant validation ;
- `Transaction` : opération validée.

Chaque table métier contient `profileId` dès maintenant. Les montants sont
stockés en centimes (`amountCents`) pour éviter les erreurs d'arrondi.

Les statuts et types restent des `String` au départ : cela évite de figer trop
tôt les catégories techniques du produit.

## Migrations

Les migrations Prisma seront utilisées pour faire évoluer le schéma sans
réécrire manuellement les données. La première migration se crée en local avec :

```bash
npm run db:migrate -- --name init
```

Principes retenus :

- commencer avec un schéma minimal ;
- privilégier les évolutions additives au début ;
- éviter les changements destructifs sans discussion explicite ;
- créer un backup avant toute migration appliquée sur une base contenant des
  données réelles ;
- garder en tête une migration future vers PostgreSQL, sans l'implémenter dans
  le MVP local.

Workflow courant :

```bash
npx prisma validate
npm run db:generate
npm run db:migrate
npm run db:status
```

`npm run db:studio` ouvre Prisma Studio pour inspecter/debugger la base. Ce
n'est pas l'interface normale pour gérer les données métier.

## Backup

Le backup est obligatoire parce que les données seront coûteuses à reconstruire
: imports corrigés, catégories validées, positions PEA, prêts, patrimoine et
éventuels biens immobiliers.

Décision actuelle :

- SQLite est la source de vérité.
- Des exports JSON / CSV serviront de sauvegarde lisible.
- En local, les backups seront déclenchés manuellement et avant les opérations
  importantes : migration, validation d'import, suppression massive,
  restauration.
- En hébergement futur, des backups planifiés pourront être ajoutés, par
  exemple toutes les heures si le contenu a changé.
- Un backup identique au précédent ne doit pas être recréé inutilement.
- L'app devra afficher clairement toute situation de fallback, restauration ou
  problème de base : l'utilisateur doit savoir qu'il ne consulte peut-être pas
  l'état normal des données.

Les détails restent à décider :

- nombre de backups conservés ;
- format de restauration ;
- contenu exact des exports JSON / CSV.

## Points ouverts

- Définir les détails de backup/restauration.
- Définir quand l'app déclenche automatiquement un backup.
- Raffiner le schéma quand le frontend et les premiers CSV réels l'exigeront.
