import { useId, useRef, type CSSProperties } from "react";

export const usePopover = () => {
  const id = `popover${useId().replaceAll(/[^\w-]/g, "")}`;
  const ref = useRef<HTMLDialogElement>(null);
  const anchorName = `--${id}`;

  const triggerProps = { popoverTarget: id, style: { anchorName } satisfies CSSProperties };
  const close = () => ref.current?.hidePopover();

  return { id, ref, anchorName, triggerProps, close };
};
