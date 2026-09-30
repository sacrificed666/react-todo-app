import Icon from "@/components/ui/Icon/Icon";
import type { IconName } from "@/components/ui/Icon/icons";
import ProgressBar from "@/components/ui/ProgressBar/ProgressBar";
import { useToday } from "@/hooks/useToday";
import { useAppSelector } from "@/store/hooks";
import { selectListCounts } from "@/store/selectors";

import styles from "./Overview.module.scss";

interface Stat {
  label: string;
  value: number;
  icon: IconName;
  tone: string;
}

const Overview = () => {
  const today = useToday();
  const counts = useAppSelector((state) => selectListCounts(state, today));
  const percent = counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

  const stats: readonly Stat[] = [
    { label: "Overdue", value: counts.overdue, icon: "calendar", tone: "overdue" },
    { label: "Due today", value: counts.today - counts.overdue, icon: "sun", tone: "today" },
    { label: "Important", value: counts.important, icon: "star", tone: "important" },
  ];

  return (
    <section className={styles.card} aria-labelledby="overview-title">
      <div className={styles.head}>
        <h2 id="overview-title" className={styles.title}>
          Overview
        </h2>
        <span className={styles.percent}>{percent}%</span>
      </div>
      <ProgressBar value={counts.completed} max={counts.total} label="Overall progress" />
      <p className={styles.caption}>
        {counts.completed} of {counts.total} tasks completed
      </p>
      <ul className={styles.stats}>
        {stats.map((stat) => (
          <li key={stat.label} className={styles.stat} data-tone={stat.tone}>
            <Icon name={stat.icon} filled={stat.icon === "star"} className={styles.statIcon} />
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Overview;
