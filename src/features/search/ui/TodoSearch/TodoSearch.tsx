import type { KeyboardEvent, RefObject } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { selectQuery } from "@/features/lists/model/selectors";
import { overlayOpened, queryChanged } from "@/features/lists/model/viewSlice";
import { isApplePlatform } from "@/shared/lib/keyboard";
import Icon from "@/shared/ui/Icon/Icon";
import IconButton from "@/shared/ui/IconButton/IconButton";

import styles from "./TodoSearch.module.scss";

interface TodoSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onClose?: () => void;
}

const TodoSearch = ({ inputRef, onClose }: TodoSearchProps) => {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectQuery);
  const { t } = useI18n();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    if (query) {
      dispatch(queryChanged(""));
      return;
    }
    inputRef.current?.blur();
    onClose?.();
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
        placeholder={t("search.placeholder")}
        aria-label={t("search.label")}
        autoComplete="off"
        enterKeyHint="search"
        onChange={(event) => dispatch(queryChanged(event.target.value))}
        onKeyDown={handleKeyDown}
      />
      {query ? (
        <IconButton icon="xmark" label={t("search.clear")} variant="ghost" size="small" onClick={clear} />
      ) : (
        <button
          type="button"
          className={styles.hint}
          aria-label={t("header.palette")}
          aria-keyshortcuts="Meta+K Control+K"
          onClick={() => dispatch(overlayOpened({ kind: "palette" }))}
        >
          {isApplePlatform() ? "⌘K" : "Ctrl K"}
        </button>
      )}
    </search>
  );
};

export default TodoSearch;
