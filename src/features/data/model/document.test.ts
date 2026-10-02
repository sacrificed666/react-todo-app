import { describe, expect, it } from "vitest";

import { makeProject, makeTodo } from "@/test/factories";

import { linkProjects, parseData, serializeData } from "./document";

const work = makeProject({ id: "work", name: "Work" });

describe("parseData", () => {
  it("reads todos and projects and keeps their links", () => {
    const todo = makeTodo({ id: "a", title: "Report", projectId: "work" });
    expect(parseData({ todos: [todo], projects: [work] })).toEqual({ todos: [todo], projects: [work] });
  });

  it("drops links to projects that do not exist", () => {
    const data = parseData({ todos: [makeTodo({ id: "a", title: "Orphan", projectId: "gone" })], projects: [] });
    expect(data?.todos[0]?.projectId).toBeNull();
  });

  it("rejects input without todos", () => {
    expect(parseData({ projects: [work] })).toBeNull();
    expect(parseData("nope")).toBeNull();
  });
});

describe("linkProjects", () => {
  it("keeps the same objects when every link is valid", () => {
    const todo = makeTodo({ id: "a", title: "Report", projectId: "work" });
    expect(linkProjects([todo], new Set(["work"]))[0]).toBe(todo);
  });
});

describe("serializeData", () => {
  it("writes tasks and projects", () => {
    expect(JSON.parse(serializeData({ todos: [], projects: [work] }))).toEqual({
      todos: [],
      projects: [work],
    });
  });
});
