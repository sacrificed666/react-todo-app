import { addDays, fromDateKey, isDateKey, toDateKey } from "@/shared/lib/date";

export interface QuickAddResult {
  title: string;
  dueDate: string | null;
  important: boolean;
}

const fold = (value: string) =>
  value
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .replaceAll(/['’]/gu, "’")
    .toLocaleLowerCase();

const foldKeys = <Value>(entries: Readonly<Record<string, Value>>) =>
  new Map(Object.entries(entries).map(([phrase, value]) => [fold(phrase), value]));

const RELATIVE_DAYS = foldKeys({
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
  heute: 0,
  "heute abend": 0,
  morgen: 1,
  übermorgen: 2,
  "nächste woche": 7,
  "in einer woche": 7,
  hoy: 0,
  "esta noche": 0,
  mañana: 1,
  "pasado mañana": 2,
  "la próxima semana": 7,
  "la semana que viene": 7,
  "en una semana": 7,
  "aujourd’hui": 0,
  "ce soir": 0,
  demain: 1,
  "après-demain": 2,
  "la semaine prochaine": 7,
  "dans une semaine": 7,
  oggi: 0,
  stasera: 0,
  domani: 1,
  dopodomani: 2,
  "la prossima settimana": 7,
  "la settimana prossima": 7,
  "tra una settimana": 7,
  "fra una settimana": 7,
  vandaag: 0,
  vanavond: 0,
  overmorgen: 2,
  "volgende week": 7,
  "over een week": 7,
  dziś: 0,
  dzisiaj: 0,
  "dziś wieczorem": 0,
  jutro: 1,
  pojutrze: 2,
  "w przyszłym tygodniu": 7,
  "za tydzień": 7,
});

const WEEKDAYS = foldKeys({
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
  sonntag: 0,
  montag: 1,
  dienstag: 2,
  mittwoch: 3,
  donnerstag: 4,
  freitag: 5,
  samstag: 6,
  sonnabend: 6,
  domingo: 0,
  lunes: 1,
  martes: 2,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sábado: 6,
  dimanche: 0,
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
  domenica: 0,
  lunedì: 1,
  martedì: 2,
  mercoledì: 3,
  giovedì: 4,
  venerdì: 5,
  sabato: 6,
  zondag: 0,
  maandag: 1,
  dinsdag: 2,
  woensdag: 3,
  donderdag: 4,
  vrijdag: 5,
  zaterdag: 6,
  niedziela: 0,
  niedzielę: 0,
  poniedziałek: 1,
  wtorek: 2,
  środa: 3,
  środę: 3,
  czwartek: 4,
  piątek: 5,
  sobota: 6,
  sobotę: 6,
});

const WEEKDAY_MODIFIERS = new Set(
  [
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
    "am",
    "nächsten",
    "nächster",
    "kommenden",
    "diesen",
    "el",
    "este",
    "esta",
    "próximo",
    "próxima",
    "le",
    "ce",
    "prochain",
    "prochaine",
    "il",
    "questo",
    "prossimo",
    "prossima",
    "op",
    "volgende",
    "deze",
    "aanstaande",
    "w",
    "we",
    "ten",
    "tę",
    "najbliższy",
    "najbliższą",
    "przyszły",
    "przyszłą",
  ].map(fold),
);

const BLOCKED_ENDINGS = new Set(
  ["la mañana", "por la mañana", "de la mañana", "am morgen", "den morgen", "jeden morgen", "guten morgen"].map(fold),
);

const IN_DAYS = new RegExp(
  `^(?:${["in", "через", "en", "dentro de", "dans", "tra", "fra", "over", "za"].join("|")}) (\\d{1,3}) (?:${[
    "days?",
    "день",
    "дні",
    "днів",
    "tagen?",
    "dias?",
    "jours?",
    "giorni",
    "giorno",
    "dagen",
    "dag",
    "dni",
    "dzien",
  ].join("|")})$`,
  "u",
);
const DAY_MONTH = /^(\d{1,2})\.(\d{1,2})(?:\.(\d{4})?)?$/;
const IMPORTANT = /^!{1,3}$/;
const TAG = /^#[\p{L}\p{N}_-]+$/u;
const MAX_PHRASE = 4;

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

const parseWeekday = (words: readonly string[]): number | null => {
  const days = words.flatMap((word) => {
    const weekday = WEEKDAYS.get(word);
    return weekday === undefined ? [] : [weekday];
  });
  const [weekday] = days;
  if (days.length !== 1 || weekday === undefined) return null;
  return words.every((word) => WEEKDAYS.has(word) || WEEKDAY_MODIFIERS.has(word)) ? weekday : null;
};

export const parseDatePhrase = (phrase: string, today: string): string | null => {
  const normalized = fold(phrase.trim());

  const relative = RELATIVE_DAYS.get(normalized);
  if (relative !== undefined) return addDays(today, relative);

  const inDays = IN_DAYS.exec(normalized);
  if (inDays) return addDays(today, Number(inDays[1]));

  const weekday = parseWeekday(normalized.split(" "));
  if (weekday !== null) return nextWeekday(today, weekday);

  if (isDateKey(normalized)) return normalized;

  const dayMonth = DAY_MONTH.exec(normalized);
  return dayMonth ? parseDayMonth(dayMonth, today) : null;
};

const endsWithBlockedPhrase = (tokens: readonly string[], end: number) =>
  [2, 3].some((size) => end - size >= 0 && BLOCKED_ENDINGS.has(fold(tokens.slice(end - size, end).join(" "))));

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
  if (!endsWithBlockedPhrase(tokens, end)) {
    for (let size = MAX_PHRASE; size >= 1; size -= 1) {
      if (end - size < 1) continue;
      const date = parseDatePhrase(tokens.slice(end - size, end).join(" "), today);
      if (date) {
        dueDate = date;
        end -= size;
        break;
      }
    }
  }

  return { title: [...tokens.slice(0, end), ...tags].join(" "), dueDate, important };
};
