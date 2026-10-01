import type { RootState } from "@/app/store";

export const selectList = (state: RootState) => state.view.list;
export const selectQuery = (state: RootState) => state.view.query;
export const selectSort = (state: RootState) => state.view.sort;
export const selectShowCompleted = (state: RootState) => state.view.showCompleted;
export const selectDetailsId = (state: RootState) => state.view.detailsId;
export const selectPaletteOpen = (state: RootState) => state.view.paletteOpen;
