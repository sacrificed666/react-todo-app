import { combineSlices, configureStore, type ThunkAction, type UnknownAction } from "@reduxjs/toolkit";

import { toastSlice } from "./slices/toastSlice";
import { todosSlice } from "./slices/todosSlice";
import { viewSlice } from "./slices/viewSlice";

export const rootReducer = combineSlices(todosSlice, viewSlice, toastSlice);

export type RootState = ReturnType<typeof rootReducer>;

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<Result = void> = ThunkAction<Result, RootState, unknown, UnknownAction>;
