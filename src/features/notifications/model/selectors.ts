import type { RootState } from "@/app/store";

export const selectToast = (state: RootState) => state.toast.current;
