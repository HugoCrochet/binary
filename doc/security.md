# Sécurité et hébergement

## Position actuelle

Binary est local-first. Les données financières restent sur la machine de
l'utilisateur et aucune synchronisation bancaire automatique n'est prévue.

## Tant que l'app reste locale

- Authentification locale simple dès maintenant, pour préparer l'app
  multi-utilisateur sans exposer de service public.
- Premier compte admin local : `mlg` / `1234`, avec changement de mot de passe
  obligatoire à la première connexion.
- Les mots de passe sont hashés côté serveur avec `crypto.scrypt`.
- Les sessions sont stockées en SQLite et liées à un cookie `httpOnly`.
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

- authentification de production ;
- chiffrement au repos ;
- séparation stricte des utilisateurs ;
- gestion des sauvegardes ;
- politique d'import et de suppression des fichiers ;
- modèle de menace minimal.

Aucune version hébergée ne doit être ajoutée sans décision explicite sur ces
points. L'auth locale actuelle sert au MVP local et ne doit pas être considérée
comme une réponse complète pour une plateforme publique.

## Données à ne jamais commiter

- base SQLite locale ;
- exports CSV bancaires ;
- backups JSON / CSV ;
- captures d'écran contenant des données financières ;
- fichiers de restauration ou d'audit contenant des transactions réelles ;
- fichier `.env` local contenant un chemin de base ou des secrets éventuels.
