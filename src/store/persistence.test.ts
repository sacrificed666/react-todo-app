import { describe, expect, it } from "vitest";

import { readJson } from "@/lib/storage";
import { parseTodos } from "@/lib/todo";
import { makeTodo, sampleTodos } from "@/test/factories";

import { createExport, loadPersistedState, serializeTodos, startPersistence, STORAGE_KEYS } from "./persistence";
import { selectTodos } from "./selectors";
import { todoAdded } from "./slices/todosSlice";
import { filterChanged } from "./slices/viewSlice";
import { setupStore } from "./store";

const storedTitles = () => (parseTodos(readJson(localStorage, STORAGE_KEYS.todos)) ?? []).map((todo) => todo.title);

describe("loadPersistedState", () => {
  it("reads saved todos and preferences", () => {
    localStorage.setItem(STORAGE_KEYS.todos, serializeTodos(sampleTodos));
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ filter: "active" }));

    const store = setupStore(loadPersistedState());

    expect(selectTodos(store.getState())).toEqual(sampleTodos);
    expect(store.getState().view).toEqual({ filter: "active", query: "" });
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
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({ filter: "everything" }));

    const state = setupStore(loadPersistedState()).getState();

    expect(selectTodos(state)).toEqual([]);
    expect(state.view.filter).toBe("all");
  });

  it("skips persistence when storage is unavailable", () => {
    expect(loadPersistedState(null)).toBeUndefined();
    expect(() => startPersistence(setupStore(), null)()).not.toThrow();
  });
});

describe("startPersistence", () => {
  it("saves todos and the selected filter", () => {
    const store = setupStore();
    const stop = startPersistence(store);

    store.dispatch(todoAdded("Persist me"));
    store.dispatch(filterChanged("completed"));

    expect(storedTitles()).toEqual(["Persist me"]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.preferences) ?? "{}")).toEqual({ filter: "completed" });

    stop();
    store.dispatch(todoAdded("Not saved"));
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

describe("createExport", () => {
  it("wraps todos with metadata", () => {
    expect(createExport(sampleTodos, new Date("2026-09-30T10:00:00.000Z"))).toEqual({
      app: "react-todo-app",
      version: 2,
      exportedAt: "2026-09-30T10:00:00.000Z",
      todos: sampleTodos,
    });
  });
});
