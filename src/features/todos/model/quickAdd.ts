import { addDays, fromDateKey, isDateKey, toDateKey } from "@/shared/lib/date";

import type { Repeat } from "./todo";

export interface QuickAddResult {
  title: string;
  dueDate: string | null;
  important: boolean;
  repeat: Repeat | null;
  projectId: string | null;
}

export interface QuickAddProject {
  id: string;
  name: string;
  label?: string;
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
  dnes: 0,
  dneska: 0,
  "dnes večer": 0,
  zítra: 1,
  pozítří: 2,
  "příští týden": 7,
  "za týden": 7,
  hoje: 0,
  "hoje à noite": 0,
  "esta noite": 0,
  amanhã: 1,
  "depois de amanhã": 2,
  "na próxima semana": 7,
  "próxima semana": 7,
  "para a semana": 7,
  "daqui a uma semana": 7,
  "dentro de uma semana": 7,
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
  neděle: 0,
  neděli: 0,
  pondělí: 1,
  úterý: 2,
  středa: 3,
  středu: 3,
  čtvrtek: 4,
  pátek: 5,
  sobotu: 6,
  segunda: 1,
  "segunda-feira": 1,
  terça: 2,
  "terça-feira": 2,
  quarta: 3,
  "quarta-feira": 3,
  quinta: 4,
  "quinta-feira": 4,
  sexta: 5,
  "sexta-feira": 5,
});

const NEEDS_MODIFIER = new Set(
  ["segunda", "terça", "quarta", "quinta", "sexta", "segundas", "terças", "quartas", "quintas", "sextas"].map(fold),
);

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
    "v",
    "ve",
    "příští",
    "tento",
    "tuto",
    "toto",
    "tuhle",
    "na",
    "no",
    "nesta",
    "neste",
  ].map(fold),
);

const BLOCKED_ENDINGS = new Set(
  ["la mañana", "por la mañana", "de la mañana", "am morgen", "den morgen", "jeden morgen", "guten morgen"].map(fold),
);

const REPEAT_PHRASES = foldKeys<Repeat>({
  "every day": "daily",
  "each day": "daily",
  everyday: "daily",
  daily: "daily",
  "every weekday": "weekdays",
  "on weekdays": "weekdays",
  weekdays: "weekdays",
  "every week": "weekly",
  "each week": "weekly",
  weekly: "weekly",
  "every month": "monthly",
  monthly: "monthly",
  "every year": "yearly",
  yearly: "yearly",
  annually: "yearly",
  щодня: "daily",
  "кожного дня": "daily",
  "кожен день": "daily",
  щобудня: "weekdays",
  "по буднях": "weekdays",
  "у будні": "weekdays",
  щотижня: "weekly",
  "кожного тижня": "weekly",
  щомісяця: "monthly",
  "кожного місяця": "monthly",
  щороку: "yearly",
  "кожного року": "yearly",
  täglich: "daily",
  "jeden tag": "daily",
  werktags: "weekdays",
  "an werktagen": "weekdays",
  wöchentlich: "weekly",
  "jede woche": "weekly",
  monatlich: "monthly",
  "jeden monat": "monthly",
  jährlich: "yearly",
  "jedes jahr": "yearly",
  "cada día": "daily",
  "todos los días": "daily",
  "a diario": "daily",
  diariamente: "daily",
  "entre semana": "weekdays",
  "días laborables": "weekdays",
  "cada semana": "weekly",
  "todas las semanas": "weekly",
  semanalmente: "weekly",
  "cada mes": "monthly",
  "todos los meses": "monthly",
  mensualmente: "monthly",
  "cada año": "yearly",
  "todos los años": "yearly",
  anualmente: "yearly",
  "chaque jour": "daily",
  "tous les jours": "daily",
  quotidiennement: "daily",
  "en semaine": "weekdays",
  "chaque semaine": "weekly",
  "toutes les semaines": "weekly",
  "chaque mois": "monthly",
  "tous les mois": "monthly",
  mensuellement: "monthly",
  "chaque année": "yearly",
  "tous les ans": "yearly",
  "ogni giorno": "daily",
  "tutti i giorni": "daily",
  quotidianamente: "daily",
  "nei giorni feriali": "weekdays",
  "ogni settimana": "weekly",
  settimanalmente: "weekly",
  "ogni mese": "monthly",
  mensilmente: "monthly",
  "ogni anno": "yearly",
  annualmente: "yearly",
  "elke dag": "daily",
  dagelijks: "daily",
  "op werkdagen": "weekdays",
  "elke werkdag": "weekdays",
  "elke week": "weekly",
  wekelijks: "weekly",
  "elke maand": "monthly",
  maandelijks: "monthly",
  "elk jaar": "yearly",
  jaarlijks: "yearly",
  codziennie: "daily",
  "każdego dnia": "daily",
  "co dzień": "daily",
  "w dni robocze": "weekdays",
  "co tydzień": "weekly",
  "każdego tygodnia": "weekly",
  "co miesiąc": "monthly",
  "każdego miesiąca": "monthly",
  "co roku": "yearly",
  "każdego roku": "yearly",
  "každý den": "daily",
  denně: "daily",
  "každý všední den": "weekdays",
  "každý pracovní den": "weekdays",
  "ve všední dny": "weekdays",
  "v pracovní dny": "weekdays",
  "každý týden": "weekly",
  týdně: "weekly",
  "každý měsíc": "monthly",
  měsíčně: "monthly",
  "každý rok": "yearly",
  ročně: "yearly",
  "todos os dias": "daily",
  "todos os dias úteis": "weekdays",
  "nos dias úteis": "weekdays",
  "dias úteis": "weekdays",
  "todas as semanas": "weekly",
  "todos os meses": "monthly",
  mensalmente: "monthly",
  "todos os anos": "yearly",
});

