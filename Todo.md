# TODO : Binary

Document de travail pour cadrer la reprise du projet. Chaque section décrit le
problème, ce qu'on veut clarifier, puis les actions pratiques à mener.

---

## 1. Définir la structure globale et le frontend cible

**Objectif** : savoir ce que l'application doit afficher et manipuler avant de
définir précisément ce que les imports CSV doivent produire.

**Questions à clarifier** :
- Quelles pages principales veut-on garder pour le MVP ?
- Quelles informations doivent apparaître sur le dashboard global ?
- Quelles vues sont nécessaires pour le budget mensuel, les comptes, les
  investissements et le patrimoine ?
- Quelles données doivent être extraites des CSV pour alimenter ces vues ?
- Quelles données seront saisies manuellement plutôt qu'importées ?

**Plan pratique** :
1. Décrire les pages cibles et leur rôle.
2. Lister les données nécessaires pour chaque page.
3. Déduire un premier modèle de données minimal.
4. Documenter les décisions durables dans `doc/frontend.md` et
   `doc/data-model.md`.

---

## 2. Construire le workflow d'import CSV

**Objectif** : définir puis implémenter le chemin complet entre un export CSV
brut et des transactions prêtes à être revues.

**Questions à clarifier** :
- Quels CSV veut-on supporter en premier ?
- Quels champs sont obligatoires pour chaque transaction ?
- Comment détecter la période, le compte source et les doublons ?
- Comment organiser le script : fonctions, fichiers, types intermédiaires ?
- Que doit produire le script pour que le frontend puisse afficher une revue
  claire ?

**Plan pratique** :
1. Choisir un premier CSV réel à supporter.
2. Définir un format intermédiaire pour les lignes importées.
3. Créer un parseur simple, découpé en fonctions lisibles.
4. Prévoir une zone de staging avant validation.
5. Documenter le workflow dans `doc/csv-import.md`.

---

## 3. Préciser l'architecture SQLite locale

**Objectif** : transformer la décision SQLite locale en architecture concrète,
sans encore figer un schéma trop détaillé.

**Décision retenue** :
- Prisma + SQLite local comme source de vérité du MVP.
- Base personnelle à chaque utilisateur, jamais commitée.
- Exports JSON / CSV comme backup lisible.
- Schéma à penser pour une migration future vers PostgreSQL si le projet devient
  une plateforme hébergée.

**Questions restantes** :
- Où stocker le fichier SQLite local ?
- Comment organiser les commandes et migrations Prisma ?
- Quand créer des backups et combien en conserver ?
- Comment restaurer proprement un backup si la base est cassée ?

**Plan pratique** :
1. Réintroduire Prisma proprement avec SQLite.
2. Décider l'emplacement local de la base et l'ajouter aux fichiers ignorés.
3. Définir une stratégie de migration minimale avec backup préalable.
4. Définir une stratégie de backup/restauration.
5. Documenter les décisions dans `doc/storage.md`.

---

## 4. Catégorisation et revue humaine

**Objectif** : proposer automatiquement des catégories à partir des transactions
importées, puis laisser l'utilisateur valider ou corriger dans une page claire.

**Questions à clarifier** :
- Quelles catégories initiales veut-on proposer ?
- Quelle part doit être faite par règles locales avant d'utiliser un LLM ?
- Comment garder l'historique des corrections utilisateur ?
- Comment afficher une revue rapide : catégorie proposée, libellé original,
  libellé nettoyé, montant, compte, date ?
- Quand et comment tester un petit LLM local ?

**Plan pratique** :
1. Commencer par une liste simple de catégories.
2. Ajouter des règles locales de catégorisation basées sur les libellés.
3. Créer la page de revue/correction des transactions.
4. Garder les corrections pour améliorer les prochaines propositions.
5. Tester ensuite une catégorisation LLM locale si le besoin est confirmé.

---

## DONE

- Direction produit initiale clarifiée : dashboard financier personnel
  local-first, imports CSV manuels, revue humaine avant validation, pas de
  synchronisation bancaire automatique.
- Décision de stockage retenue : Prisma + SQLite local comme source de vérité
  du MVP, avec exports JSON / CSV pour backup et migration future à garder en
  tête.
- Principe de modularité retenu : les onglets/fonctionnalités doivent pouvoir
  être activés selon les besoins de l'utilisateur, notamment immobilier,
  prêts, investissements ou livrets.
- Nettoyage initial du repo effectué : retrait des briques Docker, Prisma,
  API routes, auth serveur, synchronisation automatique et intégrations
  bancaires devenues hors-scope.
- README recentré comme point d'entrée GitHub, avec documentation détaillée
  déplacée dans `doc/`.
