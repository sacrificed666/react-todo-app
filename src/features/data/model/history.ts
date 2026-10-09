import { createAction, createSlice, type EntityState, type Reducer, type UnknownAction } from "@reduxjs/toolkit";

import type { ToastMessage } from "@/features/notifications/model/toastSlice";
import type { Project } from "@/features/projects/model/project";
import { projectAdded, projectMoved, projectRemoved, projectUpdated } from "@/features/projects/model/projectsSlice";
import type { Todo } from "@/features/todos/model/todo";
import {
  allTodosMarked,
  subtaskAdded,
  subtaskMoved,
  subtaskRemoved,
  subtaskRenamed,
  subtaskToggled,
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
  todoTagsChanged,
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

// Undo and redo stacks, filled by withHistory
export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {},
});

export const undone = createAction("history/undone");
export const redone = createAction("history/redone");

// A history message that names a task
const titled = (key: ToastMessage["key"], todo: Todo | undefined): ToastMessage => ({
  key,
  params: { title: todo?.title ?? "" },
});

// A history message that names a subtask
const subtaskNamed = (key: ToastMessage["key"], todo: Todo | undefined, subtaskId: string): ToastMessage => ({
  key,
  params: { title: todo?.subtasks.find((subtask) => subtask.id === subtaskId)?.title ?? "" },
});

// A history message that names a project
const named = (key: ToastMessage["key"], project: Project | undefined): ToastMessage => ({
  key,
  params: { name: project?.name ?? "" },
});

// What an action changed, for the undo and redo toasts
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
  if (todoTagsChanged.match(action)) return titled("history.tagged", todos.entities[action.payload.id]);
  if (subtaskAdded.match(action))
    return { key: "history.subtaskAdded", params: { title: action.payload.subtask.title } };
  if (subtaskToggled.match(action)) {
    const todo = todos.entities[action.payload.todoId];
    const done = todo?.subtasks.find((subtask) => subtask.id === action.payload.subtaskId)?.completed;
    return subtaskNamed(done ? "history.subtaskReopened" : "history.subtaskCompleted", todo, action.payload.subtaskId);
  }
  if (subtaskRenamed.match(action)) {
    return subtaskNamed("history.subtaskRenamed", todos.entities[action.payload.todoId], action.payload.subtaskId);
  }
  if (subtaskRemoved.match(action)) {
    return subtaskNamed("history.subtaskRemoved", todos.entities[action.payload.todoId], action.payload.subtaskId);
  }
  if (subtaskMoved.match(action)) return { key: "history.subtasksReordered" };
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

// Whether a state carries tasks, projects and history
const isUndoable = (value: unknown): value is UndoableState =>
  isRecord(value) && "todos" in value && "projects" in value && "history" in value;

// Moves one snapshot between the undo and redo stacks
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

// Wraps the root reducer so every data change can be undone
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
