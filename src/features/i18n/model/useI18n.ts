import { useAppSelector } from "@/app/hooks";
import type { RootState } from "@/app/store";

import { LOCALE_INFO } from "./locales";
import { createTranslator } from "./translate";

// The chosen language
const selectLocale = (state: RootState) => state.settings.locale;

// Language, translator and Intl locale for components
export const useI18n = () => {
  const locale = useAppSelector(selectLocale);
  return { locale, intlLocale: LOCALE_INFO[locale].intl, t: createTranslator(locale) };
};
