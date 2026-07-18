function upperFirst(value: string, language: string): string {
  if (!value) return value;
  return value[0].toLocaleUpperCase(language) + value.slice(1);
}

const ID_TOKENS = [
  /\s+kay(?:ı|i)t\s+(?:id|no)$/iu,
  /^(?:id|identifier|identificativo|identyfikator|идентификатор|معرف|شناسه)\s+(?:de|del|della|di|do|da|الـ)?\s*/iu,
  /\s+(?:id|identifier|identificativo|identyfikator)$/iu,
  /(?:-|\s)?id$/iu,
  /^id\s+(?:de|del|della|di|do|da)\s+/iu,
  /شناسه$/u,
  /معرف$/u,
  /идентификатор$/iu,
  /编号$/u,
  /識別子$/u,
  /식별자$/u,
];

/** Relation fields are business selections in the UI, not technical IDs. */
export function getBusinessFieldLabel(key: string, translatedLabel: string, language: string): string {
  if (key.toLocaleLowerCase() === "id" || !/id$/i.test(key)) return translatedLabel;

  const locale = language.toLocaleLowerCase().split("-")[0];
  let label = translatedLabel.trim();
  for (const token of ID_TOKENS) label = label.replace(token, "").trim();

  // A missing translation must never leak the technical property suffix to the user.
  if (/id$/i.test(label)) {
    label = label.slice(0, -2).replace(/([a-z])([A-Z])/g, "$1 $2").trim();
  }

  return upperFirst(label, locale);
}
