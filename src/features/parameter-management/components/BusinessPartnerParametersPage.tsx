import {
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Binary,
  Building2,
  CheckCircle2,
  Hash,
  Save,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberFormatBuilder } from "@/components/shared/NumberFormatBuilder";
import { useAuthStore } from "@/stores/auth-store";
import { ErpLookupCombobox } from "@/features/erp-form-management/ErpLookupCombobox";
interface Parameters {
  branchId: number | null;
  isAutomatic: boolean;
  allowManual: boolean;
  format: string;
  nextNumber: number;
  incrementBy: number;
  minimumNumber: number;
  maximumNumber: number;
  isContinuous: boolean;
  forceUppercase: boolean;
  trimWhitespace: boolean;
  requireTaxNumber: boolean;
  requireTaxOffice: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  requireNationalIdentityNumber: boolean;
  preventDuplicateTaxNumber: boolean;
  preventDuplicateNationalIdentityNumber: boolean;
  preventDuplicateEmail: boolean;
  defaultBusinessPartnerTypeId: number | null;
  defaultCustomerGroupId: number | null;
  defaultPaymentTermId: number | null;
  defaultCurrencyId: number | null;
  defaultTaxGroupId: number | null;
  defaultCreditLimit: number;
  defaultUnlimitedCredit: boolean;
  createActiveByDefault: boolean;
  preview: string;
}
interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}
interface DefinitionItem {
  id: number;
  code: string;
  name: string;
  isDefault: boolean;
}
interface Definitions {
  partnerTypes: DefinitionItem[];
  customerGroups: DefinitionItem[];
  paymentTerms: DefinitionItem[];
  currencies: DefinitionItem[];
  taxGroups: DefinitionItem[];
}
type Texts = {
  title: string;
  eyebrow: string;
  description: string;
  scope: string;
  global: string;
  branch: string;
  numbering: string;
  automatic: string;
  automaticHint: string;
  manual: string;
  manualHint: string;
  format: string;
  tokens: string;
  next: string;
  increment: string;
  minimum: string;
  maximum: string;
  continuous: string;
  continuousHint: string;
  normalization: string;
  uppercase: string;
  trim: string;
  preview: string;
  save: string;
  saving: string;
  saved: string;
  loadError: string;
  saveError: string;
};
const translations: Record<string, Texts> = {
  tr: {
    title: "Cari Parametreleri",
    eyebrow: "Cari İşlemleri",
    description:
      "Cari kod üretimi, numara serisi ve veri normalizasyon kurallarını yönetin.",
    scope: "Parametre kapsamı",
    global: "Tüm şubeler",
    branch: "Aktif şube",
    numbering: "Cari kodu ve numara serisi",
    automatic: "Cari kodunu otomatik üret",
    automaticHint:
      "Kod boş bırakıldığında tanımlı maskeden güvenli ve benzersiz kod üretir.",
    manual: "Manuel koda izin ver",
    manualHint:
      "Yetkili kullanıcılar otomatik seri yerine kendi cari kodunu girebilir.",
    format: "Kod maskesi",
    tokens:
      "Kullanılabilir parçalar: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "Sonraki numara",
    increment: "Artış",
    minimum: "Alt sınır",
    maximum: "Üst sınır",
    continuous: "Kesintisiz seri",
    continuousHint: "Yasal zorunluluk yoksa performans için kapalı tutun.",
    normalization: "Kod normalizasyonu",
    uppercase: "Büyük harfe dönüştür",
    trim: "Baş/son boşlukları temizle",
    preview: "Sonraki kod önizlemesi",
    save: "Parametreleri kaydet",
    saving: "Kaydediliyor...",
    saved: "Cari parametreleri kaydedildi.",
    loadError: "Cari parametreleri yüklenemedi.",
    saveError: "Cari parametreleri kaydedilemedi.",
  },
  en: {
    title: "Business Partner Parameters",
    eyebrow: "Business Partners",
    description:
      "Manage business partner code generation, number sequence and normalization rules.",
    scope: "Parameter scope",
    global: "All branches",
    branch: "Active branch",
    numbering: "Code and number sequence",
    automatic: "Generate code automatically",
    automaticHint:
      "Generates a safe unique code from the mask when code is empty.",
    manual: "Allow manual code",
    manualHint:
      "Authorized users may enter their own code instead of the sequence.",
    format: "Code mask",
    tokens:
      "Available tokens: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "Next number",
    increment: "Increment",
    minimum: "Minimum",
    maximum: "Maximum",
    continuous: "Continuous sequence",
    continuousHint: "Keep disabled for performance unless legally required.",
    normalization: "Code normalization",
    uppercase: "Convert to uppercase",
    trim: "Trim surrounding spaces",
    preview: "Next code preview",
    save: "Save parameters",
    saving: "Saving...",
    saved: "Business partner parameters saved.",
    loadError: "Parameters could not be loaded.",
    saveError: "Parameters could not be saved.",
  },
  de: {
    title: "Geschäftspartnerparameter",
    eyebrow: "Geschäftspartner",
    description: "Codegenerierung, Nummernfolge und Normalisierung verwalten.",
    scope: "Parameterbereich",
    global: "Alle Niederlassungen",
    branch: "Aktive Niederlassung",
    numbering: "Code und Nummernfolge",
    automatic: "Code automatisch erzeugen",
    automaticHint:
      "Erzeugt bei leerem Code einen eindeutigen Code aus der Maske.",
    manual: "Manuellen Code erlauben",
    manualHint: "Berechtigte Benutzer können einen eigenen Code eingeben.",
    format: "Codemaske",
    tokens:
      "Verfügbare Token: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "Nächste Nummer",
    increment: "Schritt",
    minimum: "Minimum",
    maximum: "Maximum",
    continuous: "Lückenlose Folge",
    continuousHint: "Nur bei gesetzlicher Pflicht aktivieren.",
    normalization: "Codenormalisierung",
    uppercase: "In Großbuchstaben",
    trim: "Leerzeichen entfernen",
    preview: "Vorschau",
    save: "Parameter speichern",
    saving: "Wird gespeichert...",
    saved: "Parameter gespeichert.",
    loadError: "Parameter konnten nicht geladen werden.",
    saveError: "Parameter konnten nicht gespeichert werden.",
  },
  fr: {
    title: "Paramètres des tiers",
    eyebrow: "Tiers",
    description:
      "Gérez la génération du code, la séquence et la normalisation.",
    scope: "Portée",
    global: "Toutes les agences",
    branch: "Agence active",
    numbering: "Code et séquence",
    automatic: "Générer automatiquement",
    automaticHint: "Génère un code unique à partir du masque.",
    manual: "Autoriser le code manuel",
    manualHint: "Les utilisateurs autorisés peuvent saisir un code.",
    format: "Masque du code",
    tokens: "Jetons: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "Numéro suivant",
    increment: "Incrément",
    minimum: "Minimum",
    maximum: "Maximum",
    continuous: "Séquence continue",
    continuousHint: "Activez uniquement si la loi l’exige.",
    normalization: "Normalisation",
    uppercase: "Convertir en majuscules",
    trim: "Supprimer les espaces",
    preview: "Aperçu",
    save: "Enregistrer",
    saving: "Enregistrement...",
    saved: "Paramètres enregistrés.",
    loadError: "Chargement impossible.",
    saveError: "Enregistrement impossible.",
  },
  es: {
    title: "Parámetros de terceros",
    eyebrow: "Terceros",
    description:
      "Gestione la generación de códigos, secuencia y normalización.",
    scope: "Ámbito",
    global: "Todas las sucursales",
    branch: "Sucursal activa",
    numbering: "Código y secuencia",
    automatic: "Generar automáticamente",
    automaticHint: "Genera un código único desde la máscara.",
    manual: "Permitir código manual",
    manualHint: "Usuarios autorizados pueden escribir su código.",
    format: "Máscara",
    tokens: "Variables: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "Número siguiente",
    increment: "Incremento",
    minimum: "Mínimo",
    maximum: "Máximo",
    continuous: "Secuencia continua",
    continuousHint: "Active solo por obligación legal.",
    normalization: "Normalización",
    uppercase: "Convertir a mayúsculas",
    trim: "Quitar espacios",
    preview: "Vista previa",
    save: "Guardar",
    saving: "Guardando...",
    saved: "Parámetros guardados.",
    loadError: "No se pudieron cargar.",
    saveError: "No se pudieron guardar.",
  },
  it: {
    title: "Parametri anagrafica",
    eyebrow: "Anagrafiche",
    description: "Gestisci generazione codice, sequenza e normalizzazione.",
    scope: "Ambito",
    global: "Tutte le filiali",
    branch: "Filiale attiva",
    numbering: "Codice e sequenza",
    automatic: "Genera automaticamente",
    automaticHint: "Genera un codice univoco dalla maschera.",
    manual: "Consenti codice manuale",
    manualHint: "Gli utenti autorizzati possono inserire un codice.",
    format: "Maschera",
    tokens: "Token: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "Numero successivo",
    increment: "Incremento",
    minimum: "Minimo",
    maximum: "Massimo",
    continuous: "Sequenza continua",
    continuousHint: "Attivare solo se richiesto dalla legge.",
    normalization: "Normalizzazione",
    uppercase: "Maiuscolo",
    trim: "Rimuovi spazi",
    preview: "Anteprima",
    save: "Salva",
    saving: "Salvataggio...",
    saved: "Parametri salvati.",
    loadError: "Caricamento non riuscito.",
    saveError: "Salvataggio non riuscito.",
  },
  pt: {
    title: "Parâmetros de parceiros",
    eyebrow: "Parceiros",
    description: "Gerencie código, sequência e normalização.",
    scope: "Escopo",
    global: "Todas as filiais",
    branch: "Filial ativa",
    numbering: "Código e sequência",
    automatic: "Gerar automaticamente",
    automaticHint: "Gera código único pela máscara.",
    manual: "Permitir código manual",
    manualHint: "Usuários autorizados podem informar o código.",
    format: "Máscara",
    tokens: "Tokens: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "Próximo número",
    increment: "Incremento",
    minimum: "Mínimo",
    maximum: "Máximo",
    continuous: "Sequência contínua",
    continuousHint: "Ative apenas por exigência legal.",
    normalization: "Normalização",
    uppercase: "Converter em maiúsculas",
    trim: "Remover espaços",
    preview: "Prévia",
    save: "Salvar",
    saving: "Salvando...",
    saved: "Parâmetros salvos.",
    loadError: "Falha ao carregar.",
    saveError: "Falha ao salvar.",
  },
  nl: {
    title: "Relatieparameters",
    eyebrow: "Relaties",
    description: "Beheer codegeneratie, nummerreeks en normalisatie.",
    scope: "Bereik",
    global: "Alle vestigingen",
    branch: "Actieve vestiging",
    numbering: "Code en nummerreeks",
    automatic: "Automatisch genereren",
    automaticHint: "Genereert een unieke code uit het masker.",
    manual: "Handmatige code toestaan",
    manualHint: "Bevoegde gebruikers mogen een code invoeren.",
    format: "Codemasker",
    tokens: "Tokens: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "Volgend nummer",
    increment: "Stap",
    minimum: "Minimum",
    maximum: "Maximum",
    continuous: "Doorlopende reeks",
    continuousHint: "Alleen activeren indien wettelijk vereist.",
    normalization: "Normalisatie",
    uppercase: "Hoofdletters",
    trim: "Spaties verwijderen",
    preview: "Voorbeeld",
    save: "Opslaan",
    saving: "Opslaan...",
    saved: "Parameters opgeslagen.",
    loadError: "Laden mislukt.",
    saveError: "Opslaan mislukt.",
  },
  pl: {
    title: "Parametry kontrahenta",
    eyebrow: "Kontrahenci",
    description: "Zarządzaj kodem, sekwencją i normalizacją.",
    scope: "Zakres",
    global: "Wszystkie oddziały",
    branch: "Aktywny oddział",
    numbering: "Kod i sekwencja",
    automatic: "Generuj automatycznie",
    automaticHint: "Generuje unikalny kod z maski.",
    manual: "Zezwól na kod ręczny",
    manualHint: "Uprawnieni użytkownicy mogą wpisać kod.",
    format: "Maska kodu",
    tokens: "Tokeny: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "Następny numer",
    increment: "Przyrost",
    minimum: "Minimum",
    maximum: "Maksimum",
    continuous: "Sekwencja ciągła",
    continuousHint: "Włącz tylko gdy wymaga tego prawo.",
    normalization: "Normalizacja",
    uppercase: "Wielkie litery",
    trim: "Usuń spacje",
    preview: "Podgląd",
    save: "Zapisz",
    saving: "Zapisywanie...",
    saved: "Parametry zapisane.",
    loadError: "Nie można wczytać.",
    saveError: "Nie można zapisać.",
  },
  ru: {
    title: "Параметры контрагента",
    eyebrow: "Контрагенты",
    description: "Управление кодом, последовательностью и нормализацией.",
    scope: "Область",
    global: "Все филиалы",
    branch: "Активный филиал",
    numbering: "Код и последовательность",
    automatic: "Создавать автоматически",
    automaticHint: "Создаёт уникальный код по маске.",
    manual: "Разрешить ручной код",
    manualHint: "Авторизованные пользователи могут ввести код.",
    format: "Маска",
    tokens: "Токены: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "Следующий номер",
    increment: "Шаг",
    minimum: "Минимум",
    maximum: "Максимум",
    continuous: "Непрерывная серия",
    continuousHint: "Включайте только по закону.",
    normalization: "Нормализация",
    uppercase: "В верхний регистр",
    trim: "Удалить пробелы",
    preview: "Предпросмотр",
    save: "Сохранить",
    saving: "Сохранение...",
    saved: "Параметры сохранены.",
    loadError: "Ошибка загрузки.",
    saveError: "Ошибка сохранения.",
  },
  ar: {
    title: "معلمات الحسابات",
    eyebrow: "الحسابات",
    description: "إدارة إنشاء الرمز والتسلسل والتطبيع.",
    scope: "النطاق",
    global: "كل الفروع",
    branch: "الفرع النشط",
    numbering: "الرمز والتسلسل",
    automatic: "إنشاء تلقائي",
    automaticHint: "ينشئ رمزاً فريداً من القناع.",
    manual: "السماح بالرمز اليدوي",
    manualHint: "يمكن للمستخدم المخول إدخال رمز.",
    format: "قناع الرمز",
    tokens: "الرموز: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "الرقم التالي",
    increment: "الزيادة",
    minimum: "الحد الأدنى",
    maximum: "الحد الأقصى",
    continuous: "تسلسل مستمر",
    continuousHint: "يُفعّل فقط عند المتطلبات القانونية.",
    normalization: "تطبيع الرمز",
    uppercase: "تحويل لأحرف كبيرة",
    trim: "إزالة المسافات",
    preview: "معاينة",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    saved: "تم حفظ المعلمات.",
    loadError: "تعذر التحميل.",
    saveError: "تعذر الحفظ.",
  },
  fa: {
    title: "پارامترهای طرف حساب",
    eyebrow: "طرف حساب‌ها",
    description: "مدیریت کد، توالی و نرمال‌سازی.",
    scope: "دامنه",
    global: "همه شعب",
    branch: "شعبه فعال",
    numbering: "کد و توالی",
    automatic: "تولید خودکار",
    automaticHint: "کد یکتا از الگو تولید می‌کند.",
    manual: "اجازه کد دستی",
    manualHint: "کاربر مجاز می‌تواند کد وارد کند.",
    format: "الگوی کد",
    tokens: "توکن‌ها: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "شماره بعدی",
    increment: "افزایش",
    minimum: "حداقل",
    maximum: "حداکثر",
    continuous: "توالی پیوسته",
    continuousHint: "فقط در صورت الزام قانونی فعال شود.",
    normalization: "نرمال‌سازی",
    uppercase: "حروف بزرگ",
    trim: "حذف فاصله‌ها",
    preview: "پیش‌نمایش",
    save: "ذخیره",
    saving: "در حال ذخیره...",
    saved: "پارامترها ذخیره شد.",
    loadError: "بارگذاری ناموفق بود.",
    saveError: "ذخیره ناموفق بود.",
  },
  ja: {
    title: "取引先パラメータ",
    eyebrow: "取引先",
    description: "コード生成、採番、正規化を管理します。",
    scope: "適用範囲",
    global: "全支店",
    branch: "現在の支店",
    numbering: "コードと採番",
    automatic: "自動生成",
    automaticHint: "マスクから一意のコードを生成します。",
    manual: "手動コードを許可",
    manualHint: "権限ユーザーがコードを入力できます。",
    format: "コードマスク",
    tokens: "トークン: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "次の番号",
    increment: "増分",
    minimum: "最小",
    maximum: "最大",
    continuous: "連続採番",
    continuousHint: "法的要件がある場合のみ有効化。",
    normalization: "正規化",
    uppercase: "大文字に変換",
    trim: "空白を削除",
    preview: "プレビュー",
    save: "保存",
    saving: "保存中...",
    saved: "保存しました。",
    loadError: "読み込めませんでした。",
    saveError: "保存できませんでした。",
  },
  ko: {
    title: "거래처 매개변수",
    eyebrow: "거래처",
    description: "코드 생성, 번호 순서 및 정규화를 관리합니다.",
    scope: "범위",
    global: "모든 지점",
    branch: "현재 지점",
    numbering: "코드 및 번호 순서",
    automatic: "자동 생성",
    automaticHint: "마스크에서 고유 코드를 생성합니다.",
    manual: "수동 코드 허용",
    manualHint: "권한 사용자가 코드를 입력할 수 있습니다.",
    format: "코드 마스크",
    tokens: "토큰: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "다음 번호",
    increment: "증가값",
    minimum: "최소",
    maximum: "최대",
    continuous: "연속 번호",
    continuousHint: "법적 요구 시에만 활성화하세요.",
    normalization: "정규화",
    uppercase: "대문자 변환",
    trim: "공백 제거",
    preview: "미리보기",
    save: "저장",
    saving: "저장 중...",
    saved: "저장되었습니다.",
    loadError: "불러올 수 없습니다.",
    saveError: "저장할 수 없습니다.",
  },
  zh: {
    title: "业务伙伴参数",
    eyebrow: "业务伙伴",
    description: "管理代码生成、编号序列和规范化。",
    scope: "参数范围",
    global: "所有分支",
    branch: "当前分支",
    numbering: "代码和编号序列",
    automatic: "自动生成",
    automaticHint: "根据掩码生成唯一代码。",
    manual: "允许手工代码",
    manualHint: "授权用户可以输入代码。",
    format: "代码掩码",
    tokens: "标记: {BRANCH}, {TYPE}, {YYYY}, {YY}, {MM}, {NUMBER:6}",
    next: "下一个编号",
    increment: "增量",
    minimum: "最小值",
    maximum: "最大值",
    continuous: "连续编号",
    continuousHint: "仅在法律要求时启用。",
    normalization: "代码规范化",
    uppercase: "转换为大写",
    trim: "清除空格",
    preview: "预览",
    save: "保存",
    saving: "保存中...",
    saved: "参数已保存。",
    loadError: "无法加载参数。",
    saveError: "无法保存参数。",
  },
};
type ExtraTexts = {
  defaultsTitle: string;
  defaultsDescription: string;
  partnerType: string;
  customerGroup: string;
  paymentTerm: string;
  currency: string;
  taxGroup: string;
  noDefault: string;
  search: string;
  creditLimit: string;
  unlimitedDefault: string;
  unlimitedHint: string;
  activeDefault: string;
  activeHint: string;
  requiredTitle: string;
  requiredDescription: string;
  taxRequired: string;
  taxOfficeRequired: string;
  emailRequired: string;
  phoneRequired: string;
  nationalRequired: string;
  duplicatesTitle: string;
  duplicatesDescription: string;
  duplicateTax: string;
  duplicateNational: string;
  duplicateEmail: string;
  recommended: string;
};
const extraKeys: (keyof ExtraTexts)[] = [
  "defaultsTitle",
  "defaultsDescription",
  "partnerType",
  "customerGroup",
  "paymentTerm",
  "currency",
  "taxGroup",
  "noDefault",
  "search",
  "creditLimit",
  "unlimitedDefault",
  "unlimitedHint",
  "activeDefault",
  "activeHint",
  "requiredTitle",
  "requiredDescription",
  "taxRequired",
  "taxOfficeRequired",
  "emailRequired",
  "phoneRequired",
  "nationalRequired",
  "duplicatesTitle",
  "duplicatesDescription",
  "duplicateTax",
  "duplicateNational",
  "duplicateEmail",
  "recommended",
];
const E = (values: string[]) =>
  Object.fromEntries(
    extraKeys.map((key, index) => [key, values[index]]),
  ) as ExtraTexts;
