import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Plus, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserGroupIcon } from 'hugeicons-react';
import { DataTableGrid, type DataTableGridColumn } from '@/components/shared';
import { applyFilterRowsClient, rowsToBackendFilters, type FilterColumnConfig, type FilterRow } from '@/lib/advanced-filter-types';
import { loadColumnPreferences, saveColumnPreferences } from '@/lib/column-preferences';
import { formatSystemCurrency } from '@/lib/system-settings';
import { useSystemSettingsStore } from '@/stores/system-settings-store';
import { useAuthStore } from '@/stores/auth-store';
import { businessPartnerApi } from '../api/business-partner-api';
import { useBusinessPartners } from '../hooks/useBusinessPartners';
import type { BusinessPartner, BusinessPartnerListQuery } from '../types/business-partner.types';
import { BusinessPartnerCreateDialog } from './BusinessPartnerCreateDialog';
import { BusinessPartnerEditDialog } from './BusinessPartnerEditDialog';

type ColumnKey = 'id' | 'code' | 'name' | 'partnerType' | 'customerGroup' | 'paymentTerm' | 'currency' | 'taxGroup' | 'creditLimit' | 'isActive';
const PAGE_KEY = 'metivon-business-partners';
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const ALL_COLUMN_KEYS: ColumnKey[] = ['id', 'code', 'name', 'partnerType', 'customerGroup', 'paymentTerm', 'currency', 'taxGroup', 'creditLimit', 'isActive'];
const DEFAULT_VISIBLE: ColumnKey[] = ['id', 'code', 'name', 'partnerType', 'paymentTerm', 'currency', 'isActive'];

