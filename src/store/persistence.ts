import { isRecord } from "@/lib/guards";
import { getStorage, readJson, removeKey, writeText } from "@/lib/storage";
import { parseTodos, type Todo } from "@/lib/todo";

import { selectTodos } from "./selectors";
import { todosAdapter, todosReplaced } from "./slices/todosSlice";
import { isFilter, type Filter } from "./slices/viewSlice";
import type { AppStore, RootState } from "./store";

export const STORAGE_VERSION = 2;

export const STORAGE_KEYS = {
  todos: "react-todo-app/todos",
  preferences: "react-todo-app/preferences",
  legacyTodos: "toDoList",
} as const;

export const serializeTodos = (todos: readonly Todo[]) => JSON.stringify({ version: STORAGE_VERSION, todos });

export const createExport = (todos: readonly Todo[], exportedAt: Date) => ({
  app: "react-todo-app",
  version: STORAGE_VERSION,
  exportedAt: exportedAt.toISOString(),
  todos,
});

const loadTodos = (storage: Storage): Todo[] => {
  const current = readJson(storage, STORAGE_KEYS.todos);
  if (current !== undefined) return parseTodos(current) ?? [];

  const legacy = readJson(storage, STORAGE_KEYS.legacyTodos);
  if (legacy === undefined) return [];

  const migrated = parseTodos(legacy) ?? [];
  if (writeText(storage, STORAGE_KEYS.todos, serializeTodos(migrated))) removeKey(storage, STORAGE_KEYS.legacyTodos);
  return migrated;
};

const loadFilter = (storage: Storage): Filter => {
  const preferences = readJson(storage, STORAGE_KEYS.preferences);
  const filter = isRecord(preferences) ? preferences.filter : undefined;
  return isFilter(filter) ? filter : "all";
};

export const loadPersistedState = (storage: Storage | null = getStorage()): Partial<RootState> | undefined => {
  if (!storage) return undefined;

  return {
    todos: todosAdapter.setAll(todosAdapter.getInitialState(), loadTodos(storage)),
    view: { filter: loadFilter(storage), query: "" },
  };
};

const parseStoredTodos = (value: string | null) => {
  if (value === null) return [];
  try {
    return parseTodos(JSON.parse(value) as unknown) ?? [];
  } catch {
    return [];
  }
};

export const startPersistence = (store: AppStore, storage: Storage | null = getStorage()): (() => void) => {
  if (!storage) return () => {};

  let todos = store.getState().todos;
  let filter = store.getState().view.filter;

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();

    if (state.todos !== todos) {
      todos = state.todos;
      writeText(storage, STORAGE_KEYS.todos, serializeTodos(selectTodos(state)));
    }

    if (state.view.filter !== filter) {
      filter = state.view.filter;
      writeText(storage, STORAGE_KEYS.preferences, JSON.stringify({ filter }));
    }
  });

  const handleStorage = (event: StorageEvent) => {
    if (event.storageArea !== storage) return;
    if (event.key !== null && event.key !== STORAGE_KEYS.todos) return;
    store.dispatch(todosReplaced(parseStoredTodos(event.newValue)));
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    unsubscribe();
    window.removeEventListener("storage", handleStorage);
  };
};
