import { useEffect, useEffectEvent, useLayoutEffect, useRef, type ReactNode } from "react";

import { useLiquidGlass } from "@/shared/hooks/useLiquidGlass";
import { cx } from "@/shared/lib/cx";

import styles from "./Dialog.module.scss";

interface DialogProps {
  open: boolean;
  label: string;
  onClose: () => void;
  placement?: "center" | "top";
  className?: string;
  children: ReactNode;
}

const Dialog = ({ open, label, onClose, placement = "center", className, children }: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const handleClose = useEffectEvent(onClose);

  useLiquidGlass(ref, { bezel: 24, scale: 40 });

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const closeOnBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) handleClose();
    };
    const close = () => handleClose();
    dialog.addEventListener("click", closeOnBackdrop);
    dialog.addEventListener("close", close);
    return () => {
      dialog.removeEventListener("click", closeOnBackdrop);
      dialog.removeEventListener("close", close);
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      closedby="any"
      className={cx(styles.dialog, className)}
      data-placement={placement}
    >
      {open ? children : null}
    </dialog>
  );
};

export default Dialog;
