import { useRef } from "react";

import Icon from "@/components/ui/Icon/Icon";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { useShortcut } from "@/hooks/useShortcut";
import { useToday } from "@/hooks/useToday";
import { LISTS } from "@/lib/lists";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectList, selectListCounts } from "@/store/selectors";
import { listChanged } from "@/store/slices/viewSlice";

import { LIST_META } from "../lists";

import styles from "./ListNav.module.scss";

const isListShortcut = (event: KeyboardEvent) =>
  /^[1-5]$/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey;

const ListNav = () => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const list = useAppSelector(selectList);
  const counts = useAppSelector((state) => selectListCounts(state, today));
  const navRef = useRef<HTMLElement>(null);

  useLiquidGlass(navRef, { bezel: 18, scale: 36 });

  useShortcut(isListShortcut, (event) => {
    const next = LISTS[Number(event.key) - 1];
    if (!next) return;
    event.preventDefault();
    dispatch(listChanged(next));
  });

  return (
    <nav ref={navRef} className={styles.nav} aria-label="Lists" data-glass-light="">
      <ul className={styles.list}>
        {LISTS.map((id) => (
          <li key={id}>
            <button
              type="button"
              className={styles.item}
              data-tone={id}
              aria-current={id === list ? "page" : undefined}
              aria-label={`${LIST_META[id].label} (${counts[id]})`}
              onClick={() => dispatch(listChanged(id))}
            >
              <span className={styles.icon}>
                <Icon name={LIST_META[id].icon} filled={id === "important"} />
              </span>
              <span className={styles.label}>{LIST_META[id].label}</span>
              <span
                className={styles.count}
                aria-hidden="true"
                data-alert={id === "today" && counts.overdue > 0 ? "" : undefined}
              >
                {counts[id]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ListNav;
