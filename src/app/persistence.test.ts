import { describe, expect, it } from "vitest";

import { serializeData } from "@/features/data/model/document";
import { listChanged, sortChanged } from "@/features/lists/model/viewSlice";
import { projectAdded } from "@/features/projects/model/projectsSlice";
import { selectProjects } from "@/features/projects/model/selectors";
import {
  accentChanged,
  appearanceChanged,
  backdropChanged,
  glassChanged,
  localeChanged,
} from "@/features/settings/model/settingsSlice";
import { selectTodos } from "@/features/todos/model/selectors";
import { parseTodos } from "@/features/todos/model/todo";
import { todoAdded } from "@/features/todos/model/todosSlice";
import { readJson } from "@/shared/lib/storage";
import { makeProject, makeTodo, sampleTodos } from "@/test/factories";

import { loadPersistedState, startPersistence, STORAGE_KEYS } from "./persistence";
import { setupStore } from "./store";

const storedTitles = () => (parseTodos(readJson(localStorage, STORAGE_KEYS.data)) ?? []).map((todo) => todo.title);

const work = makeProject({ id: "work", name: "Work" });

const serializeTodos = (todos: Parameters<typeof serializeData>[0]["todos"]) => serializeData({ todos, projects: [] });

describe("loadPersistedState", () => {
  it("reads saved todos, projects and preferences", () => {
    localStorage.setItem(STORAGE_KEYS.data, serializeData({ todos: sampleTodos, projects: [work] }));
    localStorage.setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({
        list: "project:work",
        sort: "dueDate",
        showCompleted: false,
        appearance: "light",
        accent: "forest",
        backdrop: "ocean",
        glass: "tinted",
      }),
    );

    const store = setupStore(loadPersistedState());

    expect(selectTodos(store.getState())).toEqual(sampleTodos);
    expect(selectProjects(store.getState())).toEqual([work]);
    expect(store.getState().view).toEqual({
      list: "project:work",
      query: "",
      sort: "dueDate",
      showCompleted: false,
      detailsId: null,
      overlay: null,
    });
    expect(store.getState().settings).toEqual({
      appearance: "light",
      accent: "forest",
      backdrop: "ocean",
      glass: "tinted",
      locale: "en",
      effects: "auto",
    });
  });

  it("opens all tasks when the saved project no longer exists", () => {
    localStorage.setItem(STORAGE_KEYS.data, serializeTodos(sampleTodos));
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ list: "project:gone" }));
    expect(setupStore(loadPersistedState()).getState().view.list).toBe("all");
  });

  it("detects the language on the first launch and keeps the saved one afterwards", () => {
    expect(loadPersistedState(localStorage, ["uk-UA", "en"])?.settings?.locale).toBe("uk");
    expect(loadPersistedState(localStorage, ["de-DE"])?.settings?.locale).toBe("de");
    expect(loadPersistedState(localStorage, ["ja-JP", "fr-CA"])?.settings?.locale).toBe("fr");
    expect(loadPersistedState(localStorage, ["pt-BR"])?.settings?.locale).toBe("pt");
    expect(loadPersistedState(localStorage, ["ja-JP"])?.settings?.locale).toBe("en");

    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ locale: "en" }));
    expect(loadPersistedState(localStorage, ["uk-UA"])?.settings?.locale).toBe("en");
  });

  it("maps the old filter preference to a list", () => {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ filter: "completed" }));
    expect(setupStore(loadPersistedState()).getState().view.list).toBe("completed");
  });

  it("moves data saved under the keys of the app before its rename", () => {
    localStorage.setItem(
      STORAGE_KEYS.legacyData,
      JSON.stringify({ todos: [makeTodo({ id: "kept", title: "Kept" })], projects: [] }),
    );
    localStorage.setItem(STORAGE_KEYS.legacyPreferences, JSON.stringify({ accent: "forest" }));

    const store = setupStore(loadPersistedState());

    expect(selectTodos(store.getState()).map((todo) => todo.title)).toEqual(["Kept"]);
    expect(store.getState().settings.accent).toBe("forest");
    expect(localStorage.getItem(STORAGE_KEYS.legacyData)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.legacyPreferences)).toBeNull();
  });

  it("migrates todos saved in the legacy format", () => {
    localStorage.setItem(STORAGE_KEYS.legacyTodos, JSON.stringify([{ id: "1", text: "Old task", isCompleted: false }]));

    const store = setupStore(loadPersistedState());

    expect(selectTodos(store.getState()).map((todo) => todo.title)).toEqual(["Old task"]);
    expect(localStorage.getItem(STORAGE_KEYS.legacyTodos)).toBeNull();
    expect(storedTitles()).toEqual(["Old task"]);
  });

  it("falls back to defaults for corrupted data", () => {
    localStorage.setItem(STORAGE_KEYS.data, "{broken");
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ list: "everything", sort: 1, accent: "magenta" }));

    const state = setupStore(loadPersistedState()).getState();

    expect(selectTodos(state)).toEqual([]);
    expect(state.view).toMatchObject({ list: "all", sort: "manual", showCompleted: true });
    expect(state.settings).toEqual({
      appearance: "system",
      accent: "blue",
      backdrop: "aurora",
      glass: "clear",
      locale: "en",
      effects: "auto",
    });
  });

  it("skips persistence when storage is unavailable", () => {
    expect(loadPersistedState(null)).toBeUndefined();
    expect(() => startPersistence(setupStore(), null)()).not.toThrow();
  });
});

describe("startPersistence", () => {
  it("saves todos and preferences", () => {
    const store = setupStore();
    const stop = startPersistence(store);

    store.dispatch(todoAdded({ title: "Persist me" }));
    store.dispatch(listChanged("important"));
    store.dispatch(sortChanged("newest"));
    store.dispatch(appearanceChanged("dark"));
    store.dispatch(accentChanged("violet"));
    store.dispatch(backdropChanged("nebula"));
    store.dispatch(glassChanged("tinted"));
    store.dispatch(localeChanged("uk"));
    store.dispatch(projectAdded({ name: "Work" }));

    expect(storedTitles()).toEqual(["Persist me"]);
    expect(readJson(localStorage, STORAGE_KEYS.data)).toMatchObject({ projects: [{ name: "Work" }] });
    expect(readJson(localStorage, STORAGE_KEYS.preferences)).toEqual({
      list: "important",
      sort: "newest",
      showCompleted: true,
      appearance: "dark",
      accent: "violet",
      backdrop: "nebula",
      glass: "tinted",
      locale: "uk",
      effects: "auto",
    });

    stop();
    store.dispatch(todoAdded({ title: "Not saved" }));
    expect(storedTitles()).toEqual(["Persist me"]);
  });

  it("syncs changes made in another tab", () => {
    const store = setupStore();
    const stop = startPersistence(store);
    const external = serializeTodos([makeTodo({ id: "remote", title: "From another tab" })]);

    window.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEYS.data, newValue: external, storageArea: localStorage }),
    );
    expect(selectTodos(store.getState()).map((todo) => todo.id)).toEqual(["remote"]);

    window.dispatchEvent(new StorageEvent("storage", { key: null, newValue: null, storageArea: localStorage }));
    expect(selectTodos(store.getState())).toEqual([]);

    window.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEYS.preferences, newValue: "{}", storageArea: localStorage }),
    );
    expect(selectTodos(store.getState())).toEqual([]);

    stop();
  });
});
