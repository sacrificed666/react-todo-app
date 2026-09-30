import { createSelector } from "@reduxjs/toolkit";

import { createMatcher } from "@/lib/todo";

import { todosAdapter } from "./slices/todosSlice";
import type { RootState } from "./store";

const todoSelectors = todosAdapter.getSelectors((state: RootState) => state.todos);

export const selectTodos = todoSelectors.selectAll;
export const selectTodoById = todoSelectors.selectById;
export const selectFilter = (state: RootState) => state.view.filter;
export const selectQuery = (state: RootState) => state.view.query;
export const selectToast = (state: RootState) => state.toast.current;

export const selectCounts = createSelector([selectTodos], (todos) => {
  const completed = todos.filter((todo) => todo.completed).length;
  return { total: todos.length, active: todos.length - completed, completed };
});

export const selectCompletedIds = createSelector([selectTodos], (todos) =>
  todos.filter((todo) => todo.completed).map((todo) => todo.id),
);

export const selectVisibleTodos = createSelector([selectTodos, selectFilter, selectQuery], (todos, filter, query) => {
  const matches = createMatcher(query);
  const matching = todos.filter((todo) => matches(todo.title));
  return {
    active: filter === "completed" ? [] : matching.filter((todo) => !todo.completed),
    completed: filter === "active" ? [] : matching.filter((todo) => todo.completed),
  };
});
