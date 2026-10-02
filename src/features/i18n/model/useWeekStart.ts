import { firstDayOfWeek } from "@/shared/lib/date";

import { useI18n } from "./useI18n";

export const useWeekStart = () => {
  const { locale } = useI18n();
  const regional = globalThis.navigator.languages.find((language) => language.split("-")[0] === locale);
  return firstDayOfWeek(regional ?? locale);
};
