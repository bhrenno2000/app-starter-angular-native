import { expect, it } from 'vitest';
import { formatCurrencyParts, formatDateDisplay, formatLongDate } from './formatters';

it('formats date names in English', () => {
  expect(formatDateDisplay('2026-09-30T14:05:00Z')).toEqual({
    day: '30',
    weekday: 'Wednesday',
    month: 'September',
    year: 2026,
  });
  expect(formatLongDate('2026-09-30T14:05:00Z')).toBe('Wednesday, September 30, 2026 · 14:05');
});

it('splits English currency formatting without losing grouping or negative signs', () => {
  expect(formatCurrencyParts(-1234.56)).toEqual({
    symbol: 'R$',
    integerPart: '-1,234',
    decimalPart: '.56',
  });
});
