import type { RootState } from "@/app/store";

export const selectSettings = (state: RootState) => state.settings;
