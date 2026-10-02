import { createAction, createSlice, type EntityState, type Reducer, type UnknownAction } from "@reduxjs/toolkit";

import type { ToastMessage } from "@/features/notifications/model/toastSlice";
import type { Project } from "@/features/projects/model/project";
import { projectAdded, projectMoved, projectRemoved, projectUpdated } from "@/features/projects/model/projectsSlice";
import type { Todo } from "@/features/todos/model/todo";
import {
  allTodosMarked,
  todoAdded,
  todoDuplicated,
  todoImportanceToggled,
  todoMoved,
  todoNoted,
  todoProjectChanged,
  todoRenamed,
  todoRepeatChanged,
  todoScheduled,
  todosScheduled,
  todosRemoved,
  todosRestored,
  todoToggled,
} from "@/features/todos/model/todosSlice";
import { isRecord } from "@/shared/lib/guards";

import { dataImported, dataReplaced } from "./actions";

export const HISTORY_LIMIT = 50;

type TodosState = EntityState<Todo, string>;
type ProjectsState = EntityState<Project, string>;

export interface Snapshot {
  todos: TodosState;
  projects: ProjectsState;
}

export interface HistoryEntry extends Snapshot {
  description: ToastMessage;
}

export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
}

const initialState: HistoryState = { past: [], future: [] };

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {},
});

export const undone = createAction("history/undone");
export const redone = createAction("history/redone");

const titled = (key: ToastMessage["key"], todo: Todo | undefined): ToastMessage => ({
  key,
  params: { title: todo?.title ?? "" },
});

const named = (key: ToastMessage["key"], project: Project | undefined): ToastMessage => ({
  key,
  params: { name: project?.name ?? "" },
});

export const describeChange = (action: UnknownAction, { todos, projects }: Snapshot): ToastMessage => {
  if (todoAdded.match(action)) return titled("history.added", action.payload);
  if (todoDuplicated.match(action)) return titled("history.duplicated", todos.entities[action.payload.id]);
  if (todoToggled.match(action)) {
    const todo = todos.entities[action.payload.id];
    return titled(todo?.completed ? "history.reopened" : "history.completed", todo);
  }
  if (todoRenamed.match(action)) return titled("history.renamed", todos.entities[action.payload.id]);
  if (todoImportanceToggled.match(action)) {
    const todo = todos.entities[action.payload.id];
    return titled(todo?.important ? "history.unstarred" : "history.starred", todo);
  }
  if (todoScheduled.match(action)) return titled("history.scheduled", todos.entities[action.payload.id]);
  if (todosScheduled.match(action)) return { key: "history.rescheduled", params: { count: action.payload.ids.length } };
  if (todoRepeatChanged.match(action)) return titled("history.repeat", todos.entities[action.payload.id]);
  if (todoProjectChanged.match(action)) return titled("history.projectChanged", todos.entities[action.payload.id]);
  if (todoNoted.match(action)) return titled("history.noted", todos.entities[action.payload.id]);
  if (todoMoved.match(action)) return { key: "history.moved" };
  if (allTodosMarked.match(action)) return { key: "history.markedAll" };
  if (todosRemoved.match(action)) return { key: "history.removed", params: { count: action.payload.length } };
  if (todosRestored.match(action)) return { key: "history.restored" };
  if (dataImported.match(action)) return { key: "history.imported" };
  if (projectAdded.match(action)) return named("history.projectAdded", action.payload);
  if (projectUpdated.match(action)) return named("history.projectEdited", projects.entities[action.payload.id]);
  if (projectMoved.match(action)) return { key: "history.projectsReordered" };
  if (projectRemoved.match(action)) return named("history.projectRemoved", projects.entities[action.payload]);
  return { key: "history.changed" };
};

interface UndoableState extends Snapshot {
  history: HistoryState;
}

const isUndoable = (value: unknown): value is UndoableState =>
  isRecord(value) && "todos" in value && "projects" in value && "history" in value;

const step = <State extends UndoableState>(state: State, direction: "back" | "forward"): State => {
  const source = direction === "back" ? state.history.past : state.history.future;
  const entry = source.at(-1);
  if (!entry) return state;

  const moved = { todos: state.todos, projects: state.projects, description: entry.description };
  return {
    ...state,
    todos: entry.todos,
    projects: entry.projects,
    history:
      direction === "back"
        ? { past: state.history.past.slice(0, -1), future: [...state.history.future, moved] }
        : { past: [...state.history.past, moved], future: state.history.future.slice(0, -1) },
  };
};

export const withHistory =
  <State extends UndoableState, Preloaded>(
    reducer: Reducer<State, UnknownAction, Preloaded>,
  ): Reducer<State, UnknownAction, Preloaded> =>
  (state, action) => {
    const next = reducer(state, action);
    if (undone.match(action)) return step(next, "back");
    if (redone.match(action)) return step(next, "forward");
    if (!isUndoable(state) || (next.todos === state.todos && next.projects === state.projects)) return next;
    if (dataReplaced.match(action)) return { ...next, history: initialState };

    const entry = { todos: state.todos, projects: state.projects, description: describeChange(action, state) };
    return { ...next, history: { past: [...state.history.past, entry].slice(-HISTORY_LIMIT), future: [] } };
  };
