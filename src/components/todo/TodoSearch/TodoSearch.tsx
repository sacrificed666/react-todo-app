import { useRef, type KeyboardEvent, type RefObject } from "react";

import Icon from "@/components/ui/Icon/Icon";
import IconButton from "@/components/ui/IconButton/IconButton";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectQuery } from "@/store/selectors";
import { queryChanged } from "@/store/slices/viewSlice";

import styles from "./TodoSearch.module.scss";

interface TodoSearchProps {
  id: string;
  open: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
}

const TodoSearch = ({ id, open, inputRef, onClose }: TodoSearchProps) => {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectQuery);
  const fieldRef = useRef<HTMLElement>(null);

  useLiquidGlass(fieldRef, { bezel: 18, scale: 44 });

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    if (query) dispatch(queryChanged(""));
    else onClose();
  };

  const clear = () => {
    dispatch(queryChanged(""));
    inputRef.current?.focus();
  };

  return (
    <div id={id} className={styles.search} data-open={open || undefined} inert={!open}>
      <div className={styles.clip}>
        <search ref={fieldRef} className={styles.field} data-glass-light="">
          <Icon name="search" className={styles.icon} />
          <input
            ref={inputRef}
            type="search"
            className={styles.input}
            value={query}
            placeholder="Search tasks"
            aria-label="Search tasks"
            autoComplete="off"
            enterKeyHint="search"
            onChange={(event) => dispatch(queryChanged(event.target.value))}
            onKeyDown={handleKeyDown}
          />
          {query ? <IconButton icon="xmark" label="Clear search" variant="ghost" size="small" onClick={clear} /> : null}
        </search>
      </div>
    </div>
  );
};

export default TodoSearch;
