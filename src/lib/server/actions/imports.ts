"use server";

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";

import { normalizeTransactionLabel, parseNickelPdfText } from "@/lib/import/parsers/nickel";
import type { ParsedTransactionType } from "@/lib/import/parsers/types";
import { requireAuth } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

const execFileAsync = promisify(execFile);
const NICKEL_SOURCE = "nickel_pdf";
const NICKEL_ACCOUNT_NAME = "Nickel - Compte courant";
const NICKEL_INSTITUTION = "Nickel";

export type ImportReviewRow = {
  id: string;
  date: string;
  rawLabel: string;
  normalizedLabel: string;
  amountCents: number;
  currency: string;
  type: ParsedTransactionType;
};

export type ImportNickelPdfResult =
  | {
      ok: true;
      importBatchId: string;
      originalFileName: string;
      parsedCount: number;
      pendingCount: number;
      duplicateCount: number;
      rows: ImportReviewRow[];
    }
  | {
      ok: false;
      error: string;
    };

export type ValidateImportResult =
  | {
      ok: true;
      validatedCount: number;
    }
  | {
      ok: false;
      error: string;
    };

export type ValidateImportInput = {
  importBatchId: string;
  rows: Array<{
    rawTransactionId: string;
    label: string;
    type: ParsedTransactionType;
    categoryId?: string | null;
  }>;
};

export async function importNickelPdfAction(formData: FormData): Promise<ImportNickelPdfResult> {
  const profile = await requireAuth();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Ajoute un relevé PDF Nickel." };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, error: "Le fichier Nickel doit être un PDF." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileHash = createHash("sha256").update(buffer).digest("hex");

  const alreadyImported = await prisma.importBatch.findFirst({
    where: {
      profileId: profile.id,
      source: NICKEL_SOURCE,
      fileHash,
    },
    include: {
      rawTransactions: {
        orderBy: {
          parsedDate: "asc",
        },
        select: {
          id: true,
          rawDate: true,
          rawLabel: true,
          normalizedLabel: true,
          amountCents: true,
          currency: true,
          status: true,
        },
      },
    },
  });

  if (alreadyImported) {
    const pendingRows = alreadyImported.rawTransactions
      .filter((transaction) => transaction.status === "pending")
      .map((transaction) => ({
        id: transaction.id,
        date: transaction.rawDate ?? "",
        rawLabel: transaction.rawLabel,
        normalizedLabel: transaction.normalizedLabel ?? normalizeTransactionLabel(transaction.rawLabel),
        amountCents: transaction.amountCents ?? 0,
        currency: transaction.currency,
        type: inferTypeFromAmount(transaction.amountCents ?? 0),
      }));

    if (pendingRows.length > 0) {
      return {
        ok: true,
        importBatchId: alreadyImported.id,
        originalFileName: alreadyImported.originalFileName,
        parsedCount: alreadyImported.rawTransactions.length,
        pendingCount: pendingRows.length,
        duplicateCount: alreadyImported.rawTransactions.filter((transaction) => transaction.status === "duplicate").length,
        rows: pendingRows,
      };
    }

    return { ok: false, error: "Ce PDF Nickel a déjà été importé." };
  }

  let text: string;
  try {
    text = await extractPdfText(buffer);
  } catch {
    return {
      ok: false,
      error: "Extraction PDF impossible. Vérifie que Poppler/pdftotext est installé sur la machine.",
    };
  }

  const parsedStatement = parseNickelPdfText(text);

  if (parsedStatement.transactions.length === 0) {
    return { ok: false, error: "Aucune opération Nickel n'a été détectée dans ce PDF." };
  }

  const account = await findOrCreateNickelAccount(profile.id);
  const dedupeKeys = parsedStatement.transactions.map((transaction) =>
    buildDedupeKey(account.id, transaction.dateKey, transaction.amountCents, transaction.normalizedLabel)
  );
  const existingRawTransactions = await prisma.rawTransaction.findMany({
    where: {
      profileId: profile.id,
      dedupeKey: {
        in: dedupeKeys,
      },
      status: "validated",
    },
    select: {
      dedupeKey: true,
    },
  });
  const existingDedupeKeys = new Set(existingRawTransactions.map((transaction) => transaction.dedupeKey));

  const createdRows = await prisma.$transaction(async (tx) => {
    const importBatch = await tx.importBatch.create({
      data: {
        profileId: profile.id,
        accountId: account.id,
        source: NICKEL_SOURCE,
        originalFileName: file.name,
        fileHash,
        periodStart: parsedStatement.periodStart,
        periodEnd: parsedStatement.periodEnd,
        status: "pending",
      },
    });

    const rows: ImportReviewRow[] = [];
    let duplicateCount = 0;

    for (const transaction of parsedStatement.transactions) {
      const dedupeKey = buildDedupeKey(
        account.id,
        transaction.dateKey,
        transaction.amountCents,
        transaction.normalizedLabel
      );
      const isDuplicate = existingDedupeKeys.has(dedupeKey);
      const rawTransaction = await tx.rawTransaction.create({
        data: {
          profileId: profile.id,
          importBatchId: importBatch.id,
          accountId: account.id,
          rawDate: transaction.dateKey,
          parsedDate: transaction.date,
          rawLabel: transaction.rawLabel,
          normalizedLabel: transaction.normalizedLabel,
          rawAmount: transaction.rawAmount,
          amountCents: transaction.amountCents,
          currency: transaction.currency,
          status: isDuplicate ? "duplicate" : "pending",
          dedupeKey,
          rawPayload: transaction.rawPayload,
        },
      });

      if (isDuplicate) {
        duplicateCount += 1;
      } else {
        rows.push({
          id: rawTransaction.id,
          date: transaction.dateKey,
          rawLabel: transaction.rawLabel,
          normalizedLabel: transaction.normalizedLabel,
          amountCents: transaction.amountCents,
          currency: transaction.currency,
          type: transaction.type,
        });
      }
    }

    if (rows.length === 0) {
      await tx.importBatch.update({
        where: { id: importBatch.id },
        data: { status: "duplicate" },
      });
    }

    return {
      importBatchId: importBatch.id,
      rows,
      duplicateCount,
    };
  });

  revalidatePath("/budget");

  return {
    ok: true,
    importBatchId: createdRows.importBatchId,
    originalFileName: file.name,
    parsedCount: parsedStatement.transactions.length,
    pendingCount: createdRows.rows.length,
    duplicateCount: createdRows.duplicateCount,
    rows: createdRows.rows,
  };
}

