import type { Todo } from "@/features/todos/model/todo";

export const SORT_MODES = ["manual", "dueDate", "priority", "newest", "alphabetical"] as const;

export type SortMode = (typeof SORT_MODES)[number];

// Whether a value is a sort order
export const isSortMode = (value: unknown): value is SortMode =>
  typeof value === "string" && (SORT_MODES as readonly string[]).includes(value);

// Earlier dates first, tasks without a date last
const byDueDate = (a: Todo, b: Todo) => {
  if (a.dueDate === b.dueDate) return 0;
  if (a.dueDate === null) return 1;
  if (b.dueDate === null) return -1;
  return a.dueDate < b.dueDate ? -1 : 1;
};

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

// Tasks in the chosen order; manual keeps the dragged order
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
