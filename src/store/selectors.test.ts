import { describe, expect, it } from "vitest";

import { makeState, sampleTodos } from "@/test/factories";

import { selectCompletedIds, selectCounts, selectVisibleTodos } from "./selectors";
import { setupStore } from "./store";

const stateWith = (...args: Parameters<typeof makeState>) => setupStore(makeState(...args)).getState();

describe("selectors", () => {
  it("counts todos by status", () => {
    expect(selectCounts(stateWith(sampleTodos))).toEqual({ total: 3, active: 2, completed: 1 });
  });

  it("lists completed ids in order", () => {
    expect(selectCompletedIds(stateWith(sampleTodos))).toEqual(["report"]);
  });

  it("splits visible todos into sections", () => {
    const { active, completed } = selectVisibleTodos(stateWith(sampleTodos));
    expect(active.map((todo) => todo.id)).toEqual(["milk", "call"]);
    expect(completed.map((todo) => todo.id)).toEqual(["report"]);
  });

  it("applies the status filter", () => {
    expect(selectVisibleTodos(stateWith(sampleTodos, "active")).completed).toEqual([]);
    expect(selectVisibleTodos(stateWith(sampleTodos, "completed")).active).toEqual([]);
  });

  it("applies the search query", () => {
    const { active, completed } = selectVisibleTodos(stateWith(sampleTodos, "all", "  MILK "));
    expect(active.map((todo) => todo.id)).toEqual(["milk"]);
    expect(completed).toEqual([]);
  });

  it("memoizes results for unchanged input", () => {
    const state = stateWith(sampleTodos);
    expect(selectVisibleTodos(state)).toBe(selectVisibleTodos(state));
  });
});
