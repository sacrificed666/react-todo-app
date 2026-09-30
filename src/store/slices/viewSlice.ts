import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ListId } from "@/lib/lists";
import type { SortMode } from "@/lib/sort";

export interface ViewState {
  list: ListId;
  query: string;
  sort: SortMode;
  showCompleted: boolean;
}

export const initialViewState: ViewState = {
  list: "all",
  query: "",
  sort: "manual",
  showCompleted: true,
};

export const viewSlice = createSlice({
  name: "view",
  initialState: initialViewState,
  reducers: {
    listChanged(state, action: PayloadAction<ListId>) {
      state.list = action.payload;
    },
    queryChanged(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    sortChanged(state, action: PayloadAction<SortMode>) {
      state.sort = action.payload;
    },
    completedVisibilityToggled(state) {
      state.showCompleted = !state.showCompleted;
    },
  },
});

export const { listChanged, queryChanged, sortChanged, completedVisibilityToggled } = viewSlice.actions;
