const DAY = 86_400_000;
const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const shortFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
const longFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const headlineFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });
const weekdayShortFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });

export type DueTone = "overdue" | "today" | "upcoming";

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

export const formatHeadline = (key: string) => headlineFormatter.format(fromDateKey(key));

export const formatWeekdayShort = (key: string) => weekdayShortFormatter.format(fromDateKey(key));

export const describeDueDate = (dueDate: string, today: string): { label: string; tone: DueTone } => {
  const offset = daysBetween(today, dueDate);
  const date = fromDateKey(dueDate);

  if (offset === 0) return { label: "Today", tone: "today" };
  if (offset === 1) return { label: "Tomorrow", tone: "upcoming" };
  if (offset === -1) return { label: "Yesterday", tone: "overdue" };
  if (offset > 1 && offset < 7) return { label: weekdayFormatter.format(date), tone: "upcoming" };

  const sameYear = date.getFullYear() === fromDateKey(today).getFullYear();
  return { label: (sameYear ? shortFormatter : longFormatter).format(date), tone: offset < 0 ? "overdue" : "upcoming" };
};
