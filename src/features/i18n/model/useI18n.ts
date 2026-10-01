import { useAppSelector } from "@/app/hooks";
import type { RootState } from "@/app/store";

import { createTranslator } from "./translate";

const selectLocale = (state: RootState) => state.settings.locale;

export const useI18n = () => {
  const locale = useAppSelector(selectLocale);
  return { locale, t: createTranslator(locale) };
};
