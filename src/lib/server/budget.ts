import { prisma } from "@/lib/server/db";

export type BudgetCategoryOption = {
  id: string;
  name: string;
  type: string;
};

export type BudgetTransactionRow = {
  id: string;
  date: string;
  label: string;
  amountCents: number;
  currency: string;
  type: string;
  categoryName: string | null;
};

export type BudgetViewModel = {
  monthLabel: string | null;
  totalIncomeCents: number;
  totalExpenseCents: number;
  netCashflowCents: number;
  transactionCount: number;
  categories: BudgetCategoryOption[];
  transactions: BudgetTransactionRow[];
  sankey: {
    nodes: Array<{ id: string; name: string }>;
    links: Array<{ source: string; target: string; value: number }>;
  };
};

export async function getBudgetViewModel(profileId: string): Promise<BudgetViewModel> {
  const [categories, allTransactions] = await Promise.all([
    prisma.category.findMany({
      where: { profileId },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        type: true,
      },
    }),
    prisma.transaction.findMany({
      where: { profileId },
      orderBy: { date: "desc" },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const latestTransaction = allTransactions[0];
  const monthKey = latestTransaction ? toMonthKey(latestTransaction.date) : null;
  const transactions = monthKey
    ? allTransactions.filter((transaction) => toMonthKey(transaction.date) === monthKey)
    : [];

  const totalIncomeCents = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountCents), 0);
  const totalExpenseCents = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountCents), 0);
  const netCashflowCents = totalIncomeCents - totalExpenseCents;
  const expenseByCategory = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }
    const categoryName = transaction.category?.name ?? "À catégoriser";
    expenseByCategory.set(categoryName, (expenseByCategory.get(categoryName) ?? 0) + Math.abs(transaction.amountCents));
  }

  const sankeyNodes: BudgetViewModel["sankey"]["nodes"] = [
    { id: "income", name: "Revenus" },
    { id: "budget", name: "Budget" },
  ];
  const sankeyLinks: BudgetViewModel["sankey"]["links"] = [];

  if (totalIncomeCents > 0) {
    sankeyLinks.push({
      source: "income",
      target: "budget",
      value: centsToEuros(totalIncomeCents),
    });
  }

  for (const [categoryName, amountCents] of expenseByCategory.entries()) {
    const categoryId = `expense-${slugify(categoryName)}`;
    sankeyNodes.push({ id: categoryId, name: categoryName });
    sankeyLinks.push({
      source: "budget",
      target: categoryId,
      value: centsToEuros(amountCents),
    });
  }

  return {
    monthLabel: monthKey ? formatMonthLabel(monthKey) : null,
    totalIncomeCents,
    totalExpenseCents,
    netCashflowCents,
    transactionCount: transactions.length,
    categories,
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      date: toDateKey(transaction.date),
      label: transaction.label,
      amountCents: transaction.amountCents,
      currency: transaction.currency,
      type: transaction.type,
      categoryName: transaction.category?.name ?? null,
    })),
    sankey: {
      nodes: sankeyNodes,
      links: sankeyLinks,
    },
  };
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toMonthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function centsToEuros(amountCents: number) {
  return Math.round(amountCents) / 100;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
