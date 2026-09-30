import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

import type { RemovedTodo } from "./todosSlice";

export type ToastTone = "neutral" | "error";

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
  undo: RemovedTodo[] | null;
}

interface ToastState {
  current: Toast | null;
}

interface ToastOptions {
  message: string;
  tone?: ToastTone;
  undo?: RemovedTodo[] | null;
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
      prepare: ({ message, tone = "neutral", undo = null }: ToastOptions) => ({
        payload: { id: nanoid(), message, tone, undo },
      }),
    },
    toastDismissed(state, action: PayloadAction<string>) {
      if (state.current?.id === action.payload) state.current = null;
    },
  },
});

export const { toastShown, toastDismissed } = toastSlice.actions;
