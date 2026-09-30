import { pluralize } from "@/lib/text";
import { createMatcher, normalizeTitle, parseTodos } from "@/lib/todo";

import { selectCompletedIds, selectFilter, selectQuery, selectToast } from "./selectors";
import { toastDismissed, toastShown } from "./slices/toastSlice";
import { todoAdded, todosImported, todosRemoved, todosRestored, type RemovedTodo } from "./slices/todosSlice";
import { filterChanged, queryChanged } from "./slices/viewSlice";
import type { AppThunk } from "./store";

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

export const addTodo =
  (title: string): AppThunk<boolean> =>
  (dispatch, getState) => {
    const normalized = normalizeTitle(title);
    if (!normalized) return false;

    dispatch(todoAdded(normalized));

    const state = getState();
    if (selectFilter(state) === "completed") dispatch(filterChanged("all"));
    if (!createMatcher(selectQuery(state))(normalized)) dispatch(queryChanged(""));
    return true;
  };

export const removeTodos =
  (ids: readonly string[], message?: string): AppThunk =>
  (dispatch, getState) => {
    const { todos } = getState();
    const removed = ids.flatMap((id): RemovedTodo[] => {
      const todo = todos.entities[id];
      return todo ? [{ todo, index: todos.ids.indexOf(id) }] : [];
    });

    const [first] = removed;
    if (!first) return;

    dispatch(todosRemoved(removed.map(({ todo }) => todo.id)));
    dispatch(
      toastShown({
        message:
          message ??
          (removed.length === 1 ? `Deleted “${first.todo.title}”` : `Deleted ${pluralize(removed.length, "task")}`),
        undo: removed,
      }),
    );
  };

export const clearCompleted = (): AppThunk => (dispatch, getState) => {
  const ids = selectCompletedIds(getState());
  dispatch(removeTodos(ids, `Cleared ${pluralize(ids.length, "completed task")}`));
};

export const undoRemoval = (): AppThunk => (dispatch, getState) => {
  const toast = selectToast(getState());
  if (!toast?.undo) return;

  dispatch(todosRestored(toast.undo));
  dispatch(toastDismissed(toast.id));
};

export const importTodos =
  (text: string): AppThunk =>
  (dispatch, getState) => {
    const todos = parseTodos(parseJson(text));
    if (!todos) {
      dispatch(toastShown({ message: "This file is not a valid ToDo export", tone: "error" }));
      return;
    }

    const { entities } = getState().todos;
    const fresh = todos.filter((todo) => !(todo.id in entities));
    dispatch(todosImported(fresh));
    dispatch(
      toastShown({
        message: fresh.length > 0 ? `Imported ${pluralize(fresh.length, "task")}` : "Nothing new to import",
      }),
    );
  };
