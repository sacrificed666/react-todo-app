import { dataReplaced, type DataSnapshot } from "@/features/data/model/actions";
import { parseData, serializeData } from "@/features/data/model/document";
import { isViewId, projectIdOf, type ViewId } from "@/features/lists/model/lists";
import { isSortMode } from "@/features/lists/model/sort";
import { initialViewState, type ViewPreferences } from "@/features/lists/model/viewSlice";
import { projectsAdapter } from "@/features/projects/model/projectsSlice";
import { selectProjects } from "@/features/projects/model/selectors";
import { readSettings, type Settings } from "@/features/settings/model/settings";
import { selectTodos } from "@/features/todos/model/selectors";
import { todosAdapter } from "@/features/todos/model/todosSlice";
import { isRecord } from "@/shared/lib/guards";
import { getStorage, readJson, removeKey, writeText } from "@/shared/lib/storage";

import type { AppStore, RootState } from "./store";

export const STORAGE_KEYS = {
  data: "react-todo-app/todos",
  preferences: "react-todo-app/preferences",
  legacyTodos: "toDoList",
} as const;

type Preferences = Settings & ViewPreferences;

const EMPTY_DATA: DataSnapshot = { todos: [], projects: [] };

const loadData = (storage: Storage): DataSnapshot => {
  const current = readJson(storage, STORAGE_KEYS.data);
  if (current !== undefined) return parseData(current) ?? EMPTY_DATA;

  const legacy = readJson(storage, STORAGE_KEYS.legacyTodos);
  if (legacy === undefined) return EMPTY_DATA;

  const migrated = parseData(legacy) ?? EMPTY_DATA;
  if (writeText(storage, STORAGE_KEYS.data, serializeData(migrated))) removeKey(storage, STORAGE_KEYS.legacyTodos);
  return migrated;
};

const readListPreference = (preferences: Record<string, unknown>, data: DataSnapshot): ViewId => {
  if (isViewId(preferences.list)) {
    const projectId = projectIdOf(preferences.list);
    if (projectId === null || data.projects.some((project) => project.id === projectId)) return preferences.list;
    return initialViewState.list;
  }
  return preferences.filter === "completed" ? "completed" : initialViewState.list;
};

const loadPreferences = (storage: Storage, languages: readonly string[], data: DataSnapshot): Preferences => {
  const stored = readJson(storage, STORAGE_KEYS.preferences);
  const preferences = isRecord(stored) ? stored : {};

  return {
    ...readSettings(preferences, languages),
    list: readListPreference(preferences, data),
    sort: isSortMode(preferences.sort) ? preferences.sort : initialViewState.sort,
    showCompleted:
      typeof preferences.showCompleted === "boolean" ? preferences.showCompleted : initialViewState.showCompleted,
  };
};

const selectPreferences = (state: RootState): Preferences => ({
  list: state.view.list,
  sort: state.view.sort,
  showCompleted: state.view.showCompleted,
  ...state.settings,
});

export const loadPersistedState = (
  storage: Storage | null = getStorage(),
  languages: readonly string[] = globalThis.navigator.languages,
): Partial<RootState> | undefined => {
  if (!storage) return undefined;

  const data = loadData(storage);
  const { list, sort, showCompleted, ...settings } = loadPreferences(storage, languages, data);

  return {
    todos: todosAdapter.setAll(todosAdapter.getInitialState(), data.todos),
    projects: projectsAdapter.setAll(projectsAdapter.getInitialState(), data.projects),
    view: { ...initialViewState, list, sort, showCompleted },
    settings,
  };
};

const parseStoredData = (value: string | null): DataSnapshot => {
  if (value === null) return EMPTY_DATA;
  try {
    return parseData(JSON.parse(value) as unknown) ?? EMPTY_DATA;
  } catch {
    return EMPTY_DATA;
  }
};

export const startPersistence = (store: AppStore, storage: Storage | null = getStorage()): (() => void) => {
  if (!storage) return () => {};

  let { todos, projects } = store.getState();
  let preferences = JSON.stringify(selectPreferences(store.getState()));

  const unsubscribe = store.subscribe(() => {
    const state = store.getState();

    if (state.todos !== todos || state.projects !== projects) {
      ({ todos, projects } = state);
      writeText(
        storage,
        STORAGE_KEYS.data,
        serializeData({ todos: selectTodos(state), projects: selectProjects(state) }),
      );
    }

    const nextPreferences = JSON.stringify(selectPreferences(state));
    if (nextPreferences !== preferences) {
      preferences = nextPreferences;
      writeText(storage, STORAGE_KEYS.preferences, preferences);
    }
  });

  const handleStorage = (event: StorageEvent) => {
    if (event.storageArea !== storage) return;
    if (event.key !== null && event.key !== STORAGE_KEYS.data) return;
    store.dispatch(dataReplaced(parseStoredData(event.newValue)));
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    unsubscribe();
    window.removeEventListener("storage", handleStorage);
  };
};
