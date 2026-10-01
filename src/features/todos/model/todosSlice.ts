import { createEntityAdapter, createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

import { isDateKey, toDateKey } from "@/shared/lib/date";

import { nextOccurrence } from "./repeat";
import { createTodo, normalizeNotes, normalizeTitle, type Repeat, type Todo, type TodoDraft } from "./todo";

export interface RemovedTodo {
  todo: Todo;
  index: number;
}

export const todosAdapter = createEntityAdapter<Todo>();

export const todosSlice = createSlice({
  name: "todos",
  initialState: todosAdapter.getInitialState(),
  reducers: {
    todoAdded: {
      reducer(state, action: PayloadAction<Todo>) {
        const todo = action.payload;
        if (!todo.title || todo.id in state.entities) return;
        state.ids.unshift(todo.id);
        state.entities[todo.id] = todo;
      },
      prepare: (draft: TodoDraft) => ({ payload: createTodo(draft, Date.now()) }),
    },
    todoToggled: {
      reducer(state, action: PayloadAction<{ id: string; at: number; nextId: string }>) {
        const { id, at, nextId } = action.payload;
        const todo = state.entities[id];
        if (!todo) return;
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? at : null;
        todo.updatedAt = at;
        if (!todo.completed || !todo.repeat || !todo.dueDate || nextId in state.entities) return;

        state.entities[nextId] = {
          ...todo,
          id: nextId,
          completed: false,
          completedAt: null,
          dueDate: nextOccurrence(todo.dueDate, todo.repeat, toDateKey(new Date(at))),
          createdAt: at,
        };
        state.ids.splice(state.ids.indexOf(id) + 1, 0, nextId);
        todo.repeat = null;
      },
      prepare: (id: string) => ({ payload: { id, at: Date.now(), nextId: nanoid() } }),
    },
    todoRenamed: {
      reducer(state, action: PayloadAction<{ id: string; title: string; at: number }>) {
        const todo = state.entities[action.payload.id];
        const title = normalizeTitle(action.payload.title);
        if (!todo || !title || todo.title === title) return;
        todo.title = title;
        todo.updatedAt = action.payload.at;
      },
      prepare: (id: string, title: string) => ({ payload: { id, title, at: Date.now() } }),
    },
    todoImportanceToggled: {
      reducer(state, action: PayloadAction<{ id: string; at: number }>) {
        const todo = state.entities[action.payload.id];
        if (!todo) return;
        todo.important = !todo.important;
        todo.updatedAt = action.payload.at;
      },
      prepare: (id: string) => ({ payload: { id, at: Date.now() } }),
    },
    todoScheduled: {
      reducer(state, action: PayloadAction<{ id: string; dueDate: string | null; at: number }>) {
        const todo = state.entities[action.payload.id];
        const dueDate = isDateKey(action.payload.dueDate) ? action.payload.dueDate : null;
        if (!todo || todo.dueDate === dueDate) return;
        todo.dueDate = dueDate;
        if (dueDate === null) todo.repeat = null;
        todo.updatedAt = action.payload.at;
      },
      prepare: (id: string, dueDate: string | null) => ({ payload: { id, dueDate, at: Date.now() } }),
    },
    todosScheduled: {
      reducer(state, action: PayloadAction<{ ids: readonly string[]; dueDate: string; at: number }>) {
        const { ids, dueDate, at } = action.payload;
        if (!isDateKey(dueDate)) return;
        for (const id of ids) {
          const todo = state.entities[id];
          if (!todo || todo.dueDate === dueDate) continue;
          todo.dueDate = dueDate;
          todo.updatedAt = at;
        }
      },
      prepare: (ids: readonly string[], dueDate: string) => ({ payload: { ids, dueDate, at: Date.now() } }),
    },
    todoRepeatChanged: {
      reducer(state, action: PayloadAction<{ id: string; repeat: Repeat | null; at: number }>) {
        const { id, repeat, at } = action.payload;
        const todo = state.entities[id];
        if (!todo || todo.repeat === repeat) return;
        todo.repeat = repeat;
        if (repeat && !todo.dueDate) todo.dueDate = toDateKey(new Date(at));
        todo.updatedAt = at;
      },
      prepare: (id: string, repeat: Repeat | null) => ({ payload: { id, repeat, at: Date.now() } }),
    },
    todoNoted: {
      reducer(state, action: PayloadAction<{ id: string; notes: string; at: number }>) {
        const todo = state.entities[action.payload.id];
        const notes = normalizeNotes(action.payload.notes);
        if (!todo || todo.notes === notes) return;
        todo.notes = notes;
        todo.updatedAt = action.payload.at;
      },
      prepare: (id: string, notes: string) => ({ payload: { id, notes, at: Date.now() } }),
    },
    todoDuplicated: {
      reducer(state, action: PayloadAction<{ id: string; copyId: string; at: number }>) {
        const { id, copyId, at } = action.payload;
        const original = state.entities[id];
        if (!original || copyId in state.entities) return;
        state.entities[copyId] = {
          ...original,
          id: copyId,
          completed: false,
          completedAt: null,
          createdAt: at,
          updatedAt: at,
        };
        state.ids.splice(state.ids.indexOf(id) + 1, 0, copyId);
      },
      prepare: (id: string) => ({ payload: { id, copyId: nanoid(), at: Date.now() } }),
    },
    todoMoved(state, action: PayloadAction<{ activeId: string; overId: string }>) {
      const from = state.ids.indexOf(action.payload.activeId);
      const to = state.ids.indexOf(action.payload.overId);
      if (from === -1 || to === -1 || from === to) return;
      const [id] = state.ids.splice(from, 1);
      if (id !== undefined) state.ids.splice(to, 0, id);
    },
    allTodosMarked: {
      reducer(state, action: PayloadAction<{ completed: boolean; at: number }>) {
        const { completed, at } = action.payload;
        for (const todo of Object.values(state.entities)) {
          if (todo.completed === completed) continue;
          todo.completed = completed;
          todo.completedAt = completed ? at : null;
          todo.updatedAt = at;
        }
      },
      prepare: (completed: boolean) => ({ payload: { completed, at: Date.now() } }),
    },
    todosRemoved(state, action: PayloadAction<readonly string[]>) {
      todosAdapter.removeMany(state, action.payload);
    },
    todosRestored(state, action: PayloadAction<readonly RemovedTodo[]>) {
      for (const { todo, index } of action.payload.toSorted((a, b) => a.index - b.index)) {
        if (todo.id in state.entities) continue;
        state.ids.splice(Math.min(Math.max(index, 0), state.ids.length), 0, todo.id);
        state.entities[todo.id] = todo;
      }
    },
    todosImported(state, action: PayloadAction<readonly Todo[]>) {
      for (const todo of action.payload) {
        if (todo.id in state.entities) continue;
        state.ids.push(todo.id);
        state.entities[todo.id] = todo;
      }
    },
    todosReplaced(state, action: PayloadAction<readonly Todo[]>) {
      todosAdapter.setAll(state, action.payload);
    },
  },
});

export const {
  todoAdded,
  todoToggled,
  todoRenamed,
  todoImportanceToggled,
  todoScheduled,
  todosScheduled,
  todoRepeatChanged,
  todoNoted,
  todoDuplicated,
  todoMoved,
  allTodosMarked,
  todosRemoved,
  todosRestored,
  todosImported,
  todosReplaced,
} = todosSlice.actions;
