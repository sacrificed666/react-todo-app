import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

import type { MessageKey } from "@/features/i18n/model/translate";
import type { ListId } from "@/features/lists/model/lists";
import type { RemovedTodo } from "@/features/todos/model/todosSlice";

export interface ToastMessage {
  key: MessageKey;
  params?: Readonly<Record<string, string | number | ToastMessage>>;
}

export type ToastTone = "neutral" | "success" | "error";

export type ToastAction =
  | { type: "restore"; todos: RemovedTodo[] }
  | { type: "reload" }
  | { type: "undo" }
  | { type: "show"; list: ListId; todoId: string };

export interface Toast {
  id: string;
  message: ToastMessage;
  tone: ToastTone;
  action: ToastAction | null;
}

interface ToastState {
  current: Toast | null;
}

interface ToastOptions {
  message: ToastMessage;
  tone?: ToastTone;
  action?: ToastAction | null;
}

const initialState: ToastState = {
  current: null,
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    toastShown: {
      reducer(state, action: PayloadAction<Toast>) {
        state.current = action.payload;
      },
      prepare: ({ message, tone = "neutral", action = null }: ToastOptions) => ({
        payload: { id: nanoid(), message, tone, action },
      }),
    },
    toastDismissed(state, action: PayloadAction<string>) {
      if (state.current?.id === action.payload) state.current = null;
    },
  },
});

export const { toastShown, toastDismissed } = toastSlice.actions;
