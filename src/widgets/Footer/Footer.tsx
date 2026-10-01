import { useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { selectListCounts } from "@/features/todos/model/selectors";
import { useToday } from "@/shared/hooks/useToday";

import styles from "./Footer.module.scss";

const Footer = () => {
  const today = useToday();
  const { t } = useI18n();
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
          <li>{t("footer.tasks", { count: counts.total })}</li>
          <li>{t("footer.done", { count: counts.completed })}</li>
          {counts.overdue > 0 ? <li data-tone="overdue">{t("footer.overdue", { count: counts.overdue })}</li> : null}
        </ul>
        <p className={styles.meta}>
          <a
            className={styles.link}
            href="https://github.com/sacrificed666/react-todo-app"
            target="_blank"
            rel="noreferrer"
          >
            {t("footer.source")}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
