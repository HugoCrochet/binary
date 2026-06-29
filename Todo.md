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

## 3. Choisir le stockage local

**Objectif** : remplacer la simple persistance navigateur par un stockage local
fiable pour les imports, corrections, historiques et données validées.

**Options à comparer** :
- Petite base de données locale.
- Fichiers JSON / CSV écrits localement.
- IndexedDB si on reste sur une app web pure.
- SQLite si on évolue vers une app locale plus structurée.

**Critères de décision** :
- simplicité de mise en place ;
- facilité de sauvegarde et de migration ;
- lisibilité des données en cas de debug ;
- compatibilité avec une app locale web ou desktop plus tard ;
- risque de perdre ou corrompre les données.

**Plan pratique** :
1. Comparer les options sur un petit exemple concret.
2. Choisir une solution pour le prototype.
3. Définir comment sauvegarder/exporter les données.
4. Documenter la décision dans `doc/data-model.md` ou un fichier dédié si besoin.

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
- Nettoyage initial du repo effectué : retrait des briques Docker, Prisma,
  API routes, auth serveur, synchronisation automatique et intégrations
  bancaires devenues hors-scope.
- README recentré comme point d'entrée GitHub, avec documentation détaillée
  déplacée dans `doc/`.
