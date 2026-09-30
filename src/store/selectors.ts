import { createSelector } from "@reduxjs/toolkit";

import { isOverdue, matchesList, type ListId } from "@/lib/lists";
import { sortTodos } from "@/lib/sort";
import { createMatcher } from "@/lib/todo";

import { todosAdapter } from "./slices/todosSlice";
import type { RootState } from "./store";

const todoSelectors = todosAdapter.getSelectors((state: RootState) => state.todos);

export const selectTodos = todoSelectors.selectAll;
export const selectTodoById = todoSelectors.selectById;
export const selectList = (state: RootState) => state.view.list;
export const selectQuery = (state: RootState) => state.view.query;
export const selectSort = (state: RootState) => state.view.sort;
export const selectShowCompleted = (state: RootState) => state.view.showCompleted;
export const selectSettings = (state: RootState) => state.settings;
export const selectToast = (state: RootState) => state.toast.current;

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
    const visible = todos.filter((todo) => matchesList(todo, list, today) && matches(todo.title));
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
