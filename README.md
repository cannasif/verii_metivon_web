# V3RII Metivon Web

Metivon ERP'nin feature-first React/Vite arayüzüdür.

## Mimari sözleşme

API ve Web için tek kanonik sözleşme: [V3RII Senior Grade Proje Kuralları](https://github.com/cannasif/verii_metivon_api/blob/main/docs/V3RII_SENIOR_GRADE_PROJECT_RULES.md).

Ek uygulama rehberleri:

- Frontend referans standardı: `docs/CRM_FRONTEND_STANDARD.md`
- Sayfa UI/UX uygulama rehberi: `docs/PAGE_UI_UX_IMPLEMENTATION_GUIDE.md`
- Standart denetçisi: `scripts/check-frontend-standards.mjs`

## Komutlar

```bash
npm run dev
npm run quality
npm run build
```

`quality` komutu lint, i18n namespace kontrolü ve TypeScript typecheck adımlarını birlikte çalıştırır. Ek olarak debug console ve doğrudan axios kullanımı gibi frontend standart kaçaklarını da kontrol eder.
