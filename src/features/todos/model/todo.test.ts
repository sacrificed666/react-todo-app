import { describe, expect, it } from "vitest";

import {
  createMatcher,
  createTodo,
  extractTags,
  MAX_NOTES_LENGTH,
  MAX_TAGS,
  MAX_TITLE_LENGTH,
  mergeTags,
  normalizeTag,
  normalizeTitle,
  parseTodos,
  splitTitleTags,
  stripTags,
} from "./todo";

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

describe("repeats", () => {
  it("starts repeating tasks today when they have no date", () => {
    expect(createTodo({ title: "Stretch", repeat: "daily" }, new Date(2026, 9, 1, 9).getTime())).toMatchObject({
      repeat: "daily",
      dueDate: "2026-10-01",
    });
  });

  it("anchors a new series to its first date", () => {
    expect(createTodo({ title: "Rent", repeat: "monthly", dueDate: "2026-01-31" }, 1)).toMatchObject({
      dueDate: "2026-01-31",
      repeatAnchor: "2026-01-31",
    });
  });

  it("repairs missing or impossible anchors when parsing", () => {
    const [missing, future, plain] =
      parseTodos([
        { id: "a", title: "A", dueDate: "2026-10-01", repeat: "monthly" },
        { id: "b", title: "B", dueDate: "2026-10-01", repeat: "monthly", repeatAnchor: "2026-12-01" },
        { id: "c", title: "C", dueDate: "2026-10-01", repeatAnchor: "2026-09-01" },
      ]) ?? [];
    expect(missing?.repeatAnchor).toBe("2026-10-01");
    expect(future?.repeatAnchor).toBe("2026-10-01");
    expect(plain?.repeatAnchor).toBeNull();
  });

  it("keeps valid project links and drops malformed ones", () => {
    const [linked, broken] =
      parseTodos([
        { id: "a", title: "A", projectId: "work" },
        { id: "b", title: "B", projectId: "not valid!" },
      ]) ?? [];
    expect(linked?.projectId).toBe("work");
    expect(broken?.projectId).toBeNull();
  });

  it("drops unknown repeats and repeats without a date when parsing", () => {
    const [unknown, undated] =
      parseTodos([
        { id: "a", title: "A", dueDate: "2026-10-01", repeat: "hourly" },
        { id: "b", title: "B", repeat: "daily" },
      ]) ?? [];
    expect(unknown?.repeat).toBeNull();
    expect(undated?.repeat).toBeNull();
  });
});

describe("tags", () => {
  it("extracts hashtags in any script", () => {
    expect(extractTags("Plan #trip to #Львів, not a#tag")).toEqual(["#trip", "#Львів"]);
    expect(extractTags("No tags here")).toEqual([]);
  });

  it("strips hashtags from the title", () => {
    expect(stripTags("Plan #trip to #Львів")).toBe("Plan to");
    expect(stripTags("#only")).toBe("");
  });
});

describe("parseTodos ids", () => {
  it("keeps safe ids, converts numeric ids and replaces unsafe ones", () => {
    const [kept, numeric, unsafe, long] =
      parseTodos(
        [
          { id: "V1StGXR8_Z5jdHi6B-myT", title: "Kept" },
          { id: 1_700_000_000_000, title: "Numeric" },
          { id: '"><img src=x>', title: "Unsafe" },
          { id: "x".repeat(65), title: "Long" },
        ],
        1,
      ) ?? [];

    expect(kept?.id).toBe("V1StGXR8_Z5jdHi6B-myT");
    expect(numeric?.id).toBe("1700000000000");
    expect(unsafe?.id).toMatch(/^[\w-]{21}$/);
    expect(long?.id).toMatch(/^[\w-]{21}$/);
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
      repeat: null,
      repeatAnchor: null,
      projectId: null,
      tags: [],
      notes: "",
      subtasks: [],
      createdAt: 42,
      updatedAt: 42,
      completedAt: null,
    });
  });

  it("keeps notes, trimming trailing whitespace and limiting their length", () => {
    expect(createTodo({ title: "Trip", notes: "Pack\r\n- [ ] Passport  \n\n" }, 1).notes).toBe("Pack\n- [ ] Passport");
    expect(createTodo({ title: "Trip", notes: "a".repeat(MAX_NOTES_LENGTH + 10) }, 1).notes).toHaveLength(
      MAX_NOTES_LENGTH,
    );
  });

  it("takes #tags out of the title and joins them with the chosen ones", () => {
    expect(createTodo({ title: "Plan #trip with #Anna", tags: ["work", "#trip"] }, 1)).toMatchObject({
      title: "Plan with",
      tags: ["#work", "#trip", "#Anna"],
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
      repeat: "weekly",
      repeatAnchor: "2026-09-17",
      projectId: "books",
      tags: ["#reading"],
      notes: "Chapter 3",
      subtasks: [{ id: "s1", title: "Take notes", completed: true }],
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
        repeat: null,
        repeatAnchor: null,
        projectId: null,
        tags: [],
        notes: "",
        subtasks: [],
        createdAt: 500,
        updatedAt: 500,
        completedAt: 500,
      },
    ]);
  });

  it("moves #tags of older titles into the tags and drops invalid ones", () => {
    const [todo] =
      parseTodos([{ id: "a", title: "Read #books #Books", tags: ["#home", "two words", 3, "#home"] }]) ?? [];
    expect(todo).toMatchObject({ title: "Read", tags: ["#home", "#books"] });
    expect(parseTodos([{ id: "b", title: "#only" }])?.[0]).toMatchObject({
      title: "#only",
      tags: [],
    });
  });

  it("moves a checklist from the notes of older versions into subtasks", () => {
    const [todo] =
      parseTodos([{ id: "trip", title: "Trip", notes: "Pack\n- [x] Passport\n- [ ] Tickets\n\n\nCall" }]) ?? [];
    expect(todo?.notes).toBe("Pack\n\nCall");
    expect(todo?.subtasks.map(({ title, completed }) => ({ title, completed }))).toEqual([
      { title: "Passport", completed: true },
      { title: "Tickets", completed: false },
    ]);
  });

  it("keeps notes as they are once subtasks are stored", () => {
    const [todo] = parseTodos([{ id: "trip", title: "Trip", notes: "- [ ] Not a subtask", subtasks: [] }]) ?? [];
    expect(todo).toMatchObject({ notes: "- [ ] Not a subtask", subtasks: [] });
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

describe("tag helpers", () => {
  it("normalizes tags and refuses spaces and signs", () => {
    expect(normalizeTag("work")).toBe("#work");
    expect(normalizeTag("  ##Дім ")).toBe("#Дім");
    expect(normalizeTag("two words")).toBeNull();
    expect(normalizeTag("#")).toBeNull();
  });

  it("merges lists without repeats in any letter case, within the limit", () => {
    expect(mergeTags(["#Work", "home"], ["#work", "#trip"])).toEqual(["#Work", "#home", "#trip"]);
    expect(mergeTags(Array.from({ length: 20 }, (_, index) => `#t${index}`))).toHaveLength(MAX_TAGS);
  });

  it("splits tags off a title unless nothing would be left", () => {
    expect(splitTitleTags("Buy milk #home  #errands")).toEqual({
      title: "Buy milk",
      tags: ["#home", "#errands"],
    });
    expect(splitTitleTags("#home")).toEqual({ title: "#home", tags: [] });
  });
});
