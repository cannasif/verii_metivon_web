import type { TFunction } from 'i18next';
import type { PermissionGroupDto } from '../types/access-control.types';

const PRESET_KEY_BY_CODE: Record<string, string> = {
  'system-administrators': 'systemAdministrators',
  'master-data-specialist': 'masterDataSpecialist',
  'purchasing-specialist': 'purchasingSpecialist',
  'goods-receipt-operator': 'goodsReceiptOperator',
  'warehouse-operator': 'warehouseOperator',
  'shipping-operator': 'shippingOperator',
  'sales-specialist': 'salesSpecialist',
  'import-cost-specialist': 'importCostSpecialist',
  'accounting-specialist': 'accountingSpecialist',
  'erp-auditor': 'erpAuditor',
};

export function getPermissionGroupDisplayName(t: TFunction, group: PermissionGroupDto): string {
  const presetKey = group.code ? PRESET_KEY_BY_CODE[group.code] : undefined;
  return presetKey
    ? String(t(`permissionGroups.presets.${presetKey}.name`, { defaultValue: group.name }))
    : group.name;
}

export function getPermissionGroupDisplayDescription(t: TFunction, group: PermissionGroupDto): string | undefined {
  const presetKey = group.code ? PRESET_KEY_BY_CODE[group.code] : undefined;
  return presetKey
    ? String(t(`permissionGroups.presets.${presetKey}.description`, { defaultValue: group.description ?? '' }))
    : group.description;
}
