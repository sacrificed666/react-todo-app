import { describe, expect, it } from "vitest";

import { makeTodo } from "@/test/factories";

import { isListId, isOverdue, matchesList } from "./lists";

const today = "2026-10-01";
const completedToday = new Date(2026, 9, 1, 12).getTime();
const completedEarlier = new Date(2026, 8, 20, 12).getTime();

describe("matchesList", () => {
  const overdue = makeTodo({ id: "a", title: "Overdue", dueDate: "2026-09-28" });
  const dueToday = makeTodo({ id: "b", title: "Today", dueDate: today });
  const upcoming = makeTodo({ id: "c", title: "Later", dueDate: "2026-10-09", important: true });
  const undated = makeTodo({ id: "d", title: "Someday" });

  it("groups tasks by due date", () => {
    expect([overdue, dueToday, upcoming, undated].filter((todo) => matchesList(todo, "today", today))).toEqual([
      overdue,
      dueToday,
    ]);
    expect([overdue, dueToday, upcoming, undated].filter((todo) => matchesList(todo, "upcoming", today))).toEqual([
      upcoming,
    ]);
  });

  it("keeps only tasks completed today in the Today list", () => {
    const doneToday = { ...dueToday, completed: true, completedAt: completedToday };
    const doneEarlier = { ...overdue, completed: true, completedAt: completedEarlier };
    expect(matchesList(doneToday, "today", today)).toBe(true);
    expect(matchesList(doneEarlier, "today", today)).toBe(false);
  });

  it("matches important, completed and all tasks", () => {
    expect(matchesList(upcoming, "important", today)).toBe(true);
    expect(matchesList(undated, "important", today)).toBe(false);
    expect(matchesList({ ...undated, completed: true }, "completed", today)).toBe(true);
    expect(matchesList(undated, "all", today)).toBe(true);
  });

  it("detects overdue tasks", () => {
    expect(isOverdue(overdue, today)).toBe(true);
    expect(isOverdue(dueToday, today)).toBe(false);
    expect(isOverdue({ ...overdue, completed: true }, today)).toBe(false);
  });

  it("validates list ids", () => {
    expect(isListId("today")).toBe(true);
    expect(isListId("active")).toBe(false);
  });
});
