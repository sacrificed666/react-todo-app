import { useEffect, useEffectEvent, useRef } from "react";

import { useAppDispatch } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { detailsClosed } from "@/features/lists/model/viewSlice";
import { useLiquidGlass } from "@/shared/hooks/useLiquidGlass";

import type { Todo } from "../../model/todo";
import { toggleId } from "../ids";
import TaskDetails from "../TaskDetails/TaskDetails";

import styles from "./TaskDetailsPanel.module.scss";

interface DetailsPanelProps {
  todo: Todo;
}

const TaskDetailsPanel = ({ todo }: DetailsPanelProps) => {
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);

  useLiquidGlass(ref, { bezel: 22, scale: 40 });

  const close = () => {
    const row = document.getElementById(toggleId(todo.id));
    if (row) row.focus();
    else if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    dispatch(detailsClosed());
  };

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    if (event.target instanceof Element && event.target.closest("[popover]")) return;
    event.preventDefault();
    close();
  });

  useEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    panel.focus({ preventScroll: true });
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    panel.addEventListener("keydown", listener);
    return () => panel.removeEventListener("keydown", listener);
  }, []);

  return (
    <section ref={ref} className={styles.panel} aria-label={t("details.title")} tabIndex={-1} data-glass-light="">
      <div className={styles.body}>
        <TaskDetails todo={todo} onClose={close} />
      </div>
    </section>
  );
};

export default TaskDetailsPanel;