export function BusinessPartnerManagementPage() {
  const { t } = useTranslation('business-partner-management');
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editId,setEditId]=useState<number|null>(null);
  const userId = useAuthStore((state) => state.user?.id);
  const defaultPageSize = useSystemSettingsStore((state) => state.settings.defaultPageSize ?? 20);
  const initialPreferences = useMemo(() => loadColumnPreferences(PAGE_KEY, userId, ALL_COLUMN_KEYS), [userId]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<BusinessPartnerListQuery['sortBy']>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnOrder, setColumnOrder] = useState<string[]>(initialPreferences.order);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    initialPreferences.visibleKeys.length === ALL_COLUMN_KEYS.length ? DEFAULT_VISIBLE : initialPreferences.visibleKeys
  );
  const [draftFilters, setDraftFilters] = useState<FilterRow[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterRow[]>([]);
  const [filterLogic, setFilterLogic] = useState<'and' | 'or'>('and');
  useEffect(() => { setPageSize(defaultPageSize); setPageNumber(1); }, [defaultPageSize]);

  const backendFilters = useMemo(() => rowsToBackendFilters(appliedFilters), [appliedFilters]);
  const queryParams = useMemo<BusinessPartnerListQuery>(() => ({
    pageNumber, pageSize, search, sortBy, sortDirection, filters: backendFilters, filterLogic,
  }), [pageNumber, pageSize, search, sortBy, sortDirection, backendFilters, filterLogic]);
  const { data, isLoading, isError, isFetching, refetch } = useBusinessPartners(queryParams);
  const page = data?.data;
  const sourceRows = useMemo(() => page?.items ?? [], [page?.items]);

  const filterColumns = useMemo<FilterColumnConfig[]>(() => [
    { value: 'code', type: 'string', labelKey: 'columns.code' },
    { value: 'name', type: 'string', labelKey: 'columns.name' },
    { value: 'partnerType', type: 'string', labelKey: 'columns.type' },
    { value: 'customerGroup', type: 'string', labelKey: 'columns.customerGroup' },
    { value: 'paymentTerm', type: 'string', labelKey: 'columns.payment' },
    { value: 'currency', type: 'string', labelKey: 'columns.currency' },
    { value: 'taxGroup', type: 'string', labelKey: 'columns.taxGroup' },
    { value: 'creditLimit', type: 'number', labelKey: 'columns.creditLimit' },
    { value: 'isActive', type: 'boolean', labelKey: 'columns.status' },
  ], []);

  const applyClientFilters = useCallback((items: BusinessPartner[]) => {
    const valid = appliedFilters.filter((row) => row.value.trim());
    if (valid.length === 0) return items;
    if (filterLogic === 'and') return applyFilterRowsClient(items, valid, filterColumns);
    return items.filter((item) => valid.some((row) => applyFilterRowsClient([item], [row], filterColumns).length > 0));
  }, [appliedFilters, filterColumns, filterLogic]);
  const rows = useMemo(() => applyClientFilters(sourceRows), [applyClientFilters, sourceRows]);

  const columns = useMemo<DataTableGridColumn<ColumnKey>[]>(() => [
    { key: 'id', label: 'Kayıt ID', sortable: false, defaultWidth: 110 },
    { key: 'code', label: t('columns.code'), sortable: true, defaultWidth: 140 },
    { key: 'name', label: t('columns.name'), sortable: true, defaultWidth: 240 },
    { key: 'partnerType', label: t('columns.type'), defaultWidth: 150 },
    { key: 'customerGroup', label: t('columns.customerGroup'), defaultWidth: 170 },
    { key: 'paymentTerm', label: t('columns.payment'), defaultWidth: 170 },
    { key: 'currency', label: t('columns.currency'), defaultWidth: 120 },
    { key: 'taxGroup', label: t('columns.taxGroup'), defaultWidth: 150 },
    { key: 'creditLimit', label: t('columns.creditLimit'), sortable: true, defaultWidth: 150 },
    { key: 'isActive', label: t('columns.status'), defaultWidth: 120 },
  ], [t]);
  const baseColumns = useMemo(() => columns.map(({ key, label }) => ({ key, label })), [columns]);
  const orderedVisible = useMemo(() => columnOrder.filter((key): key is ColumnKey => visibleColumns.includes(key) && ALL_COLUMN_KEYS.includes(key as ColumnKey)), [columnOrder, visibleColumns]);
  const exportColumns = useMemo(() => orderedVisible.map((key) => ({ key, label: columns.find((column) => column.key === key)?.label ?? key })), [columns, orderedVisible]);
  const mapExportRows = useCallback((items: BusinessPartner[]): Record<string, unknown>[] => items.map((item) => ({
    ...item, isActive: item.isActive ? t('active') : t('passive'), creditLimit: item.hasUnlimitedCredit ? t('unlimited') : item.creditLimit,
  })), [t]);
  const exportRows = useMemo(() => mapExportRows(rows), [mapExportRows, rows]);

  const getExportData = useCallback(async () => {
    const first = await businessPartnerApi.getAll({ ...queryParams, pageNumber: 1, pageSize: 100 });
    const firstPage = first.data;
    if (!firstPage) return { columns: exportColumns, rows: [] };
    const allRows = [...firstPage.items];
    for (let current = 2; current <= firstPage.totalPages; current += 1) {
      const response = await businessPartnerApi.getAll({ ...queryParams, pageNumber: current, pageSize: 100 });
      if (response.data) allRows.push(...response.data.items);
    }
    return { columns: exportColumns, rows: mapExportRows(applyClientFilters(allRows)) };
  }, [applyClientFilters, exportColumns, mapExportRows, queryParams]);

  const handleColumnState = (nextVisible: string[], nextOrder = columnOrder) => {
    setVisibleColumns(nextVisible); saveColumnPreferences(PAGE_KEY, userId, { visibleKeys: nextVisible, order: nextOrder });
  };
  const handleOrderState = (nextOrder: string[]) => {
    setColumnOrder(nextOrder); saveColumnPreferences(PAGE_KEY, userId, { visibleKeys: visibleColumns, order: nextOrder });
  };
  const handleSort = (key: ColumnKey) => {
    if (!['code', 'name', 'creditLimit'].includes(key)) return;
    const nextDirection = sortBy === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(key as BusinessPartnerListQuery['sortBy']); setSortDirection(nextDirection); setPageNumber(1);
  };
  const renderSortIcon = (key: ColumnKey) => sortBy !== key ? <ArrowUpDown className="h-3.5 w-3.5 opacity-40" /> : sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;

  return <div className="min-h-full space-y-5 bg-slate-50/60 p-1 dark:bg-transparent">
    <section className="relative overflow-hidden rounded-3xl border border-violet-200/60 bg-gradient-to-br from-violet-950 via-slate-950 to-indigo-950 p-6 text-white shadow-xl shadow-violet-950/10 md:p-8">
      <div className="absolute -end-16 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">V3RII Metivon</p><h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{t('title')}</h1><p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">{t('description')}</p></div><div className="flex flex-wrap items-center gap-3"><Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={()=>navigate('/accounts/definitions')}><Settings2/>Cari Tanımları</Button><Button className="bg-white text-violet-950 hover:bg-violet-50" onClick={()=>setCreateOpen(true)}><Plus/>Yeni Cari</Button><div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur"><UserGroupIcon size={22} className="text-violet-300" /><span className="text-2xl font-semibold tabular-nums">{page?.totalCount ?? 0}</span></div></div></div>
    </section>
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <DataTableGrid<BusinessPartner, ColumnKey>
        actionBar={{ pageKey: PAGE_KEY, userId, columns: baseColumns, visibleColumns, columnOrder,
          onVisibleColumnsChange: handleColumnState, onColumnOrderChange: handleOrderState,
          exportFileName: 'business-partners', exportColumns, exportRows, getExportData,
          filterColumns, defaultFilterColumn: 'name', draftFilterRows: draftFilters, onDraftFilterRowsChange: setDraftFilters,
          filterLogic, onFilterLogicChange: setFilterLogic, onApplyFilters: () => { setAppliedFilters(draftFilters); setPageNumber(1); },
          onClearFilters: () => { setDraftFilters([]); setAppliedFilters([]); setPageNumber(1); },
          appliedFilterCount: appliedFilters.filter((row) => row.value.trim()).length, translationNamespace: 'business-partner-management',
          search: { value: search, onValueChange: setSearch, onSearchChange: (value) => { setSearch(value); setPageNumber(1); }, placeholder: t('searchPlaceholder'), debounceMs: 350 },
          refresh: { onRefresh: () => void refetch(), isLoading: isFetching, cooldownSeconds: 0 }
        }}
        columns={columns} visibleColumnKeys={orderedVisible} rows={rows} rowKey={(row) => row.id}
        showActionsColumn actionsHeaderLabel="İşlemler" renderActionsCell={(row)=><Button size="sm" variant="outline" onClick={()=>setEditId(row.id)}><Pencil/>Düzenle</Button>}
        renderCell={(row, key) => {
          if (key === 'id') return <span className="font-mono text-xs font-semibold">#{row.id}</span>;
          if (key === 'code') return <span className="font-mono text-xs font-semibold text-violet-700 dark:text-violet-300">{row.code}</span>;
          if (key === 'isActive') return <span className={row.isActive ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600'}>{row.isActive ? t('active') : t('passive')}</span>;
          if (key === 'creditLimit') return row.hasUnlimitedCredit ? t('unlimited') : formatSystemCurrency(row.creditLimit);
          return row[key] ?? '—';
        }}
        sortBy={sortBy as ColumnKey} sortDirection={sortDirection} onSort={handleSort} renderSortIcon={renderSortIcon}
        isLoading={isLoading} isError={isError} loadingText={t('loading')} errorText={t('loadError')} emptyText={t('empty')}
        minTableWidthClassName="min-w-[1050px]" pageSize={pageSize} pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }} pageNumber={pageNumber} totalPages={page?.totalPages ?? 0}
        hasPreviousPage={page?.hasPreviousPage ?? false} hasNextPage={page?.hasNextPage ?? false}
        onPreviousPage={() => setPageNumber((value) => Math.max(1, value - 1))} onNextPage={() => setPageNumber((value) => value + 1)}
        previousLabel={t('pagination.previous')} nextLabel={t('pagination.next')}
        paginationInfoText={t('pagination.summary', { page: page?.pageNumber ?? 1, pages: page?.totalPages ?? 0, total: page?.totalCount ?? 0 })}
        disablePaginationButtons={isFetching} enableColumnDragAndDrop enableColumnResize onColumnOrderChange={handleOrderState}
      />
    </div>
    <BusinessPartnerCreateDialog open={createOpen} onOpenChange={setCreateOpen}/>
    <BusinessPartnerEditDialog id={editId} open={editId!==null} onOpenChange={(next)=>{if(!next)setEditId(null)}}/>
  </div>;
}
