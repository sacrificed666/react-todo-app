import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { ListId } from "./lists";
import type { SortMode } from "./sort";

export interface ViewState {
  list: ListId;
  query: string;
  sort: SortMode;
  showCompleted: boolean;
  detailsId: string | null;
  paletteOpen: boolean;
}

export type ViewPreferences = Pick<ViewState, "list" | "sort" | "showCompleted">;

export const initialViewState: ViewState = {
  list: "all",
  query: "",
  sort: "manual",
  showCompleted: true,
  detailsId: null,
  paletteOpen: false,
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
    detailsOpened(state, action: PayloadAction<string>) {
      state.detailsId = action.payload;
    },
    detailsClosed(state) {
      state.detailsId = null;
    },
    paletteToggled(state, action: PayloadAction<boolean>) {
      state.paletteOpen = action.payload;
    },
  },
});

export const {
  listChanged,
  queryChanged,
  sortChanged,
  completedVisibilityToggled,
  detailsOpened,
  detailsClosed,
  paletteToggled,
} = viewSlice.actions;
