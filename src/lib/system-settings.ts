import i18n from '@/lib/i18n';
import { getDefaultSystemSettings, useSystemSettingsStore } from '@/stores/system-settings-store';

function getSettings() {
  return useSystemSettingsStore.getState().settings ?? getDefaultSystemSettings();
}

function getActiveLanguage(): string {
  return (i18n.resolvedLanguage || i18n.language || 'tr').split('-')[0].toLowerCase();
}

function getActiveLocale(): string {
  return i18n.resolvedLanguage || i18n.language || 'tr';
}

export function getSystemLocale(): string {
  const settings = getSettings();
  return settings.numberFormat || (getActiveLanguage() === 'tr' ? 'tr-TR' : getActiveLocale());
}

export function getSystemTimeZone(): string {
  return getSettings().timeZoneId || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function getSystemCurrency(): string {
  return getSettings().defaultCurrencyCode || 'TRY';
}

export function getSystemDecimalPlaces(): number {
  const value = getSettings().amountDecimalPlaces ?? getSettings().decimalPlaces;
  return Number.isFinite(value) ? value : 2;
}

export function getSystemPriceDecimalPlaces(): number { return getPrecision('priceDecimalPlaces', 4); }
export function getSystemQuantityDecimalPlaces(): number { return getPrecision('quantityDecimalPlaces', 3); }
export function getSystemExchangeRateDecimalPlaces(): number { return getPrecision('exchangeRateDecimalPlaces', 6); }
export function getSystemPercentageDecimalPlaces(): number { return getPrecision('percentageDecimalPlaces', 2); }
export function getSystemCostDecimalPlaces(): number { return getPrecision('costDecimalPlaces', 6); }

function getPrecision(key: 'priceDecimalPlaces'|'quantityDecimalPlaces'|'exchangeRateDecimalPlaces'|'percentageDecimalPlaces'|'costDecimalPlaces', fallback: number): number {
  const value = getSettings()[key];
  return Number.isFinite(value) ? Number(value) : fallback;
}

function clampFractionDigits(places: number): number {
  if (!Number.isFinite(places)) return 2;
  return Math.min(8, Math.max(0, Math.round(places)));
}

function roundToFractionDigits(value: number, fractionDigits: number): number {
  const p = clampFractionDigits(fractionDigits);
  if (!Number.isFinite(value)) return NaN;
  if (p === 0) return Math.round(value);
  const m = 10 ** p;
  return Math.round(value * m) / m;
}

/**
 * Controlled `<input type="number">` value: always `.` as decimal separator, fixed fractional digits.
 * Uses Sistem Ayarları `decimalPlaces` unless `fractionDigits` is passed.
 */
export function formatHtmlNumberInputDraft(
  value: number | null | undefined,
  options?: { fractionDigits?: number }
): string {
  if (value == null || typeof value !== 'number' || !Number.isFinite(value)) return '';
  const digits = options?.fractionDigits ?? getSystemDecimalPlaces();
  const p = clampFractionDigits(digits);
  const rounded = roundToFractionDigits(value, p);
  if (p === 0) return String(rounded);
  return rounded.toFixed(p);
}

/** `step` for `<input type="number">` aligned with fractional digit precision (e.g. 4 → 0.0001). */
export function getHtmlNumberInputStepForDecimals(fractionDigits?: number): string {
  const p = clampFractionDigits(fractionDigits ?? getSystemDecimalPlaces());
  if (p <= 0) return '1';
  const step = 1 / 10 ** p;
  return step.toFixed(p);
}

/** Line table quick-edit draft: quantity, unit price & discount rates use system decimals. */
export function formatLineTableQuickEditDraft(
  field: string,
  value: number | null | undefined,
  _options?: { unit?: string | null }
): string {
  if (value == null || typeof value !== 'number' || !Number.isFinite(value)) return '';

  if (field === 'quantity') {
    return formatHtmlNumberInputDraft(value, { fractionDigits: getSystemQuantityDecimalPlaces() });
  }

  if (field === 'unitPrice') {
    return formatHtmlNumberInputDraft(value, { fractionDigits: getSystemPriceDecimalPlaces() });
  }

  if (field === 'discountRate1' || field === 'discountRate2' || field === 'discountRate3') {
    return formatHtmlNumberInputDraft(value, { fractionDigits: getSystemPercentageDecimalPlaces() });
  }

  return formatHtmlNumberInputDraft(value);
}

export async function applySystemLanguageIfNeeded(): Promise<void> {
  return Promise.resolve();
}

function fallbackFormat(value: number, currencyCode?: string): string {
  const precision = getSystemDecimalPlaces();
  const settings = getSettings();
  const formatted = new Intl.NumberFormat(getSystemLocale(), {
    style: 'decimal',
    minimumFractionDigits: settings.trimTrailingZeros ? 0 : precision,
    maximumFractionDigits: precision,
    useGrouping: settings.useThousandsSeparator,
  }).format(value);
  return currencyCode ? `${formatted} ${currencyCode}` : formatted;
}

export function formatSystemNumber(
  value: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const precision = getSystemDecimalPlaces();
  const settings = getSettings();
  return new Intl.NumberFormat(getSystemLocale(), {
    style: 'decimal',
    minimumFractionDigits: options?.minimumFractionDigits ?? (settings.trimTrailingZeros ? 0 : precision),
    maximumFractionDigits: options?.maximumFractionDigits ?? precision,
    useGrouping: settings.useThousandsSeparator,
  }).format(value);
}

function formatWithPrecision(value: number, precision: number): string {
  const settings = getSettings();
  return new Intl.NumberFormat(getSystemLocale(), {
    style: 'decimal',
    minimumFractionDigits: settings.trimTrailingZeros ? 0 : precision,
    maximumFractionDigits: precision,
    useGrouping: settings.useThousandsSeparator,
  }).format(value);
}

export function formatSystemAmount(value: number): string {
  return formatWithPrecision(value, getSystemDecimalPlaces());
}

export function formatSystemPrice(value: number): string {
  return formatWithPrecision(value, getSystemPriceDecimalPlaces());
}

export function formatSystemQuantity(value: number): string {
  return formatWithPrecision(value, getSystemQuantityDecimalPlaces());
}

export function formatSystemExchangeRate(value: number): string {
  return formatWithPrecision(value, getSystemExchangeRateDecimalPlaces());
}

export function formatSystemCost(value: number): string {
  return formatWithPrecision(value, getSystemCostDecimalPlaces());
}

export function formatSystemPercentage(value: number, appendSign = true): string {
  const formatted = formatWithPrecision(value, getSystemPercentageDecimalPlaces());
  return appendSign ? `${formatted}%` : formatted;
}

/**
 * Converts a number entered with the configured separators into a canonical JS number.
 * API payloads therefore remain JSON numbers (for example 1250.10), independent of UI locale.
 */
export function parseSystemNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const locale = getSystemLocale();
  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const group = parts.find((part) => part.type === 'group')?.value;
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const minus = parts.find((part) => part.type === 'minusSign')?.value ?? '-';
  const localeDigits = new Intl.NumberFormat(locale, { useGrouping: false })
    .format(9876543210)
    .split('')
    .reverse();
  const digitMap = new Map(localeDigits.map((digit, index) => [digit, String(index)]));

  let normalized = value.trim();
  for (const [digit, ascii] of digitMap) normalized = normalized.split(digit).join(ascii);
  normalized = normalized.replace(/[\s\u00a0\u202f]/g, '');
  if (group) normalized = normalized.split(group).join('');
  normalized = normalized.split(decimal).join('.').split(minus).join('-');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatSystemCurrency(value: number, currencyCode?: string): string {
  const currency = currencyCode || getSystemCurrency();
  const precision = getSystemDecimalPlaces();
  const settings = getSettings();

  try {
    const number = new Intl.NumberFormat(getSystemLocale(), {
      style: 'decimal',
      minimumFractionDigits: settings.trimTrailingZeros ? 0 : precision,
      maximumFractionDigits: precision,
      useGrouping: settings.useThousandsSeparator,
    }).format(value);
    if (settings.currencyDisplay === 0) return number;
    const marker = settings.currencyDisplay === 2
      ? currency
      : (currency === settings.defaultCurrencyCode && settings.defaultCurrencySymbol
          ? settings.defaultCurrencySymbol
          : (new Intl.NumberFormat(getSystemLocale(), { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
              .formatToParts(0).find(part => part.type === 'currency')?.value || currency));
    return settings.currencySymbolOnRight ? `${number} ${marker}` : `${marker} ${number}`;
  } catch {
    return fallbackFormat(value, currency);
  }
}

function parseDateValue(value: string | Date | number): Date | null {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateValue(
  value: string | Date | number,
  options: Intl.DateTimeFormatOptions
): string {
  const parsed = parseDateValue(value);
  if (!parsed) return '-';

  return new Intl.DateTimeFormat(getActiveLocale(), {
    timeZone: getSystemTimeZone(),
    ...options,
  }).format(parsed);
}

export function formatSystemDate(value: string | Date | number): string {
  // SQL Date/date-only values arrive as ISO yyyy-MM-dd. Keep the calendar day intact;
  // applying a time zone to a date without a time can otherwise move it to the previous day.
  if (typeof value === 'string') {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (dateOnly) {
      return (getSettings().dateFormat || 'dd.MM.yyyy')
        .replace('yyyy', dateOnly[1])
        .replace('MM', dateOnly[2])
        .replace('dd', dateOnly[3]);
    }
  }
  const parsed = parseDateValue(value);
  if (!parsed) return '-';
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: getSystemTimeZone(), year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(parsed);
  const part = (type: string) => parts.find(x => x.type === type)?.value ?? '';
  return (getSettings().dateFormat || 'dd.MM.yyyy').replace('yyyy', part('year')).replace('MM', part('month')).replace('dd', part('day'));
}

export function formatSystemDateTime(value: string | Date | number): string {
  return `${formatSystemDate(value)} ${formatDateValue(value, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: getSettings().timeFormat === 12,
  })}`;
}

export function formatSystemTime(value: string | Date | number): string {
  return formatDateValue(value, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: getSettings().timeFormat === 12,
  });
}

export function getSystemDatePickerLocale(): string {
  return new Intl.DateTimeFormat(getActiveLocale(), {
    timeZone: getSystemTimeZone(),
  }).resolvedOptions().locale;
}
