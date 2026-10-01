import { combineSlices, configureStore, type ThunkAction, type UnknownAction } from "@reduxjs/toolkit";

import { viewSlice } from "@/features/lists/model/viewSlice";
import { toastSlice } from "@/features/notifications/model/toastSlice";
import { settingsSlice } from "@/features/settings/model/settingsSlice";
import { historySlice, withHistory } from "@/features/todos/model/history";
import { todosSlice } from "@/features/todos/model/todosSlice";

export const rootReducer = withHistory(combineSlices(todosSlice, viewSlice, settingsSlice, toastSlice, historySlice));

export type RootState = ReturnType<typeof rootReducer>;

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<Result = void> = ThunkAction<Result, RootState, unknown, UnknownAction>;
