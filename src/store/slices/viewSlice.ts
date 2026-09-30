import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const FILTERS = ["all", "active", "completed"] as const;

export type Filter = (typeof FILTERS)[number];

export interface ViewState {
  filter: Filter;
  query: string;
}

export const isFilter = (value: unknown): value is Filter =>
  typeof value === "string" && (FILTERS as readonly string[]).includes(value);

const initialState: ViewState = {
  filter: "all",
  query: "",
};

export const viewSlice = createSlice({
  name: "view",
  initialState,
  reducers: {
    filterChanged(state, action: PayloadAction<Filter>) {
      state.filter = action.payload;
    },
    queryChanged(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
  },
});

export const { filterChanged, queryChanged } = viewSlice.actions;
