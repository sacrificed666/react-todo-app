import { useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { selectListProgress } from "@/features/todos/model/selectors";
import { useToday } from "@/shared/hooks/useToday";
import { formatHeadline } from "@/shared/lib/date";
import Icon from "@/shared/ui/Icon/Icon";
import ProgressBar from "@/shared/ui/ProgressBar/ProgressBar";

import { LIST_ICONS } from "../../model/listIcons";
import { selectList } from "../../model/selectors";
import SortMenu from "../SortMenu/SortMenu";

import styles from "./ListHeader.module.scss";

const ListHeader = () => {
  const today = useToday();
  const { t, locale } = useI18n();
  const list = useAppSelector(selectList);
  const { done, total } = useAppSelector((state) => selectListProgress(state, today));
  const title = t(`lists.${list}`);
  const showProgress = total > 0 && list !== "completed";

  return (
    <div className={styles.header}>
      <div className={styles.row}>
        <span className={styles.icon} data-tone={list}>
          <Icon name={LIST_ICONS[list]} filled={list === "important"} />
        </span>
        <div className={styles.headings}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>
            <time dateTime={today}>{formatHeadline(today, locale)}</time>
            {showProgress ? <span>{t("listHeader.progress", { done, total })}</span> : null}
          </p>
        </div>
        <SortMenu />
      </div>
      {showProgress ? (
        <ProgressBar value={done} max={total} label={t("listHeader.progressLabel", { list: title })} />
      ) : null}
    </div>
  );
};

export default ListHeader;
