export const BRAND_THEME_STORAGE_KEY = 'vite-ui-brand-theme';

export const BRAND_THEME_LIST_ENABLED_STORAGE_KEY = 'vite-ui-brand-theme-list-enabled';

export const BRAND_THEME_LIST_SELECTION_STORAGE_KEY = 'vite-ui-brand-theme-list-selection';

export const APPEARANCE_BEFORE_BRAND_LIST_STORAGE_KEY = 'vite-ui-appearance-before-brand-list';

export const V3RII_APPEARANCE_OVERRIDE_STORAGE_KEY = 'vite-ui-v3rii-appearance-override';

export const BRAND_THEME_CLASS_PREFIX = 'theme-';

export type BrandThemeAppearance = 'light' | 'dark';

export const brandThemeIds = [
  'v3rii',
  'corporateBlue',
  'graphite',
  'emerald',
  'executive',
  'burgundy',
  'industrialSteel',
  'cleanLight',
  'highContrast',
  'minimalCrm',
  'flatNavy',
  'flatSlate',
  'flatWhite',
  'warmSand',
  'skyMist',
  'softRose',
  'oceanDepth',
  'midnightCyan',
  'forestNight',
  'aubergine',
  'carbonAmber',
  'cobaltNight',
  'northernLights',
  'arcticLight',
  'mintPaper',
  'lavenderMist',
  'peachOffice',
  'sageStudio',
  'blueprint',
  'solarizedLight',
  'windows95',
  'windowsXpLuna',
  'vistaAero',
  'windows7Glass',
  'windows11Mica',
  'teamRed',
  'teamBlue',
  'teamOrange',
  'teamPurple',
  'nordicPaper',
  'terminalGreen',
  'dosAmber',
  'retroOffice',
  'retroArcade',
  'retroY2k',
  'racingGreen',
  'cyberpunk',
  'synthwave',
  'auroraGlass',
  'holographic',
  'matrix',
  'sunsetDrive',
  'monochromeInk',
] as const;

export type BrandTheme = (typeof brandThemeIds)[number];

export type BrandThemeDefinition = {
  id: BrandTheme;
  label: string;
  description: string;
  className: string;
  appearance: BrandThemeAppearance;
  swatches: readonly [string, string, string];
};

