# Développement local

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Recharts et Nivo
- Prisma 7 + SQLite local

## Version Node

Prisma 7 ne supporte pas Node `23.x`. Utiliser Node 22 LTS pour le projet.
La version attendue est définie dans `.nvmrc` et `.node-version` : `22.12.0`.

Si aucun gestionnaire de version Node n'est installé, utiliser `fnm` :

```bash
brew install fnm
echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc
exec zsh
fnm install 22.12.0
fnm use 22.12.0
node -v
```

Si `fnm use` affiche Node 22 mais que `node -v` reste sur une autre version,
ouvrir un nouveau terminal ou lancer :

```bash
rehash
fnm current
which node
type -a node
node -v
```

`node -v` doit afficher `v22.12.0` avant de lancer les commandes Prisma.

Si `nvm` est déjà installé :

```bash
nvm install
nvm use
node -v
```

## Premier setup local

```bash
npm install
```

Vérifier que `.env` existe à la racine et contient :

```bash
DATABASE_URL="file:../data/binary.sqlite"
```

Créer la base SQLite locale et la première migration :

```bash
npm run db:migrate -- --name init
```

Générer le client Prisma :

```bash
npm run db:generate
```

Inspecter la base si besoin :

```bash
npm run db:studio
```

Lancer l'app quand on veut travailler sur le front :

```bash
npm run dev
```

## Validation

Après une modification du schéma Prisma :

```bash
npx prisma validate
npm run db:generate
npm run db:migrate
```

Avant un commit :

```bash
npm run typecheck
npm run build
```

Ne pas lancer `npm audit fix --force` sans discussion : npm peut proposer des
downgrades majeurs de Prisma ou Next.js qui casseraient le projet.

`npm run db:studio` sert à inspecter et debugger la base. Les modifications
métier régulières doivent passer par l'app, pas par Prisma Studio.

## Données locales

- `data/binary.sqlite` contient la base locale personnelle.
- `backups/` contiendra les exports de sécurité.
- Ces deux dossiers ne doivent jamais être commités.
- `.env` est local et ne doit pas être commité.

Voir aussi `doc/storage.md`.

## Notes Next.js

Ce projet utilise une version récente de Next.js. Avant de modifier les routes,
layouts, composants serveur/client, route handlers ou la config, lire le guide
pertinent dans `node_modules/next/dist/docs/`.

Les composants client sont aussi prérendus côté serveur au premier chargement :
éviter `Math.random()`, `Date.now()` ou des dates dynamiques dans le rendu initial.

Le helper Prisma est dans `src/lib/server/db.ts`. Il ne doit être importé que
depuis du code serveur : Server Components, Server Actions, Route Handlers ou
autres modules serveur.
