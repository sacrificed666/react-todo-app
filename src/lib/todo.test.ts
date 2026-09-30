import { describe, expect, it } from "vitest";

import { createMatcher, createTodo, MAX_TITLE_LENGTH, normalizeForSearch, normalizeTitle, parseTodos } from "./todo";

describe("normalizeTitle", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeTitle("  Buy \n  milk\t today  ")).toBe("Buy milk today");
  });

  it("limits the title length without splitting emoji", () => {
    const title = normalizeTitle(`${"a".repeat(MAX_TITLE_LENGTH - 1)}🙂🙂`);
    expect(Array.from(title)).toHaveLength(MAX_TITLE_LENGTH);
    expect(title.endsWith("🙂")).toBe(true);
  });
});

describe("search helpers", () => {
  it("ignores case and diacritics", () => {
    expect(normalizeForSearch("Crème BRÛLÉE")).toBe("creme brulee");
    expect(createMatcher("CAFE")("Visit the café")).toBe(true);
    expect(createMatcher("їжак")("Погодувати ЇЖАКА")).toBe(true);
  });

  it("matches everything for an empty query", () => {
    expect(createMatcher("   ")("Anything")).toBe(true);
  });

  it("rejects titles that do not contain the query", () => {
    expect(createMatcher("milk")("Call grandma")).toBe(false);
  });
});

describe("createTodo", () => {
  it("creates an active todo with normalized title", () => {
    expect(createTodo({ title: "  Plan   trip " }, 42, "id-1")).toEqual({
      id: "id-1",
      title: "Plan trip",
      completed: false,
      important: false,
      dueDate: null,
      createdAt: 42,
      updatedAt: 42,
      completedAt: null,
    });
  });

  it("keeps importance and valid due dates only", () => {
    expect(createTodo({ title: "Pay rent", important: true, dueDate: "2026-10-05" }, 1)).toMatchObject({
      important: true,
      dueDate: "2026-10-05",
    });
    expect(createTodo({ title: "Pay rent", dueDate: "2026-02-30" }, 1).dueDate).toBeNull();
  });
});

describe("parseTodos", () => {
  it("returns null for unsupported payloads", () => {
    expect(parseTodos(null)).toBeNull();
    expect(parseTodos("todos")).toBeNull();
    expect(parseTodos({ items: [] })).toBeNull();
  });

  it("reads exported envelopes and plain arrays", () => {
    const todo = {
      id: "a",
      title: "Read",
      completed: false,
      important: true,
      dueDate: "2026-10-01",
      createdAt: 1,
      updatedAt: 2,
      completedAt: null,
    };
    expect(parseTodos({ version: 2, todos: [todo] })).toEqual([todo]);
    expect(parseTodos([todo])).toEqual([todo]);
  });

  it("migrates the legacy format", () => {
    expect(parseTodos([{ id: "old", text: " Legacy task ", isCompleted: true }], 500)).toEqual([
      {
        id: "old",
        title: "Legacy task",
        completed: true,
        important: false,
        dueDate: null,
        createdAt: 500,
        updatedAt: 500,
        completedAt: 500,
      },
    ]);
  });

  it("skips invalid entries and repairs identifiers", () => {
    const parsed = parseTodos([
      42,
      { id: "x", title: "   " },
      { id: "dup", title: "First" },
      { id: "dup", title: "Second" },
      { title: "No id" },
    ]);

    expect(parsed?.map((todo) => todo.title)).toEqual(["First", "Second", "No id"]);
    expect(new Set(parsed?.map((todo) => todo.id)).size).toBe(3);
    expect(parsed?.[0]?.id).toBe("dup");
  });

  it("normalizes timestamps", () => {
    const [todo] =
      parseTodos(
        [{ id: "t", title: "Timed", completed: true, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: -5 }],
        999,
      ) ?? [];

    expect(todo?.createdAt).toBe(Date.parse("2026-01-01T00:00:00.000Z"));
    expect(todo?.updatedAt).toBe(todo?.createdAt);
    expect(todo?.completedAt).toBe(todo?.updatedAt);
  });
});
