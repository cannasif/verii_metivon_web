function upperFirst(value: string, language: string): string {
  if (!value) return value;
  return value[0].toLocaleUpperCase(language) + value.slice(1);
}

/** Relation fields are business selections in the UI, not technical IDs. */
export function getBusinessFieldLabel(key: string, translatedLabel: string, language: string): string {
  if (key.toLocaleLowerCase() === "id" || !/id$/i.test(key)) return translatedLabel;

  const locale = language.toLocaleLowerCase().split("-")[0];
  let label = translatedLabel.trim();
  switch (locale) {
    case "tr": label = label.replace(/\s+Kayıt ID$/iu, ""); break;
    case "en": label = label.replace(/\s+ID$/iu, ""); break;
    case "de":
    case "nl": label = label.replace(/-?ID$/iu, ""); break;
    case "es": label = label.replace(/^ID\s+de(?:l|\s+la)?\s+/iu, ""); break;
    case "pt": label = label.replace(/^ID\s+d[oa]\s+/iu, ""); break;
    case "fr": label = label.replace(/^(?:ID\s+d['’]|ID\s+de(?:\s+la|\s+le)?\s+|Numéro\s+)/iu, ""); break;
    case "it": label = label.replace(/^(?:Identificativo\s+(?:del|della|di)\s+|ID\s+)/iu, ""); break;
    case "pl": label = label.replace(/^Identyfikator\s+/iu, ""); break;
    case "ru": label = label.replace(/^Идентификатор\s+/iu, ""); break;
    case "ar": label = label.replace(/^معرف\s+/u, ""); break;
    case "fa": label = label.replace(/^شناسه\s+/u, ""); break;
    case "ja": label = label.replace(/ID$/iu, ""); break;
    case "ko": label = label.replace(/\s*ID$/iu, ""); break;
    case "zh": label = label.replace(/编号$/u, ""); break;
    default: label = label.replace(/(?:\s+|-)?ID$/iu, ""); break;
  }

  return upperFirst(label.trim(), locale);
}
