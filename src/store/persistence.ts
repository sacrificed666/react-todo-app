import { isRecord } from "@/lib/guards";
import { isListId, type ListId } from "@/lib/lists";
import { isSortMode } from "@/lib/sort";
import { getStorage, readJson, removeKey, writeText } from "@/lib/storage";
import { DEFAULT_THEME, isAccent, isAppearance, type ThemeSettings } from "@/lib/theme";
import { parseTodos, type Todo } from "@/lib/todo";

import { selectTodos } from "./selectors";
import { todosAdapter, todosReplaced } from "./slices/todosSlice";
import { initialViewState, type ViewState } from "./slices/viewSlice";
import type { AppStore, RootState } from "./store";

export const STORAGE_VERSION = 3;

export const STORAGE_KEYS = {
  todos: "react-todo-app/todos",
  preferences: "react-todo-app/preferences",
  legacyTodos: "toDoList",
} as const;

interface Preferences extends ThemeSettings {
  list: ListId;
  sort: ViewState["sort"];
  showCompleted: boolean;
}

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

const readListPreference = (preferences: Record<string, unknown>): ListId => {
  if (isListId(preferences.list)) return preferences.list;
  return preferences.filter === "completed" ? "completed" : initialViewState.list;
};

const loadPreferences = (storage: Storage): Preferences => {
  const stored = readJson(storage, STORAGE_KEYS.preferences);
  const preferences = isRecord(stored) ? stored : {};

  return {
    list: readListPreference(preferences),
    sort: isSortMode(preferences.sort) ? preferences.sort : initialViewState.sort,
    showCompleted:
      typeof preferences.showCompleted === "boolean" ? preferences.showCompleted : initialViewState.showCompleted,
    appearance: isAppearance(preferences.appearance) ? preferences.appearance : DEFAULT_THEME.appearance,
    accent: isAccent(preferences.accent) ? preferences.accent : DEFAULT_THEME.accent,
  };
};

const selectPreferences = (state: RootState): Preferences => ({
  list: state.view.list,
  sort: state.view.sort,
  showCompleted: state.view.showCompleted,
  appearance: state.settings.appearance,
  accent: state.settings.accent,
});

export const loadPersistedState = (storage: Storage | null = getStorage()): Partial<RootState> | undefined => {
  if (!storage) return undefined;

  const { appearance, accent, ...view } = loadPreferences(storage);

  return {
    todos: todosAdapter.setAll(todosAdapter.getInitialState(), loadTodos(storage)),
    view: { ...view, query: "" },
    settings: { appearance, accent },
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
  let preferences = JSON.stringify(selectPreferences(store.getState()));

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();

    if (state.todos !== todos) {
      todos = state.todos;
      writeText(storage, STORAGE_KEYS.todos, serializeTodos(selectTodos(state)));
    }

    const nextPreferences = JSON.stringify(selectPreferences(state));
    if (nextPreferences !== preferences) {
      preferences = nextPreferences;
      writeText(storage, STORAGE_KEYS.preferences, preferences);
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
