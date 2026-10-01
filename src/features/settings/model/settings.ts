import { detectLocale, isLocale, type Locale } from "@/features/i18n/model/translate";
import { isRecord } from "@/shared/lib/guards";

import { applyTheme, DEFAULT_THEME, isAccent, isAppearance, type ThemeSettings } from "./theme";

export interface Settings extends ThemeSettings {
  locale: Locale;
}

export const DEFAULT_SETTINGS: Settings = { ...DEFAULT_THEME, locale: "en" };

export const readSettings = (stored: unknown, languages: readonly string[]): Settings => {
  const value = isRecord(stored) ? stored : {};
  return {
    appearance: isAppearance(value.appearance) ? value.appearance : DEFAULT_SETTINGS.appearance,
    accent: isAccent(value.accent) ? value.accent : DEFAULT_SETTINGS.accent,
    locale: isLocale(value.locale) ? value.locale : detectLocale(languages),
  };
};

export const applySettings = (settings: Settings, root: HTMLElement = document.documentElement) => {
  applyTheme(settings, root);
  root.lang = settings.locale;
};
