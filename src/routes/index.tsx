import { lazy, type ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { MetivonLayout } from '@/layouts/MetivonLayout';
import { RouteErrorFallback } from '@/components/shared/RouteErrorFallback';
import { ForbiddenPage } from '@/components/shared/ForbiddenPage';
import AuthLayout from '@/layouts/AuthLayout';
import { getAppBasePath } from '@/lib/api-config';

const lazyImport = <T extends Record<string, unknown>, K extends keyof T>(
  factory: () => Promise<T>,
  name: K
) =>
  lazy(async () => {
    const module = await factory();
    return { default: module[name] as ComponentType };
  });

const LoginPage = lazyImport(() => import('@/features/auth'), 'LoginPage');
const ResetPasswordPage = lazyImport(() => import('@/features/auth'), 'ResetPasswordPage');
const ForgotPasswordPage = lazyImport(() => import('@/features/auth'), 'ForgotPasswordPage');
const DashboardPage = lazyImport(() => import('@/features/metivon-dashboard'), 'MetivonDashboardPage');
const BusinessPartnerManagementPage = lazyImport(() => import('@/features/business-partner-management'), 'BusinessPartnerManagementPage');
const BusinessPartnerDefinitionsPage = lazyImport(() => import('@/features/business-partner-management'), 'BusinessPartnerDefinitionsPage');
const BusinessPartnerParametersPage = lazyImport(() => import('@/features/parameter-management'), 'BusinessPartnerParametersPage');
const ReceivingParametersPage = lazyImport(() => import('@/features/parameter-management'), 'ReceivingParametersPage');
const TransferParametersPage = lazyImport(() => import('@/features/parameter-management'), 'TransferParametersPage');
const ShippingParametersPage = lazyImport(() => import('@/features/parameter-management'), 'ShippingParametersPage');
const ProcurementParametersPage = lazyImport(() => import('@/features/parameter-management'), 'ProcurementParametersPage');
const SalesOrderParametersPage = lazyImport(() => import('@/features/parameter-management'), 'SalesOrderParametersPage');
const PricingParametersPage = lazyImport(() => import('@/features/parameter-management'), 'PricingParametersPage');
const InventoryCountParametersPage = lazyImport(() => import('@/features/parameter-management'), 'InventoryCountParametersPage');
const InventoryTraceabilityParametersPage = lazyImport(() => import('@/features/parameter-management'), 'InventoryTraceabilityParametersPage');
const EDocumentParametersPage = lazyImport(() => import('@/features/parameter-management'), 'EDocumentParametersPage');
const AccountingParametersPage = lazyImport(() => import('@/features/parameter-management'), 'AccountingParametersPage');
const BusinessPartnerTypeManagementPage = lazyImport(() => import('@/features/business-partner-type-management'), 'BusinessPartnerTypeManagementPage');
const CustomerGroupManagementPage = lazyImport(() => import('@/features/customer-group-management'), 'CustomerGroupManagementPage');
const PaymentTermManagementPage = lazyImport(() => import('@/features/payment-term-management'), 'PaymentTermManagementPage');
const CurrencyManagementPage = lazyImport(() => import('@/features/currency-management'), 'CurrencyManagementPage');
const TaxGroupManagementPage = lazyImport(() => import('@/features/tax-group-management'), 'TaxGroupManagementPage');
const AiAssistantPage = lazyImport(() => import('@/features/ai-assistant'), 'AiAssistantPage');
const NdiOrderTransferPage = lazyImport(() => import('@/features/ndi'), 'NdiOrderTransferPage');
const TitleManagementPage = lazyImport(() => import('@/features/title-management'), 'TitleManagementPage');
const UserManagementPage = lazyImport(() => import('@/features/user-management'), 'UserManagementPage');
const MailSettingsPage = lazyImport(() => import('@/features/mail-settings'), 'MailSettingsPage');
const SystemSettingsPage = lazyImport(() => import('@/features/system-settings'), 'SystemSettingsPage');
const CountryManagementPage = lazyImport(() => import('@/features/country-management'), 'CountryManagementPage');
const CityManagementPage = lazyImport(() => import('@/features/city-management'), 'CityManagementPage');
const DistrictManagementPage = lazyImport(() => import('@/features/district-management'), 'DistrictManagementPage');
const CustomerTypeManagementPage = lazyImport(() => import('@/features/customer-type-management'), 'CustomerTypeManagementPage');
const CustomerManagementPage = lazyImport(() => import('@/features/customer-management'), 'CustomerManagementPage');
const ConflictInboxPage = lazyImport(() => import('@/features/customer-dedupe'), 'ConflictInboxPage');
const Customer360Page = lazyImport(() => import('@/features/customer-360'), 'Customer360Page');
const Salesmen360Page = lazyImport(() => import('@/features/salesman-360'), 'Salesmen360Page');
const ContactManagementPage = lazyImport(() => import('@/features/contact-management'), 'ContactManagementPage');
const PaymentTypeManagementPage = lazyImport(() => import('@/features/payment-type-management'), 'PaymentTypeManagementPage');
const UserDiscountLimitManagementPage = lazyImport(() => import('@/features/user-discount-limit-management'), 'UserDiscountLimitManagementPage');
const ProductPricingGroupByManagementPage = lazyImport(() => import('@/features/product-pricing-group-by-management'), 'ProductPricingGroupByManagementPage');
const ProductPricingManagementPage = lazyImport(() => import('@/features/product-pricing-management'), 'ProductPricingManagementPage');
const ActivityManagementPage = lazyImport(() => import('@/features/activity-management'), 'ActivityManagementPage');
const ActivityTypeManagementPage = lazyImport(() => import('@/features/activity-type'), 'ActivityTypeManagementPage');
const ActivityMeetingTypeManagementPage = lazyImport(() => import('@/features/activity-meeting-type-management'), 'ActivityTypeManagementPage');
const ActivityTopicPurposeManagementPage = lazyImport(() => import('@/features/activity-topic-purpose-management'), 'ActivityTypeManagementPage');
const ActivityShippingManagementPage = lazyImport(() => import('@/features/activity-shipping-management'), 'ActivityTypeManagementPage');
const ShippingAddressManagementPage = lazyImport(() => import('@/features/shipping-address-management'), 'ShippingAddressManagementPage');
const DailyTasksPage = lazyImport(() => import('@/features/daily-tasks'), 'DailyTasksPage');
const ErpCustomerManagementPage = lazyImport(() => import('@/features/erp-customer-management'), 'ErpCustomerManagementPage');
const ApprovalRoleGroupManagementPage = lazyImport(() => import('@/features/approval-role-group-management'), 'ApprovalRoleGroupManagementPage');
const ApprovalUserRoleManagementPage = lazyImport(() => import('@/features/approval-user-role-management'), 'ApprovalUserRoleManagementPage');
const ApprovalRoleManagementPage = lazyImport(() => import('@/features/approval-role-management'), 'ApprovalRoleManagementPage');
const ApprovalFlowManagementPage = lazyImport(() => import('@/features/approval-flow-management'), 'ApprovalFlowManagementPage');
const QuotationCreateForm = lazyImport(() => import('@/features/quotation'), 'QuotationCreateForm');
const QuotationDetailPage = lazyImport(() => import('@/features/quotation'), 'QuotationDetailPage');
const QuotationListPage = lazyImport(() => import('@/features/quotation'), 'QuotationListPage');
const WaitingApprovalsPage = lazyImport(() => import('@/features/quotation'), 'WaitingApprovalsPage');
const DemandCreateForm = lazyImport(() => import('@/features/demand'), 'DemandCreateForm');
const DemandDetailPage = lazyImport(() => import('@/features/demand'), 'DemandDetailPage');
const DemandListPage = lazyImport(() => import('@/features/demand'), 'DemandListPage');
const DemandWaitingApprovalsPage = lazyImport(() => import('@/features/demand'), 'WaitingApprovalsPage');
const OrderCreateForm = lazyImport(() => import('@/features/order'), 'OrderCreateForm');
const OrderDetailPage = lazyImport(() => import('@/features/order'), 'OrderDetailPage');
const ErpOrderListPage = lazyImport(() => import('@/features/order'), 'ErpOrderListPage');
const ErpDocumentCleanupLogPage = lazyImport(() => import('@/features/order'), 'ErpDocumentCleanupLogPage');
const OrderListPage = lazyImport(() => import('@/features/order'), 'OrderListPage');
const OrderWaitingApprovalsPage = lazyImport(() => import('@/features/order'), 'WaitingApprovalsPage');
const PricingRuleManagementPage = lazyImport(() => import('@/features/pricing-rule'), 'PricingRuleManagementPage');
const StockDetailPage = lazyImport(() => import('@/features/stock'), 'StockDetailPage');
const ProductManagementPage = lazyImport(() => import('@/features/product-management'), 'ProductManagementPage');
const ProductCategoryManagementPage = lazyImport(() => import('@/features/product-category-management'), 'ProductCategoryManagementPage');
const ProductGroupManagementPage = lazyImport(() => import('@/features/product-group-management'), 'ProductGroupManagementPage');
const BrandManagementPage = lazyImport(() => import('@/features/brand-management'), 'BrandManagementPage');
const UnitCategoryManagementPage = lazyImport(() => import('@/features/unit-category-management'), 'UnitCategoryManagementPage');
const UnitManagementPage = lazyImport(() => import('@/features/unit-management'), 'UnitManagementPage');
const PackageTypeManagementPage = lazyImport(() => import('@/features/package-type-management'), 'PackageTypeManagementPage');
const WarehouseManagementPage = lazyImport(() => import('@/features/warehouse-management'), 'WarehouseManagementPage');
const StorageLocationManagementPage = lazyImport(() => import('@/features/storage-location-management'), 'StorageLocationManagementPage');
const InventoryBalanceManagementPage = lazyImport(() => import('@/features/inventory-balance-management'), 'InventoryBalanceManagementPage');
const InventoryTransactionManagementPage = lazyImport(() => import('@/features/inventory-transaction-management'), 'InventoryTransactionManagementPage');
const InventoryDashboardPage = lazyImport(() => import('@/features/inventory-dashboard'), 'InventoryDashboardPage');
const PurchaseOrderManagementPage = lazyImport(() => import('@/features/purchase-order-management'), 'PurchaseOrderManagementPage');
const GoodsReceiptManagementPage = lazyImport(() => import('@/features/goods-receipt-management'), 'GoodsReceiptManagementPage');
const TransferOrderManagementPage = lazyImport(() => import('@/features/transfer-order-management'), 'TransferOrderManagementPage');
const SalesOrderManagementPage = lazyImport(() => import('@/features/sales-order-management'), 'SalesOrderManagementPage');
const PriceListManagementPage = lazyImport(() => import('@/features/price-list-management'), 'PriceListManagementPage');
const ShipmentManagementPage = lazyImport(() => import('@/features/shipment-management'), 'ShipmentManagementPage');
const InventoryCountManagementPage = lazyImport(() => import('@/features/inventory-count-management'), 'InventoryCountManagementPage');
const EDocumentManagementPage = lazyImport(() => import('@/features/e-document-management'), 'EDocumentManagementPage');
const LedgerAccountManagementPage = lazyImport(() => import('@/features/ledger-account-management'), 'LedgerAccountManagementPage');
const JournalEntryManagementPage = lazyImport(() => import('@/features/journal-entry-management'), 'JournalEntryManagementPage');
const FiscalPeriodManagementPage = lazyImport(() => import('@/features/accounting-definition-management'), 'FiscalPeriodManagementPage');
const FiscalPeriodFormPage = lazyImport(() => import('@/features/accounting-definition-management'), 'FiscalPeriodFormPage');
const InventoryPostingProfileManagementPage = lazyImport(() => import('@/features/accounting-definition-management'), 'InventoryPostingProfileManagementPage');
const InventoryPostingProfileFormPage = lazyImport(() => import('@/features/accounting-definition-management'), 'InventoryPostingProfileFormPage');
const ImportDossierManagementPage = lazyImport(() => import('@/features/import-dossier-management'), 'ImportDossierManagementPage');
const LandedCostTypeManagementPage = lazyImport(() => import('@/features/import-dossier-management'), 'LandedCostTypeManagementPage');
const ImportDossierCostCreatePage = lazyImport(() => import('@/features/import-dossier-management'), 'ImportDossierCostCreatePage');
const ImportDossierDetailPage = lazyImport(() => import('@/features/import-dossier-management'), 'ImportDossierDetailPage');
const TradeDossierManagementPage = lazyImport(() => import('@/features/import-dossier-management'), 'TradeDossierManagementPage');
const TradeDossierDetailPage = lazyImport(() => import('@/features/import-dossier-management'), 'TradeDossierDetailPage');
const WarehouseCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'WarehouseCreatePage');
const StorageLocationCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'StorageLocationCreatePage');
const PurchaseOrderCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'PurchaseOrderCreatePage');
const TransferOrderCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'TransferOrderCreatePage');
const InventoryCountCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'InventoryCountCreatePage');
const PriceListCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'PriceListCreatePage');
const LedgerAccountCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'LedgerAccountCreatePage');
const GoodsReceiptCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'GoodsReceiptCreatePage');
const SalesOrderCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'SalesOrderCreatePage');
const ShipmentCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'ShipmentCreatePage');
const JournalEntryCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'JournalEntryCreatePage');
const ImportDossierCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'ImportDossierCreatePage');
const LandedCostTypeCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'LandedCostTypeCreatePage');
const TradeDossierCreatePage = lazyImport(() => import('@/features/erp-form-management'), 'TradeDossierCreatePage');
const DocumentSerialTypeManagementPage = lazyImport(() => import('@/features/document-serial-type-management'), 'DocumentSerialTypeManagementPage');
const NumberSeriesManagementPage = lazyImport(() => import('@/features/number-series-management'), 'NumberSeriesManagementPage');
const NumberSeriesCreatePage = lazyImport(() => import('@/features/number-series-management'), 'NumberSeriesCreatePage');
const NumberSeriesUsagePage = lazyImport(() => import('@/features/number-series-management'), 'NumberSeriesUsagePage');
const SalesTypeManagementPage = lazyImport(() => import('@/features/sales-type-management'), 'SalesTypeManagementPage');
const WindoProfilDemirVidaTanimlamaPage = lazyImport(() => import('@/features/windo-profil-demir-vida-management'), 'WindoProfilDemirVidaTanimlamaPage');
const SalesRepManagementPage = lazyImport(() => import('@/features/sales-rep-management'), 'SalesRepManagementPage');
const SalesRepMatchManagementPage = lazyImport(() => import('@/features/sales-rep-match-management'), 'SalesRepMatchManagementPage');
const CategoryDefinitionsPage = lazyImport(() => import('@/features/category-definitions'), 'CategoryDefinitionsPage');
const ReportDesignerListPage = lazyImport(() => import('@/features/report-designer/ReportDesignerListPage'), 'ReportDesignerListPage');
const ReportDesignerCreatePage = lazyImport(() => import('@/features/report-designer/ReportDesignerCreatePage'), 'ReportDesignerCreatePage');
const PdfReportDesignerListPage = lazyImport(() => import('@/features/pdf-report-designer/pages/PdfReportDesignerListPage'), 'PdfReportDesignerListPage');
const PdfReportDesignerCreatePage = lazyImport(() => import('@/features/pdf-report-designer/pages/PdfReportDesignerCreatePage'), 'PdfReportDesignerCreatePage');
const PdfTablePresetManagementPage = lazyImport(() => import('@/features/pdf-report-designer/pages/PdfTablePresetManagementPage'), 'PdfTablePresetManagementPage');
const ReportsListPage = lazyImport(() => import('@/features/report-builder/pages/ReportsListPage'), 'ReportsListPage');
const ReportBuilderPage = lazyImport(() => import('@/features/report-builder/pages/ReportBuilderPage'), 'ReportBuilderPage');
const ReportViewerPage = lazyImport(() => import('@/features/report-builder/pages/ReportViewerPage'), 'ReportViewerPage');
const MyReportsDashboardPage = lazyImport(() => import('@/features/report-builder/pages/MyReportsDashboardPage'), 'MyReportsDashboardPage');
const ReportDefinitionList = lazyImport(() => import('@/features/powerbi'), 'ReportDefinitionList');
const GroupList = lazyImport(() => import('@/features/powerbi'), 'GroupList');
const UserGroupList = lazyImport(() => import('@/features/powerbi'), 'UserGroupList');
const GroupReportDefinitionList = lazyImport(() => import('@/features/powerbi'), 'GroupReportDefinitionList');
const PowerbiConfigurationPage = lazyImport(() => import('@/features/powerbi-configuration'), 'PowerbiConfigurationPage');
const PowerbiReportsListPage = lazyImport(() => import('@/features/powerbi-viewer'), 'PowerbiReportsListPage');
const PowerbiReportViewerPage = lazyImport(() => import('@/features/powerbi-viewer'), 'PowerbiReportViewerPage');
const PowerbiReportSyncPage = lazyImport(() => import('@/features/powerbi-sync'), 'PowerbiReportSyncPage');
const PowerbiRlsPage = lazyImport(() => import('@/features/powerbi-rls'), 'PowerbiRlsPage');
const AccessControlGuidePage = lazyImport(() => import('@/features/access-control'), 'AccessControlGuidePage');
const PermissionGroupsPage = lazyImport(() => import('@/features/access-control'), 'PermissionGroupsPage');
const UserGroupAssignmentsPage = lazyImport(() => import('@/features/access-control'), 'UserGroupAssignmentsPage');
const VisibilityPoliciesPage = lazyImport(() => import('@/features/access-control'), 'VisibilityPoliciesPage');
const UserVisibilityAssignmentsPage = lazyImport(() => import('@/features/access-control'), 'UserVisibilityAssignmentsPage');
const VisibilitySimulatorPage = lazyImport(() => import('@/features/access-control'), 'VisibilitySimulatorPage');
const AuditLogsPage = lazyImport(() => import('@/features/access-control'), 'AuditLogsPage');
const HangfireMonitoringPage = lazyImport(() => import('@/features/hangfire-monitoring'), 'HangfireMonitoringPage');
const ProfilePage = lazyImport(() => import('@/features/user-detail-management'), 'ProfilePage');
const GoogleConnectionPage = lazyImport(() => import('@/features/google-integration'), 'GoogleConnectionPage');
const GoogleSyncPage = lazyImport(() => import('@/features/google-integration'), 'GoogleSyncPage');
const GoogleLogsPage = lazyImport(() => import('@/features/google-integration'), 'GoogleLogsPage');
const GoogleAuthInformationPage = lazyImport(() => import('@/features/google-integration'), 'GoogleAuthInformationPage');
const OutlookConnectionPage = lazyImport(() => import('@/features/outlook-integration'), 'OutlookConnectionPage');
const OutlookSyncPage = lazyImport(() => import('@/features/outlook-integration'), 'OutlookSyncPage');
const OutlookLogsPage = lazyImport(() => import('@/features/outlook-integration'), 'OutlookLogsPage');
const OutlookAuthInformationPage = lazyImport(() => import('@/features/outlook-integration'), 'OutlookAuthInformationPage');
const WhatsappConnectionPage = lazyImport(() => import('@/features/whatsapp-integration'), 'WhatsappConnectionPage');
const WhatsappFlowPage = lazyImport(() => import('@/features/whatsapp-integration'), 'WhatsappFlowPage');
const WhatsappLogsPage = lazyImport(() => import('@/features/whatsapp-integration'), 'WhatsappLogsPage');
const WhatsappQuoteDraftsPage = lazyImport(() => import('@/features/whatsapp-integration'), 'WhatsappQuoteDraftsPage');

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <MetivonLayout />
        </ProtectedRoute>
      ),
      errorElement: <RouteErrorFallback />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'accounts', element: <BusinessPartnerManagementPage /> },
        { path: 'accounts/definitions', element: <BusinessPartnerDefinitionsPage /> },
        { path: 'accounts/definitions/partner-types', element: <BusinessPartnerTypeManagementPage /> },
        { path: 'accounts/definitions/customer-groups', element: <CustomerGroupManagementPage /> },
        { path: 'accounts/definitions/payment-terms', element: <PaymentTermManagementPage /> },
        { path: 'accounts/definitions/currencies', element: <CurrencyManagementPage /> },
        { path: 'accounts/definitions/tax-groups', element: <TaxGroupManagementPage /> },
        { path: 'accounts/parameters', element: <BusinessPartnerParametersPage /> },
        { path: 'ai-assistant', element: <AiAssistantPage /> },
        { path: 'ndi/order-line-selection', element: <NdiOrderTransferPage /> },
        { path: 'forbidden', element: <ForbiddenPage /> },
        { path: 'report-designer', element: <ReportDesignerListPage /> },
        { path: 'report-designer/create', element: <ReportDesignerCreatePage /> },
        { path: 'report-designer/edit/:id', element: <ReportDesignerCreatePage /> },
        { path: 'pdf-report-designer', element: <PdfReportDesignerListPage /> },
        { path: 'pdf-report-designer/create', element: <PdfReportDesignerCreatePage /> },
        { path: 'pdf-report-designer/edit/:id', element: <PdfReportDesignerCreatePage /> },
        { path: 'pdf-report-designer/table-presets', element: <PdfTablePresetManagementPage /> },
        { path: 'reports', element: <ReportsListPage /> },
        { path: 'reports/my', element: <ReportsListPage /> },
        { path: 'reports/my-dashboard', element: <MyReportsDashboardPage /> },
        { path: 'reports/my/:id', element: <ReportViewerPage /> },
        { path: 'reports/new', element: <ReportBuilderPage /> },
        { path: 'reports/:id/edit', element: <ReportBuilderPage /> },
        { path: 'reports/:id/edit/preview', element: <ReportViewerPage /> },
        { path: 'reports/:id', element: <ReportViewerPage /> },
        { path: 'powerbi/configuration', element: <PowerbiConfigurationPage /> },
        { path: 'powerbi/reports', element: <PowerbiReportsListPage /> },
        { path: 'powerbi/reports/:id', element: <PowerbiReportViewerPage /> },
        { path: 'powerbi/sync', element: <PowerbiReportSyncPage /> },
        { path: 'powerbi/report-definitions', element: <ReportDefinitionList /> },
        { path: 'powerbi/groups', element: <GroupList /> },
        { path: 'powerbi/user-groups', element: <UserGroupList /> },
        { path: 'powerbi/group-report-definitions', element: <GroupReportDefinitionList /> },
        { path: 'powerbi/rls', element: <PowerbiRlsPage /> },
        { path: 'title-management', element: <TitleManagementPage /> },
        { path: 'user-management', element: <UserManagementPage /> },
        { path: 'country-management', element: <CountryManagementPage /> },
        { path: 'city-management', element: <CityManagementPage /> },
        { path: 'district-management', element: <DistrictManagementPage /> },
        { path: 'customer-type-management', element: <CustomerTypeManagementPage /> },
        { path: 'customer-management', element: <CustomerManagementPage /> },
        { path: 'customers/conflict-inbox', element: <ConflictInboxPage /> },
        { path: 'customer-360/:customerId', element: <Customer360Page /> },
        { path: 'salesmen-360/:userId', element: <Salesmen360Page /> },
        { path: 'contact-management', element: <ContactManagementPage /> },
        { path: 'payment-type-management', element: <PaymentTypeManagementPage /> },
        { path: 'user-discount-limit-management', element: <UserDiscountLimitManagementPage /> },
        { path: 'users/mail-settings', element: <MailSettingsPage /> },
        { path: 'settings/system-settings', element: <SystemSettingsPage /> },
        { path: 'product-pricing-group-by-management', element: <ProductPricingGroupByManagementPage /> },
        { path: 'product-pricing-management', element: <ProductPricingManagementPage /> },
        { path: 'activity-management', element: <ActivityManagementPage /> },
        { path: 'activity-type-management', element: <ActivityTypeManagementPage /> },
        { path: 'definitions/activity-meeting-type-management', element: <ActivityMeetingTypeManagementPage /> },
        { path: 'definitions/activity-topic-purpose-management', element: <ActivityTopicPurposeManagementPage /> },
        { path: 'definitions/activity-shipping-management', element: <ActivityShippingManagementPage /> },
        { path: 'shipping-address-management', element: <ShippingAddressManagementPage /> },
        { path: 'daily-tasks', element: <DailyTasksPage /> },
        { path: 'erp-customers', element: <ErpCustomerManagementPage /> },
        { path: 'approval-role-group-management', element: <ApprovalRoleGroupManagementPage /> },
        { path: 'approval-user-role-management', element: <ApprovalUserRoleManagementPage /> },
        { path: 'approval-role-management', element: <ApprovalRoleManagementPage /> },
        { path: 'approval-flow-management', element: <ApprovalFlowManagementPage /> },
        { path: 'quotations', element: <QuotationListPage /> },
        { path: 'quotations/create', element: <QuotationCreateForm /> },
        { path: 'quotations/:id', element: <QuotationDetailPage /> },
        { path: 'quotations/waiting-approvals', element: <WaitingApprovalsPage /> },
        { path: 'demands', element: <DemandListPage /> },
        { path: 'demands/create', element: <DemandCreateForm /> },
        { path: 'demands/:id', element: <DemandDetailPage /> },
        { path: 'demands/waiting-approvals', element: <DemandWaitingApprovalsPage /> },
        { path: 'orders', element: <OrderListPage /> },
        { path: 'orders/create', element: <OrderCreateForm /> },
        { path: 'orders/erp', element: <ErpOrderListPage /> },
        { path: 'sales/erp-cleanup-logs', element: <ErpDocumentCleanupLogPage /> },
        { path: 'orders/waiting-approvals', element: <OrderWaitingApprovalsPage /> },
        { path: 'orders/:id', element: <OrderDetailPage /> },
        { path: 'pricing-rules', element: <PricingRuleManagementPage /> },
        { path: 'stocks', element: <ProductManagementPage /> },
        { path: 'products/definitions/categories', element: <ProductCategoryManagementPage /> },
        { path: 'products/definitions/groups', element: <ProductGroupManagementPage /> },
        { path: 'products/definitions/brands', element: <BrandManagementPage /> },
        { path: 'products/definitions/unit-categories', element: <UnitCategoryManagementPage /> },
        { path: 'products/definitions/units', element: <UnitManagementPage /> },
        { path: 'products/definitions/package-types', element: <PackageTypeManagementPage /> },
        { path: 'warehouses', element: <WarehouseManagementPage /> },
        { path: 'warehouses/locations', element: <StorageLocationManagementPage /> },
        { path: 'inventory', element: <InventoryDashboardPage /> },
        { path: 'inventory/balances', element: <InventoryBalanceManagementPage /> },
        { path: 'inventory/transactions', element: <InventoryTransactionManagementPage /> },
        { path: 'purchase-orders', element: <PurchaseOrderManagementPage /> },
        { path: 'purchase-orders/parameters', element: <ProcurementParametersPage /> },
        { path: 'goods-receipts', element: <GoodsReceiptManagementPage /> },
        { path: 'goods-receipts/parameters', element: <ReceivingParametersPage /> },
        { path: 'transfer-orders', element: <TransferOrderManagementPage /> },
        { path: 'transfer-orders/parameters', element: <TransferParametersPage /> },
        { path: 'sales-orders', element: <SalesOrderManagementPage /> },
        { path: 'sales-orders/parameters', element: <SalesOrderParametersPage /> },
        { path: 'pricing/price-lists', element: <PriceListManagementPage /> },
        { path: 'pricing/parameters', element: <PricingParametersPage /> },
        { path: 'shipments', element: <ShipmentManagementPage /> },
        { path: 'shipments/parameters', element: <ShippingParametersPage /> },
        { path: 'purchase-orders/number-series', element: <NumberSeriesManagementPage /> },
        { path: 'purchase-orders/number-series/new', element: <NumberSeriesCreatePage /> },
        { path: 'purchase-orders/number-series/usages', element: <NumberSeriesUsagePage /> },
        { path: 'goods-receipts/number-series', element: <NumberSeriesManagementPage /> },
        { path: 'goods-receipts/number-series/new', element: <NumberSeriesCreatePage /> },
        { path: 'goods-receipts/number-series/usages', element: <NumberSeriesUsagePage /> },
        { path: 'transfer-orders/number-series', element: <NumberSeriesManagementPage /> },
        { path: 'transfer-orders/number-series/new', element: <NumberSeriesCreatePage /> },
        { path: 'transfer-orders/number-series/usages', element: <NumberSeriesUsagePage /> },
        { path: 'sales-orders/number-series', element: <NumberSeriesManagementPage /> },
        { path: 'sales-orders/number-series/new', element: <NumberSeriesCreatePage /> },
        { path: 'sales-orders/number-series/usages', element: <NumberSeriesUsagePage /> },
        { path: 'shipments/number-series', element: <NumberSeriesManagementPage /> },
        { path: 'shipments/number-series/new', element: <NumberSeriesCreatePage /> },
        { path: 'shipments/number-series/usages', element: <NumberSeriesUsagePage /> },
        { path: 'e-documents/number-series', element: <NumberSeriesManagementPage /> },
        { path: 'e-documents/number-series/new', element: <NumberSeriesCreatePage /> },
        { path: 'e-documents/number-series/usages', element: <NumberSeriesUsagePage /> },
        { path: 'inventory-counts', element: <InventoryCountManagementPage /> },
        { path: 'inventory-counts/parameters', element: <InventoryCountParametersPage /> },
        { path: 'inventory/tracking-parameters', element: <InventoryTraceabilityParametersPage /> },
        { path: 'e-documents', element: <EDocumentManagementPage /> },
        { path: 'e-documents/parameters', element: <EDocumentParametersPage /> },
        { path: 'accounting/accounts', element: <LedgerAccountManagementPage /> },
        { path: 'accounting/journals', element: <JournalEntryManagementPage /> },
        { path: 'accounting/parameters', element: <AccountingParametersPage /> },
        { path: 'accounting/definitions/fiscal-periods', element: <FiscalPeriodManagementPage /> },
        { path: 'accounting/definitions/fiscal-periods/new', element: <FiscalPeriodFormPage /> },
        { path: 'accounting/definitions/fiscal-periods/:id/edit', element: <FiscalPeriodFormPage /> },
        { path: 'accounting/definitions/inventory-posting-profiles', element: <InventoryPostingProfileManagementPage /> },
        { path: 'accounting/definitions/inventory-posting-profiles/new', element: <InventoryPostingProfileFormPage /> },
        { path: 'accounting/definitions/inventory-posting-profiles/:id/edit', element: <InventoryPostingProfileFormPage /> },
        { path: 'import-dossiers', element: <ImportDossierManagementPage /> },
        { path: 'import-dossiers/:id', element: <ImportDossierDetailPage /> },
        { path: 'import-dossiers/definitions/cost-types', element: <LandedCostTypeManagementPage /> },
        { path: 'import-dossiers/:id/costs/new', element: <ImportDossierCostCreatePage /> },
        { path: 'trade-dossiers', element: <TradeDossierManagementPage /> },
        { path: 'trade-dossiers/new', element: <TradeDossierCreatePage /> },
        { path: 'trade-dossiers/:id', element: <TradeDossierDetailPage /> },
        { path: 'warehouses/new', element: <WarehouseCreatePage /> },
        { path: 'warehouses/locations/new', element: <StorageLocationCreatePage /> },
        { path: 'purchase-orders/new', element: <PurchaseOrderCreatePage /> },
        { path: 'transfer-orders/new', element: <TransferOrderCreatePage /> },
        { path: 'inventory-counts/new', element: <InventoryCountCreatePage /> },
        { path: 'pricing/price-lists/new', element: <PriceListCreatePage /> },
        { path: 'accounting/accounts/new', element: <LedgerAccountCreatePage /> },
        { path: 'goods-receipts/new', element: <GoodsReceiptCreatePage /> },
        { path: 'sales-orders/new', element: <SalesOrderCreatePage /> },
        { path: 'shipments/new', element: <ShipmentCreatePage /> },
        { path: 'accounting/journals/new', element: <JournalEntryCreatePage /> },
        { path: 'import-dossiers/new', element: <ImportDossierCreatePage /> },
        { path: 'import-dossiers/definitions/cost-types/new', element: <LandedCostTypeCreatePage /> },
        { path: 'stocks/:id', element: <StockDetailPage /> },
        { path: 'document-serial-type-management', element: <DocumentSerialTypeManagementPage /> },
        { path: 'definitions/sales-type-management', element: <SalesTypeManagementPage /> },
        { path: 'definitions/windo-profil-demir-vida-tanimlama', element: <WindoProfilDemirVidaTanimlamaPage /> },
        { path: 'definitions/sales-rep-management', element: <SalesRepManagementPage /> },
        { path: 'definitions/sales-rep-match-management', element: <SalesRepMatchManagementPage /> },
        { path: 'definitions/category-definitions', element: <CategoryDefinitionsPage /> },
        { path: 'access-control/guide', element: <AccessControlGuidePage /> },
        { path: 'access-control/permission-groups', element: <PermissionGroupsPage /> },
        { path: 'access-control/permission-definitions', element: <Navigate to="/access-control/permission-groups" replace /> },
        { path: 'access-control/user-group-assignments', element: <UserGroupAssignmentsPage /> },
        { path: 'access-control/visibility-policies', element: <VisibilityPoliciesPage /> },
        { path: 'access-control/user-visibility-assignments', element: <UserVisibilityAssignmentsPage /> },
        { path: 'access-control/visibility-simulator', element: <VisibilitySimulatorPage /> },
        { path: 'access-control/audit-logs', element: <AuditLogsPage /> },
        { path: 'hangfire-monitoring', element: <HangfireMonitoringPage /> },
        { path: 'settings/integrations/google', element: <GoogleConnectionPage /> },
        { path: 'settings/integrations/google/sync', element: <GoogleSyncPage /> },
        { path: 'settings/integrations/google/logs', element: <GoogleLogsPage /> },
        { path: 'settings/integrations/google/auth', element: <GoogleAuthInformationPage /> },
        { path: 'settings/integrations/outlook', element: <OutlookConnectionPage /> },
        { path: 'settings/integrations/outlook/sync', element: <OutlookSyncPage /> },
        { path: 'settings/integrations/outlook/logs', element: <OutlookLogsPage /> },
        { path: 'settings/integrations/outlook/auth', element: <OutlookAuthInformationPage /> },
        { path: 'settings/integrations/whatsapp', element: <WhatsappConnectionPage /> },
        { path: 'settings/integrations/whatsapp/flow', element: <WhatsappFlowPage /> },
        { path: 'settings/integrations/whatsapp/drafts', element: <WhatsappQuoteDraftsPage /> },
        { path: 'settings/integrations/whatsapp/logs', element: <WhatsappLogsPage /> },
        { path: 'profile', element: <ProfilePage /> },
      ],
    },
    {
      path: '/auth',
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <LoginPage /> },
        { path: 'reset-password', element: <ResetPasswordPage /> },
        { path: 'forgot-password', element: <ForgotPasswordPage /> },
      ],
    },
    {
      path: '/reset-password',
      element: <AuthLayout />,
      children: [{ index: true, element: <ResetPasswordPage /> }],
    },
  ], {
    basename: getAppBasePath(),
  });
}
