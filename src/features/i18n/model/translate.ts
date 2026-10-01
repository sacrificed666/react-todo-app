import { getMessages } from "./catalog";
import type { en } from "./messages/en";

export const LOCALES = ["en", "uk", "de", "es", "fr", "it", "nl", "pl"] as const;

export type Locale = (typeof LOCALES)[number];
export type PluralMessage = Readonly<Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }>;
export type Message = string | PluralMessage;
export type MessageKey = keyof typeof en;
export type Messages = Readonly<Record<MessageKey, Message>>;
export type TranslationParams = Readonly<Record<string, string | number>>;
export type Translate = (key: MessageKey, params?: TranslationParams) => string;

const pluralRules = new Map<Locale, Intl.PluralRules>();

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

export const detectLocale = (languages: readonly string[]): Locale => {
  for (const language of languages) {
    const primary = language.toLowerCase().split("-")[0];
    if (isLocale(primary)) return primary;
  }
  return "en";
};

export const pluralCategory = (locale: Locale, count: number) => {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return rules.select(count);
};

export const translate = (locale: Locale, key: MessageKey, params: TranslationParams = {}) => {
  const message = getMessages(locale)[key];
  const template =
    typeof message === "string"
      ? message
      : (message[pluralCategory(locale, Number(params.count ?? 0))] ?? message.other);
  return template.replaceAll(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
};

export const createTranslator =
  (locale: Locale): Translate =>
  (key, params) =>
    translate(locale, key, params);
