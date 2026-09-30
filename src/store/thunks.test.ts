import { describe, expect, it } from "vitest";

import { dayFromToday, makeState, makeTodo, sampleTodos } from "@/test/factories";

import { selectToast, selectTodos } from "./selectors";
import { queryChanged } from "./slices/viewSlice";
import { setupStore } from "./store";
import { addTodo, clearCompleted, importTodos, removeTodos, undoRemoval } from "./thunks";

const titles = (store: ReturnType<typeof setupStore>) => selectTodos(store.getState()).map((todo) => todo.title);

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
    expect(selectToast(store.getState())).toMatchObject({ message: "Deleted 2 tasks", tone: "neutral" });

    store.dispatch(undoRemoval());
    expect(titles(store)).toEqual(["Buy milk", "Write the quarterly report", "Call grandma"]);
    expect(selectToast(store.getState())).toBeNull();
  });

  it("names a single deleted todo", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(removeTodos(["milk"]));
    expect(selectToast(store.getState())?.message).toBe("Deleted “Buy milk”");
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
    expect(selectToast(store.getState())?.message).toBe("Cleared 1 completed task");
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
    expect(selectToast(store.getState())?.message).toBe("Imported 1 task");
  });

  it("reports when nothing new was found", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(importTodos(JSON.stringify(sampleTodos)));
    expect(selectToast(store.getState())?.message).toBe("Nothing new to import");
  });

  it("rejects invalid files", () => {
    const store = setupStore();
    store.dispatch(importTodos("{not json"));
    expect(selectToast(store.getState())).toMatchObject({
      tone: "error",
      message: "This file is not a valid ToDo export",
    });
  });
});
