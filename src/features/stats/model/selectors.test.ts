import { describe, expect, it } from "vitest";

import { setupStore } from "@/app/store";
import { makeProject, makeState, makeTodo } from "@/test/factories";

import { selectActivity, selectProjectProgress } from "./selectors";

const today = "2026-10-01";
const stateWith = (...args: Parameters<typeof makeState>) => setupStore(makeState(...args)).getState();

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

describe("selectProjectProgress", () => {
  it("counts done and total tasks per project in sidebar order", () => {
    const state = setupStore(
      makeState(
        [
          makeTodo({ id: "a", title: "A", projectId: "home" }),
          makeTodo({ id: "b", title: "B", projectId: "home", completed: true, completedAt: 1 }),
          makeTodo({ id: "c", title: "C", projectId: "work" }),
          makeTodo({ id: "d", title: "D" }),
        ],
        "all",
        "",
        [
          makeProject({ id: "work", name: "Work" }),
          makeProject({ id: "empty", name: "Empty" }),
          makeProject({ id: "home", name: "Home" }),
        ],
      ),
    ).getState();

    expect(selectProjectProgress(state).map(({ project, done, total }) => [project.id, done, total])).toEqual([
      ["work", 0, 1],
      ["home", 1, 2],
    ]);
  });
});
