import { parseProjects } from "@/features/projects/model/project";
import { parseTodos, type Todo } from "@/features/todos/model/todo";

import type { DataSnapshot } from "./actions";

export const DATA_VERSION = 6;

export const linkProjects = (todos: readonly Todo[], projectIds: ReadonlySet<string>): Todo[] =>
  todos.map((todo) =>
    todo.projectId === null || projectIds.has(todo.projectId) ? todo : { ...todo, projectId: null },
  );

export const parseData = (input: unknown, now: number = Date.now()): DataSnapshot | null => {
  const todos = parseTodos(input, now);
  if (!todos) return null;
  const projects = parseProjects(input, now);
  return { todos: linkProjects(todos, new Set(projects.map((project) => project.id))), projects };
};

export const serializeData = ({ todos, projects }: DataSnapshot) =>
  JSON.stringify({ version: DATA_VERSION, todos, projects });
