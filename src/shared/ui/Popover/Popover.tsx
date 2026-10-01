import type { ReactNode, RefObject, ToggleEvent } from "react";

import { cx } from "@/shared/lib/cx";

import styles from "./Popover.module.scss";

interface PopoverProps {
  id: string;
  popoverRef: RefObject<HTMLDialogElement | null>;
  anchorName: string;
  label: string;
  align?: "start" | "end";
  className?: string;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
}

const GAP = 10;

const Popover = ({ id, popoverRef, anchorName, label, align = "end", className, onToggle, children }: PopoverProps) => {
  const handleBeforeToggle = (event: ToggleEvent<HTMLDialogElement>) => {
    const open = event.newState === "open";
    onToggle?.(open);
    const trigger = document.querySelector(`[popovertarget="${id}"]`);
    if (!open || !trigger) return;

    const rect = trigger.getBoundingClientRect();
    const panel = event.currentTarget;
    panel.style.setProperty("--popover-top", `${rect.bottom + GAP}px`);
    panel.style.setProperty("--popover-left", `${rect.left}px`);
    panel.style.setProperty("--popover-right", `${document.documentElement.clientWidth - rect.right}px`);
  };

  return (
    <dialog
      ref={popoverRef}
      id={id}
      popover="auto"
      aria-label={label}
      className={cx(styles.popover, className)}
      data-align={align}
      style={{ positionAnchor: anchorName }}
      onBeforeToggle={handleBeforeToggle}
    >
      {children}
    </dialog>
  );
};

export default Popover;
