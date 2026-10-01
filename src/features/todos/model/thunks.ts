import type { AppThunk } from "@/app/store";
import { isOverdue, matchesList, type ListId } from "@/features/lists/model/lists";
import { selectDetailsId, selectList, selectQuery } from "@/features/lists/model/selectors";
import { detailsClosed, queryChanged } from "@/features/lists/model/viewSlice";
import { selectToast } from "@/features/notifications/model/selectors";
import { toastDismissed, toastShown, type ToastMessage } from "@/features/notifications/model/toastSlice";
import { toDateKey } from "@/shared/lib/date";
import { downloadJson } from "@/shared/lib/download";

import { redone, undone } from "./history";
import { selectCompletedIds, selectTodoById, selectTodos } from "./selectors";
import { createMatcher, normalizeTitle, type Todo, type TodoDraft } from "./todo";
import {
  todoAdded,
  todoDuplicated,
  todosImported,
  todosRemoved,
  todosRestored,
  todosScheduled,
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
    const today = toDateKey(new Date());
    if (!createMatcher(selectQuery(state))(title)) dispatch(queryChanged(""));
    if (!matchesList(todo, selectList(state), today)) {
      const list = homeListOf(todo, today);
      dispatch(
        toastShown({
          message: { key: "toast.addedTo", params: { title: todo.title, list: { key: `lists.${list}` } } },
          tone: "success",
          action: { type: "show", list, todoId: todo.id },
        }),
      );
    }
    return true;
  };

export const homeListOf = (todo: Todo, today: string): ListId => {
  if (todo.dueDate !== null) return todo.dueDate <= today ? "today" : "upcoming";
  return todo.important ? "important" : "all";
};

export const rescheduleOverdue =
  (today: string): AppThunk<number> =>
  (dispatch, getState) => {
    const ids = selectTodos(getState())
      .filter((todo) => isOverdue(todo, today))
      .map((todo) => todo.id);
    if (ids.length === 0) return 0;

    dispatch(todosScheduled(ids, today));
    dispatch(
      toastShown({
        message: { key: "toast.rescheduled", params: { count: ids.length } },
        action: { type: "undo" },
      }),
    );
    return ids.length;
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

    const removedIds = removed.map(({ todo }) => todo.id);
    dispatch(todosRemoved(removedIds));
    const detailsId = selectDetailsId(getState());
    if (detailsId !== null && removedIds.includes(detailsId)) dispatch(detailsClosed());

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
