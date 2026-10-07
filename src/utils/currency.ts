import { Currency } from '../types/planner';

export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'GBP':
      return '£';
    case 'EUR':
      return '€';
    case 'USD':
    default:
      return '$';
  }
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
