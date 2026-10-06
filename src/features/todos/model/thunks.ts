import type { AppThunk, RootState } from "@/app/store";
import {
  isOverdue,
  isProjectView,
  matchesView,
  projectIdOf,
  projectView,
  type ListId,
  type ViewId,
} from "@/features/lists/model/lists";
import { selectDetailsId, selectList, selectQuery, selectSearching } from "@/features/lists/model/selectors";
import { detailsClosed, queryChanged } from "@/features/lists/model/viewSlice";
import { selectToast } from "@/features/notifications/model/selectors";
import { toastDismissed, toastShown, type ToastMessage } from "@/features/notifications/model/toastSlice";
import { addDays, toDateKey } from "@/shared/lib/date";

import { selectCompletedIds, selectTodoById, selectTodos } from "./selectors";
import { createMatcher, normalizeTitle, type Todo, type TodoDraft } from "./todo";
import {
  todoAdded,
  todoDuplicated,
  todoImportanceToggled,
  todoProjectChanged,
  todoScheduled,
  todosRemoved,
  todosRestored,
  todosScheduled,
  todoToggled,
  type RemovedTodo,
} from "./todosSlice";

// Adds a task and offers to show it when it lands in another list
export const addTodo =
  (draft: TodoDraft): AppThunk<boolean> =>
  (dispatch, getState) => {
    const title = normalizeTitle(draft.title);
    if (!title) return false;

    const { payload: todo } = dispatch(todoAdded({ ...draft, title }));
    if (!createMatcher(selectQuery(getState()))(title)) dispatch(queryChanged(""));

    const state = getState();
    const today = toDateKey(new Date());
    if (selectSearching(state) || matchesView(todo, selectList(state), today)) return true;

    const view = homeViewOf(todo, today);
    dispatch(
      toastShown({
        message: { key: "toast.addedTo", params: { title: todo.title, list: viewName(state, view) } },
        tone: "success",
        action: { type: "show", list: view, todoId: todo.id },
      }),
    );
    return true;
  };

// The name of a list or project for a toast
export const viewName = (state: RootState, view: ViewId): ToastMessage | string =>
  isProjectView(view) ? (state.projects.entities[projectIdOf(view) ?? ""]?.name ?? "") : { key: `lists.${view}` };

// The smart list a task belongs to
export const homeListOf = (todo: Todo, today: string): ListId => {
  if (todo.dueDate !== null) return todo.dueDate <= today ? "today" : "upcoming";
  return todo.important ? "important" : "all";
};

// The project or smart list a task belongs to
export const homeViewOf = (todo: Todo, today: string): ViewId =>
  todo.projectId === null ? homeListOf(todo, today) : projectView(todo.projectId);

// Moves every overdue task to today, with undo
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

// Completes or reopens a task and says when the list is done
export const toggleTodo =
  (id: string, today: string): AppThunk<boolean> =>
  (dispatch, getState) => {
    dispatch(todoToggled(id));

    const state = getState();
    const list = selectList(state);
    if (list === "completed" || selectSearching(state) || !selectTodoById(state, id)?.completed) return false;
    if (selectTodos(state).some((todo) => !todo.completed && matchesView(todo, list, today))) return false;

    dispatch(
      toastShown({ message: { key: "toast.allDone", params: { list: viewName(state, list) } }, tone: "success" }),
    );
    return true;
  };

// Copies a task right below the original
export const duplicateTodo =
  (id: string): AppThunk<string | null> =>
  (dispatch, getState) => {
    const original = selectTodoById(getState(), id);
    if (!original) return null;

    const { payload } = dispatch(todoDuplicated(id));
    dispatch(toastShown({ message: { key: "toast.duplicated", params: { title: original.title } } }));
    return payload.copyId;
  };

// Removes tasks and offers to restore them in place
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

// Removes every completed task
export const clearCompleted = (): AppThunk => (dispatch, getState) => {
  dispatch(removeTodos(selectCompletedIds(getState()), true));
};

// Restores the tasks of the last removal toast
export const undoRemoval = (): AppThunk => (dispatch, getState) => {
  const toast = selectToast(getState());
  if (toast?.action?.type !== "restore") return;

  dispatch(todosRestored(toast.action.todos));
  dispatch(toastDismissed(toast.id));
};

// A task dropped on a list or project changes to match it
export const dropTodo =
  (id: string, target: ViewId, today: string): AppThunk<boolean> =>
  (dispatch, getState) => {
    const todo = selectTodoById(getState(), id);
    if (!todo) return false;
    const before = getState().todos;

    if (isProjectView(target)) dispatch(todoProjectChanged(id, projectIdOf(target)));
    else if (target === "today") dispatch(todoScheduled(id, today));
    else if (target === "upcoming" && (todo.dueDate === null || todo.dueDate <= today))
      dispatch(todoScheduled(id, addDays(today, 1)));
    else if (target === "important" && !todo.important) dispatch(todoImportanceToggled(id));
    else if (target === "completed" && !todo.completed) dispatch(todoToggled(id));

    if (getState().todos === before) return false;
    dispatch(
      toastShown({
        message: { key: "toast.dropped", params: { title: todo.title, target: viewName(getState(), target) } },
        action: { type: "undo" },
      }),
    );
    return true;
  };
