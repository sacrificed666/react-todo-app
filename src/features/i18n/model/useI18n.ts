import { useAppSelector } from "@/app/hooks";
import type { RootState } from "@/app/store";

import { LOCALE_INFO } from "./locales";
import { createTranslator } from "./translate";

const selectLocale = (state: RootState) => state.settings.locale;

export const useI18n = () => {
  const locale = useAppSelector(selectLocale);
  return { locale, intlLocale: LOCALE_INFO[locale].intl, t: createTranslator(locale) };
};
