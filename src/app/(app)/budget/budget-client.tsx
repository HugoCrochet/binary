'use client';

import { useMemo, useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, FileTextIcon, UploadIcon, XIcon } from 'lucide-react';

import { SankeyChart } from '@/components/ui/sankey-chart';
import { importNickelPdfAction, validateImportAction } from '@/lib/server/actions/imports';
import type { ImportNickelPdfResult, ImportReviewRow, ValidateImportInput } from '@/lib/server/actions/imports';
import type { BudgetViewModel } from '@/lib/server/budget';
import { formatCurrency } from '@/lib/utils';

type ReviewRowState = ImportReviewRow & {
  label: string;
  categoryId: string;
};

type BudgetClientProps = {
  budget: BudgetViewModel;
};

const TYPE_LABELS: Record<string, string> = {
  expense: 'Dépense',
  income: 'Revenu',
  transfer: 'Transfert',
};

export function BudgetClient({ budget }: BudgetClientProps) {
  const router = useRouter();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportNickelPdfResult | null>(null);
  const [reviewRows, setReviewRows] = useState<ReviewRowState[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasBudgetData = budget.transactionCount > 0;
  const canRenderSankey = budget.sankey.nodes.length > 2 && budget.sankey.links.length > 0;

  const expenseGroups = useMemo(() => {
    const groups = new Map<string, number>();
    for (const transaction of budget.transactions) {
      if (transaction.type !== 'expense') continue;
      const categoryName = transaction.categoryName ?? 'À catégoriser';
      groups.set(categoryName, (groups.get(categoryName) ?? 0) + Math.abs(transaction.amountCents));
    }
    return Array.from(groups.entries()).sort((a, b) => b[1] - a[1]);
  }, [budget.transactions]);

  const handleUpload = (formData: FormData) => {
    setUploadError(null);
    setValidationError(null);

    startTransition(async () => {
      const result = await importNickelPdfAction(formData);
      setImportResult(result);

      if (!result.ok) {
        setUploadError(result.error);
        return;
      }

      setReviewRows(
        result.rows.map((row) => ({
          ...row,
          label: row.rawLabel,
          categoryId: '',
        }))
      );
    });
  };

  const handleValidate = () => {
    if (!importResult?.ok) return;
    setValidationError(null);

    const input: ValidateImportInput = {
      importBatchId: importResult.importBatchId,
      rows: reviewRows.map((row) => ({
        rawTransactionId: row.id,
        label: row.label,
        type: row.type,
        categoryId: row.categoryId || null,
      })),
    };

    startTransition(async () => {
      const result = await validateImportAction(input);

      if (!result.ok) {
        setValidationError(result.error);
        return;
      }

      setIsImportOpen(false);
      setImportResult(null);
      setReviewRows([]);
      router.refresh();
    });
  };

  const updateReviewRow = (id: string, patch: Partial<ReviewRowState>) => {
    setReviewRows((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Budget & Cashflow</h1>
          <p className="mt-1 text-gray-600">
            {budget.monthLabel ? `Vue consolidée pour ${budget.monthLabel}` : 'Importez un relevé pour commencer.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsImportOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <UploadIcon className="h-4 w-4" />
          Import Nickel
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard label="Revenus" value={formatCurrency(budget.totalIncomeCents / 100)} tone="income" />
        <SummaryCard label="Dépenses" value={formatCurrency(budget.totalExpenseCents / 100)} tone="expense" />
        <SummaryCard label="Cashflow net" value={formatCurrency(budget.netCashflowCents / 100)} tone="neutral" />
        <SummaryCard label="Transactions" value={budget.transactionCount.toString()} tone="neutral" />
      </div>

      {canRenderSankey ? (
        <SankeyChart nodes={budget.sankey.nodes} links={budget.sankey.links} />
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <FileTextIcon className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-3 text-base font-semibold text-gray-900">Aucun flux à afficher</h2>
          <p className="mt-1 text-sm text-gray-500">
            Le Sankey sera alimenté après validation d'un relevé Nickel.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">Transactions validées</h2>
              <p className="mt-1 text-sm text-gray-500">Dernier mois importé, hors transactions non validées.</p>
            </div>
            {hasBudgetData ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Libellé</TableHeader>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>Catégorie</TableHeader>
                      <TableHeader align="right">Montant</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {budget.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-500">{formatDate(transaction.date)}</td>
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{transaction.label}</td>
                        <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-600">
                          {TYPE_LABELS[transaction.type] ?? transaction.type}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-500">
                          {transaction.categoryName ?? 'À catégoriser'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(transaction.amountCents / 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">Aucune transaction validée pour le moment.</div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Dépenses par catégorie</h2>
            <div className="mt-4 space-y-3">
              {expenseGroups.length > 0 ? (
                expenseGroups.map(([categoryName, amountCents]) => (
                  <div key={categoryName} className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-gray-600">{categoryName}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(amountCents / 100)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Aucune dépense catégorisée.</p>
              )}
            </div>
          </section>
        </aside>
      </div>

      {isImportOpen ? (
        <ImportModal
          categories={budget.categories}
          importResult={importResult}
          isPending={isPending}
          reviewRows={reviewRows}
          uploadError={uploadError}
          validationError={validationError}
          onClose={() => {
            setIsImportOpen(false);
            setImportResult(null);
            setReviewRows([]);
            setUploadError(null);
            setValidationError(null);
          }}
          onUpload={handleUpload}
          onValidate={handleValidate}
          onUpdateRow={updateReviewRow}
        />
      ) : null}
    </div>
  );
}

function ImportModal({
  categories,
  importResult,
  isPending,
  reviewRows,
  uploadError,
  validationError,
  onClose,
  onUpload,
  onValidate,
  onUpdateRow,
}: {
  categories: BudgetViewModel['categories'];
  importResult: ImportNickelPdfResult | null;
  isPending: boolean;
  reviewRows: ReviewRowState[];
  uploadError: string | null;
  validationError: string | null;
  onClose: () => void;
  onUpload: (formData: FormData) => void;
  onValidate: () => void;
  onUpdateRow: (id: string, patch: Partial<ReviewRowState>) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4 py-6">
      <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Import Nickel</h2>
            <p className="text-sm text-gray-500">Relevé mensuel PDF, extraction locale via pdftotext.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {!importResult?.ok ? (
            <form action={onUpload} className="space-y-4">
              <div className="rounded-lg border border-dashed border-gray-300 bg-slate-50 p-6">
                <label htmlFor="nickel-file" className="block text-sm font-medium text-gray-700">
                  Relevé Nickel PDF
                </label>
                <input
                  id="nickel-file"
                  name="file"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="mt-3 block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-500"
                  required
                />
                <p className="mt-3 text-sm text-gray-500">
                  Le PDF original n'est pas stocké. Seuls le hash du fichier et les lignes extraites sont conservés.
                </p>
              </div>

              {uploadError ? <Alert tone="error">{uploadError}</Alert> : null}

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
              >
                {isPending ? 'Extraction...' : 'Extraire le relevé'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <ImportStat label="Fichier" value={importResult.originalFileName} />
                <ImportStat label="Opérations détectées" value={importResult.parsedCount.toString()} />
                <ImportStat label="À valider" value={importResult.pendingCount.toString()} />
                <ImportStat label="Doublons" value={importResult.duplicateCount.toString()} />
              </div>

              {importResult.pendingCount === 0 ? (
                <Alert tone="info">Aucune nouvelle opération à valider dans ce fichier.</Alert>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <TableHeader>Date</TableHeader>
                          <TableHeader>Libellé</TableHeader>
                          <TableHeader>Type</TableHeader>
                          <TableHeader>Catégorie</TableHeader>
                          <TableHeader align="right">Montant</TableHeader>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {reviewRows.map((row) => (
                          <tr key={row.id}>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{formatDate(row.date)}</td>
                            <td className="min-w-[280px] px-4 py-3">
                              <input
                                value={row.label}
                                onChange={(event) => onUpdateRow(row.id, { label: event.target.value })}
                                className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                              />
                              <p className="mt-1 truncate text-xs text-gray-400">{row.rawLabel}</p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <select
                                value={row.type}
                                onChange={(event) =>
                                  onUpdateRow(row.id, { type: event.target.value as ReviewRowState['type'], categoryId: '' })
                                }
                                className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                              >
                                <option value="expense">Dépense</option>
                                <option value="income">Revenu</option>
                                <option value="transfer">Transfert</option>
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <select
                                value={row.categoryId}
                                onChange={(event) => onUpdateRow(row.id, { categoryId: event.target.value })}
                                className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                              >
                                <option value="">À catégoriser</option>
                                {categories
                                  .filter((category) => category.type.toLowerCase() === row.type)
                                  .map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(row.amountCents / 100)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {validationError ? <Alert tone="error">{validationError}</Alert> : null}

                  <button
                    type="button"
                    onClick={onValidate}
                    disabled={isPending}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4" />
                    {isPending ? 'Validation...' : 'Valider les opérations'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: 'income' | 'expense' | 'neutral' }) {
  const valueClass =
    tone === 'income' ? 'text-emerald-600' : tone === 'expense' ? 'text-rose-600' : 'text-gray-900';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function ImportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Alert({ children, tone }: { children: ReactNode; tone: 'error' | 'info' }) {
  const className =
    tone === 'error'
      ? 'rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700'
      : 'rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700';

  return <p className={className}>{children}</p>;
}

function TableHeader({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${dateKey}T00:00:00.000Z`));
}
