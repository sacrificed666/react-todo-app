import type { Todo } from "@/features/todos/model/todo";
import { daysBetween } from "@/shared/lib/date";

import type { ViewId } from "./lists";

export type TodoGroupKind = "overdue" | "day" | "month" | "all";

export interface TodoGroup {
  id: string;
  kind: TodoGroupKind;
  date: string | null;
  todos: readonly Todo[];
}

const DAYS_SHOWN_ONE_BY_ONE = 7;

// Upcoming tasks by day for a week, then by month
const groupUpcoming = (todos: readonly Todo[], today: string): TodoGroup[] => {
  const groups = new Map<
    string,
    { sortKey: string; group: { id: string; kind: TodoGroupKind; date: string; todos: Todo[] } }
  >();

  for (const todo of todos) {
    const date = todo.dueDate ?? today;
    const byDay = daysBetween(today, date) <= DAYS_SHOWN_ONE_BY_ONE;
    const month = date.slice(0, 7);
    const id = byDay ? `day-${date}` : `month-${month}`;
    const entry = groups.get(id);
    if (entry) entry.group.todos.push(todo);
    else
      groups.set(id, {
        sortKey: byDay ? date : `${month}-99`,
        group: { id, kind: byDay ? "day" : "month", date: byDay ? date : `${month}-01`, todos: [todo] },
      });
  }

  return [...groups.values()].toSorted((a, b) => a.sortKey.localeCompare(b.sortKey)).map(({ group }) => group);
};

// Open tasks in sections: overdue and today, days, months or one
export const groupActiveTodos = (todos: readonly Todo[], list: ViewId, today: string): TodoGroup[] => {
  if (todos.length === 0) return [];

  if (list === "today") {
    const overdue = todos.filter((todo) => todo.dueDate !== null && todo.dueDate < today);
    const due = todos.filter((todo) => !overdue.includes(todo));
    return [
      ...(overdue.length > 0 ? [{ id: "overdue", kind: "overdue" as const, date: null, todos: overdue }] : []),
      ...(due.length > 0 ? [{ id: "today", kind: "day" as const, date: today, todos: due }] : []),
    ];
  }

  if (list === "upcoming") return groupUpcoming(todos, today);

  return [{ id: "active", kind: "all", date: null, todos }];
};
