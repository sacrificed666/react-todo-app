import { LIST_META } from "@/components/todo/lists";
import SortMenu from "@/components/todo/SortMenu/SortMenu";
import Icon from "@/components/ui/Icon/Icon";
import ProgressBar from "@/components/ui/ProgressBar/ProgressBar";
import { useToday } from "@/hooks/useToday";
import { formatHeadline } from "@/lib/date";
import { useAppSelector } from "@/store/hooks";
import { selectList, selectListProgress } from "@/store/selectors";

import styles from "./ListHeader.module.scss";

const ListHeader = () => {
  const today = useToday();
  const list = useAppSelector(selectList);
  const { done, total } = useAppSelector((state) => selectListProgress(state, today));
  const meta = LIST_META[list];
  const showProgress = total > 0 && list !== "completed";

  return (
    <div className={styles.header}>
      <div className={styles.row}>
        <span className={styles.icon} data-tone={list}>
          <Icon name={meta.icon} filled={list === "important"} />
        </span>
        <div className={styles.headings}>
          <h1 className={styles.title}>{meta.label}</h1>
          <p className={styles.subtitle}>
            <time dateTime={today}>{formatHeadline(today)}</time>
            {showProgress ? (
              <span>
                {done} of {total} done
              </span>
            ) : null}
          </p>
        </div>
        <SortMenu />
      </div>
      {showProgress ? <ProgressBar value={done} max={total} label={`${meta.label} progress`} /> : null}
    </div>
  );
};

export default ListHeader;
