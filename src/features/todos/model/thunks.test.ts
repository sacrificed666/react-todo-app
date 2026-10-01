import { describe, expect, it, vi } from "vitest";

import { setupStore } from "@/app/store";
import { createTranslator } from "@/features/i18n/model/translate";
import { queryChanged } from "@/features/lists/model/viewSlice";
import { formatMessage } from "@/features/notifications/model/format";
import { selectToast } from "@/features/notifications/model/selectors";
import * as download from "@/shared/lib/download";
import { dayFromToday, makeState, makeTodo, sampleTodos, todayKey } from "@/test/factories";

import { selectTodos } from "./selectors";
import {
  addTodo,
  clearCompleted,
  duplicateTodo,
  exportTodos,
  importTodos,
  redo,
  removeTodos,
  toggleTodo,
  undo,
  undoRemoval,
} from "./thunks";
import { todoRenamed } from "./todosSlice";

type Store = ReturnType<typeof setupStore>;

const titles = (store: Store) => selectTodos(store.getState()).map((todo) => todo.title);

const toastText = (store: Store, locale: "en" | "uk" = "en") => {
  const toast = selectToast(store.getState());
  return toast ? formatMessage(createTranslator(locale), toast.message) : null;
};

describe("addTodo", () => {
  it("adds normalized todos and reports success", () => {
    const store = setupStore();
    expect(store.dispatch(addTodo({ title: "  Plan   the trip ", important: true }))).toBe(true);
    expect(selectTodos(store.getState())[0]).toMatchObject({ title: "Plan the trip", important: true });
  });

  it("rejects blank titles", () => {
    const store = setupStore();
    expect(store.dispatch(addTodo({ title: "   " }))).toBe(false);
    expect(titles(store)).toEqual([]);
  });

  it("reveals the new todo when the list or search would hide it", () => {
    const store = setupStore(makeState(sampleTodos, "today", "report"));
    store.dispatch(addTodo({ title: "Buy flowers" }));
    expect(store.getState().view).toMatchObject({ list: "all", query: "" });
  });

  it("stays in the current list when the new todo belongs there", () => {
    const store = setupStore(makeState([], "upcoming"));
    store.dispatch(queryChanged("flow"));
    store.dispatch(addTodo({ title: "Buy flowers", dueDate: dayFromToday(2) }));
    expect(store.getState().view).toMatchObject({ list: "upcoming", query: "flow" });
  });
});

describe("removal and undo", () => {
  it("removes todos and offers to undo", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(removeTodos(["call", "milk"]));

    expect(titles(store)).toEqual(["Write the quarterly report"]);
    expect(selectToast(store.getState())).toMatchObject({
      message: { key: "toast.deletedMany", params: { count: 2 } },
      tone: "neutral",
      action: { type: "restore" },
    });
    expect(toastText(store)).toBe("Deleted 2 tasks");
    expect(toastText(store, "uk")).toBe("Видалено 2 завдання");

    store.dispatch(undoRemoval());
    expect(titles(store)).toEqual(["Buy milk", "Write the quarterly report", "Call grandma"]);
    expect(selectToast(store.getState())).toBeNull();
  });

  it("names a single deleted todo", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(removeTodos(["milk"]));
    expect(toastText(store)).toBe("Deleted “Buy milk”");
    expect(toastText(store, "uk")).toBe("Видалено «Buy milk»");
  });

  it("ignores unknown ids", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(removeTodos(["missing"]));
    expect(selectToast(store.getState())).toBeNull();
    store.dispatch(undoRemoval());
    expect(titles(store)).toHaveLength(3);
  });

  it("clears completed todos", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(clearCompleted());
    expect(titles(store)).toEqual(["Buy milk", "Call grandma"]);
    expect(toastText(store)).toBe("Cleared 1 completed task");
  });
});

describe("importTodos", () => {
  it("imports new todos from an export file", () => {
    const store = setupStore(makeState(sampleTodos));
    const file = JSON.stringify({
      todos: [makeTodo({ id: "milk", title: "Buy milk" }), makeTodo({ id: "new", title: "Imported", important: true })],
    });

    store.dispatch(importTodos(file));

    expect(titles(store)).toEqual(["Buy milk", "Write the quarterly report", "Call grandma", "Imported"]);
    expect(selectTodos(store.getState()).at(-1)?.important).toBe(true);
    expect(toastText(store)).toBe("Imported 1 task");
  });

  it("reports when nothing new was found", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(importTodos(JSON.stringify(sampleTodos)));
    expect(toastText(store)).toBe("Nothing new to import");
  });

  it("rejects invalid files", () => {
    const store = setupStore();
    store.dispatch(importTodos("{not json"));
    expect(selectToast(store.getState())?.tone).toBe("error");
    expect(toastText(store)).toBe("This file is not a valid ToDo export");
  });
});

describe("toggleTodo", () => {
  it("celebrates when the last active task of a list is completed", () => {
    const today = todayKey();
    const store = setupStore(
      makeState(
        [
          makeTodo({ id: "a", title: "First", dueDate: today }),
          makeTodo({ id: "b", title: "Second", dueDate: today }),
          makeTodo({ id: "c", title: "Later" }),
        ],
        "today",
      ),
    );

    expect(store.dispatch(toggleTodo("a", today))).toBe(false);
    expect(selectToast(store.getState())).toBeNull();

    expect(store.dispatch(toggleTodo("b", today))).toBe(true);
    expect(selectToast(store.getState())?.tone).toBe("success");
    expect(toastText(store)).toBe("Everything in Today is done!");
    expect(toastText(store, "uk")).toBe("У списку «Сьогодні» усе виконано!");
  });

  it("does not celebrate reopening or the completed list", () => {
    const today = todayKey();
    const store = setupStore(makeState(sampleTodos, "completed"));
    expect(store.dispatch(toggleTodo("report", today))).toBe(false);
    expect(store.dispatch(toggleTodo("report", today))).toBe(false);
    expect(selectToast(store.getState())).toBeNull();
  });
});

describe("duplicateTodo", () => {
  it("inserts an active copy after the original", () => {
    const store = setupStore(makeState(sampleTodos));
    const copyId = store.dispatch(duplicateTodo("report"));

    const todos = selectTodos(store.getState());
    expect(todos.map((todo) => todo.title)).toEqual([
      "Buy milk",
      "Write the quarterly report",
      "Write the quarterly report",
      "Call grandma",
    ]);
    expect(todos[2]).toMatchObject({ id: copyId, completed: false, completedAt: null });
    expect(toastText(store)).toBe("Duplicated “Write the quarterly report”");
  });

  it("ignores unknown ids", () => {
    const store = setupStore(makeState(sampleTodos));
    expect(store.dispatch(duplicateTodo("missing"))).toBeNull();
    expect(titles(store)).toHaveLength(3);
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

describe("exportTodos", () => {
  it("downloads every todo with metadata", () => {
    const downloadJson = vi.spyOn(download, "downloadJson").mockImplementation(() => {});
    const store = setupStore(makeState(sampleTodos));

    store.dispatch(exportTodos());

    expect(downloadJson).toHaveBeenCalledWith(
      expect.stringMatching(/^todos-\d{4}-\d{2}-\d{2}\.json$/),
      expect.objectContaining({ app: "react-todo-app", todos: sampleTodos }),
    );
  });
});
