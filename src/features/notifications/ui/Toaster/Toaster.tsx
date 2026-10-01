import { useEffect, useRef, useState, type FocusEvent } from "react";
import { flushSync } from "react-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { undoRemoval } from "@/features/todos/model/thunks";
import { toggleId } from "@/features/todos/ui/ids";
import { useLiquidGlass } from "@/shared/hooks/useLiquidGlass";
import { applyUpdate } from "@/shared/lib/serviceWorker";
import Icon from "@/shared/ui/Icon/Icon";
import IconButton from "@/shared/ui/IconButton/IconButton";

import { formatMessage } from "../../model/format";
import { selectToast } from "../../model/selectors";
import { toastDismissed, type Toast } from "../../model/toastSlice";

import styles from "./Toaster.module.scss";

export const TOAST_DURATION = 6000;

interface ToastCardProps {
  toast: Toast;
}

const ToastCard = ({ toast }: ToastCardProps) => {
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const persistent = toast.action?.type === "reload";
  const paused = hovered || focused || persistent;

  useLiquidGlass(ref, { bezel: 20, scale: 36 });

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => dispatch(toastDismissed(toast.id)), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [dispatch, paused, toast.id]);

  const restore = () => {
    if (toast.action?.type !== "restore") return;
    const [first] = toast.action.todos;
    flushSync(() => dispatch(undoRemoval()));
    if (first) document.getElementById(toggleId(first.todo.id))?.focus();
  };

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
      {toast.tone === "success" ? <Icon name="sparkles" className={styles.icon} /> : null}
      {toast.tone === "error" ? <Icon name="alert" className={styles.icon} /> : null}
      <p className={styles.message}>{formatMessage(t, toast.message)}</p>
      {toast.action?.type === "restore" ? (
        <button type="button" className={styles.action} onClick={restore}>
          <Icon name="undo" />
          {t("toast.undo")}
        </button>
      ) : null}
      {toast.action?.type === "reload" ? (
        <button type="button" className={styles.action} onClick={applyUpdate}>
          <Icon name="rotate" />
          {t("toast.reload")}
        </button>
      ) : null}
      <IconButton
        icon="xmark"
        label={t("toast.dismiss")}
        variant="ghost"
        size="small"
        onClick={() => dispatch(toastDismissed(toast.id))}
      />
    </div>
  );
};

const Toaster = () => {
  const toast = useAppSelector(selectToast);
  const { t } = useI18n();

  return (
    <>
      <output className="visually-hidden" aria-live="polite" aria-label={t("toast.region")}>
        {toast ? formatMessage(t, toast.message) : null}
      </output>
      <div className={styles.region}>{toast ? <ToastCard key={toast.id} toast={toast} /> : null}</div>
    </>
  );
};

export default Toaster;