export async function validateImportAction(input: ValidateImportInput): Promise<ValidateImportResult> {
  const profile = await requireAuth();
  const importBatch = await prisma.importBatch.findFirst({
    where: {
      id: input.importBatchId,
      profileId: profile.id,
    },
    select: { id: true },
  });

  if (!importBatch) {
    return { ok: false, error: "Import introuvable." };
  }

  const rows = input.rows.filter((row) => row.rawTransactionId && row.label.trim());

  if (rows.length === 0) {
    return { ok: false, error: "Aucune opération à valider." };
  }

  const allowedTypes = new Set<ParsedTransactionType>(["expense", "income", "transfer"]);
  const categoryIds = rows.map((row) => row.categoryId).filter((categoryId): categoryId is string => Boolean(categoryId));
  const categories = categoryIds.length
    ? await prisma.category.findMany({
        where: {
          profileId: profile.id,
          id: { in: categoryIds },
        },
        select: { id: true },
      })
    : [];
  const validCategoryIds = new Set(categories.map((category) => category.id));

  let validatedCount = 0;

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      if (!allowedTypes.has(row.type)) {
        continue;
      }

      const rawTransaction = await tx.rawTransaction.findFirst({
        where: {
          id: row.rawTransactionId,
          profileId: profile.id,
          importBatchId: input.importBatchId,
          status: "pending",
        },
      });

      if (!rawTransaction?.parsedDate || rawTransaction.amountCents === null) {
        continue;
      }

      const categoryId = row.categoryId && validCategoryIds.has(row.categoryId) ? row.categoryId : null;
      const label = row.label.trim();

      await tx.transaction.create({
        data: {
          profileId: profile.id,
          accountId: rawTransaction.accountId,
          rawTransactionId: rawTransaction.id,
          categoryId,
          date: rawTransaction.parsedDate,
          label,
          originalLabel: rawTransaction.rawLabel,
          amountCents: rawTransaction.amountCents,
          currency: rawTransaction.currency,
          type: row.type,
        },
      });

      await tx.rawTransaction.update({
        where: { id: rawTransaction.id },
        data: {
          status: "validated",
          normalizedLabel: normalizeTransactionLabel(label),
        },
      });

      validatedCount += 1;
    }

    const pendingCount = await tx.rawTransaction.count({
      where: {
        importBatchId: input.importBatchId,
        profileId: profile.id,
        status: "pending",
      },
    });

    await tx.importBatch.update({
      where: { id: input.importBatchId },
      data: {
        status: pendingCount === 0 ? "validated" : "pending",
      },
    });
  });

  revalidatePath("/budget");

  return { ok: true, validatedCount };
}

async function extractPdfText(buffer: Buffer) {
  const tmpDirectory = await mkdtemp(path.join(tmpdir(), "binary-nickel-"));
  const inputPath = path.join(tmpDirectory, "statement.pdf");

  try {
    await writeFile(inputPath, buffer);
    const { stdout } = await execFileAsync("pdftotext", ["-layout", inputPath, "-"], {
      maxBuffer: 1024 * 1024 * 10,
    });
    return stdout;
  } finally {
    await rm(tmpDirectory, { recursive: true, force: true });
  }
}

async function findOrCreateNickelAccount(profileId: string) {
  const existingAccount = await prisma.account.findFirst({
    where: {
      profileId,
      institution: NICKEL_INSTITUTION,
      type: "checking",
      name: NICKEL_ACCOUNT_NAME,
    },
  });

  if (existingAccount) {
    return existingAccount;
  }

  return prisma.account.create({
    data: {
      profileId,
      name: NICKEL_ACCOUNT_NAME,
      institution: NICKEL_INSTITUTION,
      type: "checking",
      currency: "EUR",
    },
  });
}

function buildDedupeKey(accountId: string, dateKey: string, amountCents: number, normalizedLabel: string) {
  return [NICKEL_SOURCE, accountId, dateKey, amountCents, normalizedLabel].join("|");
}

function inferTypeFromAmount(amountCents: number): ParsedTransactionType {
  return amountCents >= 0 ? "income" : "expense";
}
