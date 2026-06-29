# Sécurité et hébergement

## Position actuelle

Binary est local-first. Les données financières restent sur la machine de
l'utilisateur et aucune synchronisation bancaire automatique n'est prévue.

## Tant que l'app reste locale

- Pas d'authentification nécessaire.
- Pas d'API publique.
- Pas d'envoi de CSV à un service externe.
- Sauvegarde à traiter explicitement quand le stockage sera choisi.

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
