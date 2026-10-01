import { describe, expect, it } from "vitest";

import { makeTodo } from "@/test/factories";

import { groupActiveTodos } from "./groups";

const today = "2026-10-01";
const due = (id: string, dueDate: string | null) => makeTodo({ id, title: id, dueDate });
const shape = (groups: ReturnType<typeof groupActiveTodos>) =>
  groups.map(({ id, kind, date, todos }) => [id, kind, date, todos.map((todo) => todo.id)]);

describe("groupActiveTodos", () => {
  it("splits Today into overdue and today", () => {
    const groups = groupActiveTodos([due("a", today), due("b", "2026-09-28"), due("c", today)], "today", today);
    expect(shape(groups)).toEqual([
      ["overdue", "overdue", null, ["b"]],
      ["today", "day", today, ["a", "c"]],
    ]);
  });

  it("leaves out empty groups", () => {
    expect(shape(groupActiveTodos([due("a", today)], "today", today))).toEqual([["today", "day", today, ["a"]]]);
    expect(groupActiveTodos([], "today", today)).toEqual([]);
  });

  it("groups Upcoming by day for a week and by month afterwards", () => {
    const groups = groupActiveTodos(
      [
        due("nov", "2026-11-03"),
        due("tomorrow", "2026-10-02"),
        due("week", "2026-10-08"),
        due("later", "2026-10-20"),
        due("tomorrow-2", "2026-10-02"),
        due("next-year", "2027-01-05"),
      ],
      "upcoming",
      today,
    );

    expect(shape(groups)).toEqual([
      ["day-2026-10-02", "day", "2026-10-02", ["tomorrow", "tomorrow-2"]],
      ["day-2026-10-08", "day", "2026-10-08", ["week"]],
      ["month-2026-10", "month", "2026-10-01", ["later"]],
      ["month-2026-11", "month", "2026-11-01", ["nov"]],
      ["month-2027-01", "month", "2027-01-01", ["next-year"]],
    ]);
  });

  it("keeps other lists in one group", () => {
    expect(shape(groupActiveTodos([due("a", null), due("b", today)], "all", today))).toEqual([
      ["active", "all", null, ["a", "b"]],
    ]);
  });
});
