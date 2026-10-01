import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@/app/store";
import { isOverdue, matchesList, type ListId } from "@/features/lists/model/lists";
import { selectList, selectQuery, selectSort } from "@/features/lists/model/selectors";
import { sortTodos } from "@/features/lists/model/sort";

import { createMatcher, extractTags } from "./todo";
import { todosAdapter } from "./todosSlice";

const todoSelectors = todosAdapter.getSelectors((state: RootState) => state.todos);

export const selectTodos = todoSelectors.selectAll;
export const selectTodoById = todoSelectors.selectById;

const selectToday = (_state: RootState, today: string) => today;

export type ListCounts = Record<ListId, number> & { overdue: number; total: number };

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

export const selectCompletedIds = createSelector([selectTodos], (todos) =>
  todos.filter((todo) => todo.completed).map((todo) => todo.id),
);

export const selectListProgress = createSelector([selectTodos, selectList, selectToday], (todos, list, today) => {
  const inList = todos.filter((todo) => matchesList(todo, list, today));
  return { done: inList.filter((todo) => todo.completed).length, total: inList.length };
});

export const selectVisibleTodos = createSelector(
  [selectTodos, selectList, selectQuery, selectSort, selectToday],
  (todos, list, query, sort, today) => {
    const matches = createMatcher(query);
    const visible = todos.filter(
      (todo) => matchesList(todo, list, today) && (matches(todo.title) || matches(todo.notes)),
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

export const selectHistory = (state: RootState) => state.history;

export interface TagCount {
  tag: string;
  count: number;
}

export const selectTagCounts = createSelector([selectTodos], (todos): TagCount[] => {
  const counts = new Map<string, TagCount>();
  for (const todo of todos) {
    if (todo.completed) continue;
    const seen = new Set<string>();
    for (const tag of extractTags(todo.title)) {
      const key = tag.toLocaleLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const entry = counts.get(key);
      counts.set(key, { tag: entry?.tag ?? tag, count: (entry?.count ?? 0) + 1 });
    }
  }
  return [...counts.values()].toSorted((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
});
