import type { AppThunk, RootState } from "@/app/store";
import { toastShown, type ToastMessage } from "@/features/notifications/model/toastSlice";
import { selectProjects } from "@/features/projects/model/selectors";
import { selectTodos } from "@/features/todos/model/selectors";
import { downloadJson } from "@/shared/lib/download";

import { dataImported } from "./actions";
import { redone, undone } from "./history";
import { createExport, exportFileName, readImport } from "./transfer";

// The undo and redo stacks
export const selectHistory = (state: RootState) => state.history;

// Adds the new tasks and projects of a file and reports the result
export const importData =
  (text: string): AppThunk =>
  (dispatch, getState) => {
    const data = readImport(text);
    if (!data) {
      dispatch(toastShown({ message: { key: "toast.invalidImport" }, tone: "error" }));
      return;
    }

    const state = getState();
    const todos = data.todos.filter((todo) => !(todo.id in state.todos.entities));
    const projects = data.projects.filter((project) => !(project.id in state.projects.entities));
    dispatch(dataImported({ todos, projects }));

    const message: ToastMessage =
      todos.length > 0
        ? { key: "toast.imported", params: { count: todos.length } }
        : projects.length > 0
          ? { key: "toast.importedProjects", params: { count: projects.length } }
          : { key: "toast.nothingImported" };
    dispatch(toastShown({ message }));
  };

// Downloads every task and project as a JSON file
export const exportData = (): AppThunk => (_dispatch, getState) => {
  const state = getState();
  const now = new Date();
  downloadJson(exportFileName(now), createExport({ todos: selectTodos(state), projects: selectProjects(state) }, now));
};

// Undoes the last change and says what it was
export const undo = (): AppThunk => (dispatch, getState) => {
  const entry = getState().history.past.at(-1);
  if (!entry) return;
  dispatch(undone());
  dispatch(toastShown({ message: { key: "toast.undone", params: { action: entry.description } } }));
};

// Redoes the last undone change and says what it was
export const redo = (): AppThunk => (dispatch, getState) => {
  const entry = getState().history.future.at(-1);
  if (!entry) return;
  dispatch(redone());
  dispatch(toastShown({ message: { key: "toast.redone", params: { action: entry.description } } }));
};
