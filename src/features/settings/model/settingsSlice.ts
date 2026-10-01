import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Locale } from "@/features/i18n/model/translate";

import { DEFAULT_SETTINGS } from "./settings";
import type { Accent, Appearance } from "./theme";

export const settingsSlice = createSlice({
  name: "settings",
  initialState: { ...DEFAULT_SETTINGS },
  reducers: {
    appearanceChanged(state, action: PayloadAction<Appearance>) {
      state.appearance = action.payload;
    },
    accentChanged(state, action: PayloadAction<Accent>) {
      state.accent = action.payload;
    },
    localeChanged(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
  },
});

export const { appearanceChanged, accentChanged, localeChanged } = settingsSlice.actions;
