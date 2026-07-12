export type ParsedTransactionType = 'expense' | 'income' | 'transfer';

export type ParsedTransactionSource = 'nickel_pdf';

export interface ParsedTransaction {
  source: ParsedTransactionSource;
  date: Date;
  dateKey: string;
  rawLabel: string;
  normalizedLabel: string;
  amountCents: number;
  rawAmount: string;
  currency: 'EUR';
  type: ParsedTransactionType;
  rawPayload: string;
}

export interface ParsedStatement {
  source: ParsedTransactionSource;
  periodStart: Date | null;
  periodEnd: Date | null;
  transactions: ParsedTransaction[];
}
