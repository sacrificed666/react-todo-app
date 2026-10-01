import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@/app/store";
import { isOverdue, matchesList, type ListId } from "@/features/lists/model/lists";
import { selectList, selectQuery, selectSort } from "@/features/lists/model/selectors";
import { sortTodos } from "@/features/lists/model/sort";
import { addDays, toDateKey } from "@/shared/lib/date";

import { createMatcher } from "./todo";
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

export const selectActivity = createSelector([selectTodos, selectToday], (todos, today) => {
  const completions = new Map<string, number>();
  for (const todo of todos) {
    if (!todo.completed || todo.completedAt === null) continue;
    const day = toDateKey(new Date(todo.completedAt));
    completions.set(day, (completions.get(day) ?? 0) + 1);
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(today, index - 6);
    return { day, count: completions.get(day) ?? 0 };
  });

  let streak = 0;
  let cursor = completions.has(today) ? today : addDays(today, -1);
  while ((completions.get(cursor) ?? 0) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return { days, streak };
});
