import { createEntityAdapter, createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

import { dataImported, dataReplaced } from "@/features/data/model/actions";
import { projectRemoved } from "@/features/projects/model/projectsSlice";
import { isDateKey, toDateKey } from "@/shared/lib/date";

import { nextOccurrence } from "./repeat";
import { createSubtask, MAX_SUBTASKS, normalizeSubtaskTitle, type Subtask } from "./subtasks";
import {
  createTodo,
  mergeTags,
  normalizeNotes,
  sameTags,
  splitTitleTags,
  type Repeat,
  type Todo,
  type TodoDraft,
} from "./todo";

export interface RemovedTodo {
  todo: Todo;
  index: number;
}

export const todosAdapter = createEntityAdapter<Todo>();

interface SubtaskTarget {
  todoId: string;
  subtaskId: string;
  at: number;
}

// A subtask of a task by id
const findSubtask = (todo: Todo | undefined, subtaskId: string) => todo?.subtasks.find((item) => item.id === subtaskId);

// Tasks in their manual order, with subtasks
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
          dueDate: nextOccurrence(todo.dueDate, todo.repeat, toDateKey(new Date(at)), todo.repeatAnchor ?? undefined),
          subtasks: todo.subtasks.map((subtask) => ({ ...subtask, completed: false })),
          createdAt: at,
        };
        state.ids.splice(state.ids.indexOf(id) + 1, 0, nextId);
        todo.repeat = null;
        todo.repeatAnchor = null;
      },
      prepare: (id: string) => ({ payload: { id, at: Date.now(), nextId: nanoid() } }),
    },
    todoRenamed: {
      reducer(state, action: PayloadAction<{ id: string; title: string; at: number }>) {
        const todo = state.entities[action.payload.id];
        const { title, tags: typed } = splitTitleTags(action.payload.title);
        if (!todo || !title) return;
        const tags = mergeTags(todo.tags, typed);
        if (todo.title === title && sameTags(todo.tags, tags)) return;
        todo.title = title;
        todo.tags = tags;
        todo.updatedAt = action.payload.at;
      },
      prepare: (id: string, title: string) => ({ payload: { id, title, at: Date.now() } }),
    },
    todoTagsChanged: {
      reducer(state, action: PayloadAction<{ id: string; tags: readonly string[]; at: number }>) {
        const todo = state.entities[action.payload.id];
        const tags = mergeTags(action.payload.tags);
        if (!todo || sameTags(todo.tags, tags)) return;
        todo.tags = tags;
        todo.updatedAt = action.payload.at;
      },
      prepare: (id: string, tags: readonly string[]) => ({ payload: { id, tags, at: Date.now() } }),
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
        todo.repeatAnchor = todo.repeat ? dueDate : null;
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
        todo.repeatAnchor = repeat ? todo.dueDate : null;
        todo.updatedAt = at;
      },
      prepare: (id: string, repeat: Repeat | null) => ({ payload: { id, repeat, at: Date.now() } }),
    },
    todoProjectChanged: {
      reducer(state, action: PayloadAction<{ id: string; projectId: string | null; at: number }>) {
        const { id, projectId, at } = action.payload;
        const todo = state.entities[id];
        if (!todo || todo.projectId === projectId) return;
        todo.projectId = projectId;
        todo.updatedAt = at;
      },
      prepare: (id: string, projectId: string | null) => ({ payload: { id, projectId, at: Date.now() } }),
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
    subtaskAdded: {
      reducer(state, action: PayloadAction<{ todoId: string; subtask: Subtask; at: number }>) {
        const { todoId, subtask, at } = action.payload;
        const todo = state.entities[todoId];
        if (!todo || !subtask.title || todo.subtasks.length >= MAX_SUBTASKS || findSubtask(todo, subtask.id)) return;
        todo.subtasks.push(subtask);
        todo.updatedAt = at;
      },
      prepare: (todoId: string, title: string) => ({
        payload: { todoId, subtask: createSubtask(title), at: Date.now() },
      }),
    },
    subtaskToggled: {
      reducer(state, action: PayloadAction<SubtaskTarget>) {
        const { todoId, subtaskId, at } = action.payload;
        const todo = state.entities[todoId];
        const subtask = findSubtask(todo, subtaskId);
        if (!todo || !subtask) return;
        subtask.completed = !subtask.completed;
        todo.updatedAt = at;
      },
      prepare: (todoId: string, subtaskId: string) => ({ payload: { todoId, subtaskId, at: Date.now() } }),
    },
    subtaskRenamed: {
      reducer(state, action: PayloadAction<SubtaskTarget & { title: string }>) {
        const { todoId, subtaskId, at } = action.payload;
        const todo = state.entities[todoId];
        const subtask = findSubtask(todo, subtaskId);
        const title = normalizeSubtaskTitle(action.payload.title);
        if (!todo || !subtask || !title || subtask.title === title) return;
        subtask.title = title;
        todo.updatedAt = at;
      },
      prepare: (todoId: string, subtaskId: string, title: string) => ({
        payload: { todoId, subtaskId, title, at: Date.now() },
      }),
    },
    subtaskRemoved: {
      reducer(state, action: PayloadAction<SubtaskTarget>) {
        const { todoId, subtaskId, at } = action.payload;
        const todo = state.entities[todoId];
        if (!todo || !findSubtask(todo, subtaskId)) return;
        todo.subtasks = todo.subtasks.filter((item) => item.id !== subtaskId);
        todo.updatedAt = at;
      },
      prepare: (todoId: string, subtaskId: string) => ({ payload: { todoId, subtaskId, at: Date.now() } }),
    },
    subtaskMoved: {
      reducer(state, action: PayloadAction<SubtaskTarget & { index: number }>) {
        const { todoId, subtaskId, index, at } = action.payload;
        const todo = state.entities[todoId];
        const from = todo?.subtasks.findIndex((item) => item.id === subtaskId) ?? -1;
        if (!todo || from === -1 || index < 0 || index >= todo.subtasks.length || index === from) return;
        const [subtask] = todo.subtasks.splice(from, 1);
        if (subtask) todo.subtasks.splice(index, 0, subtask);
        todo.updatedAt = at;
      },
      prepare: (todoId: string, subtaskId: string, index: number) => ({
        payload: { todoId, subtaskId, index, at: Date.now() },
      }),
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(projectRemoved, (state, action) => {
        todosAdapter.removeMany(
          state,
          state.ids.filter((id) => state.entities[id]?.projectId === action.payload),
        );
      })
      .addCase(dataReplaced, (state, action) => {
        todosAdapter.setAll(state, action.payload.todos);
      })
      .addCase(dataImported, (state, action) => {
        todosAdapter.addMany(
          state,
          action.payload.todos.filter((todo) => !(todo.id in state.entities)),
        );
      });
  },
});

export const {
  todoAdded,
  todoToggled,
  todoRenamed,
  todoTagsChanged,
  todoImportanceToggled,
  todoScheduled,
  todosScheduled,
  todoRepeatChanged,
  todoProjectChanged,
  todoNoted,
  subtaskAdded,
  subtaskToggled,
  subtaskRenamed,
  subtaskRemoved,
  subtaskMoved,
  todoDuplicated,
  todoMoved,
  allTodosMarked,
  todosRemoved,
  todosRestored,
} = todosSlice.actions;
