import { useRef, type ChangeEvent, type ReactNode } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { formatMessage } from "@/features/notifications/model/format";
import { toastShown } from "@/features/notifications/model/toastSlice";
import { selectHistory, selectListCounts } from "@/features/todos/model/selectors";
import { clearCompleted, exportTodos, importTodos, redo, undo } from "@/features/todos/model/thunks";
import { allTodosMarked } from "@/features/todos/model/todosSlice";
import { MAX_IMPORT_BYTES } from "@/features/todos/model/transfer";
import { useToday } from "@/shared/hooks/useToday";
import { isApplePlatform } from "@/shared/lib/keyboard";
import Icon from "@/shared/ui/Icon/Icon";
import type { IconName } from "@/shared/ui/Icon/icons";
import IconButton from "@/shared/ui/IconButton/IconButton";
import Popover from "@/shared/ui/Popover/Popover";
import { usePopover } from "@/shared/ui/Popover/usePopover";

import styles from "./ActionsMenu.module.scss";

interface MenuItemProps {
  icon: IconName;
  disabled?: boolean;
  hint?: string;
  onSelect: () => void;
  children: ReactNode;
}

const MenuItem = ({ icon, disabled = false, hint, onSelect, children }: MenuItemProps) => (
  <button type="button" className={styles.item} disabled={disabled} onClick={onSelect}>
    <Icon name={icon} className={styles.icon} />
    <span className={styles.label}>{children}</span>
    {hint ? <span className={styles.hint}>{hint}</span> : null}
  </button>
);

const ActionsMenu = () => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t } = useI18n();
  const counts = useAppSelector((state) => selectListCounts(state, today));
  const history = useAppSelector(selectHistory);
  const popover = usePopover();
  const fileRef = useRef<HTMLInputElement>(null);
  const allCompleted = counts.total > 0 && counts.all === 0;
  const modifier = isApplePlatform() ? "⌘" : "Ctrl+";
  const lastChange = history.past.at(-1);
  const nextChange = history.future.at(-1);

  const shortcuts = [
    { keys: ["N"], label: t("shortcuts.newTask") },
    { keys: ["/"], label: t("shortcuts.search") },
    { keys: [isApplePlatform() ? "⌘" : "Ctrl", "K"], label: t("shortcuts.palette") },
    { keys: ["1", "–", "5"], label: t("shortcuts.lists") },
    { keys: ["↑", "↓"], label: t("shortcuts.navigate") },
    { keys: [isApplePlatform() ? "⌥" : "Alt", "↑", "↓"], label: t("shortcuts.reorder") },
    { keys: ["S", "D", "E", "I"], label: t("shortcuts.taskActions") },
  ];

  const toggleAll = () => {
    popover.close();
    dispatch(allTodosMarked(!allCompleted));
  };

  const clear = () => {
    popover.close();
    dispatch(clearCompleted());
  };

  const undoLast = () => {
    popover.close();
    dispatch(undo());
  };

  const redoLast = () => {
    popover.close();
    dispatch(redo());
  };

  const exportAll = () => {
    popover.close();
    dispatch(exportTodos());
  };

  const pickFile = () => {
    popover.close();
    fileRef.current?.click();
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      dispatch(toastShown({ message: { key: "toast.importTooLarge" }, tone: "error" }));
      return;
    }
    dispatch(importTodos(await file.text()));
  };

  return (
    <>
      <IconButton icon="ellipsis" label={t("actions.open")} {...popover.triggerProps} />
      <Popover
        id={popover.id}
        popoverRef={popover.ref}
        anchorName={popover.anchorName}
        label={t("actions.open")}
        className={styles.panel}
      >
        <div className={styles.group}>
          <MenuItem icon="undo" disabled={!lastChange} hint={`${modifier}Z`} onSelect={undoLast}>
            {lastChange ? `${t("actions.undo")}: ${formatMessage(t, lastChange.description)}` : t("actions.undo")}
          </MenuItem>
          <MenuItem icon="redo" disabled={!nextChange} hint={`${modifier}⇧Z`} onSelect={redoLast}>
            {nextChange ? `${t("actions.redo")}: ${formatMessage(t, nextChange.description)}` : t("actions.redo")}
          </MenuItem>
        </div>
        <div className={styles.group}>
          <MenuItem icon={allCompleted ? "rotate" : "checkAll"} disabled={counts.total === 0} onSelect={toggleAll}>
            {allCompleted ? t("actions.markAllActive") : t("actions.completeAll")}
          </MenuItem>
          <MenuItem icon="eraser" disabled={counts.completed === 0} onSelect={clear}>
            {t("actions.clearCompleted")}
          </MenuItem>
        </div>
        <div className={styles.group}>
          <MenuItem icon="download" disabled={counts.total === 0} onSelect={exportAll}>
            {t("actions.export")}
          </MenuItem>
          <MenuItem icon="upload" onSelect={pickFile}>
            {t("actions.import")}
          </MenuItem>
        </div>
        <dl className={styles.shortcuts}>
          {shortcuts.map(({ keys, label }) => (
            <div key={label}>
              <dt>
                {keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </Popover>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        aria-label={t("actions.importLabel")}
        onChange={(event) => void handleImport(event)}
      />
    </>
  );
};

export default ActionsMenu;
