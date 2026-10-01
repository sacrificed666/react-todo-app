import { createAction, createSlice, type EntityState, type Reducer, type UnknownAction } from "@reduxjs/toolkit";

import type { ToastMessage } from "@/features/notifications/model/toastSlice";
import { isRecord } from "@/shared/lib/guards";

import type { Todo } from "./todo";
import {
  allTodosMarked,
  todoAdded,
  todoDuplicated,
  todoImportanceToggled,
  todoMoved,
  todoNoted,
  todoRenamed,
  todoScheduled,
  todosImported,
  todosRemoved,
  todosReplaced,
  todosRestored,
  todoToggled,
} from "./todosSlice";

export const HISTORY_LIMIT = 50;

type TodosState = EntityState<Todo, string>;

export interface HistoryEntry {
  todos: TodosState;
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

export const describeChange = (action: UnknownAction, before: TodosState): ToastMessage => {
  if (todoAdded.match(action)) return titled("history.added", action.payload);
  if (todoDuplicated.match(action)) return titled("history.duplicated", before.entities[action.payload.id]);
  if (todoToggled.match(action)) {
    const todo = before.entities[action.payload.id];
    return titled(todo?.completed ? "history.reopened" : "history.completed", todo);
  }
  if (todoRenamed.match(action)) return titled("history.renamed", before.entities[action.payload.id]);
  if (todoImportanceToggled.match(action)) {
    const todo = before.entities[action.payload.id];
    return titled(todo?.important ? "history.unstarred" : "history.starred", todo);
  }
  if (todoScheduled.match(action)) return titled("history.scheduled", before.entities[action.payload.id]);
  if (todoNoted.match(action)) return titled("history.noted", before.entities[action.payload.id]);
  if (todoMoved.match(action)) return { key: "history.moved" };
  if (allTodosMarked.match(action)) return { key: "history.markedAll" };
  if (todosRemoved.match(action)) return { key: "history.removed", params: { count: action.payload.length } };
  if (todosRestored.match(action)) return { key: "history.restored" };
  if (todosImported.match(action)) return { key: "history.imported" };
  return { key: "history.changed" };
};

interface UndoableState {
  todos: TodosState;
  history: HistoryState;
}

const isUndoable = (value: unknown): value is UndoableState =>
  isRecord(value) && "todos" in value && "history" in value;

const step = <State extends UndoableState>(state: State, direction: "back" | "forward"): State => {
  const source = direction === "back" ? state.history.past : state.history.future;
  const entry = source.at(-1);
  if (!entry) return state;

  const moved = { todos: state.todos, description: entry.description };
  return {
    ...state,
    todos: entry.todos,
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
    if (!isUndoable(state) || next.todos === state.todos) return next;
    if (todosReplaced.match(action)) return { ...next, history: initialState };

    const entry = { todos: state.todos, description: describeChange(action, state.todos) };
    return { ...next, history: { past: [...state.history.past, entry].slice(-HISTORY_LIMIT), future: [] } };
  };
