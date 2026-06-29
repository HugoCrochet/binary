# Modèle de données

Première ébauche du modèle interne. Il sera ajusté quand les premiers CSV réels
seront branchés.

## Entités principales

- `Account` : compte courant, livret, PEA, CTO, prêt ou autre enveloppe.
- `StatementImport` : import CSV pour une période et un compte.
- `RawTransaction` : ligne issue du CSV avant validation.
- `Transaction` : opération validée et normalisée.
- `Category` : catégorie de dépense, revenu ou investissement.
- `Portfolio` : enveloppe d'investissement.
- `Holding` : ligne détenue dans un portefeuille.
- `Loan` : emprunt avec mensualité, taux, durée et capital restant dû.

## Règle importante

Séparer les données brutes des données validées. Une correction utilisateur ne
doit pas détruire l'information originale importée.

## Stockage

Le stockage local reste à décider. Les candidats actuels sont IndexedDB,
SQLite local ou fichiers structurés selon la forme future de l'app.
