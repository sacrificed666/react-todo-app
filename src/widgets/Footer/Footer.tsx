import { useI18n } from "@/features/i18n/model/useI18n";
import { useToday } from "@/shared/hooks/useToday";
import { SITE } from "@/shared/lib/site";

import styles from "./Footer.module.scss";

// Author, version and source code
const Footer = () => {
  const { t } = useI18n();
  const today = useToday();
  const newTab = <span className={styles.hint}> ({t("external.newTab")})</span>;

  return (
    <footer className={styles.footer}>
      <div className={styles.bar}>
        <p className={styles.owner}>
          © {today.slice(0, 4)} {SITE.author.name}
          <span aria-hidden="true">·</span>
          <a href={SITE.changelog} rel="noreferrer" target="_blank">
            v{SITE.version}
            {newTab}
          </a>
        </p>
        <p className={styles.links}>
          <a href={SITE.repository} rel="noreferrer" target="_blank">
            {t("footer.source")}
            {newTab}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
