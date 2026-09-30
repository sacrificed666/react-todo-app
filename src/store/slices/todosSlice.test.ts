import { describe, expect, it } from "vitest";

import { makeTodo } from "@/test/factories";

import {
  allTodosMarked,
  todoAdded,
  todoMoved,
  todoImportanceToggled,
  todoRenamed,
  todoScheduled,
  todosAdapter,
  todosImported,
  todosRemoved,
  todosReplaced,
  todosRestored,
  todosSlice,
  todoToggled,
} from "./todosSlice";

const reducer = todosSlice.reducer;

const stateOf = (...ids: string[]) =>
  todosAdapter.setAll(
    todosAdapter.getInitialState(),
    ids.map((id) => makeTodo({ id, title: `Task ${id}` })),
  );

describe("todosSlice", () => {
  it("prepends new todos with normalized titles", () => {
    const state = reducer(
      stateOf("a"),
      todoAdded({ title: "  Fresh   task ", important: true, dueDate: "2026-10-02" }),
    );
    const [id] = state.ids;

    expect(state.ids).toHaveLength(2);
    expect(id === undefined ? undefined : state.entities[id]).toMatchObject({
      title: "Fresh task",
      important: true,
      dueDate: "2026-10-02",
    });
  });

  it("ignores blank titles", () => {
    expect(reducer(stateOf("a"), todoAdded({ title: "   " })).ids).toEqual(["a"]);
  });

  it("toggles completion and tracks timestamps", () => {
    const completed = reducer(stateOf("a"), { type: todoToggled.type, payload: { id: "a", at: 10 } });
    expect(completed.entities.a).toMatchObject({ completed: true, completedAt: 10, updatedAt: 10 });

    const reopened = reducer(completed, { type: todoToggled.type, payload: { id: "a", at: 20 } });
    expect(reopened.entities.a).toMatchObject({ completed: false, completedAt: null, updatedAt: 20 });
  });

  it("renames todos and skips empty or unchanged titles", () => {
    const renamed = reducer(stateOf("a"), todoRenamed("a", "  New   name "));
    expect(renamed.entities.a?.title).toBe("New name");
    expect(reducer(renamed, todoRenamed("a", "   "))).toBe(renamed);
    expect(reducer(renamed, todoRenamed("a", "New name"))).toBe(renamed);
    expect(reducer(renamed, todoRenamed("missing", "Title"))).toBe(renamed);
  });

  it("toggles importance", () => {
    const starred = reducer(stateOf("a"), todoImportanceToggled("a"));
    expect(starred.entities.a?.important).toBe(true);
    expect(reducer(starred, todoImportanceToggled("a")).entities.a?.important).toBe(false);
  });

  it("schedules and unschedules todos", () => {
    const scheduled = reducer(stateOf("a"), todoScheduled("a", "2026-10-05"));
    expect(scheduled.entities.a?.dueDate).toBe("2026-10-05");
    expect(reducer(scheduled, todoScheduled("a", "not a date")).entities.a?.dueDate).toBeNull();
    expect(reducer(scheduled, todoScheduled("a", "2026-10-05"))).toBe(scheduled);
  });

  it("moves todos in both directions", () => {
    const state = stateOf("a", "b", "c", "d");
    expect(reducer(state, todoMoved({ activeId: "a", overId: "c" })).ids).toEqual(["b", "c", "a", "d"]);
    expect(reducer(state, todoMoved({ activeId: "d", overId: "b" })).ids).toEqual(["a", "d", "b", "c"]);
    expect(reducer(state, todoMoved({ activeId: "a", overId: "missing" }))).toBe(state);
  });

  it("marks every todo as completed or active", () => {
    const completed = reducer(stateOf("a", "b"), allTodosMarked(true));
    expect(Object.values(completed.entities).every((todo) => todo.completed)).toBe(true);

    const active = reducer(completed, allTodosMarked(false));
    expect(Object.values(active.entities).every((todo) => !todo.completed && todo.completedAt === null)).toBe(true);
  });

  it("restores removed todos at their original positions", () => {
    const state = stateOf("a", "b", "c", "d");
    const removed = [
      { todo: state.entities.d!, index: 3 },
      { todo: state.entities.b!, index: 1 },
    ];
    const pruned = reducer(state, todosRemoved(["b", "d"]));
    expect(pruned.ids).toEqual(["a", "c"]);

    const restored = reducer(pruned, todosRestored(removed));
    expect(restored.ids).toEqual(["a", "b", "c", "d"]);
    expect(reducer(restored, todosRestored(removed))).toBe(restored);
  });

  it("imports only unknown todos and appends them", () => {
    const state = reducer(
      stateOf("a"),
      todosImported([makeTodo({ id: "a", title: "Duplicate" }), makeTodo({ id: "z", title: "Imported" })]),
    );

    expect(state.ids).toEqual(["a", "z"]);
    expect(state.entities.a?.title).toBe("Task a");
  });

  it("replaces the whole collection", () => {
    const state = reducer(stateOf("a", "b"), todosReplaced([makeTodo({ id: "x", title: "Only" })]));
    expect(state.ids).toEqual(["x"]);
  });
});
