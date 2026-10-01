import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ActionsMenu from "@/features/actions/ui/ActionsMenu/ActionsMenu";
import { useI18n } from "@/features/i18n/model/useI18n";
import { selectQuery } from "@/features/lists/model/selectors";
import { paletteToggled } from "@/features/lists/model/viewSlice";
import TodoSearch from "@/features/search/ui/TodoSearch/TodoSearch";
import SettingsMenu from "@/features/settings/ui/SettingsMenu/SettingsMenu";
import { useLiquidGlass } from "@/shared/hooks/useLiquidGlass";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { useShortcut } from "@/shared/hooks/useShortcut";
import { isPlainKey } from "@/shared/lib/keyboard";
import Icon from "@/shared/ui/Icon/Icon";
import IconButton from "@/shared/ui/IconButton/IconButton";

import styles from "./Header.module.scss";

const Header = () => {
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const query = useAppSelector(selectQuery);
  const online = useOnlineStatus();
  const headerRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchVisible = searchOpen || query !== "";

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
      <div className={styles.inner} data-search-open={searchVisible || undefined}>
        <a className={styles.brand} href={import.meta.env.BASE_URL} aria-label={t("header.home")}>
          <img className={styles.logo} src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={30} height={30} />
          <span className={styles.name}>ToDo</span>
        </a>
        <div className={styles.search}>
          <TodoSearch inputRef={inputRef} onClose={closeSearch} />
        </div>
        <div className={styles.actions}>
          {online ? null : (
            <output className={styles.offline} title={t("header.offlineHint")}>
              <Icon name="cloudOff" />
              <span className={styles.offlineLabel}>{t("header.offline")}</span>
            </output>
          )}
          <IconButton
            ref={toggleRef}
            icon="search"
            label={t("header.showSearch")}
            className={styles.searchToggle}
            aria-expanded={searchVisible}
            onClick={searchVisible ? closeSearch : openSearch}
          />
          <IconButton
            icon="command"
            label={t("header.palette")}
            aria-keyshortcuts="Meta+K Control+K"
            onClick={() => dispatch(paletteToggled(true))}
          />
          <SettingsMenu />
          <ActionsMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
