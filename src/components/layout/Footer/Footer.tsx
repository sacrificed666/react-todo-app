import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} Illia Movchko</span>
    </footer>
  );
};

export default Footer;
