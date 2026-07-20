import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

export interface ExchangeRateItem {
  currencyCode: string;
  unit: number;
  forexBuying: number;
  forexSelling: number | null;
  banknoteBuying: number | null;
  banknoteSelling: number | null;
  instrumentType: 'Currency' | 'PreciousMetal';
  displayName: string | null;
  instrumentRateDate: string | null;
}

export interface ExchangeRateSnapshot {
  source: string;
  rateDate: string;
  retrievedAtUtc: string;
  isStale: boolean;
  rates: ExchangeRateItem[];
}

export const EXCHANGE_RATE_QUERY_KEY = ['exchange-rates', 'latest'] as const;

export async function getLatestExchangeRates(forceRefresh = false): Promise<ExchangeRateSnapshot> {
  const response = await api.get<ApiResponse<ExchangeRateSnapshot>>('/api/exchange-rates/latest', {
    params: forceRefresh ? { forceRefresh: true } : undefined,
  });
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Exchange rates could not be loaded.');
  }
  return response.data;
}

export function resolveDocumentExchangeRate(
  snapshot: ExchangeRateSnapshot | undefined,
  currencyCode: string | undefined,
  baseCurrencyCode: string,
  side: 'buying' | 'selling' = 'selling',
): number | null {
  const normalizedCurrency = currencyCode?.trim().toUpperCase();
  const normalizedBase = baseCurrencyCode.trim().toUpperCase();
  if (!normalizedCurrency) return null;
  if (normalizedCurrency === normalizedBase) return 1;

  const item = snapshot?.rates.find((rate) => rate.currencyCode.toUpperCase() === normalizedCurrency);
  if (!item || item.unit <= 0) return null;
  const quotedRate = side === 'buying' ? item.forexBuying : (item.forexSelling ?? item.forexBuying);
  return quotedRate > 0 ? quotedRate / item.unit : null;
}