export const brandThemes: readonly BrandThemeDefinition[] = [
  {
    id: 'v3rii',
    label: 'V3RII Neon',
    description: 'Mevcut pembe/turuncu marka enerjisi',
    className: 'theme-v3rii',
    appearance: 'dark',
    swatches: ['#ec007a', '#7c3aed', '#ff4b00'],
  },
  {
    id: 'corporateBlue',
    label: 'Kurumsal Lacivert',
    description: 'Finans, üretim ve B2B müşteriler için güven veren mavi',
    className: 'theme-corporate-blue',
    appearance: 'light',
    swatches: ['#1e3a8a', '#2563eb', '#06b6d4'],
  },
  {
    id: 'graphite',
    label: 'Grafit Gri',
    description: 'Sade, operasyonel ve az dikkat dağıtan tema',
    className: 'theme-graphite',
    appearance: 'dark',
    swatches: ['#111827', '#64748b', '#94a3b8'],
  },
  {
    id: 'emerald',
    label: 'Finans Yeşili',
    description: 'Güven, onay ve finans ekranları için yumuşak ton',
    className: 'theme-emerald',
    appearance: 'light',
    swatches: ['#065f46', '#10b981', '#2dd4bf'],
  },
  {
    id: 'executive',
    label: 'Premium Koyu',
    description: 'Lacivert, mor ve altın aksanlı üst seviye his',
    className: 'theme-executive',
    appearance: 'dark',
    swatches: ['#111827', '#6d28d9', '#f59e0b'],
  },
  {
    id: 'burgundy',
    label: 'Bordo Kurumsal',
    description: 'ERP ekranlarına yakın, ağır ve kurumsal his',
    className: 'theme-burgundy',
    appearance: 'dark',
    swatches: ['#7f1d1d', '#b91c1c', '#f97316'],
  },
  {
    id: 'industrialSteel',
    label: 'Endüstriyel Çelik',
    description: 'Üretim, stok ve fabrika operasyonları için metalik yapı',
    className: 'theme-industrial-steel',
    appearance: 'dark',
    swatches: ['#0f172a', '#475569', '#38bdf8'],
  },
  {
    id: 'cleanLight',
    label: 'Sade Açık',
    description: 'Gündüz kullanım ve yoğun veri girişi için göz yormayan yapı',
    className: 'theme-clean-light',
    appearance: 'light',
    swatches: ['#f8fafc', '#2563eb', '#14b8a6'],
  },
  {
    id: 'highContrast',
    label: 'Yüksek Kontrast',
    description: 'Net metin, belirgin sınırlar ve erişilebilir odak hissi',
    className: 'theme-high-contrast',
    appearance: 'dark',
    swatches: ['#020617', '#f8fafc', '#facc15'],
  },
  {
    id: 'minimalCrm',
    label: 'Minimal CRM',
    description: 'Daha az neon, daha çok operasyonel SaaS görünümü',
    className: 'theme-minimal-crm',
    appearance: 'light',
    swatches: ['#155e75', '#0f766e', '#64748b'],
  },
  {
    id: 'flatNavy',
    label: 'Düz Lacivert',
    description: 'Gradientsiz, net ve kurumsal lacivert arayüz',
    className: 'theme-flat-navy',
    appearance: 'dark',
    swatches: ['#1e3a8a', '#1e3a8a', '#1e3a8a'],
  },
  {
    id: 'flatSlate',
    label: 'Düz Grafit',
    description: 'Gradientsiz, sakin ve operasyonel yönetim paneli',
    className: 'theme-flat-slate',
    appearance: 'dark',
    swatches: ['#334155', '#334155', '#334155'],
  },
  {
    id: 'flatWhite',
    label: 'Düz Açık',
    description: 'Gradientsiz, aydınlık ve yoğun veri girişi odaklı tema',
    className: 'theme-flat-white',
    appearance: 'light',
    swatches: ['#f8fafc', '#2563eb', '#e2e8f0'],
  },
  {
    id: 'warmSand',
    label: 'Sıcak Kum',
    description: 'Sıcak bej tonlu, sakin ve ofis dostu açık arayüz',
    className: 'theme-warm-sand',
    appearance: 'light',
    swatches: ['#faf8f5', '#d97706', '#f59e0b'],
  },
  {
    id: 'skyMist',
    label: 'Gökyüzü Sisi',
    description: 'Hafif mavi-beyaz, ferah ve modern SaaS görünümü',
    className: 'theme-sky-mist',
    appearance: 'light',
    swatches: ['#f0f9ff', '#0ea5e9', '#7dd3fc'],
  },
  {
    id: 'softRose',
    label: 'Yumuşak Gül',
    description: 'Pembe-krem tonlu, yumuşak ve davetkar açık tema',
    className: 'theme-soft-rose',
    appearance: 'light',
    swatches: ['#fff1f2', '#ec4899', '#fda4af'],
  },
  {
    id: 'oceanDepth', label: 'Okyanus Derinliği', description: 'Gece operasyonları için derin mavi ve turkuaz',
    className: 'theme-ocean-depth', appearance: 'dark', swatches: ['#071a2b', '#0891b2', '#22d3ee'],
  },
  {
    id: 'midnightCyan', label: 'Gece Camgöbeği', description: 'Modern, teknik ve yüksek okunabilirlikli koyu tema',
    className: 'theme-midnight-cyan', appearance: 'dark', swatches: ['#08111f', '#06b6d4', '#67e8f9'],
  },
  {
    id: 'forestNight', label: 'Orman Gecesi', description: 'Stok ve üretim ekranları için doğal koyu tonlar',
    className: 'theme-forest-night', appearance: 'dark', swatches: ['#071a14', '#059669', '#6ee7b7'],
  },
  {
    id: 'aubergine', label: 'Patlıcan Moru', description: 'Yönetim ekranlarına özel sofistike mor gece teması',
    className: 'theme-aubergine', appearance: 'dark', swatches: ['#1f1028', '#a855f7', '#e879f9'],
  },
  {
    id: 'carbonAmber', label: 'Karbon Kehribar', description: 'Endüstriyel siyah yüzeyler ve sıcak uyarı aksanları',
    className: 'theme-carbon-amber', appearance: 'dark', swatches: ['#151515', '#f59e0b', '#fbbf24'],
  },
  {
    id: 'cobaltNight', label: 'Kobalt Gece', description: 'Kurumsal koyu lacivert ve canlı kobalt dengesi',
    className: 'theme-cobalt-night', appearance: 'dark', swatches: ['#0b1026', '#3b82f6', '#818cf8'],
  },
  {
    id: 'northernLights', label: 'Kuzey Işıkları', description: 'Yeşil, camgöbeği ve mor geçişli dinamik gece teması',
    className: 'theme-northern-lights', appearance: 'dark', swatches: ['#071321', '#14b8a6', '#8b5cf6'],
  },
  {
    id: 'arcticLight', label: 'Arktik Açık', description: 'Buz mavisi yüzeylerle ferah ve keskin gündüz modu',
    className: 'theme-arctic-light', appearance: 'light', swatches: ['#f4fbff', '#0284c7', '#a5f3fc'],
  },
  {
    id: 'mintPaper', label: 'Nane Kağıdı', description: 'Uzun veri girişleri için yumuşak nane ve beyaz',
    className: 'theme-mint-paper', appearance: 'light', swatches: ['#f4fbf7', '#059669', '#a7f3d0'],
  },
  {
    id: 'lavenderMist', label: 'Lavanta Sisi', description: 'Sakin mor tonlarla zarif ve düşük yorgunluklu görünüm',
    className: 'theme-lavender-mist', appearance: 'light', swatches: ['#faf7ff', '#7c3aed', '#ddd6fe'],
  },
  {
    id: 'peachOffice', label: 'Şeftali Ofis', description: 'Sıcak, davetkar ve günlük kullanıma uygun açık tema',
    className: 'theme-peach-office', appearance: 'light', swatches: ['#fff8f4', '#ea580c', '#fed7aa'],
  },
  {
    id: 'sageStudio', label: 'Adaçayı Stüdyo', description: 'Doğal gri-yeşil tonlarla dengeli çalışma alanı',
    className: 'theme-sage-studio', appearance: 'light', swatches: ['#f7f9f5', '#4d7c0f', '#d9f99d'],
  },
  {
    id: 'blueprint', label: 'Teknik Plan', description: 'Mühendislik ve proje ekipleri için teknik mavi tema',
    className: 'theme-blueprint', appearance: 'light', swatches: ['#f3f7ff', '#1d4ed8', '#bfdbfe'],
  },
  {
    id: 'solarizedLight', label: 'Solarize Açık', description: 'Dengeli kontrastlı, krem tabanlı profesyonel tema',
    className: 'theme-solarized-light', appearance: 'light', swatches: ['#fdf6e3', '#268bd2', '#b58900'],
  },
  {
    id: 'windows95', label: 'Klasik Windows 95', description: 'Gri masaüstü, lacivert başlık ve nostaljik sistem hissi',
    className: 'theme-windows-95', appearance: 'light', swatches: ['#c0c0c0', '#000080', '#008080'],
  },
  {
    id: 'windowsXpLuna', label: 'Windows XP Luna', description: 'Klasik mavi görev çubuğu ve canlı yeşil aksanlar',
    className: 'theme-windows-xp-luna', appearance: 'light', swatches: ['#ece9d8', '#245edb', '#3c9d23'],
  },
  {
    id: 'vistaAero', label: 'Vista Aero', description: 'Buzlu cam, gökyüzü mavisi ve parlak yüzeyler',
    className: 'theme-vista-aero', appearance: 'light', swatches: ['#eaf5fb', '#1683c5', '#77c7ef'],
  },
  {
    id: 'windows7Glass', label: 'Windows 7 Glass', description: 'Şeffaf mavi cam ve dengeli masaüstü görünümü',
    className: 'theme-windows-7-glass', appearance: 'light', swatches: ['#eef7fb', '#2679b8', '#63b5dd'],
  },
  {
    id: 'windows11Mica', label: 'Windows 11 Mica', description: 'Yumuşak Mica yüzeyler ve modern sistem mavisi',
    className: 'theme-windows-11-mica', appearance: 'light', swatches: ['#f3f3f3', '#0067c0', '#60cdff'],
  },
  {
    id: 'teamRed', label: 'Takım Kırmızı', description: 'Güçlü kırmızı kimlik ve temiz beyaz takım arayüzü',
    className: 'theme-team-red', appearance: 'light', swatches: ['#fff7f7', '#dc2626', '#f87171'],
  },
  {
    id: 'teamBlue', label: 'Takım Mavi', description: 'Güven veren koyu mavi ve enerjik açık mavi birlikteliği',
    className: 'theme-team-blue', appearance: 'light', swatches: ['#f5f9ff', '#1d4ed8', '#60a5fa'],
  },
  {
    id: 'teamOrange', label: 'Takım Turuncu', description: 'Dinamik ekipler için sıcak ve hareketli turuncu kimlik',
    className: 'theme-team-orange', appearance: 'light', swatches: ['#fff9f2', '#ea580c', '#fb923c'],
  },
  {
    id: 'teamPurple', label: 'Takım Mor', description: 'Yaratıcı ekipler için dengeli mor ve eflatun tonları',
    className: 'theme-team-purple', appearance: 'light', swatches: ['#fbf8ff', '#7e22ce', '#c084fc'],
  },
  {
    id: 'nordicPaper', label: 'Nordik Kağıt', description: 'Soğuk beyaz, İskandinav mavisi ve sakin gri yüzeyler',
    className: 'theme-nordic-paper', appearance: 'light', swatches: ['#f7fafc', '#3b6f8f', '#9cc4d8'],
  },
  {
    id: 'terminalGreen', label: 'Terminal Yeşili', description: 'Klasik terminal ekranlarından ilham alan fosfor yeşili',
    className: 'theme-terminal-green', appearance: 'dark', swatches: ['#050b07', '#22c55e', '#86efac'],
  },
  {
    id: 'dosAmber', label: 'DOS Kehribar', description: 'Eski iş istasyonu terminallerinin kehribar monokrom hissi',
    className: 'theme-dos-amber', appearance: 'dark', swatches: ['#0d0902', '#f59e0b', '#fde68a'],
  },
  {
    id: 'retroOffice', label: 'Retro Ofis 1978', description: 'Krem kâğıt, avokado yeşili ve turuncu detaylarla analog ofis hissi',
    className: 'theme-retro-office', appearance: 'light', swatches: ['#f3ead3', '#65743a', '#d36b32'],
  },
  {
    id: 'retroArcade', label: 'Retro Arcade', description: 'CRT siyahı, piksel moru ve neon camgöbeğiyle seksenler salonu',
    className: 'theme-retro-arcade', appearance: 'dark', swatches: ['#10091b', '#d946ef', '#22d3ee'],
  },
  {
    id: 'retroY2k', label: 'Retro Y2K', description: 'Gümüş yüzeyler, dijital mavi ve parlak pembe milenyum görünümü',
    className: 'theme-retro-y2k', appearance: 'light', swatches: ['#eef1f5', '#2563eb', '#ec4899'],
  },
  {
    id: 'racingGreen', label: 'Takım Yarış Yeşili', description: 'Premium motor sporları için koyu yeşil ve altın',
    className: 'theme-racing-green', appearance: 'dark', swatches: ['#07130e', '#15803d', '#d4af37'],
  },
  {
    id: 'cyberpunk', label: 'Cyberpunk 2077', description: 'Elektrik sarısı, neon camgöbeği ve sert siyah yüzeyler',
    className: 'theme-cyberpunk', appearance: 'dark', swatches: ['#090b0c', '#fcee0a', '#00f0ff'],
  },
  {
    id: 'synthwave', label: 'Synthwave', description: 'Seksenler neon moru, pembe ve gece mavisi',
    className: 'theme-synthwave', appearance: 'dark', swatches: ['#100b2d', '#ff2bd6', '#7c3aed'],
  },
  {
    id: 'auroraGlass', label: 'Aurora Glass', description: 'Kuzey ışıkları renklerinde yenilikçi cam yüzeyler',
    className: 'theme-aurora-glass', appearance: 'dark', swatches: ['#071827', '#2dd4bf', '#a78bfa'],
  },
  {
    id: 'holographic', label: 'Holografik Gece', description: 'Camgöbeği, pembe ve mor arasında holografik geçiş',
    className: 'theme-holographic', appearance: 'dark', swatches: ['#0b1020', '#22d3ee', '#f0abfc'],
  },
  {
    id: 'matrix', label: 'Matrix', description: 'Dijital yağmur hissinde siyah ve keskin yeşil',
    className: 'theme-matrix', appearance: 'dark', swatches: ['#020704', '#00c853', '#39ff88'],
  },
  {
    id: 'sunsetDrive', label: 'Sunset Drive', description: 'Gün batımı turuncusu ve mor gece ufku',
    className: 'theme-sunset-drive', appearance: 'dark', swatches: ['#17102c', '#f97316', '#c026d3'],
  },
  {
    id: 'monochromeInk', label: 'Monokrom Mürekkep', description: 'Tam odak için siyah, beyaz ve gri tonlarından oluşan tema',
    className: 'theme-monochrome-ink', appearance: 'dark', swatches: ['#090909', '#d4d4d4', '#737373'],
  },
] as const;

