import { addDays, fromDateKey, isDateKey, toDateKey } from "@/shared/lib/date";

export interface QuickAddResult {
  title: string;
  dueDate: string | null;
  important: boolean;
}

const RELATIVE_DAYS: Readonly<Record<string, number>> = {
  today: 0,
  tonight: 0,
  tomorrow: 1,
  "day after tomorrow": 2,
  "next week": 7,
  "in a week": 7,
  сьогодні: 0,
  завтра: 1,
  післязавтра: 2,
  "наступного тижня": 7,
  "через тиждень": 7,
};

const WEEKDAYS: Readonly<Record<string, number>> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  неділя: 0,
  неділю: 0,
  неділі: 0,
  понеділок: 1,
  понеділка: 1,
  вівторок: 2,
  вівторка: 2,
  середа: 3,
  середу: 3,
  середи: 3,
  четвер: 4,
  четверга: 4,
  "п’ятниця": 5,
  "п’ятницю": 5,
  "п’ятниці": 5,
  субота: 6,
  суботу: 6,
  суботи: 6,
};

const WEEKDAY_PREFIXES = new Set([
  "on",
  "next",
  "this",
  "у",
  "в",
  "цей",
  "цю",
  "цього",
  "цієї",
  "наступний",
  "наступну",
  "наступного",
  "наступної",
]);
const IN_DAYS = /^(?:in|через) (\d{1,3}) (?:days?|день|дні|днів)$/;
const DAY_MONTH = /^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?$/;
const IMPORTANT = /^!{1,3}$/;
const TAG = /^#[\p{L}\p{N}_-]+$/u;

const nextWeekday = (today: string, weekday: number) => {
  const offset = (weekday - fromDateKey(today).getDay() + 7) % 7;
  return addDays(today, offset === 0 ? 7 : offset);
};

const calendarDate = (year: number, month: number, day: number) => {
  const date = new Date(year, month - 1, day);
  const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? toDateKey(date) : null;
};

const parseDayMonth = ([, day = "", month = "", year]: RegExpExecArray, today: string) => {
  if (year !== undefined) return calendarDate(Number(year), Number(month), Number(day));
  const current = fromDateKey(today).getFullYear();
  const thisYear = calendarDate(current, Number(month), Number(day));
  return thisYear !== null && thisYear >= today ? thisYear : calendarDate(current + 1, Number(month), Number(day));
};

export const parseDatePhrase = (phrase: string, today: string): string | null => {
  const normalized = phrase.toLocaleLowerCase().replaceAll("'", "’");

  const relative = RELATIVE_DAYS[normalized];
  if (relative !== undefined) return addDays(today, relative);

  const inDays = IN_DAYS.exec(normalized);
  if (inDays) return addDays(today, Number(inDays[1]));

  const words = normalized.split(" ");
  const weekdayWord =
    words.length === 2 && WEEKDAY_PREFIXES.has(words[0] ?? "") ? words[1] : words.length === 1 ? words[0] : undefined;
  const weekday = weekdayWord === undefined ? undefined : WEEKDAYS[weekdayWord];
  if (weekday !== undefined) return nextWeekday(today, weekday);

  if (isDateKey(normalized)) return normalized;

  const dayMonth = DAY_MONTH.exec(normalized);
  return dayMonth ? parseDayMonth(dayMonth, today) : null;
};

export const parseQuickAdd = (input: string, today: string): QuickAddResult => {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  const tags: string[] = [];
  let important = false;
  let end = tokens.length;

  while (end > 1) {
    const token = tokens[end - 1] ?? "";
    if (IMPORTANT.test(token)) important = true;
    else if (TAG.test(token)) tags.unshift(token);
    else break;
    end -= 1;
  }

  let dueDate: string | null = null;
  for (const size of [3, 2, 1]) {
    if (end - size < 1) continue;
    const date = parseDatePhrase(tokens.slice(end - size, end).join(" "), today);
    if (date) {
      dueDate = date;
      end -= size;
      break;
    }
  }

  return { title: [...tokens.slice(0, end), ...tags].join(" "), dueDate, important };
};
