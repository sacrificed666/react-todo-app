import { describe, expect, it } from "vitest";

import { setupStore } from "@/app/store";
import { selectCurrentProject, selectList } from "@/features/lists/model/selectors";
import { sortChanged } from "@/features/lists/model/viewSlice";
import { makeProject, makeState, makeTodo, sampleTodos } from "@/test/factories";

import {
  selectCompletedIds,
  selectListCounts,
  selectListProgress,
  selectProjectCounts,
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

  it("searches titles, notes and subtasks", () => {
    const todos = [
      makeTodo({ id: "trip", title: "Trip", notes: "Book the hotel" }),
      makeTodo({ id: "move", title: "Move", subtasks: [{ id: "s", title: "Hire a van", completed: false }] }),
      ...sampleTodos,
    ];
    expect(selectVisibleTodos(stateWith(todos, "all", "HOTEL"), today).active.map((todo) => todo.id)).toEqual(["trip"]);
    expect(selectVisibleTodos(stateWith(todos, "all", "van"), today).active.map((todo) => todo.id)).toEqual(["move"]);
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

describe("projects and search", () => {
  const work = makeProject({ id: "work", name: "Work" });
  const todos = [
    makeTodo({ id: "a", title: "Slides", projectId: "work" }),
    makeTodo({ id: "b", title: "Report", projectId: "work", completed: true, completedAt: 1 }),
    makeTodo({ id: "c", title: "Slides for home", dueDate: today }),
  ];

  it("shows the tasks of the open project", () => {
    const visible = selectVisibleTodos(stateWith(todos, "project:work", "", [work]), today);
    expect(visible.active.map((todo) => todo.id)).toEqual(["a"]);
    expect(visible.completed.map((todo) => todo.id)).toEqual(["b"]);
    expect(selectListProgress(stateWith(todos, "project:work", "", [work]), today)).toEqual({ done: 1, total: 2 });
  });

  it("searches every list while a query is typed", () => {
    const visible = selectVisibleTodos(stateWith(todos, "today", "slides", [work]), today);
    expect(visible.active.map((todo) => todo.id)).toEqual(["a", "c"]);
  });

  it("counts active tasks per project", () => {
    expect([...selectProjectCounts(stateWith(todos, "all", "", [work]))]).toEqual([["work", 1]]);
  });

  it("falls back to all tasks when the open project is gone", () => {
    const state = stateWith(todos, "project:gone", "", [work]);
    expect(selectList(state)).toBe("all");
    expect(selectCurrentProject(state)).toBeUndefined();
    expect(selectCurrentProject(stateWith(todos, "project:work", "", [work]))).toEqual(work);
  });
});
