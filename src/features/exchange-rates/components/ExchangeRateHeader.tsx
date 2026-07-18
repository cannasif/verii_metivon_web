import { useMemo, useState, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircleDollarSign, RefreshCw, Search, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import { formatSystemDate, formatSystemDateTime, formatSystemExchangeRate } from "@/lib/system-settings";
import type { ApiResponse } from "@/types/api";

interface ExchangeRateItem {
  currencyCode: string;
  unit: number;
  forexBuying: number;
  forexSelling: number | null;
  banknoteBuying: number | null;
  banknoteSelling: number | null;
  instrumentType: "Currency" | "PreciousMetal";
  displayName: string | null;
  instrumentRateDate: string | null;
}

interface ExchangeRateSnapshot {
  source: string;
  rateDate: string;
  retrievedAtUtc: string;
  isStale: boolean;
  rates: ExchangeRateItem[];
}

const HEADER_CURRENCIES = ["USD", "EUR", "GBP"] as const;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

async function getLatestExchangeRates(): Promise<ExchangeRateSnapshot> {
  const response = await api.get<ApiResponse<ExchangeRateSnapshot>>("/api/exchange-rates/latest");
  if (!response.success || !response.data) {
    throw new Error(response.message || "Exchange rates could not be loaded.");
  }
  return response.data;
}

export function ExchangeRateHeader(): ReactElement {
  const { t, i18n } = useTranslation(["exchange-rates", "common"]);
  const [search, setSearch] = useState("");
  const localizedCurrencyNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([i18n.resolvedLanguage ?? i18n.language], { type: "currency" });
    } catch {
      return null;
    }
  }, [i18n.language, i18n.resolvedLanguage]);
  const query = useQuery({
    queryKey: ["exchange-rates", "latest"],
    queryFn: getLatestExchangeRates,
    staleTime: 10 * 60 * 1000,
    refetchInterval: FIFTEEN_MINUTES,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const visibleRates = useMemo(() => {
    const values = query.data?.rates ?? [];
    return HEADER_CURRENCIES.flatMap((code) => {
      const rate = values.find((item) => item.currencyCode === code);
      return rate ? [rate] : [];
    });
  }, [query.data]);

  const allRates = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return [...(query.data?.rates ?? [])]
      .map((rate) => {
        const localizedName = localizedCurrencyNames?.of(rate.currencyCode);
        return { ...rate, localizedName: localizedName && localizedName !== rate.currencyCode ? localizedName : null };
      })
      .filter((rate) => !normalizedSearch || `${rate.currencyCode} ${rate.localizedName ?? ""}`.toLocaleLowerCase().includes(normalizedSearch))
      .sort((left, right) => {
        if (left.instrumentType !== right.instrumentType) return left.instrumentType === "PreciousMetal" ? -1 : 1;
        return left.currencyCode.localeCompare(right.currencyCode);
      });
  }, [localizedCurrencyNames, query.data, search]);

  const unavailable = query.isError && !query.data;
  const stale = query.data?.isStale === true;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="metivon-panel flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border px-2 text-start shadow-sm transition hover:border-[var(--crm-brand-ring)] hover:bg-[var(--crm-brand-soft)] sm:px-3"
          aria-label={t("title")}
          title={t("title")}
        >
          {unavailable ? (
            <TriangleAlert className="h-4 w-4 shrink-0 text-rose-500" />
          ) : (
            <CircleDollarSign className={`h-4 w-4 shrink-0 ${stale ? "text-amber-500" : "text-emerald-500"}`} />
          )}
          <span className="hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:inline xl:hidden">
            TCMB
          </span>
          <span className="hidden items-center gap-2 xl:flex">
            {visibleRates.map((rate) => (
              <span key={rate.currencyCode} className="whitespace-nowrap text-[11px]">
                <strong>{rate.currencyCode}</strong>{" "}
                <span className="text-muted-foreground">{formatSystemExchangeRate(rate.forexSelling ?? rate.forexBuying)}</span>
              </span>
            ))}
            {query.isLoading ? <span className="h-2 w-16 animate-pulse rounded bg-muted" /> : null}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(30rem,calc(100vw-1rem))] rounded-2xl p-0">
        <div className="flex items-start justify-between gap-3 border-b p-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <CircleDollarSign className="h-4 w-4 text-emerald-500" />
              {t("title")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition hover:bg-muted disabled:opacity-50"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            aria-label={t("refresh")}
            title={t("refresh")}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {!unavailable ? (
          <div className="border-b p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 ps-9"
                placeholder={t("currency")}
                aria-label={t("currency")}
              />
            </div>
          </div>
        ) : null}

        {unavailable ? (
          <div className="flex items-start gap-3 p-4 text-sm text-rose-600 dark:text-rose-300">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div><strong>{t("unavailable")}</strong><p className="mt-1 text-xs opacity-80">{t("unavailableDescription")}</p></div>
          </div>
        ) : (
          <>
            <div className="grid max-h-[min(28rem,60vh)] grid-cols-[minmax(0,1fr)_auto_auto] gap-x-4 gap-y-3 overflow-y-auto p-4 text-sm">
              <span className="text-xs font-medium text-muted-foreground">{t("currency")}</span>
              <span className="text-end text-xs font-medium text-muted-foreground">{t("buying")}</span>
              <span className="text-end text-xs font-medium text-muted-foreground">{t("selling")}</span>
              {allRates.map((rate) => (
                <div key={rate.currencyCode} className="contents">
                  <span className="min-w-0">
                    <span className="font-semibold">{rate.unit > 1 ? `${rate.unit} ` : ""}{rate.currencyCode}</span>
                    {rate.localizedName ? <span className="ms-2 truncate text-xs text-muted-foreground">{rate.localizedName}</span> : null}
                  </span>
                  <span className="text-end tabular-nums">{formatSystemExchangeRate(rate.forexBuying)}</span>
                  <span className="text-end font-semibold tabular-nums">{rate.forexSelling === null ? "—" : formatSystemExchangeRate(rate.forexSelling)}</span>
                </div>
              ))}
              {query.isLoading ? <div className="col-span-3 h-16 animate-pulse rounded-xl bg-muted" /> : null}
            </div>
            {query.data ? (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/35 px-4 py-3 text-[11px] text-muted-foreground">
                <span>{t("source")}: {query.data.source}</span>
                <span>{t("rateDate")}: {formatSystemDate(query.data.rateDate)}</span>
                <span>{t("common:common.updated")}: {formatSystemDateTime(query.data.retrievedAtUtc)}</span>
                {stale ? <span className="font-semibold text-amber-600 dark:text-amber-300">{t("stale")}</span> : null}
              </div>
            ) : null}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
