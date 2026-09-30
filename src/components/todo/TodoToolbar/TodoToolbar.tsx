import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

import IconButton from "@/components/ui/IconButton/IconButton";
import SegmentedControl, { type SegmentedOption } from "@/components/ui/SegmentedControl/SegmentedControl";
import { useShortcut } from "@/hooks/useShortcut";
import { isPlainKey } from "@/lib/keyboard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCounts, selectFilter, selectQuery } from "@/store/selectors";
import { filterChanged, queryChanged, type Filter } from "@/store/slices/viewSlice";

import TodoSearch from "../TodoSearch/TodoSearch";

import styles from "./TodoToolbar.module.scss";

const TodoToolbar = () => {
  const dispatch = useAppDispatch();
  const filter = useAppSelector(selectFilter);
  const query = useAppSelector(selectQuery);
  const counts = useAppSelector(selectCounts);
  const searchId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const open = searchOpen || query !== "";

  const openSearch = () => {
    flushSync(() => setSearchOpen(true));
    inputRef.current?.focus();
  };

  const closeSearch = () => {
    dispatch(queryChanged(""));
    setSearchOpen(false);
    buttonRef.current?.focus();
  };

  useShortcut(isPlainKey("/"), (event) => {
    event.preventDefault();
    openSearch();
  });

  const options: readonly SegmentedOption<Filter>[] = [
    { value: "all", label: "All", badge: counts.total },
    { value: "active", label: "Active", badge: counts.active },
    { value: "completed", label: "Done", badge: counts.completed },
  ];

  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>
        <SegmentedControl
          label="Filter tasks"
          name="filter"
          value={filter}
          options={options}
          className={styles.filters}
          onChange={(next) => dispatch(filterChanged(next))}
        />
        <IconButton
          ref={buttonRef}
          icon="search"
          label="Search"
          aria-expanded={open}
          aria-controls={searchId}
          onClick={open ? closeSearch : openSearch}
        />
      </div>
      <TodoSearch id={searchId} open={open} inputRef={inputRef} onClose={closeSearch} />
    </div>
  );
};

export default TodoToolbar;
