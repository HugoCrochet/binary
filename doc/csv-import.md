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
- Séparer les lignes importées en staging des transactions validées.
- Prévoir la détection des doublons, y compris en cas d'import partiel qui se
  recouvre avec un import déjà validé.

## Doublons

La stratégie exacte sera définie après observation des CSV réels de chaque
banque. Les cas à gérer sont déjà identifiés :

- un fichier déjà importé ;
- un nouvel export qui recouvre une période déjà importée ;
- une transaction déjà validée qui réapparaît dans un CSV plus récent ;
- des lignes sans identifiant bancaire stable.

La déduplication devra se faire avant la revue utilisateur pour éviter de faire
revalider des transactions déjà traitées.
