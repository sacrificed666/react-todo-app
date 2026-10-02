import { describe, expect, it } from "vitest";

import { makeProject, makeTodo, sampleTodos } from "@/test/factories";

import { createExport, exportFileName, MAX_IMPORT_BYTES, MAX_IMPORT_TODOS, readImport } from "./transfer";

const projects = [makeProject({ id: "work", name: "Work", color: "violet" })];
const todos = [makeTodo({ id: "deck", title: "Slides", projectId: "work" }), ...sampleTodos];

describe("createExport", () => {
  it("wraps todos and projects with metadata", () => {
    expect(createExport({ todos, projects }, new Date("2026-09-30T10:00:00.000Z"))).toEqual({
      app: "react-todo-app",
      exportedAt: "2026-09-30T10:00:00.000Z",
      todos,
      projects,
    });
  });

  it("names files after the local date", () => {
    expect(exportFileName(new Date(2026, 9, 1, 23, 30))).toBe("todos-2026-10-01.json");
  });
});

describe("readImport", () => {
  it("reads exports produced by the app", () => {
    const text = JSON.stringify(createExport({ todos, projects }, new Date()));
    expect(readImport(text)).toEqual({ todos, projects });
  });

  it("reads older files without projects", () => {
    expect(readImport(JSON.stringify({ version: 5, todos: sampleTodos }))).toEqual({
      todos: sampleTodos,
      projects: [],
    });
    expect(readImport(JSON.stringify(sampleTodos))?.todos).toEqual(sampleTodos);
  });

  it("rejects broken, foreign and oversized files", () => {
    expect(readImport("{broken")).toBeNull();
    expect(readImport(JSON.stringify({ items: [] }))).toBeNull();
    expect(readImport(" ".repeat(MAX_IMPORT_BYTES + 1))).toBeNull();
  });

  it("limits the number of imported todos", () => {
    const many = Array.from({ length: MAX_IMPORT_TODOS + 5 }, (_, index) =>
      makeTodo({ id: `todo-${index}`, title: `Task ${index}` }),
    );
    expect(readImport(JSON.stringify(many))?.todos).toHaveLength(MAX_IMPORT_TODOS);
  });
});
