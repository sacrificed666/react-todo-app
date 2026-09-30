import { nanoid } from "@reduxjs/toolkit";

import { isDateKey } from "./date";
import { isRecord } from "./guards";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  important: boolean;
  dueDate: string | null;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface TodoDraft {
  title: string;
  important?: boolean;
  dueDate?: string | null;
}

export const MAX_TITLE_LENGTH = 200;

export const normalizeTitle = (value: string) =>
  Array.from(value.replaceAll(/\s+/g, " ").trim()).slice(0, MAX_TITLE_LENGTH).join("").trim();

export const normalizeForSearch = (value: string) =>
  value
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();

export const createMatcher = (query: string) => {
  const needle = normalizeForSearch(query);
  return (title: string) => needle === "" || normalizeForSearch(title).includes(needle);
};

export const createTodo = (
  { title, important = false, dueDate = null }: TodoDraft,
  now: number,
  id: string = nanoid(),
): Todo => ({
  id,
  title: normalizeTitle(title),
  completed: false,
  important,
  dueDate: isDateKey(dueDate) ? dueDate : null,
  createdAt: now,
  updatedAt: now,
  completedAt: null,
});

const toTimestamp = (value: unknown, fallback: number) => {
  const timestamp = typeof value === "string" ? Date.parse(value) : value;
  return typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0 ? timestamp : fallback;
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

    const rawId = typeof entry.id === "string" ? entry.id.trim() : "";
    const id = rawId && !seen.has(rawId) ? rawId : nanoid();
    seen.add(id);

    const completed = entry.completed === true || entry.isCompleted === true;
    const createdAt = toTimestamp(entry.createdAt, now);
    const updatedAt = Math.max(toTimestamp(entry.updatedAt, createdAt), createdAt);

    return [
      {
        id,
        title,
        completed,
        important: entry.important === true,
        dueDate: isDateKey(entry.dueDate) ? entry.dueDate : null,
        createdAt,
        updatedAt,
        completedAt: completed ? toTimestamp(entry.completedAt, updatedAt) : null,
      },
    ];
  });
};
