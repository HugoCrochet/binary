// ============================================
// Date utilities
// ============================================
import { format, parse, differenceInDays, differenceInMonths } from 'date-fns';

/**
 * Format date to ISO string
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Format date for display (French locale)
 */
export function formatFrenchDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Get date range for last N months
 */
export function getLastNMonths(n: number = 12): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - n);
  return { start, end };
}

/**
 * Get first day of month
 */
export function getFirstDayOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get last day of month
 */
export function getLastDayOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Get days in month
 */
export function getDaysInMonth(date: Date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Calculate month difference
 */
export function getMonthDifference(start: Date, end: Date): number {
  return differenceInMonths(end, start);
}

/**
 * Calculate day difference
 */
export function getDayDifference(start: Date, end: Date): number {
  return differenceInDays(end, start);
}

/**
 * Get month name in French
 */
export function getFrenchMonthName(month: number): string {
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  return months[month] || '';
}
