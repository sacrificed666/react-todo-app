import { useAppDispatch } from "@/app/hooks";
import { useShortcut } from "@/shared/hooks/useShortcut";

import { LISTS } from "./lists";
import { listChanged } from "./viewSlice";

const isListShortcut = (event: KeyboardEvent) =>
  /^[1-5]$/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey;

export const useListShortcuts = () => {
  const dispatch = useAppDispatch();

  useShortcut(isListShortcut, (event) => {
    const next = LISTS[Number(event.key) - 1];
    if (!next) return;
    event.preventDefault();
    dispatch(listChanged(next));
  });
};
