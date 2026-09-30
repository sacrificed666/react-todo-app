import { createEntityAdapter, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { createTodo, normalizeTitle, type Todo } from "@/lib/todo";

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
      prepare: (title: string) => ({ payload: createTodo(title, Date.now()) }),
    },
    todoToggled: {
      reducer(state, action: PayloadAction<{ id: string; at: number }>) {
        const todo = state.entities[action.payload.id];
        if (!todo) return;
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? action.payload.at : null;
        todo.updatedAt = action.payload.at;
      },
      prepare: (id: string) => ({ payload: { id, at: Date.now() } }),
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
  todoMoved,
  allTodosMarked,
  todosRemoved,
  todosRestored,
  todosImported,
  todosReplaced,
} = todosSlice.actions;
