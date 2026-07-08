# Sécurité et hébergement

## Position actuelle

Binary est local-first. Les données financières restent sur la machine de
l'utilisateur et aucune synchronisation bancaire automatique n'est prévue.

## Tant que l'app reste locale

- Pas d'authentification nécessaire.
- Pas d'API publique.
- Pas d'envoi de CSV à un service externe.
- Base SQLite locale personnelle, non commitée, gérée via Prisma.
- Exports JSON / CSV prévus comme backup lisible.
- Backup à déclencher avant les migrations Prisma appliquées sur des données
  réelles.
- Alerte explicite si l'app doit utiliser un fallback, restaurer un backup ou
  détecte un problème de base.

## Si l'app devient hébergée

Il faudra décider avant implémentation :

- authentification ;
- chiffrement au repos ;
- séparation stricte des utilisateurs ;
- gestion des sauvegardes ;
- politique d'import et de suppression des fichiers ;
- modèle de menace minimal.

Aucune version hébergée ne doit être ajoutée sans décision explicite sur ces
points.

## Données à ne jamais commiter

- base SQLite locale ;
- exports CSV bancaires ;
- backups JSON / CSV ;
- captures d'écran contenant des données financières ;
- fichiers de restauration ou d'audit contenant des transactions réelles ;
- fichier `.env` local contenant un chemin de base ou des secrets éventuels.
