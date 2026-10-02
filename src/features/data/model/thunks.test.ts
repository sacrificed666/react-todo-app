import { describe, expect, it, vi } from "vitest";

import { setupStore } from "@/app/store";
import { createTranslator } from "@/features/i18n/model/translate";
import { formatMessage } from "@/features/notifications/model/format";
import { selectToast } from "@/features/notifications/model/selectors";
import { selectProjects } from "@/features/projects/model/selectors";
import { selectTodos } from "@/features/todos/model/selectors";
import { removeTodos } from "@/features/todos/model/thunks";
import { todoRenamed } from "@/features/todos/model/todosSlice";
import * as download from "@/shared/lib/download";
import { makeProject, makeState, makeTodo, sampleTodos } from "@/test/factories";

import { exportData, importData, redo, undo } from "./thunks";

type Store = ReturnType<typeof setupStore>;

const titles = (store: Store) => selectTodos(store.getState()).map((todo) => todo.title);

const toastText = (store: Store, locale: "en" | "uk" = "en") => {
  const toast = selectToast(store.getState());
  return toast ? formatMessage(createTranslator(locale), toast.message) : null;
};

const work = makeProject({ id: "work", name: "Work" });

describe("importData", () => {
  it("imports new todos from an export file", () => {
    const store = setupStore(makeState(sampleTodos));
    const file = JSON.stringify({
      todos: [makeTodo({ id: "milk", title: "Buy milk" }), makeTodo({ id: "new", title: "Imported", important: true })],
    });

    store.dispatch(importData(file));

    expect(titles(store)).toEqual(["Buy milk", "Write the quarterly report", "Call grandma", "Imported"]);
    expect(selectTodos(store.getState()).at(-1)?.important).toBe(true);
    expect(toastText(store)).toBe("Imported 1 task");
  });

  it("imports projects together with their tasks", () => {
    const store = setupStore(makeState(sampleTodos));
    const file = JSON.stringify({
      todos: [makeTodo({ id: "deck", title: "Slides", projectId: "work" })],
      projects: [work],
    });

    store.dispatch(importData(file));

    expect(selectProjects(store.getState())).toEqual([work]);
    expect(selectTodos(store.getState()).at(-1)?.projectId).toBe("work");
  });

  it("reports projects when they are the only new data", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(importData(JSON.stringify({ todos: sampleTodos, projects: [work] })));
    expect(toastText(store)).toBe("Imported 1 project");
    expect(toastText(store, "uk")).toBe("Імпортовано 1 проєкт");
  });

  it("reports when nothing new was found", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(importData(JSON.stringify(sampleTodos)));
    expect(toastText(store)).toBe("Nothing new to import");
  });

  it("rejects invalid files", () => {
    const store = setupStore();
    store.dispatch(importData("{not json"));
    expect(selectToast(store.getState())?.tone).toBe("error");
    expect(toastText(store)).toBe("This file is not a valid ToDo export");
  });
});

describe("exportData", () => {
  it("downloads every todo and project with metadata", () => {
    const downloadJson = vi.spyOn(download, "downloadJson").mockImplementation(() => {});
    const store = setupStore(makeState(sampleTodos, "all", "", [work]));

    store.dispatch(exportData());

    expect(downloadJson).toHaveBeenCalledWith(
      expect.stringMatching(/^todos-\d{4}-\d{2}-\d{2}\.json$/),
      expect.objectContaining({ app: "react-todo-app", todos: sampleTodos, projects: [work] }),
    );
  });
});

describe("undo and redo", () => {
  it("steps through the history and describes each step", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(todoRenamed("milk", "Buy oat milk"));
    store.dispatch(removeTodos(["call"]));

    store.dispatch(undo());
    expect(titles(store)).toEqual(["Buy oat milk", "Write the quarterly report", "Call grandma"]);
    expect(toastText(store)).toBe("Undone: delete 1 task");

    store.dispatch(undo());
    expect(titles(store)).toEqual(["Buy milk", "Write the quarterly report", "Call grandma"]);
    expect(toastText(store, "uk")).toBe("Скасовано: перейменування «Buy milk»");

    store.dispatch(redo());
    expect(titles(store)).toEqual(["Buy oat milk", "Write the quarterly report", "Call grandma"]);
    expect(toastText(store)).toBe("Redone: rename “Buy milk”");
  });

  it("does nothing without history", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(undo());
    store.dispatch(redo());
    expect(titles(store)).toHaveLength(3);
    expect(selectToast(store.getState())).toBeNull();
  });
});
