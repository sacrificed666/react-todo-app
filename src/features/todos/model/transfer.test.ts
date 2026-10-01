import { describe, expect, it } from "vitest";

import { makeTodo, sampleTodos } from "@/test/factories";

import { createExport, DATA_VERSION, exportFileName, MAX_IMPORT_BYTES, MAX_IMPORT_TODOS, readImport } from "./transfer";

describe("createExport", () => {
  it("wraps todos with metadata", () => {
    expect(createExport(sampleTodos, new Date("2026-09-30T10:00:00.000Z"))).toEqual({
      app: "react-todo-app",
      version: DATA_VERSION,
      exportedAt: "2026-09-30T10:00:00.000Z",
      todos: sampleTodos,
    });
  });

  it("names files after the local date", () => {
    expect(exportFileName(new Date(2026, 9, 1, 23, 30))).toBe("todos-2026-10-01.json");
  });
});

describe("readImport", () => {
  it("reads exports produced by the app", () => {
    const text = JSON.stringify(createExport(sampleTodos, new Date()));
    expect(readImport(text)).toEqual(sampleTodos);
  });

  it("rejects broken, foreign and oversized files", () => {
    expect(readImport("{broken")).toBeNull();
    expect(readImport(JSON.stringify({ items: [] }))).toBeNull();
    expect(readImport(" ".repeat(MAX_IMPORT_BYTES + 1))).toBeNull();
  });

  it("limits the number of imported todos", () => {
    const todos = Array.from({ length: MAX_IMPORT_TODOS + 5 }, (_, index) =>
      makeTodo({ id: `todo-${index}`, title: `Task ${index}` }),
    );
    expect(readImport(JSON.stringify(todos))).toHaveLength(MAX_IMPORT_TODOS);
  });
});
