import { useToday } from "@/hooks/useToday";
import { pluralize } from "@/lib/text";
import { useAppSelector } from "@/store/hooks";
import { selectListCounts } from "@/store/selectors";

import styles from "./Footer.module.scss";

const Footer = () => {
  const today = useToday();
  const counts = useAppSelector((state) => selectListCounts(state, today));

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copyright}>
          © {today.slice(0, 4)}{" "}
          <a className={styles.link} href="https://github.com/sacrificed666" target="_blank" rel="noreferrer">
            Illia Movchko
          </a>
        </p>
        <ul className={styles.stats}>
          <li>{pluralize(counts.total, "task")}</li>
          <li>{counts.completed} done</li>
          {counts.overdue > 0 ? <li data-tone="overdue">{counts.overdue} overdue</li> : null}
        </ul>
        <p className={styles.meta}>
          <a
            className={styles.link}
            href="https://github.com/sacrificed666/react-todo-app"
            target="_blank"
            rel="noreferrer"
          >
            Source code
          </a>
          <span className={styles.version}>v{import.meta.env.VITE_APP_VERSION}</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
