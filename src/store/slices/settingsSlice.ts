import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { DEFAULT_THEME, type Accent, type Appearance } from "@/lib/theme";

export const settingsSlice = createSlice({
  name: "settings",
  initialState: { ...DEFAULT_THEME },
  reducers: {
    appearanceChanged(state, action: PayloadAction<Appearance>) {
      state.appearance = action.payload;
    },
    accentChanged(state, action: PayloadAction<Accent>) {
      state.accent = action.payload;
    },
  },
});

export const { appearanceChanged, accentChanged } = settingsSlice.actions;
