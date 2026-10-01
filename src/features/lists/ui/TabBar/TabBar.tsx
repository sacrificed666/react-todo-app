import { useRef } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { selectListCounts } from "@/features/todos/model/selectors";
import { useLiquidGlass } from "@/shared/hooks/useLiquidGlass";
import { useToday } from "@/shared/hooks/useToday";
import { tap } from "@/shared/lib/haptics";
import Icon from "@/shared/ui/Icon/Icon";

import { LIST_ICONS } from "../../model/listIcons";
import { LISTS, type ListId } from "../../model/lists";
import { selectList } from "../../model/selectors";
import { listChanged } from "../../model/viewSlice";

import styles from "./TabBar.module.scss";

const TabBar = () => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t } = useI18n();
  const list = useAppSelector(selectList);
  const counts = useAppSelector((state) => selectListCounts(state, today));
  const barRef = useRef<HTMLElement>(null);

  useLiquidGlass(barRef, { bezel: 22, scale: 44 });

  const select = (id: ListId) => {
    tap();
    dispatch(listChanged(id));
  };

  return (
    <nav
      ref={barRef}
      className={styles.bar}
      aria-label={t("lists.nav")}
      style={{ "--index": LISTS.indexOf(list), "--count": LISTS.length }}
      data-glass-light=""
    >
      <span className={styles.indicator} aria-hidden="true" />
      {LISTS.map((id) => (
        <button
          key={id}
          type="button"
          className={styles.tab}
          data-tone={id}
          aria-current={id === list ? "page" : undefined}
          aria-label={t("lists.counter", { label: t(`lists.${id}`), count: counts[id] })}
          onClick={() => select(id)}
        >
          <span className={styles.icon}>
            <Icon name={LIST_ICONS[id]} filled={id === "important" && id === list} />
            {id === "today" && counts.today > 0 ? (
              <span className={styles.badge} data-alert={counts.overdue > 0 ? "" : undefined} aria-hidden="true">
                {counts.today}
              </span>
            ) : null}
          </span>
          <span className={styles.label} aria-hidden="true">
            {t(`lists.${id}.short`)}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default TabBar;
