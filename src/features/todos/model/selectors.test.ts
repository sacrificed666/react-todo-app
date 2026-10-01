import { describe, expect, it } from "vitest";

import { setupStore } from "@/app/store";
import { sortChanged } from "@/features/lists/model/viewSlice";
import { makeState, makeTodo, sampleTodos } from "@/test/factories";

import {
  selectActivity,
  selectCompletedIds,
  selectListCounts,
  selectListProgress,
  selectTagCounts,
  selectVisibleTodos,
} from "./selectors";

const today = "2026-10-01";

const plannedTodos = [
  makeTodo({ id: "late", title: "Late invoice", dueDate: "2026-09-29", important: true }),
  makeTodo({ id: "now", title: "Daily standup", dueDate: today }),
  makeTodo({ id: "soon", title: "Dentist", dueDate: "2026-10-06" }),
  makeTodo({ id: "free", title: "Read a book" }),
  makeTodo({ id: "done", title: "Old chore", completed: true, completedAt: 1 }),
];

const stateWith = (...args: Parameters<typeof makeState>) => setupStore(makeState(...args)).getState();

describe("selectors", () => {
  it("counts tasks for every list", () => {
    expect(selectListCounts(stateWith(plannedTodos), today)).toEqual({
      all: 4,
      today: 2,
      upcoming: 1,
      important: 1,
      completed: 1,
      overdue: 1,
      total: 5,
    });
  });

  it("lists completed ids in order", () => {
    expect(selectCompletedIds(stateWith(sampleTodos))).toEqual(["report"]);
  });

  it("splits visible todos into sections", () => {
    const { active, completed } = selectVisibleTodos(stateWith(sampleTodos), today);
    expect(active.map((todo) => todo.id)).toEqual(["milk", "call"]);
    expect(completed.map((todo) => todo.id)).toEqual(["report"]);
  });

  it("applies smart lists", () => {
    expect(selectVisibleTodos(stateWith(plannedTodos, "today"), today).active.map((todo) => todo.id)).toEqual([
      "late",
      "now",
    ]);
    expect(selectVisibleTodos(stateWith(plannedTodos, "important"), today).active.map((todo) => todo.id)).toEqual([
      "late",
    ]);
    expect(selectVisibleTodos(stateWith(plannedTodos, "completed"), today)).toMatchObject({ active: [] });
  });

  it("applies the search query", () => {
    const { active, completed } = selectVisibleTodos(stateWith(sampleTodos, "all", "  MILK "), today);
    expect(active.map((todo) => todo.id)).toEqual(["milk"]);
    expect(completed).toEqual([]);
  });

  it("applies the sort mode", () => {
    const store = setupStore(makeState(plannedTodos));
    store.dispatch(sortChanged("alphabetical"));
    expect(selectVisibleTodos(store.getState(), today).active.map((todo) => todo.id)).toEqual([
      "now",
      "soon",
      "late",
      "free",
    ]);
  });

  it("reports progress for the current list", () => {
    expect(selectListProgress(stateWith(plannedTodos), today)).toEqual({ done: 1, total: 5 });
    expect(selectListProgress(stateWith(plannedTodos, "upcoming"), today)).toEqual({ done: 0, total: 1 });
  });

  it("memoizes results for unchanged input", () => {
    const state = stateWith(sampleTodos);
    expect(selectVisibleTodos(state, today)).toBe(selectVisibleTodos(state, today));
  });

  it("searches titles and notes", () => {
    const todos = [makeTodo({ id: "trip", title: "Trip", notes: "Book the hotel" }), ...sampleTodos];
    const { active } = selectVisibleTodos(stateWith(todos, "all", "HOTEL"), today);
    expect(active.map((todo) => todo.id)).toEqual(["trip"]);
  });
});

const noonOf = (day: string) => new Date(`${day}T12:00:00`).getTime();
const doneOn = (id: string, day: string) => makeTodo({ id, title: id, completed: true, completedAt: noonOf(day) });

describe("selectActivity", () => {
  it("counts completions for the last seven days", () => {
    const state = stateWith([
      doneOn("a", "2026-10-01"),
      doneOn("b", "2026-10-01"),
      doneOn("c", "2026-09-29"),
      doneOn("d", "2026-09-20"),
      makeTodo({ id: "open", title: "Open" }),
    ]);

    const { days } = selectActivity(state, today);

    expect(days.map((entry) => entry.day)).toEqual([
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      "2026-09-28",
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
    ]);
    expect(days.map((entry) => entry.count)).toEqual([0, 0, 0, 0, 1, 0, 2]);
  });

  it("counts the streak of consecutive days up to today or yesterday", () => {
    expect(selectActivity(stateWith([doneOn("a", "2026-10-01"), doneOn("b", "2026-09-30")]), today).streak).toBe(2);
    expect(selectActivity(stateWith([doneOn("a", "2026-09-30"), doneOn("b", "2026-09-29")]), today).streak).toBe(2);
    expect(selectActivity(stateWith([doneOn("a", "2026-09-29")]), today).streak).toBe(0);
    expect(selectActivity(stateWith([]), today).streak).toBe(0);
  });
});

describe("selectTagCounts", () => {
  it("counts tags of active tasks, case-insensitively and once per task", () => {
    const state = stateWith([
      makeTodo({ id: "a", title: "Slides #Work #work" }),
      makeTodo({ id: "b", title: "Report #work #q4" }),
      makeTodo({ id: "c", title: "Done #home", completed: true, completedAt: 1 }),
      makeTodo({ id: "d", title: "Plan #q4" }),
      makeTodo({ id: "e", title: "No tags" }),
    ]);

    expect(selectTagCounts(state)).toEqual([
      { tag: "#q4", count: 2 },
      { tag: "#Work", count: 2 },
    ]);
  });
});
