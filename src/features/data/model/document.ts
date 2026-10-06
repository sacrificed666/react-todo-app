import { parseProjects } from "@/features/projects/model/project";
import { parseTodos, type Todo } from "@/features/todos/model/todo";

import type { DataSnapshot } from "./actions";

// Tasks of a project that no longer exists move to no project
export const linkProjects = (todos: readonly Todo[], projectIds: ReadonlySet<string>): Todo[] =>
  todos.map((todo) =>
    todo.projectId === null || projectIds.has(todo.projectId) ? todo : { ...todo, projectId: null },
  );

// Valid tasks and projects of a document, or null
export const parseData = (input: unknown, now: number = Date.now()): DataSnapshot | null => {
  const todos = parseTodos(input, now);
  if (!todos) return null;
  const projects = parseProjects(input, now);
  return { todos: linkProjects(todos, new Set(projects.map((project) => project.id))), projects };
};

// Tasks and projects as stored text
export const serializeData = ({ todos, projects }: DataSnapshot) => JSON.stringify({ todos, projects });
