import { useId } from "react";

import { useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { selectActivity, selectListCounts } from "@/features/todos/model/selectors";
import { useToday } from "@/shared/hooks/useToday";
import { formatWeekdayShort } from "@/shared/lib/date";
import Icon from "@/shared/ui/Icon/Icon";
import type { IconName } from "@/shared/ui/Icon/icons";
import ProgressBar from "@/shared/ui/ProgressBar/ProgressBar";

import styles from "./Overview.module.scss";

interface Stat {
  label: string;
  value: number;
  icon: IconName;
  tone: string;
}

const Overview = () => {
  const today = useToday();
  const { t, locale } = useI18n();
  const counts = useAppSelector((state) => selectListCounts(state, today));
  const { days, streak } = useAppSelector((state) => selectActivity(state, today));
  const percent = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;
  const busiest = Math.max(1, ...days.map((day) => day.count));
  const titleId = useId();

  const stats: readonly Stat[] = [
    { label: t("overview.overdue"), value: counts.overdue, icon: "calendar", tone: "overdue" },
    { label: t("overview.dueToday"), value: counts.today - counts.overdue, icon: "sun", tone: "today" },
    { label: t("overview.important"), value: counts.important, icon: "star", tone: "important" },
  ];

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {t("overview.title")}
        </h2>
        <span className={styles.percent}>{percent}%</span>
      </div>
      <ProgressBar value={counts.completed} max={counts.total} label={t("overview.progress")} />
      <p className={styles.caption}>{t("overview.completed", { done: counts.completed, total: counts.total })}</p>
      <ul className={styles.stats}>
        {stats.map((stat) => (
          <li key={stat.tone} className={styles.stat} data-tone={stat.tone}>
            <Icon name={stat.icon} filled={stat.icon === "star"} className={styles.statIcon} />
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </li>
        ))}
      </ul>
      <div className={styles.activityHead}>
        <h3 className={styles.subtitle}>{t("overview.activity")}</h3>
        {streak > 0 ? (
          <span className={styles.streak}>
            <Icon name="flame" filled className={styles.flame} />
            {t("overview.streak", { count: streak })}
          </span>
        ) : null}
      </div>
      <ol className={styles.chart}>
        {days.map(({ day, count }) => {
          const weekday = formatWeekdayShort(day, locale);
          return (
            <li key={day} className={styles.day} data-today={day === today ? "" : undefined}>
              <span className={styles.bar} style={{ "--value": count / busiest }} aria-hidden="true">
                {count > 0 ? <span className={styles.count}>{count}</span> : null}
              </span>
              <span className={styles.weekday} aria-hidden="true">
                {weekday}
              </span>
              <span className="visually-hidden">{t("overview.activityDay", { day: weekday, count })}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default Overview;
