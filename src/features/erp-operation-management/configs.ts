import type { ErpPageConfig } from "./types";
const id = {
  key: "id",
  label: "Kayıt ID",
  width: 100,
  sortable: true,
  format: "id" as const,
};
export const warehouseConfig: ErpPageConfig = {
  pageKey: "warehouses",
  title: "Depo Yönetimi",
  eyebrow: "Depo ve Lokasyon",
  description:
    "Şube depolarını, WMS davranışını ve negatif stok politikasını yönetin.",
  endpoint: "/api/warehouses",
  accent: "emerald",
  createLabel: "Yeni Depo",
  createPath: "/warehouses/new",
  columns: [
    id,
    { key: "code", label: "Depo Kodu" },
    { key: "name", label: "Depo Adı" },
    { key: "branchName", label: "Şube" },
    { key: "typeName", label: "Depo Tipi" },
    { key: "isWmsEnabled", label: "WMS", format: "boolean" },
    { key: "allowNegativeStock", label: "Negatif Stok", format: "boolean" },
    { key: "isDefault", label: "Varsayılan", format: "boolean" },
    { key: "isActive", label: "Durum", format: "boolean" },
  ],
  actions: [
    { label: "Güncelle", kind: "update", navigateTo: (row) => `/warehouses/${row.id}/edit` },
    { label: "Sil", kind: "delete", method: "delete", endpoint: (row) => `/api/warehouses/${row.id}`, confirm: "Depo kaydı silinsin mi? Bağlı hareketi olan depolar silinemez; pasifleştirilebilir.", variant: "destructive", visible: (row) => row.isDefault !== true },
  ],
};
export const locationConfig: ErpPageConfig = {
  pageKey: "storage-locations",
  title: "Raf / Lokasyon Yönetimi",
  eyebrow: "Depo ve Lokasyon",
  description:
    "Koridor, blok, seviye, kapasite ve operasyon amaçlı lokasyonları yönetin.",
  endpoint: "/api/warehouses/locations",
  accent: "emerald",
  createLabel: "Yeni Lokasyon",
  createPath: "/warehouses/locations/new",
  columns: [
    id,
    { key: "code", label: "Lokasyon Kodu" },
    { key: "barcode", label: "Barkod" },
    { key: "warehouseName", label: "Depo" },
    { key: "zoneName", label: "Bölge" },
    { key: "locationTypeName", label: "Lokasyon Tipi" },
    { key: "coordinate", label: "Koordinat" },
    { key: "isBlocked", label: "Bloke", format: "boolean" },
    { key: "isActive", label: "Durum", format: "boolean" },
  ],
  actions: [
    { label: "Güncelle", kind: "update", navigateTo: (row) => `/warehouses/locations/${row.id}/edit` },
    { label: "Sil", kind: "delete", method: "delete", endpoint: (row) => `/api/warehouses/locations/${row.id}`, confirm: "Raf / lokasyon kaydı silinsin mi?", variant: "destructive" },
  ],
};
export const balanceConfig: ErpPageConfig = {
  pageKey: "inventory-balances",
  title: "Stok Bakiyeleri",
  eyebrow: "Stok Hareket Motoru",
  description:
    "Ürün, depo, raf, stok durumu, lot ve seri boyutlarında fiziksel ve kullanılabilir stok.",
  endpoint: "/api/inventory/balances",
  accent: "cyan",
  columns: [
    id,
    { key: "productCode", label: "Ürün Kodu" },
    { key: "productName", label: "Ürün Adı" },
    { key: "warehouseCode", label: "Depo" },
    { key: "locationCode", label: "Raf" },
    { key: "inventoryStatus", label: "Stok Durumu" },
    { key: "lotNumber", label: "Lot" },
    { key: "serialNumber", label: "Seri" },
    { key: "expiryDate", label: "SKT", format: "date" },
    { key: "physicalQuantity", label: "Fiziksel", format: "number" },
    { key: "reservedQuantity", label: "Rezerve", format: "number" },
    { key: "availableQuantity", label: "Kullanılabilir", format: "number" },
    { key: "inventoryValue", label: "Stok Değeri", format: "money" },
  ],
};
export const transactionConfig: ErpPageConfig = {
  pageKey: "inventory-transactions",
  title: "Stok Hareketleri",
  eyebrow: "Değiştirilemez Stok Defteri",
  description:
    "Kabul, sevk, transfer, sayım ve düzeltmelerin denetlenebilir hareket geçmişi.",
  endpoint: "/api/inventory/transactions",
  accent: "cyan",
  columns: [
    id,
    { key: "postingId", label: "Post ID" },
    { key: "documentType", label: "Belge Tipi" },
    { key: "documentNumber", label: "Belge No" },
    { key: "postingDate", label: "Post Tarihi", format: "datetime" },
    { key: "movementType", label: "Hareket Tipi", format: "status" },
    { key: "productCode", label: "Ürün Kodu" },
    { key: "productName", label: "Ürün Adı" },
    { key: "warehouseCode", label: "Depo" },
    { key: "locationCode", label: "Raf" },
    { key: "lotNumber", label: "Lot" },
    { key: "serialNumber", label: "Seri" },
    { key: "quantity", label: "Miktar", format: "number" },
    { key: "currencyCode", label: "Para Birimi" },
    { key: "unitCost", label: "Birim Maliyet", format: "money", currencyKey: "currencyCode" },
    { key: "totalCost", label: "Toplam Maliyet", format: "money", currencyKey: "currencyCode" },
  ],
};
export const purchaseConfig: ErpPageConfig = {
  pageKey: "purchase-orders",
  title: "Satın Alma Siparişleri",
  eyebrow: "Satın Alma",
  description:
    "Tedarikçi siparişlerini, teslimat ve kabul durumlarını yönetin.",
  endpoint: "/api/purchase-orders",
  accent: "violet",
  createLabel: "Yeni Satın Alma",
  createPath: "/purchase-orders/new",
  columns: [
    id,
    { key: "orderNumber", label: "Sipariş No" },
    { key: "supplierCode", label: "Tedarikçi Kodu" },
    { key: "supplierName", label: "Tedarikçi" },
    { key: "warehouseCode", label: "Depo" },
    { key: "orderDate", label: "Sipariş Tarihi", format: "date" },
    { key: "deliveryDate", label: "Teslim Tarihi", format: "date" },
    { key: "currency", label: "Para Birimi" },
    { key: "grandTotal", label: "Toplam", format: "money", currencyKey: "currency" },
    { key: "status", label: "Durum", format: "status" },
  ],
  actions: [
    {label:"Düzenle",kind:"update",navigateTo:(row)=>`/purchase-orders/${row.id}/edit`,visible:(row)=>String(row.status)==="Draft"},
    {label:"Sil",kind:"delete",method:"delete",endpoint:(row)=>`/api/purchase-orders/${row.id}`,confirm:"Taslak satın alma siparişi kalıcı olarak silinsin mi?",variant:"destructive",visible:(row)=>String(row.status)==="Draft"},
  ],
};
export const receiptConfig: ErpPageConfig = {
  pageKey: "goods-receipts",
  title: "Mal Kabul",
  eyebrow: "Gelen Lojistik",
  description:
    "Siparişe bağlı veya serbest kabul, kalite, karantina, lot ve seri girişleri.",
  endpoint: "/api/goods-receipts",
  accent: "emerald",
  createLabel: "Yeni Mal Kabul",
  createPath: "/goods-receipts/new",
  columns: [
    id,
    { key: "receiptNumber", label: "Kabul No" },
    { key: "type", label: "Kabul Tipi", format: "status" },
    { key: "supplierName", label: "Tedarikçi" },
    { key: "warehouseCode", label: "Depo" },
    { key: "receiptDate", label: "Kabul Tarihi", format: "date" },
    { key: "purchaseOrderNumber", label: "Satın Alma No" },
    { key: "status", label: "Durum", format: "status" },
  ],
};
receiptConfig.actions = [
  {label:"Düzenle",kind:"update",navigateTo:(row)=>`/goods-receipts/${row.id}/edit`,visible:(row)=>["Draft","Registered"].includes(String(row.status))},
  {label:"Sil",kind:"delete",method:"delete",endpoint:(row)=>`/api/goods-receipts/${row.id}`,confirm:"Stok hareketi oluşmamış mal kabul kalıcı olarak silinsin mi?",variant:"destructive",visible:(row)=>["Draft","Registered"].includes(String(row.status))},
];
export const transferConfig: ErpPageConfig = {
  pageKey: "transfer-orders",
  title: "Depolar Arası Transfer",
  eyebrow: "İç Lojistik",
  description:
    "Kaynak çıkışı, yoldaki stok ve hedef teslim alma süreçlerini yönetin.",
  endpoint: "/api/transfer-orders",
  accent: "amber",
  createLabel: "Yeni Transfer",
  createPath: "/transfer-orders/new",
  columns: [
    id,
    { key: "transferNumber", label: "Transfer No" },
    { key: "fromWarehouse", label: "Kaynak Depo" },
    { key: "toWarehouse", label: "Hedef Depo" },
    { key: "transferDate", label: "Transfer Tarihi", format: "date" },
    { key: "expectedReceiptDate", label: "Beklenen Teslim", format: "date" },
    { key: "status", label: "Durum", format: "status" },
  ],
};
transferConfig.actions = [
  {label:"Düzenle",kind:"update",navigateTo:(row)=>`/transfer-orders/${row.id}/edit`,visible:(row)=>String(row.status)==="Draft"},
  {label:"Sil",kind:"delete",method:"delete",endpoint:(row)=>`/api/transfer-orders/${row.id}`,confirm:"Taslak transfer kalıcı olarak silinsin mi?",variant:"destructive",visible:(row)=>String(row.status)==="Draft"},
];
export const salesConfig: ErpPageConfig = {
  pageKey: "sales-orders",
  title: "Satış Siparişleri",
  eyebrow: "Satış Yönetimi",
  description:
    "Fiyatlandırılmış, rezervasyonlu ve sevke bağlı satış siparişlerini yönetin.",
  endpoint: "/api/sales-orders",
  accent: "violet",
  createLabel: "Yeni Satış Siparişi",
  createPath: "/sales-orders/new",
  columns: [
    id,
    { key: "orderNumber", label: "Sipariş No" },
    { key: "customerCode", label: "Cari Kodu" },
    { key: "customerName", label: "Müşteri" },
    { key: "warehouseCode", label: "Depo" },
    { key: "orderDate", label: "Sipariş Tarihi", format: "date" },
    { key: "shipmentDate", label: "Sevk Tarihi", format: "date" },
    { key: "currency", label: "Para Birimi" },
    { key: "grandTotal", label: "Toplam", format: "money", currencyKey: "currency" },
    { key: "status", label: "Durum", format: "status" },
  ],
};
salesConfig.actions = [
  {label:"Düzenle",kind:"update",navigateTo:(row)=>`/sales-orders/${row.id}/edit`,visible:(row)=>String(row.status)==="Draft"},
  {label:"Sil",kind:"delete",method:"delete",endpoint:(row)=>`/api/sales-orders/${row.id}`,confirm:"Taslak satış siparişi kalıcı olarak silinsin mi?",variant:"destructive",visible:(row)=>String(row.status)==="Draft"},
];
export const priceConfig: ErpPageConfig = {
  pageKey: "price-lists",
  title: "Fiyatlandırma ve İskonto",
  eyebrow: "Ticari Kurallar",
  description:
    "Tarih, miktar, müşteri grubu ve öncelik bazlı fiyat listelerini yönetin.",
  endpoint: "/api/pricing/price-lists",
  accent: "rose",
  createLabel: "Yeni Fiyat Listesi",
  createPath: "/pricing/price-lists/new",
  columns: [
    id,
    { key: "code", label: "Liste Kodu" },
    { key: "name", label: "Liste Adı" },
    { key: "currency", label: "Para Birimi" },
    { key: "validFrom", label: "Başlangıç", format: "date" },
    { key: "validTo", label: "Bitiş", format: "date" },
    { key: "priority", label: "Öncelik" },
    { key: "isDefault", label: "Varsayılan", format: "boolean" },
    { key: "isActive", label: "Durum", format: "boolean" },
  ],
};
// Price list master data is editable; referenced/default lists are protected by the API.
priceConfig.actions = [
  {label:"Düzenle",kind:"update",navigateTo:(row)=>`/pricing/price-lists/${row.id}/edit`},
  {label:"Sil",kind:"delete",method:"delete",endpoint:(row)=>`/api/pricing/price-lists/${row.id}`,confirm:"Fiyat listesi kalıcı olarak silinsin mi? Satırı veya kullanımı olan liste silinemez.",variant:"destructive"},
];
export const shipmentConfig: ErpPageConfig = {
  pageKey: "shipments",
  title: "Sevk ve İrsaliye",
  eyebrow: "Giden Lojistik",
  description:
    "Toplama, paketleme, stok çıkışı ve e-İrsaliye durumlarını yönetin.",
  endpoint: "/api/shipments",
  accent: "amber",
  createLabel: "Yeni Sevk",
  createPath: "/shipments/new",
  columns: [
    id,
    { key: "shipmentNumber", label: "Sevk No" },
    { key: "orderNumber", label: "Satış Siparişi" },
    { key: "customerName", label: "Müşteri" },
    { key: "warehouseCode", label: "Depo" },
    { key: "shipmentDate", label: "Sevk Tarihi", format: "date" },
    { key: "status", label: "Sevk Durumu", format: "status" },
    { key: "deliveryNoteNumber", label: "İrsaliye No" },
    { key: "deliveryNoteStatus", label: "İrsaliye Durumu", format: "status" },
  ],
};
shipmentConfig.actions = [
  {label:"Düzenle",kind:"update",navigateTo:(row)=>`/shipments/${row.id}/edit`,visible:(row)=>String(row.status)==="Draft"},
  {label:"Sil",kind:"delete",method:"delete",endpoint:(row)=>`/api/shipments/${row.id}`,confirm:"Taslak sevk kaydı kalıcı olarak silinsin mi?",variant:"destructive",visible:(row)=>String(row.status)==="Draft"},
];
export const countConfig: ErpPageConfig = {
  pageKey: "inventory-counts",
  title: "Sayım ve Stok Düzeltme",
  eyebrow: "Stok Kontrol",
  description:
    "Kör sayım, fark onayı ve ters kayıtla denetlenebilir stok düzeltmeleri.",
  endpoint: "/api/inventory-counts",
  accent: "cyan",
  createLabel: "Yeni Sayım",
  createPath: "/inventory-counts/new",
  columns: [
    id,
    { key: "countNumber", label: "Sayım No" },
    { key: "warehouseCode", label: "Depo" },
    { key: "countDate", label: "Sayım Tarihi", format: "date" },
    { key: "isBlindCount", label: "Kör Sayım", format: "boolean" },
    { key: "lineCount", label: "Satır Sayısı" },
    { key: "totalDifference", label: "Toplam Fark", format: "number" },
    { key: "status", label: "Durum", format: "status" },
  ],
};
// Count documents can only be changed while they are drafts.
countConfig.actions = [
  {label:"Düzenle",kind:"update",navigateTo:(row)=>`/inventory-counts/${row.id}/edit`,visible:(row)=>String(row.status)==="Draft"},
  {label:"Sil",kind:"delete",method:"delete",endpoint:(row)=>`/api/inventory-counts/${row.id}`,confirm:"Taslak sayım kalıcı olarak silinsin mi?",variant:"destructive",visible:(row)=>String(row.status)==="Draft"},
];
export const eDocumentConfig: ErpPageConfig = {
  pageKey: "e-documents",
  title: "E-İrsaliye / E-Fatura",
  eyebrow: "CRS Soft E-Dönüşüm",
  description:
    "UBL belgeleri, gönderim kuyruğu, sağlayıcı yanıtları ve hata geçmişi.",
  endpoint: "/api/e-documents",
  accent: "rose",
  columns: [
    id,
    { key: "uuid", label: "UUID" },
    { key: "documentNumber", label: "Belge No" },
    { key: "documentType", label: "Belge Tipi", format: "status" },
    { key: "direction", label: "Yön", format: "status" },
    { key: "issueDate", label: "Düzenleme Tarihi", format: "datetime" },
    { key: "scenario", label: "Senaryo" },
    { key: "status", label: "Durum", format: "status" },
    { key: "attemptCount", label: "Deneme" },
    { key: "providerDocumentId", label: "Provider ID" },
    { key: "lastErrorMessage", label: "Son Hata" },
  ],
};
export const accountConfig: ErpPageConfig = {
  pageKey: "ledger-accounts",
  title: "Hesap Planı",
  eyebrow: "Muhasebe",
  description:
    "Hesap hiyerarşisi, kayıt izni ve para birimi tanımlarını yönetin.",
  endpoint: "/api/accounting/accounts",
  accent: "violet",
  createLabel: "Yeni Hesap",
  createPath: "/accounting/accounts/new",
  columns: [
    id,
    { key: "code", label: "Hesap Kodu" },
    { key: "name", label: "Hesap Adı" },
    { key: "accountType", label: "Hesap Tipi", format: "status" },
    { key: "allowPosting", label: "Kayıt İzni", format: "boolean" },
    { key: "currencyCode", label: "Para Birimi" },
    { key: "isActive", label: "Durum", format: "boolean" },
  ],
  actions: [
    {label:"Düzenle",kind:"update",navigateTo:(row)=>`/accounting/accounts/${row.id}/edit`},
    {label:"Sil",kind:"delete",method:"delete",endpoint:(row)=>`/api/accounting/accounts/${row.id}`,confirm:"Muhasebe hesabı kalıcı olarak silinsin mi? Hareketi olan hesaplar silinemez.",variant:"destructive"},
  ],
};
export const journalConfig: ErpPageConfig = {
  pageKey: "journal-entries",
  title: "Muhasebe Fişleri",
  eyebrow: "Muhasebe ve Maliyet",
  description:
    "Dengeli borç/alacak fişleri ve kaynak belge bağlantılarını yönetin.",
  endpoint: "/api/accounting/journals",
  accent: "violet",
  createLabel: "Yeni Fiş",
  createPath: "/accounting/journals/new",
  columns: [
    id,
    { key: "journalNumber", label: "Fiş No" },
    { key: "postingDate", label: "Kayıt Tarihi", format: "date" },
    { key: "sourceType", label: "Kaynak Tipi" },
    { key: "sourceNumber", label: "Kaynak No" },
    { key: "description", label: "Açıklama" },
    { key: "currencyCode", label: "Para Birimi" },
    { key: "debit", label: "Borç", format: "money", currencyKey: "currencyCode" },
    { key: "credit", label: "Alacak", format: "money", currencyKey: "currencyCode" },
    { key: "status", label: "Durum", format: "status" },
  ],
};
export const importDossierConfig: ErpPageConfig = {
  pageKey: "import-dossiers",
  title: "İthalat Dosyaları",
  eyebrow: "İthalat Maliyetlendirme",
  description: "Mal kabul sırasında otomatik açılan ithalat dosyalarına navlun, gümrük ve diğer maliyetleri ekleyip stok maliyetine dağıtın.",
  endpoint: "/api/import-dossiers",
  accent: "cyan",
  columns: [
    id,
    { key: "dossierNumber", label: "Dosya No" },
    { key: "supplier", label: "Tedarikçi" },
    { key: "currencyCode", label: "Döviz" },
    { key: "incotermCode", label: "Teslim Şekli" },
    { key: "openDate", label: "Açılış Tarihi", format: "date" },
    { key: "goodsReceiptNumber", label: "Mal Kabul No" },
    { key: "receiptDate", label: "Mal Kabul Tarihi", format: "date" },
    { key: "matchedAt", label: "Eşleme Tarihi", format: "datetime" },
    { key: "receiptCount", label: "Mal Kabul Sayısı", format: "number" },
    { key: "status", label: "Durum", format: "status" },
    { key: "lineCount", label: "Satır Sayısı", format: "number" },
    { key: "goodsAmount", label: "Döviz Mal Bedeli", format: "money", currencyKey: "currencyCode" },
    { key: "goodsAmountLocal", label: "Yerel Mal Bedeli", format: "money" },
    { key: "landedCostAmount", label: "İthalat Masrafı", format: "money" },
    { key: "finalAmount", label: "Gerçek Maliyet", format: "money" },
  ],
  actions: [
    { label: "Dosya Kokpiti", navigateTo: (row) => `/import-dossiers/${row.id}` },
    { label: "Masraf Ekle", navigateTo: (row) => `/import-dossiers/${row.id}/costs/new`, visible: (row) => !["Finalized","Closed","Cancelled"].includes(String(row.status)) },
    { label: "Masrafları Dağıt", endpoint: (row) => `/api/import-dossiers/${row.id}/allocate`, confirm: "Dosyadaki masraflar seçili dağıtım anahtarlarıyla yeniden hesaplansın mı?", visible: (row) => !["Finalized","Closed","Cancelled"].includes(String(row.status)) },
    { label: "Maliyeti Kesinleştir", endpoint: (row) => `/api/import-dossiers/${row.id}/finalize`, body: () => ({ postingDate: new Date().toISOString().slice(0,10), fiscalPeriodId: null, inventoryAccountId: null, consumedVarianceAccountId: null, clearingAccountId: null }), confirm: "Gerçek maliyet stok hareketlerine ve açık maliyet katmanlarına işlensin mi? Bu işlemden sonra dosya değiştirilemez.", visible: (row) => String(row.status) === "Allocated" },
  ],
};
export const landedCostTypeConfig: ErpPageConfig = {
  pageKey: "landed-cost-types",
  title: "İthalat Masraf Tanımları",
  eyebrow: "İthalat Maliyetlendirme Tanımları",
  description: "Navlun, sigorta, gümrük, ardiye ve diğer masrafların dağıtım ve muhasebe kurallarını tanımlayın.",
  endpoint: "/api/import-dossiers/cost-types",
  accent: "cyan",
  createLabel: "Yeni Masraf Türü",
  createPath: "/import-dossiers/definitions/cost-types/new",
  columns: [id,{key:"code",label:"Kod"},{key:"name",label:"Ad"},{key:"allocationMethod",label:"Dağıtım Anahtarı",format:"status"},{key:"includeInCustomsValue",label:"Gümrük Kıymetine Dahil",format:"boolean"},{key:"capitalizeToInventory",label:"Stok Maliyetine Ekle",format:"boolean"},{key:"clearingAccountId",label:"Mahsup Hesabı",format:"id"},{key:"varianceAccountId",label:"Fark Hesabı",format:"id"},{key:"isDefault",label:"Varsayılan",format:"boolean"},{key:"isActive",label:"Aktif",format:"boolean"}],
  actions: [
    {label:"Düzenle",kind:"update",navigateTo:(row)=>`/import-dossiers/definitions/cost-types/${row.id}/edit`},
    {label:"Sil",kind:"delete",method:"delete",endpoint:(row)=>`/api/import-dossiers/cost-types/${row.id}`,confirm:"Masraf türü kalıcı olarak silinsin mi?",variant:"destructive"},
  ],
};
export const tradeDossierConfig: ErpPageConfig = {
  pageKey: "trade-dossiers", title: "Dış Ticaret Dosyaları", eyebrow: "İthalat ve İhracat Operasyonları",
  description: "Siparişten gümrük çıkışına kadar beyanname, antrepo, belge, mal kabul ve sevkiyat bağlantılarını tek dosyada izleyin.",
  endpoint: "/api/trade-dossiers", accent: "cyan", createLabel: "Yeni Dış Ticaret Dosyası", createPath: "/trade-dossiers/new",
  columns: [id,{key:"dossierNumber",label:"Dosya No"},{key:"direction",label:"Yön",format:"status"},{key:"operationType",label:"İşlem Türü",format:"status"},{key:"businessPartner",label:"İlgili Cari"},{key:"currencyCode",label:"Döviz"},{key:"incotermCode",label:"Teslim Şekli"},{key:"openDate",label:"Açılış",format:"date"},{key:"estimatedArrivalDate",label:"Tahmini Varış",format:"date"},{key:"status",label:"Gümrük Durumu",format:"status"},{key:"declarationCount",label:"Beyanname",format:"number"},{key:"linkedDocumentCount",label:"Bağlı Belge",format:"number"},{key:"customsWaitingHours",label:"Bekleme (saat)",format:"number"}],
  actions:[{label:"Dosyayı Aç",icon:"open",navigateTo:(row)=>`/trade-dossiers/${row.id}`}]
};
