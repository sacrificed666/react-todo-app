import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import ThemeMenu from "@/components/todo/ThemeMenu/ThemeMenu";
import TodoMenu from "@/components/todo/TodoMenu/TodoMenu";
import TodoSearch from "@/components/todo/TodoSearch/TodoSearch";
import IconButton from "@/components/ui/IconButton/IconButton";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { useShortcut } from "@/hooks/useShortcut";
import { isPlainKey } from "@/lib/keyboard";

import styles from "./Header.module.scss";

const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useLiquidGlass(headerRef, { bezel: 14, scale: 30 });

  const openSearch = () => {
    flushSync(() => setSearchOpen(true));
    inputRef.current?.focus();
  };

  const closeSearch = () => {
    setSearchOpen(false);
    toggleRef.current?.focus();
  };

  useShortcut(isPlainKey("/"), (event) => {
    event.preventDefault();
    openSearch();
  });

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.inner} data-search-open={searchOpen || undefined}>
        <a className={styles.brand} href={import.meta.env.BASE_URL}>
          <img className={styles.logo} src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={30} height={30} />
          <span className={styles.name}>ToDo</span>
        </a>
        <div className={styles.search}>
          <TodoSearch inputRef={inputRef} onClose={closeSearch} />
        </div>
        <div className={styles.actions}>
          <IconButton
            ref={toggleRef}
            icon="search"
            label="Show search"
            className={styles.searchToggle}
            aria-expanded={searchOpen}
            onClick={searchOpen ? closeSearch : openSearch}
          />
          <ThemeMenu />
          <TodoMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
