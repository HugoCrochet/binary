# Développement local

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Recharts et Nivo

## Commandes

```bash
npm install
npm run dev
```

Validation :

```bash
npm run typecheck
npm run build
```

## Notes Next.js

Ce projet utilise une version récente de Next.js. Avant de modifier les routes,
layouts, composants serveur/client, route handlers ou la config, lire le guide
pertinent dans `node_modules/next/dist/docs/`.

Les composants client sont aussi prérendus côté serveur au premier chargement :
éviter `Math.random()`, `Date.now()` ou des dates dynamiques dans le rendu initial.
