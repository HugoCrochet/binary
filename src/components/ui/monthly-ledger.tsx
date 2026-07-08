'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  account: string;
}

interface MonthlyLedgerProps {
  transactions: Transaction[];
  title?: string;
}

export function MonthlyLedger({ transactions, title = 'Ledger mensuel' }: MonthlyLedgerProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-2 rounded-full bg-gray-100 p-3">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Aucune transaction pour ce mois</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatMonthYear = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
          <span className="text-xs text-gray-400">{formatMonthYear(transactions[0].date)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {tx.type === 'INCOME' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.merchant}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Badge variant="outline" className="h-5 px-1.5">
                      {tx.category}
                    </Badge>
                    <span>{new Date(tx.date).getDate()} {new Date(tx.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {tx.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </p>
                <p className="text-xs text-gray-400">{tx.account}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
