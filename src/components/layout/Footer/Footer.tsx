import { useToday } from "@/hooks/useToday";

import styles from "./Footer.module.scss";

const Footer = () => {
  const year = new Date(useToday()).getFullYear();

  return (
    <footer className={styles.footer}>
      <p className={styles.note}>
        © {year}{" "}
        <a className={styles.link} href="https://github.com/sacrificed666" target="_blank" rel="noreferrer">
          Illia Movchko
        </a>
      </p>
    </footer>
  );
};

export default Footer;
