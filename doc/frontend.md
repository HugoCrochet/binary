# Frontend

## Pages actuelles

- `/dashboard` : vue globale du patrimoine et du cashflow, actuellement mockée.
- `/budget` : prototype budget avec état local persistant.
- `/accounts` : liste de comptes mockée.
- `/investments` : liste de portefeuilles mockée.

## Choix actuels

- Interface dense et utilitaire, pas une landing page.
- Données mockées tant que l'import CSV et le stockage local ne sont pas prêts.
- Navigation simple par onglets principaux.
- Graphiques via Recharts et Nivo.

## Points d'attention

- Garder le rendu initial déterministe pour éviter les erreurs d'hydratation.
- Ne pas afficher de promesse de synchronisation automatique.
- Prévoir une future page de revue des transactions importées.
