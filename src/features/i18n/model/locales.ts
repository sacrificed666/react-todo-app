import type { Locale } from "./translate";

export const LOCALE_NAMES: Readonly<Record<Locale, string>> = {
  en: "English",
  uk: "Українська",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  it: "Italiano",
  nl: "Nederlands",
  pl: "Polski",
};

const FLAG_CODES: Readonly<Record<Locale, string>> = {
  en: "gb",
  uk: "ua",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  nl: "nl",
  pl: "pl",
};

export const FLAG_ORIGIN = "https://flagcdn.com";

export const flagUrl = (locale: Locale) => `${FLAG_ORIGIN}/${FLAG_CODES[locale]}.svg`;
