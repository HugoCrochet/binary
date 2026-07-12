import type { ParsedStatement, ParsedTransaction, ParsedTransactionType } from './types';

const OPERATION_LINE_REGEX =
  /^\s*(\d+)\s+(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?\d[\d\s]*,\d{2})\s*€\s*$/;

export function parseNickelPdfText(text: string): ParsedStatement {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const transactions: ParsedTransaction[] = [];
  let current: DraftNickelTransaction | null = null;

  for (const line of lines) {
    const operationMatch = line.match(OPERATION_LINE_REGEX);

    if (operationMatch) {
      if (current) {
        transactions.push(toParsedTransaction(current));
      }
      current = createDraft(operationMatch[2], operationMatch[3], operationMatch[4], line);
      continue;
    }

    if (!current) {
      continue;
    }

    const continuation = extractContinuationLabel(line);
    if (continuation) {
      current.labelParts.push(continuation);
      current.rawLines.push(line);
    }
  }

  if (current) {
    transactions.push(toParsedTransaction(current));
  }

  const period = detectPeriod(text, transactions);

  return {
    source: 'nickel_pdf',
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    transactions,
  };
}

export function normalizeTransactionLabel(label: string) {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

type DraftNickelTransaction = {
  date: Date;
  dateKey: string;
  labelParts: string[];
  amountCents: number;
  rawAmount: string;
  rawLines: string[];
};

function createDraft(rawDate: string, middleColumns: string, rawAmount: string, rawLine: string): DraftNickelTransaction {
  const date = parseFrenchDate(rawDate);
  const labelParts = extractInitialLabelParts(middleColumns);

  return {
    date,
    dateKey: toDateKey(date),
    labelParts,
    amountCents: parseEuroAmountToCents(rawAmount),
    rawAmount,
    rawLines: [rawLine],
  };
}

function toParsedTransaction(draft: DraftNickelTransaction): ParsedTransaction {
  const rawLabel = draft.labelParts.join(' ').trim().replace(/\s+/g, ' ');
  const normalizedLabel = normalizeTransactionLabel(rawLabel || 'OPERATION NICKEL');

  return {
    source: 'nickel_pdf',
    date: draft.date,
    dateKey: draft.dateKey,
    rawLabel: rawLabel || 'Opération Nickel',
    normalizedLabel,
    amountCents: draft.amountCents,
    rawAmount: draft.rawAmount,
    currency: 'EUR',
    type: inferTransactionType(draft.amountCents),
    rawPayload: draft.rawLines.join('\n'),
  };
}

function extractInitialLabelParts(middleColumns: string) {
  const parts = middleColumns
    .trim()
    .split(/\s{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return parts;
  }

  return parts.slice(1);
}

function extractContinuationLabel(line: string) {
  if (!line.trim()) {
    return '';
  }

  const firstTextColumn = line.search(/\S/);
  if (firstTextColumn < 35) {
    return '';
  }

  const trimmed = line.trim().replace(/\s+/g, ' ');
  const normalized = normalizeTransactionLabel(trimmed);

  if (
    normalized.includes('RELEVE DE COMPTE') ||
    normalized.startsWith('N RELEVE') ||
    /^\d+\s*\/\s*\d+$/.test(trimmed)
  ) {
    return '';
  }

  return trimmed;
}

function detectPeriod(text: string, transactions: ParsedTransaction[]) {
  const explicitPeriod = text.match(/du\s+(\d{2}\/\d{2}\/\d{4})\s+au\s+(\d{2}\/\d{2}\/\d{4})/i);

  if (explicitPeriod) {
    return {
      periodStart: parseFrenchDate(explicitPeriod[1]),
      periodEnd: parseFrenchDate(explicitPeriod[2]),
    };
  }

  if (transactions.length === 0) {
    return {
      periodStart: null,
      periodEnd: null,
    };
  }

  const timestamps = transactions.map((transaction) => transaction.date.getTime());

  return {
    periodStart: new Date(Math.min(...timestamps)),
    periodEnd: new Date(Math.max(...timestamps)),
  };
}

function parseFrenchDate(value: string) {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseEuroAmountToCents(rawAmount: string) {
  const normalized = rawAmount.replace(/\s/g, '').replace(',', '.');
  return Math.round(Number(normalized) * 100);
}

function inferTransactionType(amountCents: number): ParsedTransactionType {
  return amountCents >= 0 ? 'income' : 'expense';
}
