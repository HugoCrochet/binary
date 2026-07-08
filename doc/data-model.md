# Modèle de données

Première ébauche du modèle interne. Il sera ajusté quand les premiers CSV réels
seront branchés.

## Entités principales

- `Profile` : profil local, base d'une future évolution multi-user.
- `EnabledModule` : activation des modules par profil.
- `Account` : compte courant, livret, PEA, CTO, prêt ou autre enveloppe.
- `ImportBatch` : import CSV pour une période et un compte.
- `RawTransaction` : ligne issue du CSV avant validation.
- `Transaction` : opération validée et normalisée.
- `Category` : catégorie de dépense, revenu ou investissement.

Les futures entités `Portfolio`, `Holding`, `Loan` ou `RealEstateAsset` seront
ajoutées quand les onglets correspondants seront cadrés.

## Règle importante

Séparer les données brutes des données validées. Une correction utilisateur ne
doit pas détruire l'information originale importée.

## Stockage

Décision actuelle : Prisma 7 + SQLite local comme source de vérité du MVP, avec
exports JSON / CSV pour backup. Voir `doc/storage.md`.

Le schéma v1 est défini dans `prisma/schema.prisma`. Il pose seulement les
tables nécessaires au profil, aux modules, aux comptes, aux catégories et au
workflow CSV brut puis validé.

Le schéma Prisma devra rester minimal au départ. Ajouter une table ou une
colonne sera acceptable ; supprimer ou transformer une donnée existante devra
être discuté explicitement.

## Modularité

Les fonctionnalités doivent pouvoir être activées selon le profil utilisateur.
Un utilisateur peut vouloir uniquement comptes courants, budget et livrets,
tandis qu'un autre peut activer les prêts, le PEA ou l'immobilier locatif.

Modules envisagés :

- comptes courants et transactions ;
- budget et catégories ;
- livrets et épargne ;
- investissements PEA / CTO ;
- prêts et échéanciers ;
- immobilier locatif.
