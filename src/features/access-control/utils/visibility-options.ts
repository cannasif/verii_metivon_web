export const VISIBILITY_SCOPE_OPTIONS = [
  { value: 1, labelKey: 'visibilityPolicies.scope.self', fallback: 'Sadece kendisi' },
  { value: 2, labelKey: 'visibilityPolicies.scope.managerHierarchy', fallback: 'Yönetici hiyerarşisi' },
  { value: 3, labelKey: 'visibilityPolicies.scope.permissionGroup', fallback: 'İzin grubu' },
  { value: 4, labelKey: 'visibilityPolicies.scope.company', fallback: 'Şirket geneli' },
  { value: 5, labelKey: 'visibilityPolicies.scope.branch', fallback: 'Aynı şube' },
  { value: 6, labelKey: 'visibilityPolicies.scope.warehouse', fallback: 'Depo kapsamı' },
] as const;

export const VISIBILITY_ENTITY_OPTIONS = [
  { value: 'BusinessPartner', labelKey: 'visibilityPolicies.entity.businessPartner', fallback: 'Cari' },
  { value: 'Product', labelKey: 'visibilityPolicies.entity.product', fallback: 'Stok / ürün' },
  { value: 'Warehouse', labelKey: 'visibilityPolicies.entity.warehouse', fallback: 'Depo ve lokasyon' },
  { value: 'Inventory', labelKey: 'visibilityPolicies.entity.inventory', fallback: 'Stok hareketleri' },
  { value: 'GoodsReceipt', labelKey: 'visibilityPolicies.entity.goodsReceipt', fallback: 'Mal kabul' },
  { value: 'TransferOrder', labelKey: 'visibilityPolicies.entity.transferOrder', fallback: 'Depolar arası transfer' },
  { value: 'Shipment', labelKey: 'visibilityPolicies.entity.shipment', fallback: 'Sevk ve irsaliye' },
  { value: 'PurchaseOrder', labelKey: 'visibilityPolicies.entity.purchaseOrder', fallback: 'Satın alma' },
  { value: 'SalesOrder', labelKey: 'visibilityPolicies.entity.salesOrder', fallback: 'Satış siparişi' },
  { value: 'ImportDossier', labelKey: 'visibilityPolicies.entity.importDossier', fallback: 'İthalat dosyası' },
  { value: 'ElectronicDocument', labelKey: 'visibilityPolicies.entity.electronicDocument', fallback: 'E-Belge' },
  { value: 'Accounting', labelKey: 'visibilityPolicies.entity.accounting', fallback: 'Muhasebe' },
] as const;

export function getVisibilityScopeMeta(scopeType: number): (typeof VISIBILITY_SCOPE_OPTIONS)[number] | undefined {
  return VISIBILITY_SCOPE_OPTIONS.find((item) => item.value === scopeType);
}

export function getVisibilityEntityMeta(entityType: string): (typeof VISIBILITY_ENTITY_OPTIONS)[number] | undefined {
  return VISIBILITY_ENTITY_OPTIONS.find((item) => item.value === entityType);
}