const HABITUAL_WEEKDAYS = foldKeys({
  sundays: 0,
  mondays: 1,
  tuesdays: 2,
  wednesdays: 3,
  thursdays: 4,
  fridays: 5,
  saturdays: 6,
  неділях: 0,
  понеділках: 1,
  вівторках: 2,
  середах: 3,
  четвергах: 4,
  "п’ятницях": 5,
  суботах: 6,
  sonntags: 0,
  montags: 1,
  dienstags: 2,
  mittwochs: 3,
  donnerstags: 4,
  freitags: 5,
  samstags: 6,
  domingos: 0,
  sábados: 6,
  dimanches: 0,
  lundis: 1,
  mardis: 2,
  mercredis: 3,
  jeudis: 4,
  vendredis: 5,
  samedis: 6,
  domeniche: 0,
  sabati: 6,
  zondagen: 0,
  maandagen: 1,
  dinsdagen: 2,
  woensdagen: 3,
  donderdagen: 4,
  vrijdagen: 5,
  zaterdagen: 6,
  niedziele: 0,
  poniedziałki: 1,
  wtorki: 2,
  środy: 3,
  czwartki: 4,
  piątki: 5,
  soboty: 6,
  segundas: 1,
  "segundas-feiras": 1,
  terças: 2,
  "terças-feiras": 2,
  quartas: 3,
  "quartas-feiras": 3,
  quintas: 4,
  "quintas-feiras": 4,
  sextas: 5,
  "sextas-feiras": 5,
});

const EVERY_WORDS = new Set(
  [
    "every",
    "each",
    "кожного",
    "кожної",
    "кожен",
    "кожну",
    "jeden",
    "jede",
    "jedes",
    "cada",
    "todos",
    "todas",
    "chaque",
    "tous",
    "toutes",
    "ogni",
    "tutti",
    "tutte",
    "elke",
    "elk",
    "każdy",
    "każdą",
    "każdego",
    "co",
    "každý",
    "každé",
    "každou",
  ].map(fold),
);

const REPEAT_FILLERS = new Set(
  ["on", "the", "по", "у", "в", "los", "las", "les", "i", "le", "la", "w", "op", "am", "de", "os", "as", "aos"].map(
    fold,
  ),
);

const UKRAINIAN_EVERY = fold("що");

