import { isListId, type ListId } from "@/features/lists/model/lists";
import { isSortMode } from "@/features/lists/model/sort";
import { initialViewState, type ViewPreferences } from "@/features/lists/model/viewSlice";
import { readSettings, type Settings } from "@/features/settings/model/settings";
import { selectTodos } from "@/features/todos/model/selectors";
import { parseTodos, type Todo } from "@/features/todos/model/todo";
import { todosAdapter, todosReplaced } from "@/features/todos/model/todosSlice";
import { DATA_VERSION } from "@/features/todos/model/transfer";
import { isRecord } from "@/shared/lib/guards";
import { getStorage, readJson, removeKey, writeText } from "@/shared/lib/storage";

import type { AppStore, RootState } from "./store";

export const STORAGE_KEYS = {
  todos: "react-todo-app/todos",
  preferences: "react-todo-app/preferences",
  legacyTodos: "toDoList",
} as const;

type Preferences = Settings & ViewPreferences;

export const serializeTodos = (todos: readonly Todo[]) => JSON.stringify({ version: DATA_VERSION, todos });

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

const loadPreferences = (storage: Storage, languages: readonly string[]): Preferences => {
  const stored = readJson(storage, STORAGE_KEYS.preferences);
  const preferences = isRecord(stored) ? stored : {};

  return {
    ...readSettings(preferences, languages),
    list: readListPreference(preferences),
    sort: isSortMode(preferences.sort) ? preferences.sort : initialViewState.sort,
    showCompleted:
      typeof preferences.showCompleted === "boolean" ? preferences.showCompleted : initialViewState.showCompleted,
  };
};

const selectPreferences = (state: RootState): Preferences => ({
  list: state.view.list,
  sort: state.view.sort,
  showCompleted: state.view.showCompleted,
  appearance: state.settings.appearance,
  accent: state.settings.accent,
  locale: state.settings.locale,
  effects: state.settings.effects,
});

export const loadPersistedState = (
  storage: Storage | null = getStorage(),
  languages: readonly string[] = globalThis.navigator.languages,
): Partial<RootState> | undefined => {
  if (!storage) return undefined;

  const { appearance, accent, locale, effects, ...view } = loadPreferences(storage, languages);

  return {
    todos: todosAdapter.setAll(todosAdapter.getInitialState(), loadTodos(storage)),
    view: { ...initialViewState, ...view },
    settings: { appearance, accent, locale, effects },
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
