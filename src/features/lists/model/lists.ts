import type { Todo } from "@/features/todos/model/todo";
import { toDateKey } from "@/shared/lib/date";
import { isEntityId } from "@/shared/lib/guards";

export const LISTS = ["all", "today", "upcoming", "important", "completed"] as const;

export type ListId = (typeof LISTS)[number];

export type ProjectView = `project:${string}`;

export type ViewId = ListId | ProjectView;

const PROJECT_PREFIX = "project:";

export const isListId = (value: unknown): value is ListId =>
  typeof value === "string" && (LISTS as readonly string[]).includes(value);

export const projectView = (projectId: string): ProjectView => `project:${projectId}`;

export const isProjectView = (view: ViewId): view is ProjectView => view.startsWith(PROJECT_PREFIX);

export const projectIdOf = (view: ViewId) => (isProjectView(view) ? view.slice(PROJECT_PREFIX.length) : null);

export const isViewId = (value: unknown): value is ViewId =>
  isListId(value) ||
  (typeof value === "string" && value.startsWith(PROJECT_PREFIX) && isEntityId(value.slice(PROJECT_PREFIX.length)));

const completedOn = (todo: Todo, day: string) =>
  todo.completedAt !== null && toDateKey(new Date(todo.completedAt)) === day;

export const matchesList = (todo: Todo, list: ListId, today: string) => {
  switch (list) {
    case "all":
      return true;
    case "today":
      return todo.dueDate !== null && todo.dueDate <= today && (!todo.completed || completedOn(todo, today));
    case "upcoming":
      return todo.dueDate !== null && todo.dueDate > today;
    case "important":
      return todo.important;
    case "completed":
      return todo.completed;
  }
};

export const matchesView = (todo: Todo, view: ViewId, today: string) =>
  isProjectView(view) ? todo.projectId === projectIdOf(view) : matchesList(todo, view, today);

export const isOverdue = (todo: Todo, today: string) =>
  !todo.completed && todo.dueDate !== null && todo.dueDate < today;
