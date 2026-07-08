# Binary

Binary est un dashboard financier personnel local-first. Le projet vise un outil
simple pour suivre ses finances quotidiennes, ses investissements, ses emprunts
et l'évolution de son patrimoine à partir d'imports CSV manuels.

L'application est aujourd'hui un prototype Next.js avec des données mockées.
Elle donne une première forme aux grands espaces du produit :

- un dashboard global pour le patrimoine, l'allocation et le cashflow ;
- une page budget pour suivre revenus, dépenses, investissements mensuels et
  taux d'épargne ;
- une page comptes pour visualiser les comptes et transactions récentes ;
- une page investissements pour suivre les portefeuilles, positions et
  allocations.

## Documentation

La documentation détaillée vit dans `doc/` et doit être maintenue au fil des
décisions.

- [Développement local](doc/development.md) : stack, commandes et notes Next.js.
- [Frontend](doc/frontend.md) : pages existantes, choix UI et points d'attention.
- [Process CSV](doc/csv-import.md) : workflow cible d'import et validation.
- [Modèle de données](doc/data-model.md) : premières entités à stabiliser.
- [Stockage local](doc/storage.md) : décision Prisma + SQLite, backups et points ouverts.
- [Sécurité et hébergement](doc/security.md) : position local-first et sujets à
  trancher avant toute version hébergée.
- [TODO projet](Todo.md) : ordre de travail et chantiers ouverts.

## Lancement rapide

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

Commandes utiles :

```bash
npm run typecheck
npm run build
```
