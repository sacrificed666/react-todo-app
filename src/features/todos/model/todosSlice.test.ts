import { describe, expect, it } from "vitest";

import { dataImported, dataReplaced } from "@/features/data/model/actions";
import { projectRemoved } from "@/features/projects/model/projectsSlice";
import { makeTodo } from "@/test/factories";

import {
  allTodosMarked,
  todoAdded,
  todoDuplicated,
  todoMoved,
  todoNoted,
  todoProjectChanged,
  todoRepeatChanged,
  todoImportanceToggled,
  todoRenamed,
  todoScheduled,
  todosAdapter,
  todosRemoved,
  todosRestored,
  todosScheduled,
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
      dataImported({
        todos: [makeTodo({ id: "a", title: "Duplicate" }), makeTodo({ id: "z", title: "Imported" })],
        projects: [],
      }),
    );

    expect(state.ids).toEqual(["a", "z"]);
    expect(state.entities.a?.title).toBe("Task a");
  });

  it("replaces the whole collection", () => {
    const state = reducer(
      stateOf("a", "b"),
      dataReplaced({ todos: [makeTodo({ id: "x", title: "Only" })], projects: [] }),
    );
    expect(state.ids).toEqual(["x"]);
  });

  it("moves tasks between projects", () => {
    const state = reducer(stateOf("a"), todoProjectChanged("a", "work"));
    expect(state.entities.a?.projectId).toBe("work");
    expect(reducer(state, todoProjectChanged("a", "work"))).toBe(state);
    expect(reducer(state, todoProjectChanged("a", null)).entities.a?.projectId).toBeNull();
  });

  it("deletes the tasks of a deleted project", () => {
    const state = todosAdapter.setAll(todosAdapter.getInitialState(), [
      makeTodo({ id: "a", title: "A", projectId: "work" }),
      makeTodo({ id: "b", title: "B" }),
      makeTodo({ id: "c", title: "C", projectId: "work", completed: true }),
    ]);
    expect(reducer(state, projectRemoved("work")).ids).toEqual(["b"]);
  });

  it("updates notes only when they change", () => {
    const state = reducer(stateOf("a"), todoNoted("a", "Pack the bag  \r\n"));
    expect(state.entities.a).toMatchObject({ notes: "Pack the bag" });

    const unchanged = reducer(state, todoNoted("a", "Pack the bag"));
    expect(unchanged).toBe(state);
    expect(reducer(state, todoNoted("missing", "x"))).toBe(state);
  });

  it("duplicates a todo right after the original as an active copy", () => {
    const completed = reducer(stateOf("a", "b"), todoToggled("a"));
    const state = reducer(completed, todoDuplicated("a"));
    const copyId = state.ids[1] ?? "";

    expect(state.ids).toHaveLength(3);
    expect(state.ids[2]).toBe("b");
    expect(state.entities[copyId]).toMatchObject({ title: "Task a", completed: false, completedAt: null });
    expect(reducer(state, todoDuplicated("missing"))).toBe(state);
  });

  it("creates the next occurrence when a repeating task is completed", () => {
    const at = new Date(2026, 9, 1, 12).getTime();
    const repeating = todosAdapter.setAll(todosAdapter.getInitialState(), [
      makeTodo({ id: "a", title: "Water plants", dueDate: "2026-09-29", repeat: "daily" }),
      makeTodo({ id: "b", title: "Other" }),
    ]);

    const state = reducer(repeating, { type: todoToggled.type, payload: { id: "a", at, nextId: "next" } });

    expect(state.ids).toEqual(["a", "next", "b"]);
    expect(state.entities.a).toMatchObject({ completed: true, repeat: null });
    expect(state.entities.next).toMatchObject({
      title: "Water plants",
      completed: false,
      completedAt: null,
      dueDate: "2026-10-02",
      repeat: "daily",
    });

    const reopened = reducer(state, todoToggled("a"));
    expect(reopened.ids).toHaveLength(3);
  });

  it("keeps monthly repeats on the day the series started", () => {
    const at = new Date(2026, 1, 28, 12).getTime();
    const rent = todosAdapter.setAll(todosAdapter.getInitialState(), [
      makeTodo({ id: "a", title: "Rent", dueDate: "2026-02-28", repeat: "monthly", repeatAnchor: "2026-01-31" }),
    ]);

    const state = reducer(rent, { type: todoToggled.type, payload: { id: "a", at, nextId: "next" } });

    expect(state.entities.next).toMatchObject({ dueDate: "2026-03-31", repeatAnchor: "2026-01-31" });
    expect(state.entities.a).toMatchObject({ repeat: null, repeatAnchor: null });
  });

  it("moves the anchor when a repeating task is rescheduled by hand", () => {
    const state = reducer(
      todosAdapter.setAll(todosAdapter.getInitialState(), [
        makeTodo({ id: "a", title: "Gym", dueDate: "2026-10-01", repeat: "weekly", repeatAnchor: "2026-10-01" }),
      ]),
      todoScheduled("a", "2026-10-03"),
    );
    expect(state.entities.a).toMatchObject({ dueDate: "2026-10-03", repeatAnchor: "2026-10-03" });
  });

  it("changes repeats and gives undated tasks a start date", () => {
    const state = reducer(stateOf("a"), todoRepeatChanged("a", "weekly"));
    expect(state.entities.a?.repeat).toBe("weekly");
    expect(state.entities.a?.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(reducer(state, todoRepeatChanged("a", "weekly"))).toBe(state);

    expect(state.entities.a?.repeatAnchor).toBe(state.entities.a?.dueDate);

    const undated = reducer(state, todoScheduled("a", null));
    expect(undated.entities.a).toMatchObject({ dueDate: null, repeat: null, repeatAnchor: null });
  });

  it("reschedules several tasks at once", () => {
    const state = reducer(stateOf("a", "b", "c"), todosScheduled(["a", "c", "missing"], "2026-10-05"));
    expect([state.entities.a?.dueDate, state.entities.b?.dueDate, state.entities.c?.dueDate]).toEqual([
      "2026-10-05",
      null,
      "2026-10-05",
    ]);
    expect(reducer(state, todosScheduled(["a"], "not a date"))).toBe(state);
  });
});
