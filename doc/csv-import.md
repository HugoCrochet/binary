# Process d'import financier

## Objectif

Importer manuellement les exports des banques, courtiers et comptes d'épargne,
puis valider les transactions avant agrégation.

Le premier format supporté est le **relevé mensuel Nickel PDF**. BNP `.xls`
sera ajouté ensuite via un parseur séparé, mais devra produire le même format
interne.

## Workflow cible

1. L'utilisateur choisit une période, par exemple juin 2026.
2. L'app indique les fichiers attendus par compte.
3. L'utilisateur dépose le fichier.
4. Le parseur détecte date, libellé, montant, devise et compte source.
5. Les lignes sont placées en staging.
6. Le libellé est normalisé pour la revue et la déduplication.
7. L'utilisateur valide ou corrige.
8. Les transactions validées alimentent les vues.

## Nickel PDF V1

Nickel ne fournit qu'un relevé mensuel PDF une fois le mois terminé. Le PDF
actuel contient du texte extractible : l'app utilise donc `pdftotext -layout`
via Poppler, sans OCR.

Sur macOS :

```bash
brew install poppler
which pdftotext
```

Décisions retenues :

- ne pas stocker le PDF original en base ;
- conserver le hash du fichier, son nom, la période détectée et le texte brut
  de chaque opération dans `rawPayload` ;
- créer ou réutiliser le compte financier `Nickel - Compte courant` ;
- stocker les lignes extraites dans `RawTransaction` avant validation ;
- créer les `Transaction` seulement après revue humaine ;
- autoriser une transaction validée sans catégorie.

Format interne commun produit par les parseurs :

```ts
type ParsedTransaction = {
  source: "nickel_pdf";
  date: Date;
  dateKey: string;
  rawLabel: string;
  normalizedLabel: string;
  amountCents: number;
  rawAmount: string;
  currency: "EUR";
  type: "expense" | "income" | "transfer";
  dedupeKey?: string;
  rawPayload: string;
};
```

La source changera pour les futurs parseurs, par exemple BNP `.xls`, mais le
reste du contrat doit rester stable.

## Principes

- Garder une trace suffisante pour pouvoir auditer l'import.
- Ne jamais valider automatiquement une catégorie sans revue dans le MVP.
- Supporter un format réel à la fois, en commençant par le compte le plus utile.
- Documenter chaque parseur ajouté avec un exemple anonymisé.
- Séparer les lignes importées en staging des transactions validées.
- Prévoir la détection des doublons, y compris en cas d'import partiel qui se
  recouvre avec un import déjà validé.

## Doublons V1

La déduplication commence simple :

- `ImportBatch.fileHash` bloque un fichier déjà importé ;
- `RawTransaction.dedupeKey` identifie une opération déjà validée ;
- la clé opérationnelle combine source, compte, date, montant et libellé
  normalisé.

Pour Nickel, les relevés sont mensuels complets. Pour BNP `.xls`, il faudra
gérer les exports qui couvrent plus d'un mois et les recouvrements partiels.