const extraTranslations: Record<string, ExtraTexts> = {
  tr: E([
    "Yeni caride kullanılacak hazır değerler",
    "Yeni cari açılırken bu alanlar otomatik seçilir; kullanıcı isterse değiştirebilir.",
    "Varsayılan cari tipi",
    "Varsayılan cari grubu",
    "Varsayılan ödeme koşulu",
    "Varsayılan para birimi",
    "Varsayılan vergi grubu",
    "Varsayılan seçme",
    "Seçeneklerde ara...",
    "Varsayılan kredi limiti",
    "Yeni cariyi sınırsız kredili aç",
    "Açık olursa yeni cari kartında kredi limiti yerine sınırsız kredi seçilir.",
    "Yeni cariyi aktif aç",
    "Kapalı olursa yeni cari kaydı oluşur fakat işlemlerde kullanılamaz.",
    "Zorunlu alan kuralları",
    "Açtığınız her seçenek, yeni cari kaydedilmeden önce ilgili bilginin girilmesini zorunlu yapar.",
    "Vergi numarası zorunlu",
    "Vergi dairesi zorunlu",
    "E-posta zorunlu",
    "Telefon veya cep telefonu zorunlu",
    "T.C. kimlik numarası zorunlu",
    "Mükerrer kayıt kontrolleri",
    "Açık olan kontroller aynı kritik bilgiyle ikinci bir cari açılmasını engeller.",
    "Aynı vergi numarasını engelle",
    "Aynı kimlik numarasını engelle",
    "Aynı e-postayı engelle",
    "Önerilen",
  ]),
  en: E([
    "Defaults for new records",
    "These values are selected automatically when a new business partner is opened and can still be changed by the user.",
    "Default partner type",
    "Default customer group",
    "Default payment term",
    "Default currency",
    "Default tax group",
    "No default",
    "Search options...",
    "Default credit limit",
    "Open new partners with unlimited credit",
    "When enabled, unlimited credit is selected instead of a credit limit.",
    "Open new partners as active",
    "When disabled, the record is created but cannot be used in transactions.",
    "Required field rules",
    "Every enabled option must be filled before a new business partner can be saved.",
    "Require tax number",
    "Require tax office",
    "Require email",
    "Require phone or mobile phone",
    "Require national identity number",
    "Duplicate record checks",
    "Enabled checks prevent a second partner from using the same critical information.",
    "Block duplicate tax number",
    "Block duplicate identity number",
    "Block duplicate email",
    "Recommended",
  ]),
  de: E([
    "Standardwerte für neue Datensätze",
    "Diese Werte werden bei einem neuen Geschäftspartner automatisch ausgewählt und können geändert werden.",
    "Standard-Partnertyp",
    "Standard-Kundengruppe",
    "Standard-Zahlungsbedingung",
    "Standardwährung",
    "Standard-Steuergruppe",
    "Kein Standard",
    "Optionen suchen...",
    "Standard-Kreditlimit",
    "Neue Partner mit unbegrenztem Kredit",
    "Bei Aktivierung wird unbegrenzter Kredit statt eines Limits gewählt.",
    "Neue Partner aktiv anlegen",
    "Bei Deaktivierung wird der Datensatz angelegt, kann aber nicht verwendet werden.",
    "Pflichtfeldregeln",
    "Jede aktivierte Angabe muss vor dem Speichern ausgefüllt werden.",
    "Steuernummer erforderlich",
    "Finanzamt erforderlich",
    "E-Mail erforderlich",
    "Telefon oder Mobiltelefon erforderlich",
    "Nationale ID erforderlich",
    "Duplikatprüfungen",
    "Aktive Prüfungen verhindern einen zweiten Partner mit denselben kritischen Daten.",
    "Doppelte Steuernummer sperren",
    "Doppelte ID sperren",
    "Doppelte E-Mail sperren",
    "Empfohlen",
  ]),
  fr: E([
    "Valeurs par défaut des nouvelles fiches",
    "Ces valeurs sont sélectionnées automatiquement et restent modifiables.",
    "Type de tiers par défaut",
    "Groupe client par défaut",
    "Condition de paiement par défaut",
    "Devise par défaut",
    "Groupe fiscal par défaut",
    "Aucune valeur",
    "Rechercher...",
    "Limite de crédit par défaut",
    "Crédit illimité par défaut",
    "Si activé, le crédit illimité remplace la limite de crédit.",
    "Créer les tiers actifs",
    "Si désactivé, la fiche est créée mais inutilisable dans les opérations.",
    "Règles des champs obligatoires",
    "Chaque option activée doit être renseignée avant l’enregistrement.",
    "Numéro fiscal obligatoire",
    "Centre fiscal obligatoire",
    "E-mail obligatoire",
    "Téléphone fixe ou mobile obligatoire",
    "Identifiant national obligatoire",
    "Contrôles des doublons",
    "Ces contrôles empêchent une deuxième fiche avec les mêmes informations critiques.",
    "Bloquer le numéro fiscal en double",
    "Bloquer l’identifiant en double",
    "Bloquer l’e-mail en double",
    "Recommandé",
  ]),
  es: E([
    "Valores predeterminados de nuevas fichas",
    "Se seleccionan automáticamente y el usuario puede cambiarlos.",
    "Tipo de socio predeterminado",
    "Grupo de clientes predeterminado",
    "Condición de pago predeterminada",
    "Moneda predeterminada",
    "Grupo fiscal predeterminado",
    "Sin valor predeterminado",
    "Buscar opciones...",
    "Límite de crédito predeterminado",
    "Crédito ilimitado por defecto",
    "Si se activa, se selecciona crédito ilimitado en lugar de un límite.",
    "Crear socios activos",
    "Si se desactiva, la ficha se crea pero no puede usarse en operaciones.",
    "Reglas de campos obligatorios",
    "Cada opción activada debe completarse antes de guardar.",
    "Número fiscal obligatorio",
    "Oficina fiscal obligatoria",
    "Correo obligatorio",
    "Teléfono fijo o móvil obligatorio",
    "Número de identidad obligatorio",
    "Controles de duplicados",
    "Evitan una segunda ficha con la misma información crítica.",
    "Bloquear número fiscal duplicado",
    "Bloquear identidad duplicada",
    "Bloquear correo duplicado",
    "Recomendado",
  ]),
  it: E([
    "Valori predefiniti per nuove anagrafiche",
    "Questi valori vengono selezionati automaticamente e possono essere modificati.",
    "Tipo partner predefinito",
    "Gruppo clienti predefinito",
    "Condizione di pagamento predefinita",
    "Valuta predefinita",
    "Gruppo fiscale predefinito",
    "Nessun predefinito",
    "Cerca opzioni...",
    "Limite di credito predefinito",
    "Credito illimitato predefinito",
    "Se attivo, viene selezionato credito illimitato al posto del limite.",
    "Crea nuovi partner attivi",
    "Se disattivo, la scheda viene creata ma non può essere usata.",
    "Regole dei campi obbligatori",
    "Ogni opzione attiva deve essere compilata prima del salvataggio.",
    "Codice fiscale obbligatorio",
    "Ufficio fiscale obbligatorio",
    "E-mail obbligatoria",
    "Telefono fisso o mobile obbligatorio",
    "Numero identificativo obbligatorio",
    "Controlli duplicati",
    "Impediscono una seconda scheda con gli stessi dati critici.",
    "Blocca codice fiscale duplicato",
    "Blocca identificativo duplicato",
    "Blocca e-mail duplicata",
    "Consigliato",
  ]),
  pt: E([
    "Valores padrão para novos cadastros",
    "São selecionados automaticamente e ainda podem ser alterados.",
    "Tipo de parceiro padrão",
    "Grupo de clientes padrão",
    "Condição de pagamento padrão",
    "Moeda padrão",
    "Grupo fiscal padrão",
    "Sem padrão",
    "Pesquisar opções...",
    "Limite de crédito padrão",
    "Crédito ilimitado por padrão",
    "Quando ativo, crédito ilimitado é selecionado no lugar do limite.",
    "Criar parceiros ativos",
    "Quando inativo, o cadastro é criado, mas não pode ser usado.",
    "Regras de campos obrigatórios",
    "Cada opção ativa deve ser preenchida antes de salvar.",
    "Número fiscal obrigatório",
    "Repartição fiscal obrigatória",
    "E-mail obrigatório",
    "Telefone fixo ou celular obrigatório",
    "Número de identificação obrigatório",
    "Verificações de duplicidade",
    "Impedem um segundo cadastro com os mesmos dados críticos.",
    "Bloquear número fiscal duplicado",
    "Bloquear identificação duplicada",
    "Bloquear e-mail duplicado",
    "Recomendado",
  ]),
  nl: E([
    "Standaardwaarden voor nieuwe relaties",
    "Deze waarden worden automatisch gekozen en kunnen nog worden gewijzigd.",
    "Standaard relatietype",
    "Standaard klantgroep",
    "Standaard betalingsvoorwaarde",
    "Standaardvaluta",
    "Standaard belastinggroep",
    "Geen standaard",
    "Opties zoeken...",
    "Standaard kredietlimiet",
    "Standaard onbeperkt krediet",
    "Indien actief wordt onbeperkt krediet gekozen in plaats van een limiet.",
    "Nieuwe relaties actief maken",
    "Indien uitgeschakeld wordt de relatie gemaakt maar niet gebruikt.",
    "Regels voor verplichte velden",
    "Elke actieve optie moet vóór het opslaan zijn ingevuld.",
    "Belastingnummer verplicht",
    "Belastingkantoor verplicht",
    "E-mail verplicht",
    "Telefoon of mobiel verplicht",
    "Identiteitsnummer verplicht",
    "Dubbele-recordcontroles",
    "Voorkomen een tweede relatie met dezelfde kritieke gegevens.",
    "Dubbel belastingnummer blokkeren",
    "Dubbel ID blokkeren",
    "Dubbele e-mail blokkeren",
    "Aanbevolen",
  ]),
  pl: E([
    "Wartości domyślne nowych kart",
    "Te wartości są wybierane automatycznie i nadal można je zmienić.",
    "Domyślny typ partnera",
    "Domyślna grupa klientów",
    "Domyślny termin płatności",
    "Domyślna waluta",
    "Domyślna grupa podatkowa",
    "Brak wartości domyślnej",
    "Szukaj opcji...",
    "Domyślny limit kredytowy",
    "Domyślnie kredyt bez limitu",
    "Po włączeniu wybierany jest kredyt bez limitu.",
    "Twórz nowych partnerów jako aktywnych",
    "Po wyłączeniu karta powstaje, ale nie może być używana.",
    "Reguły pól obowiązkowych",
    "Każda włączona opcja musi być uzupełniona przed zapisem.",
    "Numer podatkowy wymagany",
    "Urząd skarbowy wymagany",
    "E-mail wymagany",
    "Telefon lub komórka wymagane",
    "Numer identyfikacyjny wymagany",
    "Kontrole duplikatów",
    "Zapobiegają drugiej karcie z tymi samymi danymi krytycznymi.",
    "Blokuj powtórzony numer podatkowy",
    "Blokuj powtórzony identyfikator",
    "Blokuj powtórzony e-mail",
    "Zalecane",
  ]),
  ru: E([
    "Значения для новых карточек",
    "Эти значения выбираются автоматически, но пользователь может их изменить.",
    "Тип партнера по умолчанию",
    "Группа клиентов по умолчанию",
    "Условия оплаты по умолчанию",
    "Валюта по умолчанию",
    "Налоговая группа по умолчанию",
    "Без значения",
    "Поиск вариантов...",
    "Кредитный лимит по умолчанию",
    "Безлимитный кредит по умолчанию",
    "При включении выбирается безлимитный кредит.",
    "Создавать партнеров активными",
    "При выключении карточка создается, но не используется в операциях.",
    "Правила обязательных полей",
    "Каждый включенный параметр нужно заполнить до сохранения.",
    "Требовать налоговый номер",
    "Требовать налоговую инспекцию",
    "Требовать e-mail",
    "Требовать телефон или мобильный",
    "Требовать идентификационный номер",
    "Проверка дубликатов",
    "Предотвращает вторую карточку с теми же критическими данными.",
    "Запретить повторный налоговый номер",
    "Запретить повторный ID",
    "Запретить повторный e-mail",
    "Рекомендуется",
  ]),
  ar: E([
    "القيم الافتراضية للسجلات الجديدة",
    "تُحدد هذه القيم تلقائياً ويمكن للمستخدم تغييرها.",
    "نوع الشريك الافتراضي",
    "مجموعة العملاء الافتراضية",
    "شرط الدفع الافتراضي",
    "العملة الافتراضية",
    "المجموعة الضريبية الافتراضية",
    "بدون قيمة افتراضية",
    "البحث في الخيارات...",
    "حد الائتمان الافتراضي",
    "ائتمان غير محدود افتراضياً",
    "عند التفعيل يتم اختيار ائتمان غير محدود بدلاً من الحد.",
    "إنشاء الشركاء بحالة نشطة",
    "عند التعطيل يُنشأ السجل ولكن لا يمكن استخدامه.",
    "قواعد الحقول المطلوبة",
    "يجب تعبئة كل خيار مفعّل قبل حفظ الشريك.",
    "الرقم الضريبي مطلوب",
    "مكتب الضرائب مطلوب",
    "البريد الإلكتروني مطلوب",
    "الهاتف أو الجوال مطلوب",
    "رقم الهوية مطلوب",
    "فحوص التكرار",
    "تمنع إنشاء شريك ثانٍ بنفس المعلومات المهمة.",
    "منع تكرار الرقم الضريبي",
    "منع تكرار رقم الهوية",
    "منع تكرار البريد الإلكتروني",
    "موصى به",
  ]),
  fa: E([
    "مقادیر پیش‌فرض کارت‌های جدید",
    "این مقادیر خودکار انتخاب می‌شوند و کاربر می‌تواند آن‌ها را تغییر دهد.",
    "نوع پیش‌فرض شریک",
    "گروه پیش‌فرض مشتری",
    "شرط پرداخت پیش‌فرض",
    "ارز پیش‌فرض",
    "گروه مالیاتی پیش‌فرض",
    "بدون پیش‌فرض",
    "جستجوی گزینه‌ها...",
    "حد اعتبار پیش‌فرض",
    "اعتبار نامحدود به‌صورت پیش‌فرض",
    "با فعال‌سازی، اعتبار نامحدود به جای حد اعتبار انتخاب می‌شود.",
    "ایجاد شریک به‌صورت فعال",
    "در حالت غیرفعال، کارت ایجاد می‌شود اما قابل استفاده نیست.",
    "قوانین فیلدهای الزامی",
    "هر گزینه فعال باید پیش از ذخیره تکمیل شود.",
    "شماره مالیاتی الزامی",
    "اداره مالیات الزامی",
    "ایمیل الزامی",
    "تلفن یا همراه الزامی",
    "شماره شناسایی الزامی",
    "کنترل رکورد تکراری",
    "از ایجاد شریک دوم با اطلاعات مهم یکسان جلوگیری می‌کند.",
    "جلوگیری از شماره مالیاتی تکراری",
    "جلوگیری از شناسه تکراری",
    "جلوگیری از ایمیل تکراری",
    "پیشنهادی",
  ]),
  ja: E([
    "新規取引先の既定値",
    "新規作成時に自動選択され、ユーザーは変更できます。",
    "既定の取引先タイプ",
    "既定の顧客グループ",
    "既定の支払条件",
    "既定の通貨",
    "既定の税グループ",
    "既定値なし",
    "選択肢を検索...",
    "既定の与信限度額",
    "既定で無制限与信",
    "有効にすると限度額の代わりに無制限与信を選択します。",
    "新規取引先を有効にする",
    "無効の場合、カードは作成されますが取引で使用できません。",
    "必須項目ルール",
    "有効にした各項目は保存前に入力が必要です。",
    "税務番号を必須にする",
    "税務署を必須にする",
    "メールを必須にする",
    "電話または携帯を必須にする",
    "識別番号を必須にする",
    "重複チェック",
    "同じ重要情報を持つ二重登録を防ぎます。",
    "税務番号の重複を禁止",
    "識別番号の重複を禁止",
    "メールの重複を禁止",
    "推奨",
  ]),
  ko: E([
    "신규 거래처 기본값",
    "신규 생성 시 자동 선택되며 사용자가 변경할 수 있습니다.",
    "기본 거래처 유형",
    "기본 고객 그룹",
    "기본 결제 조건",
    "기본 통화",
    "기본 세금 그룹",
    "기본값 없음",
    "옵션 검색...",
    "기본 신용 한도",
    "기본 무제한 신용",
    "활성화하면 한도 대신 무제한 신용이 선택됩니다.",
    "신규 거래처를 활성 상태로 생성",
    "비활성화하면 카드는 생성되지만 거래에 사용할 수 없습니다.",
    "필수 필드 규칙",
    "활성화한 모든 항목은 저장 전에 입력해야 합니다.",
    "세금 번호 필수",
    "세무서 필수",
    "이메일 필수",
    "전화 또는 휴대폰 필수",
    "식별 번호 필수",
    "중복 레코드 검사",
    "동일한 중요 정보로 두 번째 거래처 생성을 막습니다.",
    "중복 세금 번호 차단",
    "중복 식별 번호 차단",
    "중복 이메일 차단",
    "권장",
  ]),
  zh: E([
    "新业务伙伴的默认值",
    "新建时自动选择，用户仍可修改。",
    "默认业务伙伴类型",
    "默认客户组",
    "默认付款条件",
    "默认币种",
    "默认税组",
    "无默认值",
    "搜索选项...",
    "默认信用额度",
    "默认无限信用",
    "启用后将选择无限信用而不是信用额度。",
    "新业务伙伴默认为启用",
    "关闭后会创建记录，但不能用于业务。",
    "必填字段规则",
    "每个启用的选项都必须在保存前填写。",
    "税号必填",
    "税务机关必填",
    "电子邮件必填",
    "电话或手机必填",
    "身份证号必填",
    "重复记录检查",
    "防止使用相同关键信息创建第二个业务伙伴。",
    "阻止重复税号",
    "阻止重复身份证号",
    "阻止重复电子邮件",
    "建议",
  ]),
};
export function BusinessPartnerParametersPage(): ReactElement {
  const { i18n } = useTranslation();
  const lang = i18n.language.split("-")[0];
  const text = {
    ...(translations[lang] ?? translations.en),
    ...(extraTranslations[lang] ?? extraTranslations.en),
  };
  const branch = useAuthStore((s) => s.branch);
  const client = useQueryClient();
  const [branchScope, setBranchScope] = useState(true);
  const [saving, setSaving] = useState(false);
  const branchId = branchScope ? Number(branch?.id ?? 0) : null;
  const query = useQuery({
    queryKey: ["business-partner-parameters", branchId],
    queryFn: async () => {
      const r = await api.get<Envelope<Parameters>>(
        "/api/parameters/business-partners",
        { params: { branchId } },
      );
      return r.data;
    },
  });
  const definitions = useQuery({
    queryKey: ["business-partner-parameter-definitions"],
    queryFn: async () => {
      const r = await api.get<Envelope<Definitions>>(
        "/api/business-partners/definitions",
      );
      return r.data;
    },
  });
  const [form, setForm] = useState<Parameters | null>(null);
  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);
  const set = <K extends keyof Parameters>(key: K, value: Parameters[K]) =>
    setForm((current) => (current ? { ...current, [key]: value } : current));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      setSaving(true);
      const r = await api.put<Envelope<Parameters>>(
        "/api/parameters/business-partners",
        { ...form, branchId },
      );
      setForm(r.data);
      await client.invalidateQueries({
        queryKey: ["business-partner-parameters"],
      });
      toast.success(text.saved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : text.saveError);
    } finally {
      setSaving(false);
    }
  };
  const lookup = <
    K extends
      | "defaultBusinessPartnerTypeId"
      | "defaultCustomerGroupId"
      | "defaultPaymentTermId"
      | "defaultCurrencyId"
      | "defaultTaxGroupId",
  >(
    key: K,
    lookupKey: string,
    items: DefinitionItem[] | undefined,
  ) => (
    <ErpLookupCombobox
      lookupKey={lookupKey}
      value={String(form?.[key] ?? "")}
      fallbackOptions={items ?? []}
      placeholder={text.noDefault}
      searchPlaceholder={text.search}
      onChange={(value) =>
        set(key, (value === "" ? null : value) as Parameters[K])
      }
    />
  );
  if (query.isLoading || !form)
    return <div className="metivon-panel rounded-3xl p-8">...</div>;
  if (query.isError)
    return (
      <div className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-700">
        {text.loadError}
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="metivon-hero rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-white/65">
              {text.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{text.title}</h1>
            <p className="mt-2 max-w-3xl text-white/75">{text.description}</p>
          </div>
          <Button
            type="submit"
            className="bg-white text-violet-950 hover:bg-white/90"
            disabled={saving}
          >
            <Save />
            {saving ? text.saving : text.save}
          </Button>
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-[1fr_1.4fr]">
        <section className="metivon-panel rounded-3xl border p-5 md:p-6">
          <Header icon={<Building2 />} title={text.scope} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Choice
              active={!branchScope}
              title={text.global}
              onClick={() => setBranchScope(false)}
            />
            <Choice
              active={branchScope}
              title={`${text.branch} · ${branch?.name ?? ""}`}
              onClick={() => setBranchScope(true)}
            />
          </div>
          <div className="metivon-brand-soft mt-5 rounded-2xl border p-4">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {text.preview}
            </p>
            <p className="mt-2 break-all font-mono text-2xl font-bold">
              {form.preview}
            </p>
          </div>
        </section>
        <section className="metivon-panel rounded-3xl border p-5 md:p-6">
          <Header icon={<Hash />} title={text.numbering} />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Toggle
              label={text.automatic}
              hint={text.automaticHint}
              checked={form.isAutomatic}
              onChange={(v) => set("isAutomatic", v)}
            />
            <Toggle
              label={text.manual}
              hint={text.manualHint}
              checked={form.allowManual}
              onChange={(v) => set("allowManual", v)}
            />
            <div className="md:col-span-2">
              <NumberFormatBuilder value={form.format} onChange={(value) => set("format", value)} allowedTokens={["BRANCH", "TYPE", "YYYY", "YY", "MM", "NUMBER"]} nextNumber={form.nextNumber} />
            </div>
            <NumberField
              label={text.next}
              value={form.nextNumber}
              onChange={(v) => set("nextNumber", v)}
            />
            <NumberField
              label={text.increment}
              value={form.incrementBy}
              onChange={(v) => set("incrementBy", v)}
            />
            <NumberField
              label={text.minimum}
              value={form.minimumNumber}
              onChange={(v) => set("minimumNumber", v)}
            />
            <NumberField
              label={text.maximum}
              value={form.maximumNumber}
              onChange={(v) => set("maximumNumber", v)}
            />
            <div className="md:col-span-2">
              <Toggle
                label={text.continuous}
                hint={text.continuousHint}
                checked={form.isContinuous}
                onChange={(v) => set("isContinuous", v)}
              />
            </div>
          </div>
        </section>
      </div>
      <section className="metivon-panel rounded-3xl border p-5 md:p-6">
        <Header icon={<Star />} title={text.defaultsTitle} />
        <p className="mt-2 text-sm text-muted-foreground">
          {text.defaultsDescription}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label={text.partnerType}>
            {lookup(
              "defaultBusinessPartnerTypeId",
              "businesspartnertypes",
              definitions.data?.partnerTypes,
            )}
          </Field>
          <Field label={text.customerGroup}>
            {lookup(
              "defaultCustomerGroupId",
              "customergroups",
              definitions.data?.customerGroups,
            )}
          </Field>
          <Field label={text.paymentTerm}>
            {lookup(
              "defaultPaymentTermId",
              "paymentterms",
              definitions.data?.paymentTerms,
            )}
          </Field>
          <Field label={text.currency}>
            {lookup(
              "defaultCurrencyId",
              "currencies",
              definitions.data?.currencies,
            )}
          </Field>
          <Field label={text.taxGroup}>
            {lookup(
              "defaultTaxGroupId",
              "taxgroups",
              definitions.data?.taxGroups,
            )}
          </Field>
          <NumberField
            label={text.creditLimit}
            value={form.defaultCreditLimit}
            onChange={(v) => set("defaultCreditLimit", v)}
          />
          <Toggle
            label={text.unlimitedDefault}
            hint={text.unlimitedHint}
            checked={form.defaultUnlimitedCredit}
            onChange={(v) => set("defaultUnlimitedCredit", v)}
          />
          <Toggle
            label={text.activeDefault}
            hint={text.activeHint}
            checked={form.createActiveByDefault}
            onChange={(v) => set("createActiveByDefault", v)}
          />
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="metivon-panel rounded-3xl border p-5 md:p-6">
          <Header icon={<UserCheck />} title={text.requiredTitle} />
          <p className="mt-2 text-sm text-muted-foreground">
            {text.requiredDescription}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Toggle
              label={text.taxRequired}
              checked={form.requireTaxNumber}
              onChange={(v) => set("requireTaxNumber", v)}
            />
            <Toggle
              label={text.taxOfficeRequired}
              checked={form.requireTaxOffice}
              onChange={(v) => set("requireTaxOffice", v)}
            />
            <Toggle
              label={text.emailRequired}
              checked={form.requireEmail}
              onChange={(v) => set("requireEmail", v)}
            />
            <Toggle
              label={text.phoneRequired}
              checked={form.requirePhone}
              onChange={(v) => set("requirePhone", v)}
            />
            <Toggle
              label={text.nationalRequired}
              checked={form.requireNationalIdentityNumber}
              onChange={(v) => set("requireNationalIdentityNumber", v)}
            />
          </div>
        </section>
        <section className="metivon-panel rounded-3xl border p-5 md:p-6">
          <Header icon={<ShieldCheck />} title={text.duplicatesTitle} />
          <p className="mt-2 text-sm text-muted-foreground">
            {text.duplicatesDescription}
          </p>
          <div className="mt-5 grid gap-3">
            <Toggle
              label={`${text.duplicateTax} · ${text.recommended}`}
              checked={form.preventDuplicateTaxNumber}
              onChange={(v) => set("preventDuplicateTaxNumber", v)}
            />
            <Toggle
              label={`${text.duplicateNational} · ${text.recommended}`}
              checked={form.preventDuplicateNationalIdentityNumber}
              onChange={(v) => set("preventDuplicateNationalIdentityNumber", v)}
            />
            <Toggle
              label={text.duplicateEmail}
              checked={form.preventDuplicateEmail}
              onChange={(v) => set("preventDuplicateEmail", v)}
            />
          </div>
        </section>
      </div>
      <section className="metivon-panel rounded-3xl border p-5 md:p-6">
        <Header icon={<Binary />} title={text.normalization} />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Toggle
            label={text.uppercase}
            checked={form.forceUppercase}
            onChange={(v) => set("forceUppercase", v)}
          />
          <Toggle
            label={text.trim}
            checked={form.trimWhitespace}
            onChange={(v) => set("trimWhitespace", v)}
          />
        </div>
      </section>
    </form>
  );
}
function Header({ icon, title }: { icon: ReactElement; title: string }) {
  return (
    <div className="flex items-center gap-3 text-lg font-semibold">
      <span className="metivon-brand-soft grid h-10 w-10 place-items-center rounded-xl">
        {icon}
      </span>
      {title}
    </div>
  );
}
function Choice({
  active,
  title,
  onClick,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border p-4 text-start transition ${active ? "metivon-brand-soft border-[var(--crm-brand-primary)]" : "hover:bg-muted/50"}`}
    >
      <CheckCircle2
        className={
          active ? "text-[var(--crm-brand-primary)]" : "text-muted-foreground"
        }
      />
      <span className="font-semibold">{title}</span>
    </button>
  );
}
function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block font-semibold">{label}</span>
        {hint ? (
          <span className="mt-1 block text-xs text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
    </label>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
