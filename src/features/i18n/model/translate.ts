import { en } from "./messages/en";
import { uk } from "./messages/uk";

export const LOCALES = ["en", "uk"] as const;

export type Locale = (typeof LOCALES)[number];
export type PluralMessage = Readonly<Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }>;
export type Message = string | PluralMessage;
export type MessageKey = keyof typeof en;
export type Messages = Readonly<Record<MessageKey, Message>>;
export type TranslationParams = Readonly<Record<string, string | number>>;
export type Translate = (key: MessageKey, params?: TranslationParams) => string;

const dictionaries: Record<Locale, Messages> = { en, uk };
const pluralRules = new Map<Locale, Intl.PluralRules>();

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

export const detectLocale = (languages: readonly string[]): Locale =>
  languages.some((language) => language.toLowerCase().startsWith("uk")) ? "uk" : "en";

const selectPlural = (locale: Locale, message: PluralMessage, count: number) => {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return message[rules.select(count)] ?? message.other;
};

export const translate = (locale: Locale, key: MessageKey, params: TranslationParams = {}) => {
  const message = dictionaries[locale][key];
  const template = typeof message === "string" ? message : selectPlural(locale, message, Number(params.count ?? 0));
  return template.replaceAll(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in params ? String(params[name]) : placeholder,
  );
};

export const createTranslator =
  (locale: Locale): Translate =>
  (key, params) =>
    translate(locale, key, params);
