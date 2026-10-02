import type { RootState } from "@/app/store";

import { projectIdOf, type ViewId } from "./lists";
import type { Overlay } from "./viewSlice";

export const selectList = (state: RootState): ViewId => {
  const { list } = state.view;
  const projectId = projectIdOf(list);
  return projectId === null || projectId in state.projects.entities ? list : "all";
};

export const selectCurrentProject = (state: RootState) => {
  const projectId = projectIdOf(state.view.list);
  return projectId === null ? undefined : state.projects.entities[projectId];
};

export const selectQuery = (state: RootState) => state.view.query;
export const selectSearching = (state: RootState) => state.view.query.trim() !== "";
export const selectSort = (state: RootState) => state.view.sort;
export const selectShowCompleted = (state: RootState) => state.view.showCompleted;
export const selectDetailsId = (state: RootState) => state.view.detailsId;
export const selectOverlay = (state: RootState) => state.view.overlay;
export const selectOverlayKind = (state: RootState): Overlay["kind"] | null => state.view.overlay?.kind ?? null;
export const selectPaletteOpen = (state: RootState) => state.view.overlay?.kind === "palette";
