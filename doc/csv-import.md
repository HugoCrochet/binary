# Process CSV

## Objectif

Importer manuellement les exports CSV des banques, courtiers et comptes
d'épargne, puis valider les transactions avant agrégation.

## Workflow cible

1. L'utilisateur choisit une période, par exemple juin 2026.
2. L'app indique les fichiers attendus par compte.
3. L'utilisateur dépose les CSV.
4. Le parseur détecte date, libellé, montant, devise et compte source.
5. Les lignes sont placées en staging.
6. Des règles locales proposent un libellé normalisé et une catégorie.
7. L'utilisateur valide ou corrige.
8. Les transactions validées alimentent les vues.

## Principes

- Garder le CSV brut ou une trace suffisante pour pouvoir auditer l'import.
- Ne jamais valider automatiquement une catégorie sans revue dans le MVP.
- Supporter un format réel à la fois, en commençant par le compte le plus utile.
- Documenter chaque parseur ajouté avec un exemple anonymisé.
