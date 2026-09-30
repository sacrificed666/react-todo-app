import { useId, useRef, type ChangeEvent, type ReactNode, type ToggleEvent } from "react";

import Icon from "@/components/ui/Icon/Icon";
import type { IconName } from "@/components/ui/Icon/icons";
import IconButton from "@/components/ui/IconButton/IconButton";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { toDateKey } from "@/lib/date";
import { downloadJson } from "@/lib/download";
import { isApplePlatform } from "@/lib/keyboard";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import { createExport } from "@/store/persistence";
import { selectCounts, selectTodos } from "@/store/selectors";
import { allTodosMarked } from "@/store/slices/todosSlice";
import { clearCompleted, importTodos } from "@/store/thunks";

import styles from "./TodoMenu.module.scss";

interface MenuItemProps {
  icon: IconName;
  disabled?: boolean;
  onSelect: () => void;
  children: ReactNode;
}

const MenuItem = ({ icon, disabled = false, onSelect, children }: MenuItemProps) => (
  <button type="button" className={styles.item} disabled={disabled} onClick={onSelect}>
    <Icon name={icon} className={styles.icon} />
    {children}
  </button>
);

const modifierKey = isApplePlatform() ? "⌘" : "Ctrl";

const TodoMenu = () => {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const counts = useAppSelector(selectCounts);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const allCompleted = counts.total > 0 && counts.active === 0;

  useLiquidGlass(menuRef, { bezel: 22, scale: 40 });

  const close = () => menuRef.current?.hidePopover();

  const toggleAll = () => {
    close();
    dispatch(allTodosMarked(!allCompleted));
  };

  const clear = () => {
    close();
    dispatch(clearCompleted());
  };

  const exportTodos = () => {
    close();
    const now = new Date();
    downloadJson(`todos-${toDateKey(now)}.json`, createExport(selectTodos(store.getState()), now));
  };

  const pickFile = () => {
    close();
    fileRef.current?.click();
  };

  const handleBeforeToggle = (event: ToggleEvent<HTMLDivElement>) => {
    const trigger = triggerRef.current;
    if (event.newState !== "open" || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    event.currentTarget.style.setProperty("--menu-top", `${rect.bottom + 10}px`);
    event.currentTarget.style.setProperty("--menu-right", `${document.documentElement.clientWidth - rect.right}px`);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (file) dispatch(importTodos(await file.text()));
  };

  return (
    <>
      <IconButton
        ref={triggerRef}
        icon="ellipsis"
        label="More actions"
        className={styles.trigger}
        popoverTarget={menuId}
      />
      <div ref={menuRef} id={menuId} popover="auto" className={styles.menu} onBeforeToggle={handleBeforeToggle}>
        <div className={styles.group}>
          <MenuItem icon={allCompleted ? "rotate" : "checkAll"} disabled={counts.total === 0} onSelect={toggleAll}>
            {allCompleted ? "Mark all as active" : "Complete all"}
          </MenuItem>
          <MenuItem icon="eraser" disabled={counts.completed === 0} onSelect={clear}>
            Clear completed
          </MenuItem>
        </div>
        <div className={styles.group}>
          <MenuItem icon="download" disabled={counts.total === 0} onSelect={exportTodos}>
            Export tasks
          </MenuItem>
          <MenuItem icon="upload" onSelect={pickFile}>
            Import tasks
          </MenuItem>
        </div>
        <dl className={styles.shortcuts}>
          <div>
            <dt>
              <kbd>N</kbd>
            </dt>
            <dd>New task</dd>
          </div>
          <div>
            <dt>
              <kbd>/</kbd>
            </dt>
            <dd>Search</dd>
          </div>
          <div>
            <dt>
              <kbd>{modifierKey}</kbd>
              <kbd>Z</kbd>
            </dt>
            <dd>Undo</dd>
          </div>
        </dl>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        aria-label="Import tasks from a JSON file"
        onChange={(event) => void handleImport(event)}
      />
    </>
  );
};

export default TodoMenu;
