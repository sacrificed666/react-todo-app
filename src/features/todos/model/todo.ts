import { nanoid } from "@reduxjs/toolkit";

import { isDateKey, toDateKey } from "@/shared/lib/date";
import { isEntityId, isRecord, readTimestamp } from "@/shared/lib/guards";
import { normalizeForSearch } from "@/shared/lib/text";

export const REPEATS = ["daily", "weekdays", "weekly", "monthly", "yearly"] as const;

export type Repeat = (typeof REPEATS)[number];

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  important: boolean;
  dueDate: string | null;
  repeat: Repeat | null;
  repeatAnchor: string | null;
  projectId: string | null;
  notes: string;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface TodoDraft {
  title: string;
  important?: boolean;
  dueDate?: string | null;
  repeat?: Repeat | null;
  projectId?: string | null;
  notes?: string;
}

export const isRepeat = (value: unknown): value is Repeat =>
  typeof value === "string" && (REPEATS as readonly string[]).includes(value);

export const MAX_TITLE_LENGTH = 200;
export const MAX_NOTES_LENGTH = 2000;

const TAG = /(^|\s)#([\p{L}\p{N}_-]+)/gu;

export const normalizeTitle = (value: string) =>
  Array.from(value.replaceAll(/\s+/g, " ").trim()).slice(0, MAX_TITLE_LENGTH).join("").trim();

export const normalizeNotes = (value: string) =>
  Array.from(value.replaceAll("\r\n", "\n").trimEnd()).slice(0, MAX_NOTES_LENGTH).join("");

export const extractTags = (title: string) => [...title.matchAll(TAG)].map((match) => `#${match[2] ?? ""}`);

export const stripTags = (title: string) => title.replaceAll(TAG, "$1").replaceAll(/\s+/g, " ").trim();

export const createMatcher = (query: string) => {
  const needle = normalizeForSearch(query);
  return (title: string) => needle === "" || normalizeForSearch(title).includes(needle);
};

export const createTodo = (
  { title, important = false, dueDate = null, repeat = null, projectId = null, notes = "" }: TodoDraft,
  now: number,
  id: string = nanoid(),
): Todo => {
  const date = isDateKey(dueDate) ? dueDate : repeat ? toDateKey(new Date(now)) : null;
  return {
    id,
    title: normalizeTitle(title),
    completed: false,
    important,
    dueDate: date,
    repeat,
    repeatAnchor: repeat ? date : null,
    projectId: isEntityId(projectId) ? projectId : null,
    notes: normalizeNotes(notes),
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
};

const readList = (input: unknown): unknown[] | null => {
  if (Array.isArray(input)) return input;
  if (isRecord(input) && Array.isArray(input.todos)) return input.todos;
  return null;
};

export const parseTodos = (input: unknown, now: number = Date.now()): Todo[] | null => {
  const list = readList(input);
  if (!list) return null;

  const seen = new Set<string>();

  return list.flatMap((entry) => {
    if (!isRecord(entry)) return [];

    const rawTitle = typeof entry.title === "string" ? entry.title : entry.text;
    const title = typeof rawTitle === "string" ? normalizeTitle(rawTitle) : "";
    if (!title) return [];

    const rawId = typeof entry.id === "number" ? String(entry.id) : typeof entry.id === "string" ? entry.id.trim() : "";
    const id = isEntityId(rawId) && !seen.has(rawId) ? rawId : nanoid();
    seen.add(id);

    const completed = entry.completed === true || entry.isCompleted === true;
    const createdAt = readTimestamp(entry.createdAt, now);
    const updatedAt = Math.max(readTimestamp(entry.updatedAt, createdAt), createdAt);

    const dueDate = isDateKey(entry.dueDate) ? entry.dueDate : null;
    const repeat = dueDate !== null && isRepeat(entry.repeat) ? entry.repeat : null;
    const anchor =
      isDateKey(entry.repeatAnchor) && dueDate !== null && entry.repeatAnchor <= dueDate ? entry.repeatAnchor : dueDate;

    return [
      {
        id,
        title,
        completed,
        important: entry.important === true,
        dueDate,
        repeat,
        repeatAnchor: repeat ? anchor : null,
        projectId: isEntityId(entry.projectId) ? entry.projectId : null,
        notes: typeof entry.notes === "string" ? normalizeNotes(entry.notes) : "",
        createdAt,
        updatedAt,
        completedAt: completed ? readTimestamp(entry.completedAt, updatedAt) : null,
      },
    ];
  });
};
