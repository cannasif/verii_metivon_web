export const INTERFACE_LAYOUT_STORAGE_KEY = 'vite-ui-interface-layout';

export const interfaceLayoutIds = [
  'standard', 'compact', 'classic', 'retro', 'space',
  'glass', 'terminal', 'executive', 'dock', 'zen',
] as const;

export type InterfaceLayout = (typeof interfaceLayoutIds)[number];

export type InterfaceLayoutDefinition = {
  id: InterfaceLayout;
  label: string;
  description: string;
  preview: readonly [string, string, string];
};

export const interfaceLayouts: readonly InterfaceLayoutDefinition[] = [
  { id: 'standard', label: 'Standart', description: 'Dengeli sidebar ve üst bar', preview: ['28%', '72%', '22%'] },
  { id: 'compact', label: 'Kompakt', description: 'Yoğun veri girişi için dar yapı', preview: ['20%', '80%', '14%'] },
  { id: 'classic', label: 'Klasik ERP', description: 'Keskin sınırlar ve masaüstü düzeni', preview: ['25%', '75%', '18%'] },
  { id: 'retro', label: 'Retro', description: 'Kalın çerçeveli terminal estetiği', preview: ['24%', '76%', '24%'] },
  { id: 'space', label: 'Uzay', description: 'Geniş paneller ve yüzen navigasyon', preview: ['18%', '82%', '28%'] },
  { id: 'glass', label: 'Cam', description: 'Şeffaf, yüzen yüzeyler', preview: ['22%', '78%', '20%'] },
  { id: 'terminal', label: 'Terminal', description: 'Monospace ve sık operasyon görünümü', preview: ['27%', '73%', '12%'] },
  { id: 'executive', label: 'Yönetici', description: 'Geniş özet alanları ve premium boşluklar', preview: ['24%', '76%', '32%'] },
  { id: 'dock', label: 'Dock', description: 'Alt navigasyon karakterli modern düzen', preview: ['14%', '86%', '18%'] },
  { id: 'zen', label: 'Zen', description: 'İçeriği öne çıkaran sade çalışma alanı', preview: ['16%', '84%', '10%'] },
];

export function isInterfaceLayout(value: string | null): value is InterfaceLayout {
  return interfaceLayoutIds.includes(value as InterfaceLayout);
}
