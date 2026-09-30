import type { KeyboardEvent, RefObject } from "react";

import Icon from "@/components/ui/Icon/Icon";
import IconButton from "@/components/ui/IconButton/IconButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectQuery } from "@/store/selectors";
import { queryChanged } from "@/store/slices/viewSlice";

import styles from "./TodoSearch.module.scss";

interface TodoSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
}

const TodoSearch = ({ inputRef, onClose }: TodoSearchProps) => {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectQuery);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    if (query) {
      dispatch(queryChanged(""));
      return;
    }
    inputRef.current?.blur();
    onClose();
  };

  const clear = () => {
    dispatch(queryChanged(""));
    inputRef.current?.focus();
  };

  return (
    <search className={styles.field} data-glass-light="">
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
      {query ? (
        <IconButton icon="xmark" label="Clear search" variant="ghost" size="small" onClick={clear} />
      ) : (
        <kbd className={styles.hint} aria-hidden="true">
          /
        </kbd>
      )}
    </search>
  );
};

export default TodoSearch;
