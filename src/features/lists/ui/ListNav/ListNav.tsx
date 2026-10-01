import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { selectListCounts } from "@/features/todos/model/selectors";
import { useToday } from "@/shared/hooks/useToday";
import Icon from "@/shared/ui/Icon/Icon";

import { LIST_ICONS } from "../../model/listIcons";
import { LISTS } from "../../model/lists";
import { selectList } from "../../model/selectors";
import { listChanged } from "../../model/viewSlice";

import styles from "./ListNav.module.scss";

const ListNav = () => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t } = useI18n();
  const list = useAppSelector(selectList);
  const counts = useAppSelector((state) => selectListCounts(state, today));

  return (
    <nav className={styles.nav} aria-label={t("lists.nav")}>
      <ul className={styles.list}>
        {LISTS.map((id) => (
          <li key={id}>
            <button
              type="button"
              className={styles.item}
              data-tone={id}
              aria-current={id === list ? "page" : undefined}
              aria-label={t("lists.counter", { label: t(`lists.${id}`), count: counts[id] })}
              onClick={() => dispatch(listChanged(id))}
            >
              <span className={styles.icon}>
                <Icon name={LIST_ICONS[id]} filled={id === "important"} />
              </span>
              <span className={styles.label}>{t(`lists.${id}`)}</span>
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
