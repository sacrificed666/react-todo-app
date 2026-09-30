import type { Todo } from "./todo";

export const SORT_MODES = ["manual", "dueDate", "priority", "newest", "alphabetical"] as const;

export type SortMode = (typeof SORT_MODES)[number];

export const isSortMode = (value: unknown): value is SortMode =>
  typeof value === "string" && (SORT_MODES as readonly string[]).includes(value);

const byDueDate = (a: Todo, b: Todo) => {
  if (a.dueDate === b.dueDate) return 0;
  if (a.dueDate === null) return 1;
  if (b.dueDate === null) return -1;
  return a.dueDate < b.dueDate ? -1 : 1;
};

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

export const sortTodos = (todos: readonly Todo[], mode: SortMode): readonly Todo[] => {
  switch (mode) {
    case "manual":
      return todos;
    case "dueDate":
      return todos.toSorted(byDueDate);
    case "priority":
      return todos.toSorted((a, b) => Number(b.important) - Number(a.important));
    case "newest":
      return todos.toSorted((a, b) => b.createdAt - a.createdAt);
    case "alphabetical":
      return todos.toSorted((a, b) => collator.compare(a.title, b.title));
  }
};
