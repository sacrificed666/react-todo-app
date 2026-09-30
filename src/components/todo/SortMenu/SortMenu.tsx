import Icon from "@/components/ui/Icon/Icon";
import Popover from "@/components/ui/Popover/Popover";
import { usePopover } from "@/components/ui/Popover/usePopover";
import { SORT_MODES, type SortMode } from "@/lib/sort";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSort } from "@/store/selectors";
import { sortChanged } from "@/store/slices/viewSlice";

import styles from "./SortMenu.module.scss";

const SORT_LABELS: Record<SortMode, string> = {
  manual: "Manual",
  dueDate: "Due date",
  priority: "Importance",
  newest: "Newest first",
  alphabetical: "Title A–Z",
};

const SortMenu = () => {
  const dispatch = useAppDispatch();
  const sort = useAppSelector(selectSort);
  const popover = usePopover();

  const choose = (mode: SortMode) => {
    popover.close();
    dispatch(sortChanged(mode));
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label={`Sort tasks: ${SORT_LABELS[sort]}`}
        data-glass-light=""
        {...popover.triggerProps}
      >
        <Icon name="sort" className={styles.icon} />
        <span className={styles.value}>{SORT_LABELS[sort]}</span>
        <Icon name="chevronDown" className={styles.chevron} />
      </button>
      <Popover
        id={popover.id}
        popoverRef={popover.ref}
        anchorName={popover.anchorName}
        label="Sort tasks"
        className={styles.panel}
      >
        <p className={styles.heading}>Sort by</p>
        {SORT_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            className={styles.option}
            aria-pressed={mode === sort}
            onClick={() => choose(mode)}
          >
            <span>{SORT_LABELS[mode]}</span>
            <Icon name="check" className={styles.check} />
          </button>
        ))}
      </Popover>
    </>
  );
};

export default SortMenu;
