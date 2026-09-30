import { useEffect, useRef, useState, type FocusEvent } from "react";
import { flushSync } from "react-dom";

import { toggleId } from "@/components/todo/ids";
import Icon from "@/components/ui/Icon/Icon";
import IconButton from "@/components/ui/IconButton/IconButton";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { useShortcut } from "@/hooks/useShortcut";
import { isUndoKey } from "@/lib/keyboard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectToast } from "@/store/selectors";
import { toastDismissed, type Toast } from "@/store/slices/toastSlice";
import { undoRemoval } from "@/store/thunks";

import styles from "./Toaster.module.scss";

export const TOAST_DURATION = 6000;

interface ToastCardProps {
  toast: Toast;
}

const ToastCard = ({ toast }: ToastCardProps) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;

  useLiquidGlass(ref, { bezel: 20, scale: 36 });

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => dispatch(toastDismissed(toast.id)), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [dispatch, paused, toast.id]);

  const undo = () => {
    const [first] = toast.undo ?? [];
    flushSync(() => dispatch(undoRemoval()));
    if (first) document.getElementById(toggleId(first.todo.id))?.focus();
  };

  useShortcut(isUndoKey, (event) => {
    if (!toast.undo) return;
    event.preventDefault();
    undo();
  });

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  return (
    <div
      ref={ref}
      className={styles.toast}
      data-tone={toast.tone}
      data-glass-light=""
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
    >
      <p className={styles.message}>{toast.message}</p>
      {toast.undo ? (
        <button type="button" className={styles.undo} onClick={undo}>
          <Icon name="undo" />
          Undo
        </button>
      ) : null}
      <IconButton
        icon="xmark"
        label="Dismiss notification"
        variant="ghost"
        size="small"
        onClick={() => dispatch(toastDismissed(toast.id))}
      />
    </div>
  );
};

const Toaster = () => {
  const toast = useAppSelector(selectToast);

  return (
    <>
      <output className="visually-hidden" aria-live="polite" aria-label="Notification">
        {toast?.message}
      </output>
      <div className={styles.region}>{toast ? <ToastCard key={toast.id} toast={toast} /> : null}</div>
    </>
  );
};

export default Toaster;