const IN_DAYS = new RegExp(
  `^(?:${["in", "через", "en", "dentro de", "dans", "tra", "fra", "over", "za", "em", "daqui a"].join("|")}) (\\d{1,3}) (?:${[
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
    "den",
    "dny",
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
  if (words.length === 1 && NEEDS_MODIFIER.has(words[0] ?? "")) return null;
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

const isRepeatFiller = (word: string) => EVERY_WORDS.has(word) || REPEAT_FILLERS.has(word);

const weekdayOnOrAfter = (today: string, weekday: number) =>
  addDays(today, (weekday - fromDateKey(today).getDay() + 7) % 7);

export const parseRepeatPhrase = (phrase: string, today: string): { repeat: Repeat; start: string | null } | null => {
  const normalized = fold(phrase.trim());
  const interval = REPEAT_PHRASES.get(normalized);
  if (interval) return { repeat: interval, start: null };

  const words = normalized.split(" ");
  const [single] = words;
  if (words.length === 1 && single?.startsWith(UKRAINIAN_EVERY)) {
    const weekday = WEEKDAYS.get(single.slice(UKRAINIAN_EVERY.length));
    if (weekday !== undefined) return { repeat: "weekly", start: weekdayOnOrAfter(today, weekday) };
  }

  const habitual = words.flatMap((word) => {
    const weekday = HABITUAL_WEEKDAYS.get(word);
    return weekday === undefined ? [] : [weekday];
  });
  const [habitualDay] = habitual;
  if (
    habitual.length === 1 &&
    habitualDay !== undefined &&
    !(words.length === 1 && NEEDS_MODIFIER.has(single ?? "")) &&
    words.every((word) => HABITUAL_WEEKDAYS.has(word) || isRepeatFiller(word))
  ) {
    return { repeat: "weekly", start: weekdayOnOrAfter(today, habitualDay) };
  }

  const days = words.flatMap((word) => {
    const weekday = WEEKDAYS.get(word);
    return weekday === undefined ? [] : [weekday];
  });
  const [day] = days;
  if (
    days.length === 1 &&
    day !== undefined &&
    words.some((word) => EVERY_WORDS.has(word)) &&
    words.every((word) => WEEKDAYS.has(word) || isRepeatFiller(word))
  ) {
    return { repeat: "weekly", start: weekdayOnOrAfter(today, day) };
  }

  return null;
};

const endsWithBlockedPhrase = (tokens: readonly string[], end: number) =>
  [2, 3].some((size) => end - size >= 0 && BLOCKED_ENDINGS.has(fold(tokens.slice(end - size, end).join(" "))));

const MENTION = /(^|\s)@/gu;

const sameText = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" }) === 0;

export const findProjectMention = (input: string, projects: readonly QuickAddProject[]) => {
  const names = projects
    .flatMap((project) => [project.name, project.label ?? project.name].map((name) => ({ id: project.id, name })))
    .filter(({ name }) => name !== "")
    .toSorted((a, b) => b.name.length - a.name.length);
  if (names.length === 0) return null;

  for (const match of input.matchAll(MENTION)) {
    const at = match.index + (match[1] ?? "").length;
    const rest = input.slice(at + 1);
    for (const { id, name } of names) {
      const next = rest.charAt(name.length);
      if (sameText(rest.slice(0, name.length), name) && (next === "" || /\s/u.test(next))) {
        return { projectId: id, start: at, end: at + 1 + name.length };
      }
    }
  }
  return null;
};

export const parseQuickAdd = (
  input: string,
  today: string,
  projects: readonly QuickAddProject[] = [],
): QuickAddResult => {
  const mention = findProjectMention(input, projects);
  const text = mention ? `${input.slice(0, mention.start)} ${input.slice(mention.end)}` : input;
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  const tags: string[] = [];
  let important = false;
  let dueDate: string | null = null;
  let repeat: Repeat | null = null;
  let repeatStart: string | null = null;
  let end = tokens.length;

  const takePhrase = <Value>(parse: (phrase: string) => Value | null): Value | null => {
    for (let size = MAX_PHRASE; size >= 1; size -= 1) {
      if (end - size < 1) continue;
      const value = parse(tokens.slice(end - size, end).join(" "));
      if (value !== null) {
        end -= size;
        return value;
      }
    }
    return null;
  };

  while (end > 1) {
    const token = tokens[end - 1] ?? "";
    if (IMPORTANT.test(token)) {
      important = true;
      end -= 1;
      continue;
    }
    if (TAG.test(token)) {
      tags.unshift(token);
      end -= 1;
      continue;
    }
    if (repeat === null) {
      const found = takePhrase((phrase) => parseRepeatPhrase(phrase, today));
      if (found) {
        repeat = found.repeat;
        repeatStart = found.start;
        continue;
      }
    }
    if (dueDate === null && !endsWithBlockedPhrase(tokens, end)) {
      const found = takePhrase((phrase) => parseDatePhrase(phrase, today));
      if (found) {
        dueDate = found;
        continue;
      }
    }
    break;
  }

  return {
    title: [...tokens.slice(0, end), ...tags].join(" "),
    dueDate: dueDate ?? repeatStart ?? (repeat ? today : null),
    important,
    repeat,
    projectId: mention?.projectId ?? null,
  };
};
