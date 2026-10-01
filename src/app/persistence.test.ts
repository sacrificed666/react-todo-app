import { describe, expect, it } from "vitest";

import { listChanged, sortChanged } from "@/features/lists/model/viewSlice";
import { accentChanged, appearanceChanged, localeChanged } from "@/features/settings/model/settingsSlice";
import { selectTodos } from "@/features/todos/model/selectors";
import { parseTodos } from "@/features/todos/model/todo";
import { todoAdded } from "@/features/todos/model/todosSlice";
import { readJson } from "@/shared/lib/storage";
import { makeTodo, sampleTodos } from "@/test/factories";

import { loadPersistedState, serializeTodos, startPersistence, STORAGE_KEYS } from "./persistence";
import { setupStore } from "./store";

const storedTitles = () => (parseTodos(readJson(localStorage, STORAGE_KEYS.todos)) ?? []).map((todo) => todo.title);

describe("loadPersistedState", () => {
  it("reads saved todos and preferences", () => {
    localStorage.setItem(STORAGE_KEYS.todos, serializeTodos(sampleTodos));
    localStorage.setItem(
      STORAGE_KEYS.preferences,
      JSON.stringify({ list: "today", sort: "dueDate", showCompleted: false, appearance: "light", accent: "forest" }),
    );

    const store = setupStore(loadPersistedState());

    expect(selectTodos(store.getState())).toEqual(sampleTodos);
    expect(store.getState().view).toEqual({
      list: "today",
      query: "",
      sort: "dueDate",
      showCompleted: false,
      detailsId: null,
      paletteOpen: false,
    });
    expect(store.getState().settings).toEqual({ appearance: "light", accent: "forest", locale: "en" });
  });

  it("detects the language on the first launch and keeps the saved one afterwards", () => {
    expect(loadPersistedState(localStorage, ["uk-UA", "en"])?.settings?.locale).toBe("uk");
    expect(loadPersistedState(localStorage, ["de-DE"])?.settings?.locale).toBe("en");

    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ locale: "en" }));
    expect(loadPersistedState(localStorage, ["uk-UA"])?.settings?.locale).toBe("en");
  });

  it("maps the filter saved by version 2", () => {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ filter: "completed" }));
    expect(setupStore(loadPersistedState()).getState().view.list).toBe("completed");
  });

  it("migrates todos saved by the previous version", () => {
    localStorage.setItem(STORAGE_KEYS.legacyTodos, JSON.stringify([{ id: "1", text: "Old task", isCompleted: false }]));

    const store = setupStore(loadPersistedState());

    expect(selectTodos(store.getState()).map((todo) => todo.title)).toEqual(["Old task"]);
    expect(localStorage.getItem(STORAGE_KEYS.legacyTodos)).toBeNull();
    expect(storedTitles()).toEqual(["Old task"]);
  });

  it("falls back to defaults for corrupted data", () => {
    localStorage.setItem(STORAGE_KEYS.todos, "{broken");
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ list: "everything", sort: 1, accent: "pink" }));

    const state = setupStore(loadPersistedState()).getState();

    expect(selectTodos(state)).toEqual([]);
    expect(state.view).toMatchObject({ list: "all", sort: "manual", showCompleted: true });
    expect(state.settings).toEqual({ appearance: "system", accent: "blue", locale: "en" });
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
    store.dispatch(localeChanged("uk"));

    expect(storedTitles()).toEqual(["Persist me"]);
    expect(readJson(localStorage, STORAGE_KEYS.preferences)).toEqual({
      list: "important",
      sort: "newest",
      showCompleted: true,
      appearance: "dark",
      accent: "violet",
      locale: "uk",
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
      new StorageEvent("storage", { key: STORAGE_KEYS.todos, newValue: external, storageArea: localStorage }),
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
