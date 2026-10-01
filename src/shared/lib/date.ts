const DAY = 86_400_000;
const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

const formatters = new Map<string, Intl.DateTimeFormat>();
const relativeFormatters = new Map<string, Intl.RelativeTimeFormat>();

const dateFormatter = (locale: string, options: Intl.DateTimeFormatOptions) => {
  const key = `${locale}:${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, formatter);
  }
  return formatter;
};

const relativeFormatter = (locale: string) => {
  let formatter = relativeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    relativeFormatters.set(locale, formatter);
  }
  return formatter;
};

export type DueTone = "overdue" | "today" | "upcoming";

export const capitalize = (value: string, locale: string) => value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);

export const toDateKey = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part) => String(part).padStart(2, "0")).join("-");

export const fromDateKey = (key: string) => {
  const [, year = "0", month = "1", day = "1"] = DATE_KEY.exec(key) ?? [];
  return new Date(Number(year), Number(month) - 1, Number(day));
};

export const isDateKey = (value: unknown): value is string =>
  typeof value === "string" && DATE_KEY.test(value) && toDateKey(fromDateKey(value)) === value;

export const addDays = (key: string, days: number) => {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

export const daysBetween = (from: string, to: string) =>
  Math.round((fromDateKey(to).getTime() - fromDateKey(from).getTime()) / DAY);

export const formatHeadline = (key: string, locale = "en") =>
  capitalize(
    dateFormatter(locale, { weekday: "long", month: "long", day: "numeric" }).format(fromDateKey(key)),
    locale,
  );

export const formatWeekdayShort = (key: string, locale = "en") =>
  capitalize(dateFormatter(locale, { weekday: "short" }).format(fromDateKey(key)), locale);

export const formatDateTime = (timestamp: number, locale = "en") =>
  dateFormatter(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));

export const describeDueDate = (dueDate: string, today: string, locale = "en"): { label: string; tone: DueTone } => {
  const offset = daysBetween(today, dueDate);
  const date = fromDateKey(dueDate);
  const tone: DueTone = offset < 0 ? "overdue" : offset === 0 ? "today" : "upcoming";

  if (Math.abs(offset) <= 1)
    return { label: capitalize(relativeFormatter(locale).format(offset, "day"), locale), tone };
  if (offset > 1 && offset < 7)
    return { label: capitalize(dateFormatter(locale, { weekday: "long" }).format(date), locale), tone };

  const sameYear = date.getFullYear() === fromDateKey(today).getFullYear();
  const options: Intl.DateTimeFormatOptions = sameYear
    ? { weekday: "short", month: "short", day: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" };
  return { label: capitalize(dateFormatter(locale, options).format(date), locale), tone };
};
