import { formatSystemDateTime, formatSystemQuantity } from '@/lib/system-settings';

export function formatWarehouseBalance(value: number): string {
  return formatSystemQuantity(value);
}

export function formatWarehouseBalanceWithUnit(value: number, unit?: string | null): string {
  const formatted = formatWarehouseBalance(value);
  const normalizedUnit = unit?.trim();
  if (!normalizedUnit) {
    return formatted;
  }
  return `${formatted} ${normalizedUnit}`;
}

export function formatWarehouseSyncDate(value: string | null | undefined, _locale: string): string {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return formatSystemDateTime(parsed);
}
