import type { Todo } from "@/features/todos/model/todo";
import { toDateKey } from "@/shared/lib/date";

export const LISTS = ["all", "today", "upcoming", "important", "completed"] as const;

export type ListId = (typeof LISTS)[number];

export const isListId = (value: unknown): value is ListId =>
  typeof value === "string" && (LISTS as readonly string[]).includes(value);

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

export const isOverdue = (todo: Todo, today: string) =>
  !todo.completed && todo.dueDate !== null && todo.dueDate < today;
