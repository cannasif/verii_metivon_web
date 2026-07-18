import { useEffect, useMemo, useState, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { DataTableGrid, type DataTableGridColumn } from "@/components/shared";
import {
  loadColumnPreferences,
  saveColumnPreferences,
} from "@/lib/column-preferences";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiEnvelope, ErpPageConfig, PagedResult } from "./types";
import {
  formatSystemAmount,
  formatSystemCurrency,
  formatSystemDate,
  formatSystemDateTime,
} from "@/lib/system-settings";
import { useSystemSettingsStore } from "@/stores/system-settings-store";
import { getBusinessFieldLabel } from "@/lib/erp-field-label";
import {
  rowsToBackendFilters,
  type FilterColumnConfig,
  type FilterRow,
} from "@/lib/advanced-filter-types";
type Row = Record<string, unknown> & { id: number };
export function ErpPagedManagementPage({
  config,
}: {
  config: ErpPageConfig;
}): ReactElement {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("erp");
  const userId = useAuthStore((s) => s.user?.id);
  const defaultPageSize = useSystemSettingsStore((s) => s.settings.defaultPageSize ?? 20);
  const keys = useMemo(
    () => config.columns.map((x) => x.key),
    [config.columns],
  );
  const pref = useMemo(
    () => loadColumnPreferences(config.pageKey, userId, keys),
    [config.pageKey, userId, keys],
  );
  const [visible, setVisible] = useState<string[]>(pref.visibleKeys);
  const [order, setOrder] = useState<string[]>(pref.order);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [search, setSearch] = useState("");
  const [draftFilterRows, setDraftFilterRows] = useState<FilterRow[]>([]);
  const [appliedFilterRows, setAppliedFilterRows] = useState<FilterRow[]>([]);
  const [filterLogic, setFilterLogic] = useState<"and" | "or">("and");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState(
    config.columns.find((x) => x.sortable !== false && x.key !== "id")?.key ??
      "id",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  useEffect(() => {
    setPageSize(defaultPageSize);
    setPageNumber(1);
  }, [defaultPageSize]);
  const appliedFilters = useMemo(
    () => rowsToBackendFilters(appliedFilterRows),
    [appliedFilterRows],
  );
  const query = useQuery({
    queryKey: [
      config.pageKey,
      pageNumber,
      pageSize,
      search,
      sortBy,
      sortDirection,
      JSON.stringify(appliedFilters),
      filterLogic,
    ],
    queryFn: () =>
      api.get<ApiEnvelope<PagedResult<Row>>>(config.endpoint, {
        params: {
          pageNumber,
          pageSize,
          search,
          sortBy,
          sortDirection,
          filters: appliedFilters,
          filterLogic,
        },
      }),
    placeholderData: (p) => p,
  });
  const page = query.data?.data;
  const rows = page?.items ?? [];
  const columns = useMemo<DataTableGridColumn<string>[]>(
    () =>
      config.columns.map((x) => ({
        key: x.key,
        label: getBusinessFieldLabel(
          x.key,
          t(x.translationKey ?? `fields.${x.key}`, { defaultValue: x.label }),
          i18n.resolvedLanguage ?? i18n.language,
        ),
        defaultWidth: x.width ?? 150,
        sortable: x.sortable ?? true,
      })),
    [config.columns, i18n.language, i18n.resolvedLanguage, t],
  );
  const filterColumns = useMemo<FilterColumnConfig[]>(
    () =>
      config.columns.map((column) => ({
        value: column.key,
        labelKey: column.translationKey ?? `fields.${column.key}`,
        type:
          column.format === "boolean"
            ? "boolean"
            : column.format === "date" || column.format === "datetime"
              ? "date"
              : column.format === "money" ||
                  column.format === "number" ||
                  column.format === "id"
                ? "number"
                : "string",
      })),
    [config.columns],
  );
  const ordered = order.filter((k) => visible.includes(k) && keys.includes(k));
  const persistV = (v: string[]) => {
    setVisible(v);
    saveColumnPreferences(config.pageKey, userId, { visibleKeys: v, order });
  };
  const persistO = (o: string[]) => {
    setOrder(o);
    saveColumnPreferences(config.pageKey, userId, {
      visibleKeys: visible,
      order: o,
    });
  };
  const sort = (key: string) => {
    const col = config.columns.find((x) => x.key === key);
    if (!col || col.sortable === false) return;
    setSortDirection(
      sortBy === key && sortDirection === "asc" ? "desc" : "asc",
    );
    setSortBy(key);
    setPageNumber(1);
  };
  const icon = (key: string) =>
    sortBy !== key ? (
      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
    ) : sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  const render = (row: Row, key: string) => {
    const col = config.columns.find((x) => x.key === key);
    const value = row[key];
    if (key === "id" || col?.format === "id")
      return (
        <span className="font-mono font-semibold">#{String(value ?? "")}</span>
      );
    if (value == null || value === "") return "—";
    if (col?.format === "boolean") return value ? t("common.yes") : t("common.no");
    if (col?.format === "money") return formatSystemCurrency(Number(value));
    if (col?.format === "number") return formatSystemAmount(Number(value));
    if (col?.format === "date") return formatSystemDate(String(value));
    if (col?.format === "datetime") return formatSystemDateTime(String(value));
    if (col?.format === "status")
      return (
        <span className="metivon-brand-soft inline-flex rounded-full px-2.5 py-1 text-xs font-semibold">
          {t(col.statusPrefix ? `${col.statusPrefix}.${String(value)}` : `statuses.${String(value)}`, { defaultValue: String(value) })}
        </span>
      );
    return String(value);
  };
  const exportColumns = ordered.map((key) => ({
    key,
    label: columns.find((c) => c.key === key)?.label ?? key,
  }));
  const runAction = async (row: Row, index: number): Promise<void> => {
    const action = config.actions?.[index];
    if (!action) return;
    if (action.navigateTo) { navigate(action.navigateTo(row)); return; }
    if (action.confirm && !window.confirm(t(`pages.${config.pageKey}.actions.${index}.confirm`, { defaultValue: action.confirm }))) return;
    const key = `${row.id}:${index}`;
    setPendingAction(key);
    try {
      if (action.endpoint) {
        const endpoint = action.endpoint(row);
        if (action.method === "delete") await api.delete(endpoint);
        else await api.post(endpoint, action.body?.(row));
      }
      await query.refetch();
    } finally {
      setPendingAction(null);
    }
  };
  return (
    <div className="space-y-5">
      <section
        className="metivon-hero rounded-3xl p-6 md:p-8"
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-white/65">
              {t(`pages.${config.pageKey}.eyebrow`, { defaultValue: config.eyebrow })}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{t(`pages.${config.pageKey}.title`, { defaultValue: config.title })}</h1>
            <p className="mt-2 max-w-3xl text-white/75">
              {t(`pages.${config.pageKey}.description`, { defaultValue: config.description })}
            </p>
          </div>
          {config.createLabel ? (
            <Button
              className="bg-[var(--crm-brand-on-primary)] text-[var(--crm-brand-primary)] hover:bg-white/90"
              onClick={() => config.createPath && navigate(config.createPath)}
            >
              <Plus />
              {t(`pages.${config.pageKey}.create`, { defaultValue: config.createLabel })}
            </Button>
          ) : null}
        </div>
      </section>
      <DataTableGrid<Row, string>
        actionBar={{
          pageKey: config.pageKey,
          userId,
          columns: columns.map((c) => ({ key: c.key, label: c.label })),
          visibleColumns: visible,
          columnOrder: order,
          onVisibleColumnsChange: persistV,
          onColumnOrderChange: persistO,
          exportFileName: config.pageKey,
          exportColumns,
          exportRows: rows,
          filterColumns,
          defaultFilterColumn: filterColumns[0]?.value ?? "id",
          draftFilterRows,
          onDraftFilterRowsChange: setDraftFilterRows,
          filterLogic,
          onFilterLogicChange: setFilterLogic,
          onApplyFilters: () => {
            setAppliedFilterRows(draftFilterRows);
            setPageNumber(1);
          },
          onClearFilters: () => {
            setDraftFilterRows([]);
            setAppliedFilterRows([]);
            setFilterLogic("and");
            setPageNumber(1);
          },
          translationNamespace: "erp",
          appliedFilterCount: appliedFilters.length,
          search: {
            value: search,
            onValueChange: setSearch,
            onSearchChange: (v) => {
              setSearch(v);
              setPageNumber(1);
            },
            placeholder: t("common.searchPlaceholder"),
            debounceMs: 350,
          },
          refresh: {
            onRefresh: () => void query.refetch(),
            isLoading: query.isFetching,
            cooldownSeconds: 0,
          },
        }}
        columns={columns}
        visibleColumnKeys={ordered}
        rows={rows}
        rowKey={(r) => r.id}
        renderCell={render}
        showActionsColumn={Boolean(config.actions?.length)}
        actionsHeaderLabel={t("common.actions")}
        renderActionsCell={(row) => (
          <div className="flex justify-end gap-2">
            {config.actions?.map((action, index) => action.visible?.(row) === false ? null : (
              <Button key={`${row.id}:${index}`} size="sm" variant={action.variant ?? "outline"} disabled={pendingAction !== null} onClick={() => void runAction(row, index)}>
                {t(`pages.${config.pageKey}.actions.${index}.label`, { defaultValue: action.label })}
              </Button>
            ))}
          </div>
        )}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={sort}
        renderSortIcon={icon}
        isLoading={query.isLoading}
        isError={query.isError}
        loadingText={t("common.loading")}
        errorText={t("common.loadError")}
        emptyText={t("common.empty")}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageSizeChange={(v) => {
          setPageSize(v);
          setPageNumber(1);
        }}
        pageNumber={pageNumber}
        totalPages={page?.totalPages ?? 0}
        hasPreviousPage={page?.hasPreviousPage ?? false}
        hasNextPage={page?.hasNextPage ?? false}
        onPreviousPage={() => setPageNumber((v) => Math.max(1, v - 1))}
        onNextPage={() => setPageNumber((v) => v + 1)}
        previousLabel={t("common.previous")}
        nextLabel={t("common.next")}
        paginationInfoText={t("common.pagination", { count: page?.totalCount ?? 0, page: page?.pageNumber ?? 1, pages: page?.totalPages ?? 0 })}
        disablePaginationButtons={query.isFetching}
        enableColumnDragAndDrop
        enableColumnResize
        onColumnOrderChange={persistO}
      />
    </div>
  );
}
