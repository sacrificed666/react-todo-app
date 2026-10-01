import { describe, expect, it } from "vitest";

import { makeTodo } from "@/test/factories";

import { isSortMode, sortTodos } from "./sort";

const todos = [
  makeTodo({ id: "b", title: "banana", dueDate: "2026-10-05", createdAt: 2 }),
  makeTodo({ id: "c", title: "Cherry", important: true, createdAt: 3 }),
  makeTodo({ id: "a", title: "apple 10", dueDate: "2026-10-02", createdAt: 1 }),
  makeTodo({ id: "d", title: "apple 9", important: true, dueDate: "2026-10-02", createdAt: 4 }),
];

const ids = (list: readonly { id: string }[]) => list.map((todo) => todo.id);

describe("sortTodos", () => {
  it("keeps the manual order", () => {
    expect(sortTodos(todos, "manual")).toBe(todos);
  });

  it("sorts by due date with undated tasks last", () => {
    expect(ids(sortTodos(todos, "dueDate"))).toEqual(["a", "d", "b", "c"]);
  });

  it("puts important tasks first and keeps the rest in order", () => {
    expect(ids(sortTodos(todos, "priority"))).toEqual(["c", "d", "b", "a"]);
  });

  it("sorts by creation time", () => {
    expect(ids(sortTodos(todos, "newest"))).toEqual(["d", "c", "b", "a"]);
  });

  it("sorts titles naturally and case-insensitively", () => {
    expect(ids(sortTodos(todos, "alphabetical"))).toEqual(["d", "a", "b", "c"]);
  });

  it("validates sort modes", () => {
    expect(isSortMode("dueDate")).toBe(true);
    expect(isSortMode("random")).toBe(false);
  });
});
