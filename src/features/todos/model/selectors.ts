import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@/app/store";
import { isOverdue, matchesList, matchesView, type ListId } from "@/features/lists/model/lists";
import { selectList, selectQuery, selectSort } from "@/features/lists/model/selectors";
import { sortTodos } from "@/features/lists/model/sort";

import { createMatcher } from "./todo";
import { todosAdapter } from "./todosSlice";

const todoSelectors = todosAdapter.getSelectors((state: RootState) => state.todos);

export const selectTodos = todoSelectors.selectAll;
export const selectTodoById = todoSelectors.selectById;

// Passes today's date through to the selectors
const selectToday = (_state: RootState, today: string) => today;

export type ListCounts = Record<ListId, number> & { overdue: number; total: number };

// Open tasks per smart list, overdue and totals
export const selectListCounts = createSelector([selectTodos, selectToday], (todos, today): ListCounts => {
  const active = todos.filter((todo) => !todo.completed);
  const countActive = (list: ListId) => active.filter((todo) => matchesList(todo, list, today)).length;

  return {
    all: active.length,
    today: countActive("today"),
    upcoming: countActive("upcoming"),
    important: countActive("important"),
    completed: todos.length - active.length,
    overdue: active.filter((todo) => isOverdue(todo, today)).length,
    total: todos.length,
  };
});

// Ids of all completed tasks
export const selectCompletedIds = createSelector([selectTodos], (todos) =>
  todos.filter((todo) => todo.completed).map((todo) => todo.id),
);

// Open tasks per project
export const selectProjectCounts = createSelector([selectTodos], (todos): ReadonlyMap<string, number> => {
  const counts = new Map<string, number>();
  for (const todo of todos) {
    if (todo.completed || todo.projectId === null) continue;
    counts.set(todo.projectId, (counts.get(todo.projectId) ?? 0) + 1);
  }
  return counts;
});

// Open tasks per due date, for the calendar dots
export const selectDueDateCounts = createSelector([selectTodos], (todos): ReadonlyMap<string, number> => {
  const counts = new Map<string, number>();
  for (const todo of todos) {
    if (todo.completed || todo.dueDate === null) continue;
    counts.set(todo.dueDate, (counts.get(todo.dueDate) ?? 0) + 1);
  }
  return counts;
});

// Done and total tasks of the current view
export const selectListProgress = createSelector([selectTodos, selectList, selectToday], (todos, list, today) => {
  const inList = todos.filter((todo) => matchesView(todo, list, today));
  return { done: inList.filter((todo) => todo.completed).length, total: inList.length };
});

// A given query, or the search text
const selectQueryArgument = (state: RootState, _today: string, query?: string) => query ?? selectQuery(state);

// Open and completed tasks of the view or search, sorted
export const selectVisibleTodos = createSelector(
  [selectTodos, selectList, selectQueryArgument, selectSort, selectToday],
  (todos, list, query, sort, today) => {
    const searching = query.trim() !== "";
    const matches = createMatcher(query);
    const visible = todos.filter((todo) =>
      searching
        ? matches(todo.title) ||
          todo.tags.some(matches) ||
          matches(todo.notes) ||
          todo.subtasks.some((subtask) => matches(subtask.title))
        : matchesView(todo, list, today),
    );
    return {
      active: sortTodos(
        visible.filter((todo) => !todo.completed),
        sort,
      ),
      completed: sortTodos(
        visible.filter((todo) => todo.completed),
        sort,
      ),
    };
  },
);

export interface TagCount {
  tag: string;
  count: number;
}

// Tags of open tasks with their counts, the most used first
export const selectTagCounts = createSelector([selectTodos], (todos): TagCount[] => {
  const counts = new Map<string, TagCount>();
  for (const todo of todos) {
    if (todo.completed) continue;
    const seen = new Set<string>();
    for (const tag of todo.tags) {
      const key = tag.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const entry = counts.get(key);
      counts.set(key, { tag: entry?.tag ?? tag, count: (entry?.count ?? 0) + 1 });
    }
  }
  return [...counts.values()].toSorted((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
});

// Every tag in use, those of open tasks first, for picking tags
export const selectAllTags = createSelector([selectTodos, selectTagCounts], (todos, open): string[] => {
  const seen = new Set(open.map(({ tag }) => tag.toLocaleLowerCase()));
  const rest: string[] = [];
  for (const tag of todos.flatMap((todo) => todo.tags)) {
    const key = tag.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    rest.push(tag);
  }
  return [...open.map(({ tag }) => tag), ...rest.toSorted((a, b) => a.localeCompare(b))];
});
