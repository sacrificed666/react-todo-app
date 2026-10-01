import { useEffect, useEffectEvent } from "react";

import { isEditableTarget, type KeyMatcher } from "../lib/keyboard";

interface ShortcutOptions {
  allowInEditable?: boolean;
}

export const useShortcut = (
  matches: KeyMatcher,
  handler: (event: KeyboardEvent) => void,
  { allowInEditable = false }: ShortcutOptions = {},
) => {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing || event.repeat) return;
    if (!allowInEditable && isEditableTarget(event.target)) return;
    if (matches(event)) handler(event);
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);
};