const brandThemeIdSet = new Set<string>(brandThemeIds);

const brandThemeAppearanceMap = new Map<BrandTheme, BrandThemeAppearance>(
  brandThemes.map((item) => [item.id, item.appearance]),
);

export function isBrandTheme(value: string | null | undefined): value is BrandTheme {
  return Boolean(value && brandThemeIdSet.has(value));
}

export function getBrandThemeClass(theme: BrandTheme): string {
  return brandThemes.find((item) => item.id === theme)?.className ?? brandThemes[0].className;
}

export function readV3riiAppearanceOverride(): BrandThemeAppearance | null {
  const stored = localStorage.getItem(V3RII_APPEARANCE_OVERRIDE_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
}

export function getBrandThemeAppearance(theme: BrandTheme): BrandThemeAppearance {
  if (theme === 'v3rii') {
    const override = readV3riiAppearanceOverride();
    if (override) {
      return override;
    }
  }
  return brandThemeAppearanceMap.get(theme) ?? 'light';
}

export function getBrandThemeBaseAppearance(theme: BrandTheme): BrandThemeAppearance {
  return brandThemeAppearanceMap.get(theme) ?? 'light';
}

export function toggleV3riiAppearanceOverride(): BrandThemeAppearance {
  const nextAppearance: BrandThemeAppearance = getBrandThemeAppearance('v3rii') === 'dark' ? 'light' : 'dark';
  localStorage.setItem(V3RII_APPEARANCE_OVERRIDE_STORAGE_KEY, nextAppearance);
  return nextAppearance;
}

export const darkBrandThemes = brandThemes.filter((item) => item.appearance === 'dark');

export const lightBrandThemes = brandThemes.filter((item) => item.appearance === 'light');

const windowsThemeIds = new Set<BrandTheme>(['windows95','windowsXpLuna','vistaAero','windows7Glass','windows11Mica']);
const corporateThemeIds = new Set<BrandTheme>([
  'v3rii','corporateBlue','graphite','emerald','executive','burgundy','industrialSteel','cleanLight','highContrast','minimalCrm',
  'flatNavy','flatSlate','flatWhite','oceanDepth','midnightCyan','forestNight','carbonAmber','cobaltNight','blueprint','nordicPaper',
]);

export const windowsBrandThemes = brandThemes.filter((item) => windowsThemeIds.has(item.id));
export const corporateBrandThemes = brandThemes.filter((item) => corporateThemeIds.has(item.id));
export const creativeBrandThemes = brandThemes.filter((item) => !windowsThemeIds.has(item.id) && !corporateThemeIds.has(item.id));
