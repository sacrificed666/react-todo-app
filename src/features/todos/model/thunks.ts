import type { AppThunk } from "@/app/store";
import { matchesList } from "@/features/lists/model/lists";
import { selectList, selectQuery } from "@/features/lists/model/selectors";
import { listChanged, queryChanged } from "@/features/lists/model/viewSlice";
import { selectToast } from "@/features/notifications/model/selectors";
import { toastDismissed, toastShown, type ToastMessage } from "@/features/notifications/model/toastSlice";
import { toDateKey } from "@/shared/lib/date";
import { downloadJson } from "@/shared/lib/download";

import { redone, undone } from "./history";
import { selectCompletedIds, selectTodoById, selectTodos } from "./selectors";
import { createMatcher, normalizeTitle, type TodoDraft } from "./todo";
import {
  todoAdded,
  todoDuplicated,
  todosImported,
  todosRemoved,
  todosRestored,
  todoToggled,
  type RemovedTodo,
} from "./todosSlice";
import { createExport, exportFileName, readImport } from "./transfer";

export const addTodo =
  (draft: TodoDraft): AppThunk<boolean> =>
  (dispatch, getState) => {
    const title = normalizeTitle(draft.title);
    if (!title) return false;

    const { payload: todo } = dispatch(todoAdded({ ...draft, title }));

    const state = getState();
    if (!matchesList(todo, selectList(state), toDateKey(new Date()))) dispatch(listChanged("all"));
    if (!createMatcher(selectQuery(state))(title)) dispatch(queryChanged(""));
    return true;
  };

export const toggleTodo =
  (id: string, today: string): AppThunk<boolean> =>
  (dispatch, getState) => {
    dispatch(todoToggled(id));

    const state = getState();
    const list = selectList(state);
    if (list === "completed" || !selectTodoById(state, id)?.completed) return false;
    if (selectTodos(state).some((todo) => !todo.completed && matchesList(todo, list, today))) return false;

    dispatch(
      toastShown({ message: { key: "toast.allDone", params: { list: { key: `lists.${list}` } } }, tone: "success" }),
    );
    return true;
  };

export const duplicateTodo =
  (id: string): AppThunk<string | null> =>
  (dispatch, getState) => {
    const original = selectTodoById(getState(), id);
    if (!original) return null;

    const { payload } = dispatch(todoDuplicated(id));
    dispatch(toastShown({ message: { key: "toast.duplicated", params: { title: original.title } } }));
    return payload.copyId;
  };

export const removeTodos =
  (ids: readonly string[], cleared = false): AppThunk =>
  (dispatch, getState) => {
    const { todos } = getState();
    const removed = ids.flatMap((id): RemovedTodo[] => {
      const todo = todos.entities[id];
      return todo ? [{ todo, index: todos.ids.indexOf(id) }] : [];
    });

    const [first] = removed;
    if (!first) return;

    dispatch(todosRemoved(removed.map(({ todo }) => todo.id)));

    const count = removed.length;
    const message: ToastMessage = cleared
      ? { key: "toast.cleared", params: { count } }
      : count === 1
        ? { key: "toast.deletedOne", params: { title: first.todo.title } }
        : { key: "toast.deletedMany", params: { count } };

    dispatch(toastShown({ message, action: { type: "restore", todos: removed } }));
  };

export const clearCompleted = (): AppThunk => (dispatch, getState) => {
  dispatch(removeTodos(selectCompletedIds(getState()), true));
};

export const undoRemoval = (): AppThunk => (dispatch, getState) => {
  const toast = selectToast(getState());
  if (toast?.action?.type !== "restore") return;

  dispatch(todosRestored(toast.action.todos));
  dispatch(toastDismissed(toast.id));
};

export const importTodos =
  (text: string): AppThunk =>
  (dispatch, getState) => {
    const todos = readImport(text);
    if (!todos) {
      dispatch(toastShown({ message: { key: "toast.invalidImport" }, tone: "error" }));
      return;
    }

    const { entities } = getState().todos;
    const fresh = todos.filter((todo) => !(todo.id in entities));
    dispatch(todosImported(fresh));
    dispatch(
      toastShown({
        message:
          fresh.length > 0
            ? { key: "toast.imported", params: { count: fresh.length } }
            : { key: "toast.nothingImported" },
      }),
    );
  };

export const exportTodos = (): AppThunk => (_dispatch, getState) => {
  const now = new Date();
  downloadJson(exportFileName(now), createExport(selectTodos(getState()), now));
};

export const undo = (): AppThunk => (dispatch, getState) => {
  const entry = getState().history.past.at(-1);
  if (!entry) return;
  dispatch(undone());
  dispatch(toastShown({ message: { key: "toast.undone", params: { action: entry.description } } }));
};

export const redo = (): AppThunk => (dispatch, getState) => {
  const entry = getState().history.future.at(-1);
  if (!entry) return;
  dispatch(redone());
  dispatch(toastShown({ message: { key: "toast.redone", params: { action: entry.description } } }));
};
