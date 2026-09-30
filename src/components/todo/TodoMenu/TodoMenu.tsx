import { useRef, type ChangeEvent, type ReactNode } from "react";

import Icon from "@/components/ui/Icon/Icon";
import type { IconName } from "@/components/ui/Icon/icons";
import IconButton from "@/components/ui/IconButton/IconButton";
import Popover from "@/components/ui/Popover/Popover";
import { usePopover } from "@/components/ui/Popover/usePopover";
import { useToday } from "@/hooks/useToday";
import { toDateKey } from "@/lib/date";
import { downloadJson } from "@/lib/download";
import { isApplePlatform } from "@/lib/keyboard";
import { useAppDispatch, useAppSelector, useAppStore } from "@/store/hooks";
import { createExport } from "@/store/persistence";
import { selectListCounts, selectTodos } from "@/store/selectors";
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

const SHORTCUTS = [
  { keys: ["N"], label: "New task" },
  { keys: ["/"], label: "Search" },
  { keys: ["1", "–", "5"], label: "Lists" },
  { keys: [isApplePlatform() ? "⌘" : "Ctrl", "Z"], label: "Undo" },
];

const TodoMenu = () => {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const today = useToday();
  const counts = useAppSelector((state) => selectListCounts(state, today));
  const popover = usePopover();
  const fileRef = useRef<HTMLInputElement>(null);
  const allCompleted = counts.total > 0 && counts.all === 0;

  const toggleAll = () => {
    popover.close();
    dispatch(allTodosMarked(!allCompleted));
  };

  const clear = () => {
    popover.close();
    dispatch(clearCompleted());
  };

  const exportTodos = () => {
    popover.close();
    const now = new Date();
    downloadJson(`todos-${toDateKey(now)}.json`, createExport(selectTodos(store.getState()), now));
  };

  const pickFile = () => {
    popover.close();
    fileRef.current?.click();
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (file) dispatch(importTodos(await file.text()));
  };

  return (
    <>
      <IconButton icon="ellipsis" label="More actions" {...popover.triggerProps} />
      <Popover id={popover.id} popoverRef={popover.ref} anchorName={popover.anchorName} label="More actions">
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
          {SHORTCUTS.map(({ keys, label }) => (
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
        aria-label="Import tasks from a JSON file"
        onChange={(event) => void handleImport(event)}
      />
    </>
  );
};

export default TodoMenu;
