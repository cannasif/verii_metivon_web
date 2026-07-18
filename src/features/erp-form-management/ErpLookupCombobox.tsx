import { useMemo, useState } from "react";
import { VoiceSearchCombobox } from "@/components/shared/VoiceSearchCombobox";
import { DROPDOWN_MIN_CHARS, DROPDOWN_PAGE_SIZE } from "@/components/shared/dropdown/constants";
import { useDropdownInfiniteSearch } from "@/hooks/useDropdownInfiniteSearch";
import { api } from "@/lib/axios";
import type { PagedResponse } from "@/types/api";
import type { LookupItem } from "./types";

type LookupEnvelope = { data: { items: LookupItem[]; pageNumber: number; pageSize: number; totalCount: number; totalPages: number; hasPreviousPage: boolean; hasNextPage: boolean } };
type BasicLookupItem = { id: number; code: string; name: string };

export function ErpLookupCombobox({ lookupKey, value, parentId, fallbackOptions, placeholder, searchPlaceholder, disabled, required, invalid, staticOnly, onChange }: {
  lookupKey: string; value: string; parentId?: number; fallbackOptions: BasicLookupItem[]; placeholder: string; searchPlaceholder: string;
  disabled?: boolean; required?: boolean; invalid?: boolean; staticOnly?: boolean; onChange: (value: number | "") => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const result = useDropdownInfiniteSearch<LookupItem>({
    entityKey: ["erp-lookup", lookupKey], searchTerm, enabled: !disabled && !staticOnly,
    minChars: DROPDOWN_MIN_CHARS, pageSize: DROPDOWN_PAGE_SIZE, extraQueryKey: [parentId ?? null], buildFilters: () => undefined,
    fetchPage: async ({ pageNumber, pageSize, search, signal }) => {
      const response = await api.get<LookupEnvelope>(`/api/erp-lookups/${encodeURIComponent(lookupKey)}`, { params: { pageNumber, pageSize, search, parentId }, signal });
      const page = response.data;
      return { data: page.items, pageNumber: page.pageNumber, pageSize: page.pageSize, totalCount: page.totalCount, totalPages: page.totalPages, hasPreviousPage: page.hasPreviousPage, hasNextPage: page.hasNextPage } satisfies PagedResponse<LookupItem>;
    },
  });
  const options = useMemo(() => {
    const selected = fallbackOptions.find((item) => String(item.id) === value);
    const source = staticOnly ? fallbackOptions : result.items;
    const items = selected ? [selected, ...source.filter((item) => item.id !== selected.id)] : source;
    return items.map((item) => ({ value: String(item.id), label: `${item.code} · ${item.name}` }));
  }, [fallbackOptions, result.items, staticOnly, value]);

  return <VoiceSearchCombobox aria-required={required} aria-invalid={invalid} options={options} value={value || null} onSelect={(next) => onChange(next ? Number(next) : "")}
    onDebouncedSearchChange={setSearchTerm} onFetchNextPage={() => void result.fetchNextPage()} hasNextPage={result.hasNextPage}
    isLoading={result.isLoading || result.isFetching} isFetchingNextPage={result.isFetchingNextPage} minChars={DROPDOWN_MIN_CHARS}
    placeholder={placeholder} searchPlaceholder={searchPlaceholder} disabled={disabled} disableToggleOff={required} modal />;
}
