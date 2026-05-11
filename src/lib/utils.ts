// ============================================
// Utility functions
// ============================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'EUR', minimumFractionDigits = 2) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits,
  }).format(amount);
}

export function formatPercentage(value: number, minimumFractionDigits = 1) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits,
  }).format(value / 100);
}

export function calculateTrend(values: number[]): 'up' | 'down' | 'neutral' {
  if (values.length < 2) return 'neutral';
  const last = values[values.length - 1];
  const previous = values[values.length - 2];
  if (last > previous) return 'up';
  if (last < previous) return 'down';
  return 'neutral';
}

export function calculateChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
