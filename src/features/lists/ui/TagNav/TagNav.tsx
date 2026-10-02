import { useId } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { selectTagCounts } from "@/features/todos/model/selectors";
import Icon from "@/shared/ui/Icon/Icon";

import { selectQuery } from "../../model/selectors";
import { queryChanged } from "../../model/viewSlice";

import styles from "./TagNav.module.scss";

interface TagNavProps {
  onNavigate?: () => void;
}

const TagNav = ({ onNavigate }: TagNavProps) => {
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const headingId = useId();
  const tags = useAppSelector(selectTagCounts);
  const query = useAppSelector(selectQuery).trim().toLocaleLowerCase();

  if (tags.length === 0) return null;

  return (
    <nav className={styles.nav} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t("tags.title")}
      </h2>
      <ul className={styles.tags}>
        {tags.map(({ tag, count }) => {
          const active = query === tag.toLocaleLowerCase();
          return (
            <li key={tag}>
              <button
                type="button"
                className={styles.tag}
                aria-pressed={active}
                aria-label={t("todo.tag", { tag })}
                onClick={() => {
                  dispatch(queryChanged(active ? "" : tag));
                  onNavigate?.();
                }}
              >
                <Icon name="hash" className={styles.icon} />
                <span className={styles.name}>{tag.slice(1)}</span>
                <span className={styles.count} aria-hidden="true">
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TagNav;
