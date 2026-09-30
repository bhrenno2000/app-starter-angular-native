export function getDocumentTypeLabel(document: string | null | undefined): string {
  if (!document) return '-';
  const cleaned = document.replace(/[^\d*]/g, '');
  if (cleaned.length === 11) return 'Individual taxpayer ID (CPF)';
  if (cleaned.length === 14) return 'Business taxpayer ID (CNPJ)';
  return '-';
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const maskedLocal =
    localPart.length > 2
      ? `${localPart[0]}***${localPart[localPart.length - 1]}`
      : `${localPart[0]}***`;

  const [domainName, domainExt] = domain.split('.');
  const maskedDomain = domainName.length > 1 ? `***${domainName[domainName.length - 1]}` : '***';

  return `${maskedLocal}@${maskedDomain}.${domainExt}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type CurrencyCode = 'BRL' | 'USDT' | 'USDC';

export function getCurrencySymbol(currency: CurrencyCode): string {
  const symbols: Record<CurrencyCode, string> = {
    BRL: 'R$',
    USDT: 'USDT',
    USDC: 'USDC',
  };
  return symbols[currency] ?? 'R$';
}

export function formatAmount(amount: number, currency: CurrencyCode = 'BRL'): string {
  const locale = 'en-US';
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatCurrentTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrentDate(): string {
  return new Date().toLocaleDateString('en-US');
}

export function formatLocalTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatLocalDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US');
}

export function formatValidityDuration(fromIso: string, toIso: string): string {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (Number.isNaN(from) || Number.isNaN(to) || to <= from) return '';

  const totalMinutes = Math.floor((to - from) / 60_000);
  if (totalMinutes < 60) {
    return `${totalMinutes}min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, '0')}`;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatDateDisplay(isoDate: string): {
  day: string;
  weekday: string;
  month: string;
  year: number;
} {
  const date = new Date(isoDate);
  return {
    day: date.getUTCDate().toString().padStart(2, '0'),
    weekday: WEEKDAYS[date.getUTCDay()],
    month: MONTHS[date.getUTCMonth()],
    year: date.getUTCFullYear(),
  };
}

export function parseCentsFromInput(text: string): number {
  const cleanedText = text.replace(/[^0-9]/g, '');
  return Number.parseInt(cleanedText || '0', 10);
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatLongDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '-';
  const { day, weekday, month, year } = formatDateDisplay(isoDate);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${weekday}, ${month} ${day}, ${year} · ${hours}:${minutes}`;
}

export function formatCurrencyParts(value: number): {
  symbol: string;
  integerPart: string;
  decimalPart: string;
} {
  const parts = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(value);

  return {
    symbol: parts.find((part) => part.type === 'currency')?.value ?? 'R$',
    integerPart: parts
      .filter((part) => ['minusSign', 'integer', 'group'].includes(part.type))
      .map((part) => part.value)
      .join(''),
    decimalPart: `${parts.find((part) => part.type === 'decimal')?.value ?? '.'}${parts.find((part) => part.type === 'fraction')?.value ?? '00'}`,
  };
}
