#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const audit = spawnSync(process.execPath, ['scripts/audit-i18n-bare-keys.mjs', '--json'], {
  cwd: root,
  encoding: 'utf8',
});
const rows = JSON.parse(audit.stdout || '[]');
const keys = [...new Set(rows.map((row) => row.key))];
const file = path.join(root, 'src/locales/tr/common.json');
const target = JSON.parse(fs.readFileSync(file, 'utf8'));
const getPath = (value, dottedPath) => dottedPath.split('.').reduce((current, key) => current?.[key], value);
const setPath = (value, dottedPath, text) => {
  const parts = dottedPath.split('.');
  let current = value;
  for (let index = 0; index < parts.length - 1; index += 1) {
    if (!current[parts[index]] || typeof current[parts[index]] !== 'object') current[parts[index]] = {};
    current = current[parts[index]];
  }
  current[parts.at(-1)] = text;
};
const humanize = (key) => key.split('.').at(-1)
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[-_]+/g, ' ')
  .replace(/^./, (letter) => letter.toUpperCase());
const terms = {
  action:'İşlem', failed:'başarısız', error:'hata', success:'başarılı', complete:'tamamlandı', incomplete:'eksik',
  completion:'tamamlanma', percentage:'yüzdesi', customer:'cari', sales:'satış', dossier:'dosyası', pdf:'PDF',
  clear:'temizle', entity:'varlık', filter:'filtresi', message:'mesajı', cancel:'iptal', applied:'uygulandı', apply:'uygula',
  last:'son', document:'belge', loading:'yükleniyor', title:'başlık', usage:'kullanım', count:'sayısı', double:'çift',
  click:'tıklayın', edit:'düzenle', has:'var', images:'görseller', search:'arama', placeholder:'yer tutucu', with:'ile',
  labels:'etiketler', lines:'satırlar', line:'satır', select:'seç', print:'baskı', description:'açıklama', convert:'dönüştür',
  to:'-e', order:'sipariş', pending:'bekliyor', list:'liste', erp:'ERP', cleanup:'temizleme', confirm:'onayla', dialog:'pencere',
  number:'numarası', note:'not', reason:'nedeni', send:'gönder', mail:'e-posta', more:'diğer', actions:'işlemler', waiting:'bekleyen',
  approvals:'onaylar', reject:'ret', label:'etiketi', not:'değil', available:'kullanılabilir', update:'güncelleme', profile:'profil',
  picture:'resmi', editor:'düzenleyici', rotate:'döndür', zoom:'yakınlaştır', report:'rapor', designer:'tasarımcı', system:'sistem',
  settings:'ayarları', fields:'alanlar', field:'alan', example:'örnek', mask:'maske', enabled:'etkin', validation:'doğrulama',
  bundle:'paket', created:'oluşturuldu', children:'alt öğeler', required:'zorunlu', read:'okuma', only:'yalnızca', locked:'kilitli',
  approver:'onaylayıcı', approved:'onaylandı', rejected:'reddedildi', closed:'kapalı', flow:'akış', started:'başlatıldı',
  status:'durum', process:'süreç', empty:'boş', state:'durum', activity:'aktivite', payment:'ödeme', term:'vade', days:'gün'
};
const translate = async (text) => text.split(/\s+/).map((word) => terms[word.toLowerCase()] ?? word).join(' ');

let added = 0;
for (const key of keys) {
  if (getPath(target, key) !== undefined) continue;
  setPath(target, key, await translate(humanize(key)));
  added += 1;
}
fs.writeFileSync(file, `${JSON.stringify(target, null, 2)}\n`, 'utf8');
console.log(`Seeded ${added} missing keys into tr/common.json.`);
