import { describe, expect, it } from "vitest";

import { makeState, makeTodo, sampleTodos } from "@/test/factories";

import { selectToast, selectTodos } from "./selectors";
import { queryChanged } from "./slices/viewSlice";
import { setupStore } from "./store";
import { addTodo, clearCompleted, importTodos, removeTodos, undoRemoval } from "./thunks";

const titles = (store: ReturnType<typeof setupStore>) => selectTodos(store.getState()).map((todo) => todo.title);

describe("addTodo", () => {
  it("adds normalized todos and reports success", () => {
    const store = setupStore();
    expect(store.dispatch(addTodo("  Plan   the trip "))).toBe(true);
    expect(titles(store)).toEqual(["Plan the trip"]);
  });

  it("rejects blank titles", () => {
    const store = setupStore();
    expect(store.dispatch(addTodo("   "))).toBe(false);
    expect(titles(store)).toEqual([]);
  });

  it("reveals the new todo when filters would hide it", () => {
    const store = setupStore(makeState(sampleTodos, "completed", "report"));
    store.dispatch(addTodo("Buy flowers"));
    expect(store.getState().view).toEqual({ filter: "all", query: "" });
  });

  it("keeps a query that matches the new todo", () => {
    const store = setupStore(makeState([], "active"));
    store.dispatch(queryChanged("flow"));
    store.dispatch(addTodo("Buy flowers"));
    expect(store.getState().view).toEqual({ filter: "active", query: "flow" });
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
      todos: [makeTodo({ id: "milk", title: "Buy milk" }), makeTodo({ id: "new", title: "Imported" })],
    });

    store.dispatch(importTodos(file));

    expect(titles(store)).toEqual(["Buy milk", "Write the quarterly report", "Call grandma", "Imported"]);
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
