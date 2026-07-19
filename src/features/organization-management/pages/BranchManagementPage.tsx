import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ErpPagedManagementPage } from '@/features/erp-operation-management/ErpPagedManagementPage';
import type { ErpPageConfig } from '@/features/erp-operation-management/types';

export function BranchManagementPage(): ReactElement {
  const { t } = useTranslation('organization-management');
  const { t: te } = useTranslation('erp');
  const config = useMemo<ErpPageConfig>(() => ({
    pageKey: 'branch-management',
    title: t('branchManagement.title'),
    eyebrow: t('branchManagement.eyebrow'),
    description: t('branchManagement.description'),
    endpoint: '/api/branches/query',
    queryMethod: 'post',
    accent: 'violet',
    createLabel: t('branchManagement.new'),
    createPath: '/settings/branches/new',
    columns: [
      { key: 'id', label: te('fields.id'), format: 'id', sortable: false, width: 90 },
      { key: 'code', label: t('branchManagement.fields.code'), width: 140 },
      { key: 'name', label: t('branchManagement.fields.name'), width: 260 },
      { key: 'isDefault', label: t('branchManagement.fields.isDefault'), format: 'boolean', width: 120 },
      { key: 'isActive', label: t('branchManagement.fields.isActive'), format: 'boolean', width: 100 },
      { key: 'createdAt', label: t('branchManagement.fields.createdAt'), format: 'datetime', width: 180 },
      { key: 'updatedAt', label: t('branchManagement.fields.updatedAt'), format: 'datetime', width: 180 },
    ],
    actions: [
      { label: te('common.edit'), kind: 'update', navigateTo: row => `/settings/branches/${row.id}/edit` },
      {
        label: te('common.delete'), kind: 'delete', method: 'post',
        endpoint: row => `/api/branches/${row.id}/delete`,
        confirm: t('branchManagement.deleteConfirm'), variant: 'destructive',
        visible: row => row.isDefault !== true,
      },
    ],
  }), [t, te]);

  return <ErpPagedManagementPage config={config} />;
}
