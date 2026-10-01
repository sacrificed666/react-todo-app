import { toDateKey } from "@/shared/lib/date";

import { parseTodos, type Todo } from "./todo";

export const DATA_VERSION = 4;
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const MAX_IMPORT_TODOS = 5000;

export const createExport = (todos: readonly Todo[], exportedAt: Date) => ({
  app: "react-todo-app",
  version: DATA_VERSION,
  exportedAt: exportedAt.toISOString(),
  todos,
});

export const exportFileName = (date: Date) => `todos-${toDateKey(date)}.json`;

export const readImport = (text: string): Todo[] | null => {
  if (text.length > MAX_IMPORT_BYTES) return null;

  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    return null;
  }

  const todos = parseTodos(data);
  return todos ? todos.slice(0, MAX_IMPORT_TODOS) : null;
};
